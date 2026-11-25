// Slice 4.10o (D169, option A5): HOME on desktop. Three columns from 1400 px (briefing and calendar | Today's key |
// This week), two from 1180 px (This week under the calendar), one below; This week (the current local week day by
// day, Current streak, Longest streak, Practising since with the days logged); "Gate n · up next" on Today's key; the
// streak line leaves the desktop header; the phone has no This week and keeps its streak pill. Showing HOME writes
// nothing. The clock is fixed at Tuesday 10 Nov 2026 (Lisbon).
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, openView, STORAGE_KEY } = require('./support/app');
const { baseState, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const week = (page) => home(page).locator('.home-week');
const rows = (page) => week(page).locator('.hw-row');
const box = (page, sel) => home(page).locator(sel).boundingBox();
// Mon 9 Nov logged, Tue 10 (today) not yet; a run of three in October, two more days in early November.
const LOGGED = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-11-02', '2026-11-09'];

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('three columns from 1400 px: briefing and calendar, This week (316 px), Today\'s key (380 px), the last two full height', async ({ page }) => {
    await openApp(page, { localState: progressState({ phaseIndex: 1, streakDates: LOGGED }) }); // 1440 px
    const b = await box(page, '.home-brief'), c = await box(page, '.home-calendar'), k = await box(page, '.home-key'), w = await box(page, '.home-week');
    expect(c.y).toBeGreaterThan(b.y + b.height - 1);
    expect(w.x).toBeGreaterThan(b.x + b.width); // owner, 2026-11-24: This week second, the key third
    expect(k.x).toBeGreaterThan(w.x + w.width);
    for (const top of [k.y, w.y]) expect(Math.abs(top - b.y)).toBeLessThan(1);
    expect(Math.round(w.width)).toBe(316);
    expect(Math.round(k.width)).toBe(380);
    // The key card spreads its free height: no gap of more than 40 px between two of its parts.
    const gaps = await home(page).locator('.home-key').evaluate((el) => { const c = [...el.children].map((x) => x.getBoundingClientRect());
      return c.slice(1).map((r, i) => r.top - c[i].bottom); });
    expect(Math.max(...gaps)).toBeLessThan(40);
    const bottom = Math.max(c.y + c.height, k.y + k.height, w.y + w.height);
    for (const r of [k, w]) expect(Math.abs(r.y + r.height - bottom)).toBeLessThan(2);
    // In three columns "Continue session" sits under the next block at full width, and the Improv tile reads "Improv".
    const cont = await box(page, '.hb-continue');
    expect(Math.abs(cont.width - (b.width - 2 * 16))).toBeLessThan(20);
    await expect(home(page).locator('.hb-tile[data-block="casual"] .hb-title-short')).toBeVisible();
  });

  test('on a wide window the first column stops at 720 px', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await openApp(page, { localState: progressState() });
    expect(Math.round((await box(page, '.home-brief')).width)).toBe(720);
    expect(Math.round((await box(page, '.home-week')).width)).toBe(316);
  });

  test('1180–1399 px: two columns, This week under the calendar, Today\'s key on the right', async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 900 });
    await openApp(page, { localState: progressState() });
    const b = await box(page, '.home-brief'), c = await box(page, '.home-calendar'), k = await box(page, '.home-key'), w = await box(page, '.home-week');
    expect(w.y).toBeGreaterThan(c.y + c.height - 1);
    expect(w.y - (c.y + c.height)).toBeLessThan(30); // right under the calendar, no hole
    expect(Math.abs(w.x - b.x)).toBeLessThan(1);
    expect(Math.abs(w.width - b.width)).toBeLessThan(1);
    expect(k.x).toBeGreaterThan(b.x + b.width);
    expect(Math.round(k.width)).toBe(380);
  });

  test('below 1180 px one column: briefing, key, calendar, This week', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await openApp(page, { localState: progressState() });
    const sels = ['.home-brief', '.home-key', '.home-calendar', '.home-week'];
    const tops = await page.evaluate((s) => s.map((x) => document.querySelector('#panel-home ' + x).getBoundingClientRect().top), sels);
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    const xs = await page.evaluate((s) => s.map((x) => Math.round(document.querySelector('#panel-home ' + x).getBoundingClientRect().left)), sels);
    expect(new Set(xs).size).toBe(1);
  });

  test('the streak line leaves the desktop header; the streak lives in This week', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    await expect(home(page).locator('.page-head .home-streak')).toBeHidden();
    await expect(home(page).locator('.page-head .streak-pill')).toBeHidden();
    await expect(week(page)).toBeVisible();
  });

  test('This week: Monday to Sunday of the current week, with dates, states and "n of 7 days practised"', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, streakDates: LOGGED }) });
    await expect(week(page).locator('h2.hw-label')).toHaveText(/^This week$/i);
    await expect(rows(page)).toHaveCount(7);
    await expect(rows(page).locator('.hw-day')).toHaveText(['Mon 9', 'Tue 10', 'Wed 11', 'Thu 12', 'Fri 13', 'Sat 14', 'Sun 15'].map((t) => new RegExp('^' + t + '$', 'i')));
    const states = await rows(page).evaluateAll((r) => r.map((x) => (x.querySelector('.hw-state') || {}).textContent || ''));
    expect(states).toEqual(['Practised', 'Today', '', '', '', '', '']);
    await expect(rows(page).nth(0)).toHaveClass(/\bhit\b/);
    await expect(rows(page).nth(1)).toHaveClass(/\btoday\b/);
    await expect(rows(page).nth(1)).toHaveAttribute('aria-current', 'date');
    for (const i of [2, 3, 4, 5, 6]) await expect(rows(page).nth(i)).toHaveClass(/\bfuture\b/);
    await expect(week(page).locator('.hw-meta')).toHaveText('1 of 7 days practised');
    await expect(week(page).locator('.hw-bar i')).toHaveClass('f1');
  });

  test('This week: a past day not logged reads "Rest"; today, once practised, reads "Practised"', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, streakDates: ['2026-11-10'], practiced: { 'warmup.Tue': true } }),
      now: '2026-11-12T12:00:00Z' }); // Thursday
    const states = await rows(page).evaluateAll((r) => r.map((x) => (x.querySelector('.hw-state') || {}).textContent || ''));
    expect(states).toEqual(['Rest', 'Practised', 'Rest', 'Today', '', '', '']);
  });

  test('This week: each day\'s plan and minutes, as DAILY (micro-dose and Phase test with the BHGS pack)', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await expect(rows(page).locator('.hw-plan')).toHaveText(['Casual · Ear Training', 'Improv · Rhythm', 'Improv · Time Signatures',
      'Casual · Sight-Reading', 'Phase test · Improv · Reinforce Weakest', 'Casual', 'Improv']);
    await expect(rows(page).locator('.hw-min')).toHaveText(Array(7).fill('60 min'));
  });

  test('This week without the BHGS pack: no micro-dose and no Phase test', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }), bhgsPack: false });
    await expect(rows(page).locator('.hw-plan')).toHaveText(['Casual', 'Improv', 'Improv', 'Casual', 'Improv', 'Casual', 'Improv']);
  });

  test('This week in Phase 0: Warm-Up, no minutes', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 0 }) });
    await expect(rows(page).locator('.hw-plan')).toHaveText(Array(7).fill('Warm-Up'));
    await expect(rows(page).locator('.hw-min')).toHaveCount(0);
  });

  test('Current streak, Longest streak, Practising since with the days logged: the same values as the profile panel', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, streakDates: LOGGED }) });
    const stat = (cls) => week(page).locator(`.hw-stat.${cls} .hw-stat-val`);
    await expect(week(page).locator('.hw-stat-label')).toHaveText([/^Current streak$/i, /^Longest streak$/i, /^Practising since$/i]);
    await expect(stat('s-current')).toHaveText('1 day'); // Mon 9 logged, today not yet
    await expect(stat('s-best')).toHaveText('3 days'); // 20–22 Oct
    await expect(stat('s-since')).toHaveText('Oct 2026');
    await expect(week(page).locator('.s-since .hw-stat-sub')).toHaveText('5 days logged');
    expect(await home(page).locator('.page-head .streak-run').textContent()).toBe('1'); // the shared count (header line, hidden)
  });

  test('nothing logged: 0 of 7, "0 days", "Not yet" without a count', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await expect(week(page).locator('.hw-meta')).toHaveText('0 of 7 days practised');
    await expect(week(page).locator('.hw-stat-val')).toHaveText(['0 days', '0 days', 'Not yet']);
    await expect(week(page).locator('.hw-stat-sub')).toHaveCount(0);
  });

  test('Gate n · up next: the first exercise not Mastered, its changes in degrees and in today\'s key, and its track', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, improvIndex: 0, improvChecks: { g0e0: true, g0e1: true } }) });
    const next = home(page).locator('.home-key .hk-next');
    await expect(next.locator('.hk-next-label')).toHaveText(/^Gate 1 · up next$/i);
    await expect(next.locator('.hk-next-title')).toHaveText('The Singing Acoustic Slide');
    await expect(next.locator('.hk-next-deg')).toHaveText('i – VI – VII');
    await expect(next.locator('.hk-next-chords')).toHaveText('C♯m – A – B'); // today's key: C♯ minor
    await expect(next.locator('.hk-next-track')).toHaveText('Clean/Acoustic fingerpicked vamp');
    // Another key on the circle: the chords follow it.
    await home(page).locator('.home-key .kc-min-1').click(); // E minor
    await expect(next.locator('.hk-next-chords')).toHaveText('Em – C – D');
    // A major key cannot hold "i": the degrees stay, the chords leave.
    await home(page).locator('.home-key .kc-maj-0').click(); // C major
    await expect(next.locator('.hk-next-deg')).toHaveText('i – VI – VII');
    await expect(next.locator('.hk-next-chords')).toHaveCount(0);
  });

  test('Gate n · up next: degrees with a suffix (i5, V7) leave the chords out; no changes, no degrees line', async ({ page }) => {
    // Gate 2: 1–4 Mastered → "5. The Sludge to Dominant Turn" (i5 – VII5 – VI5 – V7).
    const checks = { g1e0: true, g1e1: true, g1e2: true, g1e3: true };
    await openApp(page, { localState: baseState({ phaseIndex: 1, improvIndex: 1, improvChecks: checks }) });
    const next = home(page).locator('.home-key .hk-next');
    await expect(next.locator('.hk-next-label')).toHaveText(/^Gate 2 · up next$/i);
    await expect(next.locator('.hk-next-deg')).toHaveText('i5 – VII5 – VI5 – V7');
    await expect(next.locator('.hk-next-chords')).toHaveCount(0);
    // Gate 1 · 1 "One-String Doom" has no changes: its name and track only, no degrees line.
    await page.evaluate((k) => { const s = JSON.parse(localStorage.getItem(k)); s.improvIndex = 0; s.improvChecks = {}; localStorage.setItem(k, JSON.stringify(s)); }, STORAGE_KEY);
    await page.reload();
    await expect(next.locator('.hk-next-title')).toHaveText('One-String Doom');
    await expect(next.locator('.hk-next-line')).toHaveCount(0);
    await expect(next.locator('.hk-next-track')).toHaveText('Heavy Stoner/Doom drone');
  });

  test('Gate n · up next: nothing when every exercise of the current Gate is Mastered', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, improvIndex: 0, improvChecks: { g0e0: true, g0e1: true, g0e2: true, g0e3: true } }) });
    await expect(home(page).locator('.home-key .hk-next')).toHaveCount(0);
  });

  test('showing HOME, This week and up next writes nothing', async ({ page }) => {
    await openApp(page, { localState: progressState({ streakDates: LOGGED }) });
    const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    await openView(page, 'daily');
    await openView(page, 'home');
    await home(page).locator('.home-key .kc-min-1').click();
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
    expect(await cloudWrites(page)).toEqual([]);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('no This week on the phone; the streak pill stays in the header', async ({ page }) => {
    await openApp(page, { localState: progressState({ streakDates: LOGGED }) });
    await expect(week(page)).toBeHidden();
    await expect(home(page).locator('.page-head .streak-pill')).toBeVisible();
    await expect(home(page).locator('.page-head .home-streak')).toBeHidden();
    // One column as before: rails, briefing, key, calendar; no sideways scroll.
    const tops = await page.evaluate(() => ['.home-progress', '.home-brief', '.home-key', '.home-calendar']
      .map((s) => document.querySelector('#panel-home ' + s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
