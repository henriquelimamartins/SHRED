// Phase 2.5: the search box and the SETUP video button are handled by the central click handler
// (no inline onclick). What the user sees must stay the same.
const { test, expect } = require('@playwright/test');
const { openApp, unexpectedConsoleErrors } = require('./support/app');

const VIDEOS = {
  prs: { title: 'Official PRS Setup Guide', url: 'https://www.youtube.com/watch?v=wmoc9ksdZdE' },
  epi: { title: 'Epiphone Les Paul Setup Guide', url: 'https://www.youtube.com/watch?v=3Dhn56ybQHg' },
};

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

test('no inline onclick handlers are left in the page', async ({ page }) => {
  await openApp(page);
  for (const view of ['home', 'daily', 'improv', 'dojo', 'library', 'setup']) {
    await goTo(page, view);
    expect(await page.locator('[onclick]').count(), `inline onclick on ${view}`).toBe(0);
  }
});

test('Search shows the "coming in a future phase" message, with no errors', async ({ page }) => {
  const monitor = await openApp(page);
  await page.locator('.shell-search').click();
  await expect(page.locator('#toast')).toHaveClass(/show/);
  await expect(page.locator('#toast')).toHaveText('Global search coming in a future phase');
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

for (const [guitar, video] of Object.entries(VIDEOS)) {
  test(`SETUP ${guitar}: the video button opens ${video.title} in a new tab`, async ({ page }) => {
    // Answer the video page locally, so the test never goes to YouTube.
    await page.context().route('https://www.youtube.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>video</title>' }));
    const monitor = await openApp(page);
    await goTo(page, 'setup');
    if (guitar !== 'prs') await page.locator('#panel-setup select[data-action="setGuitar"]').selectOption(guitar);
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('#panel-setup button', { hasText: video.title }).click(),
    ]);
    await popup.waitForLoadState();
    expect(popup.url()).toBe(video.url);
    await expect(page.locator('#panel-setup')).toHaveClass(/active/); // the app stays where it was
    expect(monitor.pageErrors).toEqual([]);
  });
}
