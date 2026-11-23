// Slice 4.10k (D165, AUDIT-4.10 point 20): LIBRARY as resources. Two groups: "Listening & guide" (Listening Vault,
// Guide & Info) and "BHGS pack" (Theory Track, Creative, Bonus Content, Documents; hidden with the pack off). The
// Expression Track is not in LIBRARY any more (it is on IMPROVISATION). Phone: "‹ More" leads back to MORE with or
// without the pack, and LIBRARY is reached from MORE in both cases.
const { test, expect } = require('@playwright/test');
const { openApp, openView, unexpectedConsoleErrors, cloudWrites, localSaved } = require('./support/app');
const { progressState } = require('./support/fixtures');

const lib = (page) => page.locator('#panel-library');
const groupTitles = (page) => lib(page).locator('.lib-col-title').allTextContents();
const sectionTitles = (page, col) => lib(page).locator(`.lib-col:nth-child(${col}) .lib-sec .lib-head > b`).allTextContents();

async function openAll(page) {
  for (let i = 0; i < 20; i++) {
    const closed = lib(page).locator('[data-action="toggleacc"][aria-expanded="false"]');
    if (!(await closed.count())) break;
    await closed.first().click();
  }
}

// Opens LIBRARY from MORE on the phone, or from the sidebar on desktop.
async function openLibraryFromMore(page) {
  await page.locator('#botnav [data-action="more"]').click();
  await page.locator('#panel-more [data-action="go"][data-view="library"]').click();
  await expect(page.locator('#panel-library')).toHaveClass(/active/);
}

test('desktop (pack on): two groups side by side, the BHGS pack group holds Theory, Creative, Bonus and Documents', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'two columns are the desktop layout');
  await openApp(page);
  await openView(page, 'library');
  expect(await groupTitles(page)).toEqual(['Listening & guide', 'BHGS pack']);
  expect(await sectionTitles(page, 1)).toEqual(['Listening Vault', 'Guide & Info']);
  expect(await sectionTitles(page, 2)).toEqual(['Theory Track', 'Creative', 'Bonus Content', 'Documents']);
  const [left, right] = await lib(page).locator('.lib-col').evaluateAll((cols) => cols.map((c) => c.getBoundingClientRect()));
  expect(right.left).toBeGreaterThan(left.right - 1);
  expect(Math.abs(right.top - left.top)).toBeLessThan(2);
});

test('the Expression Track is not in LIBRARY; its five Gates stay on IMPROVISATION', async ({ page }) => {
  await openApp(page);
  await openView(page, 'library');
  await openAll(page);
  await expect(lib(page).locator('text=Expression Track')).toHaveCount(0);
  await expect(lib(page).locator('.lib-gate')).toHaveCount(0);
  await openView(page, 'improv');
  await expect(page.locator('#panel-improv .gate, #panel-improv [data-gate], #panel-improv .gates').first()).toBeVisible();
});

test('Documents lists the two PDFs, each with its kind', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'checked once, on the desktop layout');
  await openApp(page);
  await openView(page, 'library');
  await lib(page).locator('[data-action="toggleacc"][data-acc="documents"]').click();
  const rows = lib(page).locator('.lib-group-docs .lib-doc');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('Music Theory Cheat Sheet');
  await expect(rows.nth(1)).toContainText('Scales Handbook');
  await expect(rows.locator('.lib-doc-kind')).toHaveText(['PDF', 'PDF']);
});

test('Listening Vault content is unchanged: its four categories are listed', async ({ page }) => {
  await openApp(page);
  await openView(page, 'library');
  await lib(page).locator('[data-action="toggleacc"][data-acc="listening"]').click();
  for (const category of ['Stoner, Doom & Sludge', 'Prog, Odd Meters & Harmony', 'Death Metal, Sludge & Groove', 'Classic Rock, Blues & Soul']) {
    await expect(lib(page).locator('.lib-group-vault h3', { hasText: category })).toHaveCount(1);
  }
});

test('pack off: LIBRARY shows only "Listening & guide", with the pack-free guide text and no Expression Track', async ({ page }) => {
  await openApp(page, { bhgsPack: false });
  await openView(page, 'library');
  expect(await groupTitles(page)).toEqual(['Listening & guide']);
  expect(await sectionTitles(page, 1)).toEqual(['Listening Vault', 'Guide & Info']);
  await openAll(page);
  await expect(lib(page).locator('text=Theory Track, Creative, Bonus Content')).toHaveCount(0);
  await expect(lib(page).locator('.lib-group-docs')).toHaveCount(0);
  await expect(lib(page).locator('text=Expression Track')).toHaveCount(0);
  await expect(lib(page).locator('text=Here in LIBRARY, the Listening Vault gathers listening references.')).toHaveCount(1);
});

test('phone: LIBRARY is reached from MORE with or without the pack, and "‹ More" leads back to MORE', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'the bottom bar and "‹ More" are the phone layout');
  for (const bhgsPack of [true, false]) {
    await openApp(page, { bhgsPack });
    await openLibraryFromMore(page);
    await expect(page.locator('#panel-library .page-back')).toHaveText(/More/);
    await page.locator('#panel-library .page-back').click();
    await expect(page.locator('#panel-more')).toHaveClass(/active/);
  }
});

test('pack off, phone: the bottom bar has no LIBRARY button, LIBRARY is listed under More', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'the bottom bar is the phone layout');
  await openApp(page, { bhgsPack: false });
  await expect(page.locator('#botnav [data-action="go"][data-view="library"]')).toHaveCount(0);
  await page.locator('#botnav [data-action="more"]').click();
  await expect(page.locator('#panel-more [data-action="go"][data-view="library"]')).toContainText('Listening Vault');
});

test('LIBRARY is read-only: opening it writes nothing (signed out)', async ({ page }) => {
  const monitor = await openApp(page, { localState: progressState({ phaseIndex: 1 }) });
  const before = await localSaved(page);
  await openView(page, 'library');
  await openAll(page);
  expect(await localSaved(page)).toEqual(before);
  expect(await cloudWrites(page)).toEqual([]);
  expect(await unexpectedConsoleErrors(monitor)).toEqual([]);
});
