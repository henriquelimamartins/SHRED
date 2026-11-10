# Tests

Automated tests for The Shred Roadmap (Phase 1 · Safety net). They are not part of the app.

- Runner: Playwright (`@playwright/test` 1.63.0), Chromium, two projects: `desktop` (1440×900) and `mobile` (Pixel 7).
- The app is served locally by `tests/support/static-server.js`.
- Firebase is never contacted: the three Firebase SDK files are replaced by stand-ins in
  `tests/support/firebase-stubs/`, and every other external request is blocked (`tests/support/app.js`).
  Web fonts are blocked too, so screenshots use fallback fonts.
- The clock is fixed at 2026-11-10 12:00 UTC (a Tuesday) so dates are predictable (`DEFAULT_NOW` in `tests/support/app.js`).
- Test data shaped like the app's saved state lives in `tests/support/fixtures.js`.
- Tests named `current behaviour: …` document known risks on purpose (D81, D83). The Phase 3 fixes update them in the same PR.
- Run: `npm install` then `npm test`. Screenshots and traces go to `test-results/` (not committed).

| File | What it checks |
|---|---|
| `smoke.spec.js` | App opens on Home signed out; all 6 main views open from the navigation; no page/console errors; no Firebase traffic; no cloud writes. |
| `persistence.spec.js` | Local saving and reload; unknown fields kept; sign-in sync (cloud replaces local; upload when no cloud doc; write-back on a new day); signed-in writes go only to `users/{uid}`; manual Save/Load; Reset Everything (cancel, local wipe, cloud overwrite). |
