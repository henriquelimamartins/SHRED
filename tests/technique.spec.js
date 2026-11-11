// Phase 1.3: Technique (BHGS) behaviour on main. D20 protects these calculations and state keys:
// any change to them must make these tests fail.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, unexpectedConsoleErrors } = require('./support/app');
const {
  baseState, TECHNIQUE_PHASES, CHOP_KEYS, TEST_KEYS, phaseKeys, checksFor, levels,
} = require('./support/fixtures');

const home = (page) => page.locator('#panel-home');
const library = (page) => page.locator('#panel-library');

async function homePhaseStat(page) {
  const stat = home(page).locator('.statrow .stat').first();
  return { pct: await stat.locator('.bignum').textContent(), label: await stat.locator('.lbl').textContent() };
}

/** Widths of the 5 segments of the red phase bar at the top, e.g. ['100%', '38%', '0%', '0%', '0%']. */
async function topBar(page) {
  return page.locator('#topbar .pseg i').evaluateAll((els) => els.map((e) => e.style.width));
}

async function currentPhaseLabel(page) {
  return page.locator('#topbar .plabels span.cur').textContent();
}

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

/** Opens Library → Shred Roadmap → the given phase. */
async function openLibraryPhase(page, index) {
  await goTo(page, 'library');
  await library(page).locator('[data-acc="shredroadmap"]').click();
  await library(page).locator(`[data-acc="p${index}"]`).click();
}

const stepper = (scope, action, key, d) => scope.locator(`[data-action="${action}"][data-t="${key}"][data-d="${d}"]`);
const stepperValue = (scope, action, key) =>
  stepper(scope, action, key, 1).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');

test.describe('phase percentage', () => {
  test('Setup phase counts its 2 prerequisites', async ({ page }) => {
    await openApp(page);
    expect(await homePhaseStat(page)).toEqual({ pct: '0%', label: 'Setup' });
    expect(await topBar(page)).toEqual(['0%', '0%', '0%', '0%', '0%']);
    expect(await currentPhaseLabel(page)).toBe('Phase 0');
  });

  test('Setup phase with 1 of 2 prerequisites is 50%', async ({ page }) => {
    await openApp(page, { localState: baseState({ checks: checksFor(['p0.pre.0']) }) });
    expect(await homePhaseStat(page)).toEqual({ pct: '50%', label: 'Setup' });
    expect(await topBar(page)).toEqual(['50%', '0%', '0%', '0%', '0%']);
  });

  test('Beginner counts 13 items + 5 chops at target + 6 tests at requirement (24 in total)', async ({ page }) => {
    // 6 items done, 2 chops at target 3 (alt, sweep), 1 test at requirement 2 (alt) → 9/24 = 37.5% → 38%
    const state = baseState({
      phaseIndex: 1,
      checks: checksFor(['p1.c.0', 'p1.c.1', 'p1.c.2', 'p1.c.3', 'p1.e.0', 'p1.e.1']),
      chop: { alt: 3, sweep: 5, legato: 2, econ: 0, tap: 0 },
      testLevel: { alt: 2, sweep: 1, legato: 0, econ: 0, tap: 0, ult: 0 },
    });
    await openApp(page, { localState: state });
    expect(await homePhaseStat(page)).toEqual({ pct: '38%', label: 'Beginner' });
    // Earlier phases show 100%, later phases 0%.
    expect(await topBar(page)).toEqual(['100%', '38%', '0%', '0%', '0%']);
    expect(await currentPhaseLabel(page)).toBe('Phase 1');
  });

  test('Pro (no concept videos) counts 12 items + 5 chops + 6 tests (23 in total)', async ({ page }) => {
    // all 12 items, nothing else → 12/23 = 52.17% → 52%
    const state = baseState({ phaseIndex: 4, checks: checksFor(phaseKeys(4)) });
    await openApp(page, { localState: state });
    expect(await homePhaseStat(page)).toEqual({ pct: '52%', label: 'Pro' });
    expect(await topBar(page)).toEqual(['100%', '100%', '100%', '100%', '52%']);
  });
});

test.describe('checklist items', () => {
  test('Mastered stores today\'s date; unmarking stores false', async ({ page }, testInfo) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openLibraryPhase(page, 1);
    await page.screenshot({ path: testInfo.outputPath('library-beginner.png') });

    const btn = library(page).locator('[data-action="togm"][data-key="p1.e.0"]');
    await expect(btn).toHaveText('Unmastered');
    await btn.click();
    await expect(btn).toHaveText('✓ Mastered');
    expect((await localSaved(page)).checks['p1.e.0']).toBe('2026-11-10');

    await btn.click();
    await expect(btn).toHaveText('Unmastered');
    expect((await localSaved(page)).checks['p1.e.0']).toBe(false);
  });

  test('concept videos use Watched; Setup prerequisites use Completed', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openLibraryPhase(page, 1);
    const video = library(page).locator('[data-action="togm"][data-key="p1.c.0"]');
    await expect(video).toHaveText('Unwatched');
    await video.click();
    await expect(video).toHaveText('✓ Watched');

    await library(page).locator('[data-acc="p1"]').click(); // close p1
    await library(page).locator('[data-acc="p0"]').click();
    const prereq = library(page).locator('[data-action="togm"][data-key="p0.pre.1"]');
    await expect(prereq).toHaveText('Incomplete');
    await prereq.click();
    await expect(prereq).toHaveText('✓ Completed');

    const checks = (await localSaved(page)).checks;
    expect(checks['p1.c.0']).toBe('2026-11-10');
    expect(checks['p0.pre.1']).toBe('2026-11-10');
  });
});

test.describe('steppers stay within their limits', () => {
  test('chop-builders: 0 to 10 (shown as level/phase target)', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1, chop: { alt: 10, sweep: 0, legato: 4, econ: 0, tap: 0 } }) });
    await openLibraryPhase(page, 1);
    const scope = library(page);

    // Beginner chop target is 3: the display is "level/3" and turns "hit" at 3 or more.
    await stepper(scope, 'chop', 'alt', 1).click();
    await expect(stepperValue(scope, 'chop', 'alt')).toHaveText('10/3');
    await expect(stepperValue(scope, 'chop', 'alt')).toHaveClass(/hit/);
    await stepper(scope, 'chop', 'sweep', -1).click();
    await expect(stepperValue(scope, 'chop', 'sweep')).toHaveText('0/3');
    await expect(stepperValue(scope, 'chop', 'sweep')).not.toHaveClass(/hit/);
    await stepper(scope, 'chop', 'legato', 1).click();
    await expect(stepperValue(scope, 'chop', 'legato')).toHaveText('5/3');

    expect((await localSaved(page)).chop).toEqual({ alt: 10, sweep: 0, legato: 5, econ: 0, tap: 0 });
  });

  test('transition tests: 0 to 5', async ({ page }) => {
    await openApp(page, { localState: baseState({ testLevel: { alt: 5, sweep: 0, legato: 2, econ: 0, tap: 0, ult: 0 } }) });
    const scope = home(page);

    await stepper(scope, 'test', 'alt', 1).click();
    await expect(stepperValue(scope, 'test', 'alt')).toHaveText('5/5');
    await stepper(scope, 'test', 'sweep', -1).click();
    await expect(stepperValue(scope, 'test', 'sweep')).toHaveText('0/5');
    await stepper(scope, 'test', 'legato', -1).click();
    await expect(stepperValue(scope, 'test', 'legato')).toHaveText('1/5');

    expect((await localSaved(page)).testLevel).toEqual({ alt: 5, sweep: 0, legato: 1, econ: 0, tap: 0, ult: 0 });
  });

  test('bonus content: within each item\'s maximum', async ({ page }) => {
    await openApp(page, { localState: baseState({ bonusLevel: { pentatonics: 5 } }) });
    await goTo(page, 'library');
    await library(page).locator('[data-acc="bonuslib"]').click();
    const scope = library(page);
    const bonus = (key, d) => scope.locator(`[data-action="bonuslvl"][data-k="${key}"][data-d="${d}"]`);
    const bonusValue = (key) => bonus(key, 1).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');

    await bonus('pentatonics', 1).click();
    await expect(bonusValue('pentatonics')).toHaveText('5/5');
    await bonus('metalLicks', 1).click();
    await expect(bonusValue('metalLicks')).toHaveText('1/10');
    await bonus('shredders', -1).click();
    await expect(bonusValue('shredders')).toHaveText('0/10');

    expect((await localSaved(page)).bonusLevel).toEqual({ pentatonics: 5, metalLicks: 1, shredders: 0 });
  });
});

test.describe('advancing', () => {
  test('completing the last Setup prerequisite moves to Beginner automatically', async ({ page }) => {
    const monitor = await openApp(page, { localState: baseState({ checks: checksFor(['p0.pre.0']) }) });
    await openLibraryPhase(page, 0);
    await library(page).locator('[data-action="togm"][data-key="p0.pre.1"]').click();

    await expect(page.locator('#toast')).toHaveText('🔥 Phase unlocked: Beginner!');
    expect((await localSaved(page)).phaseIndex).toBe(1);
    expect(await currentPhaseLabel(page)).toBe('Phase 1');
    expect(await topBar(page)).toEqual(['100%', '0%', '0%', '0%', '0%']);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('reaching the last test requirement in Beginner moves to Intermediate automatically', async ({ page }) => {
    const state = baseState({
      phaseIndex: 1,
      checks: checksFor(phaseKeys(1)),
      chop: levels(CHOP_KEYS, 3),
      testLevel: { ...levels(TEST_KEYS, 2), ult: 1 },
    });
    await openApp(page, { localState: state });
    expect((await homePhaseStat(page)).pct).toBe('96%'); // 23/24

    await stepper(home(page), 'test', 'ult', 1).click();
    await expect(page.locator('#toast')).toHaveText('🔥 Phase unlocked: Intermediate!');
    expect((await localSaved(page)).phaseIndex).toBe(2);
    expect(await homePhaseStat(page)).toEqual({ pct: '0%', label: 'Intermediate' });
  });

  test('100% on the last phase (Pro) stays on Pro', async ({ page }) => {
    const state = baseState({
      phaseIndex: 4,
      checks: checksFor(phaseKeys(4)),
      chop: levels(CHOP_KEYS, 10),
      testLevel: { ...levels(TEST_KEYS, 5), ult: 4 },
    });
    await openApp(page, { localState: state });
    await stepper(home(page), 'test', 'ult', 1).click();
    await expect(stepperValue(home(page), 'test', 'ult')).toHaveText('5/5');
    expect(await homePhaseStat(page)).toEqual({ pct: '100%', label: 'Pro' });
    expect((await localSaved(page)).phaseIndex).toBe(4);
  });
});

test.describe('Jump to phase', () => {
  const select = (page) => home(page).locator('select[data-action="setphase"]');

  test('jumping forward marks earlier phases complete and raises chops/tests to the target', async ({ page }) => {
    await openApp(page, { localState: baseState({ chop: { alt: 7, sweep: 0, legato: 0, econ: 0, tap: 0 } }) });
    await select(page).selectOption('3');

    await expect(page.locator('#toast')).toHaveText('Now on Advanced - earlier phases marked complete');
    const saved = await localSaved(page);
    expect(saved.phaseIndex).toBe(3);
    for (const key of [...phaseKeys(0), ...phaseKeys(1), ...phaseKeys(2)]) expect(saved.checks[key], key).toBe(true);
    for (const key of phaseKeys(3)) expect(saved.checks[key], key).toBeUndefined();
    // Raised to the highest completed target (Intermediate: chop 6, test 3); higher values are kept.
    expect(saved.chop).toEqual({ alt: 7, sweep: 6, legato: 6, econ: 6, tap: 6 });
    expect(saved.testLevel).toEqual(levels(TEST_KEYS, 3));
    expect(await topBar(page)).toEqual(['100%', '100%', '100%', '0%', '0%']);
  });

  const advancedState = () =>
    baseState({
      phaseIndex: 3,
      checks: checksFor(['p1.e.0', 'p2.e.0', 'p3.e.0']),
      chop: levels(CHOP_KEYS, 8),
      testLevel: levels(TEST_KEYS, 4),
    });

  test('jumping back asks first; Cancel changes nothing', async ({ page }) => {
    await openApp(page, { localState: advancedState() });
    await select(page).selectOption('1');
    await expect(home(page)).toContainText('Jump back to Phase 1?');

    await home(page).locator('[data-action="canceljump"]').click();
    await expect(select(page)).toHaveValue('3');
    expect(await localSaved(page)).toEqual(advancedState());
  });

  test('jumping back + Confirm resets later phases\' checklists but keeps chops and tests', async ({ page }) => {
    await openApp(page, { localState: advancedState() });
    await select(page).selectOption('1');
    await home(page).locator('[data-action="confirmjump"]').click();

    await expect(page.locator('#toast')).toHaveText('Now on Beginner - later phases reset');
    const saved = await localSaved(page);
    expect(saved.phaseIndex).toBe(1);
    expect(saved.checks).toEqual({ 'p1.e.0': '2026-11-01' });
    expect(saved.chop).toEqual(levels(CHOP_KEYS, 8));
    expect(saved.testLevel).toEqual(levels(TEST_KEYS, 4));
    expect(await currentPhaseLabel(page)).toBe('Phase 1');
  });
});
