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

## Product structure

| ID | Date | Decision | Status |
|---|---|---|---|
| D10 | 2026-11-09 | Goal: the app is the owner's go-to for everything guitar, built on three pillars: Technique, Improvisation, Theory. | APPROVED |
| D11 | 2026-11-09 | Structure: 3 pillars + DAILY + 7 destinations (HOME, DAILY, TECHNIQUE, IMPROV, THEORY, LIBRARY, TOOLS). | APPROVED |
| D12 | 2026-11-09 | The Theory pillar is named THEORY. The name DOJO disappears from the app. | APPROVED |
| D13 | 2026-11-09 | TECHNIQUE ROADMAP and MUSICAL DEVELOPMENT stay independent. MUSICAL DEVELOPMENT covers Theory + Improv. | APPROVED |
| D14 | 2026-11-09 | Position, format and colours of the progress bars are decided in the design conversation. | APPROVED (deferred) |
| D15 | 2026-11-09 | Visual direction: dark + red is only a starting hypothesis; 2–3 mockups before coding (Phase 4). | APPROVED (deferred) |

## Technique

| ID | Date | Decision | Status |
|---|---|---|---|
| D20 | 2026-11-09 | All BHGS content (phases, exercises, chop-builders, tests, progress, DAILY workouts) is protected. Calculations, state keys and the red phase bar stay identical. | APPROVED |
| D21 | 2026-11-09 | Optional improvements approved, all additive: dated chop/test history, BPM log, session note, built-in metronome. | APPROVED |
| D22 | 2026-11-09 | "Reinforce Weakest" may be reformulated; owner still thinking. | OPEN |
| D23 | 2026-11-09 | BHGS content in the app is direct Patreon links only, no copied material. In any shared version all Bradley Hall content is removed. | APPROVED — exception: the two Bradley Hall PDFs stay (C01) |
| D24 | 2026-11-09 | BHGS theory videos and micro-doses (including Sight-Reading) stay in DAILY as they are. | APPROVED |

## DAILY

| ID | Date | Decision | Status |
|---|---|---|---|
| D30 | 2026-11-09 | Keep the daily routine where the app says what to practise each day. Timeslots stay as they are (Technique + Improv). Theory is not daily; it is for free time. | APPROVED |
| D31 | 2026-11-09 | Writing/songwriting stays outside the app: no Create track, no writing slots; writing mentions in DAILY are replaced (Tuesday → Improv mission). | APPROVED |
| D32 | 2026-11-09 | Weekend DAILY sessions become lighter (20–30 min). | APPROVED |

## Theory

| ID | Date | Decision | Status |
|---|---|---|---|
| D40 | 2026-11-09 | Theory is always open; reading never creates progress, XP or status. Progress comes only from playing drills. | APPROVED |
| D41 | 2026-11-09 | Curriculum assumes no starting point; optional placement check only suggests a level, never marks anything solid. | APPROVED |
| D42 | 2026-11-09 | Keep and extend the 22-category Compendium; Claude may add topics and organise it (Path of 5 levels + Compendium view). | APPROVED |
| D43 | 2026-11-09 | Theory drills are high-end phone minigames without a guitar: randomised keys, real examples in the owner's styles, never repetitive, difficulty in step with theory learned. | APPROVED |
| D44 | 2026-11-09 | Claude generates all Theory content, diagrams and interactive visuals; real examples where possible; nothing invented. References classified as Verified Analysis, Stylistic Association or Suggested Listening. | APPROVED |
| D45 | 2026-11-09 | Semantic IDs for categories, chapters, drills and missions (e.g. `theory.intervals`). | APPROVED |

## Improvisation

| ID | Date | Decision | Status |
|---|---|---|---|
| D50 | 2026-11-09 | The 5 Gates stay, rebuilt as levels of missions with rules, success criteria and links to theory. Current exercises and progress migrate to Level 1. | APPROVED |
| D51 | 2026-11-09 | Missions show fretboard diagrams where applicable (look decided in design conversation). | APPROVED |

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
| D86 | 2026-11-09 | "Ask an AI" in Theory: idea for later. If approved, the API key never goes in code or browser (server-side function recommended). | OPEN |

## Open contradictions (to be resolved by the owner)

| ID | Found | Contradiction | Status |
|---|---|---|---|
| C01 | 2026-11-10 | D23 says the app holds no copied BHGS material, but `main` contains two Bradley Hall PDFs (`music-theory-cheat-sheet.pdf`, `scales-handbook.pdf`), served publicly by GitHub Pages and present in the public Git history of every branch. | RESOLVED 2026-11-10: owner chose to keep both PDFs as they are (option a) |
