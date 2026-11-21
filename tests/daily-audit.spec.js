// Slice 4.10c (D152 points 14, 16, 17, 21, 22, 23): DAILY after the 4.10 design round (option B).
// Title on the left and today's date on the right (no eyebrow); the count as a thin bar under the day buttons;
// session and companion column at full width (3 : 2, checked in daily-layout.spec.js); "Phase n · Label" in the
// Focused block; the Friday Phase test as a line with one dot per category; Mastered / Watched buttons as in
// LIBRARY (TECHNIQUE gets the same height); no DAILY button ends with punctuation. DAILY behaviour is unchanged
// and still covered by daily.spec.js, streak.spec.js and local-day.spec.js. Fixed clock: Tuesday 2026-11-10 (Lisbon).
const { test, expect } = require('@playwright/test');
const { openApp, openView, settle, localSaved, unexpectedConsoleErrors } = require('./support/app');
const { baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const daily = (page) => page.locator('#panel-daily');
const dayChip = (page, day) => daily(page).locator(`.daypick [data-action="setday"][data-day="${day}"]`);
const isPhone = (testInfo) => testInfo.project.name === 'mobile';
const box = async (loc) => loc.boundingBox();
const FRIDAY = '2026-11-13T12:00:00Z', MONDAY = '2026-11-09T12:00:00Z';
const state = (over = {}) => baseState({ phaseIndex: 1, practiced: { 'warmup.Tue': true }, streakDates: ['2026-11-10'], ...over });
const friday = (over = {}) => baseState({ phaseIndex: 1, practicedDate: '2026-11-13', practiced: { 'warmup.Fri': true },
  testLevel: { alt: 2, sweep: 3, legato: 1, econ: 0, tap: 0, ult: 0 }, ...over });

test.describe('header', () => {
  test('title DAILY on the left, today\'s date on the right, no eyebrow', async ({ page }, testInfo) => {
    const monitor = await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const head = daily(page).locator('.page-head');
    await expect(head.locator('.page-eyebrow')).toHaveCount(0);
    await expect(head.locator('.page-title')).toHaveText('Daily');
    const date = head.locator('time.daily-date');
    await expect(date).toHaveAttribute('datetime', '2026-11-10');
    if (isPhone(testInfo)) {
      await expect(date.locator('.daily-date-short')).toHaveText('Tue · Nov 10th, 2026');
      await expect(date.locator('.daily-date-long')).toBeHidden();
    } else {
      await expect(date.locator('.daily-date-long')).toHaveText('Tuesday · November 10th, 2026');
      await expect(date.locator('.daily-date-short')).toBeHidden();
    }
    const t = await box(head.locator('.page-title')), d = await box(date);
    expect(d.x).toBeGreaterThan(t.x + t.width);
    expect(d.y + d.height).toBeGreaterThan(t.y + t.height / 2); // on the same line, right-hand side
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('the date stays today\'s when another day is viewed; ordinals are English', async ({ page }) => {
    await openApp(page, { now: '2026-11-22T10:00:00Z', localState: state({ practicedDate: '2026-11-22' }) });
    await openView(page, 'daily');
    await expect(daily(page).locator('time.daily-date')).toHaveAttribute('datetime', '2026-11-22');
    await expect(daily(page).locator('time.daily-date')).toContainText('22nd');
    await dayChip(page, 'Wed').click();
    await expect(daily(page).locator('time.daily-date')).toHaveAttribute('datetime', '2026-11-22');
    for (const [now, suffix] of [['2026-11-01T10:00:00Z', '1st'], ['2026-11-03T10:00:00Z', '3rd'], ['2026-11-11T10:00:00Z', '11th'], ['2026-11-12T10:00:00Z', '12th']]) {
      await page.clock.setFixedTime(new Date(now));
      await page.reload();
      await openView(page, 'daily');
      await expect(daily(page).locator('.daily-date-long')).toContainText(`November ${suffix}, 2026`);
    }
  });
});

test.describe('count bar', () => {
  test('under the day buttons, full width; the fill follows the ticks', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    const days = await box(daily(page).locator('.daypick'));
    const bar = daily(page).locator('.daily-progress-bar');
    const b = await box(bar);
    expect(b.y).toBeGreaterThan(days.y + days.height);
    expect(Math.abs(b.width - days.width)).toBeLessThan(2);
    const fill = bar.locator('.daily-progress-fill');
    expect(Math.abs((await box(fill)).width - b.width / 4)).toBeLessThan(2);
    await daily(page).locator('button.blkcheck[data-block="focused"]').click();
    await expect(bar).toHaveAttribute('aria-valuenow', '2');
    await expect(bar).toHaveAttribute('aria-valuetext', '2 of 4 practiced');
    await expect.poll(async () => Math.round((await box(daily(page).locator('.daily-progress-fill'))).width - b.width / 2)).toBe(0);
    await expect(daily(page).locator('.daily-progress-fill')).not.toHaveAttribute('style', /.*/);
  });
});

test.describe('Focused block', () => {
  test('"Phase n · Label" sits in the Focused block (Phase 0: Prerequisites), not at the weekend', async ({ page }) => {
    await openApp(page, { localState: state() });
    await openView(page, 'daily');
    await expect(daily(page).locator('.daily-phase')).toHaveCount(1);
    await expect(daily(page).locator('.blk').nth(1).locator('.daily-phase')).toHaveText('Phase 1 · Beginner');
    await dayChip(page, 'Sun').click();
    await expect(daily(page).locator('.daily-phase')).toHaveCount(0);
  });

  test('Phase 0 and Phase 2 labels', async ({ page }) => {
    await openApp(page, { localState: baseState({ phaseIndex: 0 }) });
    await openView(page, 'daily');
    await expect(daily(page).locator('.blk').first().locator('.daily-phase')).toHaveText('Phase 0 · Setup');
    await page.evaluate(() => localStorage.setItem('shredRoadmapState_v10', JSON.stringify({ ...JSON.parse(localStorage.getItem('shredRoadmapState_v10')), phaseIndex: 2 })));
    await page.reload();
    await openView(page, 'daily');
    await expect(daily(page).locator('.blk').nth(1).locator('.daily-phase')).toHaveText('Phase 2 · Intermediate');
  });
});

test.describe('Phase test line (Friday)', () => {
  test('label, count and one dot per category from the real levels', async ({ page }) => {
    const monitor = await openApp(page, { now: FRIDAY, localState: friday() });
    await openView(page, 'daily');
    const line = daily(page).locator('.blk').nth(1).locator('.daily-ptest');
    await expect(line.locator('.daily-ptest-label')).toHaveText('Phase Transition Test');
    await expect(line.locator('.daily-ptest-count')).toContainText('2 of 6');
    await expect(line.locator('.daily-ptest-count')).toContainText('at Level 2+');
    const dots = line.locator('.daily-ptest-dot');
    await expect(dots).toHaveCount(6);
    await expect(line.locator('.daily-ptest-dot.on')).toHaveCount(2);
    await expect(line.locator('.daily-ptest-dot[data-cat="alt"]')).toHaveClass(/\bon\b/);
    await expect(line.locator('.daily-ptest-dot[data-cat="sweep"]')).toHaveClass(/\bon\b/);
    await expect(line.locator('.daily-ptest-dot[data-cat="legato"]')).not.toHaveClass(/\bon\b/);
    await expect(line.locator('.daily-ptest-dots')).toHaveAttribute('role', 'img');
    await expect(line.locator('.daily-ptest-dots')).toHaveAttribute('aria-label', '2 of 6 categories at Level 2 or higher: Alternate Picking, Sweep Picking');
    await expect(line.locator('button.daily-ptest-link')).toHaveText('Open Phase test');
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('one row on desktop; stacked on the phone (label, count with dots, link)', async ({ page }, testInfo) => {
    await openApp(page, { now: FRIDAY, localState: friday() });
    await openView(page, 'daily');
    const line = daily(page).locator('.daily-ptest');
    const label = await box(line.locator('.daily-ptest-label'));
    const count = await box(line.locator('.daily-ptest-count'));
    const dots = await box(line.locator('.daily-ptest-dots'));
    const link = await box(line.locator('.daily-ptest-link'));
    if (isPhone(testInfo)) {
      await expect(line.locator('.daily-ptest-count')).toHaveText('2 of 6 at Level 2+', { useInnerText: true });
      expect(count.y).toBeGreaterThan(label.y + label.height - 1);
      expect(Math.abs((dots.y + dots.height / 2) - (count.y + count.height / 2))).toBeLessThan(4);
      expect(dots.x).toBeGreaterThan(count.x + count.width);
      expect(link.y).toBeGreaterThanOrEqual(count.y + count.height);
      expect(Math.round(link.height)).toBeGreaterThanOrEqual(44);
    } else {
      await expect(line.locator('.daily-ptest-count')).toHaveText('2 of 6 categories at Level 2+', { useInnerText: true });
      expect(dots.x).toBeGreaterThan(count.x + count.width);
      expect(link.x).toBeGreaterThan(dots.x + dots.width);
      expect(Math.abs((link.y + link.height / 2) - (dots.y + dots.height / 2))).toBeLessThan(4);
      expect(Math.round(link.height)).toBeGreaterThanOrEqual(40);
    }
  });

  test('without the BHGS pack the line stays, without the link', async ({ page }) => {
    await openApp(page, { bhgsPack: false, now: FRIDAY, localState: friday() });
    await openView(page, 'daily');
    await expect(daily(page).locator('.daily-ptest')).toHaveCount(1);
    await expect(daily(page).locator('.daily-ptest-link')).toHaveCount(0);
  });
});

test.describe('buttons', () => {
  test('Mastered / Watched as in LIBRARY: 8 px corners, green / blue when marked, 40 px (phone 44 px)', async ({ page }, testInfo) => {
    await openApp(page, { now: MONDAY, localState: baseState({ phaseIndex: 1, practicedDate: '2026-11-09',
      checks: { 'p1.c.0': '2026-11-09', 'p1.e.0': '2026-11-09' } }) });
    await openView(page, 'daily');
    const min = isPhone(testInfo) ? 44 : 40;
    const watched = daily(page).locator('.mbtn.blue.on[data-key="p1.c.0"]');
    const mastered = daily(page).locator('.mbtn.on[data-key="p1.e.0"]');
    const plain = daily(page).locator('.mbtn:not(.on)').first();
    await expect(watched).toHaveText('✓ Watched');
    await expect(watched).toHaveCSS('color', 'rgb(109, 184, 247)');
    await expect(mastered).toHaveText('✓ Mastered');
    await expect(mastered).toHaveCSS('color', 'rgb(134, 210, 148)');
    for (const b of [watched, mastered, plain]) {
      await expect(b).toHaveCSS('border-top-left-radius', '8px');
      await expect(b).toHaveCSS('font-weight', '700');
      expect(Math.round((await box(b)).height)).toBeGreaterThanOrEqual(min);
    }
    await expect(plain).toHaveCSS('background-color', 'rgb(30, 30, 35)'); // --card2, as LIBRARY
  });

  test('TECHNIQUE Mastered / Watched buttons are 40 px tall (phone 44 px)', async ({ page }, testInfo) => {
    await openApp(page, { localState: state() });
    await openView(page, 'technique');
    const btns = page.locator('#panel-technique .mbtn:visible');
    expect(await btns.count()).toBeGreaterThan(0);
    const min = isPhone(testInfo) ? 44 : 40;
    for (const b of (await btns.all()).slice(0, 4)) expect(Math.round((await box(b)).height)).toBeGreaterThanOrEqual(min);
  });

  test('no DAILY button ends with punctuation, on any day', async ({ page }) => {
    await openApp(page, { now: FRIDAY, localState: friday() });
    await openView(page, 'daily');
    for (const d of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      await dayChip(page, d).click();
      const texts = await daily(page).locator('button, a.dc-btn').evaluateAll((els) => els.map((e) => e.textContent.trim()).filter(Boolean));
      for (const t of texts) expect(t, `${d}: "${t}"`).not.toMatch(/[.…!?:;,→]$/);
    }
    await dayChip(page, 'Thu').click();
    await expect(daily(page).locator('[data-action="activateday"]')).toHaveText('Switch to Thursday instead');
  });
});

test('viewing days, the header and the Phase test line writes nothing', async ({ page }) => {
  await openApp(page, { now: FRIDAY, localState: friday() });
  await openView(page, 'daily');
  await settle(page);
  const before = await localSaved(page);
  for (const d of ['Mon', 'Wed', 'Sat', 'Fri']) await dayChip(page, d).click();
  await settle(page);
  expect(await localSaved(page)).toEqual(before);
});
