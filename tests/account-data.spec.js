// Slice 4.5a (DECISIONS D124, D117 point 2): the "Account & data" page.
// Cloud Sync (Save / Load), Download backup / Restore backup and Reset Everything leave HOME for this page,
// unchanged. Desktop: an "Account & data" button in the sidebar account row (signed in or out). Phone: an
// "Account & data" group in More. Opening the page writes nothing. Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, accountPanel, unexpectedConsoleErrors, cloudWrites, localSaved, settle } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const DATA_ACTIONS = ['cloudsave', 'cloudload', 'downloadbackup', 'openrestore', 'reset'];
const labels = (loc) => loc.evaluateAll((els) => els.map((e) => e.textContent.replace(/[^A-Za-z& ]/g, '').trim()));

test('HOME no longer holds Cloud Sync, the backup buttons or Reset Everything', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  for (const a of DATA_ACTIONS) await expect(page.locator(`#panel-home [data-action="${a}"]`)).toHaveCount(0);
  await expect(page.locator('#panel-home').getByText('Cloud Sync')).toHaveCount(0);
});

test('the page holds every button: Save, Load, Download, Restore, Reset (groups since slice 4.8e, D149)', async ({ page }) => {
  const monitor = await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const account = await accountPanel(page);
  await expect(account.locator('.page-eyebrow')).toHaveText('Settings'); // slice 4.10i (D163 point 1)
  await expect(account.locator('.page-title')).toHaveText('Account & data');
  const cloud = account.locator('[data-group="cloud"]');
  await expect(cloud).toContainText('Your progress syncs automatically when logged in.');
  await expect(cloud.locator('[data-action="cloudsave"]')).toHaveText('Save');
  await expect(cloud.locator('[data-action="cloudload"]')).toHaveText('Load');
  await expect(account.locator('[data-group="backups"] [data-action="downloadbackup"]')).toHaveText('Download');
  await expect(account.locator('[data-group="backups"] [data-action="openrestore"]')).toHaveText('Restore'); // slice 4.10i: no final punctuation (D163 point 5)
  await expect(account.locator('[data-group="reset"] [data-action="reset"]')).toHaveText('Reset');
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('signed out, the page says progress is saved on this device only', async ({ page }) => {
  await openApp(page);
  const account = await accountPanel(page);
  await expect(account.locator('.account-card')).toContainText('Not signed in. Your progress is saved on this device only.');
});

test('signed in, the page names the account', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) } });
  const account = await accountPanel(page);
  // Slice 4.5b (D126): name, email and sync state. Slice 4.10i (D163 point 3): Logout moved into the profile panel.
  await expect(account.locator('.account-card .account-name')).toHaveText('tester');
  await expect(account.locator('.account-card .account-email')).toHaveText('tester@example.com');
  await expect(account.locator('.account-card .account-auth')).toHaveCount(0);
  await account.locator('.profile-card').click();
  await expect(page.locator('#profile-dialog .account-auth')).toHaveText('Logout');
});

test('opening the page writes nothing (device or cloud)', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1 }) } });
  await settle(page);
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  await accountPanel(page);
  await openView(page, 'home');
  await accountPanel(page);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});

test('Reset confirmation and the restore list open and close on the page', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const account = await accountPanel(page);
  await account.locator('[data-action="reset"]').click();
  await expect(account.locator('[data-action="confirmreset"]')).toHaveText('Yes, reset progress');
  await account.locator('[data-action="cancelreset"]').click();
  await account.locator('[data-action="openrestore"]').click();
  await expect(account.locator('[data-action="pickrestorefile"]')).toBeVisible();
  await account.locator('[data-action="cancelrestore"]').click();
  await expect(account.locator('[data-action="openrestore"]')).toBeVisible();
});

test('with the BHGS pack off, the page opens with every button and no errors', async ({ page }) => {
  const monitor = await openApp(page, { bhgsPack: false });
  const account = await accountPanel(page);
  for (const a of DATA_ACTIONS) await expect(account.locator(`[data-action="${a}"]`)).toBeVisible();
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('the sidebar account row opens the page; Login is on the page, not in the sidebar (D125, D126)', async ({ page }) => {
    await openApp(page);
    const row = page.locator('#sidebar-account [data-action="go"][data-view="account"]');
    await expect(row).toBeVisible();
    await expect(row.locator('.side-acct-name')).toHaveText('Not signed in');
    await expect(page.locator('#sidebar .account-auth, #sidebar .side-auth')).toHaveCount(0);
    // Not part of the menu (not one of the 7 destinations, D11).
    await expect(page.locator('#sidebar-nav-inner [data-view="account"]')).toHaveCount(0);
    await row.click();
    await expect(page.locator('#panel-account .account-auth')).toHaveText('Login');
  });

  test('clicking it opens the page; the button shows as active and no menu item is', async ({ page }) => {
    await openApp(page);
    await page.locator('#sidebar-account [data-view="account"]').click();
    await expect(page.locator('#panel-account')).toHaveClass(/active/);
    await expect(page.locator('#sidebar-account [data-view="account"]')).toHaveClass(/active/);
    await expect(page.locator('#sidebar-nav-inner .active')).toHaveCount(0);
    await page.locator('#sidebar-nav-inner [data-view="home"]').click();
    await expect(page.locator('#panel-home')).toHaveClass(/active/);
    await expect(page.locator('#sidebar-account [data-view="account"]')).not.toHaveClass(/active/);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  // Slice 4.5b2 (D128): MORE is a page; its last group is Account & data.
  test('More has an "Account & data" group that opens the page; More shows as active there', async ({ page }) => {
    await openApp(page);
    const more = page.locator('#botnav [data-action="more"]');
    await more.click();
    const groups = await labels(page.locator('#panel-more .more-group-title'));
    expect(groups[groups.length - 1]).toBe('Account & data');
    await page.locator('#panel-more [data-row="sync"]').click();
    await expect(page.locator('#panel-account')).toHaveClass(/active/);
    await expect(more).toHaveClass(/active/);
    // The bottom bar itself is unchanged.
    await expect(page.locator('#botnav [data-view="account"]')).toHaveCount(0);
  });

  test('with the BHGS pack off, More still holds Account & data', async ({ page }) => {
    await openApp(page, { bhgsPack: false });
    await page.locator('#botnav [data-action="more"]').click();
    await expect(page.locator('#panel-more [data-view="account"]').first()).toBeVisible();
  });

  test('Login is on the page and nowhere else on the phone (D125 point 4, D128)', async ({ page }) => {
    await openApp(page);
    const account = await accountPanel(page);
    await expect(account.locator('.account-auth')).toHaveText('Login');
    await expect(page.locator('#authBtn')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^(Login|Logout)$/ })).toHaveCount(1);
  });
});
