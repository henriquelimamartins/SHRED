// Slice 4.8c2 (D142): the day's string (One-String Doom) and pentatonic box (The 4-Fret Box) rotate with the day,
// the target card names today's root, chord names in rules carry their numeral, tracks name no fixed key.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const imp = (page) => page.locator('#panel-improv');
const exercise = (page, title) => imp(page).locator('.improv-ex', { hasText: title });
const all = (g, n) => Object.fromEntries(Array.from({ length: n }, (_, e) => [`g${g}e${e}`, true]));

// The music-theory verifier's table (D134): box spans for the 12 keys, frets 1–17, no open strings, lower placement.
const BOXES = {
  'E': ['12–15', '2–5', '4–8', '7–10', '9–12'], 'F': ['1–4', '3–6', '5–9', '8–11', '10–13'],
  'F#': ['2–5', '4–7', '6–10', '9–12', '11–14'], 'G': ['3–6', '5–8', '7–11', '10–13', '12–15'],
  'G#': ['4–7', '6–9', '8–12', '11–14', '1–4'], 'A': ['5–8', '7–10', '9–13', '12–15', '2–5'],
  'Bb': ['6–9', '8–11', '10–14', '1–4', '3–6'], 'B': ['7–10', '9–12', '11–15', '2–5', '4–7'],
  'C': ['8–11', '10–13', '12–16', '3–6', '5–8'], 'C#': ['9–12', '11–14', '1–5', '4–7', '6–9'],
  'D': ['10–13', '12–15', '2–6', '5–8', '7–10'], 'Eb': ['11–14', '1–4', '3–7', '6–9', '8–11'],
};

test('the 4-fret box spans match the verifier for all 12 keys and 5 boxes', async ({ page }) => {
  await openApp(page);
  const got = await page.evaluate(async (keys) => {
    const v = (await import(new URL('views/improv.js', location.origin + '/js/').href + '?v=20'));
    const out = {};
    for (const k of keys) out[k] = [0, 1, 2, 3, 4].map((b) => v.boxFrets(k, b).join('–'));
    return out;
  }, Object.keys(BOXES));
  expect(got).toEqual(BOXES);
});

test('today (fixed clock, C# minor): the B string and box 5 of C# minor at frets 6–9', async ({ page }) => {
  await openApp(page);
  await openView(page, 'improv');
  await expect(exercise(page, '1. One-String Doom').locator('.ex-line-rule .ex-today')).toHaveText('B');
  const box = exercise(page, '2. The 4-Fret Box').locator('.ex-line-rule');
  await expect(box).toContainText('Stay strictly between frets 6 and 9 today: box 5 of the C# minor pentatonic (the box changes from day to day).');
  await expect(box.locator('.ex-today')).toHaveText(['6 and 9', 'box 5 of the C# minor pentatonic']);
  await expect(imp(page)).not.toContainText('{');
});

test('another day moves the key, the box and (every 12 days) the string', async ({ page }) => {
  // Day 326: key 326 % 12 = 2 → C# minor, box 326 % 5 = 1 → box 2, string floor(326 / 12) % 4 = 3 → A.
  await openApp(page, { now: '2026-11-22T12:00:00Z' });
  await openView(page, 'improv');
  await expect(exercise(page, '1. One-String Doom').locator('.ex-line-rule .ex-today')).toHaveText('A');
  await expect(exercise(page, '2. The 4-Fret Box').locator('.ex-line-rule')).toContainText('frets 11 and 14 today: box 2 of the C# minor pentatonic');
});

test('the target card names today\'s root; major-mode exercises have a SCALE line', async ({ page }) => {
  await openApp(page, { localState: baseState({ improvIndex: 1, improvChecks: all(0, 4) }) });
  await openView(page, 'improv');
  await expect(imp(page).locator('.improv-target-help')).toContainText("on today's root, C#: in C# minor, or in the scale its SCALE line names.");
  await expect(exercise(page, '4. The Vocal Orchestration').locator('.ex-line-scale dd')).toHaveText('Major');
  await expect(exercise(page, '2. Chromatic Enclosures').locator('.ex-line-rule dd')).toContainText("on Beat 4 and its 'and'.");
});

test('Gate 4: chord names carry their numeral, tracks name no fixed key, "#4 above all"', async ({ page }) => {
  const checks = Object.assign(all(0, 4), all(1, 5), all(2, 4));
  await openApp(page, { localState: baseState({ improvIndex: 3, improvChecks: checks }) });
  await openView(page, 'improv');
  await expect(exercise(page, '2. Death Metal Dominant').locator('.ex-line-rule dd')).toContainText('Over the i (Am), play normal minor. The millisecond the V (E) hits, play a V dominant (E7) or vii° (G# diminished) arpeggio.');
  expect(await imp(page).locator('.ex-line-track dd').allTextContents()).toEqual(
    ['Vamp matching the progression', 'Vamp matching the progression', 'Heavy pedal chug on the root', 'Vamp matching the progression', 'Dark prog metal in the key of the day', 'Ambient major drone on the root']);
  await expect(exercise(page, '6. Space Rock Lydian').locator('.ex-line-rule dd')).toContainText('Target the #4 (F#) above all.');
});

test('the daily values are shown, never stored (signed in)', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
  await openView(page, 'improv');
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await expect(exercise(page, '2. The 4-Fret Box').locator('.ex-today').first()).toBeVisible();
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
  expect(JSON.stringify(before)).not.toContain('oneString');
});
