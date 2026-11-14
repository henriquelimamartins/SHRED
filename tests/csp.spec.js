// Phase 2.6: Content Security Policy (DECISIONS D96, D98). The app must run with no policy violations,
// and code that does not come from the allowed places must be refused by the browser.
const { test, expect } = require('@playwright/test');
const { openApp, unexpectedConsoleErrors } = require('./support/app');
const { TEST_USER, USER_DOC, progressState } = require('./support/fixtures');

const VIEWS = ['home', 'daily', 'technique', 'improv', 'dojo', 'library', 'setup'];

/** Records every policy violation the page reports, from the very first moment. */
async function watchViolations(page) {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push({ directive: e.effectiveDirective, blocked: e.blockedURI });
    });
  });
}
const violations = (page) => page.evaluate(() => window.__cspViolations);

async function goTo(page, view) {
  const nav = page.locator('#botnav:visible, #sidebar-nav-inner:visible').first();
  const btn = nav.locator(`[data-action="go"][data-view="${view}"]`);
  // Slice 4.2a (D119): on the phone, Library and Tools (SETUP) are opened from the More sheet.
  if (await btn.count()) await btn.click();
  else {
    await nav.locator('[data-action="more"]').click();
    await page.locator(`#more-sheet [data-action="go"][data-view="${view}"]`).click();
  }
  await expect(page.locator(`#panel-${view}`)).toHaveClass(/active/);
}

test('the policy is in the page and allows no inline or eval code', async ({ page }) => {
  await openApp(page);
  const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  const directives = Object.fromEntries(policy.split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));
  expect(directives['default-src']).toEqual(["'self'"]);
  expect(directives['script-src']).toEqual(["'self'", 'https://www.gstatic.com/firebasejs/10.12.2/', 'https://apis.google.com']);
  expect(directives['object-src']).toEqual(["'none'"]);
  expect(directives['base-uri']).toEqual(["'self'"]);
});

for (const signed of ['out', 'in']) {
  test(`every view works with no policy violations, signed ${signed}`, async ({ page }) => {
    await watchViolations(page);
    const opts = signed === 'in'
      ? { user: TEST_USER, docs: { [USER_DOC]: progressState() } }
      : { localState: progressState() };
    const monitor = await openApp(page, opts);
    for (const view of VIEWS) {
      await goTo(page, view);
      await expect(page.locator(`#panel-${view} .panel-content`)).not.toBeEmpty();
    }
    // Open the Library sections and the Dojo Codex too, so their content is drawn.
    await goTo(page, 'library');
    for (const acc of ['theory', 'expression', 'listening', 'creative', 'bonuslib', 'guide']) {
      await page.locator(`#panel-library [data-acc="${acc}"]`).first().click();
    }
    // Slice 4.3: the TECHNIQUE page's other phases, Essential Skills and Phase settings.
    await goTo(page, 'technique');
    for (const acc of ['tp2', 'techessentials']) await page.locator(`#panel-technique [data-acc="${acc}"]`).click();
    await page.locator('#panel-technique [data-action="phasesettings"]').click();
    await goTo(page, 'dojo');
    await page.locator('#panel-dojo [data-action="dojoopen"]').click();
    expect(await violations(page)).toEqual([]);
    expect(monitor.pageErrors).toEqual([]);
    expect(unexpectedConsoleErrors(monitor)).toEqual([]);
  });
}

test('injected inline code is refused and does not run', async ({ page }) => {
  await watchViolations(page);
  await openApp(page);
  const ran = await page.evaluate(async () => {
    const s = document.createElement('script');
    s.textContent = 'window.__injectedRan = true;';
    document.body.appendChild(s);
    const div = document.createElement('div');
    div.innerHTML = '<img src="x" onerror="window.__injectedRan = true">';
    document.body.appendChild(div);
    await new Promise((r) => setTimeout(r, 100));
    return window.__injectedRan === true;
  });
  expect(ran).toBe(false);
  const v = await violations(page);
  expect(v.some((x) => x.directive === 'script-src-elem' && x.blocked === 'inline')).toBe(true);
  expect(v.some((x) => x.directive === 'script-src-attr' && x.blocked === 'inline')).toBe(true);
});

test('scripts from other websites are refused', async ({ page }) => {
  await watchViolations(page);
  await openApp(page);
  await page.evaluate(async () => {
    const s = document.createElement('script');
    s.src = 'https://example.com/evil.js';
    document.body.appendChild(s);
    await new Promise((r) => setTimeout(r, 100));
  });
  const v = await violations(page);
  expect(v.some((x) => x.directive === 'script-src-elem' && x.blocked.startsWith('https://example.com/'))).toBe(true);
});
