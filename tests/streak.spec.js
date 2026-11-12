// Phase 3, slice 3.6 (DECISIONS D33-1, D108): no extra streak day.
// - On the first load of a new day, the Practiced ticks left from an earlier day are logged under
//   the day they belong to (state.practicedDate), never under today.
// - Today enters the streak only when a DAILY block is ticked today (unchanged).
// - Days already logged are never removed or rewritten, including old extra days (D33).
// Clock: 2026-11-10 12:00 UTC (a Tuesday), Europe/Lisbon (UTC+0 in winter), as in daily.spec.js.
// "Today" is still the UTC date here; the local-day fix is slice 3.7 (D33-2).
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle } = require('./support/app');
const { baseState, progressState, TEST_USER, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const daily = (page) => page.locator('#panel-daily');
const altPlus = (page) => home(page).locator('[data-action="test"][data-t="alt"][data-d="1"]');
const practiceBox = (page, block) => daily(page).locator(`[data-action="blockprac"][data-block="${block}"]`);

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

async function streakOnHome(page) {
  return {
    logged: await home(page).locator('.statrow .stat').nth(1).locator('.bignum').textContent(),
    tag: await home(page).locator('.card', { hasText: 'Consistency Grid' }).locator('h3 .tag').textContent(),
  };
}

/** One day of the November 2026 calendar panel on Home. */
function novCell(page, date) {
  return page.locator('#panel-home .cal-panel[data-ym="2026-10"] .s-day:not(.other-month)')
    .filter({ has: page.locator('.s-date', { hasText: new RegExp(`^${date}$`) }) });
}

/** Local state as left at the end of an earlier day: ticks under that day's practicedDate. */
const leftFrom = (day, practiced, streakDates, extra = {}) =>
  baseState({ phaseIndex: 1, practicedDate: day, practiced, streakDates, ...extra });

// ---------------------------------------------------------------------------------------------
test.describe('first load of a new day', () => {
  test('practised yesterday: today is not logged, not green in the calendar, streak still counts yesterday', async ({ page }) => {
    await openApp(page, { localState: leftFrom('2026-11-09', { 'warmup.Mon': true, 'focused.Mon': true }, ['2026-11-08', '2026-11-09']) });
    const saved = await localSaved(page);
    expect(saved.streakDates).toEqual(['2026-11-08', '2026-11-09']);
    expect(saved.practiced).toEqual({});
    expect(saved.practicedDate).toBe('2026-11-10');
    expect(await streakOnHome(page)).toEqual({ logged: '🔥2', tag: "You've practiced 2 days in a row!" });
    await expect(novCell(page, 9)).toHaveClass(/\bhit\b/);
    await expect(novCell(page, 10)).toHaveClass('s-day today');
  });

  test('ticks from yesterday that were never logged are logged under yesterday, not today', async ({ page }) => {
    // E.g. state that arrived from another device or an older version without yesterday in the list.
    await openApp(page, { localState: leftFrom('2026-11-09', { 'warmup.Mon': true }, ['2026-11-08']) });
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-08', '2026-11-09']);
    expect(await streakOnHome(page)).toEqual({ logged: '🔥2', tag: "You've practiced 2 days in a row!" });
  });

  test('app not opened yesterday: ticks from 2 days ago stay on that day; the streak is broken', async ({ page }) => {
    await openApp(page, { localState: leftFrom('2026-11-08', { 'warmup.Sun': true }, ['2026-11-08']) });
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-08']);
    expect(await streakOnHome(page)).toEqual({ logged: '🔥1', tag: "You've practiced 0 days in a row!" });
  });

  test('unticked boxes from yesterday (all false) log nothing', async ({ page }) => {
    await openApp(page, { localState: leftFrom('2026-11-09', { 'warmup.Mon': false }, ['2026-11-07']) });
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-07']);
  });

  test('days already logged are kept exactly as they are, including an old extra day (D33)', async ({ page }) => {
    // 2026-11-06 stands for an extra day logged by the old bug: it is not removed.
    const dates = ['2026-11-05', '2026-11-06', '2026-11-09'];
    await openApp(page, { localState: leftFrom('2026-11-09', { 'warmup.Mon': true }, dates.slice()) });
    expect((await localSaved(page)).streakDates).toEqual(dates);
  });

  for (const day of [null, 'yesterday', '2026-11-11']) {
    test(`ticks with practicedDate ${JSON.stringify(day)} (missing, invalid or future) never add a day`, async ({ page }) => {
      await openApp(page, { localState: leftFrom(day, { 'warmup.Mon': true }, ['2026-11-01']) });
      const saved = await localSaved(page);
      expect(saved.streakDates).toEqual(['2026-11-01']);
      expect(saved.practiced).toEqual({});
      expect(saved.practicedDate).toBe('2026-11-10');
    });
  }
});

// ---------------------------------------------------------------------------------------------
test.describe('later on the new day', () => {
  test('a Technique change does not log today; ticking a DAILY block does; unticking removes it again', async ({ page }) => {
    await openApp(page, { localState: leftFrom('2026-11-09', { 'warmup.Mon': true }, ['2026-11-09']) });
    await altPlus(page).click();
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-09']);

    await goTo(page, 'daily');
    await practiceBox(page, 'warmup').click();
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-09', '2026-11-10']);
    await practiceBox(page, 'warmup').click();
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-09']);

    await goTo(page, 'home');
    expect(await streakOnHome(page)).toEqual({ logged: '🔥1', tag: "You've practiced 1 day in a row!" });
  });

  test('app left open across midnight: the first change after midnight does not log the new day', async ({ page }) => {
    await openApp(page, { now: '2026-11-09T23:50:00Z', localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09' }) });
    await goTo(page, 'daily');
    await practiceBox(page, 'warmup').click();
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-09']);

    await page.clock.setFixedTime(new Date('2026-11-10T00:10:00Z'));
    await goTo(page, 'home');
    await altPlus(page).click();
    const saved = await localSaved(page);
    expect(saved.streakDates).toEqual(['2026-11-09']);
    expect(saved.practiced).toEqual({});
    expect(saved.practicedDate).toBe('2026-11-10');
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('signed in', () => {
  test('cloud copy with yesterday\'s ticks: no cloud write logs today unless a block is ticked today', async ({ page }) => {
    const cloud = progressState({
      schemaVersion: 1, syncRev: 3, phaseIndex: 1,
      practicedDate: '2026-11-09', practiced: { 'warmup.Mon': true }, streakDates: ['2026-11-08', '2026-11-09'],
    });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: cloud });
    await settle(page);
    expect(await cloudWrites(page)).toEqual([]);

    await altPlus(page).click();
    await settle(page);
    let writes = await cloudWrites(page);
    expect(writes.length).toBe(1);
    expect(writes[0].path).toBe(USER_DOC);
    expect(writes[0].data.streakDates).toEqual(['2026-11-08', '2026-11-09']);
    expect(writes[0].data.practiced).toEqual({});
    expect(writes[0].data.practicedDate).toBe('2026-11-10');

    await goTo(page, 'daily');
    await practiceBox(page, 'warmup').click();
    await settle(page);
    writes = await cloudWrites(page);
    expect(writes[writes.length - 1].data.streakDates).toEqual(['2026-11-08', '2026-11-09', '2026-11-10']);
  });
});
