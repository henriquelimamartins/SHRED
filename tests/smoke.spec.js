// Phase 1.1 smoke test: the current app opens and its main views render, on desktop and mobile.
// Signed-out user, empty local storage. Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, unexpectedConsoleErrors, cloudWrites } = require('./support/app');

const MAIN_VIEWS = ['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup'];
// Slice 4.2a (D119): the phone bottom bar holds HOME, DAILY, IMPROV, THEORY (dojo) and More; Library and Tools are in More.
// Slice 4.3 (D117, D122): TECHNIQUE joins the menu and the phone bar.
const PHONE_BAR_VIEWS = ['home', 'daily', 'technique', 'improv', 'dojo'];
const PHONE_MORE_VIEWS = ['library', 'setup'];

function navFor(page, projectName) {
  // Desktop uses the sidebar; mobile uses the bottom bar.
  return page.locator(projectName === 'mobile' ? '#botnav' : '#sidebar-nav-inner');
}

test('app opens on Home without errors (signed out)', async ({ page }, testInfo) => {
  const monitor = await openApp(page);

  await expect(page.locator('#panel-home')).toHaveClass(/active/);
  await expect(page.locator('#panel-home .panel-content')).not.toBeEmpty();
  await expect(page.locator('#topbar')).toContainText('SHRED');
  await expect(page.locator('#authBtn')).toHaveText('Login');
  await expect(navFor(page, testInfo.project.name)).toBeVisible();
  await expect(page.getByText('Render Error:')).toHaveCount(0);

  expect(monitor.pageErrors, 'uncaught page errors').toEqual([]);
  expect(unexpectedConsoleErrors(monitor), 'console errors').toEqual([]);
  expect(monitor.firebaseBackendRequests, 'requests to real Firebase').toEqual([]);
  expect(await cloudWrites(page), 'cloud writes while signed out').toEqual([]);

  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
});

test('every main view opens from the navigation', async ({ page }, testInfo) => {
  const monitor = await openApp(page);
  const nav = navFor(page, testInfo.project.name);
  const mobile = testInfo.project.name === 'mobile';

  const views = await nav.locator('[data-action="go"]').evaluateAll((btns) => btns.map((b) => b.dataset.view));
  expect(views).toEqual(mobile ? PHONE_BAR_VIEWS : MAIN_VIEWS);

  for (const view of MAIN_VIEWS) {
    const inMore = mobile && PHONE_MORE_VIEWS.includes(view);
    if (inMore) {
      await nav.locator('[data-action="more"]').click();
      await page.locator(`#more-sheet [data-action="go"][data-view="${view}"]`).click();
      await expect(page.locator('#more-sheet')).not.toHaveClass(/open/);
    } else {
      await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
    }
    await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
    await expect(page.locator(`#panel-${view} .panel-content`)).not.toBeEmpty();
    await expect(nav.locator(inMore ? '[data-action="more"]' : `[data-view="${view}"]`)).toHaveClass(/active/);
    await expect(page.getByText('Render Error:')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`view-${view}.png`) });
  }

  expect(monitor.pageErrors, 'uncaught page errors').toEqual([]);
  expect(unexpectedConsoleErrors(monitor), 'console errors').toEqual([]);
  expect(monitor.firebaseBackendRequests, 'requests to real Firebase').toEqual([]);
  expect(await cloudWrites(page), 'cloud writes while signed out').toEqual([]);
});
