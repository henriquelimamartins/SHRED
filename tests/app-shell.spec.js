// Slice 4.5b (DECISIONS D125, D126, D127): the app shell as drawn on the 4.0 canvas, desktop and common parts.
// Page headers, full width, the sidebar menu (line icons, PILLARS / RESOURCES, real values; sub-items and the Today
// block removed in slice 4.10d), the account row (Google photo or initial, name, real sync state) and Login on Account & data.
// Firebase is stubbed; a Google photo is served by the test helper; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, cloudWrites, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const PHOTO = 'https://lh3.googleusercontent.com/a/test-photo=s96-c';
const PHOTO_USER = { ...TEST_USER, displayName: 'Test Person', photoURL: PHOTO };

async function setFlags(page, flags) {
  await page.addInitScript((f) => { window.__SHRED_TEST_FLAGS__ = Object.assign({}, f); }, flags);
}
const sideItem = (page, view) => page.locator(`#sidebar-nav-inner .side-item[data-view="${view}"]`);

const TITLES = { home: 'Home', daily: 'Daily Practice', technique: 'Technique', improv: 'Improvisation', dojo: 'Theory', library: 'Library', setup: 'Guitar Setup', account: 'Account & data' };

test('every page starts with the drawn page header (muted eyebrow + large title)', async ({ page }) => {
  const monitor = await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  for (const [view, title] of Object.entries(TITLES)) {
    await openView(page, view);
    const head = page.locator(`#panel-${view} .page-head`).first();
    // Slice 4.10h (D162 point 4): DAILY's title is "Daily Practice" or "Daily" by the room there is; screen readers
    // always hear "Daily Practice" (daily-companion.spec.js), and its eyebrow is today's date.
    if (view === 'daily') await expect(head.locator('.page-title')).toHaveAccessibleName(title);
    else await expect(head.locator('.page-title')).toHaveText(title); // the phone HOME header is hidden (no accessible name)
    await expect(head.locator('.page-eyebrow')).toHaveCSS('color', 'rgb(160, 160, 170)');
  }
  await openView(page, 'home');
  await expect(page.locator('#panel-home .page-eyebrow')).toHaveText('Tuesday · 10 Nov');
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('the Content Security Policy allows Google account photos for images only (D126 point 3)', async ({ page }) => {
  await openApp(page);
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  const dir = (name) => (csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' ')) || '');
  expect(dir('img-src')).toBe("img-src 'self' data: https://*.googleusercontent.com");
  for (const other of ['script-src', 'connect-src', 'frame-src', 'default-src']) expect(dir(other)).not.toContain('googleusercontent');
});

test('opening pages and the account page writes nothing', async ({ page }) => {
  await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) }, avatar: true });
  await settle(page);
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  for (const v of ['daily', 'technique', 'improv', 'account', 'home']) await openView(page, v);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('content uses the full width (no centred 800 px column)', async ({ page }) => {
    await openApp(page);
    const w = await page.locator('#panel-home .panel-content').evaluate((e) => e.getBoundingClientRect().width);
    expect(w).toBeGreaterThan(1000); // 1440 viewport − 260 sidebar − 64 padding
  });

  test('menu: line icons, PILLARS and RESOURCES headings, real values on the right', async ({ page }) => {
    await openApp(page, { localState: progressState({ phaseIndex: 2, improvIndex: 1 }) });
    const nav = page.locator('#sidebar-nav-inner');
    await expect(nav.locator('.side-group')).toHaveText(['Pillars', 'Resources']);
    const order = await nav.locator('.side-group, .side-item').evaluateAll((els) => els.map((e) => e.classList.contains('side-group') ? '#' + e.textContent : e.dataset.view));
    expect(order).toEqual(['home', 'daily', '#Pillars', 'technique', 'improv', 'dojo', '#Resources', 'library', 'setup']);
    await expect(nav.locator('.side-item svg.ico')).toHaveCount(7);
    expect(await nav.locator('.side-item').evaluateAll((els) => els.some((e) => /\p{Extended_Pictographic}/u.test(e.textContent)))).toBe(false);
    await expect(sideItem(page, 'daily').locator('.side-val')).toHaveText('60m'); // Tuesday: 5 + 35 + 15 + 5
    await expect(sideItem(page, 'technique').locator('.side-val')).toHaveText('P2');
    await expect(sideItem(page, 'improv').locator('.side-val')).toHaveText('G2');
    await expect(sideItem(page, 'dojo').locator('.side-val')).toHaveText('L1');
    await expect(sideItem(page, 'home').locator('.side-val')).toHaveCount(0);
  });

  test('without the BHGS pack PILLARS starts at Improvisation', async ({ page }) => {
    await openApp(page, { bhgsPack: false });
    const order = await page.locator('#sidebar-nav-inner .side-group, #sidebar-nav-inner .side-item').evaluateAll((els) => els.map((e) => e.classList.contains('side-group') ? '#' + e.textContent : e.dataset.view));
    expect(order).toEqual(['home', 'daily', '#Pillars', 'improv', 'dojo', '#Resources', 'library', 'setup']);
  });

  // Slice 4.10d (D152 point 4, point 8): the sub-items and the Today block left the sidebar; the DAILY value stays.
  for (const c of [
    { name: 'Saturday', now: '2026-11-14T12:00:00Z', phase: 1, mins: '60m' },
    { name: 'Monday', now: '2026-11-09T12:00:00Z', phase: 1, mins: '60m' },
    { name: 'the Setup phase', now: '2026-11-10T12:00:00Z', phase: 0, mins: null },
  ]) {
    test(`DAILY menu value on ${c.name}`, async ({ page }) => {
      await openApp(page, { now: c.now, localState: progressState({ phaseIndex: c.phase }) });
      if (c.mins) await expect(sideItem(page, 'daily').locator('.side-val')).toHaveText(c.mins);
      else await expect(sideItem(page, 'daily').locator('.side-val')).toHaveCount(0);
    });
  }

  test('account row signed out: person icon, "Not signed in", saved on this device only; opens Account & data', async ({ page }) => {
    await openApp(page);
    const row = page.locator('#sidebar-account .side-acct');
    await expect(row.locator('.avatar-none svg')).toHaveCount(1);
    await expect(row.locator('.side-acct-name')).toHaveText('Not signed in');
    await expect(row.locator('.side-acct-status')).toHaveText('Saved on this device only');
    await row.click();
    await expect(page.locator('#panel-account')).toHaveClass(/active/);
    await expect(row).toHaveClass(/active/);
  });

  test('signed in with a Google photo: the photo shows in the row and on the page; first name in the row', async ({ page }) => {
    const monitor = await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState() }, avatar: true });
    const img = page.locator('#sidebar-account img.avatar-img');
    await expect(img).toHaveAttribute('src', PHOTO);
    await expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('#sidebar-account .side-acct-name')).toHaveText('Test');
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Synced');
    await expect(page.locator('#sidebar-account .sync-dot')).toHaveClass(/ok/);
    await openView(page, 'account');
    await expect.poll(() => page.locator('#panel-account img.avatar-img').evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('#panel-account .account-name')).toHaveText('Test Person');
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('a photo that cannot load is replaced by the initial', async ({ page }) => {
    await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState() } }); // photo request blocked
    await expect(page.locator('#sidebar-account .avatar')).toHaveText('T');
    await expect(page.locator('#sidebar-account img')).toHaveCount(0);
    await openView(page, 'account');
    await expect(page.locator('#panel-account .avatar')).toHaveText('T');
  });

  test('no photo: the initial of the account name', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(page.locator('#sidebar-account .avatar')).toHaveText('T');
    await expect(page.locator('#sidebar-account .side-acct-name')).toHaveText('tester');
  });

  test('sync state: loading until the first cloud read', async ({ page }) => {
    await setFlags(page, { holdGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Loading cloud progress…');
    await page.evaluate(() => window.__SHRED_TEST_RELEASE_GETDOC__());
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Synced', { timeout: 6000 });
  });

  test('sync state: cloud unreachable when the first read failed', async ({ page }) => {
    await setFlags(page, { failGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Cloud unreachable · saved on this device');
    await expect(page.locator('#sidebar-account .sync-dot')).toHaveClass(/wait/);
  });

  test('sync state: a change that could not reach the cloud shows as not synced', async ({ page }) => {
    await setFlags(page, { failTransaction: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await openView(page, 'daily');
    await page.locator('#panel-daily [data-action="blockprac"][data-block="warmup"]').click();
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Changes not synced yet', { timeout: 6000 });
  });

  test('sync state: offline', async ({ page, context }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Synced');
    await context.setOffline(true);
    await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Offline · saved on this device');
    await context.setOffline(false);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('HOME keeps the Progress card with the rails (no sidebar on the phone, D127)', async ({ page }) => {
    await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
    await expect(page.locator('#panel-home .home-progress')).toBeVisible();
    await expect(page.locator('#panel-home .home-progress [data-rail]')).toHaveCount(3);
    await expect(page.locator('#sidebar')).toBeHidden();
  });

  test('Account & data shows the photo, name and Login / Logout', async ({ page }) => {
    await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState() }, avatar: true });
    await openView(page, 'account');
    await expect.poll(() => page.locator('#panel-account img.avatar-img').evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    // Slice 4.10i (D163 point 3): Logout lives in the profile panel, opened from the PROFILE card.
    await page.locator('#panel-account .profile-card').click();
    await expect(page.locator('#profile-dialog .account-auth')).toHaveText('Logout');
  });
});
