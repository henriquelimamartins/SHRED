// Phase 1.5: the legacy THEORY DOJO as it behaves on main TODAY. DOJO is replaced by THEORY in
// Phase 6 (D12); until then its stored data (state.dojo) must be kept intact (D82, D83).
// Tests named "current behaviour:" document known problems on purpose.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

const dojo = (page) => page.locator('#panel-dojo');
const toast = (page) => page.locator('#toast');

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

const dojoState = (overrides = {}) => ({ xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: false, ...overrides });

/** Makes the Harmonic Architect pick a predictable question: Math.random() always returns `value`. */
async function fixRandom(page, value) {
  await page.addInitScript((v) => { Math.random = () => v; }, value);
}

const dashTitle = (page) => dojo(page).locator('#dojo-dash-view .h2');
const xpText = (page) => dojo(page).locator('#dojo-dash-view .xp-text');
const xpFill = (page) => dojo(page).locator('#dojo-dash-view .xp-bar-fill');

test.describe('dashboard', () => {
  test('a new user: Level 1, 0 / 100 XP, audio on, Codex + 3 games', async ({ page }, testInfo) => {
    const monitor = await openApp(page);
    await goTo(page, 'dojo');
    await expect(dashTitle(page)).toHaveText('Level 1 - Fretboard Novice');
    await expect(xpText(page)).toHaveText('0 / 100 XP');
    expect(await xpFill(page).evaluate((e) => e.style.width)).toBe('0%');
    await expect(dojo(page)).toContainText('Audio: ON');
    expect(await dojo(page).locator('.dojo-dash .dojo-btn b').allTextContents()).toEqual([
      "The Architect's Codex", 'The Harmonic Architect', 'The Fretboard Sniper', 'The Rhythm Decryptor',
    ]);
    await page.screenshot({ path: testInfo.outputPath('dojo-dashboard.png'), fullPage: true });
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
  });

  const levels = [
    { xp: 200, title: 'Level 2 - Rhythm Apprentice', text: '200 / 1200 XP', width: '9%' },
    { xp: 1200, title: 'Level 11 - Harmonic Journeyman', text: '1200 / 3500 XP', width: '0%' },
    { xp: 5250, title: 'Level 21 - The Prog Architect', text: '5250 / 7000 XP', width: '50%' },
    { xp: 12000, title: 'Level 41 - Audiation Grandmaster', text: '12000 / MAX XP', width: '100%' },
  ];
  for (const l of levels) {
    test(`${l.xp} XP → ${l.title}, bar ${l.width}`, async ({ page }) => {
      await openApp(page, { localState: baseState({ dojo: dojoState({ xp: l.xp }) }) });
      await goTo(page, 'dojo');
      await expect(dashTitle(page)).toHaveText(l.title);
      await expect(xpText(page)).toHaveText(l.text);
      expect(await xpFill(page).evaluate((e) => e.style.width)).toBe(l.width);
    });
  }

  test('audio toggle hides the Rhythm game, is stored and kept after reload', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-action="togglemute"]').click();
    await expect(dojo(page)).toContainText('Audio: OFF');
    await expect(dojo(page).locator('[data-game="rhythm"]')).toHaveCount(0);
    expect((await localSaved(page)).dojo.audioMuted).toBe(true);
    await page.reload();
    await goTo(page, 'dojo');
    await expect(dojo(page)).toContainText('Audio: OFF');
  });

  test('Fretboard Sniper and Rhythm Decryptor are placeholders (toast only)', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'dojo');
    const before = await localSaved(page);
    await dojo(page).locator('[data-game="fretboard"]').click();
    await expect(toast(page)).toHaveText('Mini-game coming in next update!');
    await dojo(page).locator('[data-game="rhythm"]').click();
    await expect(toast(page)).toHaveText('Mini-game coming in next update!');
    expect(await localSaved(page)).toEqual(before);
  });
});

test.describe('Codex', () => {
  test('a new user: Module 1 open, Modules 2 and 3 locked', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-target="codex-list"]').click();
    await expect(dojo(page).locator('[data-action="readcodex"]')).toHaveCount(1);
    await expect(dojo(page).locator('[data-action="readcodex"][data-id="1"]')).toContainText('Module 1');
    await expect(dojo(page).locator('.codex-item-btn.locked')).toHaveCount(2);
  });

  test('current behaviour: reading a module gives 100 XP once (conflicts with D40)', async ({ page }) => {
    await openApp(page);
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-target="codex-list"]').click();
    await dojo(page).locator('[data-action="readcodex"][data-id="1"]').click();
    await expect(dojo(page).locator('#dojo-codex-reader h2')).toHaveText('Module 1: Fretboard Foundations & Syncopation');
    await expect(toast(page)).toHaveText('⭐ Level Up! You are now a Rhythm Apprentice');
    let saved = await localSaved(page);
    expect(saved.dojo).toMatchObject({ xp: 100, level: 2, readCodexes: [1] });

    // Reading it again gives nothing.
    await dojo(page).locator('#dojo-codex-reader [data-target="codex-list"]').click();
    await dojo(page).locator('[data-action="readcodex"][data-id="1"]').click();
    saved = await localSaved(page);
    expect(saved.dojo).toMatchObject({ xp: 100, level: 2, readCodexes: [1] });
  });
});

test.describe('The Harmonic Architect', () => {
  test('correct answer: +50 XP, explanation and Next; stored in state.dojo', async ({ page }, testInfo) => {
    await fixRandom(page, 0); // first level-1 question: the tritone over E, answer "Bb"
    await openApp(page);
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-game="architect"]').click();
    await expect(dojo(page).locator('.question-box')).toContainText('the darkest, most dissonant sound');
    await dojo(page).locator('[data-action="dojoans"][data-ans="2"]').click();
    await expect(dojo(page).locator('.opt-btn').nth(2)).toHaveClass(/correct/);
    await expect(dojo(page).locator('#dojo-feedback')).toContainText('(Correct!)');
    await expect(dojo(page).locator('[data-action="dojonext"]')).toBeVisible();
    expect((await localSaved(page)).dojo.xp).toBe(50);
    await page.screenshot({ path: testInfo.outputPath('dojo-architect-correct.png'), fullPage: true });

    await dojo(page).locator('[data-action="dojonext"]').click();
    await expect(dojo(page).locator('.opt-btn.correct')).toHaveCount(0);
    await expect(dojo(page).locator('.question-box')).toBeVisible();
  });

  test('wrong answer: no XP, the right option is shown, Back returns to the dashboard', async ({ page }) => {
    await fixRandom(page, 0);
    await openApp(page);
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-game="architect"]').click();
    await dojo(page).locator('[data-action="dojoans"][data-ans="0"]').click();
    await expect(dojo(page).locator('.opt-btn').nth(0)).toHaveClass(/wrong/);
    await expect(dojo(page).locator('.opt-btn').nth(2)).toHaveClass(/correct/);
    await expect(dojo(page).locator('#dojo-feedback')).toContainText('(Incorrect)');
    expect((await localSaved(page)).dojo.xp).toBe(0);
    await dojo(page).locator('#dojo-feedback [data-action="dojoback"]').click();
    await expect(dojo(page).locator('#dojo-dash-view')).toHaveClass(/active/);
  });

  test('questions are limited to the player\'s level', async ({ page }) => {
    await fixRandom(page, 0.999); // last available question
    await openApp(page);
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-game="architect"]').click();
    // Level 1: last of the 5 level-1 questions (D minor passing chord).
    await expect(dojo(page).locator('.question-box')).toContainText('D minor');
  });

  test('reaching 1200 XP moves to Level 11 and unlocks Codex Module 2', async ({ page }) => {
    await fixRandom(page, 0);
    await openApp(page, { localState: baseState({ dojo: dojoState({ xp: 1150, level: 2 }) }) });
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-game="architect"]').click();
    await dojo(page).locator('[data-action="dojoans"][data-ans="2"]').click();
    await expect(toast(page)).toHaveText('📜 📜 New Codex Unlocked!');
    expect((await localSaved(page)).dojo).toMatchObject({ xp: 1200, level: 11, unlockedCodexes: [1, 2] });
  });

  test('signed in: XP is written to users/{uid} only', async ({ page }) => {
    await fixRandom(page, 0);
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
    await goTo(page, 'dojo');
    await dojo(page).locator('[data-game="architect"]').click();
    await dojo(page).locator('[data-action="dojoans"][data-ans="2"]').click();
    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThanOrEqual(1);
    expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
    expect(writes[writes.length - 1].data.dojo.xp).toBe(50);
  });
});

test('DOJO answers do not touch Technique, Improv, the streak or Setup', async ({ page }) => {
  await fixRandom(page, 0);
  const before = baseState({ checks: { 'p0.pre.0': '2026-11-01' }, streakDates: ['2026-11-09'], improvChecks: { g0e0: true } });
  await openApp(page, { localState: before });
  await goTo(page, 'dojo');
  await dojo(page).locator('[data-game="architect"]').click();
  await dojo(page).locator('[data-action="dojoans"][data-ans="2"]').click();
  const saved = await localSaved(page);
  expect({ ...saved, dojo: before.dojo }).toEqual(before);
});
