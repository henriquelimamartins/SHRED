// Phase 3, slice 3.8 (DECISIONS D110): Download backup / Restore backup (Home, card "Cloud Sync").
// - Download: a JSON file with the current state and the on-device snapshots; changes nothing.
// - Restore: an on-device snapshot or a file. The chosen copy replaces progress, but streak and
//   calendar days are the union of both (owner's choice A), today's DAILY session and syncRev stay,
//   and fields only in the current state are kept.
// - Same safety order as Reset (D106): newer-version stop, cloud read first when signed in,
//   backup of the current state first, then a checked cloud write (D105).
const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { TEST_USER, USER_DOC, progressState, baseState } = require('./support/fixtures');

test.use({ timezoneId: 'Europe/Lisbon' });

const BACKUP_KEY = 'shredRoadmapBackups_v1';
const INVALID = 'This file is not a SHRED Roadmap backup. Nothing was restored.';
const NEWER_COPY = 'This backup was made by a newer version of the app. Reload the page to update.';
const NEWER_LOCAL = 'Your progress was saved by a newer version of the app. Reload the page to update.';
const STILL_LOADING = 'Cloud progress is still loading. Try again in a moment.';
const RESTORED_FILE = 'Progress restored from the file. Your previous progress was backed up on this device.';

const home = (page) => page.locator('#panel-home');
const toast = (page) => page.locator('#toast');
const backups = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), BACKUP_KEY);
const setBackups = (page, list) => page.evaluate(([key, l]) => localStorage.setItem(key, typeof l === 'string' ? l : JSON.stringify(l)), [BACKUP_KEY, list]);
const cloudDoc = (page) => page.evaluate((path) => window.__SHRED_TEST__.docs[path], USER_DOC);

async function setFlags(page, flags) {
  await page.addInitScript((f) => { window.__SHRED_TEST_FLAGS__ = Object.assign({}, f); }, flags);
}

/** Current progress on the device (test clock: Tue 2026-11-10), with today's DAILY session. */
function currentState(overrides = {}) {
  return progressState({
    schemaVersion: 1,
    phaseIndex: 1,
    checks: { 'p1.c.0': '2026-11-09' },
    practiced: { 'warmup.Tue': true },
    practicedDate: '2026-11-10',
    congratsDate: '2026-11-10',
    activeDayOverride: 'Sat',
    activeDayDate: '2026-11-10',
    streakDates: ['2026-11-08', '2026-11-09', '2026-11-10'],
    onlyNow: { keep: 'me' },
    ...overrides,
  });
}

/** An older copy with different progress, an older DAILY session and its own unknown field. */
function olderCopy(overrides = {}) {
  return progressState({
    schemaVersion: 1,
    phaseIndex: 2,
    chop: { alt: 7, sweep: 5, legato: 6, econ: 4, tap: 3 },
    checks: { 'p2.e.1': '2026-11-01', 'theory.3': '2026-11-02' },
    improvIndex: 2,
    improvChecks: { g0e0: true, g1e2: true },
    practiced: { 'warmup.Thu': true },
    practicedDate: '2026-11-05',
    congratsDate: null,
    activeDayOverride: null,
    activeDayDate: null,
    streakDates: ['2026-11-01', '2026-11-05', '2026-11-08'],
    setupGuitar: 'prs',
    setupTuning: 'e_std',
    syncRev: 2,
    onlyThen: 42,
    ...overrides,
  });
}

/** What a restore of olderCopy() over currentState() must give (D110 point 4). */
function expectedRestore(cur = currentState(), copy = olderCopy()) {
  const out = { ...cur, ...copy };
  out.streakDates = [...new Set([...cur.streakDates, ...copy.streakDates])].sort();
  for (const f of ['practiced', 'practicedDate', 'congratsDate', 'activeDayOverride', 'activeDayDate']) out[f] = cur[f];
  if ('syncRev' in cur) out.syncRev = cur.syncRev; else delete out.syncRev;
  return out;
}

const SNAPSHOTS = [
  { at: '2026-11-05T09:00:00Z', reason: 'daily', schemaVersion: 1, state: olderCopy() },
  { at: '2026-11-08T23:30:00Z', reason: 'before-cloud-sync', schemaVersion: 1, state: olderCopy({ phaseIndex: 3 }) },
  { at: '2026-11-09T10:05:00Z', reason: 'before-stale-replace', schemaVersion: 1, state: olderCopy({ phaseIndex: 4 }) },
];

async function openRestore(page) {
  await home(page).locator('[data-action="openrestore"]').click();
}

async function restoreFromFile(page, name, content) {
  await openRestore(page);
  const chooser = page.waitForEvent('filechooser');
  await home(page).locator('[data-action="pickrestorefile"]').click();
  await (await chooser).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(content) });
}

test.describe('Home buttons', () => {
  test('Download backup and Restore backup sit in the Cloud Sync card next to Save, Load and Reset', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    const card = home(page).locator('.card', { has: page.locator('[data-action="cloudsave"]') });
    await expect(card.locator('[data-action="downloadbackup"]')).toHaveText(/Download backup/);
    await expect(card.locator('[data-action="openrestore"]')).toHaveText(/Restore backup/);
    await expect(card.locator('[data-action="cloudload"]')).toBeVisible();
    await expect(card.locator('[data-action="reset"]')).toBeVisible();
  });
});

test.describe('download', () => {
  test('saves a dated file with the state and the on-device snapshots, and changes nothing', async ({ page }) => {
    const monitor = await openApp(page, { localState: currentState() });
    await setBackups(page, SNAPSHOTS);
    const before = await localSaved(page);
    const downloadP = page.waitForEvent('download');
    await home(page).locator('[data-action="downloadbackup"]').click();
    const download = await downloadP;
    expect(download.suggestedFilename()).toBe('shred-roadmap-backup-2026-11-10.json');
    const file = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    expect(file.app).toBe('shred-roadmap');
    expect(file.kind).toBe('backup');
    expect(file.exportedAt).toBe('2026-11-10T12:00:00.000Z');
    expect(file.schemaVersion).toBe(1);
    expect(file.state).toEqual(before);
    expect(file.backups).toEqual(SNAPSHOTS);
    await expect(toast(page)).toHaveText('Backup downloaded.');
    expect(await localSaved(page)).toEqual(before);
    expect(await backups(page)).toEqual(SNAPSHOTS);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('signed in: no cloud write and no sign-in data in the file', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: currentState({ syncRev: 3 }) } });
    await settle(page);
    const writesBefore = (await cloudWrites(page)).length;
    const downloadP = page.waitForEvent('download');
    await home(page).locator('[data-action="downloadbackup"]').click();
    const text = fs.readFileSync(await (await downloadP).path(), 'utf8');
    expect(text).not.toContain(TEST_USER.uid);
    expect(text).not.toContain(TEST_USER.email);
    expect(JSON.parse(text).state.syncRev).toBe(3);
    await settle(page);
    expect((await cloudWrites(page)).length).toBe(writesBefore);
  });

  test('works even when the progress was saved by a newer app version (nothing is written)', async ({ page }) => {
    await openApp(page, { localState: currentState({ schemaVersion: 99 }) });
    const downloadP = page.waitForEvent('download');
    await home(page).locator('[data-action="downloadbackup"]').click();
    const file = JSON.parse(fs.readFileSync(await (await downloadP).path(), 'utf8'));
    expect(file.state.schemaVersion).toBe(99);
    expect((await localSaved(page)).schemaVersion).toBe(99);
  });
});

test.describe('restore list', () => {
  test('lists the on-device snapshots newest first, with local date, time and reason; Cancel closes it', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await setBackups(page, SNAPSHOTS);
    await openRestore(page);
    const rows = home(page).locator('[data-action="pickrestore"]');
    await expect(rows).toHaveText([
      '9 Nov 2026, 10:05 · Before newer progress from another device',
      '8 Nov 2026, 23:30 · Before cloud sync',
      '5 Nov 2026, 09:00 · Daily backup',
    ]);
    await expect(home(page).locator('[data-action="downloadbackup"]')).toHaveCount(0);
    await home(page).locator('[data-action="cancelrestore"]').click();
    await expect(rows).toHaveCount(0);
    await expect(home(page).locator('[data-action="openrestore"]')).toBeVisible();
    expect(await localSaved(page)).toEqual(currentState());
  });

  test('says so when there are no backups on this device', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await setBackups(page, []);
    await openRestore(page);
    await expect(home(page)).toContainText('No backups on this device yet.');
    await expect(home(page).locator('[data-action="pickrestorefile"]')).toBeVisible();
  });
});

test.describe('restore from this device (signed out)', () => {
  test('confirmation names the copy; Cancel changes nothing', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await setBackups(page, SNAPSHOTS);
    await openRestore(page);
    await home(page).locator('[data-action="pickrestore"][data-index="0"]').click();
    await expect(home(page)).toContainText('Restore progress from 5 Nov 2026, 09:00? (Daily backup) Your current progress is replaced by this copy. Streak and calendar days from both are kept, and so is today\'s DAILY session. A backup of your current progress is saved on this device first.');
    await expect(home(page).locator('[data-action="confirmrestore"]')).toHaveText('Yes, restore');
    await home(page).locator('[data-action="cancelrestore"]').click();
    expect(await localSaved(page)).toEqual(currentState());
    expect(await backups(page)).toEqual(SNAPSHOTS);
  });

  test('takes the copy, joins the streak days, keeps today\'s DAILY session and fields only in the current state', async ({ page }) => {
    const monitor = await openApp(page, { localState: currentState() });
    await setBackups(page, SNAPSHOTS);
    await openRestore(page);
    await home(page).locator('[data-action="pickrestore"][data-index="0"]').click();
    await home(page).locator('[data-action="confirmrestore"]').click();
    await expect(toast(page)).toHaveText('Progress restored from 5 Nov 2026, 09:00. Your previous progress was backed up on this device.');
    const saved = await localSaved(page);
    expect(saved).toEqual(expectedRestore());
    expect(saved.streakDates).toEqual(['2026-11-01', '2026-11-05', '2026-11-08', '2026-11-09', '2026-11-10']);
    expect(saved.syncRev).toBeUndefined(); // the current state had none; the copy's old one is not taken
    // The panel is closed and the app shows the restored progress.
    await expect(home(page).locator('[data-action="openrestore"]')).toBeVisible();
    await expect(home(page).locator('.bignum').nth(1)).toHaveText(/5$/); // Days Logged
    // The previous progress is in a new backup.
    const list = await backups(page);
    expect(list).toHaveLength(SNAPSHOTS.length + 1);
    expect(list[list.length - 1].reason).toBe('before-restore');
    expect(list[list.length - 1].state).toEqual(currentState());
    // Kept after a reload.
    await page.reload();
    await settle(page);
    expect(await localSaved(page)).toEqual(expectedRestore());
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('a restore can be undone with the "Before restore" backup', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await setBackups(page, SNAPSHOTS);
    await openRestore(page);
    await home(page).locator('[data-action="pickrestore"][data-index="2"]').click();
    await home(page).locator('[data-action="confirmrestore"]').click();
    expect((await localSaved(page)).phaseIndex).toBe(4);
    await openRestore(page);
    const first = home(page).locator('[data-action="pickrestore"]').first();
    await expect(first).toHaveText('10 Nov 2026, 12:00 · Before restore');
    await first.click();
    await home(page).locator('[data-action="confirmrestore"]').click();
    const saved = await localSaved(page);
    expect(saved.phaseIndex).toBe(1);
    expect(saved.checks).toEqual(currentState().checks);
    expect(saved.chop).toEqual(currentState().chop);
  });
});

test.describe('restore from a file', () => {
  test('a file made by Download backup', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    const file = { app: 'shred-roadmap', kind: 'backup', exportedAt: '2026-11-03T18:45:00Z', schemaVersion: 1, state: olderCopy(), backups: [] };
    await restoreFromFile(page, 'shred-roadmap-backup-2026-11-03.json', JSON.stringify(file));
    await expect(home(page)).toContainText('Restore progress from 3 Nov 2026, 18:45? (File shred-roadmap-backup-2026-11-03.json)');
    await home(page).locator('[data-action="confirmrestore"]').click();
    await expect(toast(page)).toHaveText('Progress restored from 3 Nov 2026, 18:45. Your previous progress was backed up on this device.');
    expect(await localSaved(page)).toEqual(expectedRestore());
    // The previous progress is safe: here the day's "daily" snapshot already holds it, so no
    // second copy is added (D102: no backup when nothing would be lost).
    const list = await backups(page);
    expect(list[list.length - 1].state).toEqual(currentState());
  });

  test('a bare state file from before Phase 3 (no schemaVersion) is restored and brought to version 1', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    const old = olderCopy();
    delete old.schemaVersion;
    delete old.syncRev;
    await restoreFromFile(page, 'my-backup.json', JSON.stringify(old));
    await expect(home(page)).toContainText('Restore progress from the file? (File my-backup.json)');
    await home(page).locator('[data-action="confirmrestore"]').click();
    await expect(toast(page)).toHaveText(RESTORED_FILE);
    const saved = await localSaved(page);
    expect(saved.schemaVersion).toBe(1);
    expect(saved.phaseIndex).toBe(2);
    expect(saved.onlyThen).toBe(42);
    expect(saved.onlyNow).toEqual({ keep: 'me' });
  });

  test('an export of the localStorage key (state as JSON text)', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await restoreFromFile(page, 'export.json', JSON.stringify({ [STORAGE_KEY]: JSON.stringify(olderCopy()) }));
    await home(page).locator('[data-action="confirmrestore"]').click();
    expect(await localSaved(page)).toEqual(expectedRestore());
  });

  test('missing app fields get their defaults, so every view still opens', async ({ page }) => {
    const monitor = await openApp(page, { localState: currentState() });
    await restoreFromFile(page, 'partial.json', JSON.stringify({ phaseIndex: 2, checks: { 'p2.e.0': '2026-11-01' } }));
    await home(page).locator('[data-action="confirmrestore"]').click();
    const saved = await localSaved(page);
    expect(saved.phaseIndex).toBe(2);
    expect(saved.checks).toEqual({ 'p2.e.0': '2026-11-01' });
    expect(saved.chop).toEqual(currentState().chop); // not in the file: kept from the current state
    expect(saved.streakDates).toEqual(currentState().streakDates);
    for (const view of ['daily', 'improv', 'library', 'setup', 'home']) {
      await page.locator(`[data-action="go"][data-view="${view}"]:visible`).first().click();
      await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
    }
    expect(monitor.pageErrors).toEqual([]);
  });

  for (const [label, content] of [
    ['not JSON', 'hello'],
    ['a JSON list', '[1,2,3]'],
    ['another JSON object', '{"name":"something else","items":[1]}'],
    ['a download-shaped file without a state', '{"app":"shred-roadmap","kind":"backup","state":null}'],
  ]) {
    test(`refused: ${label}; nothing changes`, async ({ page }) => {
      await openApp(page, { localState: currentState() });
      await setBackups(page, SNAPSHOTS);
      await restoreFromFile(page, 'bad.json', content);
      await expect(toast(page)).toHaveText(INVALID);
      await expect(home(page).locator('[data-action="confirmrestore"]')).toHaveCount(0);
      expect(await localSaved(page)).toEqual(currentState());
      expect(await backups(page)).toEqual(SNAPSHOTS);
    });
  }

  test('a copy made by a newer app version is refused', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await restoreFromFile(page, 'newer.json', JSON.stringify(olderCopy({ schemaVersion: 2 })));
    await expect(toast(page)).toHaveText(NEWER_COPY);
    await expect(home(page).locator('[data-action="confirmrestore"]')).toHaveCount(0);
    expect(await localSaved(page)).toEqual(currentState());
  });
});

test.describe('safety', () => {
  test('no restore when the current progress cannot be backed up', async ({ page }) => {
    await openApp(page, { localState: currentState() });
    await setBackups(page, '{"not":"a list"}'); // unreadable backup list: nothing can be added to it
    await restoreFromFile(page, 'ok.json', JSON.stringify(olderCopy()));
    await home(page).locator('[data-action="confirmrestore"]').click();
    await expect(toast(page)).toHaveText('Could not back up your progress. Nothing was restored.');
    expect(await localSaved(page)).toEqual(currentState());
  });

  test('progress saved by a newer app version: restore refused, nothing written', async ({ page }) => {
    await openApp(page, { localState: currentState({ schemaVersion: 99 }) });
    await restoreFromFile(page, 'ok.json', JSON.stringify(olderCopy()));
    await home(page).locator('[data-action="confirmrestore"]').click();
    await expect(toast(page)).toHaveText(NEWER_LOCAL);
    expect(await localSaved(page)).toEqual(currentState({ schemaVersion: 99 }));
  });
});

test.describe('signed in', () => {
  test('refused while the first cloud read is still running; nothing changes', async ({ page }) => {
    await setFlags(page, { holdGetDoc: true });
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: currentState() }, localState: currentState() });
    await setBackups(page, SNAPSHOTS);
    await openRestore(page);
    await home(page).locator('[data-action="pickrestore"][data-index="0"]').click();
    await home(page).locator('[data-action="confirmrestore"]').click();
    await expect(toast(page)).toHaveText(STILL_LOADING);
    await settle(page);
    expect(await localSaved(page)).toEqual(currentState());
    expect(await cloudWrites(page)).toEqual([]);
    expect(await backups(page)).toEqual(SNAPSHOTS);
  });

  test('after the read, the restored progress goes to the cloud as a checked write (syncRev + 1)', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: currentState({ syncRev: 4 }) } });
    await settle(page);
    await setBackups(page, SNAPSHOTS);
    await openRestore(page);
    await home(page).locator('[data-action="pickrestore"][data-index="0"]').click();
    await home(page).locator('[data-action="confirmrestore"]').click();
    await settle(page);
    const cloud = await cloudDoc(page);
    const expected = expectedRestore(currentState({ syncRev: 4 }));
    expect(cloud).toEqual({ ...expected, syncRev: 5 });
    expect(await localSaved(page)).toEqual({ ...expected, syncRev: 5 });
  });

  test('if another device saved meanwhile, the newer cloud copy wins (D105) and the restore is kept in a backup', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: currentState({ syncRev: 4 }) } });
    await settle(page);
    await setBackups(page, SNAPSHOTS);
    // Another device saves while this one stays open (no return to the page, so no refresh).
    await page.evaluate((path) => { const d = window.__SHRED_TEST__.docs[path]; d.syncRev = 5; d.phaseIndex = 0; }, USER_DOC);
    await openRestore(page);
    await home(page).locator('[data-action="pickrestore"][data-index="0"]').click();
    await home(page).locator('[data-action="confirmrestore"]').click();
    await settle(page);
    const saved = await localSaved(page);
    expect(saved.syncRev).toBe(5);
    expect(saved.phaseIndex).toBe(0);
    const list = await backups(page);
    expect(list[list.length - 1].reason).toBe('before-stale-replace');
    expect(list[list.length - 1].state.phaseIndex).toBe(2);
  });
});
