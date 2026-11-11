# CHECKPOINT — The Shred Roadmap

**Updated:** 2026-11-11 · **Current phase:** 2 · Split files — plan approved (D95, D96); slice 2.1 delivered on `phase-2/css-splash`, awaiting owner PR. Phase 1 complete (tag `v1-phase-1`).
**Sources of truth:** `DECISIONS.md` (owner-approved decisions), this file, then the code on `main`.
**Full plan:** "The Shred Roadmap — Plano revisto (overhaul)", Claude Docs, 9 Nov 2026.
The previous ChatGPT-era checkpoint is in Git history; it is context only (DECISIONS D07).

## Where things stand

- `main` = the live app (Phase 1 UI). Only Technique is fully implemented. Deployed to GitHub Pages from `main`.
- `phase-2-dojo-shell` = archived candidate, not merged (D05). `baseline-original` = untouched original.
- App code (`index.html`) unchanged in the overhaul so far: 2050 lines (CSS ~336 lines, a splash script, one JS module of ~1650 lines).
- Automated tests: Playwright, Firebase stubbed, clock fixed at 2026-11-10 12:00 UTC, desktop + mobile. On `main`: smoke (1.1) + persistence/sync (1.2) + Technique (1.3) + DAILY, streak and calendar (1.4) + Improv, Setup, Library, Dojo (1.5); 216/216 pass. They are black-box (they use only the page, never app internals), so the Phase 2 split must not need test changes. From 1.6 they also run on GitHub (workflow `Tests`, job "Playwright (desktop + mobile)") on every PR to `main`, inside the official image `mcr.microsoft.com/playwright:v1.63.0-noble`. When `@playwright/test` is upgraded in `package.json`, the image tag in `.github/workflows/tests.yml` must be upgraded to the same version.
- Owner's real progress lives in Firestore `users/{uid}` and localStorage `shredRoadmapState_v10`.
- Local working copy: `C:\Users\Henri\Dev\SHRED` (fresh clone, outside OneDrive, D92). Old OneDrive copy `SHRED-OLD-nao-usar` may now be deleted by the owner.
- The copies of `DECISIONS.md` / `CHECKPOINT.md` in `project-docs/` are synced with the project versions at the end of each slice. Synced in slice 2.1.
- Workflow note: Claude cannot write inside `.github/` in the owner's folder (protected by the desktop bridge); workflow files are sent to the owner, who saves them himself.
- Workflow note: before creating a slice branch, the owner pulls `main` first (slice 1.3's branch was created one step early and had to be updated from `main`).
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

## Phase 2 — Split files — IN PROGRESS (plan approved 2026-11-11, D95 + D96)

Goal: same app, same look, same behaviour; code spread over files. Acceptance for every slice: 216/216 tests green + screenshots pixel-compared with `main` (desktop and mobile, every view). New files load with a `?v=` suffix (cache). Ends with tag `v1-phase-2`.

| Slice | Content | Status |
|---|---|---|
| 2.1 | CSS → `css/app.css`; splash script → `js/splash.js`; sync `project-docs/` copies of DECISIONS and CHECKPOINT | DELIVERED on `phase-2/css-splash` (2026-11-11): 216/216 pass; 12/12 screenshots pixel-identical to `main` (6 views × desktop/mobile); awaiting owner PR |
| 2.2 | Data → `js/data/`: `bhgs.js` (all BHGS data, own file), `improv.js`, `theory.js`, `listening.js`, `setup.js`, `dojo.js` | NOT STARTED |
| 2.3 | Non-persistence logic → modules (dates/streak, technique, daily, views, navigation/events) | NOT STARTED |
| 2.4 | Persistence + Firebase → `js/store.js` + `js/firebase.js`; code moved as it is, `state` replaced only via `replaceState` (D95). Own slice, no UI changes | NOT STARTED |
| 2.5 | Two inline `onclick` (search, SETUP video) → central event handler | NOT STARTED |
| 2.6 | Content Security Policy: scripts only from the app and Firebase (D96) | NOT STARTED |

Phase 2 notes:
- The Firebase SDK is already pinned (10.12.2). Dependabot does not watch CDN-loaded libraries, so the plan's "Dependabot" item does not apply as written.
- No parked idea in `IDEAS.md` has its "Ask at" point in Phase 2.

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
- No Content Security Policy yet: slice 2.6 (D96).
