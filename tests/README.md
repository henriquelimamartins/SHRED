# Tests

Automated tests for The Shred Roadmap (Phase 1 · Safety net). They are not part of the app.

- Runner: Playwright (`@playwright/test` 1.63.0), Chromium, two projects: `desktop` (1440×900) and `mobile` (Pixel 7).
- The app is served locally by `tests/support/static-server.js`.
- Firebase is never contacted: the three Firebase SDK files are replaced by stand-ins in
  `tests/support/firebase-stubs/`, and every other external request is blocked (`tests/support/app.js`).
  Web fonts are blocked too, so screenshots use fallback fonts.
- The clock is fixed at 2026-11-10 12:00 UTC (a Tuesday) so dates are predictable (`DEFAULT_NOW` in `tests/support/app.js`).
  `daily.spec.js` and `improv.spec.js` also fix the browser time zone to `Europe/Lisbon` (the owner's) and moves the clock where a test needs another day.
- Test data shaped like the app's saved state lives in `tests/support/fixtures.js`.
- Tests named `current behaviour: …` document known risks on purpose (D81, D83) and other problems found on `main`. The Phase 3 fixes update them in the same PR.
- Run: `npm install` then `npm test`. Screenshots and traces go to `test-results/` (not committed).
- On GitHub: the `Tests` workflow (`.github/workflows/tests.yml`) runs the whole suite on every pull request to `main` and can be started by hand from the Actions tab. It only reads the code, uses no secrets, and keeps the report for 14 days when a test fails.

| File | What it checks |
|---|---|
| `smoke.spec.js` | App opens on Home signed out; all 6 main views open from the navigation; no page/console errors; no Firebase traffic; no cloud writes. |
| `persistence.spec.js` | Local saving and reload; unknown fields kept; sign-in sync (cloud replaces local; upload when no cloud doc; write-back on a new day); signed-in writes go only to `users/{uid}`; manual Save/Load; Reset Everything (cancel, local wipe, cloud overwrite). |
| `technique.spec.js` | Technique (D20): phase % for Setup, Beginner and Pro and the red phase bar; Mastered/Watched/Completed toggles and stored values; chop (0–10), test (0–5) and bonus limits; automatic phase advance (and none after Pro); Jump to phase forward, back + Cancel, back + Confirm. |
| `daily.spec.js` | DAILY (D30, D24): today's session and the 7-day picker; blocks per weekday, weekend and Setup phase; read-only other days, Switch and its expiry; Practiced boxes → streak, full-session message, daily reset; streak count and Days Logged on Home; calendar grid, colours and Prev/Next/Today (incl. month and year boundaries); next concept video / solo sequences; two `current behaviour` problems (extra streak day on a new day; UTC date vs local weekday). |
| `improv.spec.js` | IMPROV (5 Gates): Gate 1 open and the rest locked; Mastered marks (`improvChecks`) saved, kept after reload, not counted as practice; Unlock only when a gate is complete; all gates passed; daily transposition key by day of the year; the same marks in Library's Expression Track; signed-in writes; two `current behaviour` problems (locked-gate exercises can be marked from Library; un-marking a passed gate does not lock it again). |
| `setup.spec.js` | SETUP: default PRS / E Standard with 8 steps; Les Paul (no tremolo, 22nd fret, its own video); every guitar × tuning value; choices stored and shown after reload; other state untouched; signed-in writes; one `current behaviour` problem (the note always says "E standard … 25\" scale"). |
| `library.spec.js` | LIBRARY: 7 sections; Theory Track (3 documents, 13 videos, `theory.N` Watched marks with the date); Creative (`creative.sw.N` / `creative.pr.N`); these marks do not change Technique, phase or streak; Bonus steppers (0–10 / 0–5); Listening Vault is read-only; Guide's Weekly Rhythm; Essential Skills. |
| `dojo.spec.js` | Legacy THEORY DOJO: level and XP bar from XP; audio toggle hides the Rhythm game; placeholder games; Codex locks; Harmonic Architect right/wrong answers, level-limited questions, Level 11 unlocks Module 2; signed-in writes; other state untouched; one `current behaviour` problem (reading a Codex module gives 100 XP, against D40). |
