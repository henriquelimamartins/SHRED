// Phase 1.4: DAILY, the streak and the calendar as they behave on main TODAY (fixed clock).
// DAILY is protected (D30, D24): any change to these behaviours must make these tests fail.
// Tests named "current behaviour:" document known problems on purpose; the phase that fixes
// them updates the test in the same PR.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { baseState, checksFor } = require('./support/fixtures');

// The owner's time zone. In winter Lisbon is UTC+0, so the default clock (2026-11-10 12:00 UTC,
// a Tuesday) is the same date and weekday in local time and in UTC.
test.use({ timezoneId: 'Europe/Lisbon' });

const MONDAY = '2026-11-09T12:00:00Z';
const SATURDAY = '2026-11-14T12:00:00Z';

const home = (page) => page.locator('#panel-home');
const daily = (page) => page.locator('#panel-daily');
const toast = (page) => page.locator('#toast');

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

/** Block titles shown in DAILY, e.g. ['Warm-Up', 'Focused', ...]. */
const blockTitles = (page) => daily(page).locator('.blk > .top > .nm').allTextContents();
/** The editable "Practiced" box of a block (warmup, focused, casual, cooldown, prereq). */
const practiceBox = (page, block) => daily(page).locator(`[data-action="blockprac"][data-block="${block}"]`);
const dayChip = (page, day) => daily(page).locator(`.daypick [data-action="setday"][data-day="${day}"]`);

/** Home: { logged: '🔥3', tag: "You've practiced 3 days in a row!" } */
async function streakOnHome(page) {
  return {
    logged: await home(page).locator('.statrow .stat').nth(1).locator('.bignum').textContent(),
    tag: await home(page).locator('.card', { hasText: 'Consistency Grid' }).locator('h3 .tag').textContent(),
  };
}

// ---------------------------------------------------------------------------------------------
test.describe('DAILY layout', () => {
  test('opens on today (Tuesday) with the 7-day picker, Mon to Sun', async ({ page }, testInfo) => {
    const monitor = await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');

    await expect(daily(page).locator('.eyebrow')).toHaveText('Tuesday · Beginner');
    const chips = daily(page).locator('.daypick .dchip2');
    await expect(chips).toHaveText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    await expect(dayChip(page, 'Tue')).toHaveClass(/\bon\b/);
    await expect(dayChip(page, 'Tue')).toHaveClass(/istoday/);
    await expect(daily(page).locator('.note', { hasText: 'practice session is' })).toHaveCount(0);

    await page.screenshot({ path: testInfo.outputPath('daily-tuesday.png'), fullPage: true });
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('weekday session: Warm-Up, Focused, Improv & Expression, Cool-Down; Tuesday = picking chops + Rhythm', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');

    expect(await blockTitles(page)).toEqual(['Warm-Up', 'Focused', 'Improv & Expression', 'Cool-Down']);
    const focused = daily(page).locator('.blk').nth(1);
    await expect(focused).toContainText('Chop-builders (picking)');
    await expect(focused.locator('[data-action="chop"][data-d="1"]')).toHaveCount(2); // alt + sweep
    await expect(focused).toContainText('Rhythm micro-dose');
    for (const block of ['warmup', 'focused', 'casual', 'cooldown']) await expect(practiceBox(page, block)).toHaveCount(1);
  });

  test('each weekday has its own Focused content and micro-dose', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');
    const expected = {
      Mon: { titles: ['Warm-Up', 'Focused', 'Casual', 'Cool-Down'], text: ['Exercises in rotation', 'Ear Training micro-dose'] },
      Wed: { titles: ['Warm-Up', 'Focused', 'Improv & Expression', 'Cool-Down'], text: ['Theory in rotation', 'Time Signatures micro-dose'] },
      Thu: { titles: ['Warm-Up', 'Focused', 'Casual', 'Cool-Down'], text: ['legato/economy/tapping', 'Sight-Reading micro-dose'] },
      Fri: { titles: ['Warm-Up', 'Focused', 'Improv & Expression', 'Cool-Down'], text: ['Revisit your hardest exercise', 'Phase Transition Test: 0/6 at Level 2+'] },
    };
    for (const [day, { titles, text }] of Object.entries(expected)) {
      await dayChip(page, day).click();
      expect(await blockTitles(page), day).toEqual(titles);
      for (const t of text) await expect(daily(page).locator('.blk').nth(1), `${day}: ${t}`).toContainText(t);
    }
    // Friday has no extra "+ 5 min: … micro-dose" line.
    await expect(daily(page).locator('.blk').nth(1)).not.toContainText('+ 5 min:');
  });

  test('weekend sessions are 2 blocks: Saturday solos, Sunday improv (45 min each)', async ({ page }, testInfo) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');

    await dayChip(page, 'Sat').click();
    await expect(daily(page).locator('.eyebrow')).toHaveText('Saturday · Beginner');
    expect(await blockTitles(page)).toEqual(['Warm-Up', 'CASUAL']);
    await expect(daily(page).locator('.blk > .top .min')).toHaveText(['15 min', '45 min']);
    await expect(daily(page).locator('.blk').nth(1)).toContainText('polish next solo');
    await page.screenshot({ path: testInfo.outputPath('daily-saturday-readonly.png'), fullPage: true });

    await dayChip(page, 'Sun').click();
    expect(await blockTitles(page)).toEqual(['Warm-Up', 'Improv & Expression']);
    await expect(daily(page).locator('.blk > .top .min')).toHaveText(['15 min', '45 min']);
    await expect(daily(page).locator('.blk').nth(1)).toContainText('Gate 1:');
  });

  test('Setup phase: Prerequisites + Warm-Up only', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 0 }) });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Tuesday · Setup');
    expect(await blockTitles(page)).toEqual(['Prerequisites', 'Warm-Up']);
    await expect(practiceBox(page, 'prereq')).toHaveCount(1);
    await expect(practiceBox(page, 'warmup')).toHaveCount(1);
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('active day', () => {
  test('another day can be viewed but is read-only, with a Switch button', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');
    await dayChip(page, 'Sat').click();

    await expect(daily(page).locator('.note').first()).toContainText('Suggested practice session is Tuesday');
    await expect(daily(page).locator('[data-action="blockprac"]')).toHaveCount(0);
    await expect(daily(page).locator('.blkcheck.ro')).toHaveCount(2);
    await expect(daily(page).locator('[data-action="togm"]')).toHaveCount(0); // items are read-only too
    await expect(daily(page).locator('[data-action="activateday"][data-day="Sat"]')).toHaveText('Switch to Saturday instead →');
  });

  test('Switch makes that day today\'s session; it is stored with today\'s date', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');
    await dayChip(page, 'Sat').click();
    await daily(page).locator('[data-action="activateday"][data-day="Sat"]').click();

    await expect(toast(page)).toHaveText('Saturday is now your active session');
    await expect(practiceBox(page, 'warmup')).toHaveCount(1);
    await expect(practiceBox(page, 'casual')).toHaveCount(1);
    await expect(dayChip(page, 'Sat')).toHaveClass(/isactive/);
    await expect(dayChip(page, 'Tue')).toHaveClass(/istoday/);
    let saved = await localSaved(page);
    expect(saved.activeDayOverride).toBe('Sat');
    expect(saved.activeDayDate).toBe('2026-11-10');

    // Tuesday is now the read-only one.
    await dayChip(page, 'Tue').click();
    await expect(daily(page).locator('.note').first()).toContainText('Currently selected practice session is Saturday');
    await expect(daily(page).locator('[data-action="blockprac"]')).toHaveCount(0);

    // Practising the Saturday session logs TODAY's date, under the Saturday block key.
    await dayChip(page, 'Sat').click();
    await practiceBox(page, 'warmup').click();
    saved = await localSaved(page);
    expect(saved.practiced).toEqual({ 'warmup.Sat': true });
    expect(saved.streakDates).toEqual(['2026-11-10']);
  });

  test('after a reload, DAILY opens on today (read-only) while the switched day stays active', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, activeDayOverride: 'Sat', activeDayDate: '2026-11-10' }) });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Tuesday · Beginner');
    await expect(daily(page).locator('.note').first()).toContainText('Currently selected practice session is Saturday');
    await expect(daily(page).locator('[data-action="blockprac"]')).toHaveCount(0);
  });

  test('a switch from an earlier day has expired: today is active again', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, activeDayOverride: 'Sat', activeDayDate: '2026-11-09' }) });
    await goTo(page, 'daily');
    await expect(practiceBox(page, 'warmup')).toHaveCount(1);
    await expect(dayChip(page, 'Sat')).not.toHaveClass(/isactive/);
    await dayChip(page, 'Sat').click();
    await expect(daily(page).locator('.note').first()).toContainText('Currently selected practice session is Tuesday');
    // The expired value is left in the saved state.
    expect((await localSaved(page)).activeDayOverride).toBe('Sat');
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('Practiced boxes and the streak', () => {
  test('ticking a block logs today; unticking the last one removes today again', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, streakDates: ['2026-11-09'] }) });
    await goTo(page, 'daily');

    await practiceBox(page, 'warmup').click();
    await expect(practiceBox(page, 'warmup').locator('.box')).toHaveClass(/\bon\b/);
    await expect(daily(page).locator('.blk.done-today')).toHaveCount(1);
    let saved = await localSaved(page);
    expect(saved.practiced).toEqual({ 'warmup.Tue': true });
    expect(saved.practicedDate).toBe('2026-11-10');
    expect(saved.streakDates).toEqual(['2026-11-09', '2026-11-10']);

    await practiceBox(page, 'casual').click();
    await practiceBox(page, 'warmup').click(); // one block still ticked → today stays
    expect((await localSaved(page)).streakDates).toEqual(['2026-11-09', '2026-11-10']);

    await practiceBox(page, 'casual').click(); // nothing ticked → today removed
    saved = await localSaved(page);
    expect(saved.practiced).toEqual({ 'warmup.Tue': false, 'casual.Tue': false });
    expect(saved.streakDates).toEqual(['2026-11-09']);

    await goTo(page, 'home');
    expect(await streakOnHome(page)).toEqual({ logged: '🔥1', tag: "You've practiced 1 day in a row!" });
  });

  test('all 4 weekday blocks → "full session" message once, stored as congratsDate', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');

    for (const block of ['warmup', 'focused', 'casual']) await practiceBox(page, block).click();
    expect((await localSaved(page)).congratsDate).toBeNull();
    await practiceBox(page, 'cooldown').click();
    await expect(toast(page)).toHaveText("🤘 Nice work - today's full session is complete!");
    await expect(toast(page)).toHaveClass(/show/);
    expect((await localSaved(page)).congratsDate).toBe('2026-11-10');

    // Wait for the message to hide; untick + tick again does not show it a second time today.
    await expect(toast(page)).not.toHaveClass(/show/, { timeout: 5000 });
    await practiceBox(page, 'cooldown').click();
    await practiceBox(page, 'cooldown').click();
    await expect(toast(page)).not.toHaveClass(/show/);
    expect((await localSaved(page)).congratsDate).toBe('2026-11-10');
  });

  test('weekend full session = Warm-Up + one 45-minute block', async ({ page }, testInfo) => {
    await openApp(page, { now: SATURDAY, localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-14' }) });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Saturday · Beginner');

    await practiceBox(page, 'warmup').click();
    await practiceBox(page, 'casual').click();
    await expect(toast(page)).toHaveText("🤘 Nice work - today's full session is complete!");
    const saved = await localSaved(page);
    expect(saved.practiced).toEqual({ 'warmup.Sat': true, 'casual.Sat': true });
    expect(saved.streakDates).toEqual(['2026-11-14']);
    expect(saved.congratsDate).toBe('2026-11-14');
    await page.screenshot({ path: testInfo.outputPath('daily-saturday-done.png'), fullPage: true });
  });

  test('Setup phase full session = Prerequisites + Warm-Up', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 0 }) });
    await goTo(page, 'daily');
    await practiceBox(page, 'prereq').click();
    await practiceBox(page, 'warmup').click();
    await expect(toast(page)).toHaveText("🤘 Nice work - today's full session is complete!");
    expect((await localSaved(page)).congratsDate).toBe('2026-11-10');
  });

  test('a new day clears the Practiced boxes; earlier logged days are kept', async ({ page }) => {
    // Nothing practised yesterday.
    await openApp(page, { localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09', streakDates: ['2026-11-08'] }) });
    const saved = await localSaved(page);
    expect(saved.practiced).toEqual({});
    expect(saved.practicedDate).toBe('2026-11-10');
    expect(saved.streakDates).toEqual(['2026-11-08']);
  });

  test('current behaviour: after practising yesterday, opening the app today also logs today', async ({ page }) => {
    // Known problem (found in 1.4): on the first load of a new day the streak is updated with
    // yesterday's ticks but today's date, so today counts as practised before anything is done.
    await openApp(page, {
      localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09', practiced: { 'warmup.Mon': true }, streakDates: ['2026-11-09'] }),
    });
    const saved = await localSaved(page);
    expect(saved.practiced).toEqual({});
    expect(saved.practicedDate).toBe('2026-11-10');
    expect(saved.streakDates).toEqual(['2026-11-09', '2026-11-10']);
    expect(await streakOnHome(page)).toEqual({ logged: '🔥2', tag: "You've practiced 2 days in a row!" });
  });

  test('current behaviour: that extra day disappears at the next change of the day, even outside DAILY', async ({ page }) => {
    await openApp(page, {
      localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09', practiced: { 'warmup.Mon': true }, streakDates: ['2026-11-09'] }),
    });
    // A Technique change on Home (Phase Transition Test +1), no DAILY block ticked.
    await home(page).locator('[data-action="test"][data-t="alt"][data-d="1"]').click();
    const saved = await localSaved(page);
    expect(saved.testLevel.alt).toBe(1);
    expect(saved.streakDates).toEqual(['2026-11-09']);
    expect(await streakOnHome(page)).toEqual({ logged: '🔥1', tag: "You've practiced 1 day in a row!" });
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('streak count on Home', () => {
  const cases = [
    { name: 'no days logged', dates: [], logged: '🔥0', days: 0 },
    { name: 'today + the 2 days before', dates: ['2026-11-08', '2026-11-09', '2026-11-10'], logged: '🔥3', days: 3 },
    { name: 'not yet today: a run ending yesterday still counts', dates: ['2026-11-07', '2026-11-08', '2026-11-09'], logged: '🔥3', days: 3 },
    { name: 'last practice 2 days ago: streak 0', dates: ['2026-11-07', '2026-11-08'], logged: '🔥2', days: 0 },
    { name: 'a gap breaks the run; Days Logged counts every day', dates: ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-09', '2026-11-10'], logged: '🔥5', days: 2 },
    { name: 'dates in any order', dates: ['2026-11-10', '2026-11-08', '2026-11-09'], logged: '🔥3', days: 3 },
    { name: 'one day', dates: ['2026-11-10'], logged: '🔥1', days: 1 },
  ];
  for (const c of cases) {
    test(c.name, async ({ page }) => {
      await openApp(page, { localState: baseState({ streakDates: c.dates }) });
      const tag = c.days === 1 ? "You've practiced 1 day in a row!" : `You've practiced ${c.days} days in a row!`;
      expect(await streakOnHome(page)).toEqual({ logged: c.logged, tag });
    });
  }

  test('a run across a month boundary', async ({ page }) => {
    await openApp(page, {
      now: '2026-11-02T12:00:00Z',
      localState: baseState({ practicedDate: '2026-11-02', streakDates: ['2026-10-30', '2026-10-31', '2026-11-01'] }),
    });
    expect(await streakOnHome(page)).toEqual({ logged: '🔥3', tag: "You've practiced 3 days in a row!" });
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('calendar (Consistency Grid)', () => {
  const nav = (page, action) => home(page).locator(`.calendar-header-nav [data-action="${action}"]`);
  const title = async (page) => [
    await home(page).locator('#cal-month-title').textContent(),
    await home(page).locator('#cal-year-title').textContent(),
  ];
  /** Cells of the month panel (month m is 0-based, as in the app). */
  const cells = (page, y, m) => home(page).locator(`.cal-panel[data-ym="${y}-${m}"] .s-day`);

  test('November 2026: Monday-first grid, today, practised days, past days and weekends', async ({ page }, testInfo) => {
    await openApp(page, { localState: baseState({ streakDates: ['2026-11-02', '2026-11-09'] }) });
    expect(await title(page)).toEqual(['November', '2026']);

    const nov = cells(page, 2026, 10);
    await expect(nov).toHaveCount(42); // 26 Oct (Mon) to 6 Dec (Sun)
    await expect(nov.first()).toHaveText('26MON');
    await expect(nov.first()).toHaveClass(/other-month/);
    await expect(nov.last()).toHaveText('6SUN');
    await expect(nov.locator('.s-month-badge')).toHaveText(['OCT', 'NOV', 'NOV', 'DEC']); // 31 Oct, 1 Nov, 30 Nov, 1 Dec

    await expect(cell(page, 2026, 10, 10)).toHaveClass('s-day today');
    await expect(cell(page, 2026, 10, 9)).toHaveClass('s-day past hit');
    await expect(cell(page, 2026, 10, 2)).toHaveClass('s-day past hit');
    await expect(cell(page, 2026, 10, 8)).toHaveClass('s-day past weekend');
    await expect(cell(page, 2026, 10, 14)).toHaveClass('s-day weekend');
    await expect(cell(page, 2026, 10, 11)).toHaveClass('s-day');
    await expect(nov.and(page.locator('.hit'))).toHaveCount(2);
    await expect(nov.and(page.locator('.today'))).toHaveCount(1);

    await home(page).locator('.card', { hasText: 'Consistency Grid' }).screenshot({ path: testInfo.outputPath('calendar-november.png') });
  });

  test('today ticked in DAILY turns green in the calendar', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await goTo(page, 'daily');
    await practiceBox(page, 'warmup').click();
    await goTo(page, 'home');
    await expect(cell(page, 2026, 10, 10)).toHaveClass('s-day hit today');
  });

  test('with no earlier practice, Prev and Next are disabled', async ({ page }) => {
    await openApp(page, { localState: baseState({ streakDates: ['2026-11-02'] }) });
    await expect(nav(page, 'calprev')).toBeDisabled();
    await expect(nav(page, 'calnext')).toBeDisabled();
    await expect(home(page).locator('.cal-panel')).toHaveCount(1);
  });

  test('Prev goes back to the first practised month and stops; Next and Today come back', async ({ page }) => {
    await openApp(page, { localState: baseState({ streakDates: ['2026-09-15', '2026-11-09'] }) });
    await expect(nav(page, 'calprev')).toBeEnabled();
    await expect(nav(page, 'calnext')).toBeDisabled();

    await nav(page, 'calprev').click();
    expect(await title(page)).toEqual(['October', '2026']);
    await expect(nav(page, 'calnext')).toBeEnabled();

    await nav(page, 'calprev').click();
    expect(await title(page)).toEqual(['September', '2026']);
    await expect(nav(page, 'calprev')).toBeDisabled();
    await expect(cell(page, 2026, 8, 15)).toHaveClass('s-day past hit');

    await nav(page, 'calnext').click();
    expect(await title(page)).toEqual(['October', '2026']);
    await nav(page, 'caltoday').click();
    expect(await title(page)).toEqual(['November', '2026']);
    await expect(nav(page, 'calnext')).toBeDisabled();
  });

  test('Prev crosses the year boundary', async ({ page }) => {
    await openApp(page, {
      now: '2027-01-05T12:00:00Z',
      localState: baseState({ practicedDate: '2027-01-05', streakDates: ['2026-12-20', '2027-01-04'] }),
    });
    expect(await title(page)).toEqual(['January', '2027']);
    await nav(page, 'calprev').click();
    expect(await title(page)).toEqual(['December', '2026']);
    await expect(nav(page, 'calprev')).toBeDisabled();
    await expect(cell(page, 2026, 11, 20)).toHaveClass('s-day past weekend hit');
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('item sequences in DAILY', () => {
  const focusedItems = (page) => daily(page).locator('.blk').nth(1).locator('[data-action="togm"]');

  test('Monday shows the next concept video; watched today it stays; next Monday shows the following one', async ({ page }) => {
    await openApp(page, { now: MONDAY, localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09', checks: checksFor(['p1.c.0']) }) });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Monday · Beginner');

    const video = (key) => focusedItems(page).and(page.locator(`[data-key="${key}"]`));
    await expect(focusedItems(page).and(page.locator('[data-key^="p1.c."]'))).toHaveCount(1);
    await expect(video('p1.c.1')).toHaveText('Unwatched');

    await video('p1.c.1').click();
    await expect(video('p1.c.1')).toHaveText('✓ Watched'); // stays on screen today
    expect((await localSaved(page)).checks['p1.c.1']).toBe('2026-11-09');

    await page.clock.setFixedTime(new Date('2026-11-16T12:00:00Z'));
    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Monday · Beginner');
    await expect(focusedItems(page).and(page.locator('[data-key^="p1.c."]'))).toHaveCount(1);
    await expect(video('p1.c.2')).toHaveText('Unwatched');
  });

  test('Monday with every concept video watched says so', async ({ page }) => {
    await openApp(page, {
      now: MONDAY,
      localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09', checks: checksFor(['p1.c.0', 'p1.c.1', 'p1.c.2', 'p1.c.3']) }),
    });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.blk').nth(1)).toContainText('All concept videos completed.');
  });

  test('Monday Casual shows the next solo only', async ({ page }) => {
    await openApp(page, { now: MONDAY, localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09', checks: checksFor(['p1.s.0', 'p1.s.1']) }) });
    await goTo(page, 'daily');
    const casual = daily(page).locator('.blk').nth(2).locator('[data-action="togm"]');
    await expect(casual).toHaveCount(1);
    await expect(casual).toHaveAttribute('data-key', 'p1.s.2');
  });
});

// ---------------------------------------------------------------------------------------------
test.describe('time zone', () => {
  test('current behaviour: in Lisbon summer time, just after midnight the weekday is local but the date is UTC', async ({ page }) => {
    // Known problem (found in 1.4): the app takes the weekday from the device clock but "today"
    // (streak, calendar, daily reset, item dates) from UTC. In summer (UTC+1), between 00:00 and
    // 01:00 the DAILY session is already Wednesday, but practice is logged on Tuesday's date.
    await openApp(page, { now: '2026-07-14T23:30:00Z', localState: baseState({ phaseIndex: 1, practicedDate: '2026-07-14' }) });
    await goTo(page, 'daily');
    await expect(daily(page).locator('.eyebrow')).toHaveText('Wednesday · Beginner');

    await practiceBox(page, 'warmup').click();
    const saved = await localSaved(page);
    expect(saved.practiced).toEqual({ 'warmup.Wed': true });
    expect(saved.practicedDate).toBe('2026-07-14');
    expect(saved.streakDates).toEqual(['2026-07-14']);

    await goTo(page, 'home');
    await expect(cell(page, 2026, 6, 14)).toHaveClass(/today/);
    await expect(cell(page, 2026, 6, 15)).not.toHaveClass(/today/);
  });
});

/** One day of a month panel in the calendar (month m is 0-based, as in the app). */
function cell(page, y, m, date) {
  return page.locator(`#panel-home .cal-panel[data-ym="${y}-${m}"] .s-day:not(.other-month)`)
    .filter({ has: page.locator('.s-date', { hasText: new RegExp(`^${date}$`) }) });
}
