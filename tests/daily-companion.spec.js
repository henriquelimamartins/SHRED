// Slice 4.10h (D162; AUDIT-4.10 points 24, 25, 28, 31, the DAILY part of 33 and the icon part of 32).
// DAILY companion column: KEY first, MICRO-DOSES only on a day with a micro-dose, the Friday card without its last
// sentence; no count bar or count text; from 1180 px the day buttons sit over the session column and the companion
// column starts level with them; the header with today's date as the eyebrow, "Daily Practice" / "Daily" by the room
// there is and the HOME streak line (phone: the pill); block minutes styled like "Practiced"; the line document icon
// instead of the book emoji. DAILY behaviour is unchanged (daily.spec.js, streak.spec.js, local-day.spec.js).
// Fixed clock: Tuesday 2026-11-10 (Lisbon).
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const home = (page) => page.locator('#panel-home');
const side = (page) => daily(page).locator('.daily-side');
const head = (page) => daily(page).locator('.daily-head');
const dayChip = (page, day) => daily(page).locator(`.daypick [data-action="setday"][data-day="${day}"]`);
const isPhone = (testInfo) => testInfo.project.name === 'mobile';
const box = async (loc) => loc.boundingBox();
const SATURDAY = '2026-11-14T12:00:00Z';
const FRIDAY_SENTENCE = 'Friday has no separate video: the whole Focused block reinforces your weakest skill. A tick = a day you practised.';
// Phase 1, warm-up ticked today, Mon and Tue of this week logged and one day the week before.
const state = (over = {}) => baseState({ phaseIndex: 1, practiced: { 'warmup.Tue': true },
  streakDates: ['2026-11-02', '2026-11-09', '2026-11-10'], ...over });

test.describe('companion column (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'the phone has no companion column (D133 point 2)');

  test('KEY first, MICRO-DOSES under it', async ({ page }) => {
    const monitor = await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const cards = side(page).locator(':scope > section');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveClass(/daily-key-card/);
    await expect(cards.nth(1)).toHaveClass(/daily-micro-card/);
    expect((await box(cards.nth(1))).y).toBeGreaterThan((await box(cards.nth(0))).y);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('MICRO-DOSES only on a day with a micro-dose: Mon to Fri, not Sat, Sun or Phase 0', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const micro = side(page).locator('.daily-micro-card');
    for (const d of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
      await dayChip(page, d).click();
      await expect(micro).toHaveCount(1);
      await expect(micro.locator('.dc-tile')).toHaveCount(5);
    }
    for (const d of ['Sat', 'Sun']) {
      await dayChip(page, d).click();
      await expect(micro).toHaveCount(0);
      await expect(side(page).locator('.daily-key-card')).toBeVisible();
      await expect(side(page)).not.toContainText('No micro-dose');
    }
  });

  test('no MICRO-DOSES card when today is Saturday, nor in the Setup phase', async ({ page }) => {
    await openApp(page, { now: SATURDAY, localState: state({ practicedDate: '2026-11-14', practiced: {} }) });
    await openView(page, 'daily');
    await expect(dayChip(page, 'Sat')).toHaveAttribute('aria-pressed', 'true');
    await expect(side(page).locator('.daily-micro-card')).toHaveCount(0);
    await dayChip(page, 'Mon').click();
    await expect(side(page).locator('.daily-micro-card')).toHaveCount(1);
    await page.evaluate(() => localStorage.setItem('shredRoadmapState_v10', JSON.stringify({ ...JSON.parse(localStorage.getItem('shredRoadmapState_v10')), phaseIndex: 0 })));
    await page.reload();
    await openView(page, 'daily');
    for (const d of ['Mon', 'Fri', 'Sat']) {
      await dayChip(page, d).click();
      await expect(side(page).locator('.daily-micro-card')).toHaveCount(0);
      await expect(side(page).locator('.daily-key-card')).toBeVisible();
    }
  });

  test('the Friday card loses its last sentence and keeps everything else; other weekdays keep it', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const card = side(page).locator('.daily-micro-card');
    await expect(card.locator('.dc-foot')).toHaveText(FRIDAY_SENTENCE);
    await dayChip(page, 'Fri').click();
    await expect(card.locator('.dc-foot')).toHaveCount(0);
    await expect(card).not.toContainText('Friday has no separate video');
    await expect(card.locator('.dc-label')).toHaveText('Micro-doses · 5 min a day');
    await expect(card.locator('.dc-front-name')).toHaveText('Reinforce Weakest');
    await expect(card.locator('.dc-front-line')).toHaveText('The whole Focused block reinforces your weakest skill');
    await expect(card.locator('a.dc-btn')).toHaveCount(0);
    await expect(card.locator('.dc-tile')).toHaveCount(5);
    await expect(card.locator('.dc-tile.ticked')).toHaveCount(2);
    await expect(card.locator('.dc-tile[data-day="Fri"]')).toHaveClass(/\bcur\b/);
    await dayChip(page, 'Thu').click();
    await expect(card.locator('.dc-foot')).toHaveText(FRIDAY_SENTENCE);
  });

  test('from 1180 px: day buttons over the session column only; the companion column starts level with them', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    for (const width of [1440, 1180]) {
      await page.setViewportSize({ width, height: 900 });
      const main = await box(daily(page).locator('.daily-main'));
      const days = await box(daily(page).locator('.daypick'));
      const aside = await box(side(page));
      const hd = await box(head(page));
      expect(Math.abs(days.x - main.x)).toBeLessThan(2);
      expect(Math.abs(days.width - main.width)).toBeLessThan(2);
      expect(aside.x).toBeGreaterThan(days.x + days.width);
      expect(Math.abs(aside.y - days.y)).toBeLessThan(2);
      expect(Math.abs((aside.x + aside.width) - (hd.x + hd.width))).toBeLessThan(2); // the header keeps the full width
      expect(days.y).toBeGreaterThan(hd.y + hd.height);
    }
  });

  test('below 1180 px: one column, day buttons at full width, the companion column under the session', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await page.setViewportSize({ width: 1024, height: 900 });
    const days = await box(daily(page).locator('.daypick'));
    const hd = await box(head(page));
    const session = await box(daily(page).locator('.daily-swipe'));
    const aside = await box(side(page));
    expect(Math.abs(days.width - hd.width)).toBeLessThan(2);
    expect(aside.y).toBeGreaterThanOrEqual(session.y + session.height);
    expect(Math.abs(aside.width - days.width)).toBeLessThan(2);
  });
});

test.describe('session column (desktop and phone)', () => {
  test('no count bar or count text, on any day, in any phase', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const noCount = async () => {
      await expect(daily(page).locator('.daily-progress, [role="progressbar"]')).toHaveCount(0);
      const text = await daily(page).innerText();
      expect(text).not.toMatch(/\d+ of \d+ practiced/i);
      expect(text).not.toMatch(/\b60 min\b/); // the old session total (blocks keep their own minutes)
    };
    await noCount();
    await daily(page).locator('button.blkcheck[data-block="focused"]').click();
    await noCount();
    for (const d of ['Thu', 'Sat', 'Sun']) { await dayChip(page, d).click(); await noCount(); }
    await page.evaluate(() => localStorage.setItem('shredRoadmapState_v10', JSON.stringify({ ...JSON.parse(localStorage.getItem('shredRoadmapState_v10')), phaseIndex: 0 })));
    await page.reload();
    await openView(page, 'daily');
    await noCount();
  });

  test('block minutes look like "Practiced" and sit centred on its line', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const blocks = daily(page).locator('.blk');
    await expect(blocks).toHaveCount(4);
    await expect(blocks.nth(0).locator('.blkcheck')).toHaveAttribute('aria-pressed', 'true'); // one ticked, three not
    const styles = (loc) => loc.evaluate((el) => { const s = getComputedStyle(el); return [s.fontFamily, s.fontSize, s.fontWeight, s.color, s.letterSpacing, s.textTransform]; });
    for (const b of await blocks.all()) {
      const min = b.locator('.top .min'), label = b.locator('.top .blkcheck > span').first();
      const pressed = (await b.locator('.top .blkcheck').getAttribute('aria-pressed')) === 'true';
      const m = await styles(min), l = await styles(label);
      // A ticked block's "Practiced" turns white (its pressed state); the minutes keep the unticked grey.
      if (pressed) { m.splice(3, 1); l.splice(3, 1); }
      expect(m).toEqual(l);
      const mb = await box(min), c = await box(b.locator('.top .blkcheck'));
      expect(Math.abs((mb.y + mb.height / 2) - (c.y + c.height / 2))).toBeLessThan(1.5);
      expect(mb.x + mb.width).toBeLessThanOrEqual(c.x + 1); // minutes on the left of "Practiced", same line
    }
    await expect(blocks.nth(1).locator('.top .min')).toHaveText('30 + 5 min'); // texts unchanged
    // On the phone the title never overlaps the minutes (they move under it together with "Practiced" if needed).
    for (const b of await blocks.all()) {
      const nm = await box(b.locator('.top .nm')), right = await box(b.locator('.top .topright'));
      const overlap = nm.x + nm.width > right.x + 1 && nm.y + nm.height > right.y + 1 && right.y + right.height > nm.y + 1;
      expect(overlap).toBe(false);
    }
  });

  test('the theory documents carry the line document icon of LIBRARY, not the book emoji', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await dayChip(page, 'Wed').click();
    const docs = daily(page).locator('.docli');
    await expect(docs).toHaveCount(2);
    await expect(daily(page)).not.toContainText('\u{1F4D6}');
    for (const d of await docs.all()) {
      await expect(d.locator('.docic svg.ico')).toHaveCount(1);
      await expect(d.locator('.docic svg')).toHaveAttribute('aria-hidden', 'true');
      await expect(d.locator('.docic path')).toHaveAttribute('d', 'M7 3h7l4 4v14H7zM14 3v4h4'); // LIBRARY's file icon
    }
    await expect(docs.locator('a')).toHaveText(['Music Theory Cheat Sheet', 'Scales Handbook']);
  });
});

test.describe('header', () => {
  test('today\'s date as the eyebrow above the title; the heading is always named "Daily Practice"', async ({ page }) => {
    const monitor = await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const eyebrow = head(page).locator('time.page-eyebrow.daily-date');
    const title = head(page).locator('h1.page-title');
    await expect(eyebrow).toHaveAttribute('datetime', '2026-11-10');
    await expect(eyebrow).toHaveCSS('text-transform', 'uppercase');
    await expect(eyebrow).toHaveCSS('color', 'rgb(160, 160, 170)');
    const e = await box(eyebrow), t = await box(title);
    expect(e.y + e.height).toBeLessThanOrEqual(t.y + 1);
    expect(Math.abs(e.x - t.x)).toBeLessThan(2); // left-aligned with the title
    await expect(title).toHaveAccessibleName('Daily Practice');
    await expect(page.getByRole('heading', { level: 1, name: 'Daily Practice' })).toHaveCount(1);
    // At the tested sizes (1440 px desktop, Pixel 7 phone) both long forms fit on one line.
    await expect(title.locator('.daily-title-long')).toBeVisible();
    await expect(title.locator('.daily-title-short')).toBeHidden();
    await expect(eyebrow.locator('.daily-date-long')).toHaveText('Tuesday · November 10th, 2026');
    await expect(eyebrow.locator('.daily-date-long')).toBeVisible();
    const lh = parseFloat(await title.evaluate((el) => getComputedStyle(el).fontSize));
    expect((await box(title)).height).toBeLessThan(lh * 1.6); // one line
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('the long title and date show only where they fit on one line, otherwise "Daily" and the short date', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    // Room for the long forms = header width - right-hand side - gap. Narrow the header just below / above it.
    const m = await head(page).evaluate((h) => {
      const r = h.querySelector('.page-head-right').getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(h).columnGap) || 0;
      return { r, gap, title: h.querySelector('.daily-title-long').getBoundingClientRect().width,
        date: h.querySelector('.daily-date-long').getBoundingClientRect().width };
    });
    const longest = Math.max(m.title, m.date);
    const setWidth = (w) => head(page).evaluate((h, px) => { h.style.width = px + 'px'; }, w);
    await setWidth(Math.ceil(m.r + m.gap + longest + 12));
    await expect(head(page).locator('.daily-title-long')).toBeVisible();
    await expect(head(page).locator('.daily-date-long')).toBeVisible();
    await setWidth(Math.floor(m.r + m.gap + Math.min(m.title, m.date) - 12));
    await expect(head(page).locator('.daily-title-short')).toBeVisible();
    await expect(head(page).locator('.daily-title-short')).toHaveText('Daily');
    await expect(head(page).locator('.daily-title-long')).toBeHidden();
    await expect(head(page).locator('.daily-date-short')).toHaveText('Tue · Nov 10th, 2026');
    await expect(head(page).locator('.daily-date-short')).toBeVisible();
    await expect(head(page).locator('h1.page-title')).toHaveAccessibleName('Daily Practice');
    const lh = parseFloat(await head(page).locator('h1.page-title').evaluate((el) => getComputedStyle(el).fontSize));
    expect((await box(head(page).locator('h1.page-title'))).height).toBeLessThan(lh * 1.6);
    await setWidth(Math.ceil(m.r + m.gap + longest + 12));
    await expect(head(page).locator('.daily-title-long')).toBeVisible();
  });

  test('the HOME streak line on the right (phone: the streak pill), with HOME\'s values', async ({ page }, testInfo) => {
    await openApp(page, { localState: state() });
    const homeLine = await home(page).locator('.home-streak').textContent();
    expect(homeLine).toBe('2 days in a row · 3 logged');
    await openView(page, 'daily');
    const line = head(page).locator('.page-head-right .home-streak');
    const pill = head(page).locator('.page-head-right .streak-pill');
    await expect(line).toHaveText(homeLine);
    await expect(pill).toHaveAttribute('aria-label', '2-day streak');
    if (isPhone(testInfo)) {
      await expect(pill).toBeVisible();
      await expect(line).toBeHidden();
      await expect(pill.locator('strong')).toHaveText('2');
    } else {
      await expect(line).toBeVisible();
      await expect(pill).toBeHidden();
      const l = await box(line), t = await box(head(page).locator('h1.page-title'));
      expect(l.x).toBeGreaterThan(t.x + t.width);
    }
  });

  test('streak line: ordinary word spaces around the numbers (HOME and DAILY)', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'the line shows on desktop (the phone shows the pill)');
    await openApp(page, { localState: baseState({ streakDates: ['2026-11-08', '2026-11-09', '2026-11-10'].concat(
      Array.from({ length: 24 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`)) }) });
    for (const view of ['home', 'daily']) {
      await openView(page, view);
      const line = page.locator(`#panel-${view} .page-head .home-streak`);
      await expect(line).toHaveText('3 days in a row · 27 logged');
      expect(await line.evaluate((el) => el.children.length)).toBe(2); // the flame + one run of text
      const gaps = await line.evaluate((el) => {
        const text = el.querySelector('.streak-text'), run = el.querySelector('.streak-run'), logged = el.querySelector('.streak-logged');
        const range = (node, from, to) => { const r = document.createRange(); r.setStart(node, from); r.setEnd(node, to); return r.getBoundingClientRect(); };
        const after = run.nextSibling; // " days in a row · "
        const days = range(after, 1, 5), dot = range(after, after.length - 2, after.length - 1);
        const loggedWord = range(logged.nextSibling, 1, 7);
        return { runDays: days.left - run.getBoundingClientRect().right, dotNum: logged.getBoundingClientRect().left - dot.right,
          numWord: loggedWord.left - logged.getBoundingClientRect().right, ok: !!text };
      });
      expect(gaps.ok).toBe(true);
      for (const g of [gaps.runDays, gaps.dotNum, gaps.numWord]) { expect(g).toBeGreaterThan(1); expect(g).toBeLessThan(6); }
      expect(Math.abs(gaps.dotNum - gaps.runDays)).toBeLessThan(1.5);
      expect(Math.abs(gaps.numWord - gaps.runDays)).toBeLessThan(1.5);
    }
  });

  test('the menu and the phone bar still say "Daily"', async ({ page }, testInfo) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    if (isPhone(testInfo)) await expect(page.locator('#botnav [data-view="daily"] .bn-label')).toHaveText('Daily');
    else await expect(page.locator('#sidebar-nav-inner .side-item[data-view="daily"] .side-label')).toHaveText('Daily');
  });
});

test('viewing days, resizing and the header write nothing', async ({ page }) => {
  await openApp(page, { localState: state() });
  await openView(page, 'daily');
  await settle(page);
  const before = await localSaved(page);
  const writes = (await cloudWrites(page)).length;
  for (const d of ['Mon', 'Wed', 'Fri', 'Sat', 'Sun', 'Tue']) await dayChip(page, d).click();
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.setViewportSize({ width: 390, height: 800 });
  await settle(page);
  expect(await localSaved(page)).toEqual(before);
  expect((await cloudWrites(page)).length).toBe(writes);
});
