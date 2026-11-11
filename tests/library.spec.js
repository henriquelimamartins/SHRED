// Phase 1.5: LIBRARY as it behaves on main TODAY. Technique items inside Library are covered by
// technique.spec.js and the Expression Track by improv.spec.js; this file covers the rest:
// sections, Theory Track and Creative "Watched" marks, Bonus steppers, Listening Vault and Guide.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

const library = (page) => page.locator('#panel-library');
const home = (page) => page.locator('#panel-home');

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
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

test('Library shows its 7 sections, all closed', async ({ page }, testInfo) => {
  const monitor = await openApp(page);
  await goTo(page, 'library');
  expect(await library(page).locator(':scope .panel-content > .acc > .acchead > b').allTextContents()).toEqual([
    'Shred Roadmap', 'Theory Track', 'Expression Track', 'Listening Vault', 'Creative', 'Bonus Content', 'Guide & Info',
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

test('Theory Track: 3 documents and 13 videos in 3 groups', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'theory').click();
  const body = library(page).locator('.acc:has([data-acc="theory"]) > .accbody');
  expect(await body.locator('.docli .itxt').allTextContents())
    .toEqual(['Music Theory Cheat Sheet', 'Scales Handbook', 'Modes Cheat Sheet']);
  expect(await body.locator('[data-action="togm"]').evaluateAll((els) => els.map((e) => e.dataset.key))).toEqual(THEORY_KEYS);
  expect(await body.locator('.list-card h3').allTextContents()).toEqual(['Ear Training', 'Modes', 'Chords & Soloing']);
  await expect(body.locator('a[href="./music-theory-cheat-sheet.pdf"]')).toHaveCount(1);
  await expect(body.locator('a[href="./scales-handbook.pdf"]')).toHaveCount(1);
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
  await expect(home(page).locator('.statrow .stat').first().locator('.bignum')).toHaveText('0%');
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
  await expect(body.locator('.card h3')).toHaveCount(4);
  await expect(body.locator('[data-action="togm"], [data-action="togimprov"]')).toHaveCount(0);
  expect(await localSaved(page)).toEqual(before);
});

test('Guide & Info: plan text and the 7-day Weekly Rhythm table', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'guide').click();
  const body = library(page).locator('.acc:has([data-acc="guide"]) > .accbody');
  await expect(body).toContainText('How This Plan Works');
  expect(await body.locator('table.info td.day').allTextContents()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  await expect(body).toContainText("Bradley Hall's Guitar School");
});

test('Essential Skills lists the 5 weekday micro-doses', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'library');
  await section(page, 'shredroadmap').click();
  await section(page, 'essentials').click();
  const items = library(page).locator('.acc:has(> [data-acc="essentials"]) > .accbody .itxt');
  expect((await items.allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim())).toEqual([
    'Ear Training (Monday)', 'Rhythm (Tuesday)', 'Time Signatures (Wednesday)',
    'Sight-Reading (Thursday)', 'Reinforce Weakest (Friday)',
  ]);
});
