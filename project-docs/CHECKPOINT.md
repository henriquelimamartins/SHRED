# THE SHRED ROADMAP — PROJECT CHECKPOINT

**Last updated:** 31 October 2026  
**Current stage:** Phase 1 — review of Gemini implementation  
**Approval status:** NOT APPROVED YET

## Current GitHub setup

- Repository: https://github.com/henriquelimamartins/SHRED
- Public repository; GitHub Pages: https://henriquelimamartins.github.io/SHRED/
- `main` is the deployment branch, using `.github/workflows/static.yml`.
- The Gemini Phase 1 `index.html` was uploaded to `main` for testing and may be live.
- `phase-1-ui` was created from the then-current `main`; it is therefore a snapshot of the Gemini Phase 1 version, not the original baseline.
- The original baseline has not yet been preserved in a dedicated branch.

## Source files and references

| Role | File / location | Status |
|---|---|---|
| Original baseline | `index (9).html` | Original source of truth from Phase 0; keep untouched |
| Gemini Phase 1 | `index.html` in `main` and `phase-1-ui` | Uploaded; awaiting full audit |
| Requirements | `project-docs/MASTERPLAN.md` | This Markdown conversion |
| Live checkpoint | `project-docs/CHECKPOINT.md` | This document |
| Phase history | `project-docs/PHASE_LOG.md` | Record approvals and decisions |

## Project identity

A premium, comprehensive musicianship-learning application. General music theory is the foundation; guitar applications are a separate practical layer. App language is English. Desktop and mobile have equal priority. The learning experience must be substantial and academically informed, not a shallow quiz app.

## Phase 0 audited baseline

- Six areas: HOME, DAILY, IMPROV, DOJO, LIBRARY and SETUP.
- Preserve DAILY routines, checklists, phase progression and streak tracking.
- Preserve the five IMPROV Gates and user progress during Phase 1.
- LIBRARY includes roadmap/resources, Expression Track, Listening Vault, Creative, Bonus Content and Guide.
- SETUP contains guitar/tuning and maintenance utilities.
- DOJO will be substantially rebuilt in later phases; Phase 1 must not start that rebuild.
- Original architecture: single-file HTML/CSS/JS.
- Observed localStorage key: `shredRoadmapState_v10`.
- Firebase Google Authentication and Firestore sync were present; observed path: `users/{uid}`.
- Firestore security rules have not been inspected. Do not claim they are secure.

These are historical audit observations. Re-verify against the actual source before modifying code.

## Non-negotiable safeguards

1. Keep the untouched original HTML baseline.
2. Never develop directly on `main`.
3. Preserve existing features and user data unless a phase explicitly authorises a change with a migration plan.
4. During Phase 1, preserve `shredRoadmapState_v10`, Firebase configuration, Google Auth, Firestore path `users/{uid}` and the state schema.
5. Preserve local persistence and cloud synchronisation.
6. Keep static curriculum content separate from user-specific progress.
7. Use additive, versioned migrations for future schema changes.
8. Do not gate learning content behind XP.
9. Require complete HTML deliverables, not snippets or “rest unchanged”.
10. Distinguish static code inspection from actual browser/Firebase testing.
11. Never publish an unapproved development version to `main`.

## Phase plan

| Phase | Scope | Status |
|---|---|---|
| 0 | Audit and architecture | COMPLETE |
| 1 | Responsive UI and navigation | IN REVIEW — not approved |
| 2 | DOJO shell and syllabus | Pending |
| 3 | Compendium foundations and harmony | Pending |
| 4 | Advanced theory Compendium | Pending |
| 5 | Interactive Fretboard Mastery | Pending |
| 6 | Harmonic Analysis Lab | Pending |
| 7 | IMPROV redesign and five Gates | Pending |
| 8 | Listening Vault redesign | Pending |
| 9 | Learning path, exercises, assessment and review | Pending |
| 10 | Integration, regression and release audit | Pending |

## Phase 1 review scope

Phase 1 covers responsive UI and navigation only. Do not implement new educational content or rebuild learning systems.

Acceptance checks:
- Six sections remain accessible.
- Desktop/tablet/mobile work at 1440, 1024, 768, 390 and 360 px.
- No horizontal overflow; browser zoom remains available.
- DAILY, IMPROV, LIBRARY and SETUP functionality and progress remain intact.
- DOJO remains accessible, with no new XP locks.
- localStorage key, state schema, Firebase config/auth and Firestore path remain unchanged.
- No unrelated feature is removed or simplified.
- Complete HTML and a truthful test report are delivered.

Initial static review points to verify, not yet final defects:
- Global search appeared to be a placeholder.
- Mobile navigation labels appeared very small (about 8.5 px).
- Scrollbars appeared globally hidden.

## Immediate next actions

1. Keep `phase-1-ui`; do not delete it.
2. Open the `index.html` commit history: https://github.com/henriquelimamartins/SHRED/commits/main/index.html
3. Identify the commit immediately before the Gemini Phase 1 upload.
4. Create `baseline-original` from that exact commit, not from current `main`.
5. Share the branch/commit link for confirmation.
6. Audit `phase-1-ui/index.html` against the original baseline and this Masterplan.
7. Classify the result as PASS, PASS WITH WARNINGS or NEEDS FIXES.
8. Correct issues on the development branch and re-audit.
9. Merge into `main` through a Pull Request only after approval.
10. Do not begin Phase 2 until Phase 1 is approved.

## Branch policy

- `main`: approved stable version only.
- `phase-1-ui`, `phase-2-dojo`, etc.: phase-specific development branches.
- `baseline-original`: immutable reference branch at the original baseline commit.
- Download and retain a local copy of every complete Gemini deliverable.
- Start each new phase from the latest approved `main`.

## Roles

**Gemini Pro:** implements only the requested phase; inspects the current full HTML; returns complete HTML, changelog, changed functions/state, migration notes, test results and limitations.

**ChatGPT:** protects project intent, reviews code and reports, identifies regressions and prepares correction prompts. It must not claim tests it has not run.

**User:** owns the project, keeps backups, downloads Gemini deliverables, uploads to the correct branch, runs requested manual tests and approves releases.

## Recovery prompt for a new ChatGPT conversation

We are continuing The Shred Roadmap. Read `project-docs/MASTERPLAN.md`, `project-docs/CHECKPOINT.md` and `project-docs/PHASE_LOG.md` from https://github.com/henriquelimamartins/SHRED. The Masterplan is authoritative for product requirements; the Checkpoint records current execution; the Phase Log records history. Phase 1 is under review. `phase-1-ui` was created from current `main` after the Gemini Phase 1 file had already been uploaded to `main`, so it is not the original baseline. The original commit still needs to be identified and preserved as `baseline-original`. Do not approve Phase 1 or proceed to Phase 2 until the full code has been compared with the original and requirements. Explain technical steps simply.
