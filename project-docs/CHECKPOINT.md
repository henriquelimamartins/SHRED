# CHECKPOINT — The Shred Roadmap

**Updated:** 2026-11-11 · **Current phase:** 3 · Safe data — plan approved (D99); slices 3.1–3.3 merged (PR #15, #16, #17; owner checked 3.3 live on PC and phone); docs clean-up D104 merged (PR #18). Slice 3.4 (D105) delivered on `phase-3/stale-sessions`, awaiting owner PR and live check. Phase 2 complete (tag `v1-phase-2`); Phase 1 complete (tag `v1-phase-1`).
**Sources of truth:** `DECISIONS.md` (owner-approved decisions), this file, then the code on `main`.
**Full plan:** "The Shred Roadmap — Plano revisto (overhaul)", Claude Docs, 9 Nov 2026.
The previous ChatGPT-era checkpoint is in Git history; it is context only (DECISIONS D07).

## Where things stand

- `main` = the live app (Phase 1 UI). Only Technique is fully implemented. Deployed to GitHub Pages from `main`.
- `phase-2-dojo-shell` = archived candidate, not merged (D05). `baseline-original` = untouched original.
- App code on `main` after 2.3: `index.html` 1316 lines (one inline JS module), `css/app.css`, `js/splash.js`, `js/data/*.js`, `js/store.js`, `js/firebase.js`. Since 2.4 (merged): `index.html` 39 lines with no inline script; the app starts from `js/main.js`; logic in `js/logic/`, views in `js/views/`.
- Automated tests: Playwright, Firebase stubbed, clock fixed at 2026-11-10 12:00 UTC, desktop + mobile. On `main`: smoke (1.1) + persistence/sync (1.2) + Technique (1.3) + DAILY, streak and calendar (1.4) + Improv, Setup, Library, Dojo (1.5); 216/216 pass. Slice 2.5 added `handlers.spec.js` (8 tests) → 224; slice 2.6 adds `csp.spec.js` (10 tests) → 234. They are black-box (they use only the page, never app internals), so the Phase 2 split must not need test changes. From 1.6 they also run on GitHub (workflow `Tests`, job "Playwright (desktop + mobile)") on every PR to `main`, inside the official image `mcr.microsoft.com/playwright:v1.63.0-noble`. When `@playwright/test` is upgraded in `package.json`, the image tag in `.github/workflows/tests.yml` must be upgraded to the same version.
- Owner's real progress lives in Firestore `users/{uid}` and localStorage `shredRoadmapState_v10`.
- Local working copy: `C:\Users\Henri\Dev\SHRED` (fresh clone, outside OneDrive, D92). Old OneDrive copy `SHRED-OLD-nao-usar` may now be deleted by the owner.
- The copies of `DECISIONS.md` / `CHECKPOINT.md` in `project-docs/` are synced with the project versions at the end of each slice. Synced in slice 3.4 (D104, D105 and C04 added to the copy).
- Project docs: `CURRICULUM-STANDARDS.md` (new, D104) holds the curriculum points of the old MASTERPLAN not yet recorded elsewhere; context, not decisions; review with the owner at the start of Phases 6 and 7.
- Workflow note: Claude cannot write inside `.github/` in the owner's folder (protected by the desktop bridge); workflow files are sent to the owner, who saves them himself.
- Workflow note: before creating a slice branch, the owner pulls `main` first (slice 1.3's branch was created one step early and had to be updated from `main`).
- Workflow note: Claude's cloud workspace cannot reach the npm registry (blocked by the network policy); since slice 2.3 the tests run there with the pre-installed Playwright 1.63.0 (same version as `package.json`), through a local stand-in for `@playwright/test` that is never committed.
- Workflow note: Claude cannot delete files in the owner's folder (only create or update them); deletions are done by the owner.
- Workflow note: in the 3.4 conversation the desktop bridge had no shell on the owner's computer; files were copied to Claude's workspace, changed and tested there, then written back to the folder (after checking the branch in `.git/HEAD` and that no file had changed meanwhile).
- Workflow note: two conversations writing the project's CHECKPOINT on the same day can overwrite each other (happened 2026-11-11: the D104 conversation overwrote the 3.3 update; restored from the `project-docs/` copy on `main`). Re-read the project CHECKPOINT right before writing it.
- PR #3 accidentally committed `Claude outputs/` (two app screenshots the Claude desktop app saved into the repo folder; harmless). Removed and git-ignored in PR #4.

## Repository clean-up (D104) — docs only

| Item | Status |
|---|---|
| Remove `project-docs/MASTERPLAN.md`, `PHASE_LOG.md`, `CLAUDE-PROMPT`, `phase-prompts/PHASE-01-UI.md` and the duplicate `apple_touch_icon.png`; rewrite `project-docs/README.md`. Branch `docs/remove-legacy-docs`, from `main` after 3.3 | DELIVERED 2026-11-11 — 294/294 tests pass on `main` with 3.3 and the files removed (Claude's workspace); no app file changed, so no screenshots. DONE — merged in PR #18 (2026-11-11) |
| MASTERPLAN check: points not in `DECISIONS.md` or the overhaul plan (editorial template, functional-harmony scope, visual rules incl. "never colour alone", assessment distinctions, Gate objectives, open questions) | DONE — carried into project doc `CURRICULUM-STANDARDS.md` |

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

## Phase 2 — Split files — COMPLETE (2026-11-11, tag `v1-phase-2`; plan D95 + D96, order of 2.3/2.4 swapped by D97)

Goal: same app, same look, same behaviour; code spread over files. Acceptance for every slice: 216/216 tests green + screenshots pixel-compared with `main` (desktop and mobile, every view). New files load with a `?v=` suffix (cache). Ends with tag `v1-phase-2`.

| Slice | Content | Status |
|---|---|---|
| 2.1 | CSS → `css/app.css`; splash script → `js/splash.js`; sync `project-docs/` copies of DECISIONS and CHECKPOINT | DONE — merged 2026-11-11: 216/216 pass; 12/12 screenshots pixel-identical to `main` (6 views × desktop/mobile) |
| 2.2 | Data → `js/data/` as ES modules: `bhgs.js` (all BHGS data: phases, chop-builders, tests, prerequisites, bonus, DAILY micro-doses, BHGS theory videos/PDF links, creative links), `improv.js`, `listening.js`, `days.js`, `setup.js`, `dojo.js`, `helpers.js` (`I()`). `index.html` 1694 → 1380 lines | DONE — merged 2026-11-11: 216/216 pass; 12/12 screenshots pixel-identical to `main`; owner checked the live app on PC and phone |
| 2.3 | Persistence + Firebase → `js/store.js` + `js/firebase.js`; code moved as it is, `state` replaced only via `replaceState` (D95, D97). Own slice, no UI changes. Branch `phase-2/store-firebase`. `index.html` 1380 → 1316 lines | DONE — merged 2026-11-11: 216/216 pass; 24/24 screenshots pixel-identical to `main` (6 views × desktop/mobile × signed out/signed in); owner checked the live app |
| 2.4 | Non-persistence logic → modules: `js/main.js` (start-up), `js/ui.js`, `js/render.js`, `js/events.js`, `js/logic/` (dates, technique, daily), `js/views/` (components, calendar, home, daily, improv, library, setup, dojo). Code moved verbatim; only `import`/`export` lines and file header comments added. Branch `phase-2/logic-modules`. `index.html` 1316 → 39 lines | DONE — merged 2026-11-11: 216/216 pass; 24/24 screenshots pixel-identical and 24/24 rendered DOM identical to `main` (6 views × desktop/mobile × signed out/signed in) |
| 2.5 | Two inline `onclick` (search, SETUP video) → central event handler: search's `onclick` removed (the central handler already showed its message; the inline one threw `showToast is not defined` on every click); SETUP video button → `data-action="openvideo"` handled in `js/events.js`. Cache suffixes bumped to `?v=2` along the import chain. New `tests/handlers.spec.js`. Branch `phase-2/inline-handlers` | DONE — merged 2026-11-11: 224/224 pass; 24/24 screenshots pixel-identical to `main`; owner checked Search, SETUP video, sign-in and saving on the live app |
| 2.6 | Content Security Policy (D96, D98) as a `<meta>` tag in `index.html`; sources checked against the live app signed in (built-in browser, 11 Nov 2026): `www.gstatic.com` (Firebase SDK), `apis.google.com` (Google sign-in scripts), `shred-auth.firebaseapp.com` (auth iframe), `identitytoolkit.googleapis.com`, `firestore.googleapis.com`, plus `securetoken.googleapis.com` (token refresh) and Google Fonts. New `tests/csp.spec.js`. No JS change, so no `?v=` bump. Branch `phase-2/csp` | DONE — merged in PR #14 (2026-11-11): 234/234 pass; 24/24 screenshots pixel-identical and 24/24 DOM identical to `main`; owner checked sign-in, marking + reload on PC and phone after merge |

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

## Phase 3 — Safe data — IN PROGRESS (plan approved 2026-11-11, D99)

Goal: progress is never lost, between PC and phone or in a Reset; the app looks the same. One PR per slice; persistence/sync slices (3.1–3.5) and 3.8 each need a detailed decision recorded before implementation. Tests that document today's bugs (`current behaviour`) change on purpose in 3.3–3.7; each delivery lists which ones. Ends with tag `v1-phase-3`.

| Slice | Content | Status |
|---|---|---|
| 3.1 | `schemaVersion: 1` + automatic on-device backups (last N snapshots, separate localStorage key; `shredRoadmapState_v10` untouched) | DONE — merged in PR #15 (2026-11-11): 258/258 pass; 24/24 screenshots pixel-identical and 24/24 DOM identical to `main`; owner checked the live app after merge |
| 3.2 | Safeguard 1: snapshot before every whole-state replacement (sign-in sync, Load from cloud, Reset) | DONE — merged in PR #16 (2026-11-11): 278/278 pass locally and on GitHub (manual run Tests #13; the PR's own run, stuck in queue, ran after close/reopen); 24/24 screenshots pixel-identical and 24/24 DOM identical to `main` |
| 3.3 | Safeguard 2: no cloud write before the cloud has been read (incl. daily reset on first load) | DONE — merged in PR #17 (2026-11-11): 294/294 pass (278 + 16 new in `read-before-write.spec.js`, all 16 fail on `main`); the `current behaviour` new-day write-back test in `persistence.spec.js` replaced on purpose by its fixed version; Firestore stand-in can now hold/fail `getDoc`; 24/24 screenshots pixel-identical and 24/24 DOM identical to `main`. Owner checked it live on PC and phone after merge |
| 3.4 | Safeguard 3: stale sessions never overwrite newer cloud data (D105: `syncRev` checked in a transaction, write queue, refresh on return/online, pending offline changes, newer-schema stop) | DELIVERED 2026-11-11 on `phase-3/stale-sessions` (files written to the owner's folder): 338/338 pass (294 + 44 new in `stale-sessions.spec.js`, 22 per device; 19 of the 22 fail on `main`, the other 3 check that nothing happens when nothing should); one `backups.spec.js` test changed on purpose (newer `schemaVersion`: now nothing is saved, not even the daily backup, D105 point 7); Firestore stand-in has `runTransaction` (fail/hold); 24/24 screenshots pixel-identical and 24/24 DOM identical to `main`. Awaiting owner PR, GitHub run and live check on PC + phone |
| 3.5 | Reset Everything as D83 | TODO |
| 3.6 | Extra streak day fix (D33-1) | TODO |
| 3.7 | "Today" = device's local day (D33-2) | TODO |
| 3.8 | UI only: Download backup / Restore backup | TODO |
| 3.S | Security (D84), own slice, no code change: restrict the Firebase browser API key by **API** as well (today only by website, D90) to the services the app uses (sign-in, token refresh, Firestore). Done in Google Cloud Console by the owner with Claude's step-by-step list; owner tests sign-in/sync on PC and phone; rollback = remove the API restriction. Needs its own decision (exact API list) | TODO — owner agreed 2026-11-11 to plan it after 3.2 is merged |

Phase 3 notes:
- GitHub secret scanning: 2 open alerts (#1, #2, opened 2026-09-28) for the Firebase web API key. #1 = the real key (public by design; protected by Rules D87 and the website restriction D90). #2 = a mistyped copy in one commit (6e5329f, 28 Sep 21:10, replaced 3 min later in 8fa64f5). Advised the owner to close both as "Won't fix" with that explanation; no key rotation needed.
- GitHub Actions (PR #16, 2026-11-11): the PR's own test run stayed "Queued" for 50+ min and could not be cancelled (GitHub-side); a manual run (workflow_dispatch, Tests #13) on `phase-3/backup-before-replace`, same commit `bdf7554`, passed. Closing and reopening the PR started a new run that passed; merged. Owner checked the live app on PC and phone after merge.
- Parked idea I01 (custom SETUP guitars): data shape reserved in D100 (`setupGuitars`, `schemaVersion` 2, written only when built).
- How 3.1 is built: `js/store.js` has `SCHEMA_VERSION`, `BACKUP_KEY` (`shredRoadmapBackups_v1`), `MAX_BACKUPS` (20), `readBackups()`, `writeBackup(reason, data)` (returns false if it could not store), `migrate(data)` (returns a new object; backup first; untouched if current/newer or if the backup failed) and `dailyBackup()` (first start-up of each **local** day, after `loadState`). `migrate` is applied in `loadState`, in the sign-in sync (`js/firebase.js`) and in manual "Load from cloud" (`js/events.js`). A new device starts at `schemaVersion: 1`. `defaultState()` has no `schemaVersion`, so after Reset Everything the next start migrates again (one extra backup); slice 3.5 settles Reset. A corrupt main state still falls back to defaults as before (unchanged).
- How 3.2 is built: `js/store.js` adds `sameData(a, b)` (sorted-key JSON comparison) and `backupBeforeReplace(reason, incoming)`; called in the sign-in sync (`js/firebase.js`), manual Load and `confirmReset` (`js/events.js`). On the first start of a day the `daily` snapshot already equals local state, so the sign-in sync usually adds no second backup; the local state is still safe in that snapshot.
- How 3.3 is built: `js/firebase.js` exports `cloudReady`, `cloudReadFailed`, `CLOUD_READ_FAILED_MSG` and `markCloudRead()`; both flags reset on every auth change; `cloudReady` turns true only after the sign-in read (doc applied, or absent and then uploaded) or a successful manual Load. `saveState()` writes the cloud only when `cloudReady`; new `saveLocal()` (device only) is used by `ensureDailyReset()`. Manual Save while not ready shows "Cloud progress is still loading. Try again in a moment." (or the read-failed message). If the account changes while the read is running, the old read is ignored.
- How 3.4 is built:
  - `js/store.js`: `NEWER_SCHEMA_MSG`, live flag `newerSchema`, `isNewerSchema(data)`, `markNewerSchema()`. `loadState` sets the flag when local data has a higher `schemaVersion`; then `saveLocal`, `saveState` and `dailyBackup` write nothing. `saveState()` calls `requestCloudWrite()` instead of `setDoc`. `main.js` shows the newer-version message at start-up.
  - `js/firebase.js`: `knownRev` (session memory of the cloud `syncRev`, reset on every auth change); `requestCloudWrite()` (queue: one transaction at a time, saves during a write merged into one follow-up; returns `ok` / `conflict` / `error` / `newer` / `skipped`); `writeOnce()` (transaction: read cloud, stop if newer schema, conflict if `syncRev` ≠ `knownRev`, else write state with `syncRev + 1`; a missing cloud document counts as nothing newer and is written); `adoptCloud(cloud, reason, message)` (cloud wins: backup only if the data really differs ignoring `syncRev`, replace through `migrate`, clear pending, message only if something changed); `refreshFromCloud()` on `visibilitychange` (visible) and `online` (an older copy, e.g. from the offline cache, never replaces newer local data); `loadFromCloud()` for manual Load. Pending mark `shredRoadmapSyncPending_v1` = `{ uid, baseRev }` is set when a write is requested (before sending, so closing the app mid-write is covered) and cleared after the last successful write or any replacement from the cloud. `setDoc` is no longer used or exported; every cloud write is a transaction (no Firestore offline queue).
  - Sign-in sync order: newer local data → stop (no read); newer cloud data → stop (nothing replaced or written); pending mark for this account with `baseRev` = cloud `syncRev` → keep local and send it ("Local progress saved to cloud!"); pending mark but cloud moved on → cloud wins with the stale message (`before-stale-replace`); otherwise as before ("Progress synced from cloud!"). A pending mark for another account is cleared by the normal sync (local state is replaced).
  - `js/events.js`: manual Save and Reset go through `requestCloudWrite()`; manual Load through `loadFromCloud()`; manual Save, Load and Reset are refused with the newer-version message when `newerSchema`.
  - Messages added (D105): stale replace, "Updated with newer progress from another device.", newer version. Offline saves log a `console.warn` (not an error).
- Cache suffixes after 3.4: `store.js`, `firebase.js`, `logic/dates.js`, `views/dojo.js`, `views/improv.js` `?v=5`; `main.js`, `events.js`, `render.js`, `logic/technique.js`, `logic/daily.js`, `views/` calendar, components, daily, home, library, setup `?v=6`; the rest `?v=1`.
- Cache suffixes after 3.3: `store.js`, `firebase.js`, `logic/dates.js`, `views/dojo.js`, `views/improv.js` `?v=4`; `main.js`, `events.js`, `render.js`, `logic/technique.js`, `logic/daily.js`, `views/` calendar, components, daily, home, library, setup `?v=5`; the rest `?v=1`.
- Cache suffixes after 3.2: `store.js`, `firebase.js`, `logic/dates.js`, `views/dojo.js`, `views/improv.js` `?v=3`; `main.js`, `events.js`, `render.js`, `logic/technique.js`, `logic/daily.js`, `views/` calendar, components, daily, home, library, setup `?v=4`; the rest `?v=1`.
- Cache suffixes after 3.1 (bumped by script along the import chain; one suffix per file checked): `store.js`, `firebase.js`, `logic/dates.js`, `views/dojo.js`, `views/improv.js` `?v=2`; `main.js`, `events.js`, `render.js`, `logic/technique.js`, `logic/daily.js`, `views/` calendar, components, daily, home, library, setup `?v=3`; the rest `?v=1`.
- Code facts for the plan (on `main`): every save is a full `setDoc` of the whole state (no merge); `onAuthStateChanged` sets `currentUser` before `getDoc` finishes, so a save in between writes local state to the cloud; on sign-in the cloud copy replaces local (`Object.assign(defaultState(), cloud)`), so local-only fields are lost; `main.js` runs `ensureDailyReset()` (which saves) at start-up.

## Next phases

4 Design and navigation → 5 Music engine → 6 Theory v1 → 7 Musical Development + Improv v1 → 8 DAILY integrated → 9 Continuous content.

## Known risks

- Stale sessions: a device left open (e.g. the phone since yesterday) overwrites newer progress from another device on its next save, because every save is a full overwrite. Fixed in slice 3.4 (D81, D105), delivered, not yet merged. Until every open tab has loaded the new code, an old tab (pre-3.4) can still overwrite: it keeps the `syncRev` it read, so the new code cannot tell its write apart. After merge, reload the app on every device.
- Slice 3.4 limits (by design, D105): changes are never merged between devices; the losing side's change is kept only in that device's backups (restore UI comes in 3.8). The cloud is now re-read each time the app becomes visible (1 Firestore read) and each save costs 1 read + 1 write; well within the Spark free quota for one user.
- Sync: cloud overwrites local on login, and local-only fields are lost; writes can happen before the read finishes (fixed in Phase 3, D81). Covered by `current behaviour` tests in 1.2.
- On the first load of a new day, the app writes the cloud state straight back (daily reset) without any user action (found in 1.2). Fixed in slice 3.3 (D103), merged.
- Extra streak day (found in 1.4): if any DAILY block was ticked yesterday, opening the app today logs today in the streak before anything is practised. Fixed in Phase 3 (D33). Covered by `current behaviour` tests in 1.4.
- Time zone (found in 1.4): the weekday comes from the device clock, but "today" (streak, calendar, daily reset, item dates) comes from UTC. Fixed in Phase 3 (D33). Covered by a `current behaviour` test in 1.4.
- IMPROV gate locks are not enforced (found in 1.5): Library's Expression Track lets exercises of locked gates be marked, and un-marking an exercise of a passed gate does not lock it again. Covered by `current behaviour` tests. To be settled when IMPROV is rebuilt (Phase 7, D50).
- DOJO gives 100 XP for reading a Codex module (found in 1.5), which contradicts D40 (reading never creates progress). DOJO is replaced by THEORY in Phase 6 (D12); its stored data must still be kept. Covered by a `current behaviour` test.
- SETUP note text is wrong (found in 1.5): it always says the values are for "E standard tuning on a 25\" scale guitar", whatever guitar and tuning are chosen. SETUP also still offers D Standard, Drop C, C Standard and DADFAE, beyond D63 (Standard and Drop D). Text-only fix; part of I01 (`IDEAS.md`); owner to decide the phase.
- Reset Everything currently also wipes streak, calendar, SETUP and unknown fields, and overwrites the cloud with no backup (fixed in Phase 3, D83). Covered by `current behaviour` tests in 1.2.
- Firestore Rules protect each account's document, but cannot stop the app itself from overwriting good data with stale data; that is what the Phase 3 sync safeguards fix.
- GitHub Pages deploys the whole repository, so the test files are publicly served too. They contain nothing sensitive (D84); excluding them from the deploy is a possible later slice.
- Content Security Policy (2.6, D98): any new outside source (Firebase SDK upgrade, new fonts, analytics, embeds) must be added to the policy in the same PR, or it will be blocked. Inline `style` attributes are still allowed (`'unsafe-inline'` for styles only) until the design overhaul (Phase 4). A `<meta>` policy cannot set `frame-ancestors` (clickjacking protection); GitHub Pages cannot send headers, so that stays open (low risk: no sensitive one-click actions).
