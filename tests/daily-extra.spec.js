// Slice 4.10l (D154 point 3, AUDIT-4.10 point 19): the optional extra Improv review on Mon, Thu and Sat. Collapsed by
// default, outside the session minutes, the count and the blocks (no Practiced tick), it never moves the review queue
// and never shows the exercise the next review will take. Nothing is written.
// Slice 4.10m (D167): rewritten for the "Bonus round" card (tiles instead of paragraphs), its place before Cool-Down on
// Mon and Thu (Sat: after Casual), and the owner's 4.10l choices built now: the stretch line on all three days,
// "over a drone or any track", "If they clash, alternate them every phrase." and, on Thursday with at least 8
// Mastered, Sunday's last pick left out too. The texts changed on purpose (D107 point 4).
// The clock is fixed at Tuesday 2026-11-10 (key of the day C# minor, box 5) unless a test sets it. Phase 1 (Beginner).
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, settle, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const extra = (page) => daily(page).locator('.daily-extra');
const extraSummary = (page) => daily(page).locator('.daily-extra > summary'); // the card's own summary, not the nested ones
const extraNames = (page) => extra(page).locator('.dx-ex .dx-name').allInnerTexts();
const nbsp = (t) => t.replace(/ /g, ' ');
const state = (o = {}) => baseState({ phaseIndex: 1, ...o });
const mastered = (...keys) => Object.fromEntries(keys.map((k) => [k, true]));
const FIVE = ['g0e0', 'g0e1', 'g0e2', 'g0e3', 'g1e0'];

async function showDay(page, day) {
  await daily(page).locator(`[data-action="setday"][data-day="${day}"]`).click();
  await settle(page);
}

test('Mon, Thu and Sat show the optional card once, collapsed; Tue, Wed, Fri and Sun show none', async ({ page }) => {
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
    await expect(extraSummary(page).locator('.daily-extra-title'), day).toHaveText('Extra time');
    await expect(extraSummary(page).locator('.daily-extra-tag')).toHaveText('Optional');
    await expect(extraSummary(page).locator('.dx-sub-closed')).toHaveText(nbsp('Bonus round · 1 exercise + free jam · 10 min'));
    await expect(extraSummary(page).locator('.dx-bolt')).toHaveCount(1);
    await expect(extra(page)).not.toHaveAttribute('open', '');
    await expect(extra(page).locator('.dx-tiles')).toBeHidden();
  }
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('Monday with nothing Mastered: one line with the free jam in the key of the day and its box; nothing to open', async ({ page }) => {
  await openApp(page, { localState: state() });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await expect(extra(page)).toHaveClass(/dx-static/);
  await expect(extra(page).locator('summary, details, button')).toHaveCount(0);
  await expect(extra(page).locator('.daily-extra-title')).toHaveText('Extra time');
  await expect(extra(page).locator('.dx-sub')).toHaveText(nbsp('Free jam · C# minor · box 5 · 10 min'));
  await expect(extra(page)).toHaveAttribute('aria-label', 'Extra time, optional');
});

test('Monday with one Mastered exercise: its tile (also in the next Review) and a Free jam tile; no Combo', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e1') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await extraSummary(page).click();
  await expect(extraSummary(page).locator('.dx-sub-open')).toHaveText(nbsp('In C# minor, from memory, over a drone or any track'));
  await expect(extraSummary(page).locator('.dx-sub-closed')).toBeHidden();
  await expect(extra(page).locator('.dx-ex')).toHaveCount(1);
  await expect(extra(page).locator('.dx-ex .dx-name')).toHaveText(['The 4-Fret Box']);
  await expect(extra(page).locator('.dx-ex .dx-tag')).toHaveText(nbsp('01 · Gate 1Next Review too'));
  await expect(extra(page).locator('.dx-ex .dx-min')).toHaveText(nbsp('5 min'));
  await expect(extra(page).locator('.dx-jam .dx-name')).toHaveText('Free jam');
  await expect(extra(page).locator('.dx-jam .dx-min')).toHaveText(nbsp('5 min'));
  await expect(extra(page).locator('.dx-jam .dx-note')).toHaveText(nbsp('C# minor · box 5'));
  await expect(extra(page).locator('.dx-combo')).toHaveCount(0);
});

test('Monday with two Mastered: both are in the next three positions, so both are tagged; a Combo tile with its hint', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered('g0e0', 'g0e1') }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await expect(extraSummary(page).locator('.dx-sub-closed')).toHaveText(nbsp('Bonus round · 2 exercises · 10–15 min'));
  await extraSummary(page).click();
  await expect(extra(page).locator('.dx-ex')).toHaveCount(2);
  await expect(extra(page).locator('.dx-again')).toHaveText(['Next Review too', 'Next Review too']);
  await expect(extra(page).locator('.dx-combo .dx-tag')).toHaveText('+ Combo');
  await expect(extra(page).locator('.dx-combo .dx-name')).toHaveText('Both rules at once');
  await expect(extra(page).locator('.dx-combo .dx-min')).toHaveText(nbsp('3–5 min'));
  await expect(extra(page).locator('.dx-combo .dx-note')).toHaveText('If they clash, alternate them every phrase.');
  await expect(extra(page).locator('.dx-jam')).toHaveCount(0);
});

test('Monday with five Mastered: two fresh exercises, none of them the one Tuesday will review next; Show opens the lines', async ({ page }) => {
  // Gate 1 has four exercises; g1e0 is the first of Gate 2. Tuesday (the clock) reviews queue position 0.
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'daily');
  const tuesday = await daily(page).locator('.daily-review-name b').allInnerTexts();
  expect(tuesday).toHaveLength(1);
  await showDay(page, 'Mon');
  await extraSummary(page).click();
  const picks = await extraNames(page);
  expect(picks).toHaveLength(2);
  expect(picks.filter((n) => tuesday.includes(n))).toEqual([]);
  await expect(extra(page).locator('.dx-again')).toHaveCount(0);
  await expect(extra(page).locator('.dx-ex .dx-tag')).toHaveText([/^01 · Gate/, /^02 · Gate/]);
  // Show opens the exercise's lines with today's values, and the tile then takes the whole row.
  const first = extra(page).locator('.dx-ex').first();
  await first.locator('.dx-more > summary').click();
  await expect(first.locator('.ex-lines')).toBeVisible();
  await expect(first.locator('.daily-review-note')).toBeVisible();
  const w = await extra(page).evaluate((el) => ({ tile: el.querySelector('.dx-ex').getBoundingClientRect().width, row: el.querySelector('.dx-tiles').getBoundingClientRect().width }));
  expect(Math.abs(w.tile - w.row)).toBeLessThan(2);
});

test('the footer: not counted, and the stretch line on Mon, Thu and Sat (owner\'s 4.10l choice)', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'daily');
  for (const day of ['Mon', 'Thu', 'Sat']) {
    await showDay(page, day);
    await extraSummary(page).click();
    await expect(extra(page).locator('.dx-foot span'), day).toHaveText(['Not counted in the session or the streak', 'Stretch your hands and forearms after']);
  }
});

test('Mon and Thu: the card sits before Cool-Down; Sat: after Casual, without a Combo tile', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'daily');
  for (const day of ['Mon', 'Thu']) {
    await showDay(page, day);
    const around = await extra(page).evaluate((el) => [el.previousElementSibling.querySelector('.nm').textContent, el.nextElementSibling.querySelector('.nm').textContent]);
    expect(around, day).toEqual(['Casual', 'Cool-Down']);
  }
  await showDay(page, 'Sat');
  await extraSummary(page).click();
  await expect(extra(page).locator('.dx-ex')).toHaveCount(2);
  await expect(extra(page).locator('.dx-combo')).toHaveCount(0);
  await expect(extraSummary(page).locator('.dx-sub-closed')).toHaveText(nbsp('Bonus round · 2 exercises · 10 min'));
  const prev = await extra(page).evaluate((el) => el.previousElementSibling && el.previousElementSibling.className);
  expect(prev).toContain('blk');
  expect(await extra(page).evaluate((el) => el.nextElementSibling)).toBeNull();
  expect(await daily(page).locator('.blk').last().locator('.nm').textContent()).toBe('CASUAL'); // the Saturday title is written in capitals
});

test('outside the blocks: four blocks on Monday, unchanged minutes and Practiced ticks; Cool-Down still 04', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await expect(daily(page).locator('.blk')).toHaveCount(4);
  await expect(daily(page).locator('.blk .blkcheck')).toHaveCount(4);
  await expect(daily(page).locator('.blk .min')).toHaveText(['5 min', '30 + 5 min', '15 min', '5 min']);
  await expect(daily(page).locator('.blk .blk-num')).toHaveText(['01', '02', '03', '04']);
  await expect(daily(page).locator('.daily-micro')).toHaveCount(1);
});

// Thursday, as the owner chose in 4.10l: with at least 8 Mastered, the extra leaves out Friday's pick and all three of
// Sunday's (below 8, three positions, as Monday). Checked from outside: Thursday's picks against what Friday and Sunday
// really review. The streak is chosen so that the old rule (three positions) would show Sunday's last pick (Slice
// reviewer, 4.10m): with it the old code picks One-String Doom.
const EIGHT = ['g0e0', 'g0e1', 'g0e2', 'g0e3', 'g1e0', 'g1e1', 'g1e2', 'g1e3'];
const THU_STREAK = ['2026-11-06', '2026-11-08', '2026-11-10', '2026-11-11'];
async function reviewOn(page, checks, streak, now) {
  await openApp(page, { localState: state({ improvChecks: mastered(...checks), streakDates: streak }), now });
  await openView(page, 'daily');
  return daily(page).locator('.daily-review-name b').allInnerTexts();
}
test('Thursday with 8 Mastered: none of Friday\'s or Sunday\'s Review exercises comes up', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...EIGHT), streakDates: THU_STREAK }), now: '2026-11-12T12:00:00Z' });
  await openView(page, 'daily');
  await extraSummary(page).click();
  const thu = await extraNames(page);
  expect(thu).toEqual(['Chromatic Enclosures', 'Arpeggio Outlining']);
  await expect(extra(page).locator('.dx-again')).toHaveCount(0);
  const fri = await reviewOn(page, EIGHT, THU_STREAK, '2026-11-13T12:00:00Z');
  const sun = await reviewOn(page, EIGHT, [...THU_STREAK, '2026-11-13'], '2026-11-15T12:00:00Z');
  expect(fri).toHaveLength(1);
  expect(sun).toHaveLength(3);
  expect(thu.filter((n) => fri.includes(n) || sun.includes(n))).toEqual([]);
});

test('Thursday with 7 Mastered: only three positions are left out, so Sunday\'s last pick may come up', async ({ page }) => {
  const seven = EIGHT.slice(0, 7);
  await openApp(page, { localState: state({ improvChecks: mastered(...seven), streakDates: THU_STREAK }), now: '2026-11-12T12:00:00Z' });
  await openView(page, 'daily');
  await extraSummary(page).click();
  const thu = await extraNames(page);
  expect(thu).toHaveLength(2);
  const fri = await reviewOn(page, seven, THU_STREAK, '2026-11-13T12:00:00Z');
  const sun = await reviewOn(page, seven, [...THU_STREAK, '2026-11-13'], '2026-11-15T12:00:00Z');
  // Friday's pick and Sunday's first two are always out; at most Sunday's last pick can be among Thursday's.
  expect(thu.filter((n) => fri.includes(n) || sun.slice(0, 2).includes(n))).toEqual([]);
});

test('opening it writes nothing, signed out or signed in', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await extraSummary(page).click();
  await extra(page).locator('.dx-more summary').first().click();
  await extraSummary(page).click();
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});

test('layout: no inline style, a 44 px tap target for the card head and for Show, no sideways overflow', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'daily');
  await showDay(page, 'Mon');
  await expect(daily(page).locator('[style]')).toHaveCount(0);
  const box = await extraSummary(page).boundingBox();
  expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
  await extraSummary(page).click();
  const show = await extra(page).locator('.dx-more > summary').first().boundingBox();
  expect(Math.round(show.height)).toBeGreaterThanOrEqual(40);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('HOME does not mention the extra card', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: mastered(...FIVE) }) });
  await openView(page, 'home');
  await expect(page.locator('#panel-home')).not.toContainText('Extra time');
  await expect(page.locator('#panel-home')).not.toContainText('Bonus round');
});

test('Phase 0 has no Improv block and no extra card, even on Monday', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 0, improvChecks: mastered('g0e0', 'g0e1') }) });
  await openView(page, 'daily');
  for (const day of ['Mon', 'Thu', 'Sat']) {
    await showDay(page, day);
    await expect(extra(page), day).toHaveCount(0);
  }
});
