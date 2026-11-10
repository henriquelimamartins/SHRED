# CHECKPOINT — The Shred Roadmap

**Updated:** 2026-11-10 · **Current phase:** 0 · Foundations — IN PROGRESS
**Sources of truth:** `DECISIONS.md` (owner-approved decisions), this file, then the code on `main`.
**Full plan:** "The Shred Roadmap — Plano revisto (overhaul)", Claude Docs, 9 Nov 2026.
The previous ChatGPT-era checkpoint is in Git history; it is context only (DECISIONS D07).

## Where things stand

- `main` = the live app (Phase 1 UI). Only Technique is fully implemented. Deployed to GitHub Pages from `main`.
- `phase-2-dojo-shell` = archived candidate, not merged (D05). `baseline-original` = untouched original.
- No automated tests exist yet. No code has been changed in the overhaul.
- Owner's real progress lives in Firestore `users/{uid}` and localStorage `shredRoadmapState_v10`.

## Phase 0 — Foundations (no app code changes)

| Slice | Status |
|---|---|
| 0.1 Backup of owner data (local JSON + cloud screenshots) | DONE — verified 2026-11-10 |
| 0.2 `DECISIONS.md` created | Drafted, awaiting owner approval + PR |
| 0.3 One-page `CHECKPOINT.md` | Drafted (this file), awaiting PR |
| 0.4 Security review: Firestore Rules, authorised domains, API key restriction, GitHub secret scanning, App Check assessment | Rules inspected and correct (D87). Remaining: API key referrer restriction, authorised domains, secret scanning, billing plan check |
| 0.5 Tag `v1-pre-overhaul` on current `main` | Pending (owner) |
| 0.6 Resolve contradiction C01 (Bradley Hall PDFs in public repo) | RESOLVED — PDFs kept |

**Acceptance for Phase 0:** backup confirmed complete; Firestore Rules only allow each user to read/write `users/{own uid}`; decisions recorded; tag created.

## Next phases

1 Safety net (automated tests of current `main`) → 2 Split files → 3 Safe data (sync safeguards, reset, schemaVersion) → 4 Design and navigation → 5 Music engine → 6 Theory v1 → 7 Musical Development + Improv v1 → 8 DAILY integrated → 9 Continuous content.

## Known risks

- Sync: cloud overwrites local on login; writes can happen before the read finishes (fixed in Phase 3, D81).
- Reset Everything currently also wipes streak and calendar and has no backup (fixed in Phase 3, D83).
- Firestore Rules protect each account's document, but cannot stop the app itself from overwriting good data with stale data; that is what the Phase 3 sync safeguards fix.
