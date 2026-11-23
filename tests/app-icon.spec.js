// Slice 4.10g (D160, D161): the app icon follows the ridge logo (option A of the icon canvas: the sidebar mark on
// the app's dark tile, red sun, light ridge line). Checks the files the page and the manifest name: they load, have the declared size, the manifest has
// an "any" and a "maskable" icon, and the iPhone icon is opaque (iOS rounds the corners itself).
// Nothing is written; Firebase is stubbed.
const { test, expect } = require('@playwright/test');
const { openApp, unexpectedConsoleErrors } = require('./support/app');

async function imageInfo(page, src) {
  return page.evaluate(async (url) => {
    const res = await fetch(url);
    if (!res.ok) return { status: res.status };
    const bmp = await createImageBitmap(await res.blob());
    const c = document.createElement('canvas');
    c.width = bmp.width; c.height = bmp.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const corner = ctx.getImageData(0, 0, 1, 1).data;
    const centre = ctx.getImageData(Math.floor(bmp.width / 2), Math.floor(bmp.height * 0.85), 1, 1).data;
    return { status: res.status, width: bmp.width, height: bmp.height, cornerAlpha: corner[3], centre: Array.from(centre) };
  }, src);
}

test('page icons load at their sizes; the iPhone icon is opaque edge to edge', async ({ page }) => {
  const monitor = await openApp(page);
  const fav = await page.locator('link[rel="icon"]').getAttribute('href');
  const touch = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(fav).toBe('./favicon.png?v=5');
  expect(touch).toBe('./apple-touch-icon.png?v=5');
  const f = await imageInfo(page, fav);
  expect([f.status, f.width, f.height]).toEqual([200, 48, 48]);
  const t = await imageInfo(page, touch);
  expect([t.status, t.width, t.height]).toEqual([200, 180, 180]);
  expect(t.cornerAlpha).toBe(255);
  // The tile is the app's dark chrome colour (#111114) below the ridge.
  expect(t.centre.slice(0, 3)).toEqual([0x11, 0x11, 0x14]);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('manifest: "any" icons at 192 and 512 px and a full-bleed maskable icon', async ({ page }) => {
  await openApp(page);
  const manifest = await page.evaluate(async () => (await fetch('./manifest.json')).json());
  const byPurpose = (p) => manifest.icons.filter(i => i.purpose === p);
  expect(byPurpose('any').map(i => [i.src, i.sizes])).toEqual([['icon-192.png', '192x192'], ['icon-512.png', '512x512']]);
  expect(byPurpose('maskable').map(i => [i.src, i.sizes])).toEqual([['icon-maskable-512.png', '512x512']]);
  for (const icon of manifest.icons) {
    const info = await imageInfo(page, './' + icon.src);
    const [w, h] = icon.sizes.split('x').map(Number);
    expect([icon.src, info.status, info.width, info.height]).toEqual([icon.src, 200, w, h]);
    // "any" icons have transparent rounded corners; the maskable one fills the square.
    expect([icon.src, info.cornerAlpha]).toEqual([icon.src, icon.purpose === 'maskable' ? 255 : 0]);
  }
});
