// Phase 3, slice 3.7 (DECISIONS D33-2, D109): "today" is the device's local calendar day.
// - Streak, calendar, daily reset, item dates (Mastered/Watched), the full-session message and the
//   DAILY Switch all use the local day, like the weekday already did (before: the UTC date).
// - The streak counts back one local day at a time, also across summer-time changes.
// - Dates already stored are never rewritten (D33).
// Lisbon is UTC+1 in summer and UTC+0 in winter; other time zones check days far from UTC.
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle } = require('./support/app');
const { baseState, progressState, TEST_USER, USER_DOC } = require('./support/fixtures');

const home = (page) => page.locator('#panel-home');
const daily = (page) => page.locator('#panel-daily');
const library = (page) => page.locator('#panel-library');
const toast = (page) => page.locator('#toast');
const practiceBox = (page, block) => daily(page).locator(`[data-action="blockprac"][data-block="${block}"]`);
const dayChip = (page, day) => daily(page).locator(`.daypick [data-action="setday"][data-day="${day}"]`);
const altPlus = (page) => home(page).locator('[data-action="test"][data-t="alt"][data-d="1"]');

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

/** One day of a month panel in the calendar (month m is 0-based, as in the app). */
function cell(page, y, m, date) {
  return page.locator(`#panel-home .cal-panel[data-ym="${y}-${m}"] .s-day:not(.other-month)`)
    .filter({ has: page.locator('.s-date', { hasText: new RegExp(`^${date}$`) }) });
}

// 23:30 UTC on Tuesday 14 July 2026 = 00:30 on Wednesday 15 July in Lisbon (summer time).
const LISBON_SUMMER_AFTER_MIDNIGHT = '2026-07-14T23:30:00Z';

// ---------------------------------------------------------------------------------------------
test.describe('Lisbon summer time, between 00:00 and 01:00', () => {
  test.use({ timezoneId: 'Europe/Lisbon' });

  test('the daily reset happens at local midnight, even with the app left open', async ({ page }) => {
    // 22:50 UTC = 23:50 Tuesday in Lisbon: practise, then the clock passes local midnight.
    await openApp(page, { now: '2026-07-14T22:50:00Z', localState: baseState({ phaseIndex: 1, practicedDate: '2026-07-14' }) });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Tuesday · Beginner');
    await practiceBox(page, 'warmup').click();
    expect((await localSaved(page)).streakDates).toEqual(['2026-07-14']);

    await page.clock.setFixedTime(new Date('2026-07-14T23:10:00Z')); // 00:10 Wednesday in Lisbon
    await goTo(page, 'home');
    await altPlus(page).click();
    const saved = await localSaved(page);
    expect(saved.practiced).toEqual({});
    expect(saved.practicedDate).toBe('2026-07-15');
    expect(saved.streakDates).toEqual(['2026-07-14']);
  });

  test('a Mastered mark is dated with the local day', async ({ page }) => {
    await openApp(page, { now: LISBON_SUMMER_AFTER_MIDNIGHT, localState: baseState({ phaseIndex: 1, practicedDate: '2026-07-15' }) });
    await goTo(page, 'library');
    await library(page).locator('[data-acc="shredroadmap"]').click();
    await library(page).locator('[data-acc="p1"]').click();
    await library(page).locator('[data-action="togm"][data-key="p1.e.0"]').click();
    expect((await localSaved(page)).checks['p1.e.0']).toBe('2026-07-15');
  });

  test('the full-session message is stored with the local day', async ({ page }) => {
    await openApp(page, { now: LISBON_SUMMER_AFTER_MIDNIGHT, localState: baseState({ phaseIndex: 1, practicedDate: '2026-07-15' }) });
    await goTo(page, 'daily');
    for (const block of ['warmup', 'focused', 'casual', 'cooldown']) await practiceBox(page, block).click();
    await expect(toast(page)).toHaveText("🤘 Nice work - today's full session is complete!");
    const saved = await localSaved(page);
    expect(saved.congratsDate).toBe('2026-07-15');
    expect(saved.practiced).toEqual({ 'warmup.Wed': true, 'focused.Wed': true, 'casual.Wed': true, 'cooldown.Wed': true });
  });

  test('a Switch made before midnight has expired when the app is opened after local midnight', async ({ page }) => {
    await openApp(page, { now: '2026-07-14T22:50:00Z', localState: baseState({ phaseIndex: 1, practicedDate: '2026-07-14' }) });
    await goTo(page, 'daily');
    await dayChip(page, 'Sat').click();
    await daily(page).locator('[data-action="activateday"][data-day="Sat"]').click();
    expect((await localSaved(page)).activeDayDate).toBe('2026-07-14');

    // 00:10 Wednesday in Lisbon: the app is opened again (the day being viewed is not stored).
    await page.clock.setFixedTime(new Date('2026-07-14T23:10:00Z'));
    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0, { timeout: 5000 });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Wednesday · Beginner');
    await expect(practiceBox(page, 'focused')).toHaveCount(1);
    await expect(dayChip(page, 'Sat')).not.toHaveClass(/isactive/);
  });

  test('the streak counts today by the local day', async ({ page }) => {
    await openApp(page, {
      now: LISBON_SUMMER_AFTER_MIDNIGHT,
      localState: baseState({ practicedDate: '2026-07-15', streakDates: ['2026-07-13', '2026-07-14', '2026-07-15'] }),
    });
    expect(await streakOnHome(page)).toEqual({ logged: '🔥3', tag: "You've practiced 3 days in a row!" });
    await expect(cell(page, 2026, 6, 15)).toHaveClass(/\btoday\b/);
  });

  test('dates stored before the fix are kept as they are (D33)', async ({ page }) => {
    // A tick made at 00:20 local under the old code was stored with the UTC date (the 14th).
    const old = baseState({ phaseIndex: 1, practicedDate: '2026-07-14', practiced: { 'warmup.Wed': true }, streakDates: ['2026-07-13', '2026-07-14'], checks: { 'p1.e.0': '2026-07-14' } });
    await openApp(page, { now: LISBON_SUMMER_AFTER_MIDNIGHT, localState: old });
    const saved = await localSaved(page);
    expect(saved.streakDates).toEqual(['2026-07-13', '2026-07-14']);
    expect(saved.checks).toEqual({ 'p1.e.0': '2026-07-14' });
    expect(saved.practicedDate).toBe('2026-07-15');
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('summer-time changes (Lisbon)', () => {
  test.use({ timezoneId: 'Europe/Lisbon' });

  test('a run across the spring change (28 March 2027) counts every day', async ({ page }) => {
    await openApp(page, {
      now: '2027-03-29T00:30:00Z', // 01:30 Monday in Lisbon, the night after the clocks went forward
      localState: baseState({ practicedDate: '2027-03-29', streakDates: ['2027-03-26', '2027-03-27', '2027-03-28', '2027-03-29'] }),
    });
    expect(await streakOnHome(page)).toEqual({ logged: '🔥4', tag: "You've practiced 4 days in a row!" });
  });

  test('a run across the autumn change (25 October 2026) counts every day', async ({ page }) => {
    await openApp(page, {
      now: '2026-10-26T00:30:00Z', // 00:30 Monday in Lisbon, the night after the clocks went back
      localState: baseState({ practicedDate: '2026-10-26', streakDates: ['2026-10-24', '2026-10-25', '2026-10-26'] }),
    });
    expect(await streakOnHome(page)).toEqual({ logged: '🔥3', tag: "You've practiced 3 days in a row!" });
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('time zones far from UTC', () => {
  test.describe('Los Angeles (UTC-8): evening, already the next day in UTC', () => {
    test.use({ timezoneId: 'America/Los_Angeles' });

    test('Tuesday 21:00 local: practice is logged on Tuesday 10 November', async ({ page }) => {
      await openApp(page, { now: '2026-11-11T05:00:00Z', localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-10' }) });
      await goTo(page, 'daily');
      await expect(daily(page).locator('.eyebrow')).toHaveText('Tuesday · Beginner');
      await practiceBox(page, 'warmup').click();
      const saved = await localSaved(page);
      expect(saved.practiced).toEqual({ 'warmup.Tue': true });
      expect(saved.practicedDate).toBe('2026-11-10');
      expect(saved.streakDates).toEqual(['2026-11-10']);
      await goTo(page, 'home');
      await expect(cell(page, 2026, 10, 10)).toHaveClass('s-day hit today');
    });
  });

  test.describe('Tokyo (UTC+9): early morning, still the day before in UTC', () => {
    test.use({ timezoneId: 'Asia/Tokyo' });

    test('Wednesday 01:00 local: a new day starts and practice is logged on Wednesday 11 November', async ({ page }) => {
      await openApp(page, {
        now: '2026-11-10T16:00:00Z',
        localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-10', practiced: { 'warmup.Tue': true }, streakDates: ['2026-11-10'] }),
      });
      await goTo(page, 'daily');
      await expect(daily(page).locator('.eyebrow')).toHaveText('Wednesday · Beginner');
      expect((await localSaved(page)).practiced).toEqual({});
      await practiceBox(page, 'warmup').click();
      const saved = await localSaved(page);
      expect(saved.practicedDate).toBe('2026-11-11');
      expect(saved.streakDates).toEqual(['2026-11-10', '2026-11-11']);
      await goTo(page, 'home');
      expect(await streakOnHome(page)).toEqual({ logged: '🔥2', tag: "You've practiced 2 days in a row!" });
    });
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('signed in', () => {
  test.use({ timezoneId: 'Europe/Lisbon' });

  test('the cloud receives the local day (Lisbon summer, 00:30)', async ({ page }) => {
    const cloud = progressState({ schemaVersion: 1, syncRev: 1, phaseIndex: 1, practicedDate: '2026-07-14', streakDates: ['2026-07-14'] });
    await openApp(page, { now: LISBON_SUMMER_AFTER_MIDNIGHT, user: TEST_USER, docs: { [USER_DOC]: cloud }, localState: cloud });
    await settle(page);
    await goTo(page, 'daily');
    await practiceBox(page, 'warmup').click();
    await settle(page);
    const writes = await cloudWrites(page);
    const last = writes[writes.length - 1];
    expect(last.path).toBe(USER_DOC);
    expect(last.data.practicedDate).toBe('2026-07-15');
    expect(last.data.practiced).toEqual({ 'warmup.Wed': true });
    expect(last.data.streakDates).toEqual(['2026-07-14', '2026-07-15']);
  });
});
