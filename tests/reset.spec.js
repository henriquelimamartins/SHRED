// Phase 3, slice 3.5 (DECISIONS D83, D106): Reset Everything erases progress only.
// - Erased: Technique (phase, chops, tests, bonus), every mark in `checks` (Technique, BHGS theory
//   videos, Creative), Improv (gate, marks) and legacy DOJO data.
// - Kept: streak and calendar, today's DAILY session, SETUP, schemaVersion, syncRev, unknown fields
//   and the DOJO sound setting.
// - Signed in: refused until this session has read the cloud; then sent through the checked write
//   queue (D105), pending while offline.
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const BACKUP_KEY = 'shredRoadmapBackups_v1';
const PENDING_KEY = 'shredRoadmapSyncPending_v1';
const RESET_DONE = 'Progress has been reset. Streak, calendar and SETUP were kept.';
const STILL_LOADING = 'Cloud progress is still loading. Try again in a moment.';

const altPlus = (page) => page.locator('#panel-home [data-action="test"][data-t="alt"][data-d="1"]');
const altLevel = (page) => altPlus(page).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');
const toast = (page) => page.locator('#toast');

async function setFlags(page, flags) {
  await page.addInitScript((f) => { window.__SHRED_TEST_FLAGS__ = Object.assign({}, f); }, flags);
}
async function setFlag(page, name, value) {
  await page.evaluate(([n, v]) => { window.__SHRED_TEST_FLAGS__ = window.__SHRED_TEST_FLAGS__ || {}; window.__SHRED_TEST_FLAGS__[n] = v; }, [name, value]);
}
const backups = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), BACKUP_KEY);
const pending = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), PENDING_KEY);
const cloudDoc = (page) => page.evaluate((path) => window.__SHRED_TEST__.docs[path], USER_DOC);
const networkBack = (page) => page.evaluate(() => window.dispatchEvent(new Event('online')));

async function resetEverything(page) {
  await page.locator('#panel-home [data-action="reset"]').click();
  await page.locator('#panel-home [data-action="confirmreset"]').click();
}

/** Progress in every area, plus today's DAILY session (the test clock is 2026-11-10). */
function fullState(overrides = {}) {
  return progressState({
    schemaVersion: 1,
    phaseIndex: 2,
    bonusLevel: { b0: 2 },
    checks: { 'p1.c.0': '2026-11-01', 'p2.e.1': '2026-11-05', 'theory.3': '2026-11-02', 'p0.pre.0': '2026-10-30' },
    improvIndex: 2,
    improvChecks: { g0e0: true, g1e2: true },
    practiced: { 'warmup.Tue': true },
    practicedDate: '2026-11-10',
    congratsDate: '2026-11-10',
    activeDayOverride: 'Sat',
    activeDayDate: '2026-11-10',
    streakDates: ['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'],
    dojo: { xp: 450, level: 3, unlockedCodexes: [1, 2, 3], readCodexes: [1, 2], audioMuted: true, legacyExtra: 1 },
    futureField: { keep: 'me' },
    ...overrides,
  });
}

test.describe('confirmation', () => {
  test('says what is erased and what is kept; Cancel changes nothing', async ({ page }) => {
    await openApp(page, { localState: fullState() });
    await page.locator('#panel-home [data-action="reset"]').click();
    const card = page.locator('#panel-home .card', { has: page.locator('[data-action="confirmreset"]') });
    await expect(card).toContainText('Reset all progress? This erases Technique, Improv, Theory and Creative progress. Your streak, calendar and SETUP are kept. A backup is saved on this device first.');
    await expect(page.locator('#panel-home [data-action="confirmreset"]')).toHaveText('Yes, reset progress');
    await page.locator('#panel-home [data-action="cancelreset"]').click();
    expect(await localSaved(page)).toEqual(fullState());
  });
});

test.describe('what is erased and what is kept (signed out)', () => {
  test('progress fields go back to their defaults', async ({ page }) => {
    const monitor = await openApp(page, { localState: fullState() });
    await resetEverything(page);
    await expect(toast(page)).toHaveText(RESET_DONE);
    const saved = await localSaved(page);
    expect(saved.phaseIndex).toBe(0);
    expect(saved.chop).toEqual({ alt: 0, sweep: 0, legato: 0, econ: 0, tap: 0 });
    expect(saved.testLevel).toEqual({ alt: 0, sweep: 0, legato: 0, econ: 0, tap: 0, ult: 0 });
    expect(saved.bonusLevel).toEqual({});
    expect(saved.checks).toEqual({}); // Technique, BHGS theory videos and Creative marks
    expect(saved.improvIndex).toBe(0);
    expect(saved.improvChecks).toEqual({});
    expect(saved.dojo).toEqual({ xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: true });
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('streak, calendar, today\'s DAILY session, SETUP and unknown fields are kept exactly', async ({ page }) => {
    const before = fullState();
    await openApp(page, { localState: before });
    await resetEverything(page);
    await expect(toast(page)).toHaveText(RESET_DONE);
    const saved = await localSaved(page);
    for (const f of ['streakDates', 'practiced', 'practicedDate', 'congratsDate', 'activeDayOverride', 'activeDayDate', 'setupGuitar', 'setupTuning', 'futureField', 'schemaVersion']) {
      expect(saved[f], f).toEqual(before[f]);
    }
    expect(await cloudWrites(page)).toEqual([]);
  });

  test('the DOJO sound setting is kept when it is off (default)', async ({ page }) => {
    await openApp(page, { localState: fullState({ dojo: { xp: 120, level: 2, unlockedCodexes: [1, 2], readCodexes: [1], audioMuted: false } }) });
    await resetEverything(page);
    await expect(toast(page)).toHaveText(RESET_DONE);
    expect((await localSaved(page)).dojo).toEqual({ xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: false });
  });

  test('the backup holds everything that was erased', async ({ page }) => {
    await openApp(page, { localState: fullState() });
    await altPlus(page).click(); // differs from the daily snapshot taken at start-up
    await resetEverything(page);
    await expect(toast(page)).toHaveText(RESET_DONE);
    const reset = (await backups(page)).filter((b) => b.reason === 'before-reset');
    expect(reset).toHaveLength(1);
    expect(reset[0].state.checks).toEqual(fullState().checks);
    expect(reset[0].state.improvChecks).toEqual(fullState().improvChecks);
    expect(reset[0].state.dojo.xp).toBe(450);
  });

  test('the streak and calendar still show after a reload; no migration backup at the next start', async ({ page }) => {
    await openApp(page, { localState: fullState() });
    await resetEverything(page);
    await expect(toast(page)).toHaveText(RESET_DONE);
    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    await expect(altLevel(page)).toHaveText('0/5');
    const saved = await localSaved(page);
    expect(saved.schemaVersion).toBe(1);
    expect(saved.streakDates).toEqual(fullState().streakDates);
    expect((await backups(page)).filter((b) => b.reason === 'migration')).toHaveLength(0);
  });
});

test.describe('signed in', () => {
  test('refused while the first cloud read is still running; nothing is erased', async ({ page }) => {
    await setFlags(page, { holdGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: fullState() }, localState: fullState() });
    await resetEverything(page);
    await expect(toast(page)).toHaveText(STILL_LOADING);
    await expect(page.locator('#panel-home [data-action="confirmreset"]')).toHaveCount(0);
    await settle(page);
    expect((await localSaved(page)).checks).toEqual(fullState().checks);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await backups(page)).filter((b) => b.reason === 'before-reset')).toHaveLength(0);
  });

  test('after the read, the cloud gets the reset state with streak, SETUP and unknown fields kept', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: fullState({ syncRev: 4 }) } });
    await settle(page);
    await resetEverything(page);
    await expect(toast(page)).toHaveText(RESET_DONE);
    await settle(page);
    const cloud = await cloudDoc(page);
    expect(cloud.syncRev).toBe(5);
    expect(cloud.checks).toEqual({});
    expect(cloud.improvChecks).toEqual({});
    expect(cloud.dojo.xp).toBe(0);
    expect(cloud.dojo.audioMuted).toBe(true);
    expect(cloud.streakDates).toEqual(fullState().streakDates);
    expect(cloud.setupGuitar).toBe('epi');
    expect(cloud.futureField).toEqual({ keep: 'me' });
    expect((await localSaved(page)).syncRev).toBe(5);
  });

  test('offline: the reset stays on the device, is marked pending and reaches the cloud when the network returns', async ({ page }) => {
    await setFlags(page, { failTransaction: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: fullState({ syncRev: 4 }) } });
    await settle(page);
    await resetEverything(page);
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);
    expect((await localSaved(page)).checks).toEqual({});
    expect(await pending(page)).toEqual({ uid: TEST_USER.uid, baseRev: 4 });

    await setFlag(page, 'failTransaction', false);
    await networkBack(page);
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].data.checks).toEqual({});
    expect(writes[0].data.streakDates).toEqual(fullState().streakDates);
    expect(await pending(page)).toBeNull();
  });
});
