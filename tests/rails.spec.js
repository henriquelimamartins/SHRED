// Slice 4.4 (DECISIONS D19a, D116, D117, D123): pillar rails.
// - Technique rail: phase and phase % (same calculation as before, D20); completed phases full, current a ring,
//   later empty; the line fills only up to the current phase. Hidden with the BHGS pack off (D113).
// - Improv rail: exactly what the IMPROV page shows (D116): current Gate and its marked exercises.
// - Theory rail: Level 1, "Not started" until Theory v1 (owner, D123); the legacy DOJO XP is not used.
// - Placement: HOME (all rails), desktop sidebar (hidden on HOME), top of the IMPROV and THEORY pages on the phone,
//   TECHNIQUE page header. Rails are drawn with no inline style. Showing them writes nothing.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, settle } = require('./support/app');
const { baseState, checksFor } = require('./support/fixtures');

const rail = (scope, id) => scope.locator(`[data-rail="${id}"]`);
const states = (r) => r.locator('.rail-node').evaluateAll((els) => els.map((e) => e.dataset.state));

const sample = () => baseState({
  phaseIndex: 1,
  checks: checksFor(['p1.c.0', 'p1.c.1', 'p1.c.2', 'p1.c.3', 'p1.e.0', 'p1.e.1', 'p1.e.2', 'p1.s.0', 'p1.s.1']),
  chop: { alt: 3, sweep: 3, legato: 3, econ: 2, tap: 1 },
  testLevel: { alt: 2, sweep: 1, legato: 1, econ: 1, tap: 0, ult: 1 },
  improvIndex: 1,
  improvChecks: { g0e0: true, g0e1: true, g1e0: true, g1e2: true },
  dojo: { xp: 1500, level: 11, unlockedCodexes: [1, 2], readCodexes: [], audioMuted: false },
});

test('HOME shows the three rails with real values', async ({ page }, testInfo) => {
  const monitor = await openApp(page, { localState: sample() });
  const home = page.locator('#panel-home');
  const tech = rail(home, 'technique');
  await expect(tech.locator('.rail-head')).toHaveText(/Technique · Phase 1\s*54%/);
  await expect(tech).toHaveAttribute('aria-label', 'Technique: Phase 1, 54%');
  expect(await states(tech)).toEqual(['done', 'current', 'future', 'future', 'future']);
  await expect(tech.locator('.rail-line-fill')).toHaveClass(/fill-1/);
  expect(await tech.locator('.rail-labels span').allTextContents()).toEqual(['P0', 'P1', 'P2', 'P3', 'P4']);

  const imp = rail(home, 'improv');
  await expect(imp.locator('.rail-head')).toHaveText(/Improvisation · Gate 2\s*2\/\d+/);
  expect(await states(imp)).toEqual(['done', 'current', 'future', 'future', 'future']);
  expect(await imp.locator('.rail-labels span').allTextContents()).toEqual(['G1', 'G2', 'G3', 'G4', 'G5']);

  const th = rail(home, 'theory');
  await expect(th.locator('.rail-head')).toHaveText(/Theory · Level 1\s*Not started/);
  expect(await states(th)).toEqual(['current', 'future', 'future', 'future', 'future']);
  await expect(th.locator('.rn-fill')).toHaveCount(0); // nothing filled: no invented progress (D71)
  expect(await home.locator('.rails-group').allTextContents()).toEqual(['BHGS Roadmap', 'Musical Development']);
  await page.screenshot({ path: testInfo.outputPath('home-rails.png') });
  expect(monitor.pageErrors).toEqual([]);
});

test('the Improv rail matches the IMPROV page (D116)', async ({ page }) => {
  await openApp(page, { localState: sample() });
  const total = await page.evaluate(async () => (await import('/js/data/improv.js?v=4')).IMPROV_GATES[1].exercises.length);
  await expect(rail(page.locator('#panel-home'), 'improv').locator('.rail-status')).toHaveText(`2/${total}`);
  await expect(rail(page.locator('#panel-home'), 'improv')).toHaveAttribute('data-pct', String(Math.round(200 / total)));
  // Marking one more exercise on the IMPROV page moves the rail.
  await openView(page, 'improv');
  await page.locator('#panel-improv [data-action="togimprov"][data-g="1"][data-e="1"]').click();
  await settle(page);
  // Slice 4.10e (D152 point 11): the IMPROV page rail shows the % (the header subtitle gives the count).
  await expect(rail(page.locator('#panel-improv .pillar-rail'), 'improv')).toHaveAttribute('data-pct', String(Math.round(300 / total)));
  await expect(rail(page.locator('#panel-improv .pillar-rail'), 'improv').locator('.rail-status')).toHaveText(`${Math.round(300 / total)}%`);
  await expect(rail(page.locator('#panel-home'), 'improv').locator('.rail-status')).toHaveText(`3/${total}`);
});

test('all Gates done: the Improv rail is complete', async ({ page }) => {
  await openApp(page, { localState: { ...sample(), improvIndex: 5 } });
  const imp = rail(page.locator('#panel-home'), 'improv');
  await expect(imp.locator('.rail-head')).toHaveText(/Improvisation · Gate 5\s*Complete/);
  expect(await states(imp)).toEqual(['done', 'done', 'done', 'done', 'done']);
  await expect(imp.locator('.rail-line-fill')).toHaveClass(/fill-4/);
});

test('last phase: four discs, the line full, the current ring partly filled', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 4 }) });
  const tech = rail(page.locator('#panel-home'), 'technique');
  expect(await states(tech)).toEqual(['done', 'done', 'done', 'done', 'current']);
  await expect(tech.locator('.rail-line-fill')).toHaveClass(/fill-4/);
});

test('a partly done phase draws the ring outline along the top and the bottom', async ({ page }) => {
  await openApp(page, { localState: sample() });
  const cur = rail(page.locator('#panel-home'), 'technique').locator('.rail-node[data-state="current"]');
  await expect(cur.locator('path.rn-fill')).toHaveCount(2);
});

test('a phase at 0% draws no filled outline', async ({ page }) => {
  await openApp(page, { localState: baseState() });
  const zero = rail(page.locator('#panel-home'), 'technique').locator('.rail-node[data-state="current"]');
  await expect(zero.locator('.rn-fill')).toHaveCount(0);
});

test('rails are drawn without inline styles and showing them writes nothing', async ({ page }) => {
  await openApp(page, { localState: sample() });
  const before = await page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'));
  for (const v of ['technique', 'improv', 'dojo', 'home']) await openView(page, v);
  expect(await page.locator('.rail [style]').count()).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'))).toBe(before);
  expect(await cloudWrites(page)).toEqual([]);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop sidebar');

  test('sidebar rails on every page, HOME included; HOME shows no Progress card on desktop (D127, owner)', async ({ page }) => {
    await openApp(page, { localState: sample() });
    await expect(page.locator('#sidebar-rails')).toBeVisible();
    await expect(page.locator('#sidebar-rails [data-rail]')).toHaveCount(3);
    await expect(page.locator('#panel-home .home-progress')).toBeHidden();
    for (const v of ['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup']) {
      await openView(page, v);
      await expect(page.locator('#sidebar-rails')).toBeVisible();
      await expect(page.locator('#sidebar-rails [data-rail]')).toHaveCount(3);
    }
    // On desktop the pillar pages do not repeat the rail (the sidebar has it); TECHNIQUE keeps it in its header.
    await expect(page.locator('#panel-improv .pillar-rail')).toBeHidden();
    await expect(page.locator('#panel-dojo .pillar-rail')).toBeHidden();
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('IMPROV and THEORY pages show their rail on top; TECHNIQUE in its header (at most 120 px)', async ({ page }, testInfo) => {
    await openApp(page, { localState: sample() });
    await expect(page.locator('#sidebar-rails')).toBeHidden();
    await openView(page, 'improv');
    await expect(page.locator('#panel-improv .pillar-rail [data-rail="improv"]')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('improv-phone.png') });
    await openView(page, 'dojo');
    await expect(page.locator('#panel-dojo .pillar-rail [data-rail="theory"]')).toBeVisible();
    await openView(page, 'technique');
    await expect(page.locator('#panel-technique .tech-header [data-rail="technique"]')).toBeVisible();
    const h = await page.locator('#panel-technique .tech-header').evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(120);
  });
});

test('pack off: no Technique rail anywhere; Improvisation and Theory remain', async ({ page }) => {
  await openApp(page, { bhgsPack: false, localState: sample() });
  await expect(page.locator('[data-rail="technique"]')).toHaveCount(0);
  await expect(page.locator('#panel-home [data-rail]')).toHaveCount(2);
  expect(await page.locator('#panel-home .rails-group').allTextContents()).toEqual(['Musical Development']);
  await openView(page, 'improv');
  await expect(page.locator('#sidebar-rails [data-rail="technique"]')).toHaveCount(0);
});

test('the legacy DOJO level does not move the Theory rail', async ({ page }) => {
  await openApp(page, { localState: { ...sample(), dojo: { xp: 99999, level: 41, unlockedCodexes: [1, 2, 3, 4, 5], readCodexes: [], audioMuted: false } } });
  const th = rail(page.locator('#panel-home'), 'theory');
  await expect(th).toHaveAttribute('data-cur', '0');
  await expect(th.locator('.rail-status')).toHaveText('Not started');
  expect((await localSaved(page)).dojo.level).toBe(41);
});
