// Phase 1.5: SETUP companion as it behaves on main TODAY. SETUP is protected (project rules):
// the stored choices (setupGuitar, setupTuning) and the measurements shown must not change silently.
// Tests named "current behaviour:" document known problems on purpose.
// Slice 4.8b (D138): the page as drawn. The measurements are tiles ({ label: "value sub" }), the steps a numbered
// list (titles without the number), and the note names the chosen guitar, tuning and scale (its `current behaviour`
// test is replaced by the fixed version). Stored values and every number shown are unchanged.
const { test, expect } = require('@playwright/test');
const { openApp, localSaved, cloudWrites, unexpectedConsoleErrors } = require('./support/app');
const { baseState, TEST_USER, USER_DOC } = require('./support/fixtures');

const setup = (page) => page.locator('#panel-setup');
const guitarSelect = (page) => setup(page).locator('select[data-action="setGuitar"]');
const tuningSelect = (page) => setup(page).locator('select[data-action="setTuning"]');

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  const btn = nav.locator(`[data-action="go"][data-view="${view}"]`);
  // Slice 4.2a (D119): on the phone, Library and Tools (SETUP) are opened from the More sheet.
  if (await btn.count()) await btn.click();
  else {
    await nav.locator('[data-action="more"]').click();
    await page.locator(`#panel-more [data-action="go"][data-view="${view}"]`).first().click();
  }
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

/** The "Recommended Measurements" tiles as { Label: "value sub" }. */
async function measurements(page) {
  return setup(page).locator('.setup-tile').evaluateAll((ts) => Object.fromEntries(ts.map((t) => [
    t.querySelector('.setup-tile-label').textContent,
    t.querySelector('.setup-tile-val').textContent + ' ' + t.querySelector('.setup-tile-sub').textContent,
  ])));
}

const stepTitles = (page) => setup(page).locator('.setup-step-title').allTextContents();

test('default: PRS, E Standard, 7 steps including the tremolo float', async ({ page }, testInfo) => {
  const monitor = await openApp(page);
  await goTo(page, 'setup');
  await expect(guitarSelect(page)).toHaveValue('prs');
  await expect(tuningSelect(page)).toHaveValue('e_std');
  // Offered tunings on main (D63 limits the product to Standard and Drop D; a later phase decides).
  expect(await tuningSelect(page).locator('option').allTextContents())
    .toEqual(['E Standard', 'Drop D', 'D Standard', 'Drop C', 'C Standard', 'DADFAE']);
  expect(await measurements(page)).toEqual({
    'String Gauge': '10-46 0.010" - 0.046"',
    'Tremolo Float': '1.6 mm 1/16" off body',
    'Neck Relief': '0.15 mm at 8th fret',
    'Action · Low E': '1.5 mm at 12th fret',
    'Action · High E': '1.1 mm at 12th fret',
    'Pickup · Neck': '2.5 mm to string',
    'Pickup · Bridge': '1.5 mm to string',
  });
  // Slice 4.8b (D138): step texts rewritten with the owner; nut lubrication joined step 1.
  expect(await stepTitles(page)).toEqual([
    'Remove Strings and Clean', 'Restring and Stretch', 'Set the Tremolo Float',
    'Adjust Neck Relief (Truss Rod)', 'Set the String Action', 'Set Intonation', 'Adjust Pickup Height',
  ]);
  await expect(setup(page)).toContainText('at the last fret (24th)');
  await expect(setup(page)).toContainText('the High E to 1.1 - 1.2 mm');
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
  expect(m['String Gauge']).toBe('10-48 0.010" - 0.048"');
  expect(m['Neck Relief']).toBe('0.18 mm at 8th fret');
  expect(m['Action · Low E']).toBe('1.6 mm at 12th fret');
  expect(m['Action · High E']).toBe('1.2 mm at 12th fret');
  expect(await stepTitles(page)).not.toContain('Set the Tremolo Float');
  await expect(setup(page)).toContainText('at the last fret (22nd)');
  await expect(setup(page)).toContainText('On the Tune-o-matic the intonation screws face the neck.');
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
      expect(m['String Gauge'], label).toMatch(new RegExp(`^${gauge} `));
      expect(m['Neck Relief'], label).toBe(`${relief} mm at 8th fret`);
      expect(m['Action · Low E'], label).toBe(`${bass} mm at 12th fret`);
      expect(m['Action · High E'], label).toBe(`${treb} mm at 12th fret`);
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
  expect((await measurements(page))['String Gauge']).toBe('10-54 0.010" - 0.054"');
});

test('changing Setup does not touch progress, streak or other state', async ({ page }) => {
  const before = baseState({ checks: { 'p0.pre.0': '2026-11-01' }, streakDates: ['2026-11-09'], improvChecks: { g0e0: true } });
  await openApp(page, { localState: before });
  await goTo(page, 'setup');
  await tuningSelect(page).selectOption('drop_d');
  const saved = await localSaved(page);
  // schemaVersion: 1 is added by the migration (slice 3.1, D101); nothing else changes.
  expect({ ...saved, setupTuning: before.setupTuning }).toEqual({ ...before, schemaVersion: 1 });
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

test('the note names the chosen gauge, tuning, guitar and scale (fixed in 4.8b, D138)', async ({ page }) => {
  await openApp(page, { localState: baseState({ setupGuitar: 'epi', setupTuning: 'drop_d' }) });
  await goTo(page, 'setup');
  const note = setup(page).locator('.setup-note');
  await expect(note).toContainText('10-54');
  await expect(note).toContainText('Drop D');
  await expect(note).toContainText('Epiphone Les Paul Standard (24.75" scale)');
  await expect(note).not.toContainText('25" scale');
});
