// Slice 4.10e (DECISIONS D152 points 2, 10 and 11): progress cards and pillar headers.
// Desktop: TECHNIQUE, IMPROVISATION and THEORY open with the same progress card: the rail on the left takes the room the
// text leaves; the text on the right, right-aligned, title over one line; no percentage, no "Remaining" / "Left" line,
// no full stop. Phone: no card; IMPROVISATION and THEORY get a subtitle on the right of the small "Pillar · …" line, as
// TECHNIQUE has ("G1 · n of N", "L1 · Not started"). Real values only (D71). Showing the pages writes nothing.
// Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, checksFor } = require('./support/fixtures');

// Beginner with 13 of 24 done (as in technique-page.spec.js); Gate 1 with 2 exercises mastered.
const sample = (over = {}) => baseState({
  phaseIndex: 1,
  checks: checksFor(['p1.c.0', 'p1.c.1', 'p1.c.2', 'p1.c.3', 'p1.e.0', 'p1.e.1', 'p1.e.2', 'p1.s.0', 'p1.s.1']),
  chop: { alt: 3, sweep: 3, legato: 3, econ: 2, tap: 1 },
  testLevel: { alt: 2, sweep: 1, legato: 1, econ: 1, tap: 0, ult: 1 },
  improvIndex: 0,
  improvChecks: { g0e0: true, g0e1: true },
  ...over,
});
const gates = (page) => page.evaluate(async () => (await import('/js/data/improv.js?v=4')).IMPROV_GATES.map((g) => ({ title: g.title, n: g.exercises.length })));
const panel = (page, view) => page.locator(`#panel-${view}`);
const box = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; });

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('the three pillar pages open with the progress card, real values, as drawn', async ({ page }, testInfo) => {
    const monitor = await openApp(page, { localState: sample() });
    const g = await gates(page);
    const cases = [
      ['technique', 'technique', 'Phase 1 · Beginner', '13 of 24 done in this phase', 'Beginner'],
      ['improv', 'improv', `Gate 1 · ${g[0].title}`, `2 of ${g[0].n} exercises mastered`, `2 of ${g[0].n}`],
      ['dojo', 'theory', 'Level 1 · Not started', 'Progress starts with Theory v1 (Phase 6)', 'Not started'],
    ];
    for (const [view, railId, title, line, status] of cases) {
      await openView(page, view);
      const card = panel(page, view).locator('.pillar-card');
      await expect(card).toHaveCount(1);
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute('data-card', railId);
      await expect(card.locator('.pillar-card-title')).toHaveText(title);
      await expect(card.locator('.pillar-card-line')).toHaveText(line);
      const rail = card.locator(`[data-rail="${railId}"]`);
      await expect(rail).toBeVisible();
      await expect(rail.locator('.rail-status')).toHaveText(status);
      // No percentage, no "Remaining" / "Left" line, no full stop at the end (D152 point 2).
      const text = (await card.locator('.pillar-card-text').textContent()).trim();
      expect(text).not.toMatch(/%|Remaining|Left:/);
      expect(text.endsWith('.')).toBe(false);
      // Rail left, text right, right-aligned, on one row; the rail takes the room the text leaves.
      await expect(card.locator('.pillar-card-text')).toHaveCSS('text-align', 'right');
      const c = await box(card), r = await box(rail), t = await box(card.locator('.pillar-card-text'));
      expect(t.left).toBeGreaterThan(r.right);
      expect(t.top).toBeLessThan(r.bottom);
      expect(c.right - t.right).toBeLessThan(40);
      expect(r.width).toBeGreaterThan(c.width / 2);
      // It comes right after the page header, before the page's content.
      const head = await box(panel(page, view).locator('.page-head').first());
      expect(c.top).toBeGreaterThanOrEqual(head.bottom - 1);
      expect(c.top - head.bottom).toBeLessThan(40);
      // The phone subtitle is not shown on the desktop.
      await expect(panel(page, view).locator('.page-head .pillar-sub, .page-head .tech-sub')).toBeHidden();
      await page.screenshot({ path: testInfo.outputPath(`${view}-card.png`) });
    }
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('Phase 0 card: the Setup phase and its real count', async ({ page }) => {
    await openApp(page, { localState: baseState({ checks: checksFor(['p0.pre.0']) }) });
    await openView(page, 'technique');
    const card = panel(page, 'technique').locator('.pillar-card');
    await expect(card.locator('.pillar-card-title')).toHaveText('Phase 0 · Setup');
    await expect(card.locator('.pillar-card-line')).toHaveText('1 of 2 done in this phase');
    await expect(card.locator('[data-rail="technique"] .rail-status')).toHaveText('Setup');
  });

  test('the IMPROVISATION card follows the marks', async ({ page }) => {
    await openApp(page, { localState: sample() });
    const g = await gates(page);
    await openView(page, 'improv');
    await panel(page, 'improv').locator('[data-action="togimprov"][data-g="0"][data-e="2"]').first().click();
    await settle(page);
    const card = panel(page, 'improv').locator('.pillar-card');
    await expect(card.locator('.pillar-card-line')).toHaveText(`3 of ${g[0].n} exercises mastered`);
    await expect(card.locator('[data-rail="improv"] .rail-status')).toHaveText(`3 of ${g[0].n}`);
  });

  test('all Gates done: the IMPROVISATION card says so, with the real count', async ({ page }) => {
    const all = { g0e0: true, g0e1: true, g1e0: true };
    await openApp(page, { localState: sample({ improvIndex: 5, improvChecks: all }) });
    const g = await gates(page);
    const total = g.reduce((a, x) => a + x.n, 0);
    await openView(page, 'improv');
    const card = panel(page, 'improv').locator('.pillar-card');
    await expect(card.locator('.pillar-card-title')).toHaveText('All 5 Gates complete');
    await expect(card.locator('.pillar-card-line')).toHaveText(`3 of ${total} exercises mastered`);
    await expect(card.locator('[data-rail="improv"] .rail-status')).toHaveText('Complete');
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('no progress card; IMPROVISATION and THEORY subtitles on the small line, as TECHNIQUE', async ({ page }, testInfo) => {
    const monitor = await openApp(page, { localState: sample() });
    const g = await gates(page);
    const cases = [
      ['technique', '.tech-sub', 'Beginner · 13 of 24', '.tech-header', 'technique', '54%'],
      ['improv', '.pillar-sub', `G1 · 2 of ${g[0].n}`, '.pillar-rail', 'improv', `${Math.round(200 / g[0].n)}%`],
      ['dojo', '.pillar-sub', 'L1 · Not started', '.pillar-rail', 'theory', ''],
    ];
    for (const [view, subSel, sub, railWhere, railId, status] of cases) {
      await openView(page, view);
      const p = panel(page, view);
      await expect(p.locator('.pillar-card')).toBeHidden();
      const eb = p.locator('.page-head .page-eyebrow').first();
      const s = p.locator(`.page-head ${subSel}`);
      await expect(s).toBeVisible();
      await expect(s).toHaveText(sub);
      // On the same line as "Pillar · …", on the right.
      const e = await box(eb), b = await box(s);
      expect(b.left).toBeGreaterThan(e.right);
      expect(Math.abs((b.top + b.bottom) / 2 - (e.top + e.bottom) / 2)).toBeLessThan(8);
      // The rail under it shows the % (TECHNIQUE, IMPROVISATION) or nothing (THEORY, whose subtitle gives the state).
      const r = p.locator(`${railWhere} [data-rail="${railId}"]`);
      await expect(r).toBeVisible();
      await expect(r.locator('.rail-status')).toHaveText(status);
      // Small line + rail within the 120 px header limit (D112).
      expect((await box(r)).bottom - e.top).toBeLessThanOrEqual(120);
      await page.screenshot({ path: testInfo.outputPath(`${view}-phone.png`) });
    }
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('the IMPROVISATION subtitle follows the marks', async ({ page }) => {
    await openApp(page, { localState: sample() });
    const g = await gates(page);
    await openView(page, 'improv');
    await panel(page, 'improv').locator('[data-action="togimprov"][data-g="0"][data-e="2"]').first().click();
    await settle(page);
    await expect(panel(page, 'improv').locator('.page-head .pillar-sub')).toHaveText(`G1 · 3 of ${g[0].n}`);
  });

  test('all Gates done: the IMPROVISATION subtitle reads "G5 · Complete"', async ({ page }) => {
    await openApp(page, { localState: sample({ improvIndex: 5 }) });
    await openView(page, 'improv');
    await expect(panel(page, 'improv').locator('.page-head .pillar-sub')).toHaveText('G5 · Complete');
  });
});

test('showing the three pillar pages writes nothing (device or cloud)', async ({ page }) => {
  await openApp(page, { localState: sample() });
  const before = await localSaved(page);
  for (const view of ['technique', 'improv', 'dojo']) await openView(page, view);
  expect(await localSaved(page)).toEqual(before);
  expect(await cloudWrites(page)).toEqual([]);
});
