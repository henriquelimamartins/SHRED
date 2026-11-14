// Phase 4.1 (D117, D118): the design system in CSS.
// - The colour tokens hold the values of the Phase 4 design canvas.
// - Views carry no inline style attributes (D98, slice 4.8), except the progress-bar widths
//   and the DOJO answer lock, which are set at run time.
// - No visible scrollbars anywhere (D17), while scrolling still works.
// - Small coloured text uses the light tints; filled buttons use the filled colours (D117 point 8).
// - The main text colour pairs meet WCAG AA contrast (4.5:1).
const { test, expect } = require('@playwright/test');
const { openApp, settle } = require('./support/app');
const { progressState } = require('./support/fixtures');

const TOKENS = {
  '--bg': '#0D0D0F', '--chrome': '#111114', '--card': '#16161A', '--card2': '#1E1E23',
  '--border': '#26262C', '--text': '#F2F2F4', '--muted': '#A0A0AA',
  '--red': '#E5484D', '--red-fill': '#D83A40', '--red-tint': '#FF5C61',
  '--purple': '#8B4CF0', '--purple-fill': '#6E3BD0', '--purple-tint': '#B79CFF',
  '--blue': '#4CA8F5', '--blue-tint': '#6DB8F7', '--green': '#46A758', '--green-tint': '#86D294',
};
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  const btn = nav.locator(`[data-action="go"][data-view="${view}"]`);
  // Slice 4.2a (D119): on the phone, Library and Tools (SETUP) are opened from the More sheet.
  if (await btn.count()) await btn.click();
  else {
    await nav.locator('[data-action="more"]').click();
    await page.locator(`#more-sheet [data-action="go"][data-view="${view}"]`).click();
  }
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
  await settle(page);
}
async function click(page, selector) {
  await page.locator(selector).first().click();
  await settle(page);
}

/** Elements under #root with a style attribute, except the ones the app sets at run time on purpose. */
async function unexpectedInlineStyles(page) {
  return page.evaluate(() => {
    const allowed = [
      { sel: '.pseg i', props: ['width'] },        // Technique phase bar fill
      { sel: '.xp-bar-fill', props: ['width'] },   // DOJO XP bar fill
      { sel: '.opt-btn', props: ['pointer-events'] }, // DOJO answers locked after a choice (CSSOM)
    ];
    const bad = [];
    document.querySelectorAll('#root [style]').forEach((el) => {
      const props = Array.from(el.style);
      const rule = allowed.find((a) => el.matches(a.sel));
      if (!rule || props.some((p) => !rule.props.includes(p))) bad.push(el.outerHTML.slice(0, 160));
    });
    return bad;
  });
}

test('colour tokens hold the design canvas values', async ({ page }) => {
  await openApp(page);
  const values = await page.evaluate((names) => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim().toUpperCase()]));
  }, Object.keys(TOKENS));
  expect(values).toEqual(Object.fromEntries(Object.entries(TOKENS).map(([k, v]) => [k, v.toUpperCase()])));
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0D0D0F');
  await expect(page.locator('body')).toHaveCSS('background-color', rgb(TOKENS['--bg']));
});

test('no inline style attributes in any view or panel', async ({ page }) => {
  test.setTimeout(90000); // walks every view and panel
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const seen = {};
  const check = async (name) => { seen[name] = await unexpectedInlineStyles(page); };

  await check('home');
  await click(page, '[data-action="reset"]'); await check('home: reset confirmation');
  await click(page, '[data-action="cancelreset"]');
  await click(page, '[data-action="openrestore"]'); await check('home: restore list');
  await click(page, '[data-action="pickrestore"]'); await check('home: restore confirmation');
  await click(page, '[data-action="cancelrestore"]');

  await goTo(page, 'daily'); await check('daily');
  await click(page, '#panel-daily [data-action="setday"]:not(.on)'); await check('daily: other day');

  await goTo(page, 'improv');
  await click(page, '#panel-improv [data-action="toggleacc"]'); await check('improv (passed gate open)');

  await goTo(page, 'library');
  for (let i = 0; i < 20; i++) {
    const closed = page.locator('#panel-library [data-action="toggleacc"]:has(.chev:not(.open))');
    if (!(await closed.count())) break;
    await closed.first().click(); await settle(page);
  }
  await check('library (every section open)');

  await goTo(page, 'dojo'); await check('dojo');
  await click(page, '#panel-dojo [data-action="dojoopen"]'); await check('dojo: codex');
  await click(page, '#panel-dojo [data-action="readcodex"]'); await check('dojo: codex module');
  await goTo(page, 'home'); await goTo(page, 'dojo');
  await click(page, '#panel-dojo [data-action="dojoplay"]'); await check('dojo: game');
  await click(page, '#panel-dojo [data-action="dojoans"]'); await check('dojo: game answered');

  await goTo(page, 'setup'); await check('setup');

  for (const [name, bad] of Object.entries(seen)) expect(bad, name).toEqual([]);
});

test('no visible scrollbars, and pages still scroll (D17)', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  for (const view of ['home', 'daily', 'improv', 'dojo', 'library', 'setup']) {
    await goTo(page, view);
    const visible = await page.evaluate(() => {
      const out = [];
      for (const el of [document.documentElement, document.body, ...document.querySelectorAll('#root *')]) {
        const cs = getComputedStyle(el);
        const scrolls = /(auto|scroll)/.test(cs.overflowY + cs.overflowX);
        if (scrolls && cs.scrollbarWidth !== 'none') out.push(el.className || el.tagName);
        // A visible scrollbar takes room: offset size minus border minus client size.
        const bars = el.offsetWidth - el.clientWidth - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
        if (scrolls && bars > 0) out.push('scrollbar space: ' + (el.className || el.tagName));
      }
      return out;
    });
    expect(visible, view).toEqual([]);
  }
  await goTo(page, 'home');
  const scrolled = await page.locator('#panel-home').evaluate((el) => { el.scrollTop = 400; return el.scrollTop; });
  expect(scrolled).toBeGreaterThan(0);
});

test('small coloured text uses the tints; filled buttons use the filled colours (D117)', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  await expect(page.locator('#panel-home .eyebrow').first()).toHaveCSS('color', rgb(TOKENS['--red-tint']));
  await expect(page.locator('.s-day.today .s-date')).toHaveCSS('color', rgb(TOKENS['--red-tint']));
  await expect(page.locator('[data-action="caltoday"]')).toHaveCSS('background-color', rgb(TOKENS['--red-fill']));
  const activeNav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first().locator('.active');
  await expect(activeNav).toHaveCSS('color', rgb(TOKENS['--red-tint']));

  await goTo(page, 'daily');
  await expect(page.locator('#panel-daily .dchip2.on')).toHaveCSS('background-color', rgb(TOKENS['--red-fill']));
  await expect(page.locator('#panel-daily .tbtn.purple').first()).toHaveCSS('background-color', rgb(TOKENS['--purple-fill']));

  await goTo(page, 'improv');
  await expect(page.locator('#panel-improv .eyebrow')).toHaveCSS('color', rgb(TOKENS['--purple-tint']));
  await expect(page.locator('#panel-improv .card-improv h3')).toHaveCSS('color', rgb(TOKENS['--purple-tint']));
  await expect(activeNav).toHaveCSS('color', rgb(TOKENS['--purple-tint']));

  await goTo(page, 'dojo');
  await expect(page.locator('#panel-dojo .eyebrow')).toHaveCSS('color', rgb(TOKENS['--blue-tint']));
});

test('main text colour pairs meet WCAG AA contrast (4.5:1)', () => {
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const T = TOKENS;
  const pairs = [
    ['text on card', T['--text'], T['--card']], ['muted on bg', T['--muted'], T['--bg']],
    ['muted on card', T['--muted'], T['--card']], ['muted on raised controls', T['--muted'], T['--card2']],
    ['red tint on card', T['--red-tint'], T['--card']], ['purple tint on card', T['--purple-tint'], T['--card']],
    ['blue tint on card', T['--blue-tint'], T['--card']], ['green tint on card', T['--green-tint'], T['--card']],
    ['white on purple fill', '#FFFFFF', T['--purple-fill']],
  ];
  for (const [name, fg, bg] of pairs) expect(ratio(fg, bg), name).toBeGreaterThanOrEqual(4.5);
});
