// Slice 4.10i (DECISIONS D163; D152 points 15, 18, 23): Account & data header and PROFILE group, the profile panel
// opened from the PROFILE card (desktop dialog, phone sheet from the bottom), and buttons without final punctuation.
// Real values only (D71, from `streakDates` and the pillar data); opening the page or the panel writes nothing.
// Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, accountPanel, localSaved, cloudWrites, settle, unexpectedConsoleErrors} = require('./support/app');
const { baseState, TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const PHOTO_USER = { uid: 'test-uid', email: 'tester@example.com', displayName: 'Test Person', photoURL: 'https://lh3.googleusercontent.com/a/test-photo' };
// Clock: Tuesday 2026-11-10. Runs: Sep 14–21 (8 days), Oct 2 (1), Nov 7–10 (4, current). A duplicate and a bad entry
// are ignored by the longest-run count; "Days logged" stays the HOME count.
const STREAK = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21',
  '2026-10-02', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'];
const box = async (loc) => { const b = await loc.boundingBox(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
const dialog = (page) => page.locator('#profile-dialog');
const card = (page) => page.locator('#panel-account .profile-card');

async function openSignedIn(page, overrides = {}, opts = {}) {
  const monitor = await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1, streakDates: STREAK, ...overrides }) }, avatar: true, ...opts });
  await accountPanel(page);
  return monitor;
}

test('header: eyebrow SETTINGS, title Account & data; first group PROFILE; the two columns start level (desktop)', async ({ page, isMobile }) => {
  await openSignedIn(page);
  const account = page.locator('#panel-account');
  await expect(account.locator('.page-title')).toHaveText(/account & data/i);
  await expect(account.locator('.page-eyebrow')).toHaveText('Settings');
  await expect(account.locator('.acct-group-title')).toHaveText(['Profile', 'Cloud sync', 'Backups', 'Settings', 'Reset']);
  if (isMobile) {
    await expect(account.locator('.page-eyebrow')).toBeHidden(); // "‹ More" takes its place on the phone
  } else {
    const left = await box(account.locator('[data-group="profile"] .acct-group-title'));
    const right = await box(account.locator('[data-group="settings"] .acct-group-title'));
    expect(Math.abs(left.y - right.y)).toBeLessThanOrEqual(1);
  }
});

test('signed in: the PROFILE card is one button with the ringed photo, name, email and sync state; no Logout on it', async ({ page, isMobile }) => {
  const monitor = await openSignedIn(page);
  const c = card(page);
  await expect(c).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(c).toHaveAttribute('aria-expanded', 'false');
  await expect(c.locator('.account-name')).toHaveText('Test Person');
  await expect(c.locator('.account-email')).toHaveText('tester@example.com');
  await expect(c.locator('.account-sync')).toHaveText('Synced');
  await expect(c.locator('.avatar-ring.ring-lg')).toHaveAttribute('data-tone', 'ok');
  await expect(c.locator('.avatar-ring')).toHaveCSS('border-top-color', 'rgb(70, 167, 88)');
  await expect(c.locator('img.avatar-img')).toHaveCount(1);
  await expect(c).toContainText('View profile');
  if (isMobile) await expect(c.locator('.profile-card-more-text')).toHaveCSS('position', 'absolute');
  else await expect(c.locator('.profile-card-more-text')).toBeVisible();
  await expect(page.locator('#panel-account .account-auth')).toHaveCount(0);
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.locator('#profile-layer')).toBeHidden();
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('signed out: the card keeps Login and opens no panel; without an account there is no profile button', async ({ page }) => {
  await openApp(page, { localState: baseState({ streakDates: STREAK }) });
  const account = await accountPanel(page);
  await expect(account.locator('.profile-card')).toHaveCount(0);
  await expect(account.locator('[data-group="profile"] .account-name')).toHaveText('Not signed in');
  await expect(account.locator('[data-group="profile"] .account-auth')).toHaveText('Login');
  await expect(account.locator('[data-action="profile"]')).toHaveCount(0);
});

test('the panel opens from the card: photo in the ring, name, email, Google, sync, the four boxes and the rails', async ({ page, isMobile }) => {
  const monitor = await openSignedIn(page);
  await card(page).click();
  const d = dialog(page);
  await expect(d).toBeVisible();
  await expect(d).toHaveAttribute('role', 'dialog');
  await expect(d).toHaveAttribute('aria-modal', 'true');
  await expect(d.locator('.profile-title')).toHaveText(/profile/i);
  await expect(card(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(d.locator('.avatar-ring.ring-xl')).toHaveAttribute('data-tone', 'ok');
  await expect(d.locator('.avatar-xl img.avatar-img')).toHaveCount(1);
  await expect(d.locator('.profile-name')).toHaveText('Test Person');
  await expect(d.locator('.profile-email')).toHaveText('tester@example.com');
  await expect(d.locator('.profile-google')).toHaveText('Signed in with Google');
  await expect(d.locator('.profile-sync')).toHaveText('Synced');
  // Four boxes, centred, from streakDates.
  await expect(d.locator('.profile-stat-label')).toHaveText(['Practising since', 'Days logged', 'Current streak', 'Longest streak']);
  await expect(d.locator('.profile-stat-val')).toHaveText(['Sep 2026', '13', '4 days', '8 days']);
  await expect(d.locator('.profile-stat').first().locator('.profile-stat-sub')).toHaveText('first logged day');
  for (const s of await d.locator('.profile-stat').all()) await expect(s).toHaveCSS('text-align', 'center');
  // Rails: values, no percentage.
  await expect(d.locator('.profile-subhead')).toHaveText(/pillars/i);
  await expect(d.locator('.rail')).toHaveCount(3);
  // Technique: the same count as the TECHNIQUE progress card (phaseSummary, D20).
  await expect(d.locator('.rail[data-rail="technique"] .rail-status')).toHaveText('3 of 24 done');
  await expect(d.locator('.rail[data-rail="improv"] .rail-status')).toHaveText('0 of 5 mastered');
  await expect(d.locator('.rail[data-rail="theory"] .rail-status')).toHaveText('Not started');
  expect(await d.locator('.rail-status').allInnerTexts()).not.toContain(expect.stringMatching(/%/));
  await expect(d.locator('.profile-logout')).toHaveText('Logout');
  // Desktop: a dialog near the top; phone: a sheet at the bottom, full width.
  const vp = page.viewportSize(), b = await box(d);
  if (isMobile) {
    expect(b.w).toBeGreaterThanOrEqual(vp.width - 2);
    expect(Math.abs(b.y + b.h - vp.height)).toBeLessThanOrEqual(2);
  } else {
    expect(b.w).toBeLessThanOrEqual(470);
    expect(Math.abs(b.x + b.w / 2 - vp.width / 2)).toBeLessThanOrEqual(2);
    expect(b.y).toBeLessThan(80);
  }
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('panel values follow the data: progress in a phase, Gate counts, all Gates done, nothing logged', async ({ page }) => {
  await openSignedIn(page, { checks: { 'p1.c.0': '2026-11-01', 'p1.c.1': '2026-11-01', 'p1.e.0': '2026-11-02' }, improvIndex: 0, improvChecks: { g0e0: true } });
  await card(page).click();
  let d = dialog(page);
  await expect(d.locator('.rail[data-rail="technique"] .rail-status')).toHaveText('6 of 24 done'); // 3 more than above
  await expect(d.locator('.rail[data-rail="improv"] .rail-status')).toHaveText(/^1 of \d+ mastered$/);
  await page.keyboard.press('Escape');
  await openView(page, 'technique');
  await expect(page.locator('#panel-technique .pillar-card-line')).toHaveText('6 of 24 done in this phase');
  // The HOME line has the same values.
  await openView(page, 'home');
  const run = await page.locator('#panel-home .streak-run').first().innerText();
  const logged = await page.locator('#panel-home .streak-logged').first().innerText();
  expect([run, logged]).toEqual(['4', '13']);
});

test('panel with nothing logged and every Gate done', async ({ page }) => {
  await openSignedIn(page, { streakDates: [], improvIndex: 5 });
  await card(page).click();
  const d = dialog(page);
  await expect(d.locator('.profile-stat-val')).toHaveText(['Not yet', '0', '0 days', '0 days']);
  await expect(d.locator('.profile-stat-sub')).toHaveCount(0);
  await expect(d.locator('.rail[data-rail="improv"] .rail-status')).toHaveText('Complete');
});

test('longest streak counts consecutive local days only (duplicates and bad entries ignored)', async ({ page }) => {
  await openSignedIn(page, { streakDates: ['2026-10-30', '2026-10-31', '2026-10-31', '2026-11-01', 'junk', '2026-11-03'] });
  await card(page).click();
  await expect(dialog(page).locator('.profile-stat-val').nth(3)).toHaveText('3 days');
  await expect(dialog(page).locator('.profile-stat-val').nth(0)).toHaveText('Oct 2026');
});

test('closes with the close button, Escape and the backdrop; focus goes in and back to the card; the rest is inert', async ({ page }) => {
  await openSignedIn(page);
  await card(page).click();
  await expect(page.locator('#profile-dialog .profile-close')).toBeFocused();
  await expect(page.locator('#sidebar')).toHaveAttribute('inert', '');
  await expect(page.locator('.main-area')).toHaveAttribute('inert', '');
  // Tab stays inside: close → Logout → close.
  await page.keyboard.press('Tab');
  await expect(page.locator('#profile-dialog .profile-logout')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#profile-dialog .profile-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#profile-dialog .profile-logout')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  await expect(card(page)).toBeFocused();
  await expect(page.locator('.main-area')).not.toHaveAttribute('inert', '');
  // Close button.
  await card(page).click();
  await page.locator('#profile-dialog .profile-close').click();
  await expect(dialog(page)).toHaveCount(0);
  await expect(card(page)).toBeFocused();
  // Backdrop (a corner away from the dialog).
  await card(page).click();
  await page.locator('#profile-layer .profile-backdrop').click({ position: { x: 5, y: 5 } });
  await expect(dialog(page)).toHaveCount(0);
});

test('the panel stays open through a re-render and its sync line follows the state', async ({ page, context }) => {
  await openSignedIn(page);
  await card(page).click();
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(dialog(page).locator('.profile-sync')).toHaveText('Offline · saved on this device');
  await expect(dialog(page).locator('.avatar-ring')).toHaveAttribute('data-tone', 'wait');
  await expect(card(page).locator('.avatar-ring')).toHaveAttribute('data-tone', 'wait');
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(dialog(page).locator('.profile-sync')).toHaveText('Synced');
});

test('Logout in the panel runs the same sign-out as before and closes the panel', async ({ page }) => {
  await openSignedIn(page);
  await card(page).click();
  await page.locator('#profile-dialog .profile-logout').click();
  await expect(dialog(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__SHRED_TEST__.calls.filter((c) => c === 'signOut').length)).toBe(1);
  await expect(page.locator('#toast')).toHaveText('Logged out');
  await expect(page.locator('.main-area')).not.toHaveAttribute('inert', '');
});

test('the sidebar account row and the MORE photo still open the Account & data page, not the panel', async ({ page, isMobile }) => {
  await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState() }, avatar: true });
  if (isMobile) {
    await page.locator('#botnav [data-action="more"]').click();
    await page.locator('#panel-more .more-acct').click();
  } else {
    await page.locator('#sidebar-account [data-view="account"]').click();
  }
  await expect(page.locator('#panel-account')).toHaveClass(/active/);
  await expect(dialog(page)).toHaveCount(0);
});

test('buttons end without punctuation: Restore, Reset, From file, Change phase', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
  const account = await accountPanel(page);
  await expect(account.locator('[data-action="openrestore"]')).toHaveText('Restore');
  await expect(account.locator('[data-action="reset"]')).toHaveText('Reset');
  await account.locator('[data-action="openrestore"]').click();
  await expect(account.locator('[data-action="pickrestorefile"]')).toHaveText('From file');
  await account.locator('[data-action="cancelrestore"]').click();
  // No button in the app ends with an ellipsis, an arrow or a full stop (D152 point 23).
  for (const view of ['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup', 'account']) {
    await openView(page, view);
    const texts = await page.locator(`#panel-${view} button:visible`).allInnerTexts();
    // Single-line labels only (row buttons with a description sentence are not labels).
    for (const t of texts.map((x) => x.trim()).filter((x) => x && !x.includes('\n'))) expect(t, `${view}: "${t}"`).not.toMatch(/(…|\.\.\.|→|\.)$/);
  }
});

test('opening the page and the panel writes nothing', async ({ page }) => {
  await openSignedIn(page);
  await settle(page);
  const before = await localSaved(page), writes = (await cloudWrites(page)).length;
  await card(page).click();
  await page.keyboard.press('Escape');
  await card(page).click();
  await page.locator('#profile-dialog .profile-close').click();
  await settle(page);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});
