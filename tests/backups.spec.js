// Phase 3, slice 3.1 (DECISIONS D101): schemaVersion and automatic on-device backups.
// - Data without schemaVersion is version 0; migration 0 -> 1 only adds the field, after a backup.
// - Backups live under their own localStorage key (last 20); one "daily" snapshot per local day.
// - If a backup cannot be written, no migration happens and the app works as before.
// - Backups never go to the cloud; the cloud path and the main localStorage key are unchanged.
const { test, expect } = require('@playwright/test');
const { openApp, cloudWrites, localSaved, settle, unexpectedConsoleErrors, STORAGE_KEY } = require('./support/app');
const { TEST_USER, USER_DOC, baseState, progressState } = require('./support/fixtures');

const BACKUP_KEY = 'shredRoadmapBackups_v1';

const altPlus = (page) => page.locator('#panel-home [data-action="test"][data-t="alt"][data-d="1"]');
const altLevel = (page) => altPlus(page).locator('xpath=preceding-sibling::div[contains(@class,"lvl")]');

async function backups(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), BACKUP_KEY);
}

/** Puts a raw value under the backup key before the app's first start (not again on reload). */
async function seedBackups(page, raw) {
  await page.addInitScript(
    ({ key, raw }) => {
      if (!sessionStorage.getItem('__shredBackupSeeded')) {
        localStorage.setItem(key, raw);
        sessionStorage.setItem('__shredBackupSeeded', '1');
      }
    },
    { key: BACKUP_KEY, raw }
  );
}

/** Makes every write to the backup key fail, as when the device storage is full. */
async function breakBackupWrites(page) {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === key) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      return original.call(this, k, v);
    };
  }, BACKUP_KEY);
}

test.describe('schemaVersion migration (signed out)', () => {
  test('saved data without schemaVersion becomes version 1, with every field kept and a backup first', async ({ page }) => {
    const original = progressState({ futureField: { keep: 'me' } });
    const monitor = await openApp(page, { localState: original });

    await expect(altLevel(page)).toHaveText('3/5');
    // A real change makes the app save, so the stored copy shows the migrated state.
    await altPlus(page).click();
    const after = await localSaved(page);
    expect(after.schemaVersion).toBe(1);
    expect(after.futureField).toEqual({ keep: 'me' });
    expect(after.streakDates).toEqual(original.streakDates);
    expect(after.checks).toEqual(original.checks);
    expect(after.improvChecks).toEqual(original.improvChecks);
    expect(after.dojo).toEqual(original.dojo);
    expect(after.setupGuitar).toBe('epi');
    expect(after.testLevel.alt).toBe(4);

    const list = await backups(page);
    const migration = list.filter((b) => b.reason === 'migration');
    expect(migration).toHaveLength(1);
    expect(migration[0].schemaVersion).toBe(0);
    expect(migration[0].state).toEqual(original); // exactly what was stored before
    expect(list[0].reason).toBe('migration'); // taken before the daily snapshot
    expect(typeof migration[0].at).toBe('string');

    expect(await cloudWrites(page)).toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('the migration runs once: a reload makes no new migration backup', async ({ page }) => {
    await openApp(page, { localState: progressState() });
    await altPlus(page).click();
    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    await altPlus(page).click();
    const list = await backups(page);
    expect(list.filter((b) => b.reason === 'migration')).toHaveLength(1);
    expect((await localSaved(page)).schemaVersion).toBe(1);
  });

  test('a new device starts at version 1 with no migration backup', async ({ page }) => {
    await openApp(page);
    await altPlus(page).click();
    expect((await localSaved(page)).schemaVersion).toBe(1);
    const list = await backups(page);
    expect(list.filter((b) => b.reason === 'migration')).toHaveLength(0);
    expect(list.filter((b) => b.reason === 'daily')).toHaveLength(1);
  });

  test('data with a newer schemaVersion is left exactly as it is: no migration, no backup, nothing saved (slice 3.4, D105)', async ({ page }) => {
    const newer = progressState({ schemaVersion: 2, laterField: [1, 2] });
    await openApp(page, { localState: newer });
    await expect(altLevel(page)).toHaveText('3/5');
    await expect(page.locator('#toast')).toHaveText('Your progress was saved by a newer version of the app. Reload the page to update.');
    expect(await backups(page)).toBeNull(); // D105 point 7: this app writes nothing over newer data
    await altPlus(page).click();
    const saved = await localSaved(page);
    expect(saved).toEqual(newer);
  });
});

test.describe('daily backups', () => {
  test('one daily snapshot of the loaded state on the first start of the day, none on later starts', async ({ page }) => {
    const original = progressState({ schemaVersion: 1 });
    await openApp(page, { localState: original });
    let list = await backups(page);
    expect(list).toHaveLength(1);
    expect(list[0].reason).toBe('daily');
    expect(list[0].schemaVersion).toBe(1);
    expect(list[0].state.testLevel).toEqual(original.testLevel);
    expect(list[0].state.streakDates).toEqual(original.streakDates);

    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    list = await backups(page);
    expect(list).toHaveLength(1);
  });

  test('the next day gets its own daily snapshot', async ({ page }) => {
    await openApp(page, { localState: progressState({ schemaVersion: 1 }) });
    await page.clock.setFixedTime(new Date('2026-11-11T12:00:00Z'));
    await page.reload();
    await expect(page.locator('#splash')).toHaveCount(0);
    const list = await backups(page);
    expect(list.map((b) => b.reason)).toEqual(['daily', 'daily']);
    expect(list[0].at.slice(0, 10)).toBe('2026-11-10');
    expect(list[1].at.slice(0, 10)).toBe('2026-11-11');
  });

  test('at most 20 backups are kept; the oldest are dropped first', async ({ page }) => {
    const old = Array.from({ length: 20 }, (_, i) => ({
      at: `2026-10-${String(i + 1).padStart(2, '0')}T08:00:00.000Z`,
      reason: 'daily',
      schemaVersion: 1,
      state: { marker: i },
    }));
    await seedBackups(page, JSON.stringify(old));
    await openApp(page, { localState: progressState({ schemaVersion: 1 }) });
    const list = await backups(page);
    expect(list).toHaveLength(20);
    expect(list[0].state.marker).toBe(1); // marker 0 (oldest) was dropped
    expect(list[18].state.marker).toBe(19);
    expect(list[19].at.slice(0, 10)).toBe('2026-11-10');
  });
});

test.describe('when a backup cannot be written', () => {
  test('device storage full: no migration, progress kept, app works and keeps saving', async ({ page }) => {
    await breakBackupWrites(page);
    const original = progressState({ futureField: 'x' });
    const monitor = await openApp(page, { localState: original });

    await expect(altLevel(page)).toHaveText('3/5');
    await altPlus(page).click();
    await expect(altLevel(page)).toHaveText('4/5');
    const saved = await localSaved(page);
    expect(saved.schemaVersion).toBeUndefined(); // migration skipped
    expect(saved.futureField).toBe('x');
    expect(saved.streakDates).toEqual(original.streakDates);
    expect(saved.testLevel.alt).toBe(4);
    expect(await backups(page)).toBeNull();
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });

  test('an unreadable backup list is never overwritten, and no migration happens', async ({ page }) => {
    await seedBackups(page, '{not json');
    const monitor = await openApp(page, { localState: progressState() });
    await altPlus(page).click();
    expect(await page.evaluate((key) => localStorage.getItem(key), BACKUP_KEY)).toBe('{not json');
    const saved = await localSaved(page);
    expect(saved.schemaVersion).toBeUndefined();
    expect(saved.testLevel.alt).toBe(4);
    expect(monitor.pageErrors).toEqual([]);
  });
});

test.describe('signed in', () => {
  test('cloud data without schemaVersion is migrated on sign-in (backup first); writes go only to users/{uid} and carry no backups', async ({ page }) => {
    const cloud = progressState({ cloudOnly: 'kept' });
    const monitor = await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: cloud } });
    await settle(page);

    const list = await backups(page);
    const migration = list.filter((b) => b.reason === 'migration');
    expect(migration).toHaveLength(1);
    expect(migration[0].state).toEqual(cloud); // the cloud copy, as it was
    expect((await localSaved(page)).schemaVersion).toBe(1);

    await altPlus(page).click();
    const writes = await cloudWrites(page);
    expect(writes.length).toBeGreaterThan(0);
    for (const w of writes) {
      expect(w.path).toBe(USER_DOC);
      expect(JSON.stringify(w.data)).not.toContain('"reason":"migration"');
      expect(JSON.stringify(w.data)).not.toContain('"reason":"daily"');
    }
    const last = writes[writes.length - 1].data;
    expect(last.schemaVersion).toBe(1);
    expect(last.cloudOnly).toBe('kept');
    expect(last.testLevel.alt).toBe(4);
    expect(last.streakDates).toEqual(cloud.streakDates);
    expect(monitor.firebaseBackendRequests).toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
  });

  test('manual "Load from cloud" migrates cloud data the same way', async ({ page }) => {
    await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: progressState({ schemaVersion: 1 }) } });
    await settle(page);
    expect((await backups(page)).filter((b) => b.reason === 'migration')).toHaveLength(0);

    // Another device (still on an older app version) wrote the cloud copy without schemaVersion.
    await page.evaluate((path) => {
      delete window.__SHRED_TEST__.docs[path].schemaVersion;
      window.__SHRED_TEST__.docs[path].testLevel.alt = 5;
    }, USER_DOC);
    await page.locator('#panel-home [data-action="cloudload"]').click();
    await expect(page.locator('#toast')).toHaveText('Progress loaded from cloud!');
    await expect(altLevel(page)).toHaveText('5/5');

    const saved = await localSaved(page);
    expect(saved.schemaVersion).toBe(1);
    expect(saved.testLevel.alt).toBe(5);
    const migration = (await backups(page)).filter((b) => b.reason === 'migration');
    expect(migration).toHaveLength(1);
    expect(migration[0].state.testLevel.alt).toBe(5);
  });

  test('the main localStorage key is unchanged', async ({ page }) => {
    await openApp(page, { localState: baseState() });
    await altPlus(page).click();
    const keys = await page.evaluate(() => Object.keys(localStorage).sort());
    expect(keys).toEqual([BACKUP_KEY, STORAGE_KEY].sort());
  });
});
