// Phase 1.2: how saving and cloud sync behave on main TODAY.
// Tests named "current behaviour:" document known risks (DECISIONS D81, D83). When Phase 3 fixes
// them, those tests are updated on purpose, in the same PR as the fix (3.3: new-day write-back).
// Firebase is stubbed; the "cloud" is window.__SHRED_TEST__.docs and every write is recorded.
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, baseState, progressState } = require('./support/fixtures');

// Home → Phase Transition Test stepper for Alternate Picking.
const altPlus = (page) => page.locator('#panel-home [data-action="test"][data-t="alt"][data-d="1"]');
const altLevel = (page) => altPlus(page).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');

test.describe('local saving (signed out)', () => {
  test('a change is saved in localStorage and survives a reload', async ({ page }) => {
    const monitor = await openApp(page);
    await expect(altLevel(page)).toHaveText('0/5');

    await altPlus(page).click();
    await expect(altLevel(page)).toHaveText('1/5');
    expect((await localSaved(page)).testLevel.alt).toBe(1);

    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    await expect(altLevel(page)).toHaveText('1/5');

    expect(await cloudWrites(page), 'no cloud writes while signed out').toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('saved progress is loaded on start', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    await expect(altLevel(page)).toHaveText('3/5');
    const saved = await localSaved(page);
    expect(saved.streakDates).toEqual(['2026-11-07', '2026-11-08', '2026-11-09']);
    expect(saved.setupGuitar).toBe('epi');
  });

  test('unknown fields in localStorage are kept after load and after a change', async ({ page }) => {
    const local = baseState({ futureField: { keep: 'me' }, testLevel: { ...baseState().testLevel, alt: 2 } });
    await openApp(page, { localState: local });

    await altPlus(page).click();
    await expect(altLevel(page)).toHaveText('3/5');

    const saved = await localSaved(page);
    expect(saved.futureField).toEqual({ keep: 'me' });
    expect(saved.testLevel.alt).toBe(3);
  });
});

test.describe('cloud sync on sign-in', () => {
  test('current behaviour: cloud progress replaces local progress, local-only fields are lost', async ({ page }) => {
    const local = progressState({ localOnlyField: 'x' }); // alt = 3 locally
    const cloud = baseState({ testLevel: { ...baseState().testLevel, alt: 1 }, streakDates: ['2026-11-01'] });

    await openApp(page, { user: TEST_USER, localState: local, docs: { [USER_DOC]: cloud } });

    await expect(altLevel(page)).toHaveText('1/5');
    const saved = await localSaved(page);
    expect(saved.testLevel.alt).toBe(1);
    expect(saved.streakDates).toEqual(['2026-11-01']);
    expect(saved.setupGuitar).toBe('prs');
    expect(saved).not.toHaveProperty('localOnlyField');
    // Same day, nothing changed after the load: no write back.
    expect(await cloudWrites(page)).toEqual([]);
  });

  test('with no cloud document yet, local progress is uploaded to users/{uid}', async ({ page }) => {
    await openApp(page, { user: TEST_USER, localState: progressState() });
    await settle(page);

    const writes = await cloudWrites(page);
    expect(writes).toHaveLength(1);
    expect(writes[0].path).toBe(USER_DOC);
    expect(writes[0].data.testLevel.alt).toBe(3);
    expect(writes[0].data.streakDates).toEqual(['2026-11-07', '2026-11-08', '2026-11-09']);
  });

  test('on a new day, loading the cloud state writes nothing back by itself (slice 3.3, D103)', async ({ page }) => {
    const cloud = progressState({ practicedDate: '2026-11-09', practiced: { 'warmup.Mon': true } });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud } });
    await settle(page);

    expect(await cloudWrites(page)).toEqual([]);
    const local = await localSaved(page); // the daily reset is applied on the device
    expect(local.practicedDate).toBe('2026-11-10');
    expect(local.practiced).toEqual({});

    // The next real change carries the daily reset to the cloud.
    await altPlus(page).click();
    await settle(page);
    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
    const last = writes[writes.length - 1].data;
    expect(last.practicedDate).toBe('2026-11-10');
    expect(last.practiced).toEqual({});
    expect(last.testLevel.alt).toBe(4); // progress itself is carried over
  });
});

test.describe('signed in', () => {
  test('every change writes the full state to users/{uid} and nowhere else', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(altLevel(page)).toHaveText('3/5');

    await altPlus(page).click();
    await expect(altLevel(page)).toHaveText('4/5');
    await settle(page);

    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
    const last = writes[writes.length - 1].data;
    expect(last.testLevel.alt).toBe(4);
    expect(last.streakDates).toEqual(['2026-11-07', '2026-11-08', '2026-11-09']);
    expect(last.setupGuitar).toBe('epi');
    expect((await localSaved(page)).testLevel.alt).toBe(4);
  });

  test('topbar shows the account name and a Logout button', async ({ page }, testInfo) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(page.locator('#authBtn')).toHaveText('Logout');
    await expect(page.locator('.user-email')).toHaveText('tester');
    await page.screenshot({ path: testInfo.outputPath('signed-in-home.png') });
  });

  test('manual Save writes the current state; manual Load replaces local with the cloud copy', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });

    await page.locator('#panel-home [data-action="cloudsave"]').click();
    await expect(page.locator('#toast')).toHaveText('Progress manually saved to cloud!');
    let writes = await cloudWrites(page);
    expect(writes[writes.length - 1].path).toBe(USER_DOC);
    expect(writes[writes.length - 1].data.testLevel.alt).toBe(3);

    // Another device changes the cloud copy; Load pulls it in.
    await page.evaluate((path) => {
      window.__SHRED_TEST__.docs[path].testLevel.alt = 5;
    }, USER_DOC);
    await page.locator('#panel-home [data-action="cloudload"]').click();
    await expect(page.locator('#toast')).toHaveText('Progress loaded from cloud!');
    await expect(altLevel(page)).toHaveText('5/5');
    expect((await localSaved(page)).testLevel.alt).toBe(5);
  });
});

test.describe('Reset Everything', () => {
  test('Cancel keeps all progress', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    await page.locator('#panel-home [data-action="reset"]').click();
    await page.locator('#panel-home [data-action="cancelreset"]').click();

    await expect(altLevel(page)).toHaveText('3/5');
    const saved = await localSaved(page);
    expect(saved.testLevel.alt).toBe(3);
    expect(saved.streakDates).toHaveLength(3);
  });

  test('current behaviour: confirm wipes everything, including streak, calendar and SETUP', async ({ page }) => {
    await openApp(page, { localState: progressState({ futureField: 'x' }) });
    await page.locator('#panel-home [data-action="reset"]').click();
    await page.locator('#panel-home [data-action="confirmreset"]').click();
    await expect(page.locator('#toast')).toHaveText('Everything has been reset.');

    await expect(altLevel(page)).toHaveText('0/5');
    const saved = await localSaved(page);
    expect(saved.testLevel.alt).toBe(0);
    expect(saved.chop.alt).toBe(0);
    expect(saved.checks).toEqual({});
    expect(saved.streakDates).toEqual([]); // D83 will keep these
    expect(saved.setupGuitar).toBe('prs'); // D83 will keep SETUP
    expect(saved.improvChecks).toEqual({});
    expect(saved).not.toHaveProperty('futureField');
    expect(await cloudWrites(page)).toEqual([]);
  });

  test('current behaviour: while signed in, confirm overwrites the cloud document with no backup', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await page.locator('#panel-home [data-action="reset"]').click();
    await page.locator('#panel-home [data-action="confirmreset"]').click();
    await settle(page);

    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
    const last = writes[writes.length - 1].data;
    expect(last.testLevel.alt).toBe(0);
    expect(last.streakDates).toEqual([]);
    const cloudNow = await page.evaluate((path) => window.__SHRED_TEST__.docs[path], USER_DOC);
    expect(cloudNow.streakDates).toEqual([]);
  });
});
