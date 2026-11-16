// Slice 4.8b (D132 point 5, D138): TOOLS · Guitar Setup as drawn on the 4.6 boards. Values and choices are covered
// by setup.spec.js; this file checks the layout: labelled fields, measurement tiles on top, numbered steps one per row,
// the side column on desktop, the phone order and "‹ More".
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

const setup = (page) => page.locator('#panel-setup');
const box = async (loc) => { const b = await loc.boundingBox(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };

test('Guitar and Tuning are labelled fields; the six tunings stay (owner, D138)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'setup');
  await expect(setup(page).getByLabel('Guitar')).toHaveValue('prs');
  await expect(setup(page).getByLabel('Tuning')).toHaveValue('e_std');
  expect(await setup(page).getByLabel('Tuning').locator('option').allTextContents())
    .toEqual(['E Standard', 'Drop D', 'D Standard', 'Drop C', 'C Standard', 'DADFAE']);
  for (const f of ['Guitar', 'Tuning']) expect((await box(setup(page).getByLabel(f))).h).toBeGreaterThanOrEqual(44);
});

test('measurements come first, as tiles: 7 for the PRS (tremolo), 6 for the Les Paul', async ({ page, isMobile }) => {
  await openApp(page);
  await openView(page, 'setup');
  const tiles = setup(page).locator('.setup-tile');
  await expect(tiles).toHaveCount(7);
  const measure = await box(setup(page).locator('.setup-measure'));
  const steps = await box(setup(page).locator('.setup-steps'));
  expect(measure.y).toBeLessThan(steps.y);
  const ys = await tiles.evaluateAll((t) => t.map((x) => Math.round(x.getBoundingClientRect().y)));
  if (isMobile) {
    const xs = await tiles.evaluateAll((t) => t.map((x) => Math.round(x.getBoundingClientRect().x)));
    expect(new Set(xs).size).toBe(2); // two columns
  } else {
    expect(new Set(ys).size).toBe(1); // one row
  }
  await setup(page).getByLabel('Guitar').selectOption('epi');
  await expect(setup(page).locator('.setup-tile')).toHaveCount(6);
  await expect(setup(page).locator('.setup-tile-label', { hasText: 'Tremolo Float' })).toHaveCount(0);
});

test('steps are numbered in order, one per row: 1–7 for the PRS, 1–6 for the Les Paul', async ({ page }) => {
  await openApp(page);
  await openView(page, 'setup');
  const nums = () => setup(page).locator('.setup-step .setup-num').allTextContents();
  expect(await nums()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  await expect(setup(page).locator('ol.setup-steps > li.setup-step')).toHaveCount(7);
  await setup(page).getByLabel('Guitar').selectOption('epi');
  expect(await nums()).toEqual(['1', '2', '3', '4', '5', '6']);
});

test('desktop (owner): introduction, note and video in one row under the measurements; steps below at full width', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout');
  await openApp(page);
  await openView(page, 'setup');
  const measure = await box(setup(page).locator('.setup-measure'));
  const steps = await box(setup(page).locator('.setup-steps'));
  expect(Math.abs(steps.x - measure.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(steps.w - measure.w)).toBeLessThanOrEqual(1);
  const row = [];
  for (const sel of ['.setup-lede', '.setup-note', '.setup-video']) {
    const b = await box(setup(page).locator(sel));
    expect(b.y, sel).toBeGreaterThan(measure.y + measure.h - 1);
    expect(b.y + b.h, sel).toBeLessThan(steps.y + 1);
    row.push(b);
  }
  expect(row[1].x).toBeGreaterThan(row[0].x); // side by side at 1440 px
  expect(row[2].x).toBeGreaterThan(row[1].x);
  await expect(setup(page).locator('.page-back')).toBeHidden();
});

test('phone: note, introduction, steps, then the video; "‹ More" leads back to MORE', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  await openApp(page);
  await openView(page, 'setup');
  const order = [];
  for (const sel of ['.setup-measure', '.setup-note', '.setup-lede', '.setup-steps', '.setup-video']) order.push((await box(setup(page).locator(sel))).y);
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  await expect(setup(page).locator('.page-eyebrow')).toBeHidden();
  const back = setup(page).locator('.page-back');
  await expect(back).toHaveText('More');
  await back.click();
  await expect(page.locator('#panel-more')).toHaveClass(/active/);
});

test('opening the page writes nothing and has no sideways overflow or errors', async ({ page }) => {
  const monitor = await openApp(page, { localState: baseState({ setupGuitar: 'epi', setupTuning: 'c_std' }) });
  const before = await localSaved(page);
  await openView(page, 'setup');
  await expect(setup(page).locator('.setup-tile').first()).toBeVisible();
  expect(await localSaved(page)).toEqual(before);
  const overflow = await page.evaluate(() => [...document.querySelectorAll('#panel-setup *')]
    .some((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1));
  expect(overflow).toBe(false);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('texts as rewritten (D138): lede, note and the PRS-only parts', async ({ page }) => {
  await openApp(page);
  await openView(page, 'setup');
  await expect(setup(page).locator('.setup-lede')).toHaveText('Work through these steps in order: each one changes what the next one measures. The goal is a low action for fast playing without fret buzz.');
  await expect(setup(page).locator('.setup-note')).toHaveText('Note: These targets suit 10-46 strings in E Standard on the PRS SE CE 24 (25" scale). Treat them as a starting point: if a note buzzes or chokes, raise that side a little.');
  await expect(setup(page)).toContainText('aim for 0.15 mm');
  await expect(setup(page)).toContainText('On the PRS tremolo the intonation screws are at the back of the bridge.');
  await expect(setup(page)).not.toContainText('F# Test');
  await expect(setup(page)).not.toContainText('stratitis');
});
