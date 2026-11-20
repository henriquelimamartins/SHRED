// THEORY destination (legacy DOJO content, D114) after slice 4.8d (D132 point 6, D148): behaviour.
// Reading and playing write nothing (no XP, levels, unlocked or read modules; ends the D40 conflict);
// only the Audio switch writes. The stored DOJO data (state.dojo) is kept, unused (D82, D107 point 5).
// Phase 1.5 tests for XP, levels and Codex locks were replaced here on purpose (D107 point 4/5); the layout is
// covered by theory-layout.spec.js.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

const dojo = (page) => page.locator('#panel-dojo');
const toast = (page) => page.locator('#toast');

const dojoState = (overrides = {}) => ({ xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: false, ...overrides });
const LEGACY = dojoState({ xp: 5250, level: 21, unlockedCodexes: [1, 2, 3], readCodexes: [1], legacyExtra: 'kept' });

/** The 15 questions as the app serves them (black box: read from the app's own data file). */
async function questions(page) {
  return page.evaluate(async () => {
    const m = await import('/js/data/dojo.js?v=2');
    return m.HARMONIC_QUESTIONS;
  });
}
async function currentQuestion(page, qs) {
  const text = (await dojo(page).locator('.question-box').innerText()).trim();
  const i = qs.findIndex((q) => q.q === text);
  expect(i, 'question text found in the data').toBeGreaterThanOrEqual(0);
  return i;
}
async function startGame(page) {
  await openView(page, 'dojo');
  await dojo(page).locator('[data-action="dojoplay"][data-game="architect"]').click();
  await expect(dojo(page).locator('#dojo-game-view')).toHaveClass(/active/);
}

test.describe('dashboard', () => {
  test('no level or XP; audio on; Codex, the Harmonic Architect and two games not built yet', async ({ page }) => {
    const monitor = await openApp(page, { localState: baseState({ dojo: LEGACY }) });
    await openView(page, 'dojo');
    await expect(dojo(page)).not.toContainText(/\bXP\b/);
    await expect(dojo(page)).not.toContainText('Prog Architect');
    await expect(dojo(page).locator('.xp-bar-container, .xp-bar-fill')).toHaveCount(0);
    await expect(dojo(page).locator('[data-action="togglemute"]')).toHaveAttribute('aria-checked', 'true');
    expect(await dojo(page).locator('.theory-row-title').allTextContents()).toEqual([
      "The Architect's Codex", 'The Harmonic Architect', 'The Fretboard Sniper', 'The Rhythm Decryptor',
    ]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
  });

  test('audio switch hides the Rhythm Decryptor, is stored and kept after reload', async ({ page }) => {
    await openApp(page);
    await openView(page, 'dojo');
    await dojo(page).locator('[data-action="togglemute"]').click();
    await expect(dojo(page).locator('[data-action="togglemute"]')).toHaveAttribute('aria-checked', 'false');
    await expect(dojo(page).locator('[data-game="rhythm"]')).toHaveCount(0);
    expect((await localSaved(page)).dojo.audioMuted).toBe(true);
    await page.reload();
    await openView(page, 'dojo');
    await expect(dojo(page).locator('[data-action="togglemute"]')).toHaveAttribute('aria-checked', 'false');
    await expect(dojo(page).locator('[data-game="fretboard"]')).toHaveCount(1);
  });

  test('The Fretboard Sniper and The Rhythm Decryptor are not buttons and say "Not built yet" (D148 point 7)', async ({ page }) => {
    await openApp(page);
    await openView(page, 'dojo');
    for (const g of ['fretboard', 'rhythm']) {
      const row = dojo(page).locator(`[data-game="${g}"]`);
      await expect(row).toHaveCount(1);
      expect(await row.evaluate((e) => e.tagName)).toBe('DIV');
      await expect(row).not.toHaveAttribute('data-action', /.*/);
      await expect(row.locator('.theory-tag', { hasText: 'Not built yet' })).toHaveCount(1);
    }
    await expect(dojo(page).locator('[data-game="rhythm"] .theory-tag', { hasText: 'Needs audio' })).toHaveCount(1);
    const before = await localSaved(page);
    await dojo(page).locator('[data-game="fretboard"]').click();
    await expect(toast(page)).not.toHaveText('Mini-game coming in next update!');
    expect(await localSaved(page)).toEqual(before);
  });
});

test.describe('Codex', () => {
  test('a new user: all three modules open, none locked', async ({ page }) => {
    await openApp(page);
    await openView(page, 'dojo');
    await dojo(page).locator('[data-target="codex-list"]').click();
    await expect(dojo(page).locator('[data-action="readcodex"]')).toHaveCount(3);
    await expect(dojo(page).locator('.locked')).toHaveCount(0);
    for (const id of [1, 2, 3]) {
      await dojo(page).locator(`#dojo-codex-list [data-action="readcodex"][data-id="${id}"]`).click();
      await expect(dojo(page).locator('#dojo-codex-reader .theory-sub-title')).toContainText(`Module ${id}`);
      await dojo(page).locator('#dojo-codex-reader [data-action="dojoopen"][data-target="codex-list"]').click();
      await expect(dojo(page).locator('#dojo-codex-list')).toHaveClass(/active/);
    }
  });

  test('reading a module writes nothing: no XP, no "read" mark (D40, D148 point 3)', async ({ page }) => {
    await openApp(page);
    await openView(page, 'dojo');
    const before = await localSaved(page);
    await dojo(page).locator('[data-target="codex-list"]').click();
    const listBefore = await dojo(page).locator('#dojo-codex-list').innerHTML();
    await dojo(page).locator('[data-action="readcodex"][data-id="1"]').click();
    await expect(dojo(page).locator('#dojo-codex-reader .theory-sub-title')).toHaveText('Module 1: Fretboard Foundations & Syncopation');
    await page.waitForTimeout(300);
    await expect(toast(page)).not.toContainText('XP');
    await expect(toast(page)).not.toContainText('Level Up');
    expect(await localSaved(page)).toEqual(before);
    // The list is drawn exactly as before reading (no "read" tick).
    await dojo(page).locator('#dojo-codex-reader [data-target="codex-list"]').click();
    expect(await dojo(page).locator('#dojo-codex-list').innerHTML()).toBe(listBefore);
  });
});

test.describe('The Harmonic Architect', () => {
  test('right answer: explanation and Next scenario; nothing written', async ({ page }) => {
    await openApp(page);
    const qs = await questions(page);
    await startGame(page);
    const before = await localSaved(page);
    const i = await currentQuestion(page, qs);
    await dojo(page).locator(`[data-action="dojoans"][data-ans="${qs[i].ans}"]`).click();
    await expect(dojo(page).locator('.opt-btn').nth(qs[i].ans)).toHaveClass(/correct/);
    await expect(dojo(page).locator('#dojo-feedback .feedback-title')).toHaveText("Architect's analysis · Correct");
    await expect(dojo(page).locator('#dojo-feedback p')).toHaveText(qs[i].exp);
    await expect(dojo(page).locator('#dojo-feedback [data-action="dojonext"]')).toHaveText('Next scenario');
    await page.waitForTimeout(300);
    await expect(toast(page)).not.toContainText('XP');
    expect(await localSaved(page)).toEqual(before);
    await dojo(page).locator('[data-action="dojonext"]').click();
    await expect(dojo(page).locator('.opt-btn.correct')).toHaveCount(0);
    expect(await currentQuestion(page, qs)).not.toBe(i);
  });

  test('wrong answer: the right option is shown, Next scenario is offered, Back returns to THEORY; nothing written', async ({ page }) => {
    await openApp(page);
    const qs = await questions(page);
    await startGame(page);
    const before = await localSaved(page);
    const i = await currentQuestion(page, qs);
    const wrong = qs[i].ans === 0 ? 1 : 0;
    await dojo(page).locator(`[data-action="dojoans"][data-ans="${wrong}"]`).click();
    await expect(dojo(page).locator('.opt-btn').nth(wrong)).toHaveClass(/wrong/);
    await expect(dojo(page).locator('.opt-btn').nth(qs[i].ans)).toHaveClass(/correct/);
    await expect(dojo(page).locator('#dojo-feedback .feedback-title')).toHaveText("Architect's analysis · Incorrect");
    await expect(dojo(page).locator('#dojo-feedback [data-action="dojonext"]')).toBeVisible();
    expect(await localSaved(page)).toEqual(before);
    await dojo(page).locator('#dojo-game-view [data-action="dojoback"]').click();
    await expect(dojo(page).locator('#dojo-dash-view')).toHaveClass(/active/);
  });

  test('answered options are disabled buttons; a second tap changes nothing', async ({ page }) => {
    await openApp(page);
    const qs = await questions(page);
    await startGame(page);
    const i = await currentQuestion(page, qs);
    await dojo(page).locator(`[data-action="dojoans"][data-ans="${qs[i].ans}"]`).click();
    const opts = dojo(page).locator('.opt-btn');
    for (let k = 0; k < await opts.count(); k++) await expect(opts.nth(k)).toBeDisabled();
    await expect(dojo(page).locator('.opt-btn.wrong')).toHaveCount(0);
  });

  test('every question once, in a shuffled order, before any repeats; a new round never repeats the last one (D148 point 5)', async ({ page }) => {
    // Math.random fixed at 0: the shuffle moves every question (order 1, 2, … 14, 0), so data order would fail.
    await page.addInitScript(() => { Math.random = () => 0; });
    await openApp(page);
    const qs = await questions(page);
    expect(qs.length).toBe(15);
    await startGame(page);
    const seen = [];
    const next = async () => {
      seen.push(await currentQuestion(page, qs));
      await dojo(page).locator('[data-action="dojoans"][data-ans="0"]').click();
      await dojo(page).locator('[data-action="dojonext"]').click();
    };
    for (let n = 0; n < 14; n++) await next();
    seen.push(await currentQuestion(page, qs));
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0]);
    // The second round is drawn with Math.random near 1: no swaps, so it would start with 0 (the question just
    // shown); the guard swaps the first two.
    await page.evaluate(() => { Math.random = () => 0.999; });
    await dojo(page).locator('[data-action="dojoans"][data-ans="0"]').click();
    await dojo(page).locator('[data-action="dojonext"]').click();
    for (let n = 0; n < 3; n++) await next();
    expect(seen.slice(15)).toEqual([1, 0, 2]);
  });

  test('signed in: reading and playing send nothing to the cloud', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
    const qs = await questions(page);
    const start = (await cloudWrites(page)).length;
    await openView(page, 'dojo');
    await dojo(page).locator('[data-target="codex-list"]').click();
    await dojo(page).locator('[data-action="readcodex"][data-id="2"]').click();
    await openView(page, 'home');
    await startGame(page);
    const i = await currentQuestion(page, qs);
    await dojo(page).locator(`[data-action="dojoans"][data-ans="${qs[i].ans}"]`).click();
    await page.waitForTimeout(300);
    expect((await cloudWrites(page)).length).toBe(start);
  });
});

test('stored DOJO data is kept as it was (D82): reading, playing and the audio switch leave it untouched', async ({ page }) => {
  const before = baseState({ dojo: LEGACY, checks: { 'p0.pre.0': '2026-11-01' }, streakDates: ['2026-11-09'], improvChecks: { g0e0: true } });
  await openApp(page, { localState: before });
  const qs = await questions(page);
  await openView(page, 'dojo');
  await dojo(page).locator('[data-target="codex-list"]').click();
  await dojo(page).locator('[data-action="readcodex"][data-id="3"]').click();
  await startGame(page);
  const i = await currentQuestion(page, qs);
  await dojo(page).locator(`[data-action="dojoans"][data-ans="${qs[i].ans}"]`).click();
  await dojo(page).locator('#dojo-game-view [data-action="dojoback"]').click();
  await dojo(page).locator('[data-action="togglemute"]').click();
  const saved = await localSaved(page);
  // schemaVersion: 1 is added by the migration (slice 3.1, D101); only the audio setting changes.
  expect(saved).toEqual({ ...before, schemaVersion: 1, dojo: { ...LEGACY, audioMuted: true } });
});
