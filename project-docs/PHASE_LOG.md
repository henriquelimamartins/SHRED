# THE SHRED ROADMAP — PHASE LOG

This document records the implementation history, approvals and current status of each project phase.

The Project Master Document is the authority for the product vision, requirements and implementation scope.

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
- Defined the new DOJO structure and the wider learning architecture.
- Established a phased implementation plan and safeguards.

**Important findings:**
- The original app is a single-file HTML/CSS/JavaScript application.
- Existing localStorage key: `shredRoadmapState_v10`.
- Existing Firestore document path: `users/{uid}`.
- Existing DOJO educational content can be substantially rebuilt.
- DAILY, SETUP and other useful existing features must be preserved.
- The five IMPROV Gates and Listening Vault require substantial future redesign.

**Outcome:** Audit and architecture completed. No implementation changes were made during this phase.

---

## Phase 1 — Responsive UI and Navigation Foundation

**Status:** COMPLETE — TESTED AND APPROVED

**Initial development branch:** `phase-1-ui`

**Integration branch:** `phase-1-integration`

**Objective:** Establish a polished responsive design and navigation foundation before implementing the new educational modules.

**Implementation:**
- Gemini produced a complete updated HTML implementation.
- The application received a responsive desktop and mobile layout.
- The six main application sections were retained.
- Navigation and content presentation were adapted to the new responsive structure.
- The existing dark visual identity was preserved.
- Browser zoom restrictions were removed.
- Existing application functionality and technical integrations were intended to remain intact.

**User testing:**

The user manually tested the Phase 1 implementation and reported that all tests passed successfully.

Tests included:
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

**Confirmed design decisions:**
- Hidden global scrollbars are intentional and should remain.
- Existing small navigation typography is acceptable.
- Browser zoom must remain enabled.

**Outcome:** Phase 1 approved and integrated into `main`. The original implementation was developed in `phase-1-ui`. To introduce the approved implementation into the then-current `main`, the user created `phase-1-integration` from `main`, copied the approved Phase 1 `index.html` into that branch, and merged its Pull Request into `main`. The user explicitly confirmed that the Pull Request was merged.

**Integration status:** COMPLETE. Do not repeat this merge. Preserve `baseline-original` unchanged.

---

## Phase 2 — DOJO Information Architecture and Compendium Shell

**Status:** NEXT — PREPARATION / IMPLEMENTATION CONVERSATION CREATED

**Development branch:** `phase-2-dojo-shell` (must be created from the current `main` if it has not already been created; do not use an outdated branch or baseline).

**ChatGPT:** A dedicated Phase 2 conversation has been created. The project documents must be refreshed in that conversation before implementation proceeds.

**Objective:** Build the new DOJO framework and curriculum map without rushing the educational content.

**Planned scope:**

### 1. DOJO structure

Create three connected learning areas:

- Music Theory Compendium
- Fretboard Mastery
- Harmonic Analysis Lab

### 2. Music Theory Compendium

- Create a hierarchical syllabus with categories, chapters and expandable subchapters.
- Establish a beginner-to-advanced progression.
- Define prerequisites and related-chapter links.
- Support both a recommended learning path and free exploration.
- Add chapter search/filtering.
- Add clear progress states.
- Keep all reference content accessible without XP locks.
- Create a reusable chapter page template.
- Distinguish core material from advanced detail.

### 3. Initial syllabus categories

- Fundamentals
- Notes and Pitch
- Accidentals and Enharmonic Spelling
- Intervals
- Key Signatures and Circle of Fifths
- Scales
- Modes
- Triads
- Seventh Chords
- Extensions and Alterations
- Inversions and Voicings
- Diatonic Harmony
- Functional Harmony
- Cadences
- Secondary Dominants
- Modal Interchange
- Modulation
- Chromatic Harmony
- Voice Leading
- Counterpoint
- Rhythm and Meter
- Musical Form and Composition

Any proposed additions or changes to the sequence must be explained.

### 4. Fretboard Mastery and Harmonic Analysis Lab

Create coherent landing pages and navigation placeholders with clear descriptions and links to relevant Compendium chapters.

Do not claim that interactive tools are implemented until they actually exist.

### 5. Data and persistence

- Separate static curriculum definitions from per-user chapter progress.
- Preserve existing application state.
- Document any proposed additive progress schema before implementing it.
- Avoid unnecessary changes to Firebase or existing persistence.
- Do not discard or overwrite existing user data.

**Required deliverables:**
- Complete updated `index.html`.
- Syllabus tree and chapter hierarchy.
- Reusable chapter page template.
- Proposed curriculum and user-progress data schema.
- Change log.
- List of modified functions, styles and state fields.
- Migration notes, if any.
- Manual test checklist.
- Known limitations.

**Acceptance gate:**

The complete implementation must be reviewed and tested. Existing top-level sections, persistence, authentication and unrelated features must continue working.

Do not merge Phase 2 into `main` until approved.

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

The content must explain why chords function as they do within a musical context, rather than relying on memorised chord labels.

Where relevant, include practical guitar applications and grounded examples from varied musical styles.

Advanced topics such as secondary dominants, modal interchange, chromatic harmony and modulation should be developed further in the appropriate chapters and later phases.

The curriculum must also explain when functional tonal analysis is insufficient or inappropriate, including modal and non-functional harmonic contexts.

---

## Phase 4 — Advanced Theory Compendium

**Status:** NOT STARTED

**Objective:** Extend the Compendium into advanced theory and more complex musical relationships.

The content should retain the editorial and academic standard established in Phase 3.

---

## Phase 5 — Interactive Fretboard Mastery

**Status:** NOT STARTED

**Objective:** Build an interactive fretboard learning environment.

It should cover note locations, intervals, scales, triads, inversions, arpeggios, voicings, CAGED and alternative systems.

The focus must remain on understanding the theoretical relationships behind fretboard patterns, rather than memorising isolated shapes.

---

## Phase 6 — Harmonic Analysis Lab

**Status:** NOT STARTED

**Objective:** Build a guided harmonic analysis workspace.

It should support tonal centres, chord progressions, Roman numerals, harmonic functions, cadences, secondary dominants, modal interchange, modulation, pedal tones, ambiguous harmony and harmonic rhythm.

Alternative interpretations must be explained where appropriate.

---

## Phase 7 — IMPROV Redesign: Five Gates

**Status:** NOT STARTED

**Objective:** Rebuild IMPROV as a serious practical musicianship curriculum focused on developing Musical Independence.

IMPROV must become the practical application layer of DOJO. Its purpose is to help the learner understand musical relationships, navigate the guitar fretboard freely, make intentional melodic and rhythmic decisions, and translate musical ideas into coherent performance.

The redesign must retain and deepen the five existing Gates:

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

The Gates should progressively develop the following capabilities:

**No Shape → Understand → Locate → Hear → Choose → Execute → Create**

This is a guiding principle rather than a mandatory linear sequence for every exercise.

### Integration with DOJO

IMPROV must connect directly to the relevant content in:

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

Include musical context, listening objectives, relevant concepts, harmonic/melodic/rhythmic analysis, guitar applications, links to DOJO and IMPROV, bookmarks and personal notes.

Never fabricate timestamps, analyses, progressions or URLs.

---

## Phase 9 — Learning Path, Exercises and Assessment

**Status:** NOT STARTED

**Objective:** Integrate the learning areas into a coherent recommended progression while preserving free exploration.

Develop meaningful exercises, assessment, progress tracking and review mechanisms.

Progress should reflect learning and must never become an artificial content-access restriction.

---

## Phase 10 — Integration, Regression and Release Audit

**Status:** NOT STARTED

**Objective:** Audit the complete application before release.

Test:
- HOME and navigation.
- DAILY routines and progress.
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
2. Use the latest approved complete `index.html` as the starting point.
3. Keep the original baseline untouched.
4. Develop each phase in its own branch.
5. Require a complete updated HTML file, not partial snippets or placeholders.
6. Require a change log, modified-function/state list, migration notes and test checklist.
7. Review and test each phase before merging it into `main`.
8. Keep this log and `CHECKPOINT.md` updated after every approved phase.
9. Never let Gemini's implementation decisions silently override the Project Master Document.
10. Preserve the project's ambition, depth and original useful functionality.
