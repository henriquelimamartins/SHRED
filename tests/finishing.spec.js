// Slice 4.10n (finishing touches, AUDIT-4.10 slice 11): Guitar Setup measurement tiles centred (point 27; desktop and
// phone); desktop notifications at the bottom right (point 30; checked in notifications.spec.js); the HOME circle of
// fifths keeps its place when another key is chosen (owner, 2026-11-24, as DAILY). CSS only; nothing is
// written. Firebase is stubbed; the clock is fixed.
const { test, expect } = require('@playwright/test');
const { openApp, openView, localSaved } = require('./support/app');
const { baseState } = require('./support/fixtures');

test('Guitar Setup: label, value and sub-line centred in every measurement tile', async ({ page }) => {
  await openApp(page, { localState: baseState() });
  await openView(page, 'setup');
  const off = await page.locator('#panel-setup .setup-tile').evaluateAll((tiles) => tiles.flatMap((t) => {
    const r = t.getBoundingClientRect(), mid = r.left + r.width / 2;
    return [...t.children].map((c) => {
      const range = document.createRange(); range.selectNodeContents(c);
      const b = range.getBoundingClientRect();
      return Math.abs(b.left + b.width / 2 - mid);
    });
  }));
  expect(off.length).toBeGreaterThan(0);
  expect(Math.max(...off)).toBeLessThan(2);
});

test('showing Guitar Setup writes nothing', async ({ page }) => {
  await openApp(page, { localState: baseState() });
  const before = await localSaved(page);
  await openView(page, 'setup');
  expect(await localSaved(page)).toEqual(before);
});

test('HOME key: the circle does not move when another key is chosen and when going back to today', async ({ page }) => {
  await openApp(page, { localState: baseState() });
  const card = page.locator('#panel-home .home-key');
  const top = async () => (await card.locator('.kc-home').boundingBox()).y - (await card.boundingBox()).y;
  const before = await top();
  await card.locator('.kc-key[data-mode="min"][data-i="1"]').click(); // E minor
  await expect(card.locator('.hk-today')).toBeVisible();
  expect(Math.abs((await top()) - before)).toBeLessThan(1);
  await card.locator('.hk-today').click();
  await expect(card.locator('.hk-today')).toHaveCount(0);
  expect(Math.abs((await top()) - before)).toBeLessThan(1);
});
