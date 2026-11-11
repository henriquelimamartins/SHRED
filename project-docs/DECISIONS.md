# DECISIONS — The Shred Roadmap

Owner-approved decisions. This file and `CHECKPOINT.md` are the sources of truth, followed by the code on `main`.
The ChatGPT-era documents (`MASTERPLAN.md`, `PHASE_LOG.md`, `CLAUDE-PROMPT`, the old `CHECKPOINT.md`) are historical context only.
The full reasoning lives in the overhaul plan "The Shred Roadmap — Plano revisto (overhaul)" (Claude Docs, 9 Nov 2026).

Rules for this file:
- Only decisions the owner explicitly approved go here. Proposals stay in the plan until approved.
- Each entry has an ID, a date and a status. Decisions are never deleted; a changed decision gets a new entry that supersedes the old one.
- Any change to persistence, sync, auth, Firebase configuration, Firestore paths or the localStorage key needs an entry here **before** implementation.

Status values: `APPROVED`, `APPROVED (adjustable)`, `OPEN`, `SUPERSEDED by Dxx`.

---

## Process and roles

| ID | Date | Decision | Status |
|---|---|---|---|
| D01 | 2026-11-09 | Claude is lead product architect, sole developer, code and curriculum reviewer. The owner defines goals and approves scope, decisions, merges and pushes. | APPROVED |
| D02 | 2026-11-09 | The owner does all commits, pushes, PRs, merges and tags himself (GitHub Desktop). Claude prepares files plus ready-to-paste commit and PR text. | APPROVED |
| D03 | 2026-11-09 | `main` is never edited directly. One branch per slice, created from `main`; before writing, Claude confirms the working branch and writes nothing if it is `main`. Merge only by owner-approved PR. | APPROVED |
| D04 | 2026-11-09 | Safe point before the overhaul: tag `v1-pre-overhaul` on the current `main`. Each later phase ends with a tag. | APPROVED |
| D05 | 2026-11-09 | `baseline-original` and `phase-2-dojo-shell` stay untouched as archives. The Phase 2 candidate is not merged; parts may be reused as reference only. | APPROVED |
| D06 | 2026-11-09 | Automated tests (Playwright, Firebase mocked) before every delivery. Claude always runs them and reports exactly what ran, passed, was not tested and needs a real device. | APPROVED |
| D07 | 2026-11-09 | Development follows the 10-phase plan of the overhaul document (0 Foundations → 9 Continuous content). The old phase numbering (old "Phase 0 — Audit", "Phase 1 — UI", "Phase 2 — DOJO shell") is closed history. | APPROVED |
| D08 | 2026-11-09 | Talk to the owner in European Portuguese; all app text, curriculum, identifiers, commits and code comments in English. | APPROVED |
| D09 | 2026-11-10 | Claude tells the owner whenever it thinks a new conversation should be started in the project (new phase or new topic). | APPROVED |
| D92 | 2026-11-10 | Local working copy moved out of OneDrive: fresh clone at `C:\Users\Henri\Dev\SHRED`, connected to the Claude project. The old OneDrive folder is renamed `SHRED-OLD-nao-usar`, removed from GitHub Desktop, and deleted only after the first Phase 1 PR is merged. | DONE |
| D93 | 2026-11-11 | Owner ideas not yet approved are parked in `IDEAS.md` (project docs). An idea moves to this file only when the owner approves it. | APPROVED |
| D94 | 2026-11-11 | Each parked idea in `IDEAS.md` has an "Ask at" point: the phase (or slice) where a decision is useful before going further. When the project reaches that point, Claude asks the owner about the idea before continuing, one topic at a time. | APPROVED |

## Code structure (Phase 2)

| ID | Date | Decision | Status |
|---|---|---|---|
| D95 | 2026-11-11 | Phase 2 splits `index.html` into files with **no change in behaviour or look** (acceptance: all tests green + pixel comparison of screenshots against `main`, desktop and mobile). Slices: 2.1 CSS → `css/app.css` and splash script → `js/splash.js` (plus sync of the `project-docs/` copies); 2.2 data → `js/data/`, with all BHGS data in its own file (`bhgs.js`) so the BHGS package can be swapped later (I06); 2.3 non-persistence logic → modules; 2.4 persistence and Firebase → `js/store.js` + `js/firebase.js`, in its own slice, never mixed with UI: code moved as it is; the only technical change is that replacing `state` goes through one function (`replaceState`), because ES modules cannot reassign another module's variable; 2.5 the two inline `onclick` handlers (search, SETUP video) move to the central event handler. New files are loaded with a `?v=` cache-busting suffix. Phase ends with tag `v1-phase-2`. | APPROVED |
| D96 | 2026-11-11 | Content Security Policy (planned for Phase 1 in the overhaul plan, not done there) becomes slice 2.6, after all inline scripts and handlers are gone: scripts only from the app itself and Firebase. | APPROVED |
| D97 | 2026-11-11 | Order of Phase 2 slices 2.3 and 2.4 swapped: all app logic reads `state`, which other files can only reach once it lives in its own module. New order: **2.3 = persistence + Firebase** (`js/store.js` + `js/firebase.js`, as defined in D95, own slice, no UI changes), **2.4 = non-persistence logic → modules**. Everything else in D95 stands. | APPROVED |
| D98 | 2026-11-11 | Content Security Policy for slice 2.6, set by a `<meta>` tag in `index.html` (GitHub Pages cannot send headers): `default-src 'self'`; scripts only from the app, `https://www.gstatic.com/firebasejs/10.12.2/` and `https://apis.google.com` (Google sign-in); data connections only to the app, `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`; frames only `https://shred-auth.firebaseapp.com`; styles from the app, Google Fonts and inline `style` attributes (`'unsafe-inline'` for styles only, until the design overhaul, Phase 4); fonts `fonts.gstatic.com`; images the app and `data:`; `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`. Sources checked against the live app signed in (11 Nov 2026). Any new outside source (e.g. a Firebase SDK upgrade, new fonts) needs this policy updated in the same PR. Owner verifies sign-in and sync on PC and phone right after merge; rollback = revert the PR. | APPROVED |

## Product structure

| ID | Date | Decision | Status |
|---|---|---|---|
| D10 | 2026-11-09 | Goal: the app is the owner's go-to for everything guitar, built on three pillars: Technique, Improvisation, Theory. | APPROVED |
| D11 | 2026-11-09 | Structure: 3 pillars + DAILY + 7 destinations (HOME, DAILY, TECHNIQUE, IMPROV, THEORY, LIBRARY, TOOLS). | APPROVED |
| D12 | 2026-11-09 | The Theory pillar is named THEORY. The name DOJO disappears from the app. | APPROVED |
| D13 | 2026-11-09 | TECHNIQUE ROADMAP and MUSICAL DEVELOPMENT stay independent. MUSICAL DEVELOPMENT covers Theory + Improv. | APPROVED — display refined by D19a (Improv and Theory shown as separate rails, grouped side by side) |
| D14 | 2026-11-09 | Position, format and colours of the progress bars are decided in the design conversation. | APPROVED (deferred) — see D19a, D25 |
| D15 | 2026-11-09 | Visual direction: dark + red is only a starting hypothesis; 2–3 mockups before coding (Phase 4). | SUPERSEDED by D16 |
| D16 | 2026-11-10 | Visual baseline for Phase 4 = mockup direction A, round 2 (Claude Design canvas "SHRED — HOME mockups"): dark UI, red accent, Oswald headings + Inter body (as in the current app), rich desktop sidebar, "roadmap rail" progress, current-app calendar style without a partial state. Improv uses purple; Technique and Theory use red. Details to be adjusted in later rounds; working notes in `DESIGN-NOTES.md`. | APPROVED (adjustable) |
| D17 | 2026-11-10 | No visible scrollbars anywhere in the app, on desktop or mobile. Scrolling still works (wheel, touch, keyboard); scrollbars are hidden with CSS. | APPROVED |
| D18 | 2026-11-10 | MUSICAL DEVELOPMENT indicator in the desktop sidebar, under the Technique rail: level pips (current level of 5) + one combined bar of the current level's units — Improv missions in purple, Theory chapters in red; each unit shows solid / practising / not started. TECHNIQUE ROADMAP stays a separate indicator (D13). | SUPERSEDED by D19 |
| D19 | 2026-11-11 | Progress shows one rail per pillar (Technique red, Improv purple, Theory own colour), Improv + Theory grouped under "MUSICAL DEVELOPMENT"; current node = hollow ring filling from the left along top and bottom; line between nodes fills continuously; left sidebar kept. | SUPERSEDED by D19a |
| D19a | 2026-11-11 | Progress shows one rail per pillar: TECHNIQUE (red, P0–P4), IMPROV (purple, Gates 1–5), THEORY (own colour, Levels 1–5; amber provisional, final colour still open). Improv and Theory sit together under a "MUSICAL DEVELOPMENT" heading. Nodes: completed level = fully filled disc; current level = ring with an empty centre whose outline fills from the left, along the top and bottom at the same time, up to the right; future level = empty ring. The line between two nodes fills **only after the earlier level is complete** (no partial line while working on a level). Rail labels show the stage only ("PHASE 1", "GATE 1", "LEVEL 1"), without level names such as "Beginner". Desktop navigation stays in the left sidebar (top navigation considered and not chosen). | APPROVED (adjustable) |

## Technique

| ID | Date | Decision | Status |
|---|---|---|---|
| D20 | 2026-11-09 | All BHGS content (phases, exercises, chop-builders, tests, progress, DAILY workouts) is protected. Calculations, state keys and the red phase bar stay identical. | APPROVED — placement of the phase bar refined by D25 (calculations and state keys unchanged) |
| D21 | 2026-11-09 | Optional improvements approved, all additive: dated chop/test history, BPM log, session note, built-in metronome. | APPROVED |
| D22 | 2026-11-09 | "Reinforce Weakest" may be reformulated; owner still thinking. | OPEN |
| D23 | 2026-11-09 | BHGS content in the app is direct Patreon links only, no copied material. In any shared version all Bradley Hall content is removed. | APPROVED — exception: the two Bradley Hall PDFs stay (C01) |
| D24 | 2026-11-09 | BHGS theory videos and micro-doses (including Sight-Reading) stay in DAILY as they are. | APPROVED |
| D25 | 2026-11-10 | The Technique phase bar is no longer fixed at the top of every page: it appears only on HOME and in the desktop sidebar (mini-rail). Its data and calculation stay exactly as in the current app (D20). Resolves C02. | APPROVED |

## DAILY

| ID | Date | Decision | Status |
|---|---|---|---|
| D30 | 2026-11-09 | Keep the daily routine where the app says what to practise each day. Timeslots stay as they are (Technique + Improv). Theory is not daily; it is for free time. | APPROVED |
| D31 | 2026-11-09 | Writing/songwriting stays outside the app: no Create track, no writing slots; writing mentions in DAILY are replaced (Tuesday → Improv mission). | APPROVED |
| D32 | 2026-11-09 | Weekend DAILY sessions become lighter (20–30 min). | APPROVED |
| D33 | 2026-11-11 | The two DAILY/streak bugs found in slice 1.4 are fixed in Phase 3, each in its own slice with tests: (1) extra streak day — opening the app must not log today before anything is practised today; (2) time zone — "today" (streak, calendar, daily reset, item dates) follows the device's local day, like the weekday already does, instead of UTC. Dates already logged are kept as they are (no rewrite of past data). | APPROVED |

## Theory

| ID | Date | Decision | Status |
|---|---|---|---|
| D40 | 2026-11-09 | Theory is always open; reading never creates progress, XP or status. Progress comes only from playing drills. | APPROVED |
| D41 | 2026-11-09 | Curriculum assumes no starting point; optional placement check only suggests a level, never marks anything solid. | APPROVED |
| D42 | 2026-11-09 | Keep and extend the 22-category Compendium; Claude may add topics and organise it (Path of 5 levels + Compendium view). | APPROVED |
| D43 | 2026-11-09 | Theory drills are high-end phone minigames without a guitar: randomised keys, real examples in the owner's styles, never repetitive, difficulty in step with theory learned. | APPROVED |
| D44 | 2026-11-09 | Claude generates all Theory content, diagrams and interactive visuals; real examples where possible; nothing invented. References classified as Verified Analysis, Stylistic Association or Suggested Listening. | APPROVED |
| D45 | 2026-11-09 | Semantic IDs for categories, chapters, drills and missions (e.g. `theory.intervals`). | APPROVED |
| D46 | 2026-11-10 | Fretboard Explorer (owner's idea): pick a scale, chord or fingering system and see it on the neck in any key. Scope: major; natural/harmonic/melodic minor; major/minor pentatonic; blues; the 7 modes; modes of harmonic and melodic minor; symmetric scales; triads (with inversions per string set) and seventh arpeggios; whole neck, CAGED, 3NPS, 4NPS. Labels notes/intervals/degrees; Standard and Drop D (D63); sound opt-in (D61); reference only, no progress (D40). Lives in TOOLS, reachable from THEORY → Practice and from chapters/missions. Built in Phase 5 (music engine) in two slices: scales/modes/triads first, then CAGED/3NPS/4NPS. Look decided in the design conversation. | APPROVED (idea; detailed scope confirmed in Phase 5) — extended by D49 |
| D47 | 2026-11-10 | Theory Path layout = mockup "option 2 — roadmap line": a sober vertical line with one node per level (progress ring on the current level); each level expands into chapter rows showing the chapter, its drill and the drill state; a fixed "Continue" button. No locks (D40). Islands, "down the neck" and the combined neck-line options were rejected. | APPROVED (provisional) |
| D48 | 2026-11-11 | Theory pages keep the red accent for now. Using the Theory rail colour on the Theory pages (as Improv uses purple) is a possible future change, mocked on the canvas, not decided. | APPROVED (provisional) |
| D49 | 2026-11-11 | The Fretboard Explorer (D46) becomes the "Key & Scale Explorer", a page the owner considers fundamental: one choice (root + scale/mode) drives everything shown in the circle-of-fifths mockup page — key card (spelled notes, formula, key signature; modes show the parent key signature; relative and parallel keys), interactive circle of fifths (tap to change root), diatonic triads and sevenths with Roman numerals and function (minor also shows v/V and ♭VII; tapping a chord highlights it on the neck), the fretboard in the chosen system, and Learn/Practice links in the current key. Non-heptatonic scales adapt (pentatonic/blues use the parent key's chords; symmetric scales show the chords they contain). Must have easy access from anywhere; the access point is decided in the design conversation (Claude's recommendation: global shortcut — sidebar entry under search on desktop, top-bar icon on phone — plus "Open in Explorer" deep links preloaded with the key). | APPROVED (content); access point OPEN |

## Improvisation

| ID | Date | Decision | Status |
|---|---|---|---|
| D50 | 2026-11-09 | The 5 Gates stay, rebuilt as levels of missions with rules, success criteria and links to theory. Current exercises and progress migrate to Level 1. | APPROVED |
| D51 | 2026-11-09 | Missions show fretboard diagrams where applicable (look decided in design conversation). | APPROVED |
| D52 | 2026-11-11 | Improv ↔ Theory link (proposal in `DESIGN-NOTES.md`), shown as separate rails: (1) paired levels, Gate n ↔ Theory Level n; (2) each mission lists its related theory chapters with their drill state, "Recommended first" when not yet Solid, never a lock (D40, D50); (3) each chapter lists the missions that use it; (4) theory drills may reuse the active mission's key and transposition target; (5) HOME "Continue in Theory" suggests the chapter linked to today's mission first; (6) no combined percentage, each rail keeps its own evidence (D70, D71). **Condition (owner):** the link never cuts or condenses content on either side to make them match. Where Improv and Theory do not line up, content is extended (chapters or missions added), never trimmed. The same extend-don't-condense rule applies to any future alignment of content. | APPROVED |

## Exercise rules (whole app)

| ID | Date | Decision | Status |
|---|---|---|---|
| D60 | 2026-11-09 | No exercise has an answer time limit; difficulty never comes from shrinking the response window. | APPROVED |
| D61 | 2026-11-09 | Any exercise that needs sound to be solved is opt-in beforehand. | APPROVED |
| D62 | 2026-11-09 | No microphone or microphone-dependent exercises (this phase of the product). | APPROVED |
| D63 | 2026-11-09 | Only 6-string guitar, Standard and Drop D. | APPROVED |
| D64 | 2026-11-09 | Backing tracks not essential for now; missions name the background type only. | APPROVED (check later) |

## Progress model

| ID | Date | Decision | Status |
|---|---|---|---|
| D70 | 2026-11-09 | Evidence model: Not started → Practising → Solid (≥ 90 % in a round on 2 different days; Improv: all criteria on 2 different days) → Mastered (review ≥ 90 % after ≥ 14 days). Drills are graded by the app; missions are self-assessed. Bars segmented by level; counts shown as detail. | APPROVED (adjustable) |
| D71 | 2026-11-09 | Progress is computed from a dated activity log, never stored separately. No invented progress values. | APPROVED |

## Data, sync and security

| ID | Date | Decision | Status |
|---|---|---|---|
| D80 | 2026-11-09 | The account (cloud) progress is the source of truth. Owner uses PC and phone with the same account. | APPROVED |
| D81 | 2026-11-09 | Sync = current `main` behaviour + safeguards 1–3 (backup before replacing, never write before reading, ignore stale sessions). Implemented in Phase 3, one PR each, never mixed with UI. | APPROVED |
| D82 | 2026-11-09 | Keep localStorage key `shredRoadmapState_v10` and Firestore path `users/{uid}`. Schema changes are additive and versioned (`schemaVersion`); unknown fields are never dropped; backup before every migration. | APPROVED |
| D83 | 2026-11-09 | Reset Everything erases Technique, Improv, Theory and Creative progress and legacy DOJO data; keeps SETUP, the streak and the calendar; backs up first; applies to the account. | APPROVED |
| D84 | 2026-11-09 | Maximum security by default. The repo is public: nothing in it may be risky to read. Claude reports and fixes any security issue anywhere, in its own slice. | APPROVED |
| D85 | 2026-11-10 | Owner made the first manual backup of his app data (local copy + cloud screenshots), outside the repo folder. Verified complete with the offline backup checker. | DONE |
| D87 | 2026-11-10 | Firestore Rules inspected: only a signed-in user can read/write `users/{own uid}`; everything else is denied. Kept as they are; no change in Phase 0. | APPROVED |
| D88 | 2026-11-10 | GitHub Secret Protection and Push protection enabled on the repo (owner). Firebase plan confirmed: Spark (free, no billing). | DONE |
| D89 | 2026-11-10 | Authorised sign-in domains reduced: `localhost` removed. `shred-auth.web.app` is a Firebase default that cannot be removed; acceptable, since only the project owner can deploy to it. Kept: `henriquelimamartins.github.io`, `shred-auth.firebaseapp.com` (required for Google sign-in). | DONE |
| D90 | 2026-11-10 | Firebase browser API key restricted to websites `https://henriquelimamartins.github.io/*` and `https://shred-auth.firebaseapp.com/*`. Rollback: set Application restrictions to None. | DONE — owner tested login and sync on PC and phone 2026-11-10 |
| D91 | 2026-11-10 | App Check postponed; reassess before sharing the app with others. | APPROVED (2026-11-10) |
| D86 | 2026-11-09 | "Ask an AI" in Theory: idea for later. If approved, the API key never goes in code or browser (server-side function recommended). | OPEN |
| D99 | 2026-11-11 | Phase 3 (Safe data) plan, safety first and date bugs last, one PR per slice: **3.1** `schemaVersion: 1` + automatic on-device backups (last N snapshots under a separate localStorage key; `shredRoadmapState_v10` untouched); **3.2** safeguard 1: snapshot before every whole-state replacement (sign-in sync, "Load from cloud", Reset); **3.3** safeguard 2: no cloud write before the cloud has been read, including the daily reset on first load; **3.4** safeguard 3: stale sessions never overwrite newer cloud data; **3.5** Reset Everything as D83; **3.6** extra streak day fix (D33-1); **3.7** local-day fix (D33-2); **3.8** UI only: "Download backup" / "Restore backup". Backups stay on the device (Firestore Rules only allow `users/{uid}`, D87). Each persistence/sync slice (3.1–3.5) needs its own detailed decision recorded before implementation; 3.8 needs one too. Ends with tag `v1-phase-3`. | APPROVED |
| D100 | 2026-11-11 | Data shape for custom SETUP guitars (idea I01) reserved now, written only when the feature is built (after Phase 4) as `schemaVersion` 2: a new additive list `setupGuitars` of entries `{ id, name, params, overrides }` (`params` = the answers the app asks for; `overrides` = values the owner sets by hand, option C). The PRS and the Epiphone become built-in presets that are never stored in that list; `setupGuitar: "prs"` / `"epi"` keep working unchanged, and a custom guitar is selected by its `id`. Nothing is written in Phase 3. | APPROVED |
| D101 | 2026-11-11 | Slice 3.1 detail. (1) State gets `schemaVersion: 1`; data without it is version 0; migration 0→1 only adds the field, and runs only after a backup succeeded (if the backup cannot be written, the migration is skipped and the app works as today). (2) New localStorage key `shredRoadmapBackups_v1`: list of snapshots `{ at, reason, schemaVersion, state }`, newest kept, maximum 20, oldest dropped first. (3) One automatic `daily` snapshot on the first start-up of each day, plus one before each migration. (4) `shredRoadmapState_v10` and Firestore `users/{uid}` unchanged (D82); backups are never sent to the cloud. (5) Rule recorded now, enforced in 3.4: if stored data has a higher `schemaVersion` than the app knows, the app writes nothing. Out of scope: download/restore UI (3.8), snapshots before replacements (3.2), any visual change. Rollback: revert the PR (older code keeps the extra field and ignores the extra key). | APPROVED |

## Open contradictions (to be resolved by the owner)

| ID | Found | Contradiction | Status |
|---|---|---|---|
| C01 | 2026-11-10 | D23 says the app holds no copied BHGS material, but `main` contains two Bradley Hall PDFs (`music-theory-cheat-sheet.pdf`, `scales-handbook.pdf`), served publicly by GitHub Pages and present in the public Git history of every branch. | RESOLVED 2026-11-10: owner chose to keep both PDFs as they are (option a) |
| C02 | 2026-11-10 | D20 keeps "the red phase bar identical"; in the current app it is fixed at the top of every page, while the D16 mockups show it on HOME and as a mini-rail in the desktop sidebar. | RESOLVED 2026-11-10: HOME + desktop sidebar only (D25) |
| C03 | 2026-11-11 | The overhaul plan's security table put the Content Security Policy in Phase 1, but Phase 1 closed without it. | RESOLVED 2026-11-11: CSP becomes slice 2.6 (D96) |
