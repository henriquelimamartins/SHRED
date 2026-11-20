// Slice 4.8e (DECISIONS D149, D132 point 7): the Account & data page as drawn on the 4.6 boards.
// Groups ACCOUNT, CLOUD SYNC, BACKUPS, SETTINGS, RESET (two columns on desktop, stacked on the phone); each action
// is a row with a line icon, name, description and button; Restore and Reset open in place; Settings holds Sound
// (the switch that was on THEORY, same stored field `dojo.audioMuted`). The actions themselves are covered by
// account-data, restore, reset and persistence specs. Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, accountPanel, localSaved, cloudWrites, settle, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const box = async (loc) => { const b = await loc.boundingBox(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}]/u;
const toast = (page) => page.locator('#toast');
const SNAPSHOT = { at: '2026-11-09T10:05:00.000Z', reason: 'daily', schemaVersion: 1, state: { phaseIndex: 1 } };

test('groups in the drawn order; desktop two columns, phone stacked with "‹ More"', async ({ page, isMobile }) => {
  const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) } });
  const account = await accountPanel(page);
  await expect(account.locator('.acct-group-title')).toHaveText(['Account', 'Cloud sync', 'Backups', 'Settings', 'Reset']);
  const g = {};
  for (const id of ['account', 'cloud', 'backups', 'settings', 'reset']) g[id] = await box(account.locator(`[data-group="${id}"]`));
  expect(g.account.y).toBeLessThan(g.cloud.y);
  expect(g.cloud.y).toBeLessThan(g.backups.y);
  expect(g.settings.y).toBeLessThan(g.reset.y);
  if (isMobile) {
    expect(g.backups.y).toBeLessThan(g.settings.y);
    for (const id of Object.keys(g)) expect(Math.abs(g[id].x - g.account.x)).toBeLessThanOrEqual(2);
    await expect(account.locator('.page-back')).toBeVisible();
    await expect(account.locator('.page-back')).toHaveText('More');
  } else {
    expect(g.settings.x).toBeGreaterThan(g.account.x + g.account.w);
    expect(Math.abs(g.settings.y - g.account.y)).toBeLessThanOrEqual(4);
    await expect(account.locator('.page-back')).toBeHidden();
  }
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('rows as drawn: name, description and button; Reset in the dashed box; no emoji', async ({ page }) => {
  await openApp(page);
  const account = await accountPanel(page);
  const rows = {
    save: ['Save to cloud', 'Your progress syncs automatically when logged in. Push a save by hand.', 'cloudsave', 'Save'],
    load: ['Load from cloud', 'Pull your latest cloud progress. A backup is saved on this device first.', 'cloudload', 'Load'],
    download: ['Download backup', 'Save a copy of your progress as a file.', 'downloadbackup', 'Download'],
    restore: ['Restore backup', 'From a copy on this device or from a file.', 'openrestore', 'Restore…'],
    reset: ['Reset progress', 'Erases Technique, Improv, Theory and Creative progress. Your streak, calendar and SETUP are kept. A backup is saved on this device first.', 'reset', 'Reset…'],
  };
  for (const [id, [name, sub, action, label]] of Object.entries(rows)) {
    const row = account.locator(`[data-row="${id}"]`);
    await expect(row.locator('.acct-row-name')).toHaveText(name);
    await expect(row.locator('.acct-row-sub')).toHaveText(sub);
    await expect(row.locator(`[data-action="${action}"]`)).toHaveText(label);
    await expect(row.locator('svg.acct-row-ic')).toHaveCount(1);
  }
  await expect(account.locator('[data-group="reset"] .acct-danger')).toHaveCSS('border-top-style', 'dashed');
  await expect(account.locator('[data-row="reset"] .acct-row-name')).toHaveCSS('color', 'rgb(255, 92, 97)');
  await expect(account).not.toContainText('Reset Everything');
  expect(EMOJI.test(await account.innerText())).toBe(false);
});

test('signed out (B1): Cloud sync stays and its buttons ask for login, nothing written', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const before = await localSaved(page);
  const account = await accountPanel(page);
  await expect(account.locator('[data-group="cloud"]')).toBeVisible();
  await account.locator('[data-action="cloudsave"]').click();
  await expect(toast(page)).toHaveText('Please login first to save to cloud.');
  await account.locator('[data-action="cloudload"]').click();
  await expect(toast(page)).toHaveText('Please login first to load from cloud.');
  expect(await localSaved(page)).toEqual(before);
});

test('Settings: Sound only, on by default; the switch stores dojo.audioMuted, keeps focus and survives a reload', async ({ page }) => {
  await openApp(page);
  const account = await accountPanel(page);
  await expect(account.locator('[data-group="settings"] .acct-row')).toHaveCount(1);
  const row = account.locator('[data-row="sound"]');
  await expect(row.locator('.acct-row-name')).toHaveText('Sound');
  await expect(row.locator('.acct-row-sub')).toHaveText('Exercises that need sound are marked. When it is off, the app asks before one starts.');
  const sw = row.locator('[data-action="togglemute"]');
  await expect(sw).toHaveAttribute('role', 'switch');
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await expect(sw).toHaveAttribute('aria-labelledby', 'acct-n-sound');
  await expect(sw).toHaveAttribute('aria-describedby', 'acct-s-sound');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  expect(await page.evaluate(() => document.activeElement.classList.contains('acct-switch'))).toBe(true);
  expect((await localSaved(page)).dojo.audioMuted).toBe(true);
  // Anything that needs sound stays visible with sound off (D149 point 5).
  await openView(page, 'dojo');
  await expect(page.locator('#panel-dojo [data-game="rhythm"] .theory-tag', { hasText: 'Needs sound' })).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 5000 });
  await expect((await accountPanel(page)).locator('[data-action="togglemute"]')).toHaveAttribute('aria-checked', 'false');
});

test('signed in: the Sound switch is sent to the cloud like any change (same field as before)', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) } });
  await settle(page);
  const start = (await cloudWrites(page)).length;
  await (await accountPanel(page)).locator('[data-action="togglemute"]').click();
  await expect.poll(async () => (await cloudWrites(page)).length).toBeGreaterThan(start);
  const last = (await cloudWrites(page)).slice(-1)[0];
  expect(JSON.stringify(last)).toContain('"audioMuted":true');
});

test('Restore opens in place under its row; Reset confirms inside its box; one closes the other', async ({ page }) => {
  await openApp(page, { localState: baseState() });
  await page.evaluate((s) => localStorage.setItem('shredRoadmapBackups_v1', JSON.stringify([s])), SNAPSHOT);
  const account = await accountPanel(page);
  await account.locator('[data-action="openrestore"]').click();
  await expect(account.locator('[data-action="openrestore"]')).toHaveAttribute('aria-expanded', 'true');
  const panel = account.locator('[data-row="restore"] + #acct-panel-restore');
  await expect(panel.locator('.acct-panel-text').first()).toHaveText('Choose a copy saved on this device (newest first), or a backup file you downloaded.');
  await expect(panel.locator('[data-action="pickrestore"]')).toHaveCount(1);
  await expect(panel.locator('[data-action="pickrestorefile"]')).toHaveText('From file…');
  await expect(panel.locator('[data-action="pickrestorefile"] svg')).toHaveCount(1);
  await panel.locator('[data-action="pickrestore"]').click();
  await expect(panel.locator('[data-action="confirmrestore"]')).toHaveText('Yes, restore');
  // Reset closes the restore panel and opens its confirmation inside the dashed box.
  await account.locator('[data-action="reset"]').click();
  await expect(account.locator('#acct-panel-restore')).toHaveCount(0);
  await expect(account.locator('[data-action="reset"]')).toHaveAttribute('aria-expanded', 'true');
  const confirm = account.locator('[data-group="reset"] [data-action="confirmreset"]');
  await expect(confirm).toHaveText('Yes, reset progress');
  await expect(account.locator('[data-group="reset"]')).toContainText('Reset all progress? This erases Technique, Improv, Theory and Creative progress.');
  // Restore closes the reset confirmation.
  await account.locator('[data-action="openrestore"]').click();
  await expect(account.locator('[data-action="confirmreset"]')).toHaveCount(0);
  await account.locator('[data-action="cancelrestore"]').click();
  await expect(account.locator('[data-action="openrestore"]')).toHaveAttribute('aria-expanded', 'false');
  expect(await localSaved(page)).toEqual(baseState());
});

test('while a confirmation waits, Save, Load and Download are disabled; Restore… / Reset… pressed again close their panel; focus follows', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) } });
  await page.evaluate((s) => localStorage.setItem('shredRoadmapBackups_v1', JSON.stringify([s])), SNAPSHOT);
  const account = await accountPanel(page);
  const others = account.locator('[data-action="cloudsave"], [data-action="cloudload"], [data-action="downloadbackup"]');
  const focusedAction = () => page.evaluate(() => document.activeElement.getAttribute('data-action'));
  // The list alone is not a confirmation: the other rows stay usable.
  await account.locator('[data-action="openrestore"]').click();
  for (const b of await others.all()) await expect(b).toBeEnabled();
  expect(await focusedAction()).toBe('pickrestore');
  await account.locator('[data-action="pickrestore"]').click();
  expect(await focusedAction()).toBe('cancelrestore');
  for (const b of await others.all()) await expect(b).toBeDisabled();
  await expect(account.locator('[data-action="confirmrestore"], [data-action="confirmreset"]')).toHaveCount(1);
  // Restore… again closes the panel and gives the focus back to it.
  await account.locator('[data-action="openrestore"]').click();
  await expect(account.locator('#acct-panel-restore')).toHaveCount(0);
  expect(await focusedAction()).toBe('openrestore');
  for (const b of await others.all()) await expect(b).toBeEnabled();
  // Reset… opens its confirmation (focus on Cancel, the description is not repeated) and closes it when pressed again.
  await account.locator('[data-action="reset"]').click();
  expect(await focusedAction()).toBe('cancelreset');
  await expect(account.locator('[data-row="reset"] .acct-row-sub')).toBeHidden();
  for (const b of await others.all()) await expect(b).toBeDisabled();
  await account.locator('[data-action="reset"]').click();
  await expect(account.locator('[data-action="confirmreset"]')).toHaveCount(0);
  expect(await focusedAction()).toBe('reset');
  await expect(account.locator('[data-row="reset"] .acct-row-sub')).toBeVisible();
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'MORE is a phone page');

  test('MORE Restore / Reset rows open the panel and bring it into view', async ({ page }) => {
    await openApp(page, { localState: baseState() });
    for (const [row, action] of [['restore', 'cancelrestore'], ['reset', 'cancelreset']]) {
      await page.locator('#botnav [data-action="more"]').click();
      await page.locator(`#panel-more [data-row="${row}"]`).click();
      const target = page.locator(`#panel-account #acct-panel-${row}`);
      await expect(target).toBeVisible();
      await expect(target).toBeInViewport();
      await page.locator(`#panel-account [data-action="${action}"]`).click();
    }
    expect(await localSaved(page)).toEqual(baseState());
  });
});

test('touch targets at least 44 px; no inline style; no sideways overflow', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) } });
  await page.evaluate((s) => localStorage.setItem('shredRoadmapBackups_v1', JSON.stringify([s])), SNAPSHOT);
  const account = await accountPanel(page);
  const h = async (loc) => Math.round((await loc.boundingBox()).height);
  for (const b of await account.locator('.acct-btn, .acct-switch').all()) expect(await h(b)).toBeGreaterThanOrEqual(44);
  await account.locator('[data-action="openrestore"]').click();
  for (const b of await account.locator('.acct-copy, #acct-panel-restore .acct-btn').all()) expect(await h(b)).toBeGreaterThanOrEqual(44);
  expect(await account.locator('[style]').count()).toBe(0);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
});
