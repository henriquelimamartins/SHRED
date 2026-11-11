// Phase 3, slice 3.3 (DECISIONS D103): safeguard 2, no cloud write before the cloud has been read.
// - Until this session's first cloud read has finished, nothing is written to the cloud.
// - Changes made meanwhile stay on the device; when the read arrives the cloud wins (D80), backup first (D102).
// - If the read fails: no cloud writes for the session, a message, manual Save refused, Load still works.
// The Firestore stand-in can hold or fail getDoc (window.__SHRED_TEST_FLAGS__, set before the app starts).
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const BACKUP_KEY = 'shredRoadmapBackups_v1';
const READ_FAILED = 'Could not reach your cloud progress. Changes are saved on this device only.';

const altPlus = (page) => page.locator('#panel-home [data-action="test"][data-t="alt"][data-d="1"]');
const altLevel = (page) => altPlus(page).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');

async function setFlags(page, flags) {
  await page.addInitScript((f) => { window.__SHRED_TEST_FLAGS__ = Object.assign({}, f); }, flags);
}
async function backups(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), BACKUP_KEY);
}
const cloudDoc = (page) => page.evaluate((path) => window.__SHRED_TEST__.docs[path], USER_DOC);

test.describe('while the first cloud read is still running', () => {
  test('changes stay on the device and nothing is written to the cloud', async ({ page }) => {
    await setFlags(page, { holdGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) }, localState: progressState({ schemaVersion: 1 }) });

    await altPlus(page).click();
    await expect(altLevel(page)).toHaveText('4/5');
    await settle(page);
    expect((await localSaved(page)).testLevel.alt).toBe(4);
    expect(await cloudWrites(page)).toEqual([]);

    await page.locator('#panel-home [data-action="cloudsave"]').click();
    await expect(page.locator('#toast')).toHaveText('Cloud progress is still loading. Try again in a moment.');
    expect(await cloudWrites(page)).toEqual([]);
  });

  test('when the read arrives, the cloud wins and the local change is in a backup; later changes are written', async ({ page }) => {
    await setFlags(page, { holdGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) }, localState: progressState({ schemaVersion: 1 }) });
    await altPlus(page).click(); // local alt 4, not sent

    await page.evaluate(() => window.__SHRED_TEST_RELEASE_GETDOC__());
    await expect(page.locator('#toast')).toHaveText('Progress synced from cloud!');
    await expect(altLevel(page)).toHaveText('3/5'); // cloud copy (D80)
    const sync = (await backups(page)).filter((b) => b.reason === 'before-cloud-sync');
    expect(sync).toHaveLength(1);
    expect(sync[0].state.testLevel.alt).toBe(4);
    expect(await cloudWrites(page)).toEqual([]);

    await altPlus(page).click();
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
    expect(writes[writes.length - 1].data.testLevel.alt).toBe(4);
  });

  test('a new account (no cloud document yet) uploads the local state once the read has finished', async ({ page }) => {
    await setFlags(page, { holdGetDoc: true });
    await openApp(page, { user: TEST_USER, localState: progressState({ schemaVersion: 1 }) });
    await altPlus(page).click();
    expect(await cloudWrites(page)).toEqual([]);

    await page.evaluate(() => window.__SHRED_TEST_RELEASE_GETDOC__());
    await expect(page.locator('#toast')).toHaveText('Local progress saved to cloud!');
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].path).toBe(USER_DOC);
    expect(writes[0].data.testLevel.alt).toBe(4);
  });
});

test.describe('when the cloud read fails', () => {
  test('the app says so, keeps working on the device and never writes to the cloud', async ({ page }) => {
    await setFlags(page, { failGetDoc: true });
    const cloud = progressState({ schemaVersion: 1, testLevel: { ...progressState().testLevel, alt: 5 } });
    const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: progressState({ schemaVersion: 1 }) });
    await expect(page.locator('#toast')).toHaveText(READ_FAILED);
    await expect(altLevel(page)).toHaveText('3/5'); // local state, not replaced

    await altPlus(page).click();
    await expect(altLevel(page)).toHaveText('4/5');
    await settle(page);
    expect((await localSaved(page)).testLevel.alt).toBe(4);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await cloudDoc(page)).testLevel.alt).toBe(5); // cloud untouched
    expect(monitor.pageErrors).toEqual([]);
  });

  test('manual "Save to cloud" is refused with the same message', async ({ page }) => {
    await setFlags(page, { failGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) } });
    await page.locator('#panel-home [data-action="cloudsave"]').click();
    await expect(page.locator('#toast')).toHaveText(READ_FAILED);
    expect(await cloudWrites(page)).toEqual([]);
  });

  test('Reset Everything is refused with the same message; nothing is erased (slice 3.5, D106)', async ({ page }) => {
    // Changed on purpose in slice 3.5: before D106 the reset ran on the device only and was undone at the next sign-in.
    await setFlags(page, { failGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) }, localState: progressState({ schemaVersion: 1 }) });
    await page.locator('#panel-home [data-action="reset"]').click();
    await page.locator('#panel-home [data-action="confirmreset"]').click();
    await expect(page.locator('#toast')).toHaveText(READ_FAILED);
    await expect(altLevel(page)).toHaveText('3/5');
    await settle(page);
    expect((await localSaved(page)).testLevel.alt).toBe(3);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await cloudDoc(page)).testLevel.alt).toBe(3);
  });

  test('a successful manual "Load from cloud" brings the cloud copy in and allows cloud writes again', async ({ page }) => {
    await setFlags(page, { failGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) }, localState: progressState({ schemaVersion: 1 }) });
    await expect(page.locator('#toast')).toHaveText(READ_FAILED);

    await page.evaluate(() => { window.__SHRED_TEST_FLAGS__.failGetDoc = false; }); // connection is back
    await page.locator('#panel-home [data-action="cloudload"]').click();
    await expect(page.locator('#toast')).toHaveText('Progress loaded from cloud!');

    await altPlus(page).click();
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes[writes.length - 1].data.testLevel.alt).toBe(4);
  });

  test('the next start-up reads the cloud again', async ({ page }) => {
    await setFlags(page, { failGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) } });
    await expect(page.locator('#toast')).toHaveText(READ_FAILED);
    // The test flags are set again on every load; turn the failure off for the next start-up.
    await page.addInitScript(() => { window.__SHRED_TEST_FLAGS__ = {}; });
    await page.reload();
    await expect(page.locator('#toast')).toHaveText('Progress synced from cloud!');
  });
});
