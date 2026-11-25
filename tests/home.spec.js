// Slice 4.5c (DECISIONS D117 point 2, D124 point 3, D127 point 2, D129): HOME as drawn on the 4.0 canvas.
// Slice 4.10j (D164): HOME = direction A of the 4.10 canvas. Today's session became the briefing of the day (the same
// blocks, minutes, Practiced state and counts as before), Today's Improv became Today's key (the same key and style as
// IMPROV), two columns from 1180 px; header, account button and profile panel: home-hub.spec.js.
// Slice 4.10m (D167): Next up left HOME and the circle shows on the phone too (home-key.spec.js).
// Firebase is stubbed; the clock is fixed at Tuesday 10 Nov 2026; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, cloudWrites, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { baseState, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const brief = (page) => home(page).locator('.home-brief');
// The full block names (the phone shows "Improv" for Improv & Expression; the tile's accessible name keeps the full one).
// Slice 4.10m (D167): each tile's name for screen readers is text inside it (it was an aria-label).
const tileTitles = (page) => brief(page).locator('.hb-tile .home-sr').evaluateAll((t) => t.map((x) => x.textContent.split(', ')[0]));

test('header: the streak as "N days in a row · M logged" (desktop line, also read by the phone pill)', async ({ page }) => {
  await openApp(page, { localState: progressState() }); // 7, 8, 9 Nov logged; today not yet
  const line = home(page).locator('.home-streak');
  await expect(line).toHaveText('3 days in a row · 3 logged');
  await expect(line.locator('svg.ico')).toHaveCount(1);
});

test('header: one day reads "1 day in a row"; a broken run still counts every logged day', async ({ page }) => {
  await openApp(page, { localState: baseState({ streakDates: ['2026-11-01', '2026-11-02', '2026-11-09'] }) });
  await expect(home(page).locator('.home-streak')).toHaveText('1 day in a row · 3 logged');
});

test('the briefing lists today\'s DAILY blocks with their minutes as DAILY writes them; nothing can be ticked on HOME', async ({ page }) => {
  const monitor = await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  expect(await tileTitles(page)).toEqual(['Warm-Up', 'Focused', 'Improv & Expression', 'Cool-Down']);
  expect(await brief(page).locator('.hb-min').allTextContents()).toEqual(['5 min', '30 + 5 min', '15 min', '5 min']);
  expect(await brief(page).locator('.hb-num').allTextContents()).toEqual(['01', '02', '03', '04']);
  await expect(brief(page).locator('.hb-meta')).toHaveText('0 of 4 · 60 min');
  await expect(brief(page).locator('.hb-label')).toHaveText("Today's session · Tuesday");
  await expect(home(page).locator('[data-action="blockprac"], [data-toggle]')).toHaveCount(0);
  // The same blocks, in the same order, as the DAILY page, with the same minutes text.
  await openView(page, 'daily');
  const daily = await page.locator('#panel-daily .blk > .top > .nm').allTextContents();
  expect(daily.map((t) => t.trim().toLowerCase())).toEqual((await tileTitles(page)).map((t) => t.toLowerCase()));
  const dailyMin = await page.locator('#panel-daily .blk > .top .min').allTextContents();
  expect(dailyMin.map((t) => t.trim())).toEqual(await brief(page).locator('.hb-min').allTextContents());
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('the next block is the first one not practised; a block ticked in DAILY shows as done on HOME', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await expect(brief(page).locator('.hb-next')).toHaveText('Next · Warm-Up');
  await expect(brief(page).locator('.hb-next-sub')).toHaveText('5 min');
  await expect(brief(page).locator('.hb-tile.next')).toHaveAttribute('data-block', 'warmup');
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="blockprac"][data-block="warmup"]').click();
  await openView(page, 'home');
  await expect(brief(page).locator('.hb-tile[data-block="warmup"]')).toHaveClass(/done/);
  await expect(brief(page).locator('.hb-tile.done')).toHaveCount(1);
  await expect(brief(page).locator('.hb-meta')).toHaveText('1 of 4 · 60 min');
  // Tuesday's Focused block ends with the day's micro-dose (Rhythm).
  await expect(brief(page).locator('.hb-next')).toHaveText('Next · Focused');
  await expect(brief(page).locator('.hb-next-sub')).toHaveText('30 + 5 min · Rhythm');
  await expect(brief(page).locator('.hb-tile.next')).toHaveAttribute('data-block', 'focused');
});

test('Setup phase: Prerequisites and Warm-Up, no minutes', async ({ page }) => {
  await openApp(page);
  expect(await tileTitles(page)).toEqual(['Prerequisites', 'Warm-Up']);
  await expect(brief(page).locator('.hb-min')).toHaveCount(0);
  await expect(brief(page).locator('.hb-meta')).toHaveText('0 of 2');
});

test('Continue session opens DAILY', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await openView(page, 'home');
  await expect(brief(page).locator('.hb-continue')).toHaveText('Continue session');
  await brief(page).locator('.hb-continue').click();
  await expect(page.locator('#panel-daily')).toHaveClass(/active/);
});

test('calendar header as drawn: month title and ‹ ›; Today only while another month is shown', async ({ page }) => {
  await openApp(page, { localState: baseState({ streakDates: ['2026-10-15', '2026-11-09'] }) });
  const nav = home(page).locator('.calendar-header-nav');
  await expect(nav.locator('.cal-title')).toHaveText('November 2026');
  await expect(nav.locator('.cal-title')).toHaveCSS('text-transform', 'uppercase');
  await expect(nav.locator('[data-action="calprev"]')).toHaveAttribute('aria-label', 'Previous month');
  await expect(nav.locator('[data-action="calnext"]')).toHaveAttribute('aria-label', 'Next month');
  await expect(nav.locator('[data-action="caltoday"]')).toBeHidden();
  await nav.locator('[data-action="calprev"]').click();
  await expect(nav.locator('.cal-title')).toHaveText('October 2026');
  await expect(nav.locator('[data-action="caltoday"]')).toBeVisible();
  await nav.locator('[data-action="caltoday"]').click();
  await expect(nav.locator('.cal-title')).toHaveText('November 2026');
  await expect(nav.locator('[data-action="caltoday"]')).toBeHidden();
  await expect(home(page).locator('.home-calendar .cal-panel[data-ym="2026-10"] .s-day')).toHaveCount(42); // whole month
});

test('Today\'s key: the key and style of the day, as on the IMPROV page; it opens IMPROV', async ({ page }) => {
  await openApp(page, { localState: progressState() });
  const card = home(page).locator('.home-key');
  await expect(card.locator('.hk-label')).toHaveText("Today's key");
  const key = await page.locator('#panel-improv .improv-key').textContent();
  const style = await page.locator('#panel-improv .improv-style').textContent();
  await expect(card.locator('.hk-name')).toHaveText(key.replace('#', '♯').replace(/^([A-G])b/, '$1♭'));
  await expect(card.locator('.hk-style')).toHaveText(style);
  await card.locator('.hk-open').click();
  await expect(page.locator('#panel-improv')).toHaveClass(/active/);
});

test('Today\'s key when all 5 Gates are done', async ({ page }) => {
  await openApp(page, { localState: baseState({ improvIndex: 5 }) });
  await expect(home(page).locator('.home-key .hk-name')).toBeVisible();
  await expect(home(page).locator('.home-key .kc-key')).toHaveCount(24);
});

test('the old HOME parts are gone: shortcut buttons, stat row, "Daily Practice System", "Consistency Grid", Today\'s Improv', async ({ page }) => {
  await openApp(page, { localState: progressState() });
  await expect(home(page).locator('.navbtn, .statrow, .stat, .home-session, .home-improv, .home-phone-head')).toHaveCount(0);
  await expect(home(page).getByText('Daily Practice System')).toHaveCount(0);
  await expect(home(page).getByText('Consistency Grid')).toHaveCount(0);
  await expect(home(page).getByText(/You've practiced/)).toHaveCount(0);
  await expect(home(page).locator('.home-progress h3')).toHaveCount(0); // point 13: no "Progress" title
});

test('with the BHGS pack off HOME shows the briefing, the calendar and Today\'s key', async ({ page }) => {
  const monitor = await openApp(page, { bhgsPack: false, localState: baseState({ phaseIndex: 1 }) });
  await expect(home(page).locator('.hb-tile')).toHaveCount(4);
  await expect(brief(page).locator('.hb-next-sub')).toHaveText('5 min');
  await expect(home(page).locator('.home-calendar .s-day').first()).toBeAttached();
  await expect(home(page).locator('.home-key')).toBeAttached();
  await expect(home(page).locator('.home-next, .hn-row')).toHaveCount(0);
  expect(monitor.pageErrors).toEqual([]);
});

test('opening HOME and moving the calendar writes nothing (device or cloud)', async ({ page }) => {
  await openApp(page, { localState: progressState({ streakDates: ['2026-10-20', '2026-11-09'] }) });
  const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  await openView(page, 'daily');
  await openView(page, 'home');
  await home(page).locator('[data-action="calprev"]').click();
  await home(page).locator('[data-action="caltoday"]').click();
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
  expect(await cloudWrites(page)).toEqual([]);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('two columns from 1180 px: briefing and calendar on the left, Today\'s key on the right', async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 900 }); // slice 4.10o (D169): three columns from 1400 px
    await openApp(page, { localState: progressState() });
    const box = async (sel) => home(page).locator(sel).boundingBox();
    const b = await box('.home-brief'), c = await box('.home-calendar'), k = await box('.home-key');
    expect(c.y).toBeGreaterThan(b.y + b.height - 1);
    expect(Math.abs(c.x - b.x)).toBeLessThan(1);
    expect(k.x).toBeGreaterThan(b.x + b.width);
    expect(Math.abs(k.y - b.y)).toBeLessThan(1);
    expect(Math.round(k.width)).toBe(380);
    await expect(home(page).locator('.home-streak')).toBeHidden(); // D169 point 4: This week carries the streak
    await expect(home(page).locator('.home-progress')).toBeHidden(); // D127: rails in the sidebar only
    await expect(home(page).locator('.home-key .kc-home')).toBeVisible(); // the circle
  });

  test('below 1180 px one column: briefing, key, calendar', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await openApp(page, { localState: progressState() });
    const tops = await page.evaluate(() => ['.home-brief', '.home-key', '.home-calendar']
      .map((s) => document.querySelector('#panel-home ' + s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    const xs = await page.evaluate(() => ['.home-brief', '.home-key', '.home-calendar']
      .map((s) => Math.round(document.querySelector('#panel-home ' + s).getBoundingClientRect().left)));
    expect(new Set(xs).size).toBe(1);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('one column: rails, briefing, key (circle and chords), calendar (whole month)', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const tops = await page.evaluate(() => ['.home-progress', '.home-brief', '.home-key', '.home-calendar']
      .map((s) => document.querySelector('#panel-home ' + s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    await expect(home(page).locator('.home-calendar .cal-panel[data-ym="2026-10"] .s-day')).toHaveCount(42);
    await expect(home(page).locator('.home-streak')).toBeHidden(); // the phone header shows the pill instead
    await expect(home(page).locator('.home-key .kc-home')).toBeVisible(); // slice 4.10m: the circle on the phone too
    await expect(home(page).locator('.home-key .kc-deg')).toHaveCount(7);
    // Continue session sits under the tiles at full width.
    const t = await brief(page).locator('.hb-tiles').boundingBox(), btn = await brief(page).locator('.hb-continue').boundingBox();
    expect(btn.y).toBeGreaterThan(t.y + t.height - 1);
    expect(Math.abs(btn.width - t.width)).toBeLessThan(1);
  });
});
