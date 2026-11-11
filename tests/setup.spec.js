// Phase 1.5: SETUP companion as it behaves on main TODAY. SETUP is protected (project rules):
// the stored choices (setupGuitar, setupTuning) and the measurements shown must not change silently.
// Tests named "current behaviour:" document known problems on purpose.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

const setup = (page) => page.locator('#panel-setup');
const guitarSelect = (page) => setup(page).locator('select[data-action="setGuitar"]');
const tuningSelect = (page) => setup(page).locator('select[data-action="setTuning"]');

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  await nav.locator(`[data-action="go"][data-view="${view}"]`).click();
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

/** The "Recommended Measurements" table as { Adjustment: Target }. */
async function measurements(page) {
  const rows = setup(page).locator('.card', { hasText: 'Recommended Measurements' }).locator('tr');
  const out = {};
  for (const r of await rows.all()) {
    const cells = await r.locator('td').allTextContents();
    if (cells.length === 2) out[cells[0]] = cells[1];
  }
  return out;
}

const stepTitles = (page) => setup(page).locator('.card h3').allTextContents();

test('default: PRS, E Standard, 8 steps including the tremolo float', async ({ page }, testInfo) => {
  const monitor = await openApp(page);
  await goTo(page, 'setup');
  await expect(guitarSelect(page)).toHaveValue('prs');
  await expect(tuningSelect(page)).toHaveValue('e_std');
  // Offered tunings on main (D63 limits the product to Standard and Drop D; a later phase decides).
  expect(await tuningSelect(page).locator('option').allTextContents())
    .toEqual(['E Standard', 'Drop D', 'D Standard', 'Drop C', 'C Standard', 'DADFAE']);
  expect(await measurements(page)).toEqual({
    'String Gauge': '0.010" - 0.046" (10-46)',
    'Tremolo Float': '1.6 mm (1/16") off body',
    'Neck Relief': '0.15 mm at 8th fret',
    'String Action (Low E)': '1.5 mm at 12th fret',
    'String Action (High E)': '1.1 mm at 12th fret',
    'Pickup Height (Neck)': '2.5 mm to string',
    'Pickup Height (Bridge)': '1.5 mm to string',
  });
  expect(await stepTitles(page)).toEqual([
    'Recommended Measurements', '1. Strip and Clean', '2. Restring and Stretch', '3. Set the Tremolo Float',
    '4. Adjust Neck Relief (Truss Rod)', '5. Lower the String Action', '6. Lubricate the Nut',
    '7. Set Intonation', '8. Adjust Pickup Height',
  ]);
  await expect(setup(page)).toContainText('Fret the highest note (24th fret)');
  await expect(setup(page)).toContainText('1.1 - 1.2 mm at the 12th fret');
  await expect(setup(page).locator('button', { hasText: 'Official PRS Setup Guide' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('setup-prs.png'), fullPage: true });
  expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
});

test('Les Paul: no tremolo row or step, 22nd fret, Les Paul video; choice stored and kept after reload', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'setup');
  await guitarSelect(page).selectOption('epi');
  expect((await localSaved(page)).setupGuitar).toBe('epi');
  const m = await measurements(page);
  expect(m['Tremolo Float']).toBeUndefined();
  expect(m['String Gauge']).toBe('0.010" - 0.048" (10-48)');
  expect(m['Neck Relief']).toBe('0.18 mm at 8th fret');
  expect(m['String Action (Low E)']).toBe('1.6 mm at 12th fret');
  expect(m['String Action (High E)']).toBe('1.2 mm at 12th fret');
  expect(await stepTitles(page)).not.toContain('3. Set the Tremolo Float');
  await expect(setup(page)).toContainText('Fret the highest note (22nd fret)');
  await expect(setup(page)).toContainText('12-inch (305 mm)');
  await expect(setup(page).locator('button', { hasText: 'Epiphone Les Paul Setup Guide' })).toBeVisible();

  await page.reload();
  await goTo(page, 'setup');
  await expect(guitarSelect(page)).toHaveValue('epi');
});

// Every guitar × tuning combination on main: gauge, relief, low E action, high E action.
const TABLE = {
  prs: {
    e_std: ['10-46', 0.15, 1.5, 1.1], drop_d: ['10-52', 0.15, 1.5, 1.1], d_std: ['11-48', 0.18, 1.6, 1.2],
    drop_c: ['11-56', 0.18, 1.6, 1.2], c_std: ['12-56', 0.2, 1.7, 1.3], dadfae: ['10-52', 0.15, 1.5, 1.1],
  },
  epi: {
    e_std: ['10-48', 0.18, 1.6, 1.2], drop_d: ['10-54', 0.18, 1.6, 1.2], d_std: ['11-52', 0.2, 1.7, 1.3],
    drop_c: ['11-56', 0.2, 1.7, 1.3], c_std: ['12-60', 0.22, 1.8, 1.4], dadfae: ['11-54', 0.18, 1.6, 1.2],
  },
};

test('every guitar × tuning shows its own gauge, relief and action; the tuning is stored', async ({ page }) => {
  await openApp(page);
  await goTo(page, 'setup');
  for (const [guitar, tunings] of Object.entries(TABLE)) {
    await guitarSelect(page).selectOption(guitar);
    for (const [tuning, [gauge, relief, bass, treb]] of Object.entries(tunings)) {
      await tuningSelect(page).selectOption(tuning);
      const m = await measurements(page);
      const label = `${guitar} ${tuning}`;
      expect(m['String Gauge'], label).toContain(`(${gauge})`);
      expect(m['Neck Relief'], label).toBe(`${relief} mm at 8th fret`);
      expect(m['String Action (Low E)'], label).toBe(`${bass} mm at 12th fret`);
      expect(m['String Action (High E)'], label).toBe(`${treb} mm at 12th fret`);
      const saved = await localSaved(page);
      expect([saved.setupGuitar, saved.setupTuning]).toEqual([guitar, tuning]);
    }
  }
});

test('saved choices from state are shown on load (Les Paul, Drop D)', async ({ page }) => {
  await openApp(page, { localState: baseState({ setupGuitar: 'epi', setupTuning: 'drop_d' }) });
  await goTo(page, 'setup');
  await expect(guitarSelect(page)).toHaveValue('epi');
  await expect(tuningSelect(page)).toHaveValue('drop_d');
  expect((await measurements(page))['String Gauge']).toBe('0.010" - 0.054" (10-54)');
});

test('changing Setup does not touch progress, streak or other state', async ({ page }) => {
  const before = baseState({ checks: { 'p0.pre.0': '2026-11-01' }, streakDates: ['2026-11-09'], improvChecks: { g0e0: true } });
  await openApp(page, { localState: before });
  await goTo(page, 'setup');
  await tuningSelect(page).selectOption('drop_d');
  const saved = await localSaved(page);
  expect({ ...saved, setupTuning: before.setupTuning }).toEqual(before);
});

test('signed in: a Setup change writes the full state to users/{uid} only', async ({ page }) => {
  await openApp(page, { user: TEST_USER, docs: { [USER_DOC]: baseState() } });
  await goTo(page, 'setup');
  await guitarSelect(page).selectOption('epi');
  const writes = await cloudWrites(page);
  expect(writes.length).toBeGreaterThanOrEqual(1);
  expect(writes.every((w) => w.path === USER_DOC)).toBe(true);
  expect(writes[writes.length - 1].data.setupGuitar).toBe('epi');
});

test('current behaviour: the note always says "E standard tuning on a 25" scale guitar", whatever is chosen', async ({ page }) => {
  await openApp(page, { localState: baseState({ setupGuitar: 'epi', setupTuning: 'drop_d' }) });
  await goTo(page, 'setup');
  await expect(setup(page).locator('.note').first())
    .toContainText('10-54 string gauge with E standard tuning on a 25" scale guitar');
});
