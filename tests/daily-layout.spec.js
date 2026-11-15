// Slice 4.7 (D132 point 1, D133): DAILY as drawn on the 4.6 canvas.
// Header count, numbered blocks, day buttons, Practiced buttons, the "+ 5 min" box, and on desktop the companion
// column (MICRO-DOSES, KEY circle of fifths). DAILY behaviour itself is covered by daily.spec.js, streak.spec.js
// and local-day.spec.js, which keep their expected values. Fixed clock: Tuesday 2026-11-10 (Lisbon).
const { test, expect } = require('@playwright/test');
const { openApp, openView, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const side = (page) => daily(page).locator('.daily-side');
const dayChip = (page, day) => daily(page).locator(`.daypick [data-action="setday"][data-day="${day}"]`);
const isPhone = (testInfo) => testInfo.project.name === 'mobile';
// Phase 1, warm-up ticked today, two days logged this week (Mon, Tue) and one the week before.
const state = (over = {}) => baseState({ phaseIndex: 1, practiced: { 'warmup.Tue': true },
  streakDates: ['2026-11-02', '2026-11-09', '2026-11-10'], ...over });
const rawLocal = (page) => page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'));

test.describe('session column (desktop and phone)', () => {
  test('header shows the session count; another day shows the minutes only', async ({ page }, testInfo) => {
    const monitor = await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const count = daily(page).locator('.page-head-right');
    await expect(count).toHaveText(isPhone(testInfo) ? '1 of 4 · 60 min' : '1 of 4 practiced · 60 min', { useInnerText: true });
    await dayChip(page, 'Sat').click();
    await expect(count).toHaveText('60 min');
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('Setup phase: count of its two blocks, no minutes', async ({ page }, testInfo) => {
    await openApp(page, { localState: baseState({ phaseIndex: 0 }) });
    await openView(page, 'daily');
    await expect(daily(page).locator('.page-head-right')).toHaveText(isPhone(testInfo) ? '0 of 2' : '0 of 2 practiced', { useInnerText: true });
    await expect(daily(page).locator('.blk-num')).toHaveText(['01', '02']);
  });

  test('blocks are numbered 01-04 on a weekday and 01-02 at the weekend; titles unchanged', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await expect(daily(page).locator('.blk > .top > .blk-num')).toHaveText(['01', '02', '03', '04']);
    await expect(daily(page).locator('.blk > .top > .nm')).toHaveText(['Warm-Up', 'Focused', 'Improv & Expression', 'Cool-Down']);
    await dayChip(page, 'Sun').click();
    await expect(daily(page).locator('.blk > .top > .blk-num')).toHaveText(['01', '02']);
  });

  test('day buttons: selected day pressed and red, today marked, no dot', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await expect(dayChip(page, 'Tue')).toHaveAttribute('aria-pressed', 'true');
    await expect(dayChip(page, 'Tue')).toHaveAttribute('aria-current', 'date');
    const dot = await dayChip(page, 'Tue').evaluate((el) => getComputedStyle(el, '::after').content);
    expect(['none', 'normal']).toContain(dot);
    await dayChip(page, 'Thu').click();
    await expect(dayChip(page, 'Thu')).toHaveAttribute('aria-pressed', 'true');
    await expect(dayChip(page, 'Tue')).toHaveAttribute('aria-pressed', 'false');
    await expect(dayChip(page, 'Tue')).toHaveAttribute('aria-current', 'date');
    await expect(dayChip(page, 'Thu')).toHaveCSS('color', 'rgb(255, 92, 97)'); // --red-tint
  });

  test('Practiced is a button that reports its state; read-only days show it disabled', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const focused = daily(page).locator('button.blkcheck[data-block="focused"]');
    await expect(focused).toHaveAttribute('aria-pressed', 'false');
    await focused.click();
    await expect(daily(page).locator('button.blkcheck[data-block="focused"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(daily(page).locator('.page-head-right')).toContainText('2 of 4');
    await dayChip(page, 'Thu').click();
    await expect(daily(page).locator('button.blkcheck.ro')).toHaveCount(4);
    for (const b of await daily(page).locator('button.blkcheck.ro').all()) await expect(b).toBeDisabled();
  });

  test('the micro-dose sits in a dashed "+ 5 min" box with the same link; none on Friday', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const box = daily(page).locator('.blk').nth(1).locator('.daily-micro');
    await expect(box).toHaveCount(1);
    await expect(box.locator('.daily-micro-tag')).toHaveText('+ 5 min');
    await expect(box.locator('a')).toHaveText('Rhythm micro-dose');
    await expect(box.locator('a')).toHaveAttribute('href', 'https://tinyurl.com/2mt96kef');
    await expect(box).toHaveCSS('border-top-style', 'dashed');
    await dayChip(page, 'Fri').click();
    await expect(daily(page).locator('.daily-micro')).toHaveCount(0);
  });
});

test.describe('companion column (desktop)', () => {
  test('phone: no companion column (D133 point 2)', async ({ page }, testInfo) => {
    test.skip(!isPhone(testInfo), 'phone only');
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await expect(side(page)).toBeHidden();
  });

  test('beside the session on a wide window, under it on a narrow one', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    let main = await daily(page).locator('.daily-main').boundingBox();
    let aside = await side(page).boundingBox();
    expect(aside.x).toBeGreaterThan(main.x + main.width);
    expect(main.width).toBeLessThanOrEqual(721);
    expect(aside.width).toBeLessThanOrEqual(401);
    await page.setViewportSize({ width: 1024, height: 900 });
    main = await daily(page).locator('.daily-main').boundingBox();
    aside = await side(page).boundingBox();
    expect(aside.y).toBeGreaterThanOrEqual(main.y + main.height);
  });

  test('MICRO-DOSES: today in front with its video; week tiles with ticks from the calendar', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const card = side(page).locator('.daily-micro-card');
    await expect(card.locator('.dc-front-name')).toHaveText('Rhythm');
    await expect(card.locator('.dc-front-line')).toHaveText("Today's micro-dose, at the end of the Focused block");
    await expect(card.locator('a.dc-btn')).toHaveText("Open today's video");
    await expect(card.locator('a.dc-btn')).toHaveAttribute('href', 'https://tinyurl.com/2mt96kef');
    const tiles = card.locator('.dc-tile');
    await expect(tiles.locator('.dc-tile-day')).toHaveText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    await expect(tiles.locator('.dc-tile-name')).toHaveText(['Ear Training', 'Rhythm', 'Time Signatures', 'Sight-Reading', 'Reinforce Weakest']);
    // 2026-11-09 (Mon) and 2026-11-10 (Tue) are logged; 2026-11-02 belongs to last week.
    await expect(card.locator('.dc-tile.ticked')).toHaveCount(2);
    await expect(card.locator('.dc-tile[data-day="Mon"]')).toHaveClass(/ticked/);
    await expect(card.locator('.dc-tile[data-day="Tue"]')).toHaveClass(/\bcur\b/);
    await expect(card.locator('.dc-tile[data-day="Mon"]')).toHaveAttribute('aria-label', 'Monday: Ear Training, practised');
  });

  test('MICRO-DOSES: Friday has no video; Saturday shows the week only', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const card = side(page).locator('.daily-micro-card');
    await dayChip(page, 'Fri').click();
    await expect(card.locator('.dc-front-name')).toHaveText('Reinforce Weakest');
    await expect(card.locator('a.dc-btn')).toHaveCount(0);
    await dayChip(page, 'Sat').click();
    await expect(card.locator('.dc-none')).toHaveText('No micro-dose on Saturday');
    await expect(card.locator('.dc-front, a.dc-btn, .dc-tile.cur')).toHaveCount(0);
    await expect(card.locator('.dc-tile')).toHaveCount(5);
  });

  test('MICRO-DOSES: the Setup phase has no micro-dose today', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: baseState({ phaseIndex: 0 }) });
    await openView(page, 'daily');
    await expect(side(page).locator('.daily-micro-card .dc-none')).toHaveText('No micro-dose today');
    await expect(side(page).locator('.daily-micro-card a.dc-btn')).toHaveCount(0);
  });

  test('without the BHGS pack the micro-doses are left out; the KEY card stays', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state(), bhgsPack: false });
    await openView(page, 'daily');
    await expect(side(page).locator('.daily-micro-card')).toHaveCount(0);
    await expect(side(page).locator('.daily-key-card')).toBeVisible();
  });

  test("KEY: today's key is the Improv key of the day, with its notes and diatonic chords", async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state() });
    await openView(page, 'improv');
    const improvKey = await page.locator('#panel-improv .transpose-card > b').first().textContent();
    expect(improvKey).toBe('C# minor');
    await openView(page, 'daily');
    const card = side(page).locator('.daily-key-card');
    await expect(card.locator('.dc-label')).toHaveText("Today's key");
    await expect(card.locator('.dc-aside')).toHaveText('Sabbath / Doom Core');
    await expect(card.locator('.dc-keyname')).toHaveText('C♯ minor');
    await expect(card.locator('.kc-key.on')).toHaveAttribute('aria-label', 'C♯ minor');
    await expect(card.locator('.kc-key')).toHaveCount(24);
    await expect(card.locator('.kc-note')).toHaveText(['C♯', 'D♯', 'E', 'F♯', 'G♯', 'A', 'B']);
    await expect(card.locator('.kc-num')).toHaveText(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
    await expect(card.locator('.kc-chord')).toHaveText(['C♯m', 'D♯°', 'E', 'F♯m', 'G♯m', 'A', 'B']);
    await expect(card.locator('.dc-today')).toHaveCount(0);
  });

  test('KEY: tapping another key shows it; "Today" brings back the key of the day; nothing is written', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const before = await rawLocal(page);
    const card = () => side(page).locator('.daily-key-card');

    await card().locator('.kc-key[aria-label="E♭ minor"]').click();
    await expect(card().locator('.dc-label')).toHaveText('Key');
    await expect(card().locator('.dc-keyname')).toHaveText('E♭ minor');
    await expect(card().locator('.kc-note')).toHaveText(['E♭', 'F', 'G♭', 'A♭', 'B♭', 'C♭', 'D♭']);
    await expect(card().locator('.kc-key[aria-label="E♭ minor"]')).toBeFocused();

    await card().locator('.kc-key[aria-label="C major"]').click();
    await expect(card().locator('.kc-num')).toHaveText(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    await expect(card().locator('.kc-chord')).toHaveText(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    await expect(card().locator('.dc-today')).toHaveText('Today: C♯ minor');

    await card().locator('.dc-today').click();
    await expect(card().locator('.dc-label')).toHaveText("Today's key");
    await expect(card().locator('.dc-keyname')).toHaveText('C♯ minor');
    expect(await rawLocal(page)).toBe(before);
  });

  test('KEY: the chosen key stays while the app is open and returns to today on reload', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'desktop only');
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await side(page).locator('.kc-key[aria-label="G major"]').click();
    await openView(page, 'home');
    await openView(page, 'daily');
    await expect(side(page).locator('.dc-keyname')).toHaveText('G major');
    await page.reload();
    await expect(page.locator('#views-container')).toBeAttached();
    await openView(page, 'daily');
    await expect(side(page).locator('.dc-keyname')).toHaveText('C♯ minor');
  });
});
