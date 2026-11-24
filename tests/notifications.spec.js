// Slice 4.10b (D152 points 6 and 7): notifications as stacked cards and no splash screen.
// Notifications: a card per message with an icon and a colour by kind, a close button and auto-close after 4 s;
// desktop bottom right since slice 4.10n (newest nearest the corner; AUDIT point 30), phone above the bottom bar (newest nearest the bar); at most 3 at once; the same
// message is not stacked twice; the newest card is #toast (an empty #toast stays when none is shown).
// Splash: the page opens straight on the app; the installed app (manifest) uses the app's dark colours.
// Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

async function saveSignedOut(page) {
  await openView(page, 'account');
  await page.locator('#panel-account [data-action="cloudsave"]').click();
}

test('there is no splash screen and the installed app uses the dark colours', async ({ page }) => {
  const monitor = await openApp(page);
  await expect(page.locator('#splash')).toHaveCount(0);
  await expect(page.locator('script[src*="splash.js"]')).toHaveCount(0);
  const manifest = await page.evaluate(async () => (await fetch('./manifest.json')).json());
  expect(manifest.background_color).toBe('#0D0D0F');
  expect(manifest.theme_color).toBe('#0D0D0F');
  expect(manifest.icons.map(i => i.src)).toEqual(['icon-192.png', 'icon-512.png', 'icon-maskable-512.png']);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('a notification is a card with an icon, its kind and a close button; no notification before', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#toast')).toHaveText('');
  await expect(page.locator('.toast-card')).toHaveCount(0);
  await saveSignedOut(page);
  const card = page.locator('#toast');
  await expect(card).toHaveText('Please login first to save to cloud.');
  await expect(card).toHaveClass(/toast-card/);
  await expect(card).toHaveClass(/toast-warn/);
  await expect(card).toHaveAttribute('role', 'alert');
  await expect(card.locator('.toast-icon svg')).toHaveCount(1);
  await expect(card.locator('button.toast-close')).toHaveAttribute('aria-label', 'Close notification');
});

test('the close button removes the card at once', async ({ page }) => {
  await openApp(page);
  await saveSignedOut(page);
  await page.locator('#toast .toast-close').click();
  await expect(page.locator('.toast-card')).toHaveCount(0);
  await expect(page.locator('#toast')).toHaveText('');
});

test('a notification closes by itself after about 4 seconds', async ({ page }) => {
  await openApp(page);
  await saveSignedOut(page);
  await expect(page.locator('.toast-card')).toHaveCount(1);
  await page.waitForTimeout(3000);
  await expect(page.locator('.toast-card')).toHaveCount(1);
  await expect(page.locator('.toast-card')).toHaveCount(0, { timeout: 3000 });
});

test('hovering a notification keeps it open (desktop)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover is a desktop gesture');
  await openApp(page);
  await saveSignedOut(page);
  await page.locator('#toast').hover();
  await page.waitForTimeout(5000);
  await expect(page.locator('.toast-card')).toHaveCount(1);
  await page.mouse.move(5, 5);
  await expect(page.locator('.toast-card')).toHaveCount(0, { timeout: 6000 });
});

test('the same message is not stacked twice; different messages stack, at most 3', async ({ page }) => {
  await openApp(page);
  await saveSignedOut(page);
  await page.locator('#panel-account [data-action="cloudsave"]').click();
  await expect(page.locator('.toast-card')).toHaveCount(1);
  await page.locator('#panel-account [data-action="cloudload"]').click();
  await expect(page.locator('.toast-card')).toHaveCount(2);
  await expect(page.locator('#toast')).toHaveText('Please login first to load from cloud.');
  await page.evaluate(async () => {
    const m = await import(document.querySelector('script[type="module"]').src.replace(/main\.js\?v=\d+$/, 'ui.js?v=2'));
    m.showToast('Backup downloaded.');
    m.showToast('No cloud data found.');
  });
  await expect(page.locator('.toast-card:not(.toast-out)')).toHaveCount(3);
  await expect(page.locator('#toast')).toHaveText('No cloud data found.');
  await expect(page.locator('#toast')).toHaveClass(/toast-info/);
});

test('kinds: success, info, warn, error, unlock and milestone each get their own class', async ({ page }) => {
  await openApp(page);
  const kinds = await page.evaluate(async () => {
    const m = await import(document.querySelector('script[type="module"]').src.replace(/main\.js\?v=\d+$/, 'ui.js?v=2'));
    return [
      m.toastKind('Progress synced from cloud!'),
      m.toastKind('Updated with newer progress from another device.'),
      m.toastKind('Could not reach your cloud progress. Changes are saved on this device only.'),
      m.toastKind("Newer progress from another device was loaded. Your last change here was kept only in this device's backups."),
      m.toastKind('Your progress was saved by a newer version of the app. Reload the page to update.'),
      m.toastKind('Error saving to cloud.'),
      m.toastKind('Could not back up your progress. Nothing was reset.'),
      m.toastKind('This file is not a SHRED Roadmap backup. Nothing was restored.'),
      m.toastKind('Cloud progress is still loading. Try again in a moment.'),
    ];
  });
  expect(kinds).toEqual(['success', 'info', 'warn', 'warn', 'warn', 'error', 'error', 'error', 'info']);
});

test('placement: desktop bottom right, newest nearest the corner; phone above the bottom bar', async ({ page, isMobile }) => {
  await openApp(page);
  await saveSignedOut(page);
  await page.locator('#panel-account [data-action="cloudload"]').click();
  await expect(page.locator('.toast-card')).toHaveCount(2);
  const vp = page.viewportSize();
  const newest = await page.locator('#toast').boundingBox();
  const older = await page.locator('.toast-card:not(#toast)').boundingBox();
  if (isMobile) {
    const bar = await page.locator('#botnav').boundingBox();
    expect(newest.y + newest.height).toBeLessThanOrEqual(bar.y + 1);
    expect(newest.y).toBeGreaterThan(older.y);
    expect(newest.x).toBeLessThan(20);
  } else {
    // Slice 4.10n (AUDIT point 30; changed on purpose, D107 point 4): bottom right, 20 px from the edges.
    expect(newest.y + newest.height).toBeGreaterThan(vp.height - 40);
    expect(newest.y + newest.height).toBeLessThanOrEqual(vp.height - 10);
    expect(newest.x + newest.width).toBeGreaterThan(vp.width - 40);
    expect(newest.y).toBeGreaterThan(older.y);
  }
});

test('showing notifications writes nothing', async ({ page }) => {
  await openApp(page, { localState: progressState() });
  await settle(page);
  const before = await localSaved(page);
  await saveSignedOut(page);
  await page.locator('#toast .toast-close').click();
  await settle(page);
  expect(await localSaved(page)).toEqual(before);
});
