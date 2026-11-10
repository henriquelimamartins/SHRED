# CHECKPOINT — The Shred Roadmap

**Updated:** 2026-11-10 · **Current phase:** 1 · Safety net — slice 1.2 delivered on `phase-1/persistence-tests`, awaiting owner PR
**Sources of truth:** `DECISIONS.md` (owner-approved decisions), this file, then the code on `main`.
**Full plan:** "The Shred Roadmap — Plano revisto (overhaul)", Claude Docs, 9 Nov 2026.
The previous ChatGPT-era checkpoint is in Git history; it is context only (DECISIONS D07).

## Where things stand

- `main` = the live app (Phase 1 UI). Only Technique is fully implemented. Deployed to GitHub Pages from `main`.
- `phase-2-dojo-shell` = archived candidate, not merged (D05). `baseline-original` = untouched original.
- App code (`index.html`) unchanged in the overhaul so far.
- Automated tests: Playwright, Firebase stubbed, clock fixed at 2026-11-10 12:00 UTC, desktop + mobile. On `main`: smoke suite (1.1). On `phase-1/persistence-tests`: + persistence/sync suite (1.2); 28/28 pass.
- Owner's real progress lives in Firestore `users/{uid}` and localStorage `shredRoadmapState_v10`.
- Local working copy: `C:\Users\Henri\Dev\SHRED` (fresh clone, outside OneDrive, D92). Old OneDrive copy `SHRED-OLD-nao-usar` may now be deleted by the owner.
- The copies of `DECISIONS.md` / `CHECKPOINT.md` in `project-docs/` are synced with the project versions at the end of each slice.
- PR #3 accidentally committed `Claude outputs/` (two app screenshots the Claude desktop app saved into the repo folder; harmless). Slice 1.2 adds it to `.gitignore`; the owner deletes the folder in the same PR.

## Phase 0 — Foundations — COMPLETE (2026-11-10)

| Slice | Status |
|---|---|
| 0.1 Backup of owner data (local JSON + cloud screenshots) | DONE — verified 2026-11-10 |
| 0.2 `DECISIONS.md` created | DONE — merged in PR #2 (2026-11-10) |
| 0.3 One-page `CHECKPOINT.md` | DONE — merged in PR #2 (2026-11-10) |
| 0.4 Security review | DONE — Rules correct (D87); secret scanning on, plan Spark (D88); domains reduced (D89); API key restricted (D90); App Check postponed (D91) |
| 0.5 Tag `v1-pre-overhaul` on current `main` | DONE 2026-11-10 (tag on commit a339956) |
| 0.6 Resolve contradiction C01 (Bradley Hall PDFs in public repo) | RESOLVED — PDFs kept |

## Phase 1 — Safety net (automated tests of current `main`, no app behaviour changes)

| Slice | Status |
|---|---|
| Preparation: repo moved out of OneDrive (D92) | DONE 2026-11-10 |
| 1.1 Test setup: Playwright + Firebase stubs + smoke test (Home loads; 6 main views open; no errors; no Firebase traffic; no cloud writes), desktop + mobile | DONE — merged in PR #3 (2026-11-10); 4/4 pass on merged `main` |
| 1.2 Persistence and sync tests (current behaviour): local save/reload, unknown fields kept, sign-in sync, signed-in writes, manual Save/Load, Reset Everything | DELIVERED 2026-11-10 on `phase-1/persistence-tests` — 28/28 pass; awaiting owner commit + PR |
| 1.3 Technique tests (phases, chops, tests, checks) | NOT STARTED |
| 1.4 DAILY, calendar and streak tests (fixed clock) | NOT STARTED |
| 1.5 Improv, Setup, Library, Dojo tests | NOT STARTED |
| 1.6 Run the tests automatically on every PR (GitHub Actions) | NOT STARTED |

## Next phases

2 Split files → 3 Safe data (sync safeguards, reset, schemaVersion) → 4 Design and navigation → 5 Music engine → 6 Theory v1 → 7 Musical Development + Improv v1 → 8 DAILY integrated → 9 Continuous content.

## Known risks

- Sync: cloud overwrites local on login, and local-only fields are lost; writes can happen before the read finishes (fixed in Phase 3, D81). Covered by `current behaviour` tests in 1.2.
- On the first load of a new day, the app writes the cloud state straight back (daily reset) without any user action (found in 1.2; relevant to safeguard 2, D81).
- Reset Everything currently also wipes streak, calendar, SETUP and unknown fields, and overwrites the cloud with no backup (fixed in Phase 3, D83). Covered by `current behaviour` tests in 1.2.
- Firestore Rules protect each account's document, but cannot stop the app itself from overwriting good data with stale data; that is what the Phase 3 sync safeguards fix.
- GitHub Pages deploys the whole repository, so the test files are publicly served too. They contain nothing sensitive (D84); excluding them from the deploy is a possible later slice.
