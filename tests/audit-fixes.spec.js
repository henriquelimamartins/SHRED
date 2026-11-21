// Slice 4.10a (mockup audit, D151): two bugs found before the audit.
// (1) The sync line of the Account card on the Account & data page was drawn once and never refreshed, so it could
//     stay on an old state while the sidebar row already showed the new one. It now follows the same 3 s / online /
//     offline refresh as the sidebar row and the MORE Cloud sync row. Reads only, writes nothing.
// (2) DAILY's "Retake Phase Test" opened HOME, but the Phase Transition Test lives on the TECHNIQUE page since 4.3
//     (D122). It now opens TECHNIQUE at the Phase test (the Phase test tab on the phone); the Phase 0 note names the
//     TECHNIQUE page. Without the BHGS pack there is no TECHNIQUE page, so neither is shown.
// Firebase is stubbed; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, cloudWrites, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

test('the Account card sync line follows the sync state without a redraw', async ({ page, context }) => {
  const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
  await openView(page, 'account');
  const line = page.locator('#panel-account .account-sync');
  await expect(line).toHaveText('Synced');
  const writesBefore = (await cloudWrites(page)).length;
  await context.setOffline(true);
  await expect(line).toHaveText('Offline · saved on this device');
  await expect(line.locator('.sync-dot')).toHaveClass(/wait/);
  await context.setOffline(false);
  await expect(line).toHaveText('Synced', { timeout: 6000 });
  await expect(line.locator('.sync-dot')).toHaveClass(/ok/);
  expect((await cloudWrites(page)).length).toBe(writesBefore);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('the Account card sync line and the sidebar / MORE line always agree', async ({ page, context, isMobile }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
  await openView(page, 'account');
  await context.setOffline(true);
  await expect(page.locator('#panel-account .account-sync')).toHaveText('Offline · saved on this device');
  if (!isMobile) await expect(page.locator('#sidebar-account .side-acct-status')).toHaveText('Offline · saved on this device');
  await context.setOffline(false);
});

test('DAILY "Open Phase test" opens the Phase test on the TECHNIQUE page and writes nothing', async ({ page, isMobile }) => {
  const monitor = await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="setday"][data-day="Fri"]').click();
  const btn = page.locator('#panel-daily [data-action="phasetest"]');
  await expect(btn).toHaveText('Open Phase test'); // slice 4.10c (D152 points 22, 23): new line, no final arrow
  const before = await localSaved(page);
  await btn.click();
  await expect(page.locator('#panel-technique')).toHaveClass(/active/);
  await expect(page.locator('#panel-home')).not.toHaveClass(/active/);
  const sec = page.locator('#panel-technique .tech-sec-test');
  await expect(sec).toBeVisible();
  if (isMobile) {
    await expect(page.locator('#panel-technique .tech-tabs [aria-selected="true"]')).toHaveText('Phase test');
  } else {
    await expect(sec).toBeInViewport();
  }
  await settle(page);
  expect(await localSaved(page)).toEqual(before);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('the TECHNIQUE bar button still opens the page on its Checklist after a Phase test link (phone)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone tabs');
  await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="setday"][data-day="Fri"]').click();
  await page.locator('#panel-daily [data-action="phasetest"]').click();
  await page.locator('#panel-technique .tech-tabs [data-tab="checklist"]').click();
  await expect(page.locator('#panel-technique .tech-tabs [aria-selected="true"]')).toHaveText('Checklist');
});

test('Phase 0: the DAILY note points to the TECHNIQUE page, not HOME', async ({ page }) => {
  await openApp(page, { localState: progressState({ phaseIndex: 0 }) });
  await openView(page, 'daily');
  const note = page.locator('#panel-daily .note', { hasText: 'Phase Transition Test' });
  await expect(note).toContainText('on the TECHNIQUE page');
  await expect(note).not.toContainText('on Home');
});

test('without the BHGS pack: no Phase test button and no Phase 0 note (there is no TECHNIQUE page)', async ({ page }) => {
  await openApp(page, { bhgsPack: false, localState: progressState({ phaseIndex: 1 }) });
  await openView(page, 'daily');
  await page.locator('#panel-daily [data-action="setday"][data-day="Fri"]').click();
  await expect(page.locator('#panel-daily [data-action="phasetest"]')).toHaveCount(0);
  await expect(page.locator('#panel-daily [data-view="home"]')).toHaveCount(0);
});
