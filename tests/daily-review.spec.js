// Slice 4.8c3 (D143 point 3, D146): the Review part of DAILY's Improv & Expression block.
// Already-Mastered exercises come back, practised first: 5 min on Tue / Wed / Fri, 3 × 5 min on Sunday. The queue moves
// only with practice (the days logged in `streakDates` before today: Tue, Wed, Fri 1 slot, Sun 3, Mon / Thu / Sat 0),
// and walks the Mastered exercises in rounds (every exercise once per round). "Show exercise" opens the exercise's
// lines with today's values. Also the new IMPROV intro and Gate 1 / Gate 5 descriptions (D145 point 5).
// The clock is fixed at Tuesday 2026-11-10 (key of the day C# minor, box 5, B string). Nothing is ever written.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, settle, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const review = (page) => daily(page).locator('.daily-review');
const names = (page) => review(page).locator('.daily-review-name b').allInnerTexts();
const nbsp = (t) => t.replace(/\u00a0/g, ' ');
const all = (g, n) => Object.fromEntries(Array.from({ length: n }, (_, e) => [`g${g}e${e}`, true]));
// Phase 1 (Beginner): Phase 0 has no Improv block.
const state = (o = {}) => baseState({ phaseIndex: 1, ...o });
const GATE1 = ['One-String Doom', 'The 4-Fret Box', 'The Singing Acoustic Slide', 'Pre-Bending the Fuzz'];

// Replaces the saved state and reloads (the test seed only applies on the first load).
async function reloadWith(page, st) {
  await page.evaluate((v) => localStorage.setItem('shredRoadmapState_v10', JSON.stringify(v)), st);
  await page.reload();
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 5000 });
  await page.waitForFunction(() => window.__SHRED_TEST__.calls.includes('onAuthStateChanged'));
  await settle(page);
  await openView(page, 'daily');
}

async function showDay(page, day) {
  await daily(page).locator(`[data-action="setday"][data-day="${day}"]`).click();
  await settle(page);
}

test('no Review part while nothing is Mastered; the rest of the block is unchanged', async ({ page }) => {
  const monitor = await openApp(page, { localState: state() });
  await openView(page, 'daily');
  const blk = daily(page).locator('.blk.improv');
  await expect(blk).toHaveCount(1);
  await expect(review(page)).toHaveCount(0);
  await expect(blk.locator('.gate-line')).toHaveText('Gate 1: The Horizontal Prison');
  await expect(blk).toContainText('Next up: 1. One-String Doom');
  await expect(blk.locator('[data-action="go"][data-view="improv"]')).toHaveText('Open Improv Masterclass');
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('Tuesday, one exercise Mastered: the Review part comes first, with the exact texts', async ({ page }) => {
  const monitor = await openApp(page, { localState: state({ improvChecks: { g0e1: true } }) });
  await openView(page, 'daily');
  const blk = daily(page).locator('.blk.improv');
  await expect(blk.locator('.min')).toHaveText('15 min'); // block minutes unchanged
  await expect(review(page).locator('.daily-review-tag')).toHaveText('Review · 5 min');
  await expect(review(page).locator('.daily-review-name')).toHaveText(['The 4-Fret Box · Gate 1']);
  await expect(review(page).locator('.daily-review-help')).toHaveText(
    "First, from memory: play it in today's key (C# minor), in your usual tuning, over any track or a drone on the root. Then open it to check.");
  // Review first, then the unchanged Gate line, Next up and button.
  const order = await blk.evaluate((el) => {
    const r = el.querySelector('.daily-review'), g = el.querySelector('.gate-line');
    return !!(r.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  await expect(blk).toContainText('Next up: 1. One-String Doom');
  await expect(blk).toHaveAttribute('class', /improv/);
  await expect(review(page)).toHaveAttribute('role', 'group');
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('"Show exercise" opens the lines with today\'s values and the degrees note, and writes nothing', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: { g0e1: true } }) });
  await openView(page, 'daily');
  const before = await localSaved(page);
  const more = review(page).locator('details.daily-review-more');
  await expect(more).not.toHaveAttribute('open', '');
  expect(await more.locator('summary').innerText()).toBe('Show exercise');
  await expect(more.locator('.ex-lines')).toBeHidden();
  await more.locator('summary').click();
  await expect(more).toHaveAttribute('open', '');
  expect(await more.locator('summary').innerText()).toBe('Hide exercise');
  await expect(more.locator('.daily-review-note')).toHaveText(
    'Notes and chords in the rule come from an example key, with their degrees in brackets: play the degrees.');
  const rule = more.locator('.ex-line-rule');
  await expect(rule).toContainText('Stay strictly between frets 6 and 9 today: box 5 of the C# minor pentatonic');
  await expect(more.locator('.ex-line-track dd')).toHaveText('Slow minor blues vamp');
  await expect(more).not.toContainText('{');
  await more.locator('summary').click();
  await expect(more.locator('.ex-lines')).toBeHidden();
  expect(await localSaved(page)).toEqual(before);
});

test('only the Improv days have it: Tue, Wed, Fri one exercise; Sunday three; Mon, Thu, Sat none', async ({ page }) => {
  await openApp(page, { localState: state({ improvIndex: 1, improvChecks: all(0, 4) }) });
  await openView(page, 'daily');
  for (const day of ['Mon', 'Thu', 'Sat']) {
    await showDay(page, day);
    await expect(review(page)).toHaveCount(0);
  }
  for (const day of ['Wed', 'Fri']) {
    await showDay(page, day);
    await expect(review(page).locator('.daily-review-tag')).toHaveText('Review · 5 min');
    await expect(review(page).locator('.daily-review-ex')).toHaveCount(1);
  }
  await showDay(page, 'Sun');
  await expect(daily(page).locator('.blk.improv .min')).toHaveText('45 min');
  await expect(review(page).locator('.daily-review-tag')).toHaveText('Review · 15 min');
  const sun = await names(page);
  expect(sun).toHaveLength(3);
  expect(new Set(sun).size).toBe(3);
  sun.forEach((n) => expect(GATE1).toContain(n));
  await expect(review(page).locator('.daily-review-help')).toHaveText(
    "First, from memory: play them in today's key (C# minor), 5 min each, in your usual tuning, over any track or a drone on the root. Then open each to check.");
  await expect(review(page).locator('details.daily-review-more')).toHaveCount(3);
});

test('Sunday with one or two exercises Mastered shows only those', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: { g0e0: true } }) });
  await openView(page, 'daily');
  await showDay(page, 'Sun');
  expect(await names(page)).toEqual(['One-String Doom']);
  await expect(review(page).locator('.daily-review-help')).toHaveText(
    "First, from memory: play it in today's key (C# minor), in your usual tuning, over any track or a drone on the root. Then open it to check. Change box or position every 5 minutes.");
  await reloadWith(page, state({ improvChecks: { g0e0: true, g0e3: true } }));
  await showDay(page, 'Sun');
  expect((await names(page)).sort()).toEqual(['One-String Doom', 'Pre-Bending the Fuzz']);
  await expect(review(page).locator('.daily-review-help')).toHaveText(
    "First, from memory: play them in today's key (C# minor), in your usual tuning, over any track or a drone on the root. Then open each to check.");
});

test('every Mastered exercise from every Gate is in the queue, the current Gate included', async ({ page }) => {
  // Gate 1 passed (4) + Gate 2 exercise 2 Mastered: 5 exercises; over a round of 5 Tuesdays practised each comes once.
  const checks = { ...all(0, 4), g1e1: true };
  const seen = [];
  await openApp(page, { localState: state() });
  for (let k = 0; k < 5; k++) {
    const dates = ['2026-11-03', '2026-10-27', '2026-10-20', '2026-10-13', '2026-10-06'].slice(0, k); // past Tuesdays
    await reloadWith(page, state({ improvIndex: 1, improvChecks: checks, streakDates: dates }));
    seen.push(nbsp((await review(page).locator('.daily-review-name').allInnerTexts())[0]));
  }
  expect(seen.slice().sort()).toEqual([...GATE1.map((n) => n + ' · Gate 1'), 'Chromatic Enclosures · Gate 2'].sort());
});

test('the queue moves only with practice: Tue / Wed / Fri 1, Sun 3, Mon / Thu / Sat 0; today never counts', async ({ page }) => {
  const checks = all(0, 4);
  await openApp(page, { localState: state() });
  async function pickWith(dates) {
    await reloadWith(page, state({ improvIndex: 1, improvChecks: checks, streakDates: dates }));
    return (await names(page))[0];
  }
  const a = await pickWith([]);
  // Days without an Improv block, today, future days and malformed entries do not move the queue.
  expect(await pickWith(['2026-11-09', '2026-11-05', '2026-11-07', '2026-11-10', '2026-11-12', 'x', 5])).toBe(a);
  // A practised Tuesday, Wednesday, Friday each move it one place: one round of 4 = all 4 exercises.
  const b = await pickWith(['2026-11-03']);
  const c = await pickWith(['2026-11-03', '2026-11-04']);
  const d = await pickWith(['2026-11-03', '2026-11-04', '2026-11-06']);
  expect(new Set([a, b, c, d]).size).toBe(4);
  // A practised Sunday moves it three places: Sunday alone = Tue + Wed + Fri.
  expect(await pickWith(['2026-11-08'])).toBe(d);
  // The same day twice counts once.
  expect(await pickWith(['2026-11-03', '2026-11-03'])).toBe(b);
});

test('ticking today keeps today\'s pick (signed in: nothing extra is written)', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: state({ improvIndex: 1, improvChecks: all(0, 4), streakDates: ['2026-11-03'] }) } });
  await openView(page, 'daily');
  const pick = await names(page);
  const writes = (await cloudWrites(page)).length;
  await daily(page).locator('.blk.improv [data-action="blockprac"]').click();
  await settle(page);
  expect(await names(page)).toEqual(pick);
  const saved = await localSaved(page);
  expect(saved.streakDates).toContain('2026-11-10');
  expect(saved.improvChecks).toEqual(all(0, 4));
  // Only the tick itself is written (one cloud write), nothing for the review.
  expect((await cloudWrites(page)).length).toBe(writes + 1);
  await review(page).locator('summary').first().click();
  await settle(page);
  expect((await cloudWrites(page)).length).toBe(writes + 1);
});

test('read-only days show the review that session would give; Phase 0 has no Improv block', async ({ page }) => {
  await openApp(page, { localState: state({ improvChecks: { g0e2: true } }) });
  await openView(page, 'daily');
  await showDay(page, 'Wed');
  await expect(daily(page).locator('.daily-ro')).toBeVisible();
  expect(await names(page)).toEqual(['The Singing Acoustic Slide']);
  await reloadWith(page, baseState({ improvChecks: { g0e2: true } }));
  await expect(review(page)).toHaveCount(0);
});

test('layout: inside the block, no inline style, no sideways overflow, a 44 px tap target on the phone', async ({ page, isMobile }) => {
  await openApp(page, { localState: state({ improvIndex: 1, improvChecks: all(0, 4) }) });
  await openView(page, 'daily');
  await showDay(page, 'Sun');
  await review(page).locator('summary').first().click();
  expect(await daily(page).locator('[style]').count()).toBe(0);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
  const box = await review(page).boundingBox();
  const blk = await daily(page).locator('.blk.improv').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(blk.x);
  expect(Math.round(box.x + box.width)).toBeLessThanOrEqual(Math.round(blk.x + blk.width));
  const h = await review(page).locator('summary').first().evaluate((el) => el.getBoundingClientRect().height);
  expect(Math.round(h)).toBeGreaterThanOrEqual(isMobile ? 44 : 40);
});

test('HOME does not mention the review', async ({ page }) => {
  await openApp(page, { localState: state({ improvIndex: 1, improvChecks: all(0, 4) }) });
  await expect(page.locator('#panel-home')).not.toContainText('Review');
});

test('IMPROVISATION: new intro line; Gate 1 and Gate 5 descriptions rewritten', async ({ page, isMobile }) => {
  await openApp(page, { localState: state() });
  await openView(page, 'improv');
  const lede = page.locator('#panel-improv .improv-lede');
  await expect(lede).toHaveText("Use the boxes and positions you know without being tied to them. Five Gates of constraints train your ear to lead your hands, in a new key every day. Mark every exercise of a Gate Mastered to open the next; mastered exercises come back in DAILY as review.");
  if (isMobile) await expect(lede).toBeHidden(); // not on the phone board (4.8c)
  await expect(page.locator('#panel-improv')).not.toContainText('muscle memory');
  await expect(page.locator('#panel-improv .improv-gate-desc')).toHaveText(
    'Break the habit of running up and down the pentatonic boxes. Play melodies along the neck and make every note expressive.');
  const g5 = await page.evaluate(async () => (await import('/js/data/improv.js?v=4')).IMPROV_GATES[4].desc);
  expect(g5).toBe('The Master Level. Your ear leads and your hands follow: solos come from what you hear, not from shapes under your fingers.');
});
