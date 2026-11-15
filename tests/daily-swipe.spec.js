// Slice 4.7b (I14, D135): swipe sideways between days on DAILY (phone).
// Real touch input through the Chrome DevTools protocol, so the browser's own rules apply (touch-action: pan-y
// keeps vertical scrolling native). A swipe only changes the day being viewed, exactly like tapping a day button:
// it never switches the active session and writes nothing. Fixed clock: Tuesday 2026-11-10 (Lisbon).
const { test, expect } = require('@playwright/test');
const { openApp, openView, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const dayChip = (page, day) => daily(page).locator(`.daypick [data-action="setday"][data-day="${day}"]`);
const shown = async (page) => daily(page).locator('.daypick [aria-pressed="true"]').getAttribute('data-day');
const rawLocal = (page) => page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'));
const isPhone = (testInfo) => testInfo.project.name === 'mobile';
const state = () => baseState({ phaseIndex: 1, practiced: { 'warmup.Tue': true }, streakDates: ['2026-11-10'] });

// A touch drag over the session area: dx / dy in px, over `ms` milliseconds.
async function swipe(page, { dx = 0, dy = 0, ms = 250, steps = 10, from = '.daily-swipe .blk >> nth=1', path = null, x = null } = {}) {
  const box = await daily(page).locator(from).boundingBox();
  const x0 = x !== null ? x : Math.round(box.x + box.width / 2), y0 = Math.round(box.y + Math.min(box.height / 2, 60));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  const pts = path || Array.from({ length: steps }, (_, k) => [(dx * (k + 1)) / steps, (dy * (k + 1)) / steps]);
  for (const [px, py] of pts) {
    await page.waitForTimeout(ms / pts.length);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + px, y: y0 + py }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  await page.waitForTimeout(450); // slide out + slide in
}

test.describe('phone', () => {
  test.beforeEach(async ({}, testInfo) => { test.skip(!isPhone(testInfo), 'phone only'); });

  test('swipe left shows the next day, swipe right the previous one', async ({ page }) => {
    const monitor = await openApp(page, { localState: state() });
    await openView(page, 'daily');
    expect(await shown(page)).toBe('Tue');
    await swipe(page, { dx: -220 });
    expect(await shown(page)).toBe('Wed');
    await expect(daily(page).locator('.page-eyebrow')).toHaveText('Wednesday · Beginner');
    await swipe(page, { dx: 220 });
    await swipe(page, { dx: 220 });
    expect(await shown(page)).toBe('Mon');
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('a short slow drag springs back and leaves no inline style', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await swipe(page, { dx: -40, ms: 600 });
    expect(await shown(page)).toBe('Tue');
    await expect(daily(page).locator('.daily-swipe')).not.toHaveAttribute('style', /.*/);
  });

  test('a quick flick is enough', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await swipe(page, { dx: -85, ms: 0, steps: 1 }); // under a quarter of the width (~95 px), so only the flick speed counts
    expect(await shown(page)).toBe('Wed');
  });

  test('stops at Monday and Sunday (no wrap-around)', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await dayChip(page, 'Sun').click();
    await swipe(page, { dx: -240 });
    expect(await shown(page)).toBe('Sun');
    await dayChip(page, 'Mon').click();
    await swipe(page, { dx: 240 });
    expect(await shown(page)).toBe('Mon');
  });

  test('vertical scrolling still scrolls the page and does not change the day', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const top = () => page.locator('#panel-daily').evaluate((el) => el.scrollTop);
    const before = await top();
    await swipe(page, { dx: 30, dy: -220 });
    expect(await shown(page)).toBe('Tue');
    expect(await top()).toBeGreaterThan(before + 50);
  });

  test('pinch-zoom stays allowed on the session (touch-action pan-y pinch-zoom)', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const ta = await daily(page).locator('.daily-swipe').evaluate((el) => getComputedStyle(el).touchAction);
    expect(ta).toContain('pan-y');
    expect(ta).toContain('pinch-zoom');
  });

  test('dragging out then flicking back cancels the swipe', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await swipe(page, { ms: 700, path: [[-30, 0], [-60, 0], [-90, 0], [-110, 0], [-120, 0], [-120, 0], [-60, 0], [-40, 0]] });
    expect(await shown(page)).toBe('Tue');
  });

  test('a swipe starting at the very edge of the screen is left to the system', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await swipe(page, { dx: 220, x: 8 });
    expect(await shown(page)).toBe('Tue');
  });

  test('after a swipe the new session has no inline style and no animation class left', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await swipe(page, { dx: -220 });
    await expect(daily(page).locator('.daily-swipe')).not.toHaveAttribute('style', /.*/);
    await expect(daily(page).locator('.daily-swipe')).not.toHaveClass(/swipe-in/);
  });

  test('a swipe only views another day: the active session stays and nothing is written', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const before = await rawLocal(page);
    await swipe(page, { dx: -220 });
    await swipe(page, { dx: -220 });
    expect(await shown(page)).toBe('Thu');
    await expect(daily(page).locator('.note.daily-ro')).toContainText('Suggested practice session is Tuesday.');
    await expect(daily(page).locator('button.blkcheck.ro')).toHaveCount(4);
    expect(await rawLocal(page)).toBe(before);
    // Back to today: the session is editable again.
    await swipe(page, { dx: 220 });
    await swipe(page, { dx: 220 });
    expect(await shown(page)).toBe('Tue');
    await expect(daily(page).locator('button.blkcheck.ro')).toHaveCount(0);
  });

  test('a swipe that starts on a button never presses it', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const before = await rawLocal(page);
    await swipe(page, { dx: -220, from: 'button.blkcheck[data-block="focused"]' });
    expect(await shown(page)).toBe('Wed');
    expect(await rawLocal(page)).toBe(before);
  });

  test('with "reduce motion" the day changes without the slide', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await swipe(page, { dx: -220 });
    expect(await shown(page)).toBe('Wed');
    await expect(daily(page).locator('.daily-swipe')).not.toHaveClass(/swipe-in/);
  });
});

test('desktop: dragging with the mouse does not change the day', async ({ page }, testInfo) => {
  test.skip(isPhone(testInfo), 'desktop only');
  await openApp(page, { localState: state() });
  await openView(page, 'daily');
  const box = await daily(page).locator('.daily-swipe .blk').nth(3).boundingBox();
  await page.mouse.move(box.x + box.width - 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 20, box.y + 20, { steps: 10 });
  await page.mouse.up();
  expect(await shown(page)).toBe('Tue');
});
