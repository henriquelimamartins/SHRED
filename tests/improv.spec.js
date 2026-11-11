// Phase 1.5: IMPROV (the 5 Gates) as it behaves on main TODAY (fixed clock, Europe/Lisbon).
// Current IMPROV behaviour is protected until Phase 7 (D50: current exercises and progress migrate
// to Level 1), so its state keys (improvIndex, improvChecks "g{gate}e{exercise}") must not change
// silently. Tests named "current behaviour:" document known problems on purpose.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const improv = (page) => page.locator('#panel-improv');
const library = (page) => page.locator('#panel-library');
const toast = (page) => page.locator('#toast');

// Gate titles and exercise counts on main.
const GATES = [
  { title: 'The Horizontal Prison', n: 4 },
  { title: 'The Chord Tone Architect', n: 5 },
  { title: 'The Rhythmic Displacer', n: 4 },
  { title: 'The Modal Alchemist', n: 6 },
  { title: 'Total Audiation', n: 4 },
];

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

const masteryBtn = (scope, g, e) => scope.locator(`[data-action="togimprov"][data-g="${g}"][data-e="${e}"]`);
const allMastered = (g, n) => Object.fromEntries(Array.from({ length: n }, (_, e) => [`g${g}e${e}`, true]));
const target = (page) => improv(page).locator('.note.purple', { hasText: 'Daily Transposition Target' });

test.describe('gates', () => {
  test('a new user sees Gate 1 open with 4 exercises and Gates 2–5 locked', async ({ page }, testInfo) => {
    const monitor = await openApp(page);
    await goTo(page, 'improv');
    const open = improv(page).locator('.card', { hasText: 'Gate 1: The Horizontal Prison' });
    await expect(open).toBeVisible();
    await expect(open.locator('[data-action="togimprov"]')).toHaveCount(4);
    await expect(open.locator('[data-action="togimprov"]').first()).toHaveText('Unmastered');
    for (let i = 1; i < GATES.length; i++) {
      await expect(improv(page).locator('.card h3', { hasText: `🔒 Gate ${i + 1}: ${GATES[i].title}` })).toBeVisible();
    }
    await expect(improv(page).locator('[data-action="advanceimprov"]')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('improv-gate1.png'), fullPage: true });
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
  });

  test('marking an exercise stores improvChecks.g0e0; unmarking stores false; survives reload', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'improv');
    await masteryBtn(improv(page), 0, 0).click();
    await expect(masteryBtn(improv(page), 0, 0)).toHaveText('✓ Mastered');
    expect((await localSaved(page)).improvChecks).toEqual({ g0e0: true });

    await page.reload();
    await goTo(page, 'improv');
    await expect(masteryBtn(improv(page), 0, 0)).toHaveText('✓ Mastered');

    await masteryBtn(improv(page), 0, 0).click();
    await expect(masteryBtn(improv(page), 0, 0)).toHaveText('Unmastered');
    expect((await localSaved(page)).improvChecks).toEqual({ g0e0: false });
  });

  test('IMPROV marks do not log practice, the streak or Technique progress', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'improv');
    await masteryBtn(improv(page), 0, 1).click();
    const saved = await localSaved(page);
    expect(saved.streakDates).toEqual([]);
    expect(saved.practiced).toEqual({});
    expect(saved.checks).toEqual({});
    expect(saved.phaseIndex).toBe(0);
  });

  test('the Unlock button appears only when every exercise of the gate is mastered', async ({ page }) => {
    const three = { g0e0: true, g0e1: true, g0e2: true };
    await openApp(page, { localState: baseState({ improvChecks: three }) });
    await goTo(page, 'improv');
    await expect(improv(page).locator('[data-action="advanceimprov"]')).toHaveCount(0);
    await masteryBtn(improv(page), 0, 3).click();
    await expect(improv(page).locator('[data-action="advanceimprov"]')).toHaveText('🔓 Unlock Gate 2');
  });

  test('Unlock moves to Gate 2; Gate 1 folds into a done row that still lists its exercises', async ({ page }) => {
    await openApp(page, { localState: baseState({ improvChecks: allMastered(0, 4) }) });
    await goTo(page, 'improv');
    await improv(page).locator('[data-action="advanceimprov"]').click();
    await expect(toast(page)).toHaveText('🔓 New Gate Unlocked!');
    expect((await localSaved(page)).improvIndex).toBe(1);

    await expect(improv(page).locator('.card', { hasText: 'Gate 2: The Chord Tone Architect' }).locator('[data-action="togimprov"]')).toHaveCount(5);
    const done = improv(page).locator('[data-acc="improvG0"]');
    await expect(done).toContainText('✓ GATE 1: THE HORIZONTAL PRISON');
    await done.click();
    await expect(improv(page).locator('.acc:has([data-acc="improvG0"]) .accbody p')).toHaveCount(4);
    // Gate 1's exercises can no longer be toggled from IMPROV.
    await expect(masteryBtn(improv(page), 0, 0)).toHaveCount(0);
  });

  test('all 5 gates passed: the mastered message, no target, no open gate', async ({ page }) => {
    const checks = Object.assign({}, ...GATES.map((g, i) => allMastered(i, g.n)));
    await openApp(page, { localState: baseState({ improvIndex: 5, improvChecks: checks }) });
    await goTo(page, 'improv');
    await expect(improv(page)).toContainText('YOU HAVE MASTERED THE 5 GATES!');
    await expect(target(page)).toHaveCount(0);
    await expect(improv(page).locator('[data-action="togimprov"]')).toHaveCount(0);
    for (let i = 0; i < GATES.length; i++) {
      await expect(improv(page).locator(`[data-acc="improvG${i}"]`)).toContainText(`✓ GATE ${i + 1}`);
    }
  });

  test('signed in: a mark writes the full state to users/{uid} only', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
    await goTo(page, 'improv');
    await masteryBtn(improv(page), 0, 2).click();
    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
    expect(writes[writes.length - 1].data.improvChecks).toEqual({ g0e2: true });
  });
});

test.describe('daily transposition target', () => {
  // The key rotates through 12 keys by local day of the year (day 314 = 10 Nov 2026 → 314 % 12 = 2).
  const cases = [
    { now: '2026-11-10T12:00:00Z', key: 'C# minor', style: 'Sabbath / Doom Core' },
    { now: '2026-11-11T12:00:00Z', key: 'C minor', style: 'Sludge / Heavy Drop' },
    { now: '2026-11-20T12:00:00Z', key: 'E minor', style: 'Classic Heavy / Thrash' }, // day 324 % 12 = 0
    { now: '2027-01-01T12:00:00Z', key: 'B minor', style: 'Prog / Melodic Death' }, // day 1
  ];
  for (const c of cases) {
    test(`${c.now.slice(0, 10)} → ${c.key}`, async ({ page }) => {
      await openApp(page, { now: c.now, localState: baseState({ practicedDate: c.now.slice(0, 10) }) });
      await goTo(page, 'improv');
      await expect(target(page).locator('b').first()).toHaveText(c.key);
      await expect(target(page)).toContainText(`(${c.style})`);
    });
  }
});

test.describe('Expression Track in Library (same marks)', () => {
  test('a mark made in Library shows in IMPROV and vice versa', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'library');
    await library(page).locator('[data-acc="expression"]').click();
    await library(page).locator('[data-acc="libGate0"]').click();
    await masteryBtn(library(page), 0, 1).click();
    await expect(masteryBtn(library(page), 0, 1)).toHaveText('✓ Mastered');
    await goTo(page, 'improv');
    await expect(masteryBtn(improv(page), 0, 1)).toHaveText('✓ Mastered');
    expect((await localSaved(page)).improvChecks).toEqual({ g0e1: true });
  });

  test('current behaviour: exercises of a locked gate can be marked from Library', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'library');
    await library(page).locator('[data-acc="expression"]').click();
    await library(page).locator('[data-acc="libGate4"]').click();
    await masteryBtn(library(page), 4, 0).click();
    const saved = await localSaved(page);
    expect(saved.improvChecks).toEqual({ g4e0: true });
    expect(saved.improvIndex).toBe(0);
    await goTo(page, 'improv');
    await expect(improv(page).locator('.card h3', { hasText: '🔒 Gate 5: Total Audiation' })).toBeVisible();
  });

  test('current behaviour: un-marking an exercise of a passed gate does not lock that gate again', async ({ page }) => {
    await openApp(page, { localState: baseState({ improvIndex: 1, improvChecks: allMastered(0, 4) }) });
    await goTo(page, 'library');
    await library(page).locator('[data-acc="expression"]').click();
    await library(page).locator('[data-acc="libGate0"]').click();
    await masteryBtn(library(page), 0, 0).click();
    const saved = await localSaved(page);
    expect(saved.improvChecks.g0e0).toBe(false);
    expect(saved.improvIndex).toBe(1);
    await goTo(page, 'improv');
    await expect(improv(page).locator('.card', { hasText: 'Gate 2: The Chord Tone Architect' })).toBeVisible();
  });
});
