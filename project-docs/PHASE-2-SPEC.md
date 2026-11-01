# THE SHRED ROADMAP — PHASE 2 SPECIFICATION

**Document status:** APPROVED  
**Scope:** DOJO Information Architecture, Compendium Experience and Architectural Foundations  
**Development branch:** `phase-2-dojo-shell`  
**Language:** English for all application-facing content, curriculum content, identifiers and code comments.

---

## 1. Purpose

Phase 2 will establish the new DOJO learning environment and its Music Theory Compendium.

The objective is to create a coherent, premium and scalable learning architecture before investing in the full educational content, interactive fretboard tools, harmonic analysis tools or the IMPROV redesign.

This phase must establish both the functional architecture and the visual experience.

The application must remain a comprehensive music-learning environment, not a quiz-driven or XP-driven game.

Phase 2 must establish the foundations for future educational and practical systems without prematurely implementing features assigned to later phases.

## 2. Confirmed product decisions

The following decisions have been explicitly approved by the owner.

### 2.1 Learning philosophy

- Theory is always accessible.
- Reading theory chapters does not generate XP or progression.
- Users never need to mark chapters as read or studied.
- Theory access must never depend on exercise completion, XP or level.
- Progression must reflect practical exercises and musical work.
- Recommended learning paths provide guidance, not compulsory restrictions.
- Free exploration must remain possible.
- Theory and practical exercises should reference each other wherever relevant.
- Reading theory is not evidence of practical musical competence.

### 2.2 Two independent progression systems

#### TECHNIQUE ROADMAP

- Preserve the existing phase-based progression.
- Retain its red visual identity.
- Retain its existing phase structure and progress calculations.
- Change the displayed label to `TECHNIQUE ROADMAP`.
- Do not alter its relationship with DAILY or its underlying data without explicit approval.
- Preserve its existing behaviour and persisted data.

#### MUSICAL DEVELOPMENT

Create a separate global musical development indicator.

It must contain two subdivisions:

- DOJO
- IMPROV

The global indicator represents practical musical development across these two areas.

Rules:

- Only practical exercises and activity records may contribute.
- Reading theory never contributes.
- DOJO and IMPROV must retain distinguishable progress information.
- The global indicator must derive from meaningful evidence of development, not an arbitrary sum of XP.
- Do not display invented percentages or imply verified mastery without supporting evidence.
- The exact assessment model, weighting, mastery criteria and progression thresholds remain to be designed in the appropriate later phases.
- Do not interpret opening a chapter, viewing a diagram or navigating the Compendium as practical progress.

The two indicators should appear adjacent in the application's top area.

Desktop: side-by-side presentation.

Mobile: compact stacked or otherwise space-efficient presentation.

The existing TECHNIQUE ROADMAP must remain functionally independent from MUSICAL DEVELOPMENT.

The visual foundation for MUSICAL DEVELOPMENT may be established in Phase 2, but no unsupported progress values may be displayed.

### 2.3 Protected functionality

The following areas must remain unchanged in behaviour during Phase 2:

- TECHNIQUE ROADMAP progression.
- DAILY training, scheduling and completion behaviour.
- HOME functionality unrelated to the new DOJO architecture.
- SETUP functionality.
- Authentication and sign-in behaviour.
- Firebase configuration and Firestore document paths.
- Existing persistence mechanisms, except for explicitly approved additive changes.
- IMPROV's existing functionality and behaviour.

IMPROV's existing behaviour must not be redesigned in Phase 2. Its future architecture must, however, be compatible with the planned MUSICAL DEVELOPMENT system.

The old DOJO interface and its game architecture do not need to be preserved merely for historical compatibility. Useful existing user data must nevertheless be inspected and preserved or safely migrated where relevant.

## 3. DOJO information architecture

DOJO contains three connected learning areas.

### 3.1 Music Theory Compendium

A comprehensive, structured music-theory reference and learning environment.

It must support:

- Beginner-to-advanced learning.
- A recommended learning path.
- Free exploration.
- Search and filtering.
- Clear category and chapter relationships.
- Prerequisites and related-topic links.
- Links to practical exercises where available.
- Future links to Fretboard Mastery, Harmonic Analysis Lab and IMPROV.
- A consistent editorial chapter-reading experience.
- Visual educational resources integrated into the learning material.

All theory material remains accessible.

### 3.2 Fretboard Mastery

A guitar-specific practical learning area.

Phase 2 establishes its landing page and architectural relationship with the Compendium.

It must not claim that interactive tools are already available if they have not been implemented.

The landing page should explain the learning purpose and provide relevant links to theory chapters.

Future activities should be able to reference relevant theoretical concepts and contribute practical evidence to DOJO progression when their exercise systems are implemented.

### 3.3 Harmonic Analysis Lab

A practical environment for understanding and analysing harmony.

Phase 2 establishes its landing page and architectural relationship with the Compendium.

It must not imply that interactive analysis tools are already functional.

The landing page should explain its purpose and provide relevant links to theory chapters.

Future activities should be able to reference relevant theoretical concepts and contribute practical evidence to DOJO progression when their exercise systems are implemented.

## 4. Compendium Explorer — navigation and discovery

The Explorer provides access to the curriculum.

### 4.1 Approved navigation approach

Use a hybrid navigation model:

- Visual category navigation.
- Search.
- Useful filters.
- A recommended learning path.
- Free exploration.

Desktop:
- Persistent category/navigation sidebar.
- Central content area.
- Clear chapter selection and contextual information.

Mobile:
- Compact category-selection experience.
- Prominent search.
- Touch-friendly navigation.
- Avoid excessive nested navigation and horizontal overflow.
- Provide simple back navigation between category selection and chapter lists.

### 4.2 Information presentation

The owner dislikes interfaces that depend excessively on dropdowns and accordions.

Therefore:

- Do not hide the entire curriculum behind successive expandable menus.
- Use visual hierarchy and clear navigation destinations.
- Show enough context to understand where the user is.
- Keep the interface manageable without displaying the entire curriculum simultaneously.
- Use progressive disclosure selectively, not as the primary navigation mechanism.
- Avoid unnecessary interaction steps.
- Avoid deeply nested accordion structures.

The curriculum should be discoverable without overwhelming the user with every topic and subtopic simultaneously.

### 4.3 Search and filters

The Explorer should support searching the available curriculum.

Search must operate on actual curriculum data. Do not display a search control that does not work.

The architecture should support relevant filters using available curriculum metadata.

Potential filter dimensions include learning stage, topic, category and other useful curriculum attributes, where those attributes are actually defined.

The final filter categories and exact interaction details must be defined in the design specification and verified against the implementation scope.

Do not introduce decorative or non-functional filter controls.

Search and filters must not restrict access to theory content.

### 4.4 Recommended path

The recommended path should guide the learner through relevant concepts and prerequisites.

It is guidance only.

It must never:

- Lock chapters.
- Prevent free exploration.
- Require previous chapter completion.
- Treat reading as a progression event.
- Require the user to mark chapters as studied.
- Restrict access based on XP, levels or exercise results.

### 4.5 Curriculum hierarchy and metadata

The Explorer architecture must support:

- Categories.
- Chapters.
- Subchapters.
- Prerequisites.
- Related topics.
- Recommended-path relationships.
- Practical exercise relationships.
- Future relationships with IMPROV.

Use stable identifiers for categories, chapters, subchapters and activities.

Do not rely exclusively on display titles to establish relationships.

## 5. Chapter Reader — editorial reading experience

### 5.1 Approved presentation

Use a continuous reading page.

The chapter should feel like a carefully edited music-theory compendium rather than a sequence of small cards or quiz screens.

Desktop:
- Readable central content column.
- Persistent or context-aware chapter navigation/contents index.
- Clear separation between the main explanation and supporting material.

Mobile:
- Comfortable single-column reading.
- Compact chapter index.
- Touch-friendly navigation.
- No unnecessary permanent sidebars.

### 5.2 Editorial hierarchy

The reusable chapter template should support the following sections where relevant:

1. Overview and learning objectives.
2. Prerequisites.
3. Definitions and terminology.
4. Construction and derivation.
5. Classifications and variations.
6. Conceptual relationships.
7. Sound and musical identity.
8. Harmonic context.
9. Musical context and listening.
10. Practical guitar application.
11. Common mistakes.
12. Worked examples.
13. Exercises and solutions.
14. Related chapters and further study.

Not every chapter requires every section, but substantial chapters must not become superficial definitions followed by repetitive quizzes.

The template must be flexible enough to support different theoretical subjects without forcing irrelevant sections into every chapter.

### 5.3 Editorial visual components

The design system should provide distinct, consistent treatments for:

- Core concepts and definitions.
- Important theoretical distinctions.
- Worked examples.
- Mathematical or interval relationships.
- Chord and Roman-numeral examples.
- Guitar applications.
- Musical context and listening references.
- Common mistakes and warnings.
- Exercises and feedback.
- Related chapters and references.

These components must support readable long-form content.

They must be visually consistent without turning every paragraph or section into an independent card.

### 5.4 Reading and progression separation

Reading a chapter must not:

- Generate XP.
- Change a theory completion status.
- Change MUSICAL DEVELOPMENT.
- Require a `Mark as Studied` action.
- Create artificial content restrictions.
- Generate a mastery claim.
- Be treated as a practical exercise.

Chapter navigation history may only be stored if there is a clear functional need and it does not become a disguised learning-progress system.

No chapter-reading history or progress feature is required for Phase 2.

Do not introduce per-chapter statuses such as `notStarted`, `inProgress`, `studied` or equivalent.

### 5.5 Chapter index behaviour

Desktop:
- Provide a side table of contents or chapter navigation.
- Make the selected section clear.
- Support navigation between chapter sections.
- Keep the main article visually dominant.

Mobile:
- Use a compact chapter index control.
- Allow the reader to access the chapter structure without permanently occupying reading space.
- Return the user to the article without unnecessary navigation steps.

## 6. Theory and practical exercise relationships

Theory and practical work must be connected in both directions.

A theory chapter should be able to reference:

- Relevant DOJO exercises.
- Relevant Fretboard Mastery activities.
- Relevant Harmonic Analysis Lab activities.
- Relevant IMPROV Gates or exercises in the future.

A practical exercise should be able to reference:

- Relevant theory chapters.
- Relevant concepts.
- Relevant prerequisites.
- Relevant related material.

Use stable identifiers and explicit relationships rather than relying exclusively on display titles.

These relationships must be designed so that future exercise systems can use them without restructuring the entire Compendium.

Phase 2 may establish the relationship architecture, but must not prematurely implement the future IMPROV exercise system.

If a referenced exercise does not yet exist, do not display a misleading link or imply that the activity is available.

## 7. Curriculum structure

Retain the agreed curriculum themes and topic structure as the starting point.

The initial categories are:

1. Fundamentals
2. Notes and Pitch
3. Accidentals and Enharmonic Spelling
4. Intervals
5. Key Signatures and Circle of Fifths
6. Scales
7. Modes
8. Triads
9. Seventh Chords
10. Extensions and Alterations
11. Inversions and Voicings
12. Diatonic Harmony
13. Functional Harmony
14. Cadences
15. Secondary Dominants
16. Modal Interchange
17. Modulation
18. Chromatic Harmony
19. Voice Leading
20. Counterpoint
21. Rhythm and Meter
22. Musical Form and Composition

The curriculum must support chapter relationships, prerequisites and future subchapter organisation.

The exact final hierarchy must be checked for completeness and coherence.

The implementation must not claim that a complete curriculum exists if only its structural framework and selected chapter content have been implemented.

### Functional Harmony — mandatory nine-chapter structure

The following nine chapters must remain intact:

1. Understanding Harmonic Function
2. Tonic, Predominant and Dominant Functions
3. Diatonic Functions in Major Keys
4. Diatonic Functions in Minor Keys
5. Functional Progressions and Harmonic Goals
6. Functional Behaviour of Seventh Chords
7. Chord Function in Context
8. Harmonic Rhythm and Phrase Structure
9. Limits of Functional Analysis

Additional topics may appear as subchapters, examples or supporting material. They must not replace this structure.

### Musical context

The Compendium must remain genre-general.

Relevant examples may include stoner, doom, sludge, progressive music, death metal, thrash, blues and selected classic rock.

Use:

- Note names such as A, B and C.
- Chord symbols.
- Roman numerals.
- Key signatures and accidentals where relevant.

Formal staff reading must not be a prerequisite.

Do not fabricate track analyses, musical references, quotations or timestamps.

## 8. Visual identity and design direction

### 8.1 Overall direction

The approved direction combines:

**Modern navigation**
- Clear visual hierarchy.
- Efficient category discovery.
- Compact, responsive navigation.
- Search and filters.
- Minimal unnecessary interaction steps.

**Editorial reading**
- Comfortable typography.
- Clear heading hierarchy.
- Generous readable spacing.
- Long-form content presentation.
- Visually differentiated educational components.
- Serious academic/editorial character.

Preserve the existing premium dark identity established in Phase 1.

### 8.2 Visual consistency

The DOJO should feel like part of The Shred Roadmap, not a separate application.

Before defining new design tokens, inspect the latest approved Phase 1 source.

Reuse existing:

- Colour variables and palette where appropriate.
- Typography.
- Spacing system.
- Borders and surfaces.
- Buttons and interaction states.
- Responsive breakpoints.
- Navigation conventions.

New components may extend the existing system where necessary.

Do not invent final colours, fonts, sizes or CSS tokens without checking the approved baseline.

### 8.3 Progress indicators

**TECHNIQUE ROADMAP**
- Preserve its existing red identity and phase segmentation.
- Preserve its existing calculations and behaviour.
- Use the explicit label `TECHNIQUE ROADMAP`.

**MUSICAL DEVELOPMENT**
- Give it a visually distinct identity.
- Show the global indicator and DOJO/IMPROV subdivisions.
- Do not display unsupported progress values.
- The exact visual treatment and palette must be finalised after inspection of the current design system.

### 8.4 Responsive requirements

The Explorer, Reader and DOJO Hub must work at desktop, tablet and mobile widths.

Maintain:

- Readable text widths.
- Comfortable touch targets.
- No unintended horizontal overflow.
- Clear active navigation states.
- Keyboard accessibility.
- Visible focus states.
- Sufficient contrast.
- Browser zoom compatibility.

The existing intentional hidden global scrollbars must remain unless a demonstrated accessibility or usability issue requires a separately approved change.

## 9. Data and architecture principles

Separate three concerns.

### A. Static curriculum definitions

Store curriculum structure independently from individual user activity.

This includes:

- Stable category and chapter IDs.
- Titles and descriptions.
- Hierarchy.
- Subchapter relationships.
- Prerequisites.
- Related chapters.
- Links to practical activities.
- Recommended path metadata.
- Future compatibility relationships with IMPROV.

Curriculum definitions must not be duplicated into individual user records unnecessarily.

### B. Practical activity records

Future exercise systems should be able to record meaningful activity evidence, such as:

- Exercise identifier.
- Learning area.
- Attempt or activity type.
- Completion/result.
- Difficulty or assessment information, where applicable.
- Relevant competency identifiers.
- Timestamp.
- Evidence actually captured by the application.

Do not claim to verify physical guitar performance unless the application receives and evaluates the relevant performance data.

Phase 2 must not invent a final scoring or mastery formula.

The data architecture should distinguish between an activity being attempted, an exercise being completed and a competency being demonstrated.

These are not automatically equivalent.

### C. Progress calculations

MUSICAL DEVELOPMENT must eventually derive from meaningful practical evidence in DOJO and IMPROV.

The global indicator must retain the distinction between the contributions of the two areas.

The exact model remains open.

Do not implement arbitrary XP accumulation or theory-reading progress as a substitute.

### Data protection

- Preserve existing useful user data.
- Prefer additive, versioned state changes.
- Do not silently discard unknown state properties.
- Do not change Firebase configuration.
- Do not change authentication.
- Do not change Firestore paths.
- Do not redesign the general cloud synchronisation strategy without approval.
- Verify current code before making migration decisions.
- Inspect existing legacy DOJO data before deciding what can be safely discarded or migrated.

If a future-compatible structure is required, document its purpose and implications before implementation.

## 10. Phase 2 implementation boundaries

### Included

- New DOJO Hub.
- Music Theory Compendium Explorer.
- Curriculum categories and chapter hierarchy.
- Search and filtering, if fully functional.
- Recommended path and free exploration.
- Continuous Chapter Reader.
- Reusable editorial chapter template.
- Fretboard Mastery landing page.
- Harmonic Analysis Lab landing page.
- Theory/practice relationship architecture.
- Architectural compatibility for future DOJO/IMPROV practical progress.
- Adjacent TECHNIQUE ROADMAP and MUSICAL DEVELOPMENT header presentation, subject to safe integration with the existing application.
- Necessary responsive design work for the new DOJO experience.
- Reusable visual educational resource conventions.
- At least one representative educational diagram integrated into the Chapter Reader.

### Excluded

- Full theory encyclopaedia content.
- Detailed interactive fretboard tools.
- Detailed harmonic analysis tools.
- Full IMPROV redesign.
- Changes to the five IMPROV Gates.
- IMPROV Gate exercises and assessment.
- Final MUSICAL DEVELOPMENT scoring or mastery formula.
- Theory-reading progress, XP or completion systems.
- Changes to DAILY behaviour.
- Changes to TECHNIQUE progression calculations or phase data.
- Changes to Firebase configuration, authentication or database paths.
- Unrelated refactoring.

## 11. Implementation and review safeguards

Implementation must take place in two distinct stages.

### Stage 1 — Independent audit and implementation plan

Before coding:

1. Read the current MASTERPLAN, CHECKPOINT and PHASE_LOG.
2. Read this complete approved Phase 2 specification and all its addenda.
3. Inspect the complete latest approved `index.html` from `main`.
4. Inspect the existing Phase 2 branch implementation separately.
5. Compare both sources and identify the exact starting point.
6. Inspect existing header, progress, DAILY, DOJO, IMPROV, state, localStorage and Firebase code.
7. Identify existing functionality that could be affected.
8. Identify data and persistence risks.
9. Identify missing requirements, regressions and unnecessary changes.
10. Produce a clear implementation and correction plan.

The existing unapproved Phase 2 implementation must not be treated as an approved baseline.

Stage 1 is audit only.

**Do not modify code, commit changes or merge anything during Stage 1.**

Stop and present the findings to the owner for review.

### Stage 2 — Implementation

Stage 2 may begin only after the owner explicitly approves the audit findings and implementation plan.

Implementation must:

- Work only on the authorised Phase 2 development branch.
- Use the latest approved `main` version as the authoritative reference baseline.
- Stay within the approved scope.
- Correct identified architectural risks.
- Preserve unrelated functionality.
- Avoid speculative features.
- Avoid unnecessary dependencies.
- Keep deployment compatible with the existing setup.
- Stop and report if a requirement would force an unauthorised change.
- Produce the complete updated `index.html`.
- Document every changed area.
- Explain data and migration implications.
- Identify tests actually performed and tests still required.

Do not merge until the owner has reviewed and approved the implementation.

### Required deliverables

- Complete updated `index.html`.
- Updated curriculum structure.
- Reusable chapter template.
- Data model description.
- Change log.
- Modified functions, styles and state fields.
- Migration notes.
- Manual test checklist.
- Known limitations.
- Explicit distinction between static source inspection, tests actually run and tests still required.

## 12. Acceptance criteria

Phase 2 is acceptable only when all applicable criteria are satisfied.

### DOJO architecture

1. The DOJO Hub presents the three learning areas coherently.
2. Music Theory Compendium, Fretboard Mastery and Harmonic Analysis Lab have clear purposes.
3. Fretboard Mastery and Harmonic Analysis Lab do not claim functionality that does not exist.
4. The Compendium Explorer supports clear category navigation.
5. Curriculum hierarchy supports categories, chapters and subchapters.
6. Prerequisites and related-topic relationships are supported.
7. Search and filters work if presented as functional controls.
8. The recommended path and free exploration coexist.
9. The nine Functional Harmony chapters remain intact.

### Chapter Reader

10. The Chapter Reader provides a continuous, readable editorial experience.
11. The reusable template supports the required educational sections.
12. Editorial components are consistent and support long-form content.
13. Desktop and mobile navigation are both usable.
14. The chapter index behaves appropriately on mobile.

### Theory and practical progression

15. Theory chapters are always accessible.
16. No reading-progress, XP or `Mark as Studied` mechanism exists.
17. Theory/practical relationships can be represented through stable identifiers.
18. No unsupported MUSICAL DEVELOPMENT progress values are displayed.
19. The TECHNIQUE ROADMAP remains functionally unchanged.
20. DAILY behaviour remains unchanged.
21. IMPROV behaviour remains unchanged.

### Visual learning

22. Reusable visual-resource conventions are established.
23. At least one representative educational diagram is integrated into the Chapter Reader.
24. Diagrams remain legible and responsive.
25. Static and interactive resources are clearly distinguished.
26. Visual information is not communicated through colour alone.

### Preservation and delivery

27. Existing user data and unrelated application features are preserved.
28. Firebase configuration, authentication and Firestore paths remain unchanged.
29. The application remains compatible with the existing deployment setup.
30. All reported tests are accurately classified as performed or pending.
31. The complete required handover documentation is supplied.

## 13. Open decisions

The following details require final design or architectural review before implementation:

- Exact desktop header proportions and mobile compact layout.
- Final visual treatment and palette for MUSICAL DEVELOPMENT.
- Exact Explorer category and filter interaction details.
- Final typography and spacing values, based on the approved Phase 1 design system.
- Exact chapter index behaviour on mobile.
- Which practical activity metadata must be prepared in Phase 2 versus deferred.
- Which legacy DOJO data, if any, is useful enough to migrate.

These decisions must be documented before implementation if they materially affect architecture or user experience.

Do not invent final decisions for subjects explicitly reserved for later phases.

---

# ADDENDUM A — VISUAL LEARNING AND EDUCATIONAL RESOURCES

The Compendium must not become a text-only learning experience.

**Visual Learning Principle:** Every substantial theoretical concept must use visual representations whenever they materially improve understanding, clarify relationships or demonstrate musical structure.

Depending on the subject, educational resources may include:

- Circle of Fifths and key-signature diagrams.
- Note, interval, scale and chord construction diagrams.
- Guitar fretboard maps and position diagrams.
- Harmonic progression and functional relationship diagrams.
- Voice-leading and chord-transition visualisations.
- Rhythm, subdivision and meter diagrams.
- Comparative modal and scale diagrams.
- Conceptual flowcharts and structured musical examples.

Visual resources must appear within the relevant chapter sections, close to the explanations they support.

Do not place all diagrams in a separate gallery at the end of a chapter.

### Static and interactive resources

Distinguish between:

1. **Static educational diagrams:** visual explanations and reference material.
2. **Interactive visual tools:** components that allow the learner to manipulate or explore musical information.

Interactivity should be implemented when it provides meaningful educational value. Do not introduce unnecessary complexity merely to make a diagram interactive.

### Implementation principles

The visual system should be:

- Reusable.
- Responsive.
- Legible.
- Consistent with the application's design language.
- Suitable for desktop and mobile.
- Supported by clear labels, legends and captions.
- Understandable without relying on colour alone.

Prefer reusable HTML, CSS and SVG-based components where appropriate.

Keep diagram data separate from presentation logic where practical.

Avoid unnecessary external libraries.

Phase 2 must establish the visual component conventions and demonstrate at least one representative educational diagram within the Chapter Reader environment.

This demonstration is a foundation, not a claim that the full interactive visual-tool library has been completed.

---

# ADDENDUM B — IMPROV NAMING AND EDITORIAL LANGUAGE

**IMPROV** is the official name of the application section.

Use `IMPROV` consistently in:

- Main navigation.
- Headers and section titles.
- Progress indicators.
- Cards and interface labels.
- The MUSICAL DEVELOPMENT subdivision.
- The five Gate identities.

In explanatory prose and educational content, use natural English expressions according to context, including:

- "the improvisation track"
- "the improvisation learning path"
- "improvisation exercises"
- "improvisational skills"
- "improvisational development"

Do not force the word `IMPROV` into grammatical contexts where natural English would use "improvisation" or "improvisational".

The distinction is intentional: `IMPROV` is the product and navigation identity; natural improvisation terminology is used in editorial and educational writing.

---

# ADDENDUM C — NAVIGATION AND VISUAL EXPERIENCE BLUEPRINT

## 1. Global Header and Progress Architecture

The existing application header remains the foundation.

The header must contain:

- Existing brand and authentication controls.
- Existing search area, to be developed according to the approved search scope.
- Two independent progress systems beneath the header controls.

### Desktop layout

Display the two progress systems side by side.

**TECHNIQUE ROADMAP**

- Preserve the existing segmented red progress bar.
- Preserve phase labels and existing calculations.
- Add the explicit `TECHNIQUE ROADMAP` label.
- Do not alter phase data or progression logic.

**MUSICAL DEVELOPMENT**

- Display one global musical development indicator.
- Show DOJO and IMPROV as distinct subdivisions.
- Provide a clear distinction between global development and each area's contribution.
- Do not display percentages, completion values or mastery claims without valid practical activity records and an approved calculation model.

### Mobile layout

Stack the two progress systems compactly.

Preserve readability and avoid reducing the main navigation or authentication controls to unusable sizes.

If no valid musical development data exists, display a neutral empty state explaining that progress will appear as practical activity is recorded.

Do not invent a starting percentage or imply that the user has already demonstrated competencies.

## 2. DOJO Hub

The DOJO landing page presents three primary learning destinations:

1. Music Theory Compendium
2. Fretboard Mastery
3. Harmonic Analysis Lab

Each destination should include:

- Clear title.
- Short editorial description.
- Learning purpose.
- Relevant visual identity.
- Direct navigation action.
- Relevant relationships with the other DOJO areas.

Desktop may use a three-column card layout where sufficient space exists.

Mobile should use vertically stacked, touch-friendly destination cards.

Avoid XP, levels, locked educational material and decorative gamification.

## 3. Compendium Explorer

### Desktop

Use a two-area layout.

**Curriculum navigation**

- Persistent category navigation.
- Clear selected-category state.
- Recommended-path indication.
- Search and available filters.

**Main exploration area**

- Selected category title and introduction.
- Chapter list with concise descriptions.
- Difficulty or learning-stage indication where useful.
- Prerequisite and related-topic information.
- Direct chapter navigation.

The internal navigation must adapt to the available viewport width.

Do not force a narrow content column by retaining an oversized sidebar on smaller screens.

Avoid excessive nested dropdowns and accordions.

### Mobile

Use a dedicated category-selection experience.

The mobile Explorer should provide:

- Prominent search.
- Clear visual category selection.
- Chapter lists after category selection.
- Simple back navigation.
- No deep accordion hierarchy.

The desktop sidebar must not simply be compressed into a narrow mobile column.

## 4. Chapter Reader

### Desktop

Use a focused editorial reading layout.

- Chapter contents/navigation index on the side.
- Main article in a readable central column.
- Clear chapter title and introduction.
- Consistent section hierarchy.
- Related chapters and practical applications integrated into the article.

The reader may use a wider content container than the existing generic application panels when necessary.

### Mobile

Use a single-column reading experience.

- Compact chapter index control.
- Clear section headings.
- Comfortable paragraph width and spacing.
- Diagrams scaled to the available viewport.
- No permanent desktop-style sidebar.

## 5. Visual Educational Resource System

Educational diagrams must be treated as part of the chapter architecture, not as optional decoration.

The reusable visual system should support:

- Circle of Fifths.
- Key-signature and accidental diagrams.
- Interval and scale structures.
- Chord construction and inversion diagrams.
- Guitar fretboard maps.
- Harmonic progression diagrams.
- Functional harmony and resolution maps.
- Voice-leading visualisations.
- Rhythm and subdivision diagrams.
- Comparative modal and scale diagrams.

### Implementation principles

- Prefer reusable HTML, CSS and SVG-based components where appropriate.
- Keep diagram data separate from presentation logic where practical.
- Provide clear labels, legends and captions.
- Ensure diagrams remain legible on mobile.
- Do not rely on colour alone to communicate musical information.
- Provide text explanations alongside visual representations.
- Avoid unnecessary external libraries.

Static educational diagrams and interactive tools must remain distinct component types.

Phase 2 should establish the visual component conventions and demonstrate at least one representative educational diagram within the Chapter Reader environment.

This demonstration is a foundation, not a claim that the full interactive visual-tool library has been completed.

## 6. Visual hierarchy and consistency

Retain the existing Phase 1 design system as the source of visual identity.

The new DOJO experience should combine:

- Modern navigation.
- Editorial reading.
- Clear information hierarchy.
- Consistent educational diagram styling.
- Responsive layouts.
- Restrained use of colour and decorative effects.

Avoid turning every section into a card.

Cards are appropriate for navigation and concise summaries; long-form educational content should remain readable as an article.

## 7. Navigation and interaction consistency

Use consistent interaction patterns for:

- Opening a learning area.
- Selecting a curriculum category.
- Opening a chapter.
- Navigating chapter sections.
- Returning to the Explorer.
- Following related theory and practical links.

The user should always understand:

- Which learning area is open.
- Which category or chapter is selected.
- How to return to the previous navigation level.
- Which related concepts or practical activities are available.

Do not introduce navigation patterns that behave differently without a clear usability reason.

---

# APPROVAL RECORD

The project owner has approved the core Phase 2 specification and Addenda A, B and C.

The approved requirements include:

- The dual progression architecture.
- Practical-only MUSICAL DEVELOPMENT progression.
- Permanent accessibility of theory content.
- The DOJO Hub, Explorer and Chapter Reader experience.
- The 22 initial curriculum categories.
- The mandatory nine-chapter Functional Harmony structure.
- Theory-to-practice and practice-to-theory relationships.
- The detailed editorial chapter structure.
- Visual educational resources and diagram conventions.
- Official `IMPROV` naming.
- The Navigation and Visual Experience Blueprint.
- Preservation of existing functionality outside the authorised Phase 2 scope.

Approval of this specification authorises the Phase 2 audit and planning process.

It does not, by itself, authorise code implementation, merging or changes to `main`.

**Next authorised activity: Stage 1 — Independent audit and implementation plan.**
