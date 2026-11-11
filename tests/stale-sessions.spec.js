// Phase 3, slice 3.4 (DECISIONS D105): safeguard 3, stale sessions never overwrite newer cloud data.
// - Every cloud write is a transaction: written only when the cloud `syncRev` still equals the one
//   this session last read or wrote, and then with syncRev + 1.
// - Otherwise the cloud wins (D80): local state backed up first (`before-stale-replace`) and a message.
// - Writes go one at a time; saves made meanwhile are merged into one follow-up write.
// - When the app becomes visible again or the network returns, a newer cloud copy is loaded.
// - Unsent changes are marked pending (`shredRoadmapSyncPending_v1`) and sent later only if the cloud
//   has not moved on; a mark for another account is never used.
// - Data from a newer app version (schemaVersion) is never written over.
// Another device is simulated by changing window.__SHRED_TEST__.docs directly.
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const BACKUP_KEY = 'shredRoadmapBackups_v1';
const PENDING_KEY = 'shredRoadmapSyncPending_v1';
const STALE_MSG = "Newer progress from another device was loaded. Your last change here was kept only in this device's backups.";
const UPDATED_MSG = 'Updated with newer progress from another device.';
const NEWER_MSG = 'Your progress was saved by a newer version of the app. Reload the page to update.';

const altPlus = (page) => page.locator('#panel-home [data-action="test"][data-t="alt"][data-d="1"]');
const altLevel = (page) => altPlus(page).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');
const toast = (page) => page.locator('#toast');

/** Saved state with alt test level `alt` (default progressState has 3) and the given syncRev. */
function saved(alt, syncRev, extra = {}) {
  const base = progressState({ schemaVersion: 1, ...extra });
  const out = { ...base, testLevel: { ...base.testLevel, alt } };
  if (syncRev !== undefined) out.syncRev = syncRev;
  return out;
}

async function setFlags(page, flags) {
  await page.addInitScript((f) => { window.__SHRED_TEST_FLAGS__ = Object.assign({}, f); }, flags);
}
async function setFlag(page, name, value) {
  await page.evaluate(([n, v]) => { window.__SHRED_TEST_FLAGS__ = window.__SHRED_TEST_FLAGS__ || {}; window.__SHRED_TEST_FLAGS__[n] = v; }, [name, value]);
}
/** Places a pending mark in localStorage before the app starts (first load only). */
async function seedPending(page, mark) {
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('__shredPendingSeeded')) {
      localStorage.setItem(key, JSON.stringify(value));
      sessionStorage.setItem('__shredPendingSeeded', '1');
    }
  }, [PENDING_KEY, mark]);
}
const backups = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), BACKUP_KEY);
const pending = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), PENDING_KEY);
const cloudDoc = (page) => page.evaluate((path) => window.__SHRED_TEST__.docs[path], USER_DOC);
/** Another device saves: the cloud copy changes and its syncRev goes up. */
async function otherDeviceWrites(page, alt, syncRev, extra = {}) {
  await page.evaluate(([path, a, rev, ex]) => {
    const d = window.__SHRED_TEST__.docs[path];
    d.testLevel.alt = a;
    d.syncRev = rev;
    Object.assign(d, ex);
  }, [USER_DOC, alt, syncRev, extra]);
}
const becomeVisible = (page) => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
const networkBack = (page) => page.evaluate(() => window.dispatchEvent(new Event('online')));

test.describe('syncRev: every cloud write is checked and numbered', () => {
  test('each signed-in change is a transaction that raises syncRev by one; the device keeps the same number', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 7) } });
    await altPlus(page).click();
    await settle(page);
    await altPlus(page).click();
    await settle(page);

    const writes = await cloudWrites(page);
    expect(writes.map((w) => w.data.syncRev)).toEqual([8, 9]);
    expect(writes.every((w) => w.path === USER_DOC && w.via === 'transaction')).toBe(true);
    expect(writes[1].data.testLevel.alt).toBe(5);
    expect((await localSaved(page)).syncRev).toBe(9);
    expect(await pending(page)).toBeNull();
  });

  test('cloud data without syncRev counts as 0; the first write sets 1', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3) } });
    await altPlus(page).click();
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].data.syncRev).toBe(1);
  });

  test('a new account uploads its local state with syncRev 1', async ({ page }) => {
    await openApp(page, { user: TEST_USER, localState: saved(3) });
    await expect(toast(page)).toHaveText('Local progress saved to cloud!');
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].via).toBe('transaction');
    expect(writes[0].data.syncRev).toBe(1);
    expect(writes[0].data.testLevel.alt).toBe(3);
  });

  test('signed out, nothing gets a syncRev and no pending mark is made', async ({ page }) => {
    await openApp(page, { localState: saved(3) });
    await altPlus(page).click();
    const local = await localSaved(page);
    expect(local).not.toHaveProperty('syncRev');
    expect(await pending(page)).toBeNull();
    expect(await cloudWrites(page)).toEqual([]);
  });
});

test.describe('a stale session (another device saved after this one read the cloud)', () => {
  test('its next change is not written; the cloud copy is loaded, the local change is backed up and a message is shown', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 1, 5); // e.g. the PC lowered it while the phone stayed open

    await altPlus(page).click(); // stale phone: 3 -> 4
    await expect(toast(page)).toHaveText(STALE_MSG);
    await expect(altLevel(page)).toHaveText('1/5');
    expect(await cloudWrites(page)).toEqual([]);
    expect((await cloudDoc(page)).testLevel.alt).toBe(1);
    expect((await cloudDoc(page)).syncRev).toBe(5);

    const stale = (await backups(page)).filter((b) => b.reason === 'before-stale-replace');
    expect(stale).toHaveLength(1);
    expect(stale[0].state.testLevel.alt).toBe(4);
    const local = await localSaved(page);
    expect(local.testLevel.alt).toBe(1);
    expect(local.syncRev).toBe(5);
    expect(await pending(page)).toBeNull();

    // The session is up to date again: the next change is written on top of the newer copy.
    await altPlus(page).click();
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].data.syncRev).toBe(6);
    expect(writes[0].data.testLevel.alt).toBe(2);
  });

  test('manual "Save to cloud" does not overwrite the newer copy', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 5, 5);
    await page.locator('#panel-home [data-action="cloudsave"]').click();
    await expect(toast(page)).toHaveText(STALE_MSG);
    expect(await cloudWrites(page)).toEqual([]);
    await expect(altLevel(page)).toHaveText('5/5');
  });

  test('Reset Everything does not overwrite the newer copy', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 5, 5);
    await page.locator('#panel-home [data-action="reset"]').click();
    await page.locator('#panel-home [data-action="confirmreset"]').click();
    await expect(toast(page)).toHaveText(STALE_MSG);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await cloudDoc(page)).testLevel.alt).toBe(5);
    await expect(altLevel(page)).toHaveText('5/5');
    expect((await backups(page)).some((b) => b.reason === 'before-reset')).toBe(true);
  });

  test('an identical copy saved elsewhere is taken over silently (nothing lost, no message)', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 4, 5); // the other device already has alt 4
    await altPlus(page).click(); // this one also goes to 4
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await localSaved(page)).syncRev).toBe(5);
    expect((await backups(page)).filter((b) => b.reason === 'before-stale-replace')).toHaveLength(0);
    await expect(toast(page)).not.toHaveText(STALE_MSG);
  });
});

test.describe('write queue', () => {
  test('writes go one at a time; changes made during a write are merged into one follow-up write', async ({ page }) => {
    await setFlags(page, { holdTransaction: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(0, 2) } });

    await altPlus(page).click(); // 1: first write starts and waits
    await page.waitForFunction(() => typeof window.__SHRED_TEST_RELEASE_TRANSACTION__ === 'function');
    await altPlus(page).click(); // 2
    await altPlus(page).click(); // 3
    await expect(altLevel(page)).toHaveText('3/5');
    let calls = await page.evaluate(() => window.__SHRED_TEST__.calls.filter((c) => c === 'runTransaction').length);
    expect(calls).toBe(1);

    await page.evaluate(() => { const r = window.__SHRED_TEST_RELEASE_TRANSACTION__; window.__SHRED_TEST_RELEASE_TRANSACTION__ = null; r(); });
    await page.waitForFunction(() => typeof window.__SHRED_TEST_RELEASE_TRANSACTION__ === 'function');
    await page.evaluate(() => window.__SHRED_TEST_RELEASE_TRANSACTION__());
    await settle(page);

    calls = await page.evaluate(() => window.__SHRED_TEST__.calls.filter((c) => c === 'runTransaction').length);
    expect(calls).toBe(2);
    const writes = await cloudWrites(page);
    expect(writes.map((w) => w.data.syncRev)).toEqual([3, 4]);
    expect(writes[0].data.testLevel.alt).toBe(1); // state when the first write started
    expect(writes[1].data.testLevel.alt).toBe(3); // latest state
    expect((await localSaved(page)).syncRev).toBe(4);
    expect(await pending(page)).toBeNull();
  });
});

test.describe('coming back to the app', () => {
  test('when the app becomes visible again, a newer cloud copy is loaded (backup first, message)', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 5, 5);
    await becomeVisible(page);
    await expect(toast(page)).toHaveText(UPDATED_MSG);
    await expect(altLevel(page)).toHaveText('5/5');
    expect(await cloudWrites(page)).toEqual([]);
    const update = (await backups(page)).filter((b) => b.reason === 'before-cloud-update');
    expect(update).toHaveLength(1);
    expect(update[0].state.testLevel.alt).toBe(3);
    expect((await localSaved(page)).syncRev).toBe(5);

    // alt is at its maximum (5); the next change uses another stepper.
    await page.locator('#panel-home [data-action="test"][data-t="sweep"][data-d="1"]').click();
    await settle(page);
    expect((await cloudWrites(page)).map((w) => w.data.syncRev)).toEqual([6]);
  });

  test('when the network returns, a newer cloud copy is loaded the same way', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 0, 6);
    await networkBack(page);
    await expect(toast(page)).toHaveText(UPDATED_MSG);
    await expect(altLevel(page)).toHaveText('0/5');
  });

  test('when nothing changed in the cloud, coming back changes nothing and writes nothing', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await becomeVisible(page);
    await networkBack(page);
    await settle(page);
    await expect(altLevel(page)).toHaveText('3/5');
    expect(await cloudWrites(page)).toEqual([]);
    expect((await backups(page)).filter((b) => b.reason === 'before-cloud-update')).toHaveLength(0);
  });

  test('signed out, coming back reads nothing', async ({ page }) => {
    await openApp(page, { localState: saved(3) });
    await becomeVisible(page);
    await networkBack(page);
    await settle(page);
    const reads = await page.evaluate(() => window.__SHRED_TEST__.calls.filter((c) => c.startsWith('getDoc')).length);
    expect(reads).toBe(0);
  });
});

test.describe('changes that could not reach the cloud (offline)', () => {
  test('stay on the device, are marked pending and are sent when the network returns', async ({ page }) => {
    await setFlags(page, { failTransaction: true });
    const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await altPlus(page).click();
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await localSaved(page)).testLevel.alt).toBe(4);
    expect(await pending(page)).toEqual({ uid: TEST_USER.uid, baseRev: 4 });
    expect(monitor.pageErrors).toEqual([]);

    await setFlag(page, 'failTransaction', false);
    await networkBack(page);
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].data.syncRev).toBe(5);
    expect(writes[0].data.testLevel.alt).toBe(4);
    expect(await pending(page)).toBeNull();
  });

  test('manual "Save to cloud" while offline says it could not save and keeps the change pending', async ({ page }) => {
    await setFlags(page, { failTransaction: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await page.locator('#panel-home [data-action="cloudsave"]').click();
    await expect(toast(page)).toHaveText('Error saving to cloud.');
    expect(await pending(page)).toEqual({ uid: TEST_USER.uid, baseRev: 4 });
  });

  test('if another device saved meanwhile, the cloud wins when the network returns (backup, message, no write)', async ({ page }) => {
    await setFlags(page, { failTransaction: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await altPlus(page).click(); // offline: 4, pending
    await settle(page);
    await otherDeviceWrites(page, 1, 5);

    await setFlag(page, 'failTransaction', false);
    await networkBack(page);
    await expect(toast(page)).toHaveText(STALE_MSG);
    await expect(altLevel(page)).toHaveText('1/5');
    expect(await cloudWrites(page)).toEqual([]);
    const stale = (await backups(page)).filter((b) => b.reason === 'before-stale-replace');
    expect(stale).toHaveLength(1);
    expect(stale[0].state.testLevel.alt).toBe(4);
    expect(await pending(page)).toBeNull();
  });

  test('at the next start-up they are kept and sent if the cloud has not moved on', async ({ page }) => {
    await seedPending(page, { uid: TEST_USER.uid, baseRev: 4 });
    await openApp(page, { user: TEST_USER, localState: saved(4, 4), docs: { [USER_DOC]: saved(3, 4) } });
    await expect(toast(page)).toHaveText('Local progress saved to cloud!');
    await expect(altLevel(page)).toHaveText('4/5');
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].data.syncRev).toBe(5);
    expect(writes[0].data.testLevel.alt).toBe(4);
    expect(await pending(page)).toBeNull();
  });

  test('at the next start-up the cloud wins if it has moved on (backup, message, no write)', async ({ page }) => {
    await seedPending(page, { uid: TEST_USER.uid, baseRev: 4 });
    await openApp(page, { user: TEST_USER, localState: saved(4, 4), docs: { [USER_DOC]: saved(1, 5) } });
    await expect(toast(page)).toHaveText(STALE_MSG);
    await expect(altLevel(page)).toHaveText('1/5');
    expect(await cloudWrites(page)).toEqual([]);
    // The local change is in the newest backup: here the start-up's daily snapshot already holds it,
    // so no second copy is made (D102: no backup when nothing would be lost).
    const list = await backups(page);
    expect(list[list.length - 1].state.testLevel.alt).toBe(4);
    expect(await pending(page)).toBeNull();
  });

  test('a pending mark for another account is never used', async ({ page }) => {
    await seedPending(page, { uid: 'another-uid', baseRev: 4 });
    await openApp(page, { user: TEST_USER, localState: saved(4, 4), docs: { [USER_DOC]: saved(3, 4) } });
    await expect(toast(page)).toHaveText('Progress synced from cloud!');
    await expect(altLevel(page)).toHaveText('3/5'); // normal sign-in sync: the cloud wins
    expect(await cloudWrites(page)).toEqual([]);
    expect(await pending(page)).toBeNull();
  });
});

test.describe('data saved by a newer app version', () => {
  test('a newer cloud copy at sign-in: nothing is replaced or written, and the app says so', async ({ page }) => {
    await openApp(page, { user: TEST_USER, localState: saved(3), docs: { [USER_DOC]: saved(5, 9, { schemaVersion: 2 }) } });
    await expect(toast(page)).toHaveText(NEWER_MSG);
    await expect(altLevel(page)).toHaveText('3/5');
    const before = await localSaved(page);

    await altPlus(page).click();
    await page.locator('#panel-home [data-action="cloudsave"]').click();
    await expect(toast(page)).toHaveText(NEWER_MSG);
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);
    expect(await localSaved(page)).toEqual(before);
    expect((await cloudDoc(page)).schemaVersion).toBe(2);
  });

  test('a newer copy found while writing stops all saving', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: saved(3, 4) } });
    await otherDeviceWrites(page, 2, 5, { schemaVersion: 2 });
    await altPlus(page).click();
    await expect(toast(page)).toHaveText(NEWER_MSG);
    const local = await localSaved(page);
    await altPlus(page).click();
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);
    expect(await localSaved(page)).toEqual(local);
  });

  test('newer data on the device: the cloud is not read or written, nothing is saved, Reset is refused', async ({ page }) => {
    const newer = saved(3, 4, { schemaVersion: 2 });
    await openApp(page, { user: TEST_USER, localState: newer, docs: { [USER_DOC]: saved(1, 4) } });
    await expect(toast(page)).toHaveText(NEWER_MSG);
    await expect(altLevel(page)).toHaveText('3/5');
    await page.locator('#panel-home [data-action="reset"]').click();
    await page.locator('#panel-home [data-action="confirmreset"]').click();
    await expect(toast(page)).toHaveText(NEWER_MSG);
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);
    expect(await localSaved(page)).toEqual(newer);
    const reads = await page.evaluate(() => window.__SHRED_TEST__.calls.filter((c) => c.startsWith('getDoc')).length);
    expect(reads).toBe(0);
  });
});
