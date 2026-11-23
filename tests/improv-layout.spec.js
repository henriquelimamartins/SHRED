// Slice 4.8c (D132 point 3, D139): IMPROVISATION as drawn on the 4.6 boards, and (until 4.10k) the Expression Track in LIBRARY
// showing the same exercise lines. Behaviour (marks, Unlock, stored keys, the key of the day) is covered by improv.spec.js.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const imp = (page) => page.locator('#panel-improv');
const isPhone = (testInfo) => testInfo.project.name === 'mobile';
const box = (loc) => loc.boundingBox();
const allMastered = (g, n) => Object.fromEntries(Array.from({ length: n }, (_, e) => [`g${g}e${e}`, true]));
const exercise = (page, title) => imp(page).locator('.improv-ex', { hasText: title });
const lines = (loc) => loc.locator('.ex-line').evaluateAll((ls) => ls.map((l) => [l.querySelector('dt').textContent, l.querySelector('dd').textContent]));

// Roman numerals and degrees as approved in D139 and checked by the music-theory verifier (D134).
const CHANGES = {
  'Gate 1': { '3. The Singing Acoustic Slide': 'i – VI – VII' },
  'Gate 2': {
    '1. The Target 3rd': 'i – VI – III – VII',
    '2. Chromatic Enclosures': 'i – VI – iv – V7',
    '3. Arpeggio Outlining': 'i – VI – V7 – i',
    '4. The Vocal Orchestration': 'I – IV – V',
    '5. The Sludge to Dominant Turn': 'i5 – VII5 – VI5 – V7',
  },
  'Gate 4': { '1. Desert Rock Dorian': 'i – IV', '2. Death Metal Dominant': 'i – V', '4. Mixolydian Classic Rock': 'I7 – IV7' },
};

test('the key of the day on top, the Gate card, then the 5 Gates (phone order; desktop: card left, target and list right)', async ({ page }, testInfo) => {
  await openApp(page, { localState: baseState({ improvChecks: { g0e0: true, g0e1: true } }) });
  await openView(page, 'improv');
  const target = imp(page).locator('.improv-target');
  await expect(target.locator('.improv-target-label')).toHaveText('Daily Transposition Target');
  await expect(target.locator('.improv-key')).toHaveText('C# minor');
  await expect(target.locator('.improv-style')).toHaveText('Sabbath / Doom Core');
  await expect(target.locator('.improv-target-help')).toHaveText(
    "Play every exercise below on today's root, C#: in C# minor, or in the scale its SCALE line names. Notes and chords in the rules come from an example key, with their degrees in brackets: play the degrees. This breaks vertical habits and builds true neck mastery."); // 4.8c2 (D142)
  await expect(imp(page).locator('.improv-gate-title')).toHaveText('Gate 1 · The Horizontal Prison');
  await expect(imp(page).locator('.improv-gate-count')).toHaveText('2 of 4 mastered');
  await expect(imp(page).locator('.improv-list-title')).toHaveText('The 5 Gates of Freedom');
  const t = await box(target), g = await box(imp(page).locator('.improv-gate')), l = await box(imp(page).locator('.improv-list'));
  if (isPhone(testInfo)) {
    expect(t.y + t.height).toBeLessThanOrEqual(g.y + 1);
    expect(g.y + g.height).toBeLessThanOrEqual(l.y + 1);
    await expect(imp(page).locator('.improv-lede')).toBeHidden(); // not on the phone board
  } else {
    expect(t.x).toBeGreaterThan(g.x + g.width - 1); // right column
    expect(Math.abs(t.y - g.y)).toBeLessThan(4);
    expect(l.y).toBeGreaterThan(t.y + t.height - 1);
    expect(Math.abs(l.x - t.x)).toBeLessThan(2);
    await expect(imp(page).locator('.improv-lede')).toBeVisible();
  }
  await page.screenshot({ path: testInfo.outputPath('improv.png'), fullPage: true });
});

test('desktop, narrower window: the target and the list move under the Gate card', async ({ page }, testInfo) => {
  test.skip(isPhone(testInfo), 'desktop only');
  await page.setViewportSize({ width: 1024, height: 900 });
  await openApp(page);
  await openView(page, 'improv');
  const t = await box(imp(page).locator('.improv-target')), g = await box(imp(page).locator('.improv-gate'));
  expect(t.y + t.height).toBeLessThanOrEqual(g.y + 1);
  expect(Math.abs(t.width - g.width)).toBeLessThan(2);
});

test('exercises: no KEY line; CHANGES in Roman numerals, then TRACK and RULE; degrees beside named notes', async ({ page }) => {
  await openApp(page);
  await openView(page, 'improv');
  await expect(imp(page)).not.toContainText('Key:');
  expect(await lines(exercise(page, '1. One-String Doom'))).toEqual([
    ['Track', 'Heavy Stoner/Doom drone'],
    ['Rule', 'You can ONLY use the B string for 3 full minutes (the string changes from day to day). Focus on finding the 1, ♭3, 5 and ♭7 (E, G, B, D in E minor) horizontally. Force yourself to use slides to connect notes instead of crossing strings.'], // 4.8c2: string of the day
  ]);
  expect((await lines(exercise(page, '3. The Singing Acoustic Slide'))).map((l) => l[0])).toEqual(['Changes', 'Track', 'Rule']);
  await expect(exercise(page, '3. The Singing Acoustic Slide').locator('.ex-line-changes dd')).toHaveText('i – VI – VII');
  // Labels in capitals as drawn.
  expect(await exercise(page, '3. The Singing Acoustic Slide').locator('dt').first().evaluate((el) => getComputedStyle(el).textTransform)).toBe('uppercase');
});

test('every Gate: the approved CHANGES, and SCALE / TUNING / METER where the old key line said more than the key', async ({ page }) => {
  const checks = Object.assign(allMastered(0, 4), allMastered(1, 5), allMastered(2, 4));
  // Gate 2 (index 1)
  await openApp(page, { localState: baseState({ improvIndex: 1, improvChecks: allMastered(0, 4) }) });
  await openView(page, 'improv');
  for (const [t, c] of Object.entries(CHANGES['Gate 2'])) await expect(exercise(page, t).locator('.ex-line-changes dd')).toHaveText(c);
  await expect(exercise(page, '1. The Target 3rd').locator('.ex-line-rule dd')).toContainText('(i Am -> C (♭3), VI F -> A (1), III C -> E (5), VII G -> B (2))');
  await expect(exercise(page, '3. Arpeggio Outlining').locator('.ex-line-rule dd')).toContainText('When the V7 (B7) hits, you must emphasize the D# (7).');
  await expect(exercise(page, '5. The Sludge to Dominant Turn').locator('.ex-line-rule dd')).toContainText('(C harmonic minor here; target the B natural, 7)');
  // Gate 3 (index 2)
  await page.evaluate((s) => localStorage.setItem('shredRoadmapState_v10', JSON.stringify(s)), baseState({ improvIndex: 2, improvChecks: checks }));
  await page.reload();
  await openView(page, 'improv');
  await expect(exercise(page, '2. Sustain Beyond the Barline').locator('.ex-line-tuning dd')).toHaveText('B Standard');
  await expect(exercise(page, '3. The Texas Drag').locator('.ex-line-scale dd')).toHaveText('Blues');
  await expect(exercise(page, '4. Odd-Meter Survival').locator('.ex-line-meter dd')).toHaveText('7/8');
  await expect(imp(page).locator('.ex-line-changes')).toHaveCount(0);
  // Gate 4 (index 3)
  await page.evaluate((s) => localStorage.setItem('shredRoadmapState_v10', JSON.stringify(s)), baseState({ improvIndex: 3, improvChecks: checks }));
  await page.reload();
  await openView(page, 'improv');
  for (const [t, c] of Object.entries(CHANGES['Gate 4'])) await expect(exercise(page, t).locator('.ex-line-changes dd')).toHaveText(c);
  expect(await imp(page).locator('.ex-line-scale dd').allTextContents()).toEqual(['Dorian', 'Harmonic minor', 'Mixolydian', 'Lydian']);
  await expect(exercise(page, '1. Desert Rock Dorian').locator('.ex-line-rule dd')).toContainText('(B natural, 6)');
  await expect(exercise(page, '2. Death Metal Dominant').locator('.ex-line-rule dd')).toContainText('from A (1) to G# (7)');
  await expect(exercise(page, '3. Oppressive Phrygian/Locrian').locator('.ex-line-rule dd')).toContainText('the minor 2nd (Bb, ♭2) and the flat 5th (Eb, ♭5)');
  await expect(exercise(page, '4. Mixolydian Classic Rock').locator('.ex-line-rule dd')).toContainText('the Major 3rd (C#, 3) and the minor 3rd (C natural, ♭3)');
});

test('Gate 5: "Any", "Free" and "Shifting" are gone; "Any Blues Key" is SCALE Blues', async ({ page }) => {
  const checks = Object.assign(allMastered(0, 4), allMastered(1, 5), allMastered(2, 4), allMastered(3, 6));
  await openApp(page, { localState: baseState({ improvIndex: 4, improvChecks: checks }) });
  await openView(page, 'improv');
  await expect(imp(page).locator('.improv-ex')).toHaveCount(4);
  expect(await imp(page).locator('.ex-line dt').allTextContents()).toEqual(['Track', 'Rule', 'Scale', 'Track', 'Rule', 'Track', 'Rule', 'Track', 'Rule']);
  await expect(exercise(page, '2. Vocal Call & Response').locator('.ex-line-scale dd')).toHaveText('Blues');
});

test('listening references in one box, each labelled with its classification (D140)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'improv');
  const one = exercise(page, '1. One-String Doom').locator('.ex-listen');
  await expect(one.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(one.locator('.ex-ref')).toHaveCount(2);
  expect(await one.locator('.ex-listen-label').allTextContents()).toEqual(['Verified analysis', 'Stylistic association']);
  await expect(one.locator('.ex-ref').nth(0).locator('b')).toHaveText('Adrian Smith (Iron Maiden)'); // 4.8c2 (D142)
  await expect(one.locator('.ex-ref').nth(0).locator('p')).toHaveText("Adrian Smith (Iron Maiden) · 'Wasted Years' (Somewhere in Time, 1986) — the intro riff runs along the high E string, from the 12th fret down to the 2nd, against the open string: one string carrying a whole melody.");
  await expect(one.locator('.ex-ref').nth(1).locator('b')).toHaveText('Black Sabbath');
  // A single reference when the documented one already comes from the owner's world.
  const four = exercise(page, '2. The 4-Fret Box').locator('.ex-ref');
  await expect(four).toHaveCount(1);
  await expect(four.locator('.ex-listen-label')).toHaveText('Verified analysis');
  await expect(four.locator('b')).toHaveText('David Gilmour (Pink Floyd)');
  await expect(exercise(page, '3. The Singing Acoustic Slide').locator('.ex-listen-label')).toHaveText('Stylistic association');
  await expect(imp(page).locator('.ex-listen')).toHaveCount(4);
  await expect(imp(page)).not.toContainText('Suggested listening');
});

test('every exercise has one or two labelled references, 33 in all (19 verified, 14 stylistic)', async ({ page }) => {
  const all = (g, n) => Object.fromEntries(Array.from({ length: n }, (_, e) => [`g${g}e${e}`, true]));
  const counts = { verified: 0, stylistic: 0 };
  const sizes = [4, 5, 4, 6, 4];
  let checks = {};
  await openApp(page);
  for (let g = 0; g < 5; g++) {
    if (g > 0) {
      await page.evaluate((st) => localStorage.setItem('shredRoadmapState_v10', JSON.stringify(st)), baseState({ improvIndex: g, improvChecks: checks }));
      await page.reload();
    }
    await openView(page, 'improv');
    await expect(imp(page).locator('.improv-ex')).toHaveCount(sizes[g]);
    for (let e = 0; e < sizes[g]; e++) {
      const refs = imp(page).locator('.improv-ex').nth(e).locator('.ex-ref');
      const n = await refs.count();
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(2);
    }
    for (const k of await imp(page).locator('.ex-ref').evaluateAll((els) => els.map((el) => el.dataset.kind))) counts[k]++;
    checks = Object.assign(checks, all(g, sizes[g]));
  }
  expect(counts).toEqual({ verified: 19, stylistic: 14 });
});

test('Mastered buttons keep the app\'s usual shape, 40 px (44 px on the phone); a mastered exercise\'s title is muted', async ({ page }, testInfo) => {
  await openApp(page, { localState: baseState({ improvChecks: { g0e0: true } }) });
  await openView(page, 'improv');
  const on = imp(page).locator('[data-action="togimprov"][data-e="0"]');
  const off = imp(page).locator('[data-action="togimprov"][data-e="1"]');
  await expect(on).toHaveAttribute('aria-pressed', 'true');
  await expect(off).toHaveAttribute('aria-pressed', 'false');
  const h = Math.round((await box(off)).height);
  expect(h).toBeGreaterThanOrEqual(isPhone(testInfo) ? 44 : 40);
  expect(await off.evaluate((el) => getComputedStyle(el).borderRadius)).not.toBe('999px');
  const col = (loc) => loc.evaluate((el) => getComputedStyle(el).color);
  expect(await col(exercise(page, '1. One-String Doom').locator('.ex-title'))).toBe('rgb(160, 160, 170)'); // muted
  expect(await col(exercise(page, '2. The 4-Fret Box').locator('.ex-title'))).toBe('rgb(242, 242, 244)');
});

test('Gates list: current highlighted with its count, later Gates locked with an icon, no emoji anywhere', async ({ page }) => {
  await openApp(page, { localState: baseState({ improvChecks: { g0e0: true, g0e1: true } }) });
  await openView(page, 'improv');
  const rows = imp(page).locator('.improv-list .improv-row');
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0)).toHaveClass(/cur/);
  await expect(rows.nth(0)).toHaveAttribute('aria-current', 'step');
  await expect(rows.nth(0).locator('.improv-row-state')).toHaveText('Current · 2 of 4');
  for (let i = 1; i < 5; i++) {
    await expect(rows.nth(i)).toHaveClass(/locked/);
    await expect(rows.nth(i).locator('[role="img"][aria-label="Locked"] svg')).toHaveCount(1);
  }
  const text = await imp(page).textContent();
  expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
});

test('passed Gates open in place with their exercises; Unlock has an icon instead of an emoji', async ({ page }) => {
  await openApp(page, { localState: baseState({ improvIndex: 1, improvChecks: Object.assign(allMastered(0, 4), allMastered(1, 5)) }) });
  await openView(page, 'improv');
  const passed = imp(page).locator('[data-acc="improvG0"]');
  await expect(passed).toHaveJSProperty('tagName', 'BUTTON');
  await expect(passed).toHaveAttribute('aria-expanded', 'false');
  await passed.focus();
  await page.keyboard.press('Enter');
  await expect(imp(page).locator('[data-acc="improvG0"]')).toHaveAttribute('aria-expanded', 'true');
  expect(await imp(page).locator('.improv-row-body .done-ex').allTextContents()).toEqual(
    ['1. One-String Doom', '2. The 4-Fret Box', '3. The Singing Acoustic Slide', '4. Pre-Bending the Fuzz']);
  const unlock = imp(page).locator('[data-action="advanceimprov"]');
  await expect(unlock).toHaveText('Unlock Gate 3');
  await expect(unlock.locator('svg')).toHaveCount(1);
});

test('all 5 Gates done: the mastered card with an icon and every Gate as a passed row', async ({ page }) => {
  await openApp(page, { localState: baseState({ improvIndex: 5 }) });
  await openView(page, 'improv');
  await expect(imp(page).locator('.improv-done b')).toHaveText('YOU HAVE MASTERED THE 5 GATES!');
  await expect(imp(page).locator('.improv-done svg')).toHaveCount(1);
  await expect(imp(page).locator('.improv-row.passed')).toHaveCount(5);
  await expect(imp(page).locator('.improv-target, .improv-gate')).toHaveCount(0);
});

// Slice 4.10k (D165): the LIBRARY copy of the Expression Track was removed (D107 point 5); its test went with it.

test('showing the page writes nothing (signed in too); no sideways overflow; no errors', async ({ page }) => {
  const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState({ improvIndex: 1, improvChecks: allMastered(0, 4) }) } });
  await openView(page, 'improv');
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await imp(page).locator('[data-acc="improvG0"]').click();
  await expect(imp(page).locator('.improv-row-body')).toBeVisible();
  const overflow = await page.evaluate(() => {
    const p = document.querySelector('#panel-improv');
    return [...p.querySelectorAll('*')].some((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1);
  });
  expect(overflow).toBe(false);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});
