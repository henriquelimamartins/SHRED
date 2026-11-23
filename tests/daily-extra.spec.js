// Slice 4.10l (D154 point 3, AUDIT-4.10 point 19): the optional extra Improv review on Mon, Thu and Sat, after the
// last block. Collapsed by default, outside the session minutes, the count and the blocks (no Practiced tick), it
// never moves the review queue and never shows the exercise the next review will take. Nothing is written.
// The clock is fixed at Tuesday 2026-11-10 (key of the day C# minor, box 5). Phase 1 (Beginner) in every test.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, settle, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const extra = (page) => daily(page).locator('.daily-extra');
const extraSummary = (page) => daily(page).locator('.daily-extra > summary'); // the block's own summary, not the nested ones
const extraNames = (page) => extra(page).locator('.daily-review-name b').allInnerTexts();
const nbsp = (t) => t.replace(/ /g, ' ');
const state = (o = {}) => baseState({ phaseIndex: 1, ...o });
const mastered = (...keys) => Object.fromEntries(keys.map((k) => [k, true]));

async function showDay(page, day) {
  await daily(page).locator(`[data-action="setday"][data-day="${day}"]`).click();
  await settle(page);
}

test('Mon, Thu and Sat show the optional block once, collapsed; Tue, Wed, Fri and Sun show none', async ({ page }) => {
  const monitor = await openApp(page, { localState: state({ improvChecks: mastered('g0e1') }) });
  await openView(page, 'daily');
  await expect(extra(page)).toHaveCount(0); // Tuesday
  for (const day of ['Wed', 'Fri', 'Sun']) {
    await showDay(page, day);
    await expect(extra(page), day).toHaveCount(0);
  }
  for (const day of ['Mon', 'Thu', 'Sat']) {
    await showDay(page, day);
    await expect(extra(page), day).toHaveCount(1);
    await expect(extraSummary(page).locator('.daily-extra-title'), day).toHaveText('Extra time · Improv review');
    await expect(extraSummary(page).locator('.daily-extra-tag')).toHaveText('Optional');
    await expect(extraSummary(page).locator('.daily-extra-min')).toHaveText('10 min'); // one exercise + 5 min free jam
    await expect(extra(page)).not.toHaveAttribute('open', '');
    await expect(extra(page).locator('.daily-extra-lede')).toBeHidden();
  }
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('Monday with nothing Mastered: the free jam line, 10 min, in the key of the day and its box', async ({ page }) => {
  await openApp(page, { localState: state() });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await extraSummary(page).click();
  await expect(extra(page).locator('.daily-extra-lede')).toHaveText(
    "Only if you have spare time. Not part of today's session; it does not count for the streak or the full session.");
  await expect(extra(page).locator('.daily-extra-jam')).toHaveText(
    nbsp('Nothing to review yet: free jam in C# minor, box 5, 10 min.'));
  await expect(extra(page).locator('.daily-review-ex')).toHaveCount(0);
  await expect(extra(page).locator('.daily-extra-tip').last()).toHaveText('After the extra time, stretch your hands and forearms for a minute.');
});

test('Monday with one Mastered exercise: that one (noted to come back), then 5 min free jam; no combining tip', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e1') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await extraSummary(page).click();
  await expect(extra(page).locator('.daily-review-ex')).toHaveCount(1);
  await expect(extra(page).locator('.daily-review-name')).toHaveText(['The 4-Fret Box · Gate 1']);
  await expect(extra(page).locator('.daily-extra-help')).toHaveText("5 min, from memory, in today's key (C# minor). Then open it to check.");
  await expect(extra(page).locator('.daily-extra-jam')).toHaveText(nbsp('Then 5 min free jam in C# minor, box 5.'));
  await expect(extra(page).locator('.daily-extra-tip', { hasText: 'Optional, 3–5 min' })).toHaveCount(0);
  // The only exercise is also tomorrow's pick, so it is shown with the note (D154: the excluded ones fill in).
  await expect(extra(page).getByText('Also coming up in your next Review.')).toHaveCount(1);
});

test('Monday with two Mastered: both are excluded by the next three positions, so both are noted as coming up next', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await extraSummary(page).click();
  await expect(extra(page).locator('.daily-review-ex')).toHaveCount(2);
  await expect(extra(page).getByText('Also coming up in your next Review.')).toHaveCount(2);
  await expect(extra(page).locator('.daily-extra-tip', { hasText: 'Optional, 3–5 min: play both together' })).toHaveCount(1);
  await expect(extra(page).locator('.daily-extra-jam')).toHaveCount(0);
});

test('Monday with five Mastered: two fresh exercises, none of them the one Tuesday will review next', async ({ page }) => {
  // Gate 1 has four exercises; g1e0 is the first of Gate 2. Tuesday (the clock) reviews queue position 0.
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1', 'g0e2', 'g0e3', 'g1e0') }) });
  await openView(page, 'daily');
  const tuesday = await daily(page).locator('.daily-review-name b').allInnerTexts();
  expect(tuesday).toHaveLength(1);
  await showDay(page, 'Mon');
  await extraSummary(page).click();
  const picks = await extraNames(page);
  expect(picks).toHaveLength(2);
  expect(picks.filter((n) => tuesday.includes(n))).toEqual([]);
  await expect(extra(page).locator('.daily-extra-help')).toHaveText("5 min each, from memory, in today's key (C# minor). Then open each to check.");
  await expect(extraSummary(page).locator('.daily-extra-min')).toHaveText('10–15 min');
  await expect(extra(page).getByText('Also coming up in your next Review.')).toHaveCount(0);
  await expect(extra(page).locator('.daily-extra-tip', { hasText: 'Optional, 3–5 min' })).toHaveCount(1);
});

test('Thursday follows the same rules; Saturday has no tip about combining and comes after its Casual block', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1', 'g0e2', 'g0e3', 'g1e0') }) });
  await openView(page, 'daily');
  await showDay(page, 'Thu');
  await expect(extra(page).locator('.daily-review-ex')).toHaveCount(2);
  await expect(extra(page).locator('.daily-extra-tip', { hasText: 'stretch your hands' })).toHaveCount(1);
  await showDay(page, 'Sat');
  await extraSummary(page).click();
  await expect(extra(page).locator('.daily-review-ex')).toHaveCount(2);
  await expect(extra(page).locator('.daily-extra-tip', { hasText: 'Optional, 3–5 min' })).toHaveCount(0);
  await expect(extra(page).locator('.daily-extra-tip', { hasText: 'stretch your hands' })).toHaveCount(0);
  await expect(extraSummary(page).locator('.daily-extra-min')).toHaveText('10 min');
  const prev = await extra(page).evaluate((el) => el.previousElementSibling && el.previousElementSibling.className);
  expect(prev).toContain('blk');
  expect(await daily(page).locator('.blk').last().locator('.nm').textContent()).toBe('CASUAL'); // the Saturday title is written in capitals
});

test('the block sits after the session, outside the blocks: four blocks on Monday, unchanged minutes and Practiced ticks', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1', 'g0e2', 'g0e3', 'g1e0') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await expect(daily(page).locator('.blk')).toHaveCount(4);
  await expect(daily(page).locator('.blk .blkcheck')).toHaveCount(4);
  await expect(daily(page).locator('.blk .min')).toHaveText(['5 min', '30 + 5 min', '15 min', '5 min']);
  const after = await extra(page).evaluate((el) => el.previousElementSibling.querySelector('.nm').textContent);
  expect(after).toBe('Cool-Down');
  await expect(daily(page).locator('.daily-micro')).toHaveCount(1);
});

test('opening it writes nothing, signed out or signed in', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await extraSummary(page).click();
  await extra(page).locator('.daily-review-more summary').first().click();
  await extraSummary(page).click();
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});

test('layout: no inline style, a 44 px tap target for the summary, no sideways overflow', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e1') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await expect(daily(page).locator('[style]')).toHaveCount(0);
  const box = await extraSummary(page).boundingBox();
  expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('HOME does not mention the extra block', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1', 'g0e2', 'g0e3', 'g1e0') }) });
  await openView(page, 'home');
  await expect(page.locator('#panel-home')).not.toContainText('Extra time');
  await expect(page.locator('#panel-home')).not.toContainText('Improv review');
});

test('Phase 0 has no Improv block and no extra block, even on Monday', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 0, improvChecks: mastered('g0e0', 'g0e1') }) });
  await openView(page, 'daily');
  for (const day of ['Mon', 'Thu', 'Sat']) {
    await showDay(page, day);
    await expect(extra(page), day).toHaveCount(0);
  }
});
