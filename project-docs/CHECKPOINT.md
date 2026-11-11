# CHECKPOINT — The Shred Roadmap

**Updated:** 2026-11-11 · **Current phase:** 2 · Split files — plan approved (D95, D96, D97); slices 2.1–2.4 merged; slice 2.5 (inline handlers → central handler) delivered on `phase-2/inline-handlers`, awaiting owner PR. Phase 1 complete (tag `v1-phase-1`).
**Sources of truth:** `DECISIONS.md` (owner-approved decisions), this file, then the code on `main`.
**Full plan:** "The Shred Roadmap — Plano revisto (overhaul)", Claude Docs, 9 Nov 2026.
The previous ChatGPT-era checkpoint is in Git history; it is context only (DECISIONS D07).

## Where things stand

- `main` = the live app (Phase 1 UI). Only Technique is fully implemented. Deployed to GitHub Pages from `main`.
- `phase-2-dojo-shell` = archived candidate, not merged (D05). `baseline-original` = untouched original.
- App code on `main` after 2.3: `index.html` 1316 lines (one inline JS module), `css/app.css`, `js/splash.js`, `js/data/*.js`, `js/store.js`, `js/firebase.js`. Since 2.4 (merged): `index.html` 39 lines with no inline script; the app starts from `js/main.js`; logic in `js/logic/`, views in `js/views/`.
- Automated tests: Playwright, Firebase stubbed, clock fixed at 2026-11-10 12:00 UTC, desktop + mobile. On `main`: smoke (1.1) + persistence/sync (1.2) + Technique (1.3) + DAILY, streak and calendar (1.4) + Improv, Setup, Library, Dojo (1.5); 216/216 pass. Slice 2.5 adds `handlers.spec.js` (8 tests) → 224. They are black-box (they use only the page, never app internals), so the Phase 2 split must not need test changes. From 1.6 they also run on GitHub (workflow `Tests`, job "Playwright (desktop + mobile)") on every PR to `main`, inside the official image `mcr.microsoft.com/playwright:v1.63.0-noble`. When `@playwright/test` is upgraded in `package.json`, the image tag in `.github/workflows/tests.yml` must be upgraded to the same version.
- Owner's real progress lives in Firestore `users/{uid}` and localStorage `shredRoadmapState_v10`.
- Local working copy: `C:\Users\Henri\Dev\SHRED` (fresh clone, outside OneDrive, D92). Old OneDrive copy `SHRED-OLD-nao-usar` may now be deleted by the owner.
- The copies of `DECISIONS.md` / `CHECKPOINT.md` in `project-docs/` are synced with the project versions at the end of each slice. Synced in slice 2.5.
- Workflow note: Claude cannot write inside `.github/` in the owner's folder (protected by the desktop bridge); workflow files are sent to the owner, who saves them himself.
- Workflow note: before creating a slice branch, the owner pulls `main` first (slice 1.3's branch was created one step early and had to be updated from `main`).
- Workflow note: Claude's cloud workspace cannot reach the npm registry (blocked by the network policy); since slice 2.3 the tests run there with the pre-installed Playwright 1.63.0 (same version as `package.json`), through a local stand-in for `@playwright/test` that is never committed.
- PR #3 accidentally committed `Claude outputs/` (two app screenshots the Claude desktop app saved into the repo folder; harmless). Removed and git-ignored in PR #4.

## Phase 0 — Foundations — COMPLETE (2026-11-10)

| Slice | Status |
|---|---|
| 0.1 Backup of owner data (local JSON + cloud screenshots) | DONE — verified 2026-11-10 |
| 0.2 `DECISIONS.md` created | DONE — merged in PR #2 (2026-11-10) |
| 0.3 One-page `CHECKPOINT.md` | DONE — merged in PR #2 (2026-11-10) |
| 0.4 Security review | DONE — Rules correct (D87); secret scanning on, plan Spark (D88); domains reduced (D89); API key restricted (D90); App Check postponed (D91) |
| 0.5 Tag `v1-pre-overhaul` on current `main` | DONE 2026-11-10 (tag on commit a339956) |
| 0.6 Resolve contradiction C01 (Bradley Hall PDFs in public repo) | RESOLVED — PDFs kept |

## Phase 1 — Safety net — COMPLETE (2026-11-11, tag `v1-phase-1`)

| Slice | Status |
|---|---|
| Preparation: repo moved out of OneDrive (D92) | DONE 2026-11-10 |
| 1.1 Test setup: Playwright + Firebase stubs + smoke test (Home loads; 6 main views open; no errors; no Firebase traffic; no cloud writes), desktop + mobile | DONE — merged in PR #3 (2026-11-10); 4/4 pass on merged `main` |
| 1.2 Persistence and sync tests (current behaviour): local save/reload, unknown fields kept, sign-in sync, signed-in writes, manual Save/Load, Reset Everything | DONE — merged in PR #4 (2026-11-10); 28/28 pass on merged `main` |
| 1.3 Technique tests (D20): phase %, red phase bar, item toggles, stepper limits, automatic advance, Jump to phase | DONE — merged in PR #5 (2026-11-11); 58/58 pass on merged `main` |
| 1.4 DAILY, calendar and streak tests (fixed clock, Europe/Lisbon): session blocks per day/weekend/Setup, read-only days + Switch + expiry, Practiced → streak, full-session message, daily reset, streak count, calendar grid and navigation, item sequences; 2 `current behaviour` problems documented | DONE — merged in PR #6 (2026-11-11); 124/124 pass on merged `main` |
| 1.5 Improv, Setup, Library, Dojo tests: gates, marks, Unlock, transposition key; Setup values for every guitar × tuning; Library sections, Theory/Creative marks, Bonus steppers; Dojo levels/XP, Codex, Harmonic Architect; signed-in writes; 4 `current behaviour` problems documented | DONE — merged in PR #7 (2026-11-11); 216/216 pass on merged `main` |
| 1.6 Run the tests automatically on every PR (GitHub Actions): workflow `.github/workflows/tests.yml`, read-only permissions, no secrets, actions pinned to commit SHAs, report kept 14 days on failure | DONE — PR #8 (2026-11-11): green check on GitHub. First two runs failed because the GitHub runner could not reach the Ubuntu package mirrors; fixed by running inside the Playwright image (no apt downloads) |

## Phase 2 — Split files — IN PROGRESS (plan approved 2026-11-11, D95 + D96; order of 2.3/2.4 swapped by D97)

Goal: same app, same look, same behaviour; code spread over files. Acceptance for every slice: 216/216 tests green + screenshots pixel-compared with `main` (desktop and mobile, every view). New files load with a `?v=` suffix (cache). Ends with tag `v1-phase-2`.

| Slice | Content | Status |
|---|---|---|
| 2.1 | CSS → `css/app.css`; splash script → `js/splash.js`; sync `project-docs/` copies of DECISIONS and CHECKPOINT | DONE — merged 2026-11-11: 216/216 pass; 12/12 screenshots pixel-identical to `main` (6 views × desktop/mobile) |
| 2.2 | Data → `js/data/` as ES modules: `bhgs.js` (all BHGS data: phases, chop-builders, tests, prerequisites, bonus, DAILY micro-doses, BHGS theory videos/PDF links, creative links), `improv.js`, `listening.js`, `days.js`, `setup.js`, `dojo.js`, `helpers.js` (`I()`). `index.html` 1694 → 1380 lines | DONE — merged 2026-11-11: 216/216 pass; 12/12 screenshots pixel-identical to `main`; owner checked the live app on PC and phone |
| 2.3 | Persistence + Firebase → `js/store.js` + `js/firebase.js`; code moved as it is, `state` replaced only via `replaceState` (D95, D97). Own slice, no UI changes. Branch `phase-2/store-firebase`. `index.html` 1380 → 1316 lines | DONE — merged 2026-11-11: 216/216 pass; 24/24 screenshots pixel-identical to `main` (6 views × desktop/mobile × signed out/signed in); owner checked the live app |
| 2.4 | Non-persistence logic → modules: `js/main.js` (start-up), `js/ui.js`, `js/render.js`, `js/events.js`, `js/logic/` (dates, technique, daily), `js/views/` (components, calendar, home, daily, improv, library, setup, dojo). Code moved verbatim; only `import`/`export` lines and file header comments added. Branch `phase-2/logic-modules`. `index.html` 1316 → 39 lines | DONE — merged 2026-11-11: 216/216 pass; 24/24 screenshots pixel-identical and 24/24 rendered DOM identical to `main` (6 views × desktop/mobile × signed out/signed in) |
| 2.5 | Two inline `onclick` (search, SETUP video) → central event handler: search's `onclick` removed (the central handler already showed its message; the inline one threw `showToast is not defined` on every click); SETUP video button → `data-action="openvideo"` handled in `js/events.js`. Cache suffixes bumped to `?v=2` along the import chain. New `tests/handlers.spec.js`. Branch `phase-2/inline-handlers` | DELIVERED 2026-11-11, awaiting owner PR: 224/224 pass (new tests fail on `main` as expected: 2 inline `onclick`, search error); 24/24 screenshots pixel-identical to `main`; DOM identical apart from the two replaced attributes |
| 2.6 | Content Security Policy: scripts only from the app and Firebase (D96) | NOT STARTED |

Phase 2 notes:
- The Firebase SDK is already pinned (10.12.2). Dependabot does not watch CDN-loaded libraries, so the plan's "Dependabot" item does not apply as written.
- No parked idea in `IDEAS.md` has its "Ask at" point in Phase 2.
- Method used in every Phase 2 slice: build in Claude's workspace, run the 216 tests, then a one-off pixel comparison (6 views × desktop/mobile, Firebase stubbed, fixed clock; from 2.3 also signed in) of the slice against current `main`; files keep CRLF line endings like the repo.
- How 2.3 is built (for 2.4 and later):
  - `js/store.js`: `STORAGE_KEY`, `defaultDojoState`, `defaultState`, `loadState`, `saveState` (unchanged), plus `export let state` and `replaceState(next)`, the only place that replaces the whole state (initial load, sign-in sync, `confirmReset`, manual "Load from cloud"). Changing fields inside `state` (`state.x = …`) still works from any file.
  - `js/firebase.js`: config, `hasFirebase`, live bindings `auth`, `db`, `googleProvider`, `currentUser` (only this file changes them), `initFirebase(render, showToast)` = the old init + `onAuthStateChanged` sync block, unchanged except `replaceState`. It re-exports `doc`, `setDoc`, `getDoc`, `signInWithPopup`, `signOut`, so only this file loads the Firebase SDK (useful for the CSP in 2.6).
  - `index.html` calls `initFirebase(render, showToast)` where the Firebase block used to be. The UI functions are handed over because `render`/`showToast` still live in `index.html`; when 2.4 moves them to modules, `initFirebase` can import them instead.
  - `store.js` and `firebase.js` import each other (`saveState` needs `currentUser`/`db`; the sign-in sync needs `replaceState`). This is safe because neither uses the other's values while loading, only later in functions. Every import of these two files must use exactly the same suffix (`?v=1`): a different suffix would load a second copy with its own `state`.
  - The manual Save/Load handlers and `confirmReset` stay with the UI code (in `js/events.js` since 2.4).
- How 2.4 is built (for 2.5 and later):
  - Lines were moved by a script that also checked every original line is present exactly once; a token-based check confirmed each module imports every app name it uses (no missing or unused imports).
  - Modules import each other in cycles (e.g. `logic/technique.js` ↔ `render.js`). Safe for the same reason as 2.3: only function declarations and `ui`/`state` objects are shared, and nothing runs at load time except `js/main.js` (start-up) and `js/events.js` (adds the document listeners).
  - Every import of a shared file uses the same `?v=` suffix; when a file changes in a later slice, bump its suffix in **every** import of it at once (otherwise a second copy loads), and also bump every file that imports it, up to `index.html` (2.5 did this with a script and checked one suffix per file). After 2.5: `js/main.js`, `render.js`, `events.js`, `logic/technique.js`, `logic/daily.js` and `views/` calendar, components, daily, home, library, setup are `?v=2`; the rest `?v=1`.
  - `js/firebase.js` still says in a comment that `index.html` hands over `render`/`showToast`; it is now `js/main.js`. Comment-only, left untouched to keep persistence files out of this slice.
  - The two inline `onclick` were removed in 2.5. `APP_VIEWS` (in `js/ui.js`) and `PHASE_BLURB` (in `js/data/bhgs.js`) are unused on `main`; kept as they are.

## Next phases

3 Safe data (sync safeguards, reset, schemaVersion) → 4 Design and navigation → 5 Music engine → 6 Theory v1 → 7 Musical Development + Improv v1 → 8 DAILY integrated → 9 Continuous content.

## Known risks

- Sync: cloud overwrites local on login, and local-only fields are lost; writes can happen before the read finishes (fixed in Phase 3, D81). Covered by `current behaviour` tests in 1.2.
- On the first load of a new day, the app writes the cloud state straight back (daily reset) without any user action (found in 1.2; relevant to safeguard 2, D81).
- Extra streak day (found in 1.4): if any DAILY block was ticked yesterday, opening the app today logs today in the streak before anything is practised. Fixed in Phase 3 (D33). Covered by `current behaviour` tests in 1.4.
- Time zone (found in 1.4): the weekday comes from the device clock, but "today" (streak, calendar, daily reset, item dates) comes from UTC. Fixed in Phase 3 (D33). Covered by a `current behaviour` test in 1.4.
- IMPROV gate locks are not enforced (found in 1.5): Library's Expression Track lets exercises of locked gates be marked, and un-marking an exercise of a passed gate does not lock it again. Covered by `current behaviour` tests. To be settled when IMPROV is rebuilt (Phase 7, D50).
- DOJO gives 100 XP for reading a Codex module (found in 1.5), which contradicts D40 (reading never creates progress). DOJO is replaced by THEORY in Phase 6 (D12); its stored data must still be kept. Covered by a `current behaviour` test.
- SETUP note text is wrong (found in 1.5): it always says the values are for "E standard tuning on a 25\" scale guitar", whatever guitar and tuning are chosen. SETUP also still offers D Standard, Drop C, C Standard and DADFAE, beyond D63 (Standard and Drop D). Text-only fix; part of I01 (`IDEAS.md`); owner to decide the phase.
- Reset Everything currently also wipes streak, calendar, SETUP and unknown fields, and overwrites the cloud with no backup (fixed in Phase 3, D83). Covered by `current behaviour` tests in 1.2.
- Firestore Rules protect each account's document, but cannot stop the app itself from overwriting good data with stale data; that is what the Phase 3 sync safeguards fix.
- GitHub Pages deploys the whole repository, so the test files are publicly served too. They contain nothing sensitive (D84); excluding them from the deploy is a possible later slice.
- No Content Security Policy yet: slice 2.6 (D96). Since 2.5 there is no inline script or inline handler left, so 2.6 can forbid inline scripts entirely (the only inline code left is `style="…"` attributes, which a CSP treats separately).
