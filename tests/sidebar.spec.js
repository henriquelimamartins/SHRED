// Slice 4.10d (DECISIONS D152 points 1, 3, 4, 8; D154 point 1): the desktop sidebar of the 4.10 design round.
// Logo = ridge mark on the left of THE SHRED / ROADMAP (same font, weight and letter-spacing, ROADMAP larger), centred
// over Search and the menu, the top of the sun on the cap top of THE SHRED and the bottom of the ridge line on the
// baseline of ROADMAP; menu HOME, DAILY, a thin line, PILLARS, a thin line, RESOURCES, then a thin line and the rails;
// no sub-items (the menu never changes height); no Today block; the photo's ring in the sync state's colour.
// The geometry checks use line boxes (line-height .92), so they do not depend on the font file. Firebase is stubbed.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, cloudWrites, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });
test.skip(({ isMobile }) => isMobile, 'the sidebar is desktop only');

const PHOTO_USER = { ...TEST_USER, displayName: 'Test Person', photoURL: 'https://lh3.googleusercontent.com/a/test-photo=s96-c' };
const GREEN = 'rgb(70, 167, 88)';
const AMBER = 'rgb(242, 181, 58)';
const GREY = 'rgb(90, 90, 100)';

async function setFlags(page, flags) {
  await page.addInitScript((f) => { window.__SHRED_TEST_FLAGS__ = Object.assign({}, f); }, flags);
}
const ring = (page) => page.locator('#sidebar-account .avatar-ring');

test('logo: the ridge mark on the left of THE SHRED / ROADMAP, no tile or outline', async ({ page }) => {
  const monitor = await openApp(page);
  const logo = page.locator('#sidebar .sidebar-header .side-logo');
  await expect(logo).toHaveCount(1);
  const mark = logo.locator('svg.side-logo-mark');
  await expect(mark.locator('circle.logo-sun')).toHaveCount(1);
  await expect(mark.locator('path.logo-ridge')).toHaveCount(1);
  await expect(mark.locator('rect')).toHaveCount(0); // no tile
  await expect(mark).toHaveAttribute('aria-hidden', 'true'); // the words name the app
  await expect(logo.locator('.side-logo-top')).toHaveText('THE SHRED');
  await expect(logo.locator('.side-logo-red')).toHaveText('SHRED');
  await expect(logo.locator('.side-logo-bottom')).toHaveText('ROADMAP');
  const g = await logo.evaluate((el) => {
    const r = (s) => el.querySelector(s).getBoundingClientRect();
    return { mark: r('.side-logo-mark'), words: r('.side-logo-words') };
  });
  expect(g.mark.right).toBeLessThanOrEqual(g.words.left); // mark on the left
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('logo: ROADMAP in the font, weight and letter-spacing of THE SHRED, only larger', async ({ page }) => {
  await openApp(page);
  const st = await page.locator('#sidebar .side-logo').evaluate((el) => ['.side-logo-top', '.side-logo-bottom'].map((s) => {
    const c = getComputedStyle(el.querySelector(s));
    return { family: c.fontFamily, weight: c.fontWeight, size: parseFloat(c.fontSize), spacing: parseFloat(c.letterSpacing) / parseFloat(c.fontSize) };
  }));
  expect(st[1].family).toBe(st[0].family);
  expect(st[0].family).toContain('Oswald');
  expect(st[1].weight).toBe(st[0].weight);
  expect(st[0].weight).toBe('700');
  expect(st[1].spacing).toBeCloseTo(st[0].spacing, 3);
  expect(st[0].spacing).toBeCloseTo(0.02, 3);
  expect(st[0].size).toBe(26);
  expect(st[1].size).toBe(28.5);
});

test('logo: top of the sun on the cap top of THE SHRED, bottom of the ridge on the baseline of ROADMAP (D154)', async ({ page }) => {
  await openApp(page);
  const g = await page.locator('#sidebar .side-logo').evaluate((el) => {
    const words = el.querySelector('.side-logo-words').getBoundingClientRect();
    const sun = el.querySelector('.logo-sun').getBoundingClientRect();
    const svg = el.querySelector('.side-logo-mark');
    const ridge = el.querySelector('.logo-ridge').getBoundingClientRect();
    const scale = svg.getBoundingClientRect().height / 204.83;
    const size = parseFloat(getComputedStyle(el.querySelector('.side-logo-top')).fontSize);
    return { sunTop: sun.top, ridgeBottom: ridge.bottom + 3.5 * scale, capTop: words.top + 0.102 * size, baseline: words.top + 2.0395 * size };
  });
  expect(Math.abs(g.sunTop - g.capTop)).toBeLessThan(1);
  expect(Math.abs(g.ridgeBottom - g.baseline)).toBeLessThan(1);
});

test('logo: centred over Search and the menu', async ({ page }) => {
  await openApp(page);
  const c = await page.evaluate(() => ['.side-logo', '.side-search', '#sidebar-nav-inner'].map((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return r.left + r.width / 2;
  }));
  expect(Math.abs(c[0] - c[1])).toBeLessThan(1.5);
  expect(Math.abs(c[0] - c[2])).toBeLessThan(1.5);
});

test('order: logo, Search, HOME, DAILY, line, PILLARS, line, RESOURCES, line, rails, account row', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const order = await page.locator('#sidebar-nav-inner > *').evaluateAll((els) => els.map((e) =>
    e.classList.contains('side-sep') ? '|' : e.classList.contains('side-group') ? '#' + e.textContent : e.dataset.view));
  expect(order).toEqual(['home', 'daily', '|', '#Pillars', 'technique', 'improv', 'dojo', '|', '#Resources', 'library', 'setup']);
  const tops = await page.evaluate(() => ['.sidebar-header', '#sidebar-search', '#sidebar-nav-inner', '.side-sep-rails', '#sidebar-rails', '#sidebar-account']
    .map((s) => document.querySelector('#sidebar ' + s).getBoundingClientRect().top));
  expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  await expect(page.locator('#sidebar-rails .rails-group')).toHaveText(['BHGS Roadmap', 'Musical Development']);
  await expect(page.locator('#sidebar-rails [data-rail]')).toHaveCount(3);
  // The lines are thin and decorative.
  const sep = page.locator('#sidebar .side-sep').first();
  await expect(sep).toHaveAttribute('aria-hidden', 'true');
  expect(await sep.evaluate((e) => e.getBoundingClientRect().height)).toBe(1);
});

test('without the BHGS pack: PILLARS starts at Improvisation, the rails show Musical Development only', async ({ page }) => {
  await openApp(page, { bhgsPack: false });
  const order = await page.locator('#sidebar-nav-inner > *').evaluateAll((els) => els.map((e) =>
    e.classList.contains('side-sep') ? '|' : e.classList.contains('side-group') ? '#' + e.textContent : e.dataset.view));
  expect(order).toEqual(['home', 'daily', '|', '#Pillars', 'improv', 'dojo', '|', '#Resources', 'library', 'setup']);
  await expect(page.locator('#sidebar-rails .rails-group')).toHaveText(['Musical Development']);
});

test('no sub-items: the menu has the same height on every page; the active item is marked for screen readers', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const heights = [];
  for (const v of ['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup', 'account']) {
    await openView(page, v);
    await expect(page.locator('#sidebar .side-sub, #sidebar .side-subs')).toHaveCount(0);
    heights.push(await page.locator('#sidebar-nav-inner').evaluate((e) => e.getBoundingClientRect().height));
    if (v !== 'account') await expect(page.locator(`#sidebar-nav-inner .side-item[data-view="${v}"]`)).toHaveAttribute('aria-current', 'page');
  }
  expect(new Set(heights).size).toBe(1);
  await expect(page.locator('#sidebar-nav-inner [aria-current]')).toHaveCount(0); // Account & data is not in the menu
});

test('no Today block and no streak line in the sidebar', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1, streakDates: ['2026-11-08', '2026-11-09'] }) });
  await expect(page.locator('#sidebar-today, #sidebar .side-today')).toHaveCount(0);
  await expect(page.locator('#sidebar')).not.toContainText('streak');
  await expect(page.locator('#sidebar')).not.toContainText('days logged');
});

test('photo ring: grey when signed out, with the words beside it', async ({ page }) => {
  await openApp(page);
  await expect(ring(page)).toHaveAttribute('data-tone', 'none');
  await expect(ring(page)).toHaveCSS('border-top-color', GREY);
  await expect(ring(page).locator('.avatar-none svg')).toHaveCount(1);
  await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Saved on this device only');
});

test('photo ring: grey while the cloud is loading, then green when synced; the photo sits inside it', async ({ page }) => {
  await setFlags(page, { holdGetDoc: true });
  await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState() }, avatar: true });
  await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Loading cloud progress…');
  await expect(ring(page)).toHaveCSS('border-top-color', GREY);
  await page.evaluate(() => window.__SHRED_TEST_RELEASE_GETDOC__());
  await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Synced', { timeout: 6000 });
  await expect(ring(page)).toHaveAttribute('data-tone', 'ok');
  await expect(ring(page)).toHaveCSS('border-top-color', GREEN);
  await expect(ring(page).locator('img.avatar-img')).toHaveCount(1);
  const box = await ring(page).evaluate((r) => {
    const a = r.getBoundingClientRect(), b = r.querySelector('.avatar').getBoundingClientRect();
    return { outer: a.width, inner: b.width, inside: b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom };
  });
  expect(box).toEqual({ outer: 32, inner: 24, inside: true });
});

test('photo ring: amber while a change waits for the cloud', async ({ page }) => {
  await setFlags(page, { failTransaction: true });
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="blockprac"][data-block="warmup"]').click();
  await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Changes not synced yet', { timeout: 6000 });
  await expect(ring(page)).toHaveAttribute('data-tone', 'wait');
  await expect(ring(page)).toHaveCSS('border-top-color', AMBER);
});

test('photo ring: follows the state when the network drops and returns', async ({ page, context }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
  await expect(ring(page)).toHaveCSS('border-top-color', GREEN);
  await context.setOffline(true);
  await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Offline · saved on this device');
  await expect(ring(page)).toHaveCSS('border-top-color', AMBER);
  await context.setOffline(false);
  await expect(ring(page)).toHaveCSS('border-top-color', GREEN, { timeout: 6000 });
});

test('showing the sidebar and moving between pages writes nothing', async ({ page }) => {
  await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) }, avatar: true });
  await settle(page);
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  for (const v of ['daily', 'technique', 'improv', 'dojo', 'library', 'setup', 'account', 'home']) await openView(page, v);
  await page.waitForTimeout(3200); // one refresh of the account row
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});
