// Slice 4.10m (DECISIONS D167): HOME's circle of fifths is interactive like DAILY's, with its own choice; Next up
// leaves HOME; the IMPROVISATION Gates list shows the marks of passed and locked Gates (review of 4.10k); the
// IMPROVISATION intro at full width; LIBRARY group headings level; the LIBRARY intro, MORE subtitle and Guide texts;
// DAILY's middle dot between the minutes and "Practiced". Real values only; choosing a key writes nothing.
// Firebase is stubbed; the clock is fixed at Tuesday 10 Nov 2026 (key of the day C# minor, box 5); nothing leaves
// the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, cloudWrites, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { baseState, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const card = (page) => page.locator('#panel-home .home-key');
const improv = (page) => page.locator('#panel-improv');
const list = (page) => page.locator('#panel-improv .improv-list');
const key = (page, m, i) => card(page).locator(`.kc-key[data-mode="${m}"][data-i="${i}"]`);
const marks = (o) => Object.fromEntries(o.map((k) => [k, true]));

// ---------- HOME: the circle ----------

test('HOME circle: 24 key buttons with their names, today\'s key pressed; own path ids, none shared with DAILY', async ({ page }) => {
  const monitor = await openApp(page, { localState: progressState() });
  const circle = card(page).locator('.kc-home');
  await expect(circle).toBeVisible(); // desktop and phone (owner)
  await expect(circle).toHaveAttribute('role', 'group');
  await expect(circle.locator('button.kc-key[data-action="homekeypick"]')).toHaveCount(24);
  await expect(circle.locator('.kc-key[aria-pressed="true"]')).toHaveCount(1);
  await expect(circle.locator('.kc-key[aria-pressed="true"]')).toHaveAttribute('aria-label', 'C♯ minor');
  await expect(card(page).locator('.hk-label')).toHaveText("Today's key");
  await expect(card(page).locator('.hk-today')).toHaveCount(0);
  await expect(circle.locator('#hkc-fifths-path')).toHaveCount(1);
  await openView(page, 'daily'); // both circles in the page at once
  const dup = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(dup).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('choosing another key: "Key", its name, chords and the 4-Fret Box frets follow; "Today: …" goes back; focus stays on the circle', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await expect(card(page).locator('.hk-tile-val')).toHaveText(['Box 5 · frets 6–9', 'B string']);
  await key(page, 'maj', 2).click(); // D major
  await expect(card(page).locator('.hk-label')).toHaveText('Key');
  await expect(card(page).locator('.hk-name')).toHaveText('D major');
  await expect(card(page).locator('.kc-deg')).toHaveText(['ID', 'iiEm', 'iiiF♯m', 'IVG', 'VA', 'viBm', 'vii°C♯°']);
  await expect(key(page, 'maj', 2)).toHaveAttribute('aria-pressed', 'true');
  await expect(key(page, 'maj', 2)).toBeFocused();
  await expect(card(page).locator('.kc-sector.on')).toHaveCount(1);
  // The box of the day (5) on D major's relative minor (B minor: the same notes); the string does not change.
  await expect(card(page).locator('.hk-tile-val')).toHaveText(['Box 5 · frets 4–7', 'B string']);
  const back = card(page).locator('.hk-today');
  await expect(back).toHaveText('Today: C♯ minor');
  await back.click();
  await expect(card(page).locator('.hk-label')).toHaveText("Today's key");
  await expect(card(page).locator('.hk-name')).toHaveText('C♯ minor');
  await expect(card(page).locator('.hk-tile-val')).toHaveText(['Box 5 · frets 6–9', 'B string']);
  await expect(card(page).locator('.kc-key.on')).toBeFocused();
});

test('the keys work from the keyboard: Tab reaches them, Enter chooses, focus stays on the chosen key', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await key(page, 'maj', 0).focus();
  await page.keyboard.press('Tab'); // the next key in reading order: G major
  await expect(key(page, 'maj', 1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(card(page).locator('.hk-name')).toHaveText('G major');
  await expect(key(page, 'maj', 1)).toBeFocused();
  await expect(key(page, 'maj', 1)).toHaveAttribute('aria-pressed', 'true');
});

test('HOME\'s choice and DAILY\'s choice are separate; both start on today\'s key and are never saved', async ({ page, isMobile }) => {
  test.skip(isMobile, 'DAILY has its circle on the desktop only (D133 point 2)');
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await key(page, 'maj', 0).click(); // C major
  await openView(page, 'daily');
  const daily = page.locator('#panel-daily .daily-key-card');
  await expect(daily.locator('.dc-label')).toHaveText("Today's key");
  await daily.locator('.kc-key[data-mode="maj"][data-i="11"]').click(); // F major on DAILY
  await openView(page, 'home');
  await expect(card(page).locator('.hk-name')).toHaveText('C major'); // HOME kept its own
  await openView(page, 'daily');
  await expect(daily.locator('.dc-keyname')).toHaveText('F major'); // DAILY kept its own
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
  await page.reload();
  await settle(page);
  await openView(page, 'home');
  await expect(card(page).locator('.hk-name')).toHaveText('C♯ minor');
});

test('Next up has left HOME', async ({ page }) => {
  await openApp(page, { localState: progressState() });
  await expect(home(page).locator('.home-next, .hn-row')).toHaveCount(0);
  await expect(home(page).getByText('Next up', { exact: true })).toHaveCount(0);
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('the circle fits at 360, 375 and 390 px; keys at least 38 px; no sideways scroll; "Today" 44 px tall', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    for (const w of [360, 375, 390]) {
      await page.setViewportSize({ width: w, height: 760 });
      await settle(page);
      const m = await card(page).evaluate((c) => {
        const k = c.querySelector('.kc-home').getBoundingClientRect(), r = c.getBoundingClientRect();
        const keys = [...c.querySelectorAll('.kc-key')].map((b) => b.getBoundingClientRect());
        return { inside: k.left >= r.left && k.right <= r.right, min: Math.min(...keys.map((b) => Math.round(Math.min(b.width, b.height)))),
          over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      expect(m.inside, `width ${w}`).toBe(true);
      expect(m.min, `width ${w}`).toBeGreaterThanOrEqual(38);
      expect(m.over, `width ${w}`).toBe(0);
    }
    await key(page, 'maj', 2).click();
    expect(Math.round((await card(page).locator('.hk-today').boundingBox()).height)).toBeGreaterThanOrEqual(44);
  });
});

// ---------- IMPROVISATION: marks of other Gates ----------

test('a passed Gate opens with each exercise and its Mastered button; unmarking shows "Passed · n of N" and keeps the Gate open', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1, improvIndex: 1, improvChecks: marks(['g0e0', 'g0e1', 'g0e2', 'g0e3']) }) });
  await openView(page, 'improv');
  const row = list(page).locator('[data-acc="improvG0"]');
  await expect(row.locator('.improv-row-state')).toHaveText('Mastered');
  await row.click();
  const subs = list(page).locator('.improv-row-wrap[data-gate="0"] .improv-sub');
  await expect(subs).toHaveCount(4);
  await expect(subs.locator('[data-action="togimprov"]')).toHaveText(['✓ Mastered', '✓ Mastered', '✓ Mastered', '✓ Mastered']);
  await subs.nth(2).locator('[data-action="togimprov"]').click();
  await expect(subs.nth(2).locator('[data-action="togimprov"]')).toHaveText('Unmastered');
  await expect(subs.nth(2).locator('[data-action="togimprov"]')).toBeFocused();
  await expect(row.locator('.improv-row-state')).toHaveText('Passed · 3 of 4');
  expect((await localSaved(page)).improvChecks.g0e2).toBe(false);
  expect((await localSaved(page)).improvIndex).toBe(1); // unmarking does not lock the Gate again (Phase 7)
  await subs.nth(2).locator('[data-action="togimprov"]').click();
  await expect(row.locator('.improv-row-state')).toHaveText('Mastered');
});

test('a locked Gate with old marks: "Locked · n marked", opens to list only those, each can be cleared; nothing can be marked ahead', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1, improvIndex: 0, improvChecks: marks(['g2e1', 'g2e3', 'g3e0']) }) });
  await openView(page, 'improv');
  const g3 = list(page).locator('.improv-row-wrap[data-gate="2"]');
  await expect(g3.locator('.improv-row')).toHaveText(/Locked · 2 marked/);
  await g3.locator('.improv-row').click();
  await expect(g3.locator('.improv-row')).toHaveAttribute('aria-expanded', 'true');
  await expect(g3.locator('.improv-row-note')).toHaveText('Marked before this Gate opened. You can clear these marks; new marks come when the Gate opens.');
  await expect(g3.locator('.improv-sub')).toHaveCount(2);
  await expect(g3.locator('[data-action="togimprov"]')).toHaveText(['✓ Mastered', '✓ Mastered']);
  // While its marks are shown, every button there can only clear (pressed = Mastered); none marks an exercise.
  await expect(g3.locator('[data-action="togimprov"][aria-pressed="false"]')).toHaveCount(0);
  await expect(g3.locator('.improv-sub')).toHaveCount(2); // only the two marked of the Gate's exercises
  await g3.locator('[data-action="togimprov"]').first().click();
  await expect(g3.locator('.improv-sub')).toHaveCount(1);
  await expect(g3.locator('[data-action="togimprov"]')).toBeFocused(); // the next mark there
  await g3.locator('[data-action="togimprov"]').click();
  await expect(list(page).locator('.improv-row-wrap[data-gate="2"]')).toHaveCount(0); // back to a plain locked row
  await expect(list(page).locator('.improv-row.locked[data-gate="2"] .improv-row-lock')).toHaveCount(1);
  await expect(list(page).locator('.improv-list-title')).toBeFocused();
  const saved = (await localSaved(page)).improvChecks;
  expect([saved.g2e1, saved.g2e3, saved.g3e0]).toEqual([false, false, true]);
  // Gate 5 has no marks: a plain lock, no button, nothing to open.
  await expect(list(page).locator('.improv-row.locked[data-gate="4"]')).toHaveCount(1);
  await expect(list(page).locator('.improv-row.locked[data-gate="4"] button, button.improv-row[data-acc="improvG4"]')).toHaveCount(0);
});

test('opening the Gates writes nothing; only a Mastered button does', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1, improvIndex: 1, improvChecks: marks(['g0e0', 'g0e1', 'g0e2', 'g0e3', 'g3e1']) }) });
  await openView(page, 'improv');
  const before = await localSaved(page);
  await list(page).locator('[data-acc="improvG0"]').click();
  await list(page).locator('[data-acc="improvG3"]').click();
  expect(await localSaved(page)).toEqual(before);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('IMPROVISATION intro runs the full width of the page (owner)', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openView(page, 'improv');
    const w = await improv(page).evaluate((p) => ({ lede: p.querySelector('.improv-lede').getBoundingClientRect().width,
      cols: p.querySelector('.improv-cols').getBoundingClientRect().width }));
    expect(Math.abs(w.lede - w.cols)).toBeLessThan(2);
  });

  test('LIBRARY: both groups start their first row at the same height (1440 and 1180 px); group titles are headings', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openView(page, 'library');
    const lib = page.locator('#panel-library');
    await expect(lib.locator('h2.lib-col-title')).toHaveText(['Listening & guide', 'BHGS pack']);
    for (const w of [1440, 1180]) {
      await page.setViewportSize({ width: w, height: 900 });
      await settle(page);
      const tops = await lib.locator('.lib-col').evaluateAll((cols) => cols.map((c) => Math.round(c.querySelector('.lib-sec').getBoundingClientRect().top)));
      expect(tops[0], `width ${w}`).toBe(tops[1]);
      const hs = await lib.locator('.lib-head').evaluateAll((h) => [...new Set(h.map((x) => Math.round(x.getBoundingClientRect().height)))]);
      expect(hs, `width ${w}: every row the same height`).toHaveLength(1);
    }
  });
});

// ---------- texts ----------

test('LIBRARY intro without the pack says what is there; with the pack it keeps its text', async ({ page }) => {
  await openApp(page, { localState: baseState(), bhgsPack: false });
  await openView(page, 'library');
  await expect(page.locator('#panel-library .lib-lede')).toHaveText('Listening references and a guide to how the app works.');
  await expect(page.locator('#panel-library h2.lib-col-title')).toHaveText(['Listening & guide']);
});

test('LIBRARY intro with the pack; the Guide names Today\'s key on HOME', async ({ page }) => {
  await openApp(page, { localState: baseState() });
  await openView(page, 'library');
  const lib = page.locator('#panel-library');
  await expect(lib.locator('.lib-lede')).toHaveText('Browse and check off any item, anytime - it all counts toward the same progress as Daily Practice.');
  await lib.locator('[data-acc="guide"]').click();
  await expect(lib.getByText("HOME shows today's session, today's key with its chords, your streak and the calendar.", { exact: false })).toHaveCount(1);
});

test.describe('phone MORE', () => {
  test.skip(({ isMobile }) => !isMobile, 'MORE is the phone page');
  test('the Library row names the BHGS pack, the Listening Vault and the guide; without the pack the last two', async ({ page }) => {
    await openApp(page, { localState: baseState() });
    await page.locator('#botnav [data-action="more"]').click();
    await expect(page.locator('#panel-more [data-view="library"] .more-row-sub')).toHaveText('BHGS pack, Listening Vault & guide');
    await openApp(page, { localState: baseState(), bhgsPack: false });
    await page.locator('#botnav [data-action="more"]').click();
    await expect(page.locator('#panel-more [data-view="library"] .more-row-sub')).toHaveText('Listening Vault & guide');
  });
});

// ---------- DAILY: the middle dot ----------

test('DAILY block heads: "30 + 5 min · Practiced"; the dot is decoration, minutes and label unchanged', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  await openView(page, 'daily');
  const heads = page.locator('#panel-daily .blk .topright');
  await expect(heads.locator('.min')).toHaveText(['5 min', '30 + 5 min', '15 min', '5 min']);
  await expect(heads.locator('.blk-sep')).toHaveText(['·', '·', '·', '·']);
  await expect(heads.locator('.blk-sep').first()).toHaveAttribute('aria-hidden', 'true');
  const order = await heads.first().evaluate((h) => [...h.children].map((c) => c.className));
  expect(order).toEqual(['min', 'blk-sep', 'blkcheck']);
  await expect(heads.first().locator('.blkcheck')).toHaveAccessibleName('Practiced');
});

// ---------- gaps left by the review of 4.10j ----------

test('Friday: the briefing\'s Focused line ends with Friday\'s micro-dose, "Reinforce Weakest" (with the BHGS pack)', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }), now: '2026-11-13T12:00:00Z' });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="blockprac"][data-block="warmup"]').click();
  await openView(page, 'home');
  const brief = page.locator('#panel-home .home-brief');
  await expect(brief.locator('.hb-next')).toHaveText('Next · Focused');
  await expect(brief.locator('.hb-next-sub')).toHaveText('30 + 5 min · Reinforce Weakest');
});

test('Friday without the BHGS pack: no micro-dose in the briefing', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }), now: '2026-11-13T12:00:00Z', bhgsPack: false });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="blockprac"][data-block="warmup"]').click();
  await openView(page, 'home');
  await expect(page.locator('#panel-home .home-brief .hb-next')).toHaveText('Next · Focused');
  await expect(page.locator('#panel-home .home-brief .hb-next-sub')).toHaveText('30 + 5 min');
});
