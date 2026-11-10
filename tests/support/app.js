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

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ user?: object|null, docs?: object, localState?: object, now?: string }} [options]
 *   user       - signed-in user for the auth stand-in (null = signed out)
 *   docs       - cloud documents by path, e.g. { 'users/test-uid': {...} }
 *   localState - value placed in localStorage before the app starts (first load only)
 *   now        - fixed clock time (ISO string); defaults to DEFAULT_NOW
 */
async function openApp(page, options = {}) {
  const { user = null, docs = {}, localState, now = DEFAULT_NOW } = options;
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
    if (url.startsWith(appOrigin)) return route.continue();

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

module.exports = { openApp, unexpectedConsoleErrors, cloudWrites, localSaved, settle, STORAGE_KEY, DEFAULT_NOW };
