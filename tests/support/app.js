// Opens the app in a test browser with Firebase replaced by local stand-ins.
// Guarantees: no request ever leaves the machine, so tests can never touch the real account.
const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');

const STORAGE_KEY = 'shredRoadmapState_v10';
const STUB_DIR = path.join(__dirname, 'firebase-stubs');
const FIREBASE_CDN = /^https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-(?:app|auth|firestore))\.js(?:\?.*)?$/;
// Hosts the real Firebase SDK talks to (auth, Firestore, Google sign-in). Web fonts are not Firebase.
const FIREBASE_BACKEND = /(^|\.)(firebaseio\.com|firebaseapp\.com|web\.app|apis\.google\.com|accounts\.google\.com)$|^(?!fonts\.)[a-z0-9-]+\.googleapis\.com$/;

// All tests run at a fixed moment so dates (streak, calendar, daily reset) are predictable.
const DEFAULT_NOW = '2026-11-10T12:00:00Z'; // a Tuesday
const AVATAR_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ user?: object|null, docs?: object, localState?: object, now?: string }} [options]
 *   user       - signed-in user for the auth stand-in (null = signed out)
 *   docs       - cloud documents by path, e.g. { 'users/test-uid': {...} }
 *   localState - value placed in localStorage before the app starts (first load only)
 *   now        - fixed clock time (ISO string); defaults to DEFAULT_NOW
 *   bhgsPack   - false serves js/pack.js with the BHGS pack switched off (slice 4.2b, D113)
 *   oswald     - true serves the real Oswald font (tests/support/fonts, SIL Open Font License) for the Google Fonts
 *                request, so a test can measure text as the owner's devices draw it (slice 4.10m, D167). Every
 *                other test keeps web fonts blocked, as before.
 *   avatar     - true serves a small test image for Google account photos (googleusercontent.com, slice 4.5b);
 *                otherwise those requests are blocked like every other outside request
 */
async function openApp(page, options = {}) {
  const { user = null, docs = {}, localState, now = DEFAULT_NOW, bhgsPack = true, avatar = false, oswald = false } = options;
  const monitor = { consoleErrors: [], pageErrors: [], blockedRequests: [], firebaseBackendRequests: [] };

  page.on('console', (msg) => {
    if (msg.type() === 'error') monitor.consoleErrors.push({ text: msg.text(), url: msg.location().url });
  });
  page.on('pageerror', (err) => monitor.pageErrors.push(err.message));

  await page.addInitScript(
    ({ user, docs, localState, key }) => {
      window.__SHRED_TEST__ = { user, docs, writes: [], calls: [] };
      if (localState !== undefined && !sessionStorage.getItem('__shredTestSeeded')) {
        localStorage.setItem(key, JSON.stringify(localState));
        sessionStorage.setItem('__shredTestSeeded', '1');
      }
    },
    { user, docs, localState, key: STORAGE_KEY }
  );

  const appOrigin = new URL(page.context()._options.baseURL).origin;
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    // Slice 4.2b (D113): `bhgsPack: false` serves the pack switch turned off.
    if (!bhgsPack && url.startsWith(appOrigin + '/js/pack.js')) {
      return route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 'export const BHGS_PACK = false;\n' });
    }
    if (url.startsWith(appOrigin)) return route.continue();
    // Slice 4.10m (D167): `oswald: true` answers the Google Fonts stylesheet with the bundled Oswald only.
    if (oswald && url.startsWith('https://fonts.googleapis.com/')) {
      return route.fulfill({ status: 200, contentType: 'text/css; charset=utf-8', headers: { 'Access-Control-Allow-Origin': '*' },
        body: "@font-face{font-family:'Oswald';font-style:normal;font-weight:200 700;src:url(https://fonts.gstatic.com/test/oswald-wght.ttf) format('truetype');}\n" });
    }
    if (oswald && url === 'https://fonts.gstatic.com/test/oswald-wght.ttf') {
      return route.fulfill({ status: 200, contentType: 'font/ttf', headers: { 'Access-Control-Allow-Origin': '*' },
        body: fs.readFileSync(path.join(__dirname, 'fonts', 'Oswald-wght.ttf')) });
    }
    // Slice 4.5b (D126): a stand-in Google account photo (1 x 1 PNG); nothing leaves the machine.
    if (avatar && /^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//.test(url)) {
      return route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from(AVATAR_PNG, 'base64') });
    }

    const stub = url.match(FIREBASE_CDN);
    if (stub) {
      return route.fulfill({
        status: 200,
        contentType: 'text/javascript; charset=utf-8',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: fs.readFileSync(path.join(STUB_DIR, stub[1] + '.js'), 'utf8'),
      });
    }

    monitor.blockedRequests.push(url);
    if (FIREBASE_BACKEND.test(new URL(url).hostname)) monitor.firebaseBackendRequests.push(url);
    return route.abort();
  });

  await page.clock.setFixedTime(new Date(now));
  await page.goto('/');
  await expect(page.locator('#views-container')).toBeAttached();
  await expect(page.locator('#splash')).toHaveCount(0, { timeout: 5000 });
  // Wait until the app has received its (stubbed) auth state and re-rendered.
  await page.waitForFunction(() => window.__SHRED_TEST__.calls.includes('onAuthStateChanged'));
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 50)));
  return monitor;
}

/** Console errors that are not just the expected failure of a blocked external resource (e.g. web fonts). */
function unexpectedConsoleErrors(monitor) {
  return monitor.consoleErrors
    .filter((e) => !(e.text.startsWith('Failed to load resource') && monitor.blockedRequests.includes(e.url)))
    .map((e) => e.text);
}

async function cloudWrites(page) {
  return page.evaluate(() => window.__SHRED_TEST__.writes);
}

/** The app state currently saved in localStorage (parsed), or null. */
async function localSaved(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_KEY);
}

/** Waits for the app's async work (stubbed Firebase calls, re-render) to settle. */
async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 50)));
}

/**
 * Opens a destination from the sidebar (desktop), the phone bar or the phone More sheet.
 * Navigating writes nothing (D119), so tests can move between pages freely.
 */
async function openView(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  const btn = nav.locator(`[data-action="go"][data-view="${view}"]`);
  // Slice 4.5a (D124): on the desktop, Account & data is opened from the sidebar account row.
  const sideAccount = page.locator(`#sidebar-account:visible [data-action="go"][data-view="${view}"]`);
  if (await btn.count()) await btn.click();
  else if (await sideAccount.count()) await sideAccount.click();
  else {
    await nav.locator('[data-action="more"]').click();
    await page.locator(`#panel-more [data-action="go"][data-view="${view}"]`).first().click();
  }
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
  await settle(page);
}

/**
 * The Account & data page (slice 4.5a, D124), opened first if another page is showing.
 * Cloud Sync (Save/Load), Download/Restore backup and Reset Everything live there (they were on HOME).
 */
async function accountPanel(page) {
  const panel = page.locator('#panel-account');
  if (!(await panel.evaluate((el) => el.classList.contains('active')))) await openView(page, 'account');
  return panel;
}

/** The current-phase Phase Transition Test stepper on the TECHNIQUE page (slice 4.3; it was on HOME before). */
function testStepper(page, key = 'alt', d = 1) {
  return page.locator(`#panel-technique .tech-sec-test [data-action="test"][data-t="${key}"][data-d="${d}"]`);
}

/**
 * One Phase Transition Test step (a simple Technique change used by many persistence tests).
 * Slice 4.3 (D122): the test moved from HOME to TECHNIQUE; this opens TECHNIQUE (Phase test tab on the
 * phone), clicks the stepper and goes back to the page that was open, so the tests keep their flow.
 */
async function bumpTest(page, key = 'alt', d = 1) {
  const back = await page.evaluate(() => {
    const p = document.querySelector('.view-panel.active');
    return p ? p.id.replace('panel-', '') : 'home';
  });
  if (back !== 'technique') await openView(page, 'technique');
  const tab = page.locator('#panel-technique [data-action="techtab"][data-tab="test"]');
  if (await tab.isVisible()) { await tab.click(); await settle(page); }
  await testStepper(page, key, d).click();
  await settle(page);
  if (back !== 'technique') await openView(page, back);
}

/**
 * Slice 4.5d (D130): on the phone, All phases, Essential Skills and Phase settings of TECHNIQUE are sub-pages opened
 * from link rows ("phases", "essentials", "settings"). On the desktop every part is on the page, so this does nothing.
 */
async function techPart(page, part) {
  if ((page.viewportSize() || {}).width >= 768) return;
  const back = page.locator('#panel-technique .tech-back:visible');
  if (await back.count()) { await back.first().click(); await settle(page); } // from another sub-page
  const row = page.locator(`#panel-technique .tech-links [data-sub="${part}"]`);
  if (await row.isVisible()) { await row.click(); await settle(page); }
}

module.exports = { openApp, unexpectedConsoleErrors, cloudWrites, localSaved, settle, openView, accountPanel, testStepper, bumpTest, techPart, STORAGE_KEY, DEFAULT_NOW };
