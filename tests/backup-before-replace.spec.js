// Phase 3, slice 3.2 (DECISIONS D102): safeguard 1, a backup before every whole-state replacement.
// - Sign-in sync (`before-cloud-sync`), manual "Load from cloud" (`before-cloud-load`), Reset (`before-reset`).
// - No backup when there is nothing to lose (local equals the incoming state or the newest backup).
// - Backup impossible: sign-in sync and Load still replace (D80); Reset does not run.
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const BACKUP_KEY = 'shredRoadmapBackups_v1';
const RESET_DONE = 'Progress has been reset. Streak, calendar and SETUP were kept.'; // slice 3.5 (D106)

const altPlus = (page) => page.locator('#panel-home [data-action="test"][data-t="alt"][data-d="1"]');
const altLevel = (page) => altPlus(page).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');

async function backups(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), BACKUP_KEY);
}
const byReason = (list, reason) => list.filter((b) => b.reason === reason);

/** Makes every write to the backup key fail, as when the device storage is full. */
async function breakBackupWrites(page) {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === key) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      return original.call(this, k, v);
    };
  }, BACKUP_KEY);
}

async function reload(page) {
  await page.reload();
  await expect(page.locator('#splash')).toHaveCount(0);
  await page.waitForFunction(() => window.__SHRED_TEST__.calls.includes('onAuthStateChanged'));
  await settle(page);
}

async function resetEverything(page) {
  await page.locator('#panel-home [data-action="reset"]').click();
  await page.locator('#panel-home [data-action="confirmreset"]').click();
}

test.describe('sign-in sync', () => {
  test('local progress that differs from the cloud is backed up before the cloud replaces it', async ({ page }) => {
    // Today's daily snapshot was already taken earlier (another state), so start-up adds none.
    await page.addInitScript((key) => {
      if (!sessionStorage.getItem('__shredBackupSeeded')) {
        localStorage.setItem(key, JSON.stringify([{ at: '2026-11-10T08:00:00.000Z', reason: 'daily', schemaVersion: 1, state: { earlier: true } }]));
        sessionStorage.setItem('__shredBackupSeeded', '1');
      }
    }, BACKUP_KEY);
    const local = progressState({ schemaVersion: 1, localOnly: 'mine' });
    const cloud = progressState({ schemaVersion: 1, testLevel: { ...progressState().testLevel, alt: 5 } });
    const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: local });
    await settle(page);

    await expect(altLevel(page)).toHaveText('5/5'); // the cloud still wins (D80)
    const list = await backups(page);
    expect(list.map((b) => b.reason)).toEqual(['daily', 'before-cloud-sync']);
    const sync = byReason(list, 'before-cloud-sync');
    expect(sync[0].state.testLevel.alt).toBe(3);
    expect(sync[0].state.localOnly).toBe('mine');
    expect(sync[0].schemaVersion).toBe(1);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('on the first start of the day the daily snapshot already holds local state: no duplicate', async ({ page }) => {
    const local = progressState({ schemaVersion: 1, localOnly: 'mine' });
    const cloud = progressState({ schemaVersion: 1, testLevel: { ...progressState().testLevel, alt: 5 } });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: local });
    await settle(page);
    await expect(altLevel(page)).toHaveText('5/5');
    const list = await backups(page);
    expect(list.map((b) => b.reason)).toEqual(['daily']);
    expect(list[0].state.testLevel.alt).toBe(3); // local progress is safe
    expect(list[0].state.localOnly).toBe('mine');
  });

  test('no backup when local already equals the cloud copy, even with keys in another order', async ({ page }) => {
    const local = progressState({ schemaVersion: 1 });
    const cloud = Object.fromEntries(Object.entries(progressState({ schemaVersion: 1 })).reverse());
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: local });
    await settle(page);
    const list = await backups(page);
    expect(byReason(list, 'before-cloud-sync')).toHaveLength(0);
    expect(list.map((b) => b.reason)).toEqual(['daily']);
  });

  test('repeated start-ups do not fill the backup list (daily backups are kept)', async ({ page }) => {
    const local = progressState({ schemaVersion: 1 });
    const cloud = progressState({ schemaVersion: 1, testLevel: { ...progressState().testLevel, alt: 5 } });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: local });
    await settle(page);
    const first = await backups(page);
    expect(first.map((b) => b.reason)).toEqual(['daily']);
    for (let i = 0; i < 4; i++) await reload(page);
    expect(await backups(page)).toEqual(first);
  });

  test('if the backup cannot be written, the cloud copy still replaces local state', async ({ page }) => {
    await breakBackupWrites(page);
    const cloud = progressState({ schemaVersion: 1, testLevel: { ...progressState().testLevel, alt: 5 } });
    const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: progressState({ schemaVersion: 1 }) });
    await settle(page);
    await expect(altLevel(page)).toHaveText('5/5');
    expect((await localSaved(page)).testLevel.alt).toBe(5);
    expect(monitor.pageErrors).toEqual([]);
  });
});

test.describe('manual "Load from cloud"', () => {
  test('local state is backed up before Load replaces it', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) } });
    await settle(page);
    await altPlus(page).click(); // local (and cloud) alt = 4
    await page.evaluate((path) => { window.__SHRED_TEST__.docs[path].testLevel.alt = 1; }, USER_DOC); // another device

    await page.locator('#panel-home [data-action="cloudload"]').click();
    await expect(page.locator('#toast')).toHaveText('Progress loaded from cloud!');
    await expect(altLevel(page)).toHaveText('1/5');
    const load = byReason(await backups(page), 'before-cloud-load');
    expect(load).toHaveLength(1);
    expect(load[0].state.testLevel.alt).toBe(4);
  });

  test('no backup when the cloud copy equals local state', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) } });
    await settle(page);
    await page.locator('#panel-home [data-action="cloudload"]').click();
    await expect(page.locator('#toast')).toHaveText('Progress loaded from cloud!');
    expect(byReason(await backups(page), 'before-cloud-load')).toHaveLength(0);
  });
});

test.describe('Reset Everything', () => {
  test('progress is backed up before the reset', async ({ page }) => {
    await openApp(page, { localState: progressState({ schemaVersion: 1 }) });
    await altPlus(page).click(); // differs from the daily snapshot taken at start-up
    await resetEverything(page);
    await expect(page.locator('#toast')).toHaveText(RESET_DONE);
    await expect(altLevel(page)).toHaveText('0/5');

    const reset = byReason(await backups(page), 'before-reset');
    expect(reset).toHaveLength(1);
    expect(reset[0].state.testLevel.alt).toBe(4);
    expect(reset[0].state.streakDates).toEqual(progressState().streakDates);
  });

  test('no extra backup when the newest backup already holds the current state; reset still runs', async ({ page }) => {
    const local = progressState({ schemaVersion: 1 });
    await openApp(page, { localState: local });
    await resetEverything(page);
    await expect(page.locator('#toast')).toHaveText(RESET_DONE);
    const list = await backups(page);
    expect(byReason(list, 'before-reset')).toHaveLength(0);
    expect(list[list.length - 1].state.testLevel).toEqual(local.testLevel); // the daily snapshot covers it
  });

  test('if the backup cannot be written, nothing is reset (local and cloud untouched)', async ({ page }) => {
    await breakBackupWrites(page);
    const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) } });
    await settle(page);
    const writesBefore = (await cloudWrites(page)).length;

    await resetEverything(page);
    await expect(page.locator('#toast')).toHaveText('Could not back up your progress. Nothing was reset.');
    await expect(altLevel(page)).toHaveText('3/5');
    await expect(page.locator('#panel-home [data-action="confirmreset"]')).toHaveCount(0);
    const saved = await localSaved(page);
    expect(saved.testLevel.alt).toBe(3);
    expect(saved.streakDates).toEqual(progressState().streakDates);
    expect((await cloudWrites(page)).length).toBe(writesBefore);
    expect(monitor.pageErrors).toEqual([]);
  });
});
