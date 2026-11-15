// Slice 4.7c (D136): HOME calendar fixes and the DAILY KEY circle corrections.
// (1) Every month from the first logged day to the current month is in the calendar carousel, so swiping goes back
// as far as the arrows; the arrows follow the month reached by swiping. (2) Every month shows 6 weeks, so all months
// have the same height (no empty space under 5-week months). (3) KEY circle: position 7 is G♭ major / E♭ minor; the
// chosen key and its relative are marked by their slice of the ring; no notes row; every key's diatonic chords match
// the expected answers written independently by the music-theory verifier (D134). Fixed clock: Tue 2026-11-10.
const { test, expect } = require('@playwright/test');
const { openApp, openView } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const home = (page) => page.locator('#panel-home');
const carousel = (page) => home(page).locator('#cal-carousel');
const title = async (page) => [await page.locator('#cal-month-title').textContent(), await page.locator('#cal-year-title').textContent()];
const nav = (page, a) => home(page).locator(`.calendar-header-nav [data-action="${a}"]`);
async function swipeTo(page, ym) {
  await carousel(page).evaluate((el, ym) => el.scrollTo({ left: el.querySelector(`[data-ym="${ym}"]`).offsetLeft, behavior: 'instant' }), ym);
  await page.waitForTimeout(150);
}
const logged = () => baseState({ streakDates: ['2026-08-20', '2026-10-05', '2026-11-09'] });

test.describe('HOME calendar', () => {
  test('every month from the first logged day to now is in the carousel', async ({ page }) => {
    await openApp(page, { localState: logged() });
    await expect(carousel(page).locator('.cal-panel')).toHaveCount(4);
    expect(await carousel(page).locator('.cal-panel').evaluateAll((els) => els.map((e) => e.dataset.ym))).toEqual(['2026-7', '2026-8', '2026-9', '2026-10']);
    expect(await title(page)).toEqual(['November', '2026']);
  });

  test('swiping goes back month after month, and the arrows follow', async ({ page }) => {
    await openApp(page, { localState: logged() });
    await swipeTo(page, '2026-9');
    expect(await title(page)).toEqual(['October', '2026']);
    await expect(nav(page, 'calnext')).toBeEnabled();
    await swipeTo(page, '2026-8');
    expect(await title(page)).toEqual(['September', '2026']);
    await swipeTo(page, '2026-7');
    expect(await title(page)).toEqual(['August', '2026']);
    await expect(nav(page, 'calprev')).toBeDisabled();
    await expect(nav(page, 'caltoday')).toBeVisible();
    await swipeTo(page, '2026-10');
    await expect(nav(page, 'calnext')).toBeDisabled();
    await expect(nav(page, 'caltoday')).toBeHidden();
  });

  test('every month shows 6 weeks, so all months have the same height', async ({ page }) => {
    await openApp(page, { localState: logged() });
    for (const ym of ['2026-7', '2026-8', '2026-9', '2026-10']) {
      await expect(carousel(page).locator(`.cal-panel[data-ym="${ym}"] .s-day`)).toHaveCount(42);
    }
    // October 2026 is a 5-week month: its 6th week is 2-8 November, shown as the other month.
    const oct = carousel(page).locator('.cal-panel[data-ym="2026-9"] .s-day');
    await expect(oct.last()).toHaveText('8SUN');
    await expect(oct.last()).toHaveClass(/other-month/);
    const heights = await carousel(page).locator('.cal-panel .streak-grid').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(new Set(heights).size).toBe(1);
    const panelH = heights[0];
    const carouselH = await carousel(page).evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(Math.abs(carouselH - panelH)).toBeLessThanOrEqual(2);
  });

  test('nothing is written by swiping the calendar', async ({ page }) => {
    await openApp(page, { localState: logged() });
    const before = await page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'));
    await swipeTo(page, '2026-7');
    expect(await page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'))).toBe(before);
  });
});

// Expected diatonic triads from the music-theory verifier (theory only, without the app's code), with ♯ ♭ °.
const EXPECTED = {
  'C major': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'], 'G major': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#°'],
  'D major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#°'], 'A major': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#°'],
  'E major': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#°'], 'B major': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#°'],
  'Gb major': ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'F°'], 'Db major': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'C°'],
  'Ab major': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'G°'], 'Eb major': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'D°'],
  'Bb major': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'A°'], 'F major': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'E°'],
  'A minor': ['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G'], 'E minor': ['Em', 'F#°', 'G', 'Am', 'Bm', 'C', 'D'],
  'B minor': ['Bm', 'C#°', 'D', 'Em', 'F#m', 'G', 'A'], 'F# minor': ['F#m', 'G#°', 'A', 'Bm', 'C#m', 'D', 'E'],
  'C# minor': ['C#m', 'D#°', 'E', 'F#m', 'G#m', 'A', 'B'], 'G# minor': ['G#m', 'A#°', 'B', 'C#m', 'D#m', 'E', 'F#'],
  'Eb minor': ['Ebm', 'F°', 'Gb', 'Abm', 'Bbm', 'Cb', 'Db'], 'Bb minor': ['Bbm', 'C°', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'],
  'F minor': ['Fm', 'G°', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'], 'C minor': ['Cm', 'D°', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
  'G minor': ['Gm', 'A°', 'Bb', 'Cm', 'Dm', 'Eb', 'F'], 'D minor': ['Dm', 'E°', 'F', 'Gm', 'Am', 'Bb', 'C'],
};
const pretty = (s) => s.replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭');

test.describe('DAILY KEY circle (desktop)', () => {
  test.beforeEach(async ({}, testInfo) => { test.skip(testInfo.project.name === 'mobile', 'desktop only'); });

  test('every key on the circle shows the expected diatonic chords', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openView(page, 'daily');
    const card = page.locator('#panel-daily .daily-key-card');
    for (const [key, chords] of Object.entries(EXPECTED)) {
      await card.locator(`.kc-key[aria-label="${pretty(key)}"]`).click();
      await expect(card.locator('.dc-keyname')).toHaveText(pretty(key));
      await expect(card.locator('.kc-chord')).toHaveText(chords.map(pretty));
    }
  });

  test('position 7 pairs G♭ major with E♭ minor', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openView(page, 'daily');
    const card = page.locator('#panel-daily .daily-key-card');
    await expect(card.locator('.kc-maj-6')).toHaveAttribute('aria-label', 'G♭ major');
    await expect(card.locator('.kc-min-6')).toHaveAttribute('aria-label', 'E♭ minor');
    await expect(card.locator('.kc-key[aria-label="F♯ major"]')).toHaveCount(0);
  });

  test('the chosen key and its relative are marked by ring slices, not circles; no notes row', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    await openView(page, 'daily');
    const card = page.locator('#panel-daily .daily-key-card');
    await expect(card.locator('.kc-sector.on[data-ring="min"]')).toHaveCount(1); // C♯ minor (today)
    await expect(card.locator('.kc-sector.rel[data-ring="maj"]')).toHaveCount(1); // E major
    await expect(card.locator('.kc-key.on')).toHaveCSS('border-top-width', '0px');
    await expect(card.locator('.kc-key.on')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    // The slice: two arcs (inner and outer ring lines) joined by straight sides.
    const d = await card.locator('.kc-sector.on').getAttribute('d');
    expect((d.match(/A/g) || []).length).toBe(2);
    expect((d.match(/L/g) || []).length).toBe(1);
    await expect(card.locator('.kc-note')).toHaveCount(0);
    await card.locator('.kc-key[aria-label="G♭ major"]').click();
    await expect(card.locator('.kc-sector.on[data-ring="maj"]')).toHaveCount(1);
    await expect(card.locator('.kc-sector.rel[data-ring="min"]')).toHaveCount(1);
  });
});
