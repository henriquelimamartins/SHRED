// Slice 4.5b2 (DECISIONS D126 point 1, D128): the app shell on the phone, as drawn on the 4.0 canvas.
// Bottom bar with line icons; no shared top bar (no Search, Login only on Account & data); HOME's own header
// (brand, date, streak); MORE as a page with RESOURCES, TOOLS and ACCOUNT & DATA rows and the account photo.
// Firebase is stubbed; a Google photo is served by the test helper; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, cloudWrites, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const PHOTO = 'https://lh3.googleusercontent.com/a/test-photo=s96-c';
const PHOTO_USER = { ...TEST_USER, displayName: 'Test Person', photoURL: PHOTO };
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const rowTexts = (loc) => loc.evaluateAll((els) => els.map((e) => e.querySelector('.more-row-label').textContent.trim()));
async function openMore(page) {
  await page.locator('#botnav [data-action="more"]').click();
  await expect(page.locator('#panel-more')).toHaveClass(/active/);
  return page.locator('#panel-more');
}

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('bottom bar: six equal slots with line icons (no emoji), labels in capitals, the current page marked', async ({ page }) => {
    const monitor = await openApp(page);
    const items = page.locator('#botnav button');
    await expect(items).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const b = items.nth(i);
      await expect(b.locator('svg.ico')).toHaveCount(1);
      expect(await b.textContent()).not.toMatch(EMOJI);
      await expect(b).toHaveCSS('text-transform', 'uppercase');
    }
    const boxes = await items.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    // Sizes are rounded to whole pixels: GitHub's runner can measure 47.99... for a 48 px box.
    for (const r of boxes) {
      expect(Math.round(r.height)).toBeGreaterThanOrEqual(48);
      expect(Math.abs(r.width - boxes[0].width)).toBeLessThan(1);
    }
    await expect(page.locator('#botnav [data-view="home"]')).toHaveAttribute('aria-current', 'page');
    await page.locator('#botnav [data-view="improv"]').click();
    await expect(page.locator('#botnav [data-view="improv"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#botnav [data-view="home"]')).not.toHaveAttribute('aria-current', 'page');
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('no shared top bar: no Search, and Login only on the Account & data page (D125 point 4)', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('#topbar, .topbar')).toHaveCount(0);
    await expect(page.locator('.shell-search, #authBtn')).toHaveCount(0);
    for (const view of ['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup', 'more']) {
      if (view === 'more') await openMore(page); else await openView(page, view);
      await expect(page.locator('.side-search:visible')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^(Login|Logout)$/ })).toHaveCount(0);
    }
    await openView(page, 'account');
    await expect(page.getByRole('button', { name: /^(Login|Logout)$/ })).toHaveCount(1);
  });

  // Slice 4.10j (D164 points 1 and 2): the brand row (logo + account button) above the page header (date, title, pill).
  test('HOME has its own header: logo, date, title and the streak pill', async ({ page }) => {
    const monitor = await openApp(page, { localState: progressState() });
    const brand = page.locator('#panel-home .home-brand-row');
    const head = page.locator('#panel-home .home-head');
    await expect(brand).toBeVisible();
    await expect(brand.locator('.side-logo-words')).toHaveText(/THE\s+SHRED\s*ROADMAP/);
    await expect(head.locator('.home-date-long')).toHaveText('Tuesday · November 10th, 2026');
    await expect(head.locator('.home-date')).toHaveCSS('text-transform', 'uppercase');
    // The pill shows the same streak as the HOME header line (desktop) and the consistency of the streak dates.
    const streak = await page.locator('#panel-home .home-streak .streak-run').textContent();
    expect(streak).toBe('3');
    await expect(head.locator('.streak-pill strong')).toHaveText(streak);
    await expect(head.locator('.streak-pill')).toHaveAttribute('aria-label', `${streak}-day streak`);
    await expect(head).toBeVisible();
    expect(monitor.pageErrors).toEqual([]);
  });

  test('other pages keep their own title as the header (pillar pages: pillar-headers.spec.js, D131)', async ({ page }) => {
    await openApp(page);
    // Slice 4.10h (D162 point 4): DAILY's heading is named "Daily Practice" (visible "Daily Practice" or "Daily").
    for (const [view, title] of [['daily', 'Daily Practice'], ['account', 'Account & data']]) {
      await openView(page, view);
      await expect(page.locator(`#panel-${view} .page-title`).first()).toBeVisible();
      await expect(page.locator(`#panel-${view} .page-title`).first()).toHaveAccessibleName(title);
    }
  });

  test('MORE page as drawn: title, RESOURCES / TOOLS / ACCOUNT & DATA rows with subtitles, no rails', async ({ page }) => {
    const monitor = await openApp(page);
    const more = await openMore(page);
    await expect(more.locator('.page-title')).toHaveText('More');
    await expect(more.locator('.page-title')).toBeVisible();
    await expect(more.locator('.page-eyebrow')).toBeHidden();
    await expect(more.locator('[data-rail]')).toHaveCount(0);
    expect(await more.locator('.more-group').evaluateAll((g) => g.map((x) => x.dataset.group))).toEqual(['resources', 'tools', 'account']);
    expect(await rowTexts(more.locator('[data-group="resources"] .more-row'))).toEqual(['Library']);
    expect(await rowTexts(more.locator('[data-group="tools"] .more-row'))).toEqual(['Guitar setup']);
    expect(await rowTexts(more.locator('[data-group="account"] .more-row'))).toEqual(['Cloud sync', 'Download backup', 'Restore backup', 'Reset progress']);
    await expect(more.locator('[data-group="tools"] .more-row-sub')).toHaveText('PRS SE CE 24 · E Standard');
    await expect(more.locator('[data-row="reset"] .more-row-label')).toHaveCSS('color', 'rgb(255, 92, 97)');
    for (const r of await more.locator('.more-row').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) expect(Math.round(r)).toBeGreaterThanOrEqual(44);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('the Guitar setup row shows the guitar and tuning chosen in SETUP and opens it', async ({ page }) => {
    await openApp(page, { localState: progressState() }); // epi + drop_d
    const more = await openMore(page);
    await expect(more.locator('[data-group="tools"] .more-row-sub')).toHaveText('Epiphone Les Paul Standard · Drop D');
    await more.locator('[data-view="setup"]').click();
    await expect(page.locator('#panel-setup')).toHaveClass(/active/);
    await expect(page.locator('#botnav [data-action="more"]')).toHaveClass(/active/);
  });

  test('with the BHGS pack off there is no RESOURCES group (LIBRARY is in the bar)', async ({ page }) => {
    await openApp(page, { bhgsPack: false });
    const more = await openMore(page);
    expect(await more.locator('.more-group').evaluateAll((g) => g.map((x) => x.dataset.group))).toEqual(['tools', 'account']);
    await expect(page.locator('#botnav [data-view="library"]')).toHaveCount(1);
  });

  test('account button next to the title: person icon signed out; it opens Account & data', async ({ page }) => {
    await openApp(page);
    const more = await openMore(page);
    const btn = more.locator('.more-acct');
    await expect(btn).toHaveAttribute('aria-label', 'Account and data');
    await expect(btn.locator('.avatar-none svg')).toHaveCount(1);
    const b = await btn.boundingBox();
    expect(Math.round(b.width)).toBeGreaterThanOrEqual(44); // whole pixels: GitHub measured 43.99999...
    expect(Math.round(b.height)).toBeGreaterThanOrEqual(44);
    await btn.click();
    await expect(page.locator('#panel-account')).toHaveClass(/active/);
  });

  test('signed in with a Google photo: the photo shows next to the title', async ({ page }) => {
    await openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState() }, avatar: true });
    const more = await openMore(page);
    const img = more.locator('.more-acct img.avatar-img');
    await expect(img).toHaveAttribute('src', PHOTO);
    await expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
  });

  test('Cloud sync row shows the real sync state and opens Account & data', async ({ page }) => {
    await openApp(page);
    let more = await openMore(page);
    await expect(more.locator('[data-row="sync"] .sync-text')).toHaveText('Saved on this device only');
    await more.locator('[data-row="sync"]').click();
    await expect(page.locator('#panel-account')).toHaveClass(/active/);
  });

  test('signed in, the Cloud sync row reads "Synced" once the cloud was read', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await settle(page);
    const more = await openMore(page);
    await expect(more.locator('[data-row="sync"] .sync-text')).toHaveText('Synced');
    await expect(more.locator('[data-row="sync"] .sync-dot')).toHaveClass(/ok/);
  });

  test('Download backup row downloads the backup file and changes nothing', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    const more = await openMore(page);
    const downloadP = page.waitForEvent('download');
    await more.locator('[data-row="download"]').click();
    const download = await downloadP;
    expect(download.suggestedFilename()).toBe('shred-roadmap-backup-2026-11-10.json');
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
    await expect(page.locator('#panel-more')).toHaveClass(/active/);
  });

  test('Restore backup row opens Account & data with the restore list', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const more = await openMore(page);
    await more.locator('[data-row="restore"]').click();
    const account = page.locator('#panel-account');
    await expect(account).toHaveClass(/active/);
    await expect(account.locator('[data-action="pickrestorefile"]')).toBeVisible();
    await expect(account.locator('[data-action="cancelrestore"]')).toBeVisible();
  });

  test('Reset progress row opens the same confirmation; nothing is reset until confirmed', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    const more = await openMore(page);
    await more.locator('[data-row="reset"]').click();
    const account = page.locator('#panel-account');
    await expect(account).toHaveClass(/active/);
    await expect(account.getByText('Reset all progress?')).toBeVisible();
    await expect(account.locator('[data-action="confirmreset"]')).toHaveText('Yes, reset progress');
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
    await account.locator('[data-action="cancelreset"]').click();
    await expect(account.locator('[data-action="reset"]')).toBeVisible();
    // Coming back through Restore after Reset shows the restore list, not the reset confirmation.
    await openMore(page);
    await page.locator('#panel-more [data-row="restore"]').click();
    await expect(account.getByText('Reset all progress?')).toHaveCount(0);
  });

  test('opening MORE and its rows writes nothing (device or cloud)', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState() } });
    await settle(page);
    const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    const writesBefore = (await cloudWrites(page)).length;
    for (const r of ['sync', 'restore', 'reset']) {
      await openMore(page);
      await page.locator(`#panel-more [data-row="${r}"]`).click();
      await expect(page.locator('#panel-account')).toHaveClass(/active/);
    }
    await openMore(page);
    await page.locator('#panel-more .more-acct').click();
    await settle(page);
    expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
    expect((await cloudWrites(page)).length).toBe(writesBefore);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('the phone HOME header, bottom bar and MORE button stay hidden; HOME keeps the page header', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('#panel-home .home-phone-head')).toBeHidden();
    await expect(page.locator('#botnav')).toBeHidden();
    await expect(page.locator('[data-action="more"]:visible')).toHaveCount(0);
    await expect(page.locator('#panel-home .page-head')).toBeVisible();
    await expect(page.locator('#sidebar .side-search')).toBeVisible();
  });
});
