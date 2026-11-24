// Phase 1.5: IMPROV (the 5 Gates) as it behaves on main TODAY (fixed clock, Europe/Lisbon).
// Current IMPROV behaviour is protected until Phase 7 (D50: current exercises and progress migrate
// to Level 1), so its state keys (improvIndex, improvChecks "g{gate}e{exercise}") must not change
// silently. Tests named "current behaviour:" document known problems on purpose.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const improv = (page) => page.locator('#panel-improv');
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
  const btn = nav.locator(`[data-action="go"][data-view="${view}"]`);
  // Slice 4.2a (D119): on the phone, Library and Tools (SETUP) are opened from the More sheet.
  if (await btn.count()) await btn.click();
  else {
    await nav.locator('[data-action="more"]').click();
    await page.locator(`#panel-more [data-action="go"][data-view="${view}"]`).first().click();
  }
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

const masteryBtn = (scope, g, e) => scope.locator(`[data-action="togimprov"][data-g="${g}"][data-e="${e}"]`);
const allMastered = (g, n) => Object.fromEntries(Array.from({ length: n }, (_, e) => [`g${g}e${e}`, true]));
// Slice 4.8c (D139): the target card, the Gate card and the Gates list as drawn on the 4.6 boards.
const target = (page) => improv(page).locator('.improv-target');
const gateCard = (page, title) => improv(page).locator('.improv-gate', { hasText: title });
const lockedRow = (page, n, title) => improv(page).locator('.improv-row.locked', { hasText: `Gate ${n}` }).filter({ hasText: title });

test.describe('gates', () => {
  test('a new user sees Gate 1 open with 4 exercises and Gates 2–5 locked', async ({ page }, testInfo) => {
    const monitor = await openApp(page);
    await goTo(page, 'improv');
    const open = gateCard(page, 'Gate 1 · The Horizontal Prison');
    await expect(open).toBeVisible();
    await expect(open.locator('[data-action="togimprov"]')).toHaveCount(4);
    await expect(open.locator('[data-action="togimprov"]').first()).toHaveText('Unmastered');
    for (let i = 1; i < GATES.length; i++) {
      await expect(lockedRow(page, i + 1, GATES[i].title)).toBeVisible();
      await expect(lockedRow(page, i + 1, GATES[i].title).locator('[aria-label="Locked"]')).toHaveCount(1);
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
    await expect(improv(page).locator('[data-action="advanceimprov"]')).toHaveText('Unlock Gate 2');
  });

  test('Unlock moves to Gate 2; Gate 1 folds into a done row that still lists its exercises', async ({ page }) => {
    await openApp(page, { localState: baseState({ improvChecks: allMastered(0, 4) }) });
    await goTo(page, 'improv');
    await improv(page).locator('[data-action="advanceimprov"]').click();
    await expect(toast(page)).toHaveText('New Gate Unlocked!');
    expect((await localSaved(page)).improvIndex).toBe(1);

    await expect(gateCard(page, 'Gate 2 · The Chord Tone Architect').locator('[data-action="togimprov"]')).toHaveCount(5);
    const done = improv(page).locator('[data-acc="improvG0"]');
    await expect(done).toContainText('Gate 1');
    await expect(done).toContainText('The Horizontal Prison');
    await expect(done).toContainText('Mastered');
    await expect(done).toHaveAttribute('aria-expanded', 'false');
    await done.click();
    await expect(improv(page).locator('[data-acc="improvG0"]')).toHaveAttribute('aria-expanded', 'true');
    await expect(improv(page).locator('.improv-row-wrap:has([data-acc="improvG0"]) .improv-sub')).toHaveCount(4);
    // Slice 4.10m (D167; changed on purpose, D107 point 4): with the Expression Track gone from LIBRARY, a passed Gate's
    // exercises keep their Mastered button in the opened row (and only there).
    await expect(masteryBtn(improv(page), 0, 0)).toHaveCount(1);
    await expect(improv(page).locator('.improv-list').locator('[data-action="togimprov"][data-g="0"][data-e="0"]')).toHaveCount(1);
  });

  test('all 5 gates passed: the mastered message, no target, no open gate', async ({ page }) => {
    const checks = Object.assign({}, ...GATES.map((g, i) => allMastered(i, g.n)));
    await openApp(page, { localState: baseState({ improvIndex: 5, improvChecks: checks }) });
    await goTo(page, 'improv');
    await expect(improv(page)).toContainText('YOU HAVE MASTERED THE 5 GATES!');
    await expect(target(page)).toHaveCount(0);
    await expect(improv(page).locator('[data-action="togimprov"]')).toHaveCount(0);
    for (let i = 0; i < GATES.length; i++) {
      await expect(improv(page).locator(`[data-acc="improvG${i}"]`)).toContainText(`Gate ${i + 1}`);
      await expect(improv(page).locator(`[data-acc="improvG${i}"]`)).toContainText('Mastered');
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
      await expect(target(page).locator('.improv-key')).toHaveText(c.key);
      await expect(target(page).locator('.improv-style')).toHaveText(c.style);
    });
  }
});

// Slice 4.10k (D165): the Expression Track left LIBRARY (it lives here). The Library-side tests went with it (D107 point 5);
// the marks are checked here on this page only.
test.describe('Marks on IMPROV (saved and shown again)', () => {
  test('a mark made on IMPROV is saved and still shown after a reload', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'improv');
    await masteryBtn(improv(page), 0, 1).click();
    await expect(masteryBtn(improv(page), 0, 1)).toHaveText('✓ Mastered');
    expect((await localSaved(page)).improvChecks).toEqual({ g0e1: true });
    await page.reload();
    await goTo(page, 'improv');
    await expect(masteryBtn(improv(page), 0, 1)).toHaveText('✓ Mastered');
  });
});
