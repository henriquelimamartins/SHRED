# THE SHRED ROADMAP
## PROJECT CHECKPOINT — PHASE 1 APPROVED / PHASE 2 NEXT

**Current status:** Phase 1 completed, tested, approved and integrated into `main`. Phase 2 is the next implementation phase.

**Last completed phase:** Phase 1 — Responsive UI and Navigation Foundation  
**Next phase:** Phase 2 — DOJO Information Architecture and Compendium Shell

---

## 1. Purpose of this document

This checkpoint is the portable handover document for The Shred Roadmap.

It records the product vision, technical safeguards, current implementation status, completed work and exact next actions. It should allow the project to continue in a new ChatGPT conversation without relying on the full chat history.

The Project Master Document remains the ultimate authority for the product vision, requirements and full phase plan.

---

## 2. Project identity and goal

The Shred Roadmap is a premium, comprehensive music-learning web application.

Its purpose is to develop broad musicianship first and guitar-specific fluency second, covering:

- Music theory and musical literacy.
- Harmonic analysis.
- Fretboard knowledge and fluency.
- Improvisation and phrasing.
- Composition and genre literacy.

This must be a serious, long-term learning platform, not a shallow quiz application.

### Confirmed product principles

- The app and curriculum are in English.
- Desktop and mobile have equal priority.
- The visual identity should remain dark, modern and distinctive.
- The app should support both a recommended learning path and free exploration.
- Learning content must never be locked behind XP or artificial progression requirements.
- General music theory is the foundation; guitar applications are a separate practical layer.
- Content should be academically substantial, accurate and progressively disclosed.
- Preserve useful existing functionality and user data.

---

## 3. Existing application and technical foundations

The original application was a single-file HTML/CSS/JavaScript application.

The original authoritative baseline is `index (9).html`, preserved separately in the `baseline-original` branch.

The application has six top-level areas:

1. HOME
2. DAILY
3. DOJO
4. IMPROV
5. LIBRARY
6. SETUP

Important existing technical foundations:

- localStorage key: `shredRoadmapState_v10`
- Optional Google Authentication through Firebase.
- Firestore user document path: `users/{uid}`.
- Existing daily routines, checklists, progress and streak tracking.
- Five existing IMPROV_GATES and their progress.
- Existing guitar and tuning setup utilities.

The original baseline must remain available as a recovery and comparison reference.

### Technical safeguards

- Do not remove unrelated functionality.
- Do not overwrite the original baseline.
- Do not change Firebase project configuration, authentication behaviour or Firestore paths without explicit justification and a migration plan.
- Preserve existing user data and local persistence.
- Keep static curriculum definitions separate from user-specific progress.
- Prefer additive, versioned changes to the user-state schema.
- Do not claim Firebase security rules are secure unless they have actually been inspected.
- Do not introduce XP-based content locks.
- Do not deliver partial HTML or placeholders in place of a complete working file.

---

## 4. Branch strategy and current repository status

Repository: `https://github.com/henriquelimamartins/SHRED`

GitHub Pages:
`https://henriquelimamartins.github.io/SHRED/`

Branches and their intended roles:

| Branch | Purpose |
|---|---|
| `main` | Approved/stable application and canonical project documentation |
| `baseline-original` | Untouched original application reference |
| `phase-1-ui` | Original Phase 1 development branch; retained as implementation history |
| `phase-1-integration` | Integration branch created from `main` to introduce the approved Phase 1 implementation; its Pull Request was merged |
| `phase-2-dojo-shell` | Phase 2 development branch; create from the current `main` if not already created |

### Phase 1 approval and merge

The user confirmed that all Phase 1 tests passed successfully.

Phase 1 is therefore approved.

The original Phase 1 implementation was developed in `phase-1-ui`. Because the contents of `main` had diverged from the approved implementation, an integration branch named `phase-1-integration` was created from the then-current `main`, and the approved Phase 1 `index.html` was introduced there. The user confirmed that the Pull Request from `phase-1-integration` was merged into `main`.

Therefore, Phase 1 integration into `main` is COMPLETE. Do not repeat that merge.

The `baseline-original` branch must remain untouched.

The Phase 2 development branch, `phase-2-dojo-shell`, must be created from the current `main` if it has not already been created. Do not begin Phase 2 from the original baseline or from an outdated copy of the application.

---

## 5. Phase 1 — Responsive UI and Navigation Foundation

**Status: COMPLETE — TESTED AND APPROVED**

The Phase 1 implementation was initially produced by Gemini in the `phase-1-ui` branch. It was subsequently introduced into the then-current `main` through the `phase-1-integration` branch.

The user manually tested the implementation and confirmed that all tests passed successfully.

The test coverage included:

- Responsive layouts at desktop, tablet and mobile sizes.
- Navigation between the six main sections.
- Active navigation indicators.
- Desktop and mobile scrolling.
- DAILY functionality and task interactions.
- IMPROV Gates and exercise completion.
- DOJO navigation and existing modules.
- LIBRARY navigation.
- SETUP controls.
- Local persistence after refreshing.
- Authentication and synchronisation tests where applicable.

The user reported successful completion of all tests.

Phase 1 is approved and its integration into `main` through the `phase-1-integration` Pull Request is COMPLETE, as confirmed by the user.

The following design decisions were explicitly accepted:

- Global scrollbars remain hidden as an intentional design choice.
- Existing small navigation typography is acceptable and should not be enlarged unnecessarily.
- Browser zoom must remain enabled.

---

## 6. DOJO — confirmed structure and requirements

The DOJO is being rebuilt as the central educational area of the application.

Its three connected areas are:

### 6.1 Music Theory Compendium

A comprehensive, structured reference and learning resource covering music theory from foundational to advanced concepts.

It should include:

- Definitions and terminology.
- Derivations and construction methods.
- Classifications and variations.
- Relationships between concepts.
- Musical effects and applications.
- Historical context where relevant.
- Exceptions and misconceptions.
- Worked examples.
- Guitar applications.
- Varied exercises and solutions.
- Links to related chapters.

### 6.2 Fretboard Mastery

A practical and theoretical learning area covering:

- Notes and their locations.
- Intervals and string relationships.
- Scales and positions.
- Triads and inversions.
- Arpeggios and chord voicings.
- CAGED and alternative systems.
- Connecting shapes to keys and harmonic functions.
- Target notes and phrase resolution.

The objective is to understand the theory behind the fretboard, not simply memorise shapes.

### 6.3 Harmonic Analysis Lab

A guided environment for analysing harmony, including:

- Tonal centres and Roman numerals.
- Diatonic and non-diatonic chords.
- Harmonic functions and cadences.
- Secondary dominants.
- Modal interchange and borrowed chords.
- Modulation and tonicisation.
- Pedal tones and drones.
- Ambiguous harmony.
- Harmonic rhythm.

Alternative interpretations should be explained when a progression allows more than one valid analysis.

---

## 7. Confirmed curriculum decisions

- Use note letters (A, B, C), chord symbols and Roman numerals.
- Formal staff reading is not required.
- Key signatures and accidentals remain important.
- Theory should be genre-general.
- Relevant examples should include stoner, doom, sludge, progressive metal, death metal, thrash and blues. Classic rock is useful but lower priority.
- Exercises should include construction, identification, analysis, diagnosis, comparison, transposition, application and problem-solving.
- Avoid repetitive multiple-choice quiz banks.
- Do not fabricate musical examples, analyses or references.

### IMPROV — five Gates

1. The Horizontal Prison
2. The Chord Tone Architect
3. The Rhythmic Displacer
4. The Modal Alchemist
5. Total Audiation

### LIBRARY — Listening Vault

The Listening Vault will eventually become a searchable and filterable listening and analysis resource with:

- Tracks and relevant passages.
- Musical context.
- Listening objectives.
- Harmonic, melodic, rhythmic and phrasing analysis.
- Guitar applications.
- Links to DOJO chapters and IMPROV Gates.
- Bookmarks and personal notes.

Do not fabricate timestamps, progressions, analyses or URLs.

---

## 8. Phase plan and status

| Phase | Description | Status |
|---|---|---|
| 0 | Audit and Architecture | COMPLETE |
| 1 | Responsive UI and Navigation Foundation | COMPLETE — APPROVED |
| 2 | DOJO Information Architecture and Compendium Shell | NEXT |
| 3 | Compendium Foundations and Harmony | NOT STARTED |
| 4 | Advanced Theory Compendium | NOT STARTED |
| 5 | Interactive Fretboard Mastery | NOT STARTED |
| 6 | Harmonic Analysis Lab | NOT STARTED |
| 7 | IMPROV Redesign and Five Gates | NOT STARTED |
| 8 | Listening Vault Redesign | NOT STARTED |
| 9 | Learning Path, Exercises, Assessment and Review | NOT STARTED |
| 10 | Integration, Regression and Release Audit | NOT STARTED |

Only one implementation phase should be active at a time.

Do not begin the next phase until the current phase has been reviewed, tested and approved.

---

## 9. Next action — Phase 2

**PHASE 2 — DOJO INFORMATION ARCHITECTURE AND COMPENDIUM SHELL**

The objective is to build the new DOJO framework and curriculum map without rushing the educational content.

Phase 2 should:

1. Rebuild the DOJO learning experience from scratch.
2. Create the three main areas: Music Theory Compendium, Fretboard Mastery and Harmonic Analysis Lab.
3. Create the Compendium's hierarchical syllabus.
4. Establish categories, chapters, subchapters and prerequisites.
5. Support recommended progression and free exploration.
6. Add chapter search/filtering and progress states.
7. Create a reusable chapter page template.
8. Create coherent landing pages for Fretboard Mastery and Harmonic Analysis Lab.
9. Separate static curriculum definitions from per-user progress.
10. Preserve all unrelated application functionality and existing user data.

Do not attempt to write the entire encyclopaedia or implement the detailed interactive fretboard and harmonic analysis tools in this phase.

### Files to provide to Gemini

- The latest complete `index.html` from the approved Phase 1 implementation.
- The Project Master Document.
- The Phase 2 prompt.

### Required Gemini deliverables

- Complete updated `index.html`.
- Syllabus tree and chapter hierarchy.
- Reusable chapter page template.
- Proposed data schema for curriculum and user progress.
- Change log.
- List of modified functions, styles and state fields.
- Migration notes, if any.
- Manual test checklist.
- Known limitations and unfinished work.

The resulting implementation must be reviewed and tested before merging into `main`.

---

## 10. Instructions for continuing in a new ChatGPT conversation

We are continuing The Shred Roadmap.

Read this checkpoint and the Project Master Document before making recommendations.

The Project Master Document is the authority for the product vision and requirements.

Current status:

- Phase 0 is complete.
- Phase 1 has passed all user-reported tests and is approved.
- The Phase 1 implementation was initially developed in `phase-1-ui`.
- The approved implementation was introduced through `phase-1-integration`, and the user confirmed that its Pull Request was merged into `main`. Do not repeat this merge.
- Phase 2 is the next implementation phase. A dedicated ChatGPT conversation has been created for Phase 2.
- Create `phase-2-dojo-shell` from the current `main` if it has not already been created. Attach the latest approved complete `index.html`, the Project Master Document and the Phase 2 prompt before implementation.

The next task is to help prepare, review and guide the Phase 2 implementation.

Do not assume that Gemini's output is correct merely because it follows the prompt. Review the complete source, compare it with the requirements and distinguish static inspection from actual browser testing.

Preserve the project's scope, depth, architecture and safeguards.
