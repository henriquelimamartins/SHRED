# THE SHRED ROADMAP — PHASE LOG

This document records the implementation history, approvals, decisions and current status of each project phase.

`MASTERPLAN.md` is the authority for the product vision and permanent requirements.

`CHECKPOINT.md` is the authority for the current project status and next authorised action.

The latest approved complete `index.html` from `main` is the authoritative application baseline.

A phase specification approved by the project owner defines the exact scope and acceptance criteria of that phase. Historical plans in this log must not override a later approved specification.

---

## Phase 0 — Source Audit and Architecture

**Status:** COMPLETE

**Objective:** Understand the original application, identify existing functionality and establish a safe implementation plan.

**Work completed:**

- Audited the original `index (9).html`.
- Mapped the six existing top-level sections: HOME, DAILY, IMPROV, DOJO, LIBRARY and SETUP.
- Identified the existing localStorage persistence and Firebase Authentication/Firestore integration.
- Identified existing user progress and application state.
- Documented features that must be preserved.
- Defined the new DOJO structure and wider learning architecture.
- Established a phased implementation plan and technical safeguards.

**Important findings from the original audit:**

- The original application was a single-file HTML/CSS/JavaScript application.
- Existing localStorage key identified during the audit: `shredRoadmapState_v10`.
- Existing Firestore document path identified during the audit: `users/{uid}`.
- Existing DOJO educational content could be substantially rebuilt.
- DAILY, SETUP and other useful existing features must be preserved.
- The five IMPROV Gates and Listening Vault required substantial future redesign.

These are historical audit findings. Technical details must be re-verified against the current approved source before implementation.

**Outcome:** Audit and architecture completed. No implementation changes were made during this phase.

---

## Phase 1 — Responsive UI and Navigation Foundation

**Status:** COMPLETE — TESTED AND APPROVED

**Initial development branch:** `phase-1-ui`

**Integration branch:** `phase-1-integration`

**Objective:** Establish a polished responsive design and navigation foundation before implementing the new educational modules.

### Implementation

- Gemini produced a complete updated HTML implementation.
- The application received a responsive desktop and mobile layout.
- The six main application sections were retained.
- Navigation and content presentation were adapted to the new responsive structure.
- The existing dark visual identity was preserved.
- Browser zoom restrictions were removed.
- Existing application functionality and technical integrations were intended to remain intact.

### User testing

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

### Confirmed design decisions

- Hidden global scrollbars are intentional and should remain.
- Existing small navigation typography is acceptable.
- Browser zoom must remain enabled.

### Outcome and integration

Phase 1 was approved and integrated into `main`.

The original implementation was developed in `phase-1-ui`. To introduce the approved implementation into the then-current `main`, the user created `phase-1-integration` from `main`, copied the approved Phase 1 `index.html` into that branch and merged its Pull Request into `main`.

The user explicitly confirmed that the Pull Request was merged.

**Integration status:** COMPLETE. Do not repeat this merge.

Preserve `baseline-original` unchanged.

---

## Phase 2 — DOJO Information Architecture and Compendium Shell

**Status:** SPECIFICATION APPROVED — STAGE 1 AUDIT NEXT

**Development branch:** `phase-2-dojo-shell`

**Approved specification:** `project-docs/PHASE-2-SPEC.md`

**Latest branch status checked:** 2 November 2026.

- `main`: `5c4487f40466a82cc747abb3e66890944216b514`
- `phase-2-dojo-shell`: `265f2836a45c47efc52c686a3053282bb6a8a740`
- Branch comparison: 5 commits ahead, 0 behind `main`.
- Changed files relative to `main`:
  - `index.html` — modified.
  - `project-docs/PHASE-2-SPEC.md` — added.

The branch contains an unapproved Phase 2 implementation and the approved specification. The implementation must not be treated as an approved baseline.

### 2.1 Objective

Build the new DOJO framework and curriculum architecture without rushing the full educational content.

### 2.2 Approval record

The project owner approved the core Phase 2 specification and Addenda A, B and C.

The approved specification is the exact authority for Phase 2 scope, implementation boundaries and acceptance criteria.

The approval authorises the Phase 2 audit and planning process.

It does **not** authorise implementation, merging or changes to `main`.

### 2.3 Approved DOJO structure

Create three connected learning areas:

1. Music Theory Compendium.
2. Fretboard Mastery.
3. Harmonic Analysis Lab.

The DOJO Hub must present these as distinct but connected learning destinations.

### 2.4 Approved Compendium architecture

The Music Theory Compendium must support:

- A structured curriculum with stable category and chapter identifiers.
- Categories, chapters and subchapters.
- Prerequisites and related-topic relationships.
- Recommended-path metadata.
- Free exploration.
- Search and useful filters.
- Links between theory chapters and practical activities.
- Future compatibility with IMPROV.

The approved specification defines the initial curriculum structure and the exact nine-chapter Functional Harmony sequence.

The Compendium Explorer uses a hybrid navigation model:

**Desktop**
- Persistent category sidebar.
- Central exploration area.
- Search and filters.
- Selected-category state.
- Recommended-path indication.
- Chapter descriptions and relationships.

**Mobile**
- Dedicated category-selection experience.
- Prominent search.
- Clear category navigation.
- Chapter list after category selection.
- Simple back navigation.
- No deep nested accordion hierarchy.

### 2.5 Approved Chapter Reader

The reader uses a continuous editorial page.

**Desktop**
- Chapter index on the side.
- Readable central article.
- Clear title, introduction and section hierarchy.
- Related concepts and practical applications integrated into the article.

**Mobile**
- Single-column reading experience.
- Compact chapter index.
- Comfortable spacing and readable diagrams.
- No permanent desktop-style sidebar.

### 2.6 Approved progression architecture

Two independent progression systems must coexist.

**TECHNIQUE ROADMAP**

- Existing phase-based technique progression.
- Existing calculations and phase data remain unchanged.
- Existing segmented red visual treatment remains unchanged.
- The visible label is `TECHNIQUE ROADMAP`.

**MUSICAL DEVELOPMENT**

- New global practical-learning indicator.
- Two subdivisions: DOJO and IMPROV.
- Intended to derive from meaningful practical exercise evidence.
- No theory-reading progress.
- No arbitrary XP accumulation.
- No fabricated percentages or mastery claims.

The exact competency dimensions, evidence rules, weighting, difficulty model and mastery thresholds remain open for a future approved design.

Until valid practical activity records and approved criteria exist, the indicator must show an honest neutral empty state.

### 2.7 Theory-reading rules

Theory reading never contributes to progression.

The implementation must not include:

- Chapter reading completion states.
- Studied status.
- Chapter reading mastery.
- “Mark as Studied” or an equivalent action.
- XP for reading.
- Theory content locks.

Opening, browsing or finishing a chapter must not contribute to either progression indicator.

All appropriate theory content remains accessible.

### 2.8 DAILY and existing functionality

DAILY routines, task completion, calendar/streak behaviour and existing functionality must remain unchanged.

Daily activity must not silently become a source of MUSICAL DEVELOPMENT.

The existing IMPROV behaviour and five Gates must not be redesigned in Phase 2.

The existing TECHNIQUE ROADMAP calculations, phase segmentation and data must remain unchanged.

Existing useful user data must be protected. Legacy DOJO UI and functions may be replaced where appropriate; preserving obsolete architecture is not a goal in itself.

### 2.9 Theory and practical relationships

The curriculum architecture must support links in both directions:

- Theory chapters to relevant practical tools and exercises.
- Practical activities to their relevant theoretical explanations.

Use stable identifiers or an equivalent maintainable relationship structure.

This is architectural preparation. Phase 2 does not implement the complete future exercise system.

### 2.10 Visual learning — Addendum A

The Compendium must not be a text-only experience.

Every substantial theoretical concept must use visual representations whenever they materially improve understanding, clarify relationships or demonstrate musical structure.

Examples include:

- Circle of Fifths and key signatures.
- Notes, intervals, scales and chords.
- Guitar fretboard maps.
- Harmonic progressions and functional relationships.
- Voice leading.
- Rhythm, meter and subdivision.
- Modal and scale comparisons.
- Conceptual flowcharts.

Visuals must appear near the explanations they support.

Prefer reusable, responsive HTML/CSS/SVG components where appropriate. Keep diagram data separate from rendering logic where practical.

Provide labels, legends and captions. Ensure mobile legibility and do not rely on colour alone.

Distinguish static educational diagrams from interactive tools. Interaction should be used only when it adds genuine educational value.

Phase 2 must establish reusable visual conventions and demonstrate at least one representative educational diagram in the Chapter Reader. This does not imply that the full visual library is complete.

### 2.11 IMPROV naming — Addendum B

`IMPROV` is the official product and navigation label.

Use it consistently in navigation, headings, progress indicators, cards, the MUSICAL DEVELOPMENT subdivision and the five Gate identities.

In ordinary explanatory English, use natural terms such as:

- “the improvisation track”
- “the improvisation learning path”
- “improvisation exercises”
- “improvisational skills”
- “improvisational development”

Do not force `IMPROV` into grammatical contexts where natural English would use “improvisation” or “improvisational”.

### 2.12 Navigation and visual experience — Addendum C

The approved blueprint defines:

- Two independent progress indicators in the header.
- Desktop side-by-side progress presentation.
- Compact or stacked mobile presentation.
- DOJO Hub with three destinations.
- Desktop Explorer with persistent category navigation and central content.
- Mobile category-selection experience.
- Continuous editorial Chapter Reader.
- Desktop side index and compact mobile chapter index.
- Reusable visual educational resource conventions.
- Retention of the Phase 1 visual identity.
- Consistent navigation and interaction patterns.

Avoid excessive cards, nested dropdowns and accordion-heavy navigation. Cards are suitable for concise navigation and summaries; long-form educational content should remain readable as an article.

### 2.13 Historical planning notes — superseded

Earlier Phase 2 planning notes in this log and in previous versions of the project documents referred to:

- Expandable chapter/subchapter navigation as the primary experience.
- Per-chapter progress states.
- Reading completion or studied states.
- A chapter-progress schema.
- A more generic chapter-template and syllabus implementation.

These notes record the earlier planning stage. They are **superseded** where they conflict with the owner-approved `PHASE-2-SPEC.md`.

They must not be used as implementation requirements.

In particular, the earlier proposal to track chapter reading progress is withdrawn. Theory reading does not generate progression.

The approved specification takes precedence.

### 2.14 Stage 1 — Independent audit and implementation plan

**Status: NEXT AUTHORISED ACTIVITY**

Before any code changes:

1. Read the current MASTERPLAN, CHECKPOINT and PHASE_LOG.
2. Read the complete approved Phase 2 specification and all addenda.
3. Inspect the complete latest approved `index.html` from `main`.
4. Inspect the existing Phase 2 branch implementation separately.
5. Compare both sources and identify the exact starting point.
6. Inspect the header, both progress indicators, DAILY, DOJO, IMPROV, state, localStorage and Firebase code.
7. Identify existing functionality that could be affected.
8. Identify data and persistence risks.
9. Identify missing requirements, regressions and unnecessary changes.
10. Produce a clear implementation and correction plan.

Stage 1 is inspection and reporting only.

**Do not modify code, files, branches or commits. Do not implement fixes. Do not merge anything during Stage 1.**

Present the findings to the owner and wait for explicit approval.

### 2.15 Stage 2 — Implementation

**Status: NOT AUTHORISED YET**

Stage 2 may begin only after the owner explicitly approves the Stage 1 audit and implementation plan.

Implementation must:

- Work only on the authorised Phase 2 development branch.
- Use the latest approved `main` version as the authoritative application baseline.
- Follow the complete approved Phase 2 specification.
- Stay within the approved scope.
- Correct identified architectural risks.
- Preserve unrelated functionality and user data.
- Avoid speculative features and unnecessary dependencies.
- Maintain compatibility with the existing deployment setup.
- Stop and report if a requirement would force an unauthorised change.

### 2.16 Required Phase 2 deliverables

- Complete updated `index.html`.
- Updated curriculum structure.
- Reusable Chapter Reader template.
- Data model description.
- Change log.
- List of modified functions, styles and state fields.
- Migration notes.
- Manual test checklist.
- Known limitations and unfinished work.
- Explicit distinction between source inspection, tests actually run and tests still required.

### 2.17 Phase 2 acceptance criteria

Phase 2 is acceptable only when the applicable criteria in the approved specification are satisfied, including:

- Coherent DOJO Hub with three learning areas.
- Clear Compendium Explorer navigation on desktop and mobile.
- Continuous Chapter Reader with appropriate desktop/mobile navigation.
- Curriculum relationships and the approved Functional Harmony structure.
- Theory/practical links in both directions.
- No theory-reading progress, XP or content locks.
- No unsupported MUSICAL DEVELOPMENT progress values.
- Existing TECHNIQUE ROADMAP behaviour preserved.
- DAILY behaviour preserved.
- Existing IMPROV behaviour preserved.
- Reusable visual-resource conventions and at least one representative diagram.
- User data and unrelated features preserved.
- Firebase configuration, authentication and Firestore paths unchanged.
- Complete deliverables and accurate test reporting.

Do not merge Phase 2 into `main` until the owner has reviewed and explicitly approved the implementation.

---

## Phase 3 — Music Theory Compendium: Foundations Through Harmony

**Status:** NOT STARTED

**Objective:** Establish the editorial standard and create the first substantial body of theory content.

Populate the agreed foundational and harmonic chapters with accurate, substantial English-language learning material.

Every substantial chapter should explain:

- Definitions and precise terminology.
- Prerequisites.
- Construction and derivation.
- Classifications and variants.
- Exceptions and relationships.
- Musical effects.
- Worked examples.
- Common errors.
- Applications.
- Exercises and solutions.
- Links to related chapters.

Do not attempt to fill the entire advanced syllabus in one pass.

### Specific editorial requirement — Functional Harmony

The foundational and harmonic content must establish a substantial understanding of functional harmony.

This includes:

- Chord construction and identification.
- Scale-degree relationships and Roman numerals.
- Tonic, predominant and dominant functions.
- Diatonic progressions in major and minor tonalities.
- Functional relationships and common harmonic movements.
- Cadences and harmonic rhythm.
- Voice leading and bass movement.
- The relationship between chord function, inversions and voicings.
- Practical progression construction and analysis.

Explain why chords function as they do within musical context rather than relying on memorised chord labels.

Where relevant, include practical guitar applications and grounded examples from varied musical styles.

Advanced topics such as secondary dominants, modal interchange, chromatic harmony and modulation should be developed further in the appropriate chapters and later phases.

The curriculum must also explain when functional tonal analysis is insufficient or inappropriate, including modal and non-functional harmonic contexts.

---

## Phase 4 — Advanced Theory Compendium

**Status:** NOT STARTED

**Objective:** Extend the Compendium into advanced theory and more complex musical relationships.

The content should retain the editorial and academic standard established in Phase 3.

Topics include advanced scales and modes, chord extensions and alterations, functional harmony, secondary dominants, modal interchange, modulation, chromatic harmony, voice leading, counterpoint, rhythm, meter and musical form.

Maintain accurate terminology, musical context, worked examples, visual resources and varied practical exercises.

---

## Phase 5 — Interactive Fretboard Mastery

**Status:** NOT STARTED

**Objective:** Build an interactive fretboard learning environment.

It should cover note locations, intervals, scales, triads, inversions, arpeggios, voicings, CAGED and alternative systems.

The focus must remain on understanding the theoretical relationships behind fretboard patterns, rather than memorising isolated shapes.

The implementation must use accurate tuning/fret calculations, support responsive interaction and link tools to relevant Compendium concepts.

---

## Phase 6 — Harmonic Analysis Lab

**Status:** NOT STARTED

**Objective:** Build a guided harmonic analysis workspace.

It should support tonal centres, chord progressions, Roman numerals, harmonic functions, cadences, secondary dominants, modal interchange, modulation, pedal tones, ambiguous harmony and harmonic rhythm.

Alternative interpretations must be explained where appropriate.

The tool must distinguish chord construction, chord quality, scale-degree root and harmonic function. Assumptions such as tonal centre must be explicit.

Do not claim audio transcription or recognition unless it is actually implemented.

---

## Phase 7 — IMPROV Redesign: Five Gates

**Status:** NOT STARTED

**Objective:** Rebuild IMPROV as a serious practical musicianship curriculum focused on developing Musical Independence.

IMPROV must become the practical application layer of DOJO. Its purpose is to help the learner understand musical relationships, navigate the guitar fretboard freely, make intentional melodic and rhythmic decisions, and translate musical ideas into coherent performance.

The redesign must retain and deepen the five existing Gates.

### 1. The Horizontal Prison — Fretboard Independence

Develop the ability to navigate the fretboard without depending exclusively on fixed box patterns or memorised positions.

Cover:

- Note and interval location across strings and fretboard regions.
- Horizontal and vertical navigation.
- Connections between scales, arpeggios, intervals and positions.
- Phrase transfer across strings, positions and octaves.
- Alternative fretboard solutions for the same musical idea.

### 2. The Chord Tone Architect — Harmonic Independence

Develop the ability to understand and respond to changing harmony.

Cover:

- Chord tones, triads, seventh chords and arpeggios.
- Guide tones and voice leading.
- Target-note selection over chord changes.
- Harmonic functions and progression awareness.
- Stability, tension and resolution.
- Melodic lines that meaningfully reflect the underlying harmony.

### 3. The Rhythmic Displacer — Rhythmic Independence

Develop control over rhythmic language and phrasing.

Cover:

- Subdivisions and rhythmic groupings.
- Syncopation, displacement and accents.
- Odd meters and changing rhythmic structures.
- Rests, note duration, density and rhythmic space.
- Motif transformation through rhythmic variation.
- Groove, phrase placement and rhythmic intention.

### 4. The Modal Alchemist — Modal and Melodic Independence

Develop the ability to understand and apply modal and melodic colour.

Cover:

- Interval structures and characteristic notes.
- Comparisons between modes over the same tonic.
- Scale and chord relationships.
- Modal choices in different harmonic contexts.
- Target notes, tensions and resolutions.
- Application to riffs, progressions and improvisation.
- The distinction between theoretical compatibility and convincing musical application.

### 5. Total Audiation — Integrated Musical Independence

Develop the ability to conceive and execute coherent musical ideas.

Cover:

- Motifs, repetition, variation and transformation.
- Call-and-response.
- Melodic direction and structured solo development.
- Tension, resolution, dynamics, density and space.
- Translation of internally conceived ideas into deliberate guitar performance.

Avoid unnecessary duplication of the user's separate ear-training tools.

### Core pedagogical principle

**No Shape → Understand → Locate → Hear → Choose → Execute → Create**

This is a guiding principle rather than a mandatory linear sequence for every exercise.

### Integration with DOJO

IMPROV must connect directly to:

- Music Theory Compendium.
- Fretboard Mastery.
- Harmonic Analysis Lab.

The learner should be able to move between theoretical explanations and practical exercises through explicit links to relevant chapters and concepts.

### Exercise architecture and assessment

Each Gate must include:

- Clear learning objectives and prerequisites.
- Progressive levels of difficulty.
- Substantial explanations and demonstrations.
- Varied practical exercises.
- Hints, feedback and meaningful success criteria.
- Opportunities for repetition, review and application.
- Integrated challenges combining multiple musical skills.

Exercises should include construction, identification, fretboard navigation, harmonic and melodic analysis, transposition, rhythmic transformation, target-note selection, phrase development, practical execution and creative application.

Avoid shallow multiple-choice quizzes, repetitive random-key tasks and arbitrary XP-based restrictions.

Distinguish exercise completion from demonstrated mastery.

Do not claim that physical performance, timing, tone or musical execution has been verified unless the application actually receives and evaluates the relevant performance data.

### Musical Context and Application

Use real musical situations and relevant references from a broad range of styles.

Priority reference worlds may include stoner, doom, sludge, progressive music, death metal, thrash, blues and selected classic rock, without restricting the curriculum to these genres.

Distinguish verified musical analysis from stylistic association and suggested listening. Do not fabricate musical claims, passages, timestamps or references.

### Technical and data requirements

Before implementation:

- Inspect the complete latest approved application source.
- Inspect the existing IMPROV state and progress structures.
- Review the completed DOJO, Fretboard Mastery and Harmonic Analysis Lab implementations.
- Define the proposed Gate, exercise, progression and assessment architecture before modifying code.

During implementation:

- Preserve or safely migrate existing IMPROV progress wherever possible.
- Keep curriculum definitions separate from user-specific progress.
- Use additive and versioned state changes where required.
- Preserve Firebase configuration, authentication and existing database paths.
- Avoid unrelated refactoring and unnecessary dependencies.
- Retain the five established Gate identities.
- Preserve all unrelated application functionality.

### Acceptance criteria

The redesign should demonstrate that the learner can progressively:

- Understand the musical relationships behind patterns and shapes.
- Locate and connect those relationships across the fretboard.
- Respond intentionally to harmonic and rhythmic context.
- Select chord tones, tensions and resolutions appropriately.
- Develop coherent phrases and musical ideas.
- Translate theoretical understanding into practical guitar performance.

The principal measure of success is developing Musical Independence, not the number of scales, licks or exercises completed.

### Implementation boundary

The detailed exercise model, progression system, feedback, assessment, interface and state migration must be designed during Phase 7, after the relevant DOJO foundations have been implemented and reviewed.

Earlier phases must provide architectural compatibility only. They must not implement the IMPROV redesign prematurely.

---

## Phase 8 — Listening Vault Redesign

**Status:** NOT STARTED

**Objective:** Turn the Listening Vault into a searchable and filterable listening and analysis library.

Include:

- Musical context.
- Listening objectives.
- Relevant theory concepts.
- Harmonic, melodic, rhythmic and phrasing analysis.
- Guitar applications.
- Links to DOJO and IMPROV.
- Bookmarks and personal notes where supported.

Never fabricate timestamps, analyses, progressions or URLs.

Distinguish verified analysis from suggested listening and stylistic association.

---

## Phase 9 — Learning Path, Exercises and Assessment

**Status:** NOT STARTED

**Objective:** Integrate the learning areas into a coherent recommended progression while preserving free exploration.

Develop meaningful exercises, assessment, progress tracking and review mechanisms.

Progress should reflect meaningful practical learning and must never become an artificial content-access restriction.

Theory reading must remain separate from practical progression.

The future MUSICAL DEVELOPMENT model must use transparent evidence and competency criteria. Do not substitute arbitrary XP totals or unsupported mastery claims.

---

## Phase 10 — Integration, Regression and Release Audit

**Status:** NOT STARTED

**Objective:** Audit the complete application before release.

Test:

- HOME and navigation.
- DAILY routines and progress.
- TECHNIQUE ROADMAP behaviour.
- MUSICAL DEVELOPMENT calculations and evidence.
- DOJO Compendium, chapter navigation, search and diagrams.
- Fretboard Mastery calculations and interactions.
- Harmonic Analysis Lab.
- All five IMPROV Gates.
- Listening Vault search, filters, bookmarks and notes.
- SETUP utilities.
- Google Authentication and signed-out operation.
- localStorage persistence and Firestore synchronisation.
- Data migration and compatibility.
- Desktop, tablet and mobile layouts.
- Browser console errors, broken handlers and accessibility basics.

Do not claim a test passed unless it was actually performed.

---

## Development and approval rules

1. Work on one implementation phase at a time.
2. Use the latest approved complete `index.html` from `main` as the application baseline.
3. Keep `baseline-original` untouched.
4. Develop each phase on its authorised development branch.
5. Require a complete updated HTML file, not partial snippets or placeholders.
6. Require a change log, modified-function/state list, migration notes and test checklist.
7. Review and test each phase before merging it into `main`.
8. Keep this log and `CHECKPOINT.md` updated after every approved phase.
9. Never let Gemini's implementation decisions silently override the Project Master Document or an approved phase specification.
10. Preserve the project's ambition, depth, technical foundations and original useful functionality.
11. Distinguish source inspection from tests actually performed.
12. Never merge or modify stable production code without the owner's explicit approval.
