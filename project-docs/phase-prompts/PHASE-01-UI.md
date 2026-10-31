# PHASE 1 — RESPONSIVE UI AND NAVIGATION FOUNDATION

Read `MASTERPLAN.md` and `CHECKPOINT.md` first. Inspect the complete current `index.html` before editing and state the exact architecture and code areas you plan to change.

## Objective
Improve visual structure, navigation and responsive behaviour while preserving the existing identity and functionality. This phase is UI/navigation only. Do not implement new educational content or rebuild learning systems.

## Design
Preserve the dark visual identity. Desktop should use available width effectively, potentially with persistent sidebar navigation. Mobile navigation must remain compact, intuitive and touch-friendly. Tablet must adapt naturally. Keep HOME, DAILY, IMPROV, DOJO, LIBRARY and SETUP accessible.

## Non-negotiable preservation
Do not replace the app with a simplified rewrite; remove or rename sections; remove existing features; change Firebase project configuration, Google Auth, Firestore path `users/{uid}`, localStorage key `shredRoadmapState_v10`, state schema or progress data; add XP restrictions; or implement the new DOJO curriculum.

Preserve Daily practice, checklists, streaks, phase progression, Improv Gates, Library, Setup, local persistence and cloud sync.

## Accessibility
Remove `user-scalable=no`; respect browser zoom; prevent horizontal overflow; use readable text and adequate contrast; ensure touch-friendly controls.

## Technical requirements
Keep the single-file architecture unless essential. Prefer targeted changes, reuse existing rendering/event handling, avoid duplicate state and unnecessary dependencies. Do not alter Firebase or persistence logic.

## Testing
Check 1440, 1024, 768, 390 and 360 px. Verify navigation, Daily, Improv progress, Library, Setup, Google sign-in if tested in a real browser, local persistence, and absence of layout overflow. Do not claim Firebase runtime tests unless actually performed.

## Deliverables
Return complete `index.html`, change summary, changed functions/structures/state fields, preservation confirmation, migration concerns, test checklist distinguishing tested from unverified, and known limitations. Never use placeholders such as “rest of code unchanged”. Stop and explain if safe completion requires larger architectural changes.
