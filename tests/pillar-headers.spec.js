// Slice 4.6b (DECISIONS D131): the pillar header on the phone.
// TECHNIQUE, IMPROVISATION and THEORY show the small "Pillar · …" line and the pillar rail under it; the large page
// title stays in the page for screen readers only; nothing is sticky (the header scrolls away with the page).
// Desktop is unchanged: every page keeps its eyebrow and large title (rails in the sidebar, D127).
// Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, STORAGE_KEY } = require('./support/app');
const { baseState, checksFor } = require('./support/fixtures');

const sample = () => baseState({
  phaseIndex: 1,
  checks: checksFor(['p1.c.0', 'p1.c.1']),
  improvIndex: 0,
  improvChecks: { g0e0: true, g0e1: true },
});

// view id, eyebrow (case-insensitive), page title, rail id, where the rail sits
const PILLARS = [
  ['technique', /pillar · bhgs roadmap/i, 'Technique', 'technique', '.tech-header'],
  ['improv', /pillar · musical development/i, 'Improvisation', 'improv', '.pillar-rail'],
  ['dojo', /pillar · musical development/i, 'Theory', 'theory', '.pillar-rail'],
];

const box = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, width: r.width, height: r.height }; });

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  for (const [view, eyebrow, title, railId, railWhere] of PILLARS) {
    test(`${title}: small line + rail, title for screen readers only`, async ({ page }) => {
      const monitor = await openApp(page, { localState: sample() });
      await openView(page, view);
      const panel = page.locator(`#panel-${view}`);
      const eb = panel.locator('.page-head .page-eyebrow').first();
      await expect(eb).toBeVisible();
      await expect(eb).toHaveText(eyebrow);
      // The title is still in the page (screen readers), but takes no visible room.
      const t = panel.locator('.page-head .page-title').first();
      await expect(t).toHaveText(title);
      const tb = await box(t);
      expect(Math.round(tb.width) <= 1 && Math.round(tb.height) <= 1).toBe(true);
      // The rail comes right after the small line.
      const r = panel.locator(`${railWhere} [data-rail="${railId}"]`).first();
      await expect(r).toBeVisible();
      const ebb = await box(eb), rb = await box(r);
      expect(rb.top).toBeGreaterThanOrEqual(ebb.bottom - 1);
      expect(rb.top - ebb.bottom).toBeLessThan(40);
      // Small line + rail fit the 120 px header limit (D112).
      expect(rb.bottom - ebb.top).toBeLessThanOrEqual(120);
      expect(monitor.pageErrors).toEqual([]);
    });

    test(`${title}: nothing is sticky; the header scrolls away`, async ({ page }) => {
      await openApp(page, { localState: sample() });
      await openView(page, view);
      const panel = page.locator(`#panel-${view}`);
      const eb = panel.locator('.page-head .page-eyebrow').first();
      const r = panel.locator(`${railWhere} [data-rail="${railId}"]`).first();
      for (const loc of [panel.locator('.page-head').first(), r]) {
        expect(await loc.evaluate((el) => {
          for (let n = el; n && n.id !== `panel-${el.closest('.view-panel').dataset.viewId}`; n = n.parentElement) {
            if (getComputedStyle(n).position === 'sticky' || getComputedStyle(n).position === 'fixed') return true;
          }
          return false;
        })).toBe(false);
      }
      const top0 = (await box(eb)).top;
      await panel.evaluate((el) => { el.scrollTop = 400; });
      const moved = await panel.evaluate((el) => el.scrollTop);
      if (moved > 50) expect(top0 - (await box(eb)).top).toBeGreaterThan(moved - 5);
    });
  }

  test('showing the three pillar pages writes nothing', async ({ page }) => {
    await openApp(page, { localState: sample() });
    const before = await localSaved(page);
    for (const [view] of PILLARS) await openView(page, view);
    expect(await localSaved(page)).toEqual(before);
    expect(await cloudWrites(page)).toEqual([]);
  });

  test('other pages keep the small line and the large title', async ({ page }) => {
    await openApp(page, { localState: sample() });
    for (const [view, title] of [['daily', 'Daily'], ['library', 'Library'], ['setup', 'Guitar Setup'], ['account', 'Account & data']]) {
      await openView(page, view);
      const t = page.locator(`#panel-${view} .page-title`).first();
      await expect(t).toBeVisible();
      await expect(t).toHaveText(title);
      expect((await box(t)).height).toBeGreaterThan(10);
    }
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('pillar pages keep the eyebrow and the large title (unchanged)', async ({ page }) => {
    await openApp(page, { localState: sample() });
    for (const [view, eyebrow, title] of PILLARS) {
      await openView(page, view);
      const head = page.locator(`#panel-${view} .page-head`).first();
      await expect(head.locator('.page-eyebrow')).toHaveText(eyebrow);
      await expect(head.locator('.page-title')).toBeVisible();
      await expect(head.locator('.page-title')).toHaveText(title);
      expect((await box(head.locator('.page-title'))).height).toBeGreaterThan(20);
    }
  });
});
