// Phase 1.5: LIBRARY as it behaves on main TODAY. Technique items inside Library are covered by
// technique.spec.js and the Expression Track by improv.spec.js; this file covers the rest:
// sections, Theory Track and Creative "Watched" marks, Bonus steppers, Listening Vault and Guide.
// Slice 4.3 (D122): the Shred Roadmap section (phases, Essential Skills) moved to the TECHNIQUE page
// (technique.spec.js, technique-page.spec.js); LIBRARY now has 6 sections.
// Slice 4.8a (D137): LIBRARY as drawn. Theory groups are `.lib-group` cards (a first "Start Here" group holds the
// documents and root videos), the Listening Vault categories too, and the guide reads "How This App Works"
// (layout checks in library-layout.spec.js). Stored keys and expected values unchanged.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

const library = (page) => page.locator('#panel-library');
const home = (page) => page.locator('#panel-home');

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

const section = (page, acc) => library(page).locator(`[data-acc="${acc}"]`);
const mark = (page, key) => library(page).locator(`[data-action="togm"][data-key="${key}"]`);

// Theory Track "Watched" keys on main, in display order (root items, then Ear Training, Modes, Chords & Soloing).
const THEORY_KEYS = [
  'theory.12', 'theory.8',
  'theory.0', 'theory.1', 'theory.9',
  'theory.2', 'theory.3', 'theory.4', 'theory.5', 'theory.11',
  'theory.6', 'theory.7', 'theory.10',
];

test('Library shows its 6 sections in two groups, all closed', async ({ page }, testInfo) => {
  const monitor = await openApp(page);
  await goTo(page, 'library');
  // Slice 4.10k (D165): two groups; the Expression Track left LIBRARY, Documents is its own section.
  expect(await library(page).locator('.acc > .acchead > b').allTextContents()).toEqual([
    'Listening Vault', 'Guide & Info', 'Theory Track', 'Creative', 'Bonus Content', 'Documents',
  ]);
  await expect(library(page).locator('.accbody')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('library-closed.png'), fullPage: true });
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
});

test('a section opens and closes again', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'guide').click();
  await expect(library(page).locator('.accbody')).toHaveCount(1);
  await section(page, 'guide').click();
  await expect(library(page).locator('.accbody')).toHaveCount(0);
});

test('Theory Track: the Modes document, 13 videos in 4 groups (the two PDFs are under Documents, 4.10k)', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'theory').click();
  const body = library(page).locator('.acc:has([data-acc="theory"]) > .accbody');
  expect(await body.locator('.docli .itxt').allTextContents()).toEqual(['Modes Cheat Sheet']);
  expect(await body.locator('[data-action="togm"]').evaluateAll((els) => els.map((e) => e.dataset.key))).toEqual(THEORY_KEYS);
  expect(await body.locator('.lib-group h3').allTextContents()).toEqual(['Start Here', 'Ear Training', 'Modes', 'Chords & Soloing']);
  await expect(body.locator('a[href="./music-theory-cheat-sheet.pdf"]')).toHaveCount(0);
  await section(page, 'documents').click();
  await expect(library(page).locator('.acc:has([data-acc="documents"]) a[href="./music-theory-cheat-sheet.pdf"]')).toHaveCount(1);
  await expect(library(page).locator('.acc:has([data-acc="documents"]) a[href="./scales-handbook.pdf"]')).toHaveCount(1);
});

test('Theory Track: Watched stores today\'s date under theory.N; un-watching stores false', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'theory').click();
  await mark(page, 'theory.2').click();
  await expect(mark(page, 'theory.2')).toHaveText('✓ Watched');
  expect((await localSaved(page)).checks).toEqual({ 'theory.2': '2026-11-10' });
  await mark(page, 'theory.2').click();
  await expect(mark(page, 'theory.2')).toHaveText('Unwatched');
  expect((await localSaved(page)).checks).toEqual({ 'theory.2': false });
});

test('Theory and Creative marks do not change Technique %, the phase or the streak', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'theory').click();
  for (const key of THEORY_KEYS) await mark(page, key).click();
  await section(page, 'creative').click();
  await mark(page, 'creative.sw.0').click();
  const saved = await localSaved(page);
  expect(Object.keys(saved.checks)).toHaveLength(THEORY_KEYS.length + 1);
  expect(saved.phaseIndex).toBe(0);
  expect(saved.streakDates).toEqual([]);
  expect(saved.practiced).toEqual({});
  await goTo(page, 'home');
  await expect(page.locator('#panel-technique .pillar-card [data-rail="technique"]')).toHaveAttribute('data-pct', '0'); // slice 4.5c: the % left HOME; 4.10e: read from the card's rail
});

test('Creative: 4 Songwriting and 4 Production videos, stored as creative.sw.N / creative.pr.N', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'creative').click();
  const keys = await library(page).locator('.acc:has([data-acc="creative"]) [data-action="togm"]')
    .evaluateAll((els) => els.map((e) => e.dataset.key));
  expect(keys).toEqual(['creative.sw.0', 'creative.sw.1', 'creative.sw.2', 'creative.sw.3',
    'creative.pr.0', 'creative.pr.1', 'creative.pr.2', 'creative.pr.3']);
  await mark(page, 'creative.pr.3').click();
  expect((await localSaved(page)).checks).toEqual({ 'creative.pr.3': '2026-11-10' });
});

test('Bonus Content: 7 items; 4 steppers limited to 0–10 or 0–5, stored in bonusLevel', async ({ page }) => {
  await openApp(page, { localState: baseState({ bonusLevel: { metalLicks: 9, pentatonics: 0 } }) });
  await goTo(page, 'library');
  await section(page, 'bonuslib').click();
  const body = library(page).locator('.acc:has([data-acc="bonuslib"]) > .accbody');
  await expect(body.locator('.chop')).toHaveCount(7);
  const step = (k, d) => body.locator(`[data-action="bonuslvl"][data-k="${k}"][data-d="${d}"]`);
  const value = (k) => step(k, 1).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');
  expect(await body.locator('[data-action="bonuslvl"][data-d="1"]').evaluateAll((els) => els.map((e) => [e.dataset.k, e.dataset.max])))
    .toEqual([['metalLicks', '10'], ['guitarSolo', '10'], ['shredders', '10'], ['pentatonics', '5']]);

  await step('metalLicks', 1).click();
  await expect(value('metalLicks')).toHaveText('10/10');
  await expect(value('metalLicks')).toHaveClass(/hit/);
  await step('metalLicks', 1).click();
  await expect(value('metalLicks')).toHaveText('10/10');

  await step('pentatonics', -1).click();
  await expect(value('pentatonics')).toHaveText('0/5');
  for (let i = 0; i < 6; i++) await step('pentatonics', 1).click();
  await expect(value('pentatonics')).toHaveText('5/5');

  expect((await localSaved(page)).bonusLevel).toEqual({ metalLicks: 10, pentatonics: 5 });
});

test('Listening Vault: 4 categories, reading only (no marks, no state change)', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  const before = await localSaved(page);
  await section(page, 'listening').click();
  const body = library(page).locator('.acc:has([data-acc="listening"]) > .accbody');
  await expect(body.locator('.lib-group h3')).toHaveCount(4);
  await expect(body.locator('[data-action="togm"], [data-action="togimprov"]')).toHaveCount(0);
  expect(await localSaved(page)).toEqual(before);
});

test('Guide & Info: app text and the 7-day Weekly Rhythm table', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'guide').click();
  const body = library(page).locator('.acc:has([data-acc="guide"]) > .accbody');
  await expect(body).toContainText('How This App Works');
  expect(await body.locator('table.info td.day').allTextContents()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  await expect(body).toContainText("Bradley Hall's Guitar School");
});

