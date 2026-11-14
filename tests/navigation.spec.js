// Slice 4.2a (DECISIONS D119, D117, D25, D114): the new navigation.
// Desktop: sidebar = brand, Search, menu (Home, Daily, Improv, Theory, Library, Tools), account row; no top bar.
// Phone: top bar (brand, search, login) and a bottom bar Home, Daily, Improv, Theory, More; More holds Library and Tools.
// Slice 4.3 (D117, D122): TECHNIQUE joins: menu Home, Daily, Technique, Improv, Theory, Library, Tools; phone bar
// Home, Daily, Technique, Improv, Theory, More. The phase bar is on HOME and at the top of the TECHNIQUE page. Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, unexpectedConsoleErrors, cloudWrites } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const labels = (loc) => loc.evaluateAll((els) => els.map((e) => e.textContent.replace(/[^A-Za-z ]/g, '').trim()));

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('sidebar shows brand, Search, the menu in D117 order and the account row; the top bar is hidden', async ({ page }) => {
    const monitor = await openApp(page);
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();
    await expect(page.locator('#topbar')).toBeHidden();
    await expect(page.locator('#botnav')).toBeHidden();

    expect(await labels(page.locator('#sidebar-nav-inner [data-action="go"]'))).toEqual(['Home', 'Daily', 'Technique', 'Improvisation', 'Theory', 'Library', 'Tools']); // D123: full name where there is room
    expect(await page.locator('#sidebar-nav-inner [data-action="go"]').evaluateAll((b) => b.map((x) => x.dataset.view)))
      .toEqual(['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup']);
    await expect(page.locator('#sidebar').getByText('Dojo', { exact: true })).toHaveCount(0);

    // Order inside the sidebar: brand, Search, menu, account row.
    const tops = await page.evaluate(() => ['.sidebar-header', '#sidebar-search', '#sidebar-nav-inner', '#sidebar-account']
      .map((s) => document.querySelector(s).getBoundingClientRect().top));
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    await expect(page.locator('#sidebar-account .side-auth')).toHaveText('Login');
    await expect(page.locator('#sidebar-account .side-user')).toHaveText('Not signed in');

    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('sidebar Search shows its message', async ({ page }) => {
    await openApp(page);
    await page.locator('#sidebar .side-search').click();
    await expect(page.locator('#toast')).toHaveText('Global search coming in a future phase');
  });

  test('signed in: the account row shows the name and Logout', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(page.locator('#sidebar-account .side-user')).toHaveText('tester');
    await expect(page.locator('#sidebar-account .side-auth')).toHaveText('Logout');
  });

  test('active menu colours: Technique red, Improv purple, Theory blue', async ({ page }) => {
    await openApp(page);
    const nav = page.locator('#sidebar-nav-inner');
    await expect(nav.locator('.active')).toHaveCSS('color', rgb('#FF5C61'));
    await nav.locator('[data-view="improv"]').click();
    await expect(nav.locator('.active')).toHaveCSS('color', rgb('#B79CFF'));
    await nav.locator('[data-view="dojo"]').click();
    await expect(nav.locator('.active')).toHaveCSS('color', rgb('#6DB8F7'));
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('bottom bar is Home, Daily, Technique, Improv, Theory, More; the sidebar is hidden', async ({ page }) => {
    const monitor = await openApp(page);
    await expect(page.locator('#sidebar')).toBeHidden();
    await expect(page.locator('#topbar')).toBeVisible();
    expect(await labels(page.locator('#botnav button'))).toEqual(['Home', 'Daily', 'Technique', 'Improv', 'Theory', 'More']);
    await expect(page.locator('#more-sheet')).not.toHaveClass(/open/);
    expect(monitor.pageErrors).toEqual([]);
  });

  test('More opens a sheet with Library and Tools; choosing one opens it and closes the sheet', async ({ page }) => {
    await openApp(page);
    const more = page.locator('#botnav [data-action="more"]');
    await more.click();
    await expect(page.locator('#more-sheet')).toHaveClass(/open/);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(await labels(page.locator('#more-sheet .more-group'))).toEqual(['Resources', 'Tools']);
    expect(await labels(page.locator('#more-sheet .more-item'))).toEqual(['Library', 'Setup']);

    await page.locator('#more-sheet [data-view="setup"]').click();
    await expect(page.locator('#panel-setup')).toHaveClass(/active/);
    await expect(page.locator('#more-sheet')).not.toHaveClass(/open/);
    await expect(more).toHaveClass(/active/);

    await page.locator('#botnav [data-view="daily"]').click();
    await expect(page.locator('#panel-daily')).toHaveClass(/active/);
    await expect(more).not.toHaveClass(/active/);
  });

  test('tapping outside the sheet or More again closes it without changing page', async ({ page }) => {
    await openApp(page);
    const more = page.locator('#botnav [data-action="more"]');
    await more.click();
    await page.locator('#more-sheet .more-backdrop').click({ position: { x: 20, y: 20 } });
    await expect(page.locator('#more-sheet')).not.toHaveClass(/open/);
    await more.click();
    await expect(page.locator('#more-sheet')).toHaveClass(/open/);
    await more.click();
    await expect(page.locator('#more-sheet')).not.toHaveClass(/open/);
    await expect(page.locator('#panel-home')).toHaveClass(/active/);
  });

  test('page header is at most 120 px (D112)', async ({ page }) => {
    await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
    const h = await page.locator('#topbar').evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(120);
  });
});

// Slice 4.4 (D123): the Technique rail replaced the 5-segment phase bar; rails.spec.js covers the rails in detail.
test('the Technique rail is on HOME and the TECHNIQUE page (D25, D117), not in the page body elsewhere', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  await expect(page.locator('#topbar [data-rail]')).toHaveCount(0);
  await expect(page.locator('#panel-home [data-rail="technique"]')).toHaveCount(1);
  await expect(page.locator('#panel-home [data-rail="technique"] .rail-node')).toHaveCount(5);
  await expect(page.locator('#panel-technique [data-rail="technique"]')).toHaveCount(1);
  for (const v of ['daily', 'improv', 'dojo', 'library', 'setup']) {
    await expect(page.locator(`#panel-${v} [data-rail="technique"]`)).toHaveCount(0);
  }
});

test('navigating changes nothing in the saved data and writes nothing to the cloud', async ({ page }, testInfo) => {
  await openApp(page, { localState: progressState() });
  const before = await page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'));
  const views = ['daily', 'technique', 'improv', 'dojo', 'library', 'setup', 'home'];
  for (const v of views) {
    const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
    const btn = nav.locator(`[data-action="go"][data-view="${v}"]`);
    if (await btn.count()) await btn.click();
    else { await nav.locator('[data-action="more"]').click(); await page.locator(`#more-sheet [data-view="${v}"]`).click(); }
    await expect(page.locator(`#panel-${v}`)).toHaveClass(/active/);
  }
  expect(await page.evaluate(() => localStorage.getItem('shredRoadmapState_v10'))).toBe(before);
  expect(await cloudWrites(page)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('home-after-nav.png') });
});
