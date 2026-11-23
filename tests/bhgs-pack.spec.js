// Slice 4.2b (DECISIONS D113, D119 point 6): the app works complete with the BHGS pack switched off.
// The tests serve js/pack.js with BHGS_PACK = false (support/app.js, option `bhgsPack: false`); the real file stays on.
// Out of scope (D113): DAILY content without the pack (Phase 8); DAILY is only checked to open without errors.
// Slice 4.3 (D113, D122): with the pack off there is no TECHNIQUE destination and no Technique shortcut on HOME.
const { test, expect } = require('@playwright/test');
const { openApp, unexpectedConsoleErrors, cloudWrites, STORAGE_KEY } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const BHGS_LINK = /patreon\.com|tinyurl\.com|music-theory-cheat-sheet\.pdf|scales-handbook\.pdf/i;
const BHGS_TEXT = /Bradley Hall|BHGS|Phase Transition Test|Jump to phase|Shred Roadmap|Weekly Rhythm|Chop-Builders/;
const VIEWS = ['home', 'improv', 'dojo', 'library', 'setup'];

async function openView(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  const btn = nav.locator(`[data-action="go"][data-view="${view}"]`);
  if (await btn.count()) await btn.click();
  else {
    await nav.locator('[data-action="more"]').click();
    await page.locator(`#panel-more [data-action="go"][data-view="${view}"]`).first().click();
  }
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

/** Opens every LIBRARY section that exists, including the gates inside the Expression Track. */
async function openAllLibrarySections(page) {
  const lib = page.locator('#panel-library');
  for (let round = 0; round < 3; round++) {
    const closed = lib.locator('[data-action="toggleacc"]:has(.chev:not(.open))');
    const n = await closed.count();
    if (!n) break;
    for (let i = 0; i < n; i++) await lib.locator('[data-action="toggleacc"]:has(.chev:not(.open))').first().click();
  }
}

test('pack off: every page outside DAILY opens with content, no errors and no BHGS link or text', async ({ page }) => {
  const monitor = await openApp(page, { bhgsPack: false, localState: progressState({ phaseIndex: 2 }) });
  for (const view of VIEWS) {
    await openView(page, view);
    if (view === 'library') await openAllLibrarySections(page);
    const panel = page.locator(`#panel-${view} .panel-content`);
    await expect(panel).not.toBeEmpty();
    expect((await panel.innerText()).trim().length, view).toBeGreaterThan(40);
    const hrefs = await page.locator(`#panel-${view} a[href]`).evaluateAll((as) => as.map((a) => a.href));
    expect(hrefs.filter((h) => BHGS_LINK.test(h)), view).toEqual([]);
    expect(await panel.innerText(), view).not.toMatch(BHGS_TEXT);
  }
  await expect(page.getByText('Render Error:')).toHaveCount(0);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('pack off: HOME hides the Technique rail, phase %, Phase Transition Test and Jump to phase; keeps streak and calendar', async ({ page }) => {
  await openApp(page, { bhgsPack: false, localState: progressState({ phaseIndex: 1 }) });
  const home = page.locator('#panel-home');
  await expect(home.locator('[data-rail="technique"]')).toHaveCount(0);
  await expect(home.locator('[data-rail]')).toHaveCount(2); // Improv and Theory
  await expect(home.locator('.home-streak .streak-logged')).toHaveText('3'); // slice 4.5c: streak in the header, no % stat
  await expect(home.locator('[data-action="setphase"]')).toHaveCount(0);
  await expect(home.locator('[data-view="technique"]')).toHaveCount(0);
  await expect(home.locator('.s-day').first()).toBeVisible();
  await expect(home.locator('.home-brief')).toBeAttached(); // the briefing and Today's key stay (4.10j, D164)
  await expect(home.locator('.home-key')).toBeAttached();
});

test('pack off: LIBRARY keeps Expression Track, Listening Vault and the guide, with a pack-free guide text', async ({ page }) => {
  await openApp(page, { bhgsPack: false });
  await openView(page, 'library');
  const accs = await page.locator('#panel-library > .panel-content > .acc > .acchead').evaluateAll((h) => h.map((x) => x.dataset.acc));
  expect(accs).toEqual(['expression', 'listening', 'guide']);
  await page.locator('#panel-library [data-acc="guide"]').click();
  await expect(page.locator('#panel-library')).toContainText('How This App Works');
  await expect(page.locator('#panel-library')).not.toContainText('Weekly Rhythm');
});

test('pack off: DAILY still opens without errors (its content without the pack comes in Phase 8)', async ({ page }) => {
  const monitor = await openApp(page, { bhgsPack: false });
  await openView(page, 'daily');
  await expect(page.locator('#panel-daily .panel-content')).not.toBeEmpty();
  await expect(page.getByText('Render Error:')).toHaveCount(0);
  expect(monitor.pageErrors).toEqual([]);
});

test('pack off: phone bar shows LIBRARY instead of keeping it in More (D119 point 6)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone bar');
  await openApp(page, { bhgsPack: false });
  const views = await page.locator('#botnav [data-action="go"]').evaluateAll((b) => b.map((x) => x.dataset.view));
  expect(views).toEqual(['home', 'daily', 'improv', 'dojo', 'library']);
  await page.locator('#botnav [data-action="more"]').click();
  await expect(page.locator('#panel-more [data-view="library"]')).toHaveCount(0);
  await expect(page.locator('#panel-more [data-view="setup"]')).toHaveCount(1);
});

test('pack on (as in the app): phone bar has TECHNIQUE and keeps LIBRARY in More', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone bar');
  await openApp(page);
  const views = await page.locator('#botnav [data-action="go"]').evaluateAll((b) => b.map((x) => x.dataset.view));
  expect(views).toEqual(['home', 'daily', 'technique', 'improv', 'dojo']);
});

test('pack off: no TECHNIQUE destination anywhere and its page is empty (D113)', async ({ page }) => {
  const monitor = await openApp(page, { bhgsPack: false, localState: progressState({ phaseIndex: 1 }) });
  await expect(page.locator('[data-view="technique"]')).toHaveCount(0);
  await expect(page.locator('#panel-technique')).toBeEmpty();
  const more = page.locator('#botnav [data-action="more"]');
  if (await more.isVisible()) await more.click();
  await expect(page.locator('#panel-more [data-view="technique"]')).toHaveCount(0);
  expect(monitor.pageErrors).toEqual([]);
});

test('pack off: stored BHGS progress is never changed, locally or in the cloud', async ({ page }) => {
  const cloud = progressState({ phaseIndex: 2 });
  await openApp(page, { bhgsPack: false, user: TEST_USER, docs: { [USER_DOC]: cloud } });
  const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  for (const view of VIEWS) await openView(page, view);
  if (await page.locator('#panel-library [data-acc="guide"]').count()) {
    await openView(page, 'library');
    await openAllLibrarySections(page);
  }
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
  const saved = JSON.parse(before);
  for (const key of ['phaseIndex', 'chop', 'testLevel', 'bonusLevel', 'checks']) {
    expect(saved[key], key).toEqual(cloud[key]);
  }
  expect(await cloudWrites(page)).toEqual([]);
});
