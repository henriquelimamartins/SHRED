// Slice 4.10f (DECISIONS D152 point 5, D154 point 2): the HOME calendar as the 4.10 canvas board Calendar.
// Practised weekday green, practised weekend a darker green, a practised day of another month the darkest with a
// dimmed number; weekend cells slightly different; the weekday name inside each cell (no row of names above); no
// month tag inside a cell; month white, year red. Tapping the title opens a month picker: the year in red, 12 months,
// only the months from the first logged month to the current one selectable, the current month marked; no bottom
// line and no Today button inside the picker (point 29, D159: Today stays in the calendar header). Real values only (D71); the picker is page state, nothing is written. Fixed clock: Tue 2026-11-10, Lisbon.
const { test, expect } = require('@playwright/test');
const { openApp, settle, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const title = (page) => home(page).locator('.cal-title');
const pickBtn = (page) => home(page).locator('.cal-pick');
const picker = (page) => home(page).locator('.cal-picker');
const month = (page, name) => picker(page).locator('.cal-picker-month', { hasText: new RegExp(`^${name}$`) });
const cell = (page, y, m, date, other = false) => home(page)
  .locator(`.cal-panel[data-ym="${y}-${m}"] .s-day${other ? '.other-month' : ':not(.other-month)'}`)
  .filter({ has: page.locator('.s-date', { hasText: new RegExp(`^${date}$`) }) });
const colours = (loc) => loc.evaluate((el) => {
  const cs = getComputedStyle(el);
  return { bg: cs.backgroundColor, line: cs.borderTopColor, num: getComputedStyle(el.querySelector('.s-date')).color, day: getComputedStyle(el.querySelector('.s-wkd')).color };
});
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const titleText = async (page) => [await page.locator('#cal-month-title').textContent(), await page.locator('#cal-year-title').textContent()];

// Practised: Mon 27 Oct, Sat 31 Oct (November panel: another month), Mon 2 Nov, Sat 7 Nov, Mon 9 Nov; first log 14 Sep.
const logged = () => baseState({ streakDates: ['2026-09-14', '2026-10-27', '2026-10-31', '2026-11-02', '2026-11-07', '2026-11-09'] });

test.describe('calendar shades and cells', () => {
  test('practised weekday, weekend and another month get the drawn shades', async ({ page }) => {
    await openApp(page, { localState: logged() });
    expect(await colours(cell(page, 2026, 10, 2))).toEqual({ bg: rgb('#1D4A2A'), line: rgb('#3E8A50'), num: rgb('#A6E2B2'), day: rgb('#86D294') });
    expect(await colours(cell(page, 2026, 10, 7))).toEqual({ bg: rgb('#13301C'), line: rgb('#2B6638'), num: rgb('#86D294'), day: rgb('#86D294') });
    // 27 Oct (Mon) and 31 Oct (Sat) in the November panel: the darkest, number dimmed, weekend or not.
    for (const d of [27, 31]) {
      expect(await colours(cell(page, 2026, 10, d, true))).toEqual({ bg: rgb('#102017'), line: rgb('#1E3C27'), num: rgb('#5E9A6B'), day: rgb('#5E9A6B') });
    }
  });

  test('days not practised: weekends slightly different, other months dimmed, future numbers muted, today red', async ({ page }) => {
    await openApp(page, { localState: logged() });
    const weekday = await colours(cell(page, 2026, 10, 5));
    const weekend = await colours(cell(page, 2026, 10, 8));
    expect(weekday).toEqual({ bg: rgb('#1A1A1F'), line: rgb('#26262C'), num: rgb('#F2F2F4'), day: rgb('#A0A0AA') });
    expect(weekend).toEqual({ bg: rgb('#1B1619'), line: rgb('#241D21'), num: rgb('#C4C4CC'), day: rgb('#A0A0AA') });
    expect((await colours(cell(page, 2026, 10, 24))).num).toBe(rgb('#8E8E98')); // future weekday
    expect((await colours(cell(page, 2026, 10, 21))).num).toBe(rgb('#8E8E98')); // future weekend
    expect(await colours(cell(page, 2026, 10, 29, true))).toEqual({ bg: rgb('#121215'), line: rgb('#1A1A1F'), num: rgb('#55555E'), day: rgb('#A0A0AA') });
    const today = await colours(cell(page, 2026, 10, 10));
    expect(today.line).toBe(rgb('#E5484D'));
    expect(today.num).toBe(rgb('#FF5C61'));
    // No cell is faded with opacity any more (the shade carries the meaning).
    const faded = await home(page).locator('.s-day').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    expect(faded).toBe(0);
  });

  test('the weekday name is inside each cell, with no row of names above and no month tag', async ({ page }) => {
    await openApp(page, { localState: logged() });
    const nov = home(page).locator('.cal-panel[data-ym="2026-10"] .s-day');
    await expect(nov).toHaveCount(42);
    expect(await nov.locator('.s-wkd').allTextContents()).toEqual(Array.from({ length: 42 }, (_, i) => ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i % 7]));
    await expect(home(page).locator('.s-month-badge')).toHaveCount(0);
    await expect(nov.first()).toHaveText('26MON');
    // Nothing between the header and the grid.
    const grid = home(page).locator('.cal-panel[data-ym="2026-10"] .streak-grid');
    await expect(grid.locator('> :not(.s-day)')).toHaveCount(0);
  });

  test('cells are 50 px tall on the desktop and 44 px on the phone', async ({ page, isMobile }) => {
    await openApp(page, { localState: logged() });
    const h = await cell(page, 2026, 10, 2).evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(h).toBe(isMobile ? 44 : 50);
  });

  test('month white, year red', async ({ page }) => {
    await openApp(page, { localState: logged() });
    await expect(title(page)).toHaveText('November 2026');
    await expect(page.locator('#cal-month-title')).toHaveCSS('color', rgb('#F2F2F4'));
    await expect(page.locator('#cal-year-title')).toHaveCSS('color', rgb('#E5484D'));
  });
});

test.describe('month picker', () => {
  test('tapping the title opens the picker: year in red, 12 months, only logged months to now, current marked', async ({ page }, testInfo) => {
    await openApp(page, { localState: logged() });
    await expect(pickBtn(page)).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(pickBtn(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(picker(page)).toHaveCount(0);
    await pickBtn(page).click();
    await expect(pickBtn(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(picker(page)).toBeVisible();
    await expect(picker(page)).toHaveAttribute('role', 'dialog');
    await expect(picker(page).locator('.cal-picker-year')).toHaveText('2026');
    await expect(picker(page).locator('.cal-picker-year')).toHaveCSS('color', rgb('#E5484D'));
    const months = picker(page).locator('.cal-picker-month');
    await expect(months).toHaveText(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']);
    const enabled = await months.evaluateAll((els) => els.filter((e) => !e.disabled).map((e) => e.textContent));
    expect(enabled).toEqual(['SEP', 'OCT', 'NOV']);
    await expect(picker(page).locator('[aria-current="date"]')).toHaveText('NOV');
    await expect(month(page, 'NOV')).toHaveCSS('border-top-color', rgb('#E5484D'));
    // One year of practice: the year arrows stay off.
    await expect(picker(page).locator('[aria-label="Previous year"]')).toBeDisabled();
    await expect(picker(page).locator('[aria-label="Next year"]')).toBeDisabled();
    // Point 29 (D159): no bottom line and no Today button inside the picker; months off say why.
    await expect(picker(page).getByText(/Months with practice/)).toHaveCount(0);
    await expect(picker(page).getByRole('button', { name: 'Today' })).toHaveCount(0);
    await expect(picker(page).locator('button')).toHaveCount(14);
    await expect(month(page, 'AUG')).toHaveAccessibleName('August 2026, before the calendar starts');
    await expect(month(page, 'DEC')).toHaveAccessibleName('December 2026, not reached yet');
    await expect(month(page, 'OCT')).toHaveAccessibleName('October 2026');
    // Keyboard focus goes into the picker, on the month on screen.
    await expect(month(page, 'NOV')).toBeFocused();
    await home(page).locator('.home-calendar').screenshot({ path: testInfo.outputPath('calendar-picker.png') });
  });

  test('choosing a month shows it and closes the picker; the header Today comes back', async ({ page }) => {
    await openApp(page, { localState: logged() });
    await pickBtn(page).click();
    await month(page, 'SEP').click();
    await expect(picker(page)).toHaveCount(0);
    expect(await titleText(page)).toEqual(['September', '2026']);
    await expect(pickBtn(page)).toBeFocused();
    // The carousel shows September and its cells.
    const shown = await home(page).locator('#cal-carousel').evaluate((el) => {
      const r = el.getBoundingClientRect();
      const p = [...el.querySelectorAll('.cal-panel')].find((x) => Math.abs(x.getBoundingClientRect().left - r.left) < 2);
      return p && p.dataset.ym;
    });
    expect(shown).toBe('2026-8');
    await expect(home(page).locator('[data-action="calprev"]')).toBeDisabled();
    await expect(home(page).locator('[data-action="caltoday"]')).toBeVisible();
    // The month on screen is outlined the next time the picker opens.
    await pickBtn(page).click();
    await expect(month(page, 'SEP')).toHaveAttribute('aria-pressed', 'true');
    // The header Today closes the picker (a tap outside it) and goes back to the current month.
    await home(page).locator('[data-action="caltoday"]').click();
    await expect(picker(page)).toHaveCount(0);
    expect(await titleText(page)).toEqual(['November', '2026']);
    await expect(home(page).locator('[data-action="caltoday"]')).toBeHidden();
  });

  test('months outside the logged range cannot be chosen', async ({ page }) => {
    await openApp(page, { localState: logged() });
    await pickBtn(page).click();
    await month(page, 'AUG').click({ force: true });
    await month(page, 'DEC').click({ force: true });
    await expect(picker(page)).toBeVisible();
    expect(await titleText(page)).toEqual(['November', '2026']);
  });

  test('the year arrows move across years with practice', async ({ page }) => {
    await openApp(page, {
      now: '2027-02-10T12:00:00Z',
      localState: baseState({ practicedDate: '2027-02-10', streakDates: ['2026-11-20', '2027-01-04'] }),
    });
    await pickBtn(page).click();
    await expect(picker(page).locator('.cal-picker-year')).toHaveText('2027');
    await expect(picker(page).locator('[aria-label="Next year"]')).toBeDisabled();
    let enabled = await picker(page).locator('.cal-picker-month').evaluateAll((els) => els.filter((e) => !e.disabled).map((e) => e.textContent));
    expect(enabled).toEqual(['JAN', 'FEB']);
    await picker(page).locator('[aria-label="Previous year"]').click();
    await expect(picker(page).locator('.cal-picker-year')).toHaveText('2026');
    await expect(picker(page).locator('[aria-label="Previous year"]')).toBeDisabled();
    enabled = await picker(page).locator('.cal-picker-month').evaluateAll((els) => els.filter((e) => !e.disabled).map((e) => e.textContent));
    expect(enabled).toEqual(['NOV', 'DEC']);
    await expect(picker(page).locator('[aria-current="date"]')).toHaveCount(0);
    await month(page, 'NOV').click();
    expect(await titleText(page)).toEqual(['November', '2026']);
  });

  test('with nothing logged only the current month can be chosen', async ({ page }) => {
    await openApp(page, { localState: baseState({ streakDates: [] }) });
    await pickBtn(page).click();
    const enabled = await picker(page).locator('.cal-picker-month').evaluateAll((els) => els.filter((e) => !e.disabled).map((e) => e.textContent));
    expect(enabled).toEqual(['NOV']);
  });

  test('Escape, the title again or a tap outside close the picker', async ({ page }) => {
    await openApp(page, { localState: logged() });
    await pickBtn(page).click();
    await page.keyboard.press('Escape');
    await expect(picker(page)).toHaveCount(0);
    await expect(pickBtn(page)).toBeFocused();
    await expect(pickBtn(page)).toHaveAttribute('aria-expanded', 'false');
    await pickBtn(page).click();
    await pickBtn(page).click();
    await expect(picker(page)).toHaveCount(0);
    await pickBtn(page).click();
    await home(page).locator('.home-brief').first().click({ position: { x: 5, y: 5 } }); // slice 4.10j: the briefing card
    await expect(picker(page)).toHaveCount(0);
    expect(await titleText(page)).toEqual(['November', '2026']);
  });

  test('the picker fits the screen and its buttons are easy to tap', async ({ page, isMobile }) => {
    await openApp(page, { localState: logged() });
    await pickBtn(page).click();
    const vw = await page.evaluate(() => window.innerWidth);
    const r = await picker(page).evaluate((el) => { const b = el.getBoundingClientRect(); return { left: b.left, right: b.right }; });
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(vw);
    const min = isMobile ? 44 : 34;
    const sizes = await picker(page).locator('button').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(min);
    const monthSizes = await picker(page).locator('.cal-picker-month').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    for (const s of monthSizes) expect(s).toBeGreaterThanOrEqual(44);
  });

  test('using the picker writes nothing (device or cloud) and logs no error', async ({ page }) => {
    const monitor = await openApp(page, { localState: logged() });
    const before = await localSaved(page);
    await pickBtn(page).click();
    await month(page, 'OCT').click();
    await pickBtn(page).click();
    await month(page, 'NOV').click();
    await settle(page);
    expect(await localSaved(page)).toEqual(before);
    expect(await cloudWrites(page)).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });
});
