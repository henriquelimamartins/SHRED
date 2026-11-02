# THE SHRED ROADMAP
## PROJECT CHECKPOINT — PHASE 1 APPROVED / PHASE 2 AUDIT NEXT

**Current project status:** Phase 1 completed, tested, approved and integrated into `main`. Phase 2 specification approved. Phase 2 implementation remains unapproved.

**Last completed implementation phase:** Phase 1 — Responsive UI and Navigation Foundation  
**Current authorised activity:** Phase 2 — Stage 1: Independent Audit and Implementation Plan  
**Phase 2 development branch:** `phase-2-dojo-shell`

---

## 1. Purpose and source of truth

This checkpoint is the portable handover document for The Shred Roadmap. It records the current project status, approved product decisions, technical safeguards and next authorised actions.

The source-of-truth hierarchy is:

1. `MASTERPLAN.md` — authoritative product vision and requirements.
2. `CHECKPOINT.md` — current project status and next actions.
3. `PHASE_LOG.md` — implementation history and approved milestones.
4. Latest approved complete `index.html` from `main` — authoritative application code.
5. Current approved phase specification — exact scope for the active phase.

The approved Phase 2 specification is `project-docs/PHASE-2-SPEC.md` on `phase-2-dojo-shell`.

Do not treat an unapproved implementation branch as an approved application baseline.

Keep `baseline-original` unchanged as the historical recovery reference. For new implementation work, use the latest approved complete `index.html` from `main`.

---

## 2. Project identity and product goal

The Shred Roadmap is a premium, comprehensive music-learning and musicianship application.

Its purpose is to develop broad musicianship first and guitar-specific fluency second, covering:

- General music theory and musical understanding.
- Harmonic analysis and functional harmony.
- Fretboard knowledge and practical fluency.
- Improvisation, phrasing and musical independence.
- Musical context, listening and genre literacy.
- Composition and creative application.

The application must feel like a serious, carefully edited, long-term learning environment, not a shallow quiz application or an XP-driven game.

### Confirmed product principles

- The application interface and curriculum are in English.
- Planning conversations with the owner are in European Portuguese.
- Desktop and mobile have equal priority.
- The visual identity remains dark, modern, distinctive and premium.
- The learning experience supports both a recommended path and free exploration.
- Theory content is always accessible. No XP, level or completion gate may restrict access.
- General music theory is the foundation. Guitar-specific application is a distinct practical layer.
- Educational content must be substantial, accurate, structured and readable.
- Visual resources are integral whenever they materially improve understanding.
- Preserve useful existing application functionality and user data.
- Progression must represent meaningful practical work, not the act of reading theory.

---

## 3. Application structure and technical foundations

The six official top-level areas are:

1. HOME
2. DAILY
3. DOJO
4. IMPROV
5. LIBRARY
6. SETUP

### DOJO

DOJO contains three connected learning areas:

1. Music Theory Compendium.
2. Fretboard Mastery.
3. Harmonic Analysis Lab.

### IMPROV

IMPROV retains five Gates:

1. The Horizontal Prison.
2. The Chord Tone Architect.
3. The Rhythmic Displacer.
4. The Modal Alchemist.
5. Total Audiation.

The official product/navigation label is `IMPROV`. In normal explanatory English, use natural expressions such as “improvisation exercises”, “the improvisation track” and “improvisational development”.

### LIBRARY

LIBRARY is the Listening Vault: a future searchable and filterable listening and musical-analysis resource.

### Technical foundations

The current application is based on the latest approved Phase 1 implementation in `main`, not on the older original file.

The inspected Phase 1 baseline has the following characteristics:

- Single-file HTML/CSS/JavaScript application.
- Responsive desktop and mobile layout.
- Existing local persistence.
- Optional Firebase Authentication with Google sign-in.
- Firestore user document path previously identified as `users/{uid}`.
- Existing application state and persistence mechanisms that must be verified in the current source before changes.
- Existing DAILY routines, task completion and technique progression.
- Existing IMPROV Gates and related state.
- Existing SETUP utilities.

The original `index (9).html` is a historical reference preserved through `baseline-original`; it is not the current implementation baseline.

The latest approved `index.html` from `main` must always be inspected before implementation. Technical details such as state fields, localStorage keys, functions and Firebase read/write behaviour must be verified against that exact file.

### Technical safeguards

- Do not remove unrelated functionality.
- Do not overwrite the original baseline.
- Do not change Firebase project configuration, authentication behaviour, Firestore paths or security assumptions without explicit justification and an approved migration plan.
- Preserve existing user data and local persistence.
- Keep static curriculum definitions separate from user-specific practical activity records.
- Prefer additive, versioned state changes.
- Do not silently discard unknown state properties.
- Do not redesign general cloud synchronisation without approval.
- Do not claim that Firebase Security Rules are secure unless they have actually been inspected.
- Do not introduce XP-based content locks.
- Do not deliver partial HTML or placeholders in place of a complete updated file.

---

## 4. Repository and branch status

Repository: `https://github.com/henriquelimamartins/SHRED`

GitHub Pages: `https://henriquelimamartins.github.io/SHRED/`

| Branch | Purpose |
|---|---|
| `main` | Stable, approved application and canonical project documentation |
| `baseline-original` | Untouched original application reference |
| `phase-1-ui` | Historical Phase 1 development branch |
| `phase-1-integration` | Phase 1 integration branch; its Pull Request was merged |
| `phase-2-dojo-shell` | Current Phase 2 development and specification branch; implementation is not approved |

### Phase 1 integration

Phase 1 was developed in `phase-1-ui`. The approved implementation was introduced into the then-current `main` through `phase-1-integration`.

The owner confirmed that the Pull Request was merged. Phase 1 integration is complete. Do not repeat this merge.

### Current Phase 2 branch status

Latest repository comparison checked on 2 November 2026:

- `main`: `5c4487f40466a82cc747abb3e66890944216b514`
- `phase-2-dojo-shell`: `265f2836a45c47efc52c686a3053282bb6a8a740`
- Phase 2 branch: 5 commits ahead, 0 commits behind `main`.
- Files changed relative to `main`:
  - `index.html` — modified.
  - `project-docs/PHASE-2-SPEC.md` — added.

The approved Phase 2 specification exists on `phase-2-dojo-shell`. The implementation in that branch remains unapproved and must be independently audited.

Do not merge Phase 2 into `main` without explicit owner approval.

The owner performs GitHub operations. Provide clear, beginner-friendly instructions when a GitHub action is required.

---

## 5. Phase 1 — Responsive UI and Navigation Foundation

**Status: COMPLETE — TESTED AND APPROVED**

The user manually tested the Phase 1 implementation and reported that all tests passed successfully.

Reported test coverage included:

- Desktop, tablet and mobile responsiveness.
- Navigation between all six main sections.
- Active navigation indicators.
- Scrolling behaviour.
- DAILY interactions and progress.
- IMPROV Gates and exercise completion.
- DOJO navigation.
- LIBRARY navigation.
- SETUP controls.
- Local persistence after refresh.
- Authentication and synchronisation tests where applicable.

The following design decisions were explicitly accepted:

- Hidden global scrollbars are intentional and should remain.
- Existing small navigation typography is acceptable.
- Browser zoom must remain enabled.

Phase 1 is approved and integrated into `main`. Preserve `baseline-original` unchanged.

---

## 6. Approved learning architecture and progression

### 6.1 Recommended path and free exploration

The application must support both:

- A recommended learning path that explains prerequisites and suggests sensible next steps.
- Free exploration, allowing the learner to access appropriate theory and learning resources without artificial restrictions.

The recommended path is guidance, not a content lock.

### 6.2 TECHNIQUE ROADMAP

`TECHNIQUE ROADMAP` is the existing technique-specific, phase-based progression system.

Its existing phase data, calculations, segmentation and red visual treatment must remain unchanged during Phase 2.

Its visible label must be `TECHNIQUE ROADMAP`.

### 6.3 MUSICAL DEVELOPMENT

`MUSICAL DEVELOPMENT` is a separate global practical-learning indicator.

It has two subdivisions:

- DOJO.
- IMPROV.

It is intended to represent meaningful practical exercise evidence from those two learning areas.

It must not be calculated from theory reading, arbitrary XP totals or fabricated percentages.

The exact competency dimensions, evidence rules, weighting, difficulty model and mastery thresholds remain open for a future approved design. Phase 2 must not invent them.

Until valid practical activity records and approved criteria exist, show a neutral empty state rather than unsupported progress.

### 6.4 Theory reading does not generate progress

- Opening a theory chapter does not generate progress.
- Browsing or finishing a theory chapter does not generate progress.
- Do not track chapter reading as completion, studied status or mastery.
- Do not provide “Mark as Studied” or an equivalent action.
- Theory content remains permanently accessible.
- Progression belongs exclusively to meaningful exercises and practical work.

### 6.5 DAILY remains independent

DAILY routines, task completion, calendar/streak behaviour and existing functionality must remain unchanged during Phase 2.

Daily activity must not silently become a source of MUSICAL DEVELOPMENT. Any future relationship requires an explicitly approved practical activity model and specification.

---

## 7. DOJO — approved structure and Phase 2 experience

The DOJO is being rebuilt as the central educational area of the application.

### 7.1 DOJO Hub

The Hub presents three connected destinations:

- Music Theory Compendium.
- Fretboard Mastery.
- Harmonic Analysis Lab.

Each destination needs a clear purpose and direct navigation. Landing pages must not claim that tools or interactive features exist before they are implemented.

### 7.2 Music Theory Compendium

The Compendium is a comprehensive, structured reference and learning resource, from foundational to advanced theory.

Its curriculum should support:

- Stable category and chapter identifiers.
- Categories, chapters and subchapters.
- Prerequisites and related topics.
- Recommended path metadata.
- Links between theoretical concepts and practical activities.
- Future compatibility with IMPROV.
- Free exploration.

The approved Phase 2 specification defines the initial curriculum structure and the exact nine-chapter Functional Harmony sequence.

### 7.3 Compendium Explorer

Approved navigation model:

**Desktop**
- Persistent category sidebar.
- Central exploration/content area.
- Search and useful filters.
- Clear selected-category state.
- Recommended-path indication.
- Chapter descriptions and relationships.

**Mobile**
- Dedicated category-selection experience.
- Prominent search.
- Clear category navigation.
- Chapter list after category selection.
- Simple back navigation.
- No deep nested accordion hierarchy.

### 7.4 Chapter Reader

The approved reader is a continuous editorial page, not a sequence of nested dropdowns.

**Desktop**
- Chapter contents/index on the side.
- Central readable article.
- Clear title, introduction and section hierarchy.
- Related theory and practical links integrated into the content.

**Mobile**
- Single-column reading experience.
- Compact chapter index.
- Comfortable spacing and readable diagrams.
- No permanent desktop-style sidebar.

### 7.5 Visual educational resources

The Compendium must not be a text-only experience.

Every substantial theoretical concept should use visual representations whenever they materially improve understanding, clarify relationships or demonstrate musical structure.

Examples include:

- Circle of Fifths and key signatures.
- Notes, intervals, scales and chords.
- Fretboard maps.
- Harmonic progressions and functions.
- Voice leading.
- Rhythm, meter and subdivision.
- Modal and scale comparisons.
- Conceptual flowcharts.

Place visuals near the explanations they support. Prefer reusable, responsive HTML/CSS/SVG resources where appropriate. Keep diagram data separate from rendering logic where practical.

Diagrams need clear labels, legends and captions. They must remain legible on mobile and must not rely on colour alone.

Distinguish static explanatory diagrams from interactive tools. Interaction should be introduced only when it provides genuine educational value.

Phase 2 must establish reusable visual conventions and demonstrate at least one representative educational diagram in the Chapter Reader. This does not mean the full diagram library or interactive toolset is complete.

### 7.6 Theory and practical relationships

The architecture must support links in both directions:

- Theory chapters to relevant exercises and practical tools.
- Practical exercises and tools back to relevant theoretical explanations.

These relationships should use stable identifiers or an equivalent maintainable structure.

Phase 2 establishes the architecture; it does not implement the full future exercise system.

### 7.7 Functional Harmony

The approved Functional Harmony structure contains exactly nine chapters:

1. Understanding Harmonic Function.
2. Tonic, Predominant and Dominant Functions.
3. Diatonic Functions in Major Keys.
4. Diatonic Functions in Minor Keys.
5. Functional Progressions and Harmonic Goals.
6. Functional Behaviour of Seventh Chords.
7. Chord Function in Context.
8. Harmonic Rhythm and Phrase Structure.
9. Limits of Functional Analysis.

Additional topics such as ii–V–I, Cadential 6/4 and diminished seventh functions may appear as subchapters or examples; they must not replace the nine-chapter structure.

The wider curriculum must distinguish chord construction, scale-degree root, harmonic function and contextual behaviour. Functional labels must not be assigned independently of tonal centre, voice leading, phrase position and musical context.

---

## 8. IMPROV, Listening Vault and cross-phase dependencies

### IMPROV

The five Gates and their identities remain part of the product vision.

IMPROV is the future practical application layer of DOJO. Its long-term objective is to develop Musical Independence through understanding, fretboard navigation, harmonic and rhythmic awareness, deliberate choices and coherent musical creation.

The guiding pedagogical principle is:

**No Shape → Understand → Locate → Hear → Choose → Execute → Create**

The detailed redesign, exercises, assessment and progress model belong to Phase 7.

Phase 2 must not redesign existing IMPROV behaviour, implement Gate exercises or create new IMPROV interfaces. It must only establish the approved future compatibility relationships.

### Listening Vault

LIBRARY is the Listening Vault.

It will eventually become a searchable and filterable listening and analysis library with musical context, listening objectives, theory links, analysis, guitar applications, bookmarks and personal notes.

Do not fabricate track timestamps, musical analyses, progressions or URLs.

The substantial redesign belongs to Phase 8.

### Cross-phase dependency

Phases 2–6 should establish the theoretical, fretboard and harmonic foundations needed by the future IMPROV redesign.

This is a compatibility requirement, not authorisation to implement IMPROV features early.

---

## 9. Phase plan and status

| Phase | Description | Status |
|---|---|---|
| 0 | Audit and Architecture | COMPLETE |
| 1 | Responsive UI and Navigation Foundation | COMPLETE — APPROVED |
| 2 | DOJO Information Architecture and Compendium Shell | SPECIFICATION APPROVED — STAGE 1 AUDIT NEXT |
| 3 | Compendium Foundations and Harmony | NOT STARTED |
| 4 | Advanced Theory Compendium | NOT STARTED |
| 5 | Interactive Fretboard Mastery | NOT STARTED |
| 6 | Harmonic Analysis Lab | NOT STARTED |
| 7 | IMPROV Redesign and Five Gates | NOT STARTED |
| 8 | Listening Vault Redesign | NOT STARTED |
| 9 | Learning Path, Exercises, Assessment and Review | NOT STARTED |
| 10 | Integration, Regression and Release Audit | NOT STARTED |

Only one implementation phase should be active at a time.

Do not begin implementation of a later phase until the current phase has been reviewed, tested and approved.

---

## 10. Phase 2 — exact current status and next action

**Approved specification:** `project-docs/PHASE-2-SPEC.md` on `phase-2-dojo-shell`.

The owner approved the core specification and Addenda A, B and C.

The approval covers:

- Dual progression architecture.
- Practical-only MUSICAL DEVELOPMENT.
- Permanent accessibility of theory content.
- No theory-reading progress or XP.
- DOJO Hub, Explorer and Chapter Reader.
- Initial curriculum structure and Functional Harmony's nine chapters.
- Theory/practical relationships in both directions.
- Editorial chapter structure.
- Visual educational resources and diagram conventions.
- Official IMPROV naming.
- Navigation and visual experience blueprint.
- Preservation of existing functionality outside the authorised Phase 2 scope.

### Stage 1 — Independent audit and implementation plan

This is the next authorised activity.

The audit must:

1. Read the current MASTERPLAN, CHECKPOINT and PHASE_LOG.
2. Read the complete approved Phase 2 specification and all addenda.
3. Inspect the complete latest approved `index.html` from `main`.
4. Inspect the existing Phase 2 branch implementation separately.
5. Compare the two sources and identify the exact starting point.
6. Inspect header, both progress indicators, DAILY, DOJO, IMPROV, state, localStorage and Firebase code.
7. Identify functionality that could be affected.
8. Identify data and persistence risks.
9. Identify missing requirements, regressions and unnecessary changes.
10. Produce a clear implementation and correction plan.

Stage 1 is inspection and reporting only.

**Do not modify code, files, branches or commits. Do not implement fixes. Do not merge anything.**

Stop and present the findings to the owner.

### Stage 2 — Implementation

Stage 2 may begin only after the owner explicitly approves the Stage 1 audit and implementation plan.

Implementation must take place only on the authorised Phase 2 branch, use the latest approved `main` baseline, remain within the approved specification and preserve unrelated functionality.

Required deliverables include:

- Complete updated `index.html`.
- Updated curriculum structure.
- Reusable Chapter Reader template.
- Data model description.
- Change log.
- List of modified functions, styles and state fields.
- Migration notes.
- Manual test checklist.
- Known limitations.
- Clear distinction between source inspection, tests actually run and tests still required.

Do not merge until the owner has reviewed and explicitly approved the implementation.

---

## 11. Rules for continuing in a new ChatGPT conversation

Read `MASTERPLAN.md`, `CHECKPOINT.md`, `PHASE_LOG.md`, the latest approved `index.html` from `main` and the current approved phase specification before acting.

Speak to the owner in clear European Portuguese. All application-facing text, curriculum content and code comments must be in English.

The owner has no formal programming background. Explain technical decisions and GitHub instructions in accessible language.

Do not ask for decisions already documented here.

Do not treat Gemini's implementation as correct merely because it follows a prompt. Review the complete source, compare it against the approved requirements and identify regressions.

Never claim browser, Firebase, authentication or cross-device tests unless they were actually performed.

The owner performs GitHub operations. Never experiment directly on `main`, never modify `baseline-original` and never merge without explicit owner approval.

Preserve the project's ambition, depth, technical foundations and working functionality.
