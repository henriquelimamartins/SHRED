// Slice 4.8a (D132 point 4, D137): LIBRARY as drawn on the 4.6 boards, and the rewritten Guide texts (D120).
// Behaviour (marks, stored keys, Bonus steppers) is covered by library.spec.js, improv.spec.js and bhgs-pack.spec.js.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

const lib = (page) => page.locator('#panel-library');
const head = (page, acc) => lib(page).locator(`[data-acc="${acc}"]`);
const body = (page, acc) => lib(page).locator(`.acc:has(> [data-acc="${acc}"]) > .accbody`);

async function openAll(page) {
  for (let i = 0; i < 20; i++) {
    const closed = lib(page).locator('[data-action="toggleacc"][aria-expanded="false"]');
    if (!(await closed.count())) break;
    await closed.first().click();
  }
}

const GUIDE_PACK = [
  "The app rests on three pillars: Technique, Improvisation and Theory. DAILY tells you what to practise each day; HOME shows today's session, your streak and the calendar.",
  'Technique follows the BHGS Roadmap in order. Phase 0 sets up your prerequisites, warm-up and a baseline test; then, whatever your level, you start at Phase 1 and work through every exercise, chop-builder and solo of a phase before moving on, up to Phase 4. Each of Phases 1 to 4 is complete when every checklist item is mastered, the chop-builder targets are reached and all 6 categories of the Phase Transition Test, including the Ultimate Technique Workout, are at the required level.',
  'Improvisation has its own track: on the IMPROV page you work through 5 Gates, playing every exercise in the key of the day. Exercises you have marked Mastered come back as a short review in DAILY\'s Improvisation block.',
  'Theory is always open: it never locks anything in Technique or Improvisation.',
  'The progress rails show where you stand: BHGS Roadmap for Technique, Musical Development for Improvisation and Theory. Each pillar is counted on its own, never mixed.',
];
const CREDIT = "Technique content (phases, exercises, chop-builders, the Phase Transition Test, and the Technique blocks and micro-doses in DAILY) follows Bradley Hall's Guitar School (BHGS) Official Roadmap; the Theory Track, Creative and Bonus Content videos here in LIBRARY are BHGS lessons too. Video links open on Patreon and need a BHGS membership. The daily routine and the Improvisation and Theory pillars are this app's own.";
const GUIDE_NOPACK = [
  "The app rests on two pillars: Improvisation and Theory. DAILY tells you what to practise each day; HOME shows today's session, your streak and the calendar.",
  'Improvisation has its own track: on the IMPROV page you work through 5 Gates, playing every exercise in the key of the day. Exercises you have marked Mastered come back as a short review in DAILY\'s Improvisation block. Here in LIBRARY, the Expression Track lists the same exercises and the Listening Vault gathers listening references.',
  'Theory is always open: it never locks anything in Improvisation.',
  'The Musical Development rails show where you stand in each pillar, each counted on its own.',
];

test('sections are buttons that say whether they are open, and open with the keyboard too', async ({ page }) => {
  await openApp(page);
  await openView(page, 'library');
  const heads = lib(page).locator(':scope .panel-content > .acc > .acchead');
  expect(await heads.evaluateAll((h) => h.map((x) => [x.tagName, x.getAttribute('aria-expanded')]))).toEqual(
    Array(6).fill(['BUTTON', 'false']));
  await head(page, 'listening').click();
  await expect(head(page, 'listening')).toHaveAttribute('aria-expanded', 'true');
  await expect(lib(page).locator('.lib-sec.open')).toHaveCount(1);
  await head(page, 'guide').focus();
  await page.keyboard.press('Enter');
  await expect(head(page, 'guide')).toHaveAttribute('aria-expanded', 'true');
  await expect(body(page, 'guide')).toBeVisible();
});

test('Expression Track: title in purple, its Gates as buttons inside; Listening Vault headings in the app red, no emoji', async ({ page }) => {
  await openApp(page);
  await openView(page, 'library');
  const color = (loc) => loc.evaluate((el) => getComputedStyle(el).color);
  expect(await color(head(page, 'expression').locator('b'))).toBe('rgb(183, 156, 255)'); // purple tint
  expect(await color(head(page, 'listening').locator('b'))).toBe('rgb(242, 242, 244)'); // plain text
  await head(page, 'expression').click();
  expect(await body(page, 'expression').locator('[data-acc^="libGate"]').evaluateAll((b) => b.map((x) => x.tagName + ':' + x.getAttribute('aria-expanded'))))
    .toEqual(Array(5).fill('BUTTON:false'));
  await head(page, 'listening').click();
  const h3 = body(page, 'listening').locator('.lib-group h3');
  await expect(h3).toHaveCount(4);
  for (const c of await h3.evaluateAll((hs) => hs.map((h) => getComputedStyle(h).color))) expect(c).toBe('rgb(255, 92, 97)');
  await expect(body(page, 'listening').locator('.card-improv, .h3-improv')).toHaveCount(0);
  expect(await body(page, 'listening').innerText()).not.toContain('🎸');
  await expect(body(page, 'listening').locator('.vault-title').first()).toHaveText('Tony Iommi (Black Sabbath)');
});

test('Theory Track documents show a file icon and their kind', async ({ page }) => {
  await openApp(page);
  await openView(page, 'library');
  await head(page, 'theory').click();
  const docs = body(page, 'theory').locator('.lib-doc');
  await expect(docs.locator('svg')).toHaveCount(3);
  expect(await docs.locator('.lib-doc-kind').allTextContents()).toEqual(['PDF', 'PDF', 'Doc']);
  expect(await docs.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('target')))).toEqual(['_blank', '_blank', '_blank']);
});

test('groups sit side by side on desktop and stack on the phone', async ({ page, isMobile }) => {
  await openApp(page);
  await openView(page, 'library');
  await head(page, 'theory').click();
  const boxes = await body(page, 'theory').locator('.lib-group').evaluateAll((g) => g.map((x) => x.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y) })));
  expect(boxes).toHaveLength(4);
  if (isMobile) {
    expect(new Set(boxes.map((b) => b.x)).size).toBe(1);
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y);
  } else {
    expect(boxes[1].y).toBe(boxes[0].y);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
  }
});

test('Watched marks keep the app\'s usual buttons (not pills, owner), blue when watched, at least 40 px tall (44 on the phone)', async ({ page, isMobile }) => {
  await openApp(page, { localState: baseState({ checks: { 'theory.12': '2026-11-01' } }) });
  await openView(page, 'library');
  await head(page, 'theory').click();
  const on = lib(page).locator('[data-action="togm"][data-key="theory.12"]');
  const off = lib(page).locator('[data-action="togm"][data-key="theory.8"]');
  await expect(on).toHaveText('✓ Watched');
  const style = (loc) => loc.evaluate((el) => { const s = getComputedStyle(el); return { color: s.color, h: Math.round(el.getBoundingClientRect().height), r: parseFloat(s.borderTopLeftRadius) }; });
  const a = await style(on); const b = await style(off);
  expect(a.color).toBe('rgb(109, 184, 247)'); // blue tint
  expect(b.color).toBe('rgb(160, 160, 170)'); // muted, as before
  for (const s of [a, b]) { expect(s.h).toBeGreaterThanOrEqual(isMobile ? 44 : 40); expect(s.r).toBeLessThan(12); }
});

test('Guide (pack on): How This App Works, the Weekly Rhythm and the BHGS note, as approved', async ({ page }) => {
  await openApp(page);
  await openView(page, 'library');
  await head(page, 'guide').click();
  const g = body(page, 'guide');
  expect(await g.locator('.lib-group h3').allTextContents()).toEqual(['How This App Works', 'Weekly Rhythm']);
  expect(await g.locator('.lib-group-text p').allTextContents()).toEqual(GUIDE_PACK);
  await expect(g.locator('.lib-credit')).toHaveText(CREDIT);
  await expect(g).not.toContainText('How This Plan Works');
});

test('Guide (pack off): the pack-free How This App Works', async ({ page }) => {
  await openApp(page, { bhgsPack: false });
  await openView(page, 'library');
  await head(page, 'guide').click();
  const g = body(page, 'guide');
  expect(await g.locator('.lib-group h3').allTextContents()).toEqual(['How This App Works']);
  expect(await g.locator('.lib-group-text p').allTextContents()).toEqual(GUIDE_NOPACK);
  await expect(g.locator('.lib-credit')).toHaveCount(0);
});

test('phone with the pack on: "‹ More" instead of the eyebrow, and it opens MORE', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone header');
  await openApp(page);
  await openView(page, 'library');
  const back = lib(page).locator('.page-back');
  await expect(back).toBeVisible();
  await expect(back).toHaveText('More');
  expect(Math.round((await back.boundingBox()).height)).toBeGreaterThanOrEqual(44);
  await expect(lib(page).locator('.page-eyebrow')).toBeHidden();
  await expect(lib(page).locator('.page-title')).toBeVisible();
  await back.click();
  await expect(page.locator('#panel-more')).toHaveClass(/active/);
});

test('phone with the pack off: LIBRARY is in the bar, so no "‹ More"; the eyebrow stays', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone header');
  await openApp(page, { bhgsPack: false });
  await openView(page, 'library');
  await expect(lib(page).locator('.page-back')).toHaveCount(0);
  await expect(lib(page).locator('.page-eyebrow')).toBeVisible();
});

test('desktop: no "‹ More" (the sidebar is there); eyebrow and title as before', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop header');
  await openApp(page);
  await openView(page, 'library');
  await expect(lib(page).locator('.page-back')).toBeHidden();
  await expect(lib(page).locator('.page-eyebrow')).toBeVisible();
});

test('every section open: no sideways overflow, no errors, nothing written (signed in too)', async ({ page }) => {
  const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
  await openView(page, 'library');
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await openAll(page);
  await expect(lib(page).locator('[data-action="toggleacc"][aria-expanded="false"]')).toHaveCount(0);
  const overflow = await page.evaluate(() => {
    const p = document.querySelector('#panel-library');
    return [...p.querySelectorAll('*')].some((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1);
  });
  expect(overflow).toBe(false);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});
