// Slice 4.5d (DECISIONS D130): the TECHNIQUE page as drawn on the 4.0 canvas.
// Desktop: the rail inside the progress card (status = phase name), no count beside the title, every part on the page.
// Phone: the pillar header of slice 4.6b (D131: small line, "Beginner · n of N", rail; not sticky), no progress card,
// link rows to three sub-pages (All phases, Essential Skills, Phase settings) with "‹ Technique" to come back.
// Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { baseState, checksFor } = require('./support/fixtures');

// Beginner with 13 of 24 done (54%), as in technique-page.spec.js.
const beginner = () => baseState({
  phaseIndex: 1,
  checks: checksFor(['p1.c.0', 'p1.c.1', 'p1.c.2', 'p1.c.3', 'p1.e.0', 'p1.e.1', 'p1.e.2', 'p1.s.0', 'p1.s.1']),
  chop: { alt: 3, sweep: 3, legato: 3, econ: 2, tap: 1 },
  testLevel: { alt: 2, sweep: 1, legato: 1, econ: 1, tap: 0, ult: 1 },
});
const tech = (page) => page.locator('#panel-technique');
const part = (page, id) => tech(page).locator(`.tech-part-${id}`);

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('the rail sits in the progress card with the phase name; the header has no count and no rail', async ({ page }) => {
    const monitor = await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    const card = tech(page).locator('.pillar-card');
    await expect(card).toBeVisible();
    const rail = card.locator('[data-rail="technique"]');
    await expect(rail).toBeVisible();
    await expect(rail.locator('.rail-status')).toHaveText('Beginner');
    await expect(rail).toHaveAttribute('data-pct', '54');
    // Slice 4.10e (D152 point 2): rail on the left, the text on the right, on one row; no % in the card.
    await expect(card.locator('.pillar-card-text')).toHaveText(/Phase 1 · Beginner\s*13 of 24 done in this phase/);
    const r = await rail.boundingBox(), n = await card.locator('.pillar-card-text').boundingBox();
    expect(n.x).toBeGreaterThan(r.x + r.width - 1);
    await expect(tech(page).locator('.tech-header .tech-sub')).toBeHidden();
    await expect(tech(page).locator('.tech-header [data-rail]')).toBeHidden();
    await expect(tech(page).locator('.tech-header .page-title')).toHaveText('Technique');
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('every part is on the page; no link rows or back links', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    for (const id of ['phases', 'essentials', 'settings']) await expect(part(page, id)).toBeVisible();
    await expect(tech(page).locator('.tech-links')).toBeHidden();
    await expect(tech(page).locator('.tech-back:visible')).toHaveCount(0);
    await expect(part(page, 'settings').locator('.tech-settings')).toHaveCSS('border-top-style', 'dashed');
    await expect(part(page, 'settings').locator('[data-action="phasesettings"]')).toHaveText('Change phase'); // slice 4.10i (D163 point 5)
  });

  test('All phases: every row ends with ›; the current row is a button back to the current phase', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await expect(tech(page).locator('.tech-phases .tech-phase .chev')).toHaveCount(5);
    const cur = tech(page).locator('.tech-phases button.tech-phase.cur');
    await expect(cur).toHaveText(/Phase 1\s*Beginner · Levels 1 - 2\s*Current · 54%/);
    await cur.click();
    await expect(tech(page).locator('.pillar-card')).toBeVisible();
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('pillar header (D131): small line, "Beginner · 13 of 24" and the rail with the %, at most 120 px (D112)', async ({ page }) => {
    const monitor = await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    const head = tech(page).locator('.tech-header');
    await expect(head.locator('.page-eyebrow')).toBeVisible();
    await expect(head.locator('.page-eyebrow')).toHaveText(/pillar · bhgs roadmap/i);
    await expect(head.locator('.tech-sub')).toHaveText('Beginner · 13 of 24');
    await expect(head.locator('[data-rail="technique"] .rail-status')).toHaveText('54%');
    // The title stays in the page for screen readers only.
    await expect(head.locator('.page-title')).toHaveText('Technique');
    const t = await head.locator('.page-title').boundingBox();
    expect(Math.round(t.width) <= 1 && Math.round(t.height) <= 1).toBe(true);
    // Hard limit 120 px (D112); GitHub's real web fonts measure a few px more than Claude's workspace.
    const h = await head.evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(120);
    await expect(tech(page).locator('.pillar-card')).toBeHidden();
    expect(monitor.pageErrors).toEqual([]);
  });

  test('the header scrolls away with the page (not sticky, D131)', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    const head = tech(page).locator('.tech-header');
    await expect(head).toHaveCSS('position', 'static');
    const top0 = (await head.boundingBox()).y;
    await tech(page).evaluate((el) => { el.scrollTop = 600; });
    await expect.poll(() => tech(page).evaluate((el) => el.scrollTop)).toBeGreaterThan(300);
    expect(top0 - (await head.boundingBox()).y).toBeGreaterThan(200);
  });

  test('link rows to All phases, Essential Skills and Phase settings (dashed); the parts are not on the main page', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    const rows = tech(page).locator('.tech-links .tech-link');
    expect((await rows.allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim())).toEqual([
      'All phases · Setup to Pro›', 'Essential Skills · One a day, in DAILY›', 'Phase settings · Change phase by hand›',
    ]);
    await expect(tech(page).locator('.tech-link-dashed')).toHaveCSS('border-top-style', 'dashed');
    for (const r of await rows.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) expect(Math.round(r)).toBeGreaterThanOrEqual(44);
    for (const id of ['phases', 'essentials', 'settings']) await expect(part(page, id)).toBeHidden();
  });

  test('All phases opens as a sub-page; "‹ Technique" comes back to the tabs', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await tech(page).locator('.tech-links [data-sub="phases"]').click();
    await expect(part(page, 'phases')).toBeVisible();
    await expect(tech(page).locator('.tech-tabs')).toBeHidden();
    await expect(tech(page).locator('.tech-links')).toBeHidden();
    await expect(tech(page).locator('.tech-header')).toBeVisible(); // the header stays
    await expect(part(page, 'phases').locator('.tech-phase')).toHaveCount(5);
    await part(page, 'phases').locator('.tech-back').click();
    await expect(part(page, 'phases')).toBeHidden();
    await expect(tech(page).locator('.tech-tabs')).toBeVisible();
  });

  test('the current phase row in All phases leads back to the current phase', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await tech(page).locator('.tech-links [data-sub="phases"]').click();
    await part(page, 'phases').locator('button.tech-phase.cur').click();
    await expect(tech(page).locator('.tech-tabs')).toBeVisible();
  });

  test('Essential Skills opens as a sub-page', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await tech(page).locator('.tech-links [data-sub="essentials"]').click();
    await expect(part(page, 'essentials')).toBeVisible();
    await expect(part(page, 'essentials').locator('[data-acc="techessentials"]')).toBeVisible();
    await expect(part(page, 'phases')).toBeHidden();
  });

  test('Phase settings opens as a sub-page; leaving it closes the phase choice', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await tech(page).locator('.tech-links [data-sub="settings"]').click();
    const settings = part(page, 'settings');
    await expect(settings).toBeVisible();
    await settings.locator('[data-action="phasesettings"]').click();
    await expect(settings.locator('select[data-action="setphase"]')).toHaveValue('1');
    await settings.locator('.tech-back').click();
    await tech(page).locator('.tech-links [data-sub="settings"]').click();
    await expect(settings.locator('select[data-action="setphase"]')).toHaveCount(0);
  });

  test('the TECHNIQUE button in the bar always opens the main page', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await tech(page).locator('.tech-links [data-sub="phases"]').click();
    await page.locator('#botnav [data-view="home"]').click();
    await page.locator('#botnav [data-view="technique"]').click();
    await expect(tech(page).locator('.tech-tabs')).toBeVisible();
    await expect(part(page, 'phases')).toBeHidden();
  });

  test('moving between the sub-pages writes nothing (device or cloud)', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    for (const id of ['phases', 'essentials', 'settings']) {
      await tech(page).locator(`.tech-links [data-sub="${id}"]`).click();
      await part(page, id).locator('.tech-back').click();
    }
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
    expect((await localSaved(page)).techSub).toBeUndefined();
    expect(await cloudWrites(page)).toEqual([]);
  });
});
