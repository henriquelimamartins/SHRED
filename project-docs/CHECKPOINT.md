# CHECKPOINT — The Shred Roadmap

**Updated:** 2026-11-10 · **Current phase:** 1 · Safety net — slice 1.1 delivered, awaiting owner PR
**Sources of truth:** `DECISIONS.md` (owner-approved decisions), this file, then the code on `main`.
**Full plan:** "The Shred Roadmap — Plano revisto (overhaul)", Claude Docs, 9 Nov 2026.
The previous ChatGPT-era checkpoint is in Git history; it is context only (DECISIONS D07).

## Where things stand

- `main` = the live app (Phase 1 UI). Only Technique is fully implemented. Deployed to GitHub Pages from `main`.
- `phase-2-dojo-shell` = archived candidate, not merged (D05). `baseline-original` = untouched original.
- App code (`index.html`) unchanged in the overhaul so far.
- Automated tests: Playwright smoke suite on branch `phase-1/test-setup` (slice 1.1), Firebase stubbed, desktop + mobile.
- Owner's real progress lives in Firestore `users/{uid}` and localStorage `shredRoadmapState_v10`.
- Local working copy: `C:\Users\Henri\Dev\SHRED` (fresh clone, outside OneDrive, D92). Old OneDrive copy kept as `SHRED-OLD-nao-usar` until the first Phase 1 PR is merged.
- The copies of `DECISIONS.md` / `CHECKPOINT.md` in `project-docs/` are synced with the project versions in slice 1.1.

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
| 1.1 Test setup: Playwright + Firebase stubs + smoke test (Home loads; 6 main views open; no errors; no Firebase traffic; no cloud writes), desktop + mobile | DELIVERED 2026-11-10 on `phase-1/test-setup` — 4/4 tests pass; awaiting owner commit + PR |
| 1.2+ (to be proposed: Technique, DAILY, Improv, Setup, persistence/sync behaviour as it is today) | NOT STARTED |

## Next phases

2 Split files → 3 Safe data (sync safeguards, reset, schemaVersion) → 4 Design and navigation → 5 Music engine → 6 Theory v1 → 7 Musical Development + Improv v1 → 8 DAILY integrated → 9 Continuous content.

## Known risks

- Sync: cloud overwrites local on login; writes can happen before the read finishes (fixed in Phase 3, D81).
- Reset Everything currently also wipes streak and calendar and has no backup (fixed in Phase 3, D83).
- Firestore Rules protect each account's document, but cannot stop the app itself from overwriting good data with stale data; that is what the Phase 3 sync safeguards fix.
- GitHub Pages deploys the whole repository, so the test files are publicly served too. They contain nothing sensitive (D84); excluding them from the deploy is a possible later slice.
