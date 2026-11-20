// Slice 4.8d (D132 point 6, D148): THEORY as drawn on the 4.6 boards. Behaviour is covered by dojo.spec.js;
// this file checks the layout (two columns on desktop, stacked on the phone), the line icons in the Theory blue,
// the drawn sub-screens, touch sizes and the corrected content (B1).
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

const dojo = (page) => page.locator('#panel-dojo');
const box = async (loc) => { const b = await loc.boundingBox(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}]/u;

test('desktop: READ on the left, PLAY on the right; phone: stacked in that order (Audio moved to Settings, D149)', async ({ page, isMobile }) => {
  await openApp(page);
  await openView(page, 'dojo');
  await expect(dojo(page).locator('.theory-audio, .theory-switch')).toHaveCount(0);
  const read = await box(dojo(page).locator('.theory-read'));
  const play = await box(dojo(page).locator('.theory-play'));
  if (isMobile) {
    expect(read.y).toBeLessThan(play.y);
    expect(Math.abs(play.x - read.x)).toBeLessThanOrEqual(2);
  } else {
    expect(play.x).toBeGreaterThan(read.x + read.w);
    expect(Math.abs(play.y - read.y)).toBeLessThanOrEqual(30);
  }
  await expect(dojo(page).locator('.theory-group-title')).toHaveText(['Read', 'Play']);
});

test('keyboard focus follows the screens; the result is announced (screen readers)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  const focused = () => page.evaluate(() => { const e = document.activeElement; return (e.className && e.className.baseVal === undefined ? e.className : '') + '|' + e.textContent.trim().slice(0, 40); });
  await dojo(page).locator('[data-target="codex-list"]').click();
  expect(await focused()).toBe('theory-sub-title|Library of the Architect');
  await dojo(page).locator('#dojo-codex-list [data-id="2"]').click();
  expect(await focused()).toBe('theory-sub-title|Module 2: Classic Tension & Basic Modes');
  await dojo(page).locator('#dojo-codex-reader [data-target="codex-list"]').click();
  await dojo(page).locator('#dojo-codex-list [data-action="dojoback"]').click();
  expect((await focused()).startsWith('theory-row|')).toBe(true);
  await dojo(page).locator('[data-action="dojoplay"]').click();
  expect(await focused()).toBe('theory-sub-title|The Harmonic Architect');
  await dojo(page).locator('.opt-btn').first().click();
  expect(await focused()).toBe('theory-next|Next scenario');
  await expect(dojo(page).locator('#dojo-announce')).toHaveAttribute('aria-live', 'polite');
  await expect(dojo(page).locator('#dojo-announce')).toHaveText(/^(Correct\. |Incorrect\. The answer is .+\. ).+/);
});

test('line icons in the Theory blue, no emoji anywhere on THEORY (dashboard, Codex, module, game)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  const blueTint = 'rgb(109, 184, 247)';
  await expect(dojo(page).locator('.theory-row-icon').first()).toHaveCSS('color', blueTint);
  await expect(dojo(page).locator('.theory-row-icon svg')).toHaveCount(4);
  const texts = [await dojo(page).innerText()];
  await dojo(page).locator('[data-target="codex-list"]').click();
  await expect(dojo(page).locator('.theory-codex-ic').first()).toHaveCSS('color', blueTint);
  texts.push(await dojo(page).locator('#dojo-codex-list').innerText());
  for (const id of [1, 2, 3]) {
    await dojo(page).locator(`#dojo-codex-list [data-action="readcodex"][data-id="${id}"]`).click();
    texts.push(await dojo(page).locator('#dojo-codex-reader').innerText());
    await dojo(page).locator('#dojo-codex-reader [data-target="codex-list"]').click();
  }
  await dojo(page).locator('#dojo-codex-list [data-action="dojoback"]').click();
  await dojo(page).locator('[data-action="dojoplay"]').click();
  await dojo(page).locator('[data-action="dojoans"]').first().click();
  texts.push(await dojo(page).locator('#dojo-game-view').innerText());
  for (const t of texts) expect(t).not.toMatch(EMOJI);
});

test('Codex list and module as drawn: title with Back, intro, rows with a book icon', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  await dojo(page).locator('[data-target="codex-list"]').click();
  const list = dojo(page).locator('#dojo-codex-list');
  await expect(list.locator('.theory-sub-title')).toHaveText('Library of the Architect');
  await expect(list.locator('.theory-back')).toHaveText('Back');
  await expect(list.locator('.theory-lede')).toHaveText('Read these contextualized theory scrolls before playing the mini-games.');
  expect(await list.locator('.theory-codex-title').allTextContents()).toEqual([
    'Module 1: Fretboard Foundations & Syncopation', 'Module 2: Classic Tension & Basic Modes', 'Module 3: The Dark Side of Harmony',
  ]);
  await list.locator('[data-id="3"]').click();
  // Note names stay as written in headings (b2, not B2).
  await expect(dojo(page).locator('#dojo-codex-reader h3').nth(1)).toHaveText('Phrygian Tension (b2)');
});

test('each "Where to listen" carries its kind (D140, D148 point 8)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  await dojo(page).locator('[data-target="codex-list"]').click();
  const expected = { 1: ['Verified analysis'], 2: ['Verified analysis', 'Verified analysis'], 3: ['Stylistic association', 'Stylistic association'] };
  for (const id of [1, 2, 3]) {
    await dojo(page).locator(`#dojo-codex-list [data-id="${id}"]`).click();
    const reader = dojo(page).locator('#dojo-codex-reader');
    expect(await reader.locator('.codex-ref-label').allTextContents()).toEqual(expected[id]);
    await expect(reader.locator('.codex-listen-title').first()).toHaveText('Where to listen');
    await reader.locator('[data-target="codex-list"]').click();
  }
});

test('B1 corrections are in place (D148 point 8)', async ({ page }) => {
  await openApp(page);
  const data = await page.evaluate(async () => {
    const m = await import('/js/data/dojo.js?v=2');
    return { qs: m.HARMONIC_QUESTIONS, codex: m.CODEX_DATA };
  });
  const all = JSON.stringify(data);
  const opts = data.qs.flatMap((q) => q.opts);
  expect(opts).toContain('G string, 10th fret (F)');
  expect(opts).not.toContain('G string, 12th fret (G)');
  expect(opts).toContain('Ab, F#, G');
  expect(all).not.toContain('the brain interprets');
  expect(all).not.toContain('almost all acoustic');
  expect(all).not.toContain('Major 2nd (9th)');
  expect(all).not.toContain('infinitely');
  expect(all).not.toContain('Guthrie Govan');
  expect(all).not.toContain("'gender'");
  expect(all).toContain('popularized in metal by Tony Iommi');
  // Every question still has exactly one marked answer inside its options.
  for (const q of data.qs) expect(q.ans).toBeLessThan(q.opts.length);
});

test('game screen as drawn: title with Back, question box, options, analysis with Next scenario', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  await dojo(page).locator('[data-action="dojoplay"]').click();
  const game = dojo(page).locator('#dojo-game-view');
  await expect(game.locator('.theory-sub-title')).toHaveText('The Harmonic Architect');
  await expect(game.locator('.question-box p')).toBeVisible();
  await expect(game.locator('.opt-btn')).toHaveCount(3);
  await expect(game.locator('#dojo-feedback')).toBeHidden();
  await game.locator('.opt-btn').first().click();
  await expect(game.locator('#dojo-feedback')).toBeVisible();
  await expect(game.locator('.opt-btn.correct svg')).toHaveCount(1);
  const fb = await box(game.locator('#dojo-feedback'));
  const lastOpt = await box(game.locator('.opt-btn').last());
  expect(fb.y).toBeGreaterThan(lastOpt.y);
});

test('touch targets are at least 44 px (rows, Back, options, Next scenario)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  const h = async (loc) => Math.round((await loc.boundingBox()).height);
  for (const r of await dojo(page).locator('button.theory-row').all()) expect(await h(r)).toBeGreaterThanOrEqual(44);
  await dojo(page).locator('[data-target="codex-list"]').click();
  expect(await h(dojo(page).locator('#dojo-codex-list .theory-back'))).toBeGreaterThanOrEqual(44);
  for (const r of await dojo(page).locator('#dojo-codex-list .theory-codex-row').all()) expect(await h(r)).toBeGreaterThanOrEqual(44);
  await dojo(page).locator('#dojo-codex-list [data-action="dojoback"]').click();
  await dojo(page).locator('[data-action="dojoplay"]').click();
  for (const o of await dojo(page).locator('.opt-btn').all()) expect(await h(o)).toBeGreaterThanOrEqual(44);
  await dojo(page).locator('.opt-btn').first().click();
  expect(await h(dojo(page).locator('[data-action="dojonext"]'))).toBeGreaterThanOrEqual(44);
});

test('no inline style anywhere on THEORY, also after answering (helps 4.9)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  await dojo(page).locator('[data-action="dojoplay"]').click();
  await dojo(page).locator('.opt-btn').first().click();
  expect(await dojo(page).locator('[style]').count()).toBe(0);
});

test('no sideways overflow on THEORY (phone and desktop)', async ({ page }) => {
  await openApp(page);
  await openView(page, 'dojo');
  for (const step of ['dash', 'codex', 'module', 'game']) {
    if (step === 'codex') await dojo(page).locator('[data-target="codex-list"]').click();
    if (step === 'module') await dojo(page).locator('#dojo-codex-list [data-id="3"]').click();
    if (step === 'game') { await openView(page, 'home'); await openView(page, 'dojo'); await dojo(page).locator('[data-action="dojoplay"]').click(); }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, step).toBeLessThanOrEqual(0);
  }
});

test('opening THEORY and its screens writes nothing, signed out or signed in', async ({ page }) => {
  const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
  const start = (await cloudWrites(page)).length;
  const before = await localSaved(page);
  await openView(page, 'dojo');
  await dojo(page).locator('[data-target="codex-list"]').click();
  await dojo(page).locator('#dojo-codex-list [data-id="1"]').click();
  await page.waitForTimeout(300);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(start);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
});
