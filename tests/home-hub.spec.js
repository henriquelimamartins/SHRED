// Slice 4.10j (DECISIONS D164; AUDIT-4.10 points 9, 13, 1c, 33, 34): HOME = direction A.
// Header (date eyebrow, "HOME · LEARNING HUB" or "HOME" by the measured width, streak line / pill), the phone brand row
// (logo + account button: photo in the sync-state ring opening the profile panel over HOME, or "Sign in" opening
// Account & data), the briefing of the day and Today's key (circle, chords, today's box and string). Real values only
// (D71); showing HOME or opening the panel writes nothing. Slice 4.10m (D167): the circle became interactive and Next up
// left HOME (tests in home-key.spec.js); the "one line" check of the phone tiles and the header with the real Oswald
// were tightened after the review of 4.10j.
// Firebase is stubbed; the clock is fixed at Tuesday 10 Nov 2026; nothing leaves the machine.
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, cloudWrites, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { baseState, progressState, USER_DOC } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const PHOTO_USER = { uid: 'test-uid', email: 'tester@example.com', displayName: 'Test Person', photoURL: 'https://lh3.googleusercontent.com/a/test-photo' };
const home = (page) => page.locator('#panel-home');
const head = (page) => page.locator('#panel-home .home-head');
const acct = (page) => page.locator('#panel-home .home-brand-row .home-acct');

async function signedIn(page, overrides = {}) {
  return openApp(page, { user: PHOTO_USER, docs: { [USER_DOC]: progressState({ phaseIndex: 1, ...overrides }) }, avatar: true });
}

test('header: today\'s date as the eyebrow and "HOME · LEARNING HUB" on one line; screen readers hear "Home · Learning Hub"', async ({ page }) => {
  const monitor = await openApp(page, { localState: progressState() });
  await expect(head(page).locator('.home-date')).toHaveAttribute('datetime', '2026-11-10');
  await expect(head(page).locator('.home-date-long')).toBeVisible();
  await expect(head(page).locator('.home-date-long')).toHaveText('Tuesday · November 10th, 2026');
  await expect(head(page).locator('.home-date-short')).toBeHidden();
  await expect(head(page).locator('.home-title-long')).toBeVisible();
  await expect(head(page).locator('.home-title-long')).toHaveText('Home · Learning Hub');
  await expect(head(page).locator('.home-title')).toHaveCSS('text-transform', 'uppercase');
  await expect(head(page).locator('.home-title-short')).toBeHidden();
  await expect(head(page).locator('.home-title')).toHaveAccessibleName('Home · Learning Hub');
  // One line: the visible title is no taller than one line of its own font.
  const one = await head(page).locator('.home-title').evaluate((el) => el.getBoundingClientRect().height <= parseFloat(getComputedStyle(el).fontSize) * 1.3);
  expect(one).toBe(true);
  // The sidebar menu and the phone bar keep "Home".
  await expect(page.locator('#botnav:visible, #sidebar-nav-inner:visible').first().locator('[data-view="home"]')).toContainText(/^home$/i);
  expect(monitor.pageErrors).toEqual([]);
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
});

test('header: where the long title or date would not fit on one line, the page shows "HOME" and the short date', async ({ page }) => {
  await openApp(page, { localState: progressState() });
  await page.setViewportSize({ width: 250, height: 700 });
  await expect(head(page)).toHaveClass(/fit-short-title/);
  await expect(head(page).locator('.home-title-short')).toBeVisible();
  await expect(head(page).locator('.home-title-short')).toHaveText('Home');
  await expect(head(page).locator('.home-title-long')).toBeHidden();
  await expect(head(page)).toHaveClass(/fit-short-date/);
  await expect(head(page).locator('.home-date-short')).toHaveText('Tue · Nov 10th, 2026');
  await expect(head(page).locator('.home-title')).toHaveAccessibleName('Home · Learning Hub');
  await page.setViewportSize({ width: 1200, height: 800 }); // room again: back to the long ones
  await expect(head(page).locator('.home-title-long')).toBeVisible();
  await expect(head(page).locator('.home-date-long')).toBeVisible();
});

test('Today\'s key: the DAILY chords of today\'s key; today\'s box and string, as the IMPROV rules fill them in', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1 }) }); // Gate 1 on IMPROV
  const card = home(page).locator('.home-key');
  const homeChords = await card.locator('.kc-deg').allTextContents();
  await openView(page, 'daily');
  expect(homeChords).toEqual(await page.locator('#panel-daily .daily-key-card .kc-deg').allTextContents());
  expect(homeChords).toHaveLength(7);
  // The IMPROV page fills today's string, frets and box into the Gate 1 rules.
  await openView(page, 'improv');
  const ex = page.locator('#panel-improv .improv-gate .improv-ex');
  const oneString = await ex.nth(0).locator('.ex-today').first().textContent(); // "One-String Doom": the string
  const box = await ex.nth(1).locator('.ex-today').allTextContents(); // "The 4-Fret Box": "a and b", "box n of the … pentatonic"
  const [lo, hi] = box[0].split(' and ');
  const n = box[1].match(/^box (\d)/)[1];
  await openView(page, 'home');
  await expect(card.locator('.hk-tile-label')).toHaveText(['4-Fret Box', 'One-String Doom']);
  await expect(card.locator('.hk-tile-val')).toHaveText([`Box ${n} · frets ${lo}–${hi}`, `${oneString} string`]);
  await expect(card.locator('.hk-open')).toHaveText(/^Open Improvisation$/i);
});

test('every block practised: "Session complete", all tiles done and "Open DAILY"', async ({ page }) => {
  const practiced = { 'warmup.Tue': true, 'focused.Tue': true, 'casual.Tue': true, 'cooldown.Tue': true };
  await openApp(page, { localState: baseState({ phaseIndex: 1, practiced, streakDates: ['2026-11-10'] }) });
  const brief = home(page).locator('.home-brief');
  await expect(brief.locator('.hb-next')).toHaveText('Session complete');
  await expect(brief.locator('.hb-next-sub')).toHaveText('All 4 blocks practised');
  await expect(brief.locator('.hb-tile.done')).toHaveCount(4);
  await expect(brief.locator('.hb-tile.next')).toHaveCount(0);
  await expect(brief.locator('.hb-meta')).toHaveText('4 of 4 · 60 min');
  await expect(brief.locator('.hb-continue')).toHaveText('Open DAILY');
});

test('the tiles name each block and its state for screen readers (text in the tile, the visible parts hidden from them)', async ({ page }) => {
  await openApp(page, { localState: baseState({ phaseIndex: 1, practiced: { 'warmup.Tue': true } }) });
  const tiles = home(page).locator('.hb-tile');
  await expect(tiles.locator('.home-sr')).toHaveText(['Warm-Up, 5 min, practised', 'Focused, 30 + 5 min, next', 'Improv & Expression, 15 min, not practised yet', 'Cool-Down, 5 min, not practised yet']);
  expect(await tiles.evaluateAll((t) => t.filter((x) => x.hasAttribute('aria-label')).length)).toBe(0);
  // Everything else in a tile is decoration for screen readers.
  const shown = await tiles.evaluateAll((t) => t.flatMap((x) => [...x.children].filter((c) => !c.classList.contains('home-sr') && c.getAttribute('aria-hidden') !== 'true').map((c) => c.className)));
  expect(shown).toEqual([]);
});

test('showing HOME and opening and closing the profile panel write nothing (device or cloud)', async ({ page, isMobile }) => {
  await signedIn(page);
  const before = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  const writesBefore = (await cloudWrites(page)).length;
  if (isMobile) {
    await acct(page).click();
    await expect(page.locator('#profile-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#profile-layer')).toBeHidden();
  }
  await openView(page, 'daily');
  await openView(page, 'home');
  await settle(page);
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBe(before);
  expect((await cloudWrites(page)).length).toBe(writesBefore);
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout');

  test('no brand row and no account button on HOME: the sidebar has the logo and the account row', async ({ page }) => {
    await signedIn(page);
    await expect(home(page).locator('.home-brand-row')).toBeHidden();
    await expect(head(page).locator('.home-streak')).toBeVisible();
    await expect(head(page).locator('.streak-pill')).toBeHidden();
    await expect(page.locator('#sidebar .side-logo')).toBeVisible();
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout');

  test('brand row: the sidebar logo at phone size; the mark is decoration', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const logo = home(page).locator('.home-brand-row .side-logo.home-logo');
    await expect(logo).toBeVisible();
    await expect(logo.locator('.side-logo-mark')).toHaveAttribute('aria-hidden', 'true');
    const size = await logo.evaluate((el) => {
      const r = (s) => el.querySelector(s).getBoundingClientRect();
      return { mark: Math.round(r('.side-logo-mark').height * 10) / 10, top: parseFloat(getComputedStyle(el.querySelector('.side-logo-top')).fontSize),
        bottom: parseFloat(getComputedStyle(el.querySelector('.side-logo-bottom')).fontSize) };
    });
    expect(size).toEqual({ mark: 45.1, top: 22, bottom: 24.11 });
    await expect(home(page).locator('.home-brand-row')).not.toContainText('THE SHRED ROADMAP '); // the old text brand is gone
    await expect(head(page).locator('.streak-pill')).toBeVisible();
    await expect(head(page).locator('.home-streak')).toBeHidden();
  });

  test('signed in: the photo in a green ring (44 px tap area) named by the sync state; it opens the profile panel over HOME', async ({ page }) => {
    const monitor = await signedIn(page);
    const b = acct(page);
    await expect(b).toHaveAttribute('aria-label', 'Account · Synced');
    await expect(b.locator('.avatar-ring')).toHaveClass(/\bok\b/);
    await expect(b.locator('img.avatar-img')).toHaveCount(1);
    const box = await b.boundingBox();
    expect(Math.round(box.width)).toBeGreaterThanOrEqual(44);
    expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
    await b.click();
    const d = page.locator('#profile-dialog');
    await expect(d).toBeVisible();
    await expect(page.locator('#panel-home')).toHaveClass(/active/); // still HOME, under the panel
    await expect(d.locator('.profile-name')).toHaveText('Test Person');
    await expect(d.locator('.profile-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#profile-layer')).toBeHidden();
    await expect(b).toBeFocused();
    // The panel closes when the page changes.
    await b.click();
    await expect(d).toBeVisible();
    await d.locator('.profile-close').click();
    await expect(page.locator('#profile-layer')).toBeHidden();
    expect(monitor.pageErrors).toEqual([]);
  });

  test('the ring and the name follow the sync state (offline = amber)', async ({ page, context }) => {
    await signedIn(page);
    await context.setOffline(true);
    await expect(acct(page)).toHaveAttribute('aria-label', 'Account · Offline · saved on this device', { timeout: 5000 });
    await expect(acct(page).locator('.avatar-ring')).toHaveClass(/\bwait\b/);
    await context.setOffline(false);
  });

  test('signed out: "Sign in" (44 px tall) opens Account & data, where Login lives; it never starts sign-in', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    const b = home(page).locator('.home-brand-row .home-signin');
    await expect(b).toHaveText('Sign in');
    await expect(b.locator('svg')).toHaveCount(1);
    expect(Math.round((await b.boundingBox()).height)).toBeGreaterThanOrEqual(44);
    await expect(home(page).locator('[data-action="profile"]')).toHaveCount(0);
    await b.click();
    await expect(page.locator('#panel-account')).toHaveClass(/active/);
    expect(await page.evaluate(() => window.__SHRED_TEST__.calls.filter((c) => /signIn/i.test(c)))).toEqual([]);
  });

  test('the Improv & Expression tile reads "Improv" on the phone, each tile title on one line (owner)', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 1 }) });
    for (const w of [360, 375, 390]) {
      await page.setViewportSize({ width: w, height: 760 });
      await settle(page);
      // One line = every line box of the visible text has the same top (a Range over the text, so a wrapped title is
      // caught: a block element alone always reports one box).
      const titles = await home(page).locator('.hb-title').evaluateAll((els) => els.map((e) => {
        const shown = [...e.querySelectorAll('span')].find((x) => getComputedStyle(x).display !== 'none') || e;
        const r = document.createRange(); r.selectNodeContents(shown);
        const tops = new Set([...r.getClientRects()].filter((b) => b.width > 0).map((b) => Math.round(b.top)));
        return { t: e.innerText, one: tops.size === 1, fits: e.getBoundingClientRect().right <= e.closest('.hb-tile').getBoundingClientRect().right };
      }));
      expect(titles.map((x) => x.t), `width ${w}`).toEqual(['Warm-Up', 'Focused', 'Improv', 'Cool-Down']);
      expect(titles.every((x) => x.one && x.fits), `width ${w}`).toBe(true);
    }
    await expect(home(page).locator('.hb-tile[data-block="casual"] .home-sr')).toHaveText(/^Improv & Expression, /);
  });

  // The long title shows only where it fits; which one shows depends on the font (the real Oswald on devices, a
  // fallback in the CI, where web fonts are blocked), so the test checks the rule, not the outcome.
  test('header at 360, 375 and 390 px: the title shown fits on one line, the long one only where it fits; no sideways scroll, at most 110 px', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    for (const w of [360, 375, 390]) {
      await page.setViewportSize({ width: w, height: 760 });
      await settle(page);
      await expect(head(page)).toHaveClass(/fitted/);
      const m = await page.evaluate(() => {
        const head = document.querySelector('#panel-home .home-head');
        const right = head.querySelector('.page-head-right').getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(head).columnGap) || 0;
        const room = head.clientWidth - right.width - gap;
        const short = head.classList.contains('fit-short-title');
        const title = head.querySelector('.home-title');
        const shown = head.querySelector(short ? '.home-title-short' : '.home-title-long').getBoundingClientRect();
        head.classList.remove('fit-short-title'); // measure the long title, then put the class back
        const longW = head.querySelector('.home-title-long').getBoundingClientRect().width;
        if (short) head.classList.add('fit-short-title');
        return {
          short, room, longW, shownRight: shown.right, pillLeft: right.left,
          oneLine: title.getBoundingClientRect().height <= parseFloat(getComputedStyle(title).fontSize) * 1.3,
          h: head.getBoundingClientRect().bottom - document.querySelector('#panel-home .home-brand-row').getBoundingClientRect().top,
          over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      if (m.short) expect(m.longW, `width ${w}: "HOME" only when the long title does not fit`).toBeGreaterThan(m.room - 2);
      else expect(m.longW, `width ${w}: the long title fits`).toBeLessThanOrEqual(m.room);
      expect(m.oneLine, `width ${w}`).toBe(true);
      expect(m.shownRight, `width ${w}`).toBeLessThanOrEqual(m.pillLeft);
      expect(m.h, `width ${w}`).toBeLessThanOrEqual(110);
      expect(m.over, `width ${w}`).toBe(0);
    }
  });

  // Slice 4.10m (D167; review of 4.10j): with the real Oswald (bundled for this test), the long title fits beside the
  // streak pill at 360, 375 and 390 px, as on the owner's iPhone and on the approved boards (D164 point 2).
  test('with the real Oswald the long title "HOME · LEARNING HUB" shows at 360, 375 and 390 px', async ({ page }) => {
    await openApp(page, { localState: progressState(), oswald: true });
    // A loaded Oswald face (document.fonts.check alone is true even when no face is registered).
    expect(await page.evaluate(async () => { await document.fonts.ready;
      return [...document.fonts].some((f) => f.family.replace(/["']/g, '') === 'Oswald' && f.status === 'loaded'); })).toBe(true);
    for (const w of [360, 375, 390]) {
      await page.setViewportSize({ width: w, height: 760 });
      await settle(page);
      await expect(head(page)).toHaveClass(/fitted/);
      await expect(head(page), `width ${w}`).not.toHaveClass(/fit-short-title/);
      await expect(head(page).locator('.home-title-long'), `width ${w}`).toBeVisible();
      const one = await head(page).locator('.home-title').evaluate((el) => el.getBoundingClientRect().height <= parseFloat(getComputedStyle(el).fontSize) * 1.3);
      expect(one, `width ${w}`).toBe(true);
    }
  });
});
