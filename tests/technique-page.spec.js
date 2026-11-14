// Slice 4.3 (DECISIONS D112, D115, D117 point 6, D122): the TECHNIQUE page.
// - TECHNIQUE is a destination (menu, phone bar); HOME and LIBRARY no longer hold the phases, the Phase
//   Transition Test or Jump to phase; HOME has a Technique shortcut.
// - The page shows the current phase with real counts, chop-builders and the test; every other phase opens
//   from "All phases" with the content LIBRARY had; Essential Skills moved here.
// - Phone: three tabs (Checklist, Chop-builders, Phase test); page header at most 120 px.
// - Phase settings (D115): jumping back saves an on-device backup first ("before-phase-jump"); no backup, no jump;
//   nothing changes over data from a newer app version.
// The behaviour and numbers themselves are covered by technique.spec.js (D20). Firebase is stubbed.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, settle, openView, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, checksFor, levels } = require('./support/fixtures');

const BACKUP_KEY = 'shredRoadmapBackups_v1';
const technique = (page) => page.locator('#panel-technique');
const home = (page) => page.locator('#panel-home');
const library = (page) => page.locator('#panel-library');
const CHOP_KEYS = ['alt', 'sweep', 'legato', 'econ', 'tap'];
const TEST_KEYS = ['alt', 'sweep', 'legato', 'econ', 'tap', 'ult'];

async function backups(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), BACKUP_KEY);
}

// Beginner with 13 of 24 done: 4 videos, 3 exercises, 2 solos, 3 chops at target, 1 test at Level 2.
const beginner = () => baseState({
  phaseIndex: 1,
  checks: checksFor(['p1.c.0', 'p1.c.1', 'p1.c.2', 'p1.c.3', 'p1.e.0', 'p1.e.1', 'p1.e.2', 'p1.s.0', 'p1.s.1']),
  chop: { alt: 3, sweep: 3, legato: 3, econ: 2, tap: 1 },
  testLevel: { alt: 2, sweep: 1, legato: 1, econ: 1, tap: 0, ult: 1 },
});

const advanced = () => baseState({
  phaseIndex: 3,
  checks: checksFor(['p1.e.0', 'p2.e.0', 'p3.e.0']),
  chop: levels(CHOP_KEYS, 8),
  testLevel: levels(TEST_KEYS, 4),
});

async function chooseBackTo(page, index) {
  await openView(page, 'technique');
  await technique(page).locator('[data-action="phasesettings"]').click();
  await technique(page).locator('select[data-action="setphase"]').selectOption(String(index));
  await expect(technique(page)).toContainText(`Jump back to Phase ${index}?`);
}

test('TECHNIQUE opens with the current phase, its real counts and what is left', async ({ page }, testInfo) => {
  const monitor = await openApp(page, { localState: beginner() });
  await openView(page, 'technique');
  await expect(technique(page).locator('.tech-header')).toContainText('Technique');
  await expect(technique(page).locator('.tech-sub')).toHaveText('Beginner · 13 of 24');
  await expect(technique(page).locator('.tech-progress .bignum')).toHaveText('54%');
  await expect(technique(page).locator('.tech-progress-txt')).toContainText('13 of 24 done in this phase.');
  await expect(technique(page).locator('.tech-progress-txt')).toContainText('Left: 1 exercise · 3 solos · 2 chop-builders · 5 test categories.');
  // Section counts.
  const counts = await technique(page).locator('.tech-cols .tech-head').evaluateAll((hs) => hs.map((h) => h.textContent.replace(/\s+/g, ' ').trim()));
  expect(counts).toEqual(['Concept Videos4 of 4', 'Exercises3 of 4', 'Solos2 of 5', 'Chop-Builders3 of 5 at target', 'Phase Transition Test1 of 6 at Level 2']);
  await expect(technique(page).locator('.tech-sec-test')).toContainText('Reach Level 2 on all 6 to unlock Intermediate.');
  await expect(technique(page).locator('.tech-sec-chops')).toContainText('Target for this phase: Level 3.');
  await page.screenshot({ path: testInfo.outputPath('technique.png'), fullPage: true });
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('Setup phase: prerequisites, warm-up, lifetime chop levels and the baseline test', async ({ page }) => {
  await openApp(page, { localState: baseState({ checks: checksFor(['p0.pre.0']) }) });
  await openView(page, 'technique');
  await expect(technique(page).locator('.tech-sub')).toHaveText('Setup · 1 of 2');
  await expect(technique(page).locator('.tech-progress-txt')).toContainText('Left: 1 prerequisite.');
  await expect(technique(page).locator('.tech-sec-checklist [data-key="p0.pre.0"]')).toHaveText('✓ Completed');
  await expect(technique(page).locator('.tech-sec-checklist')).toContainText('Ultimate 5-Minute Warm-Up');
  await expect(technique(page).locator('.tech-sec-chops')).toContainText('lifetime level');
  await expect(technique(page).locator('.tech-sec-test')).toContainText('Track your baseline here');
});

test('All phases: the current one is not repeated; another opens with its content and can be marked', async ({ page }) => {
  await openApp(page, { localState: beginner() });
  await openView(page, 'technique');
  const rows = await technique(page).locator('.tech-phases .tech-phase').evaluateAll((r) => r.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  expect(rows).toEqual([
    'Phase 0Setup · Setup & BaselineComplete›',
    'Phase 1Beginner · Levels 1 - 2Current · 54% · shown above',
    'Phase 2Intermediate · Level 3›',
    'Phase 3Advanced · Level 4›',
    'Phase 4Pro · Level 5›',
  ]);
  await expect(technique(page).locator('[data-acc="tp1"]')).toHaveCount(0);
  // Each checklist key appears once on the page.
  await expect(technique(page).locator('[data-key="p1.e.0"]')).toHaveCount(1);

  await technique(page).locator('[data-acc="tp2"]').click();
  const p2 = technique(page).locator('.acc:has(> [data-acc="tp2"]) > .accbody');
  await expect(p2.locator('[data-action="togm"]')).toHaveCount(13);
  await p2.locator('[data-key="p2.s.0"]').click();
  await expect(p2.locator('[data-key="p2.s.0"]')).toHaveText('✓ Mastered');
  const saved = await localSaved(page);
  expect(saved.checks['p2.s.0']).toBe('2026-11-10');
  expect(saved.phaseIndex).toBe(1);
  await technique(page).locator('[data-acc="tp2"]').click();
  await expect(p2).toHaveCount(0);
});

test('Essential Skills lists the 5 weekday micro-doses (moved from LIBRARY)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'technique');
  await technique(page).locator('[data-acc="techessentials"]').click();
  const items = technique(page).locator('.acc:has(> [data-acc="techessentials"]) > .accbody .itxt');
  expect((await items.allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim())).toEqual([
    'Ear Training (Monday)', 'Rhythm (Tuesday)', 'Time Signatures (Wednesday)',
    'Sight-Reading (Thursday)', 'Reinforce Weakest (Friday)',
  ]);
});

test('HOME has no Phase Transition Test or Jump to phase; its Technique shortcut opens the page', async ({ page }) => {
  await openApp(page, { localState: beginner() });
  await expect(home(page).locator('h3', { hasText: 'Phase Transition Test' })).toHaveCount(0);
  await expect(home(page).locator('h3', { hasText: 'Jump to phase' })).toHaveCount(0);
  await expect(home(page).locator('[data-action="test"]')).toHaveCount(0);
  await expect(home(page).locator('[data-action="setphase"]')).toHaveCount(0);
  await expect(home(page).locator('.phasebar')).toHaveCount(1); // stays until the rails (4.4)
  await expect(home(page).locator('[data-action="go"][data-view="library"]')).toContainText('Theory Track, Expression Track, Listening Vault & more');
  await home(page).locator('[data-action="go"][data-view="technique"]').click();
  await expect(technique(page)).toHaveClass(/active/);
});

test('LIBRARY no longer holds the phases or Essential Skills', async ({ page }) => {
  await openApp(page, { localState: beginner() });
  await openView(page, 'library');
  await expect(library(page).locator('[data-acc="shredroadmap"], [data-acc="essentials"], [data-acc^="p"]')).toHaveCount(0);
  await expect(library(page).locator('[data-key^="p1."]')).toHaveCount(0);
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('three tabs show one part of the current phase at a time; the header is at most 120 px', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    const tabs = technique(page).locator('[data-action="techtab"]');
    expect(await tabs.allTextContents()).toEqual(['Checklist', 'Chop-builders', 'Phase test']);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(technique(page).locator('.tech-sec-checklist')).toBeVisible();
    await expect(technique(page).locator('.tech-sec-chops')).toBeHidden();
    await expect(technique(page).locator('.tech-sec-test')).toBeHidden();

    await technique(page).locator('[data-tab="chops"]').click();
    await expect(technique(page).locator('.tech-sec-chops')).toBeVisible();
    await expect(technique(page).locator('.tech-sec-checklist')).toBeHidden();
    await technique(page).locator('[data-tab="test"]').click();
    await expect(technique(page).locator('.tech-sec-test')).toBeVisible();
    await expect(technique(page).locator('.tech-sec-chops')).toBeHidden();
    // The tab is page state only: nothing saved.
    expect((await localSaved(page)).techTab).toBeUndefined();

    const h = await technique(page).locator('.tech-header').evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(120);
  });

  test('phone bar: TECHNIQUE is the third slot and shows as active', async ({ page }) => {
    await openApp(page);
    await page.locator('#botnav [data-view="technique"]').click();
    await expect(page.locator('#botnav [data-view="technique"]')).toHaveClass(/active/);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('no tabs; checklist, chop-builders and the test are all shown', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await expect(technique(page).locator('.tech-tabs')).toBeHidden();
    for (const s of ['.tech-sec-checklist', '.tech-sec-chops', '.tech-sec-test']) await expect(technique(page).locator(s)).toBeVisible();
  });
});

test.describe('Phase settings (D115)', () => {
  test('closed by default; opens and closes', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    await openView(page, 'technique');
    await expect(technique(page).locator('select[data-action="setphase"]')).toHaveCount(0);
    await technique(page).locator('[data-action="phasesettings"]').click();
    await expect(technique(page).locator('select[data-action="setphase"]')).toHaveValue('1');
    await technique(page).locator('[data-action="phasesettings"]').click();
    await expect(technique(page).locator('select[data-action="setphase"]')).toHaveCount(0);
  });

  test('jumping back saves a "before-phase-jump" backup of the state before the jump', async ({ page }) => {
    await openApp(page, { localState: advanced() });
    // A change first, so the state differs from the start-up daily snapshot (otherwise it is already safe, D102).
    await openView(page, 'technique');
    const chopTab = technique(page).locator('[data-action="techtab"][data-tab="chops"]');
    if (await chopTab.isVisible()) await chopTab.click();
    await technique(page).locator('.tech-sec-chops [data-action="chop"][data-t="alt"][data-d="1"]').click();
    await settle(page);
    await chooseBackTo(page, 1);
    await expect(technique(page)).toContainText('A backup is saved on this device first.');
    const before = await localSaved(page);
    await technique(page).locator('[data-action="confirmjump"]').click();
    await expect(page.locator('#toast')).toHaveText('Now on Beginner - later phases reset');

    const jump = (await backups(page)).filter((b) => b.reason === 'before-phase-jump');
    expect(jump).toHaveLength(1);
    expect(jump[0].state).toEqual(before);
    expect(jump[0].state.phaseIndex).toBe(3);
    expect(jump[0].state.chop.alt).toBe(9);
    expect((await localSaved(page)).phaseIndex).toBe(1);

    // The Restore list names it in plain words.
    await openView(page, 'home');
    await home(page).locator('[data-action="openrestore"]').click();
    await expect(home(page).locator('[data-action="pickrestore"]').first()).toContainText('Before phase change');
  });

  test('when the current state already equals the newest backup, no duplicate is added', async ({ page }) => {
    await openApp(page, { localState: advanced() });
    // The daily snapshot taken at start-up already holds this exact state.
    const startList = await backups(page);
    expect(startList[startList.length - 1].reason).toBe('daily');
    await chooseBackTo(page, 1);
    await technique(page).locator('[data-action="confirmjump"]').click();
    await expect(page.locator('#toast')).toHaveText('Now on Beginner - later phases reset');
    expect((await backups(page)).length).toBe(startList.length);
  });

  test('jumping forward saves no backup (nothing is cleared)', async ({ page }) => {
    await openApp(page, { localState: beginner() });
    const count = (await backups(page)).length;
    await openView(page, 'technique');
    await technique(page).locator('[data-action="phasesettings"]').click();
    await technique(page).locator('select[data-action="setphase"]').selectOption('2');
    await expect(page.locator('#toast')).toHaveText('Now on Intermediate - earlier phases marked complete');
    expect((await backups(page)).length).toBe(count);
  });

  test('if the backup cannot be written, the jump back does not run', async ({ page }) => {
    // The start-up daily snapshot would make the state "already safe", so the backup list is made
    // unreadable-to-write from the start: every write to the backup key fails.
    await page.addInitScript((key) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k === key) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        return original.call(this, k, v);
      };
    }, BACKUP_KEY);
    const monitor = await openApp(page, { localState: advanced() });
    await chooseBackTo(page, 1);
    await technique(page).locator('[data-action="confirmjump"]').click();
    await expect(page.locator('#toast')).toHaveText('Could not back up your progress. The phase was not changed.');
    await expect(technique(page).locator('[data-action="confirmjump"]')).toHaveCount(0);
    expect(await localSaved(page)).toEqual(advanced());
    expect(monitor.pageErrors).toEqual([]);
  });

  test('over data from a newer app version, the jump back is refused and nothing changes', async ({ page }) => {
    await openApp(page, { localState: advanced() });
    await settle(page);
    const newer = { ...advanced(), schemaVersion: 99 };
    await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), ['shredRoadmapState_v10', newer]);
    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    await page.waitForFunction(() => window.__SHRED_TEST__.calls.includes('onAuthStateChanged'));
    await settle(page);
    await chooseBackTo(page, 1);
    await technique(page).locator('[data-action="confirmjump"]').click();
    await expect(page.locator('#toast')).toHaveText('Your progress was saved by a newer version of the app. Reload the page to update.');
    expect(await localSaved(page)).toEqual(newer);
    expect((await backups(page)).filter((b) => b.reason === 'before-phase-jump')).toEqual([]);
    expect(await cloudWrites(page)).toEqual([]);
  });
});
