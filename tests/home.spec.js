// Slice 4.5c (DECISIONS D117 point 2, D124 point 3, D127 point 2, D129): HOME as drawn on the 4.0 canvas.
// Streak in the header; Today's session read-only (DAILY stays the only place to tick); the calendar header as drawn
// (month title, ‹ ›, Today only on another month); Today's Improv (current Gate and the key of the day);
// two columns on desktop; the shortcut buttons, stat row and "Consistency Grid" card are gone.
// Firebase is stubbed; the clock is fixed at Tuesday 10 Nov 2026; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, cloudWrites, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { baseState, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const session = (page) => home(page).locator('.home-session');
const rowTitles = (page) => session(page).locator('.hs-title').allTextContents();

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

test('Today\'s session lists today\'s DAILY blocks with their minutes; nothing can be ticked on HOME', async ({ page }) => {
  const monitor = await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  expect(await rowTitles(page)).toEqual(['Warm-Up', 'Focused', 'Improv & Expression', 'Cool-Down']);
  expect(await session(page).locator('.hs-min').allTextContents()).toEqual(['5′', '35′', '15′', '5′']);
  await expect(session(page).locator('.home-card-meta')).toHaveText('0 of 4 · 60 min');
  await expect(home(page).locator('[data-action="blockprac"], [data-toggle]')).toHaveCount(0);
  // The same blocks, in the same order, as the DAILY page.
  await openView(page, 'daily');
  const daily = await page.locator('#panel-daily .blk > .top > .nm').allTextContents();
  expect(daily.map((t) => t.trim().toLowerCase())).toEqual((await rowTitles(page)).map((t) => t.toLowerCase()));
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('a block ticked in DAILY shows as done on HOME', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="blockprac"][data-block="warmup"]').click();
  await openView(page, 'home');
  await expect(session(page).locator('.hs-row[data-block="warmup"]')).toHaveClass(/done/);
  await expect(session(page).locator('.hs-row[data-block="warmup"] .hs-box.on svg')).toHaveCount(1);
  await expect(session(page).locator('.hs-row.done')).toHaveCount(1);
  await expect(session(page).locator('.home-card-meta')).toHaveText('1 of 4 · 60 min');
});

test('Setup phase: Prerequisites and Warm-Up, no minutes', async ({ page }) => {
  await openApp(page);
  expect(await rowTitles(page)).toEqual(['Prerequisites', 'Warm-Up']);
  await expect(session(page).locator('.home-card-meta')).toHaveText('0 of 2');
});

test('Continue session opens DAILY', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await openView(page, 'home');
  await session(page).locator('.home-continue').click();
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

test('Today\'s Improv: the current Gate and the key of the day, as on the IMPROV page; it opens IMPROV', async ({ page }) => {
  await openApp(page, { localState: progressState() }); // improvIndex 1 → Gate 2
  const card = home(page).locator('.home-improv');
  await expect(card.locator('.home-link-label')).toHaveText("Today's Improv");
  const gateOnImprov = await page.locator('#panel-improv .improv-gate-title').textContent(); // slice 4.8c: "Gate 2 · …"
  await expect(card.locator('.home-link-title')).toHaveText(gateOnImprov);
  const key = await page.locator('#panel-improv .improv-key').textContent();
  const style = await page.locator('#panel-improv .improv-style').textContent();
  await expect(card.locator('.home-link-sub')).toHaveText(`Today's key: ${key} (${style})`);
  await card.click();
  await expect(page.locator('#panel-improv')).toHaveClass(/active/);
});

test('Today\'s Improv when all 5 Gates are done', async ({ page }) => {
  await openApp(page, { localState: baseState({ improvIndex: 5 }) });
  await expect(home(page).locator('.home-improv .home-link-title')).toHaveText('All 5 Gates complete');
  await expect(home(page).locator('.home-improv .home-link-sub')).toHaveCount(0);
});

test('the old HOME parts are gone: shortcut buttons, stat row, "Daily Practice System", "Consistency Grid"', async ({ page }) => {
  await openApp(page, { localState: progressState() });
  await expect(home(page).locator('.navbtn, .statrow, .stat')).toHaveCount(0);
  await expect(home(page).getByText('Daily Practice System')).toHaveCount(0);
  await expect(home(page).getByText('Consistency Grid')).toHaveCount(0);
  await expect(home(page).getByText(/You've practiced/)).toHaveCount(0);
});

test('with the BHGS pack off HOME shows the session, calendar and Today\'s Improv', async ({ page }) => {
  const monitor = await openApp(page, { bhgsPack: false, localState: baseState({ phaseIndex: 1 }) });
  await expect(home(page).locator('.home-session .hs-row')).toHaveCount(4);
  await expect(home(page).locator('.home-calendar .s-day').first()).toBeAttached();
  await expect(home(page).locator('.home-improv')).toBeAttached();
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

  test('two columns: session and calendar on the left, Today\'s Improv on the right; the header shows the streak', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const box = async (sel) => home(page).locator(sel).boundingBox();
    const s = await box('.home-session'), c = await box('.home-calendar'), i = await box('.home-improv');
    expect(c.y).toBeGreaterThan(s.y);
    expect(Math.abs(c.x - s.x)).toBeLessThan(1);
    expect(i.x).toBeGreaterThan(s.x + s.width);
    expect(Math.abs(i.y - s.y)).toBeLessThan(1);
    await expect(home(page).locator('.home-streak')).toBeVisible();
    await expect(home(page).locator('.home-progress')).toBeHidden(); // D127: rails in the sidebar only
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('one column: rails, session, calendar (whole month), then Today\'s Improv', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const tops = await page.evaluate(() => ['.home-progress', '.home-session', '.home-calendar', '.home-improv']
      .map((s) => document.querySelector('#panel-home ' + s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    await expect(home(page).locator('.home-calendar .cal-panel[data-ym="2026-10"] .s-day')).toHaveCount(42);
    await expect(home(page).locator('.home-streak')).toBeHidden(); // the phone header shows the pill instead
  });
});
