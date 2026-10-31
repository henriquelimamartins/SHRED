# THE SHRED ROADMAP — PROJECT MASTERPLAN

> Faithful Markdown conversion of the approved Project Master Document (Version 1.0, 30 October 2026). Technical observations describe the audited original version and must be re-verified against the current HTML before coding.

THE SHRED ROADMAP

Project Master Document

Product vision • Technical context • Architecture • Gemini implementation prompts

Version 1.0  |  30 October 2026

A durable handover document for continuing the project across conversations and development sessions.

## How to use this document

This document is the project’s durable source of context. It records the product decisions, the known characteristics of the original app, the intended redesign, the implementation sequence, and copy-ready prompts for Gemini. It is also designed to be re-uploaded into a future ChatGPT conversation if project context is lost.

Keep the original index (9).html unchanged as the reference baseline. Make a separate working copy before any code changes.

Give Gemini the latest complete index.html plus only the prompt for the current phase.

Do not ask Gemini to implement multiple large phases in one operation.

After each phase, download and preserve the complete updated HTML as a named checkpoint.

Run the acceptance checks before moving to the next phase.

If Gemini cannot safely complete a phase in one response, ask it to stop at a clear checkpoint rather than omit code or silently simplify features.

Important provenance note: the technical inventory below reflects the earlier inspection of the original file and the project context available during this planning conversation. Before implementation, Gemini must verify all function names, selectors, data fields, Firebase paths, and dependencies against the actual file. Do not treat this document as proof that every listed implementation detail is still present in a later version.

## 1. Executive project brief

The Shred Roadmap is intended to become a comprehensive, long-term music-learning and musicianship platform. It should feel like a premium, carefully edited music-theory compendium and practical learning environment, not a shallow quiz app. The user is a musician first and a guitarist second: general music theory is the foundation, with guitar-specific applications presented clearly as a separate practical layer.

### Confirmed product decisions

| Decision | Confirmed requirement |

| --- | --- |

| Learning model | Both a progressive recommended learning path and free exploration of the full library. |

| Language | English throughout the app and learning content. |

| Platforms | Desktop and mobile have equal priority; responsive design is required. |

| Information density | Comprehensive depth, but avoid showing too much at once. |

| Navigation | Clear hierarchy, expandable chapters and subchapters, strong search/discovery. |

| Visual learning | Interactive diagrams and visual tools are essential. |

| Original app | Respect the original format, identity, core structure and useful functionality. |

| Dojo | Rebuild the learning experience from scratch; existing Dojo content/mini-games can be treated as disposable. |

| Improv | Substantially redesign the existing Improv area and its five Gates. |

| Listening Vault | Substantially redesign and expand it into an active reference and analysis library. |

## 2. Learning goals and scope

The app should help the user achieve all of the following:

Dominate music theory at an advanced level.

Know the fretboard deeply and navigate it without hesitation.

Understand harmony and analyse complex music.

Improvise freely without depending exclusively on memorised shapes.

Compose riffs, progressions, solos and complete pieces.

Build a broad theoretical foundation that can be applied to many genres.

### Depth and editorial standard

The desired depth is encyclopaedic and almost academic, while remaining readable and practical. A chapter should explain concepts, definitions, construction, terminology, classifications, exceptions, relationships, historical context where useful, examples, musical effects, practical applications, common misconceptions and exercises. Avoid superficial one-paragraph explanations.

### Exercise preferences

Prioritise harmonic analysis, phrasing, fretboard construction and fluency.

Use practical theory tasks: construct, identify, analyse, diagnose, compare, transpose, apply and solve.

Do not make formal staff-reading a prerequisite; simplified chord-symbol and Roman-numeral notation is appropriate.

Ear-training drills and open-ended creative composition exercises are not essential because the user has separate tools for these.

Do not rely on randomised tonalities with an unchanged question template. Vary the cognitive task and the musical context.

### Visual requirements

Interactive guitar fretboard with selectable notes, intervals, scales, chords, arpeggios and positions.

Interval and scale diagrams.

Circle of fifths and key-signature visualisation, including accidentals.

Chord construction, inversions, extensions and voicing visuals.

Progression and harmonic-analysis visualisations.

Side-by-side mode and scale comparisons.

Rhythm and subdivision diagrams.

Simplified harmonic notation using chord letters (A, B, C...) and Roman numerals (I, ii, iii, IV, V...).

### Genre context

The theory must remain general rather than being restricted to a genre. Use grounded musical examples and explain where a concept appears, why it works and what effect it creates. Priority reference worlds: stoner, doom, sludge, progressive music, death metal, thrash, blues and selected classic rock.

## 3. Original application: baseline inventory

The reference file identified in the project is index (9).html (approximately 130 KB and 2,038 lines at the time it was inspected). It is the authoritative baseline. A separate Gemini-generated file index(1).html was previously judged incomplete and must not be used as the foundation.

### Existing top-level areas

| Area | Current role / known content | Decision |

| --- | --- | --- |

| Home | Dashboard, roadmap overview, progress and access to app areas. | Preserve and improve. |

| Daily | Daily practice plan, tasks, completion, calendar/streak concepts. | Preserve core behaviour. |

| Improv | Five original Gates and related exercises/references. | Redesign deeply; retain the five-Gate identity. |

| Dojo | XP/levels, Codex and small learning games/quizzes; current pedagogy considered disposable. | Rebuild learning experience from scratch. |

| Library | Roadmap/resources, Creative material, Listening Vault and extra information. | Reorganise; preserve useful material. |

| Setup | Guitar setup/configuration and maintenance companion. | Preserve as an independent useful tool. |

### Known technical characteristics (verify in source)

Single-file web app: HTML, CSS and JavaScript integrated in one index.html.

Interface and views are rendered/updated through JavaScript; interaction uses delegated events and data-action attributes.

State is held in a central JavaScript state object.

localStorage is used for local persistence; a key observed during the audit was shredRoadmapState_v10.

Firebase Authentication with Google sign-in and Cloud Firestore are used for optional account login and cross-device synchronisation.

A user document path observed during the audit was users/{uid}; verify exact read/write logic and security assumptions.

The interface observed during the audit was constrained to roughly 520 px and used a horizontal carousel-like navigation. Reassess rather than assume this is the only layout mechanism.

The original app included the five Improv Gates: The Horizontal Prison; The Chord Tone Architect; The Rhythmic Displacer; The Modal Alchemist; Total Audiation.

The Listening Vault included genre/reference groupings around Stoner/Doom/Sludge, Prog/odd meters, Death Metal/Groove and Classic Rock/Blues, with artists including Tony Iommi, David Gilmour, Mikael Åkerfeldt, John Petrucci, Guthrie Govan, Chuck Schuldiner, Dimebag Darrell and Nick DiSalvo.

The original source file must be re-inspected before coding. Treat the technical details in this section as audit leads, not permission to guess. Gemini must report discrepancies and preserve all unrelated features.

## 4. Target information architecture

### Top-level navigation

HOME — personal dashboard, current learning path, recommended next step, recent activity and progress.

DAILY — practice schedule and tasks, retaining existing useful behaviour.

DOJO — new learning centre with Music Theory Compendium, Fretboard Mastery and Harmonic Analysis Lab.

IMPROV — five deep learning Gates focused on practical melodic and improvisational language.

LIBRARY — Listening Vault, technical roadmap, Creative resources and other reference material.

SETUP — guitar configuration and maintenance companion.

### Dojo: three connected learning areas

#### A. Music Theory Compendium

A structured encyclopaedia from fundamentals to advanced theory: sound and pitch concepts; notes and enharmonic spelling; intervals; accidentals and key signatures; scales; modes; diatonic harmony; triads; seventh chords; extensions and alterations; inversions; chord symbols; functional harmony; cadences; secondary dominants; modal interchange; modulation; chromatic harmony; voice leading; counterpoint; rhythmic concepts; form and composition. The final syllabus should be sequenced and reviewed for gaps.

#### B. Fretboard Mastery

Interactive guitar-focused application: note locations; interval relationships; string tuning and string-to-string relationships; scale patterns and positions; triads and inversions; arpeggios; chord voicings; CAGED and alternative visualisation systems; mapping shapes to keys and harmonic functions; target notes and phrase resolution. It should explain the underlying theory rather than teach shapes in isolation.

#### C. Harmonic Analysis Lab

A practical workspace for analysing progressions, riffs and excerpts: tonal centres; Roman-numeral analysis; diatonic and non-diatonic chords; modal interchange; secondary dominants; pedal tones and drones; ambiguous harmony; modulations; harmonic rhythm; genre-specific devices; and explanations of why a progression creates a particular effect. Provide guided examples and structured analysis tasks.

### Improv: five Gates

The Horizontal Prison — Break dependence on fixed box/shape thinking; connect positions, phrases and the neck.

The Chord Tone Architect — Target chord tones, outline harmony, connect lines to changes and use voice leading.

The Rhythmic Displacer — Develop rhythmic variation, displacement, subdivisions, odd meters and phrase placement.

The Modal Alchemist — Understand modal colour, scale/chord relationships and controlled modal application.

Total Audiation — Develop internal musical conception and coherent melodic direction; adapt activities to avoid duplicating the user's separate ear-training tools.

Each Gate should have a clear purpose, prerequisites, progressive levels, substantial explanations, practical tasks, feedback/rubrics and links to relevant Dojo chapters. Avoid turning the Gates into a sequence of shallow multiple-choice quizzes.

### Listening Vault

Transform the current reference collection into an active listening and analysis library. Each entry may include artist/work/track or passage, genre/context, concepts to notice, harmonic or melodic analysis, rhythmic/phrasing observations, guitar application, links to relevant chapters and personal study notes. Do not invent track timestamps, musical claims or quotations; require verification or mark them as editorial suggestions awaiting review.

## 5. Chapter editorial template

Use this template as the default quality bar for substantial Compendium chapters. Not every section must be equally long, but no chapter should be a shallow definition plus quiz.

Overview — what the subject is, why it matters and what the learner will be able to do.

Prerequisites — concepts that should already be understood, with links back to chapters.

Definitions and terminology — precise language and notation.

Construction / derivation — show how the concept is built, not merely the result.

Classifications and variants — types, categories, exceptions and edge cases.

Relationships — links to scales, chords, keys, functions, rhythm or other relevant concepts.

Musical effect — sound, tension, colour, stability, ambiguity and expressive consequences.

Context and examples — use examples from varied genres, explaining why they work.

Guitar application — a clearly separated practical section, where relevant.

Common mistakes — misconceptions, spelling errors, analytical traps and oversimplifications.

Worked examples — step-by-step reasoning, not just final answers.

Exercises — varied task types, progressive difficulty, answer explanations and hints.

Further study — related chapters, references and suggested next steps.

## 6. Learning path, assessment and progress

Support two modes at the same time: a recommended sequential path for learners who want guidance, and free exploration where all appropriate reference content can be opened directly. Do not lock essential knowledge behind XP or arbitrary level gates.

Each chapter has status such as not started, in progress, studied and mastery demonstrated; define the exact state model during architecture.

Track lesson completion separately from exercise performance.

Support bookmarks/favourites, personal notes and recently viewed chapters if feasible.

Assess mastery through different task formats: construct, identify, classify, analyse, diagnose, compare, transpose, apply and explain.

Show explanations and worked solutions after attempts; avoid unexplained right/wrong feedback.

Use spaced review or revision recommendations only if implemented transparently and reliably.

Keep progress data compact and separate from static lesson content.

## 7. UX and visual direction

Premium, professional, editorial feel; strong typography and consistent spacing.

Dark visual direction may build on the current app identity, but preserve readability and contrast.

Desktop: use available width effectively, with clear persistent navigation and a readable content column.

Mobile: compact navigation, touch-friendly controls and diagrams that remain usable without horizontal overflow.

Use progressive disclosure: expandable chapters, subchapters, accordions and optional advanced detail.

Keep a clear visual distinction between theory explanation, worked example, guitar application, exercise and reference.

Provide global search across chapters and learning tools where feasible.

Interactive diagrams should have labels, legends, accessible controls and a useful static fallback.

Avoid visual clutter, excessive cards, gamification noise and giant unbroken walls of text.

## 8. Data, persistence and compatibility principles

Preserve the existing state fields and data formats unless a documented migration is necessary.

Do not overwrite or discard existing user data while rebuilding Dojo.

Keep static curriculum/content definitions separate from per-user progress.

Store only user-specific state in localStorage/Firestore: completion, mastery, attempts where useful, bookmarks, notes and preferences.

Use additive schema changes where possible and include a versioned migration path.

Maintain optional login: the app should remain useful without signing in.

Maintain local-first behaviour and ensure account sync does not silently overwrite newer data.

Document how conflict resolution works; do not invent a last-write-wins strategy without checking the current implementation.

Never expose Firebase private credentials or secrets in client code. Firebase web configuration is not a server secret, but security must rely on correct Firestore Security Rules and Auth checks.

Do not change Firebase project identifiers, collections, document paths or rules without explicit evidence and a migration plan.

## 9. Development workflow and safeguards

Maintain an untouched copy of the original index (9).html.

Create a working branch or separate file for development; do not edit the only copy.

Before each Gemini phase, attach the latest complete index.html and provide the phase prompt below.

Ask Gemini to inspect the file before editing and identify the exact functions/sections it will touch.

Require a complete updated index.html as output, plus a concise change log and manual test checklist.

If the complete file is too large for one response, require a reliable downloadable artifact or a clearly staged output. Never accept omitted sections or placeholders such as 'rest of code unchanged'.

After each phase, test desktop and mobile, signed-out and signed-in states, local persistence and cross-device sync where applicable.

Keep named checkpoints, for example: baseline, phase-01-ui, phase-02-dojo-shell, phase-03-compendium, etc.

Do not merge a phase until its acceptance criteria pass.

## 10. Gemini master instructions

### Master prompt — include with every phase

Objetivo: Sets the global context and safeguards. Paste this before the phase-specific prompt, or prepend it to the relevant phase prompt.

| You are acting as a senior front-end engineer, software architect, UX designer and music-education content architect working on an existing application called The Shred Roadmap.<br><br>PROJECT CONTEXT<br>The Shred Roadmap is an existing single-page web application, originally delivered as a single index.html containing HTML, CSS and JavaScript. The authoritative baseline is the original file named index (9).html. Do not use or reconstruct the app from any failed or simplified alternative file. The app has existing Home, Daily, Improv, Dojo, Library and Setup areas, plus local persistence and optional Google/Firebase authentication with Firestore synchronisation. Verify all technical details against the attached source before relying on them.<br><br>PRODUCT VISION<br>Build a comprehensive, long-term music-learning platform with encyclopaedic music theory, deep fretboard fluency, harmonic analysis and practical improvisational development. The user thinks of themselves as a musician first and a guitarist second. General music theory is the core curriculum; guitar application must be clearly separated as a practical layer. The experience must feel premium, professional, editorial and useful for years, not like a shallow quiz game.<br><br>CONFIRMED DECISIONS<br>- Both a progressive recommended learning path and free exploration.<br>- English language throughout the app.<br>- Desktop and mobile have equal priority.<br>- Comprehensive depth, but progressive disclosure to avoid overwhelming the learner.<br>- Expandable chapters, clear navigation and interactive diagrams.<br>- Respect the original app's identity, core format and useful existing functionality.<br><br>SCOPE<br>- Rebuild the Dojo learning experience from scratch. Treat its current educational content, Codex structure and mini-games as disposable. Preserve or reuse technical integration only where it is genuinely useful.<br>- Redesign Improv substantially, retaining and deepening its five-Gate identity: The Horizontal Prison, The Chord Tone Architect, The Rhythmic Displacer, The Modal Alchemist and Total Audiation.<br>- Redesign and expand the Listening Vault into an active reference and analysis library.<br>- Preserve and sensibly integrate Home, Daily, Setup, existing roadmap/progress and other useful Library content.<br><br>NON-NEGOTIABLE SAFEGUARDS<br>1. The attached original index (9).html is the source of truth. Inspect it; do not guess.<br>2. Do not replace the whole application with a simplified rewrite.<br>3. Do not remove unrelated features, state fields, Firebase integration, local persistence or existing user data.<br>4. Do not change authentication, Firestore paths, Firebase project configuration or security assumptions without explaining the reason and migration impact.<br>5. Keep static educational content separate from user-specific progress.<br>6. Make schema changes additive and versioned wherever possible.<br>7. Do not use XP as a gate that blocks access to educational content.<br>8. Do not make the learning experience a multiple-choice quiz bank. Include construction, analysis, diagnosis, comparison, transposition and application tasks.<br>9. Do not produce superficial or fabricated music-theory content. Explain definitions, derivations, classifications, exceptions, musical effects, examples and applications.<br>10. Do not output placeholders or omit unchanged code. The deliverable must be a complete, working updated index.html.<br><br>WORKING METHOD<br>Only perform the phase requested in the current prompt. First inspect the attached current file. State the relevant existing architecture and the exact areas you plan to change. Implement only after that inspection. Preserve unrelated code. At the end, provide:<br>- complete updated index.html;<br>- a concise change log;<br>- list of functions/state fields/files changed;<br>- migration notes, if any;<br>- manual acceptance-test checklist;<br>- known limitations and unfinished work.<br>If the task cannot be completed safely in one pass, stop at a clear checkpoint and explain exactly what remains. Never silently simplify or pretend incomplete work is finished. |

| --- |

## 11. Step-by-step Gemini prompts

Use the Master Instructions above together with one prompt at a time. Attach the latest working index.html on every implementation phase. For Phase 0, attach the untouched original baseline.

### Phase 0 — Audit and architecture

Objetivo: Understand the actual code and approve a safe architecture before implementation.

| PHASE 0 — SOURCE AUDIT AND ARCHITECTURE ONLY (DO NOT EDIT CODE)<br><br>I am attaching the original authoritative index.html for The Shred Roadmap. Your task is to inspect it thoroughly and produce an implementation architecture. Do not modify the file, do not generate replacement code and do not redesign the app yet.<br><br>1. Map the full application:<br>   - top-level navigation and every subview;<br>   - render functions, event handlers, delegated actions and important DOM selectors;<br>   - CSS/layout system and responsive breakpoints;<br>   - central state object and every persistence mechanism;<br>   - localStorage keys and versioning;<br>   - Firebase Auth initialisation, Google sign-in/out, Firestore reads/writes and document paths;<br>   - roadmap, Daily, Improv, Dojo, Library, Listening Vault and Setup functionality;<br>   - external libraries, assets, fonts and other dependencies.<br>2. Identify the minimum set of existing behaviours that must be preserved.<br>3. Identify which Dojo educational structures can be discarded and which technical services/state integrations may be reused.<br>4. Identify the exact Improv and Listening Vault structures that will need replacement or migration.<br>5. Propose a revised information architecture retaining the app's recognisable identity and useful top-level structure.<br>6. Propose a modular internal code organisation suitable for a single-file GitHub Pages app. Do not assume a build system or server exists.<br>7. Propose data models for static curriculum content and per-user progress. Include migration/versioning and local-first/offline considerations.<br>8. Explain how the progressive path and free exploration coexist without content locks.<br>9. Identify risks, technical debt, unknowns and dependencies.<br>10. Provide a phase-by-phase implementation plan with dependencies and test gates.<br><br>OUTPUT FORMAT<br>A. Verified source inventory (quote exact function names/keys/paths only when found).<br>B. Existing feature preservation matrix.<br>C. Proposed navigation and information architecture.<br>D. Proposed code/component organisation.<br>E. Proposed curriculum/content data model.<br>F. Proposed user-progress data model and migration plan.<br>G. Firebase/local persistence compatibility plan.<br>H. Risks and open questions.<br>I. Detailed implementation sequence and acceptance criteria.<br><br>Be explicit about anything you could not verify. Do not infer missing functionality. Do not change the file. |

| --- |

### Phase 1 — Responsive UI and navigation

Objetivo: Create the design foundation before adding large content modules.

| PHASE 1 — RESPONSIVE DESIGN SYSTEM AND NAVIGATION FOUNDATION<br><br>Using the approved Phase 0 architecture, implement only the visual/layout foundation and navigation shell. Do not yet write the full curriculum or build the detailed learning tools.<br><br>GOALS<br>- Preserve the recognisable The Shred Roadmap identity and all unrelated working features.<br>- Replace the narrow, mobile-only-feeling layout with a polished responsive experience for desktop and mobile equally.<br>- On desktop, use a clear persistent navigation/sidebar or equivalent structure and a readable main content area.<br>- On mobile, provide compact, touch-friendly navigation without horizontal overflow.<br>- Retain the six top-level areas: Home, Daily, Dojo, Improv, Library and Setup. Their internal content can be reorganised later.<br>- Add a consistent page header, breadcrumbs or section context where useful, reusable content containers, typography, spacing, buttons, tabs, accordions and status indicators.<br>- Establish progressive disclosure: chapters and sections can expand/collapse; long content should not all appear at once.<br>- Create a visual language for theory, worked examples, guitar application, exercises, warnings and references.<br>- Add a search entry point in the shell if the architecture supports it, but do not pretend it searches content until implemented.<br>- Ensure accessibility: keyboard focus, semantic controls, sufficient contrast, labels and touch target sizes.<br><br>CONSTRAINTS<br>- Do not remove or break existing Home, Daily, Setup, auth, persistence or progress.<br>- Do not add large placeholder modules that imply features are complete.<br>- Avoid unnecessary external dependencies.<br>- Keep the app deployable on GitHub Pages as currently structured.<br><br>DELIVERABLES<br>Complete updated index.html, change log, changed functions/styles, responsive behaviour notes and tests at narrow mobile, wide mobile/tablet and desktop widths. Include signed-out and signed-in checks if navigation interacts with account state. |

| --- |

### Phase 2 — Dojo shell and syllabus

Objetivo: Build the new Dojo framework and curriculum map without rushing the content.

| PHASE 2 — DOJO INFORMATION ARCHITECTURE AND COMPENDIUM SHELL<br><br>Rebuild the Dojo learning experience from scratch. The current Dojo content, Codex and mini-games are disposable. Preserve the rest of the application and reuse existing progress/auth integration only where appropriate.<br><br>Implement the Dojo shell with three connected areas:<br>1. Music Theory Compendium<br>2. Fretboard Mastery<br>3. Harmonic Analysis Lab<br><br>For this phase, focus on navigation, content structure and reusable templates rather than attempting to write the entire encyclopaedia.<br><br>COMPENDIUM<br>- Create a hierarchical syllabus with categories, chapters and expandable subchapters.<br>- Include beginner-to-advanced progression, prerequisites and related-chapter links.<br>- Support both a recommended learning path and free exploration.<br>- Add chapter search/filtering and clear progress states.<br>- Make all reference content browseable; do not lock chapters behind XP.<br>- Create a reusable chapter page template with overview, prerequisites, definitions, construction, variants, relationships, musical effect, examples, guitar application, common mistakes, worked examples, exercises and further study.<br>- Provide a way to distinguish core material from advanced detail so the page is not overwhelming.<br><br>INITIAL SYLLABUS CATEGORIES<br>Fundamentals; Notes and Pitch; Accidentals and Enharmonic Spelling; Intervals; Key Signatures and Circle of Fifths; Scales; Modes; Triads; Seventh Chords; Extensions and Alterations; Inversions and Voicings; Diatonic Harmony; Functional Harmony; Cadences; Secondary Dominants; Modal Interchange; Modulation; Chromatic Harmony; Voice Leading; Counterpoint; Rhythm and Meter; Musical Form and Composition. You may recommend additions or a better sequence, but explain changes.<br><br>FRETBOARD MASTERY AND ANALYSIS LAB<br>Create coherent landing pages and navigation placeholders with clear descriptions and links to relevant Compendium chapters. Do not claim interactive tools are implemented until they exist.<br><br>DATA<br>Separate static curriculum definitions from per-user chapter progress. Preserve existing state. Add a versioned, additive progress structure only after documenting the proposed schema.<br><br>DELIVERABLES<br>Complete updated index.html; syllabus tree; reusable chapter template; data schema; change log; tests confirming other top-level sections still work. |

| --- |

### Phase 3 — Compendium foundations and harmony

Objetivo: Establish the editorial standard and create the first substantial body of theory.

| PHASE 3 — MUSIC THEORY COMPENDIUM: FOUNDATIONS THROUGH HARMONY<br><br>Populate the Dojo Compendium with substantial, accurate English-language learning content. Work only on the agreed chapters in this phase; do not attempt to fill the entire advanced syllabus in one pass.<br><br>CONTENT STANDARD<br>Every substantial chapter should explain what the concept is, why it matters, prerequisites, precise terminology, how it is constructed/derived, classifications and variants, exceptions, relationships to other concepts, musical effect, worked examples, common errors, applications and exercises. Link to related chapters.<br><br>Create the first coherent learning block:<br>- Pitch, pitch classes and octave equivalence.<br>- Note names and enharmonic spelling.<br>- Natural notes, sharps, flats and accidentals.<br>- Semitones, whole tones and interval measurement.<br>- Interval qualities and compound intervals.<br>- Key signatures and the circle of fifths.<br>- Major and minor scales, including construction and spelling.<br>- Scale degrees and basic tonal-centre concepts.<br><br>Then add the next block if the implementation and output quality allow:<br>- Triads and chord construction.<br>- Chord qualities and inversions.<br>- Diatonic triads in major and minor keys.<br>- Seventh chords and chord symbols.<br>- Roman-numeral analysis and basic harmonic function.<br><br>For each chapter:<br>1. Use precise examples in multiple keys, not just C major.<br>2. Explain spelling as well as pitch equivalence.<br>3. Include comparison tables or visual diagrams where they genuinely clarify.<br>4. Include at least three different exercise formats across the chapter set (e.g. construct, identify, diagnose, compare, transpose, analyse).<br>5. Provide worked solutions and reasoning, not only an answer key.<br>6. Include guitar application in a clearly separate subsection where relevant.<br>7. Link prerequisites and follow-up topics.<br><br>Do not invent historical claims, quotations or artist-specific examples. If uncertain, mark an example for verification rather than presenting it as fact.<br><br>Keep content data separate from rendering code. Ensure mobile readability and do not overload the initial chapter view; use accordions or expandable advanced sections.<br><br>DELIVERABLES<br>List chapters completed and their coverage; provide a content-quality self-audit; complete updated index.html; state exactly what remains for the next content block. |

| --- |

### Phase 4 — Advanced theory

Objetivo: Expand the encyclopaedia into advanced harmony, modes, chromaticism, rhythm and form.

| PHASE 4 — ADVANCED MUSIC THEORY COMPENDIUM<br><br>Continue the existing Compendium using the same approved chapter template, terminology, notation conventions and visual system. Do not rewrite earlier chapters unless you identify a factual error; report any correction explicitly.<br><br>Develop substantial chapters covering:<br>- Natural minor, harmonic minor and melodic minor; parallel and relative relationships.<br>- Modes: derivation, interval formulas, characteristic tones, modal centres and modal harmony.<br>- Pentatonic and blues scales, symmetrical scales and selected synthetic scales.<br>- Triad extensions, seventh chords, ninth/eleventh/thirteenth chords, altered tensions and chord-symbol conventions.<br>- Inversions, slash chords, voicings and voice-leading implications.<br>- Diatonic harmony in major and minor.<br>- Functional harmony, tonic/predominant/dominant roles, cadences and harmonic rhythm.<br>- Secondary dominants and applied chords.<br>- Modal mixture/interchange and borrowed chords.<br>- Modulation, tonicisation and ambiguous tonal centres.<br>- Chromatic harmony, diminished harmony, augmented harmony and other relevant advanced devices.<br>- Voice leading, common-tone relationships and counterpoint fundamentals.<br>- Rhythm, meter, subdivisions, syncopation, odd meters and polyrhythmic concepts where appropriate.<br>- Musical form and composition principles relevant to the user's goals.<br><br>For each topic, explain construction, notation, context, musical effect, common misconceptions and analytical use. Distinguish standard practice from stylistic conventions. Use examples across genres, but do not reduce general theory to metal/blues examples.<br><br>Include exercises that require construction, comparison, analysis, diagnosis, transposition and application. Vary the underlying musical examples and task types; do not merely randomise a root note.<br><br>Maintain internal links, prerequisite relationships and a coherent recommended path. Do not create content locks. If scope is too large, divide the work into clearly defined sub-batches and stop after a complete, tested batch.<br><br>DELIVERABLES<br>Complete updated index.html, chapter coverage matrix, new/changed terminology, exercise inventory, content audit and next-batch recommendation. |

| --- |

### Phase 5 — Fretboard Mastery

Objetivo: Build the interactive guitar visualisation and practical fretboard exercises.

| PHASE 5 — INTERACTIVE FRETBOARD MASTERY<br><br>Implement the Fretboard Mastery area as a real interactive learning tool, not a static diagram.<br><br>CORE FRETBOARD<br>- Render a configurable guitar fretboard with selectable string count/tuning and a useful default standard tuning.<br>- Show note names, enharmonic spelling, pitch classes, intervals, scale degrees and selected chord tones.<br>- Allow the user to select a root/key and a scale, mode, chord or interval set.<br>- Highlight notes consistently and provide a legend.<br>- Support practical fret ranges and responsive interaction on mobile.<br>- Include controls to show/hide labels and switch between note names, interval names and scale degrees.<br>- Ensure note calculations are derived correctly from tuning and fret position; avoid hard-coded pattern-only displays.<br><br>LEARNING TOOLS<br>- Note-finding and interval mapping across the neck.<br>- Scale construction and position visualisation.<br>- Triads, inversions, arpeggios and chord-tone mapping.<br>- Chord voicing visualisation where practical.<br>- String relationship and octave-pattern exploration.<br>- Connect fretboard shapes to keys, scale degrees and harmonic function.<br>- Provide examples that explain why a shape works rather than teaching memorised boxes alone.<br><br>PEDAGOGY<br>- Add guided tasks such as locate all minor thirds from a selected note, map a scale degree across strings, construct a triad in a chosen area, or identify chord tones within a position.<br>- Give hints and explanations.<br>- Link each tool to its relevant Compendium chapter and, where appropriate, Improv Gates.<br><br>TECHNICAL QUALITY<br>- Use accurate tuning/fret mathematics and test enharmonic edge cases.<br>- Avoid rendering too many DOM elements unnecessarily.<br>- Ensure touch-friendly controls, keyboard accessibility where practical and no mobile horizontal overflow.<br>- Preserve existing app state and unrelated features.<br><br>DELIVERABLES<br>Complete updated index.html; explain the calculation model; list supported tunings/ranges; test note accuracy across open strings and multiple frets; provide mobile/desktop checks. |

| --- |

### Phase 6 — Harmonic Analysis Lab

Objetivo: Create a useful analysis environment with explicit assumptions and nuanced explanations.

| PHASE 6 — HARMONIC ANALYSIS LAB<br><br>Build the Harmonic Analysis Lab as a guided analysis workspace.<br><br>REQUIRED CAPABILITIES<br>- Let the learner enter or select a key/tonal centre and a chord progression.<br>- Display chord symbols and Roman numerals together where meaningful.<br>- Identify diatonic chords and flag non-diatonic chords for analysis rather than automatically labelling them as errors.<br>- Support analysis concepts including tonic/predominant/dominant function, cadences, secondary dominants, modal interchange, borrowed chords, tonicisation, modulation, pedal points/drones and ambiguous progressions.<br>- Show harmonic rhythm and progression structure.<br>- Explain alternative interpretations where a progression is genuinely ambiguous.<br>- Provide step-by-step worked analyses and guided exercises.<br>- Include a diagnosis mode where the learner corrects a flawed analysis and receives reasoning.<br>- Link to Compendium chapters and relevant Improv Gates.<br><br>IMPORTANT MUSICAL RULES<br>- Do not imply that every chord progression has one unambiguous Roman-numeral interpretation.<br>- Distinguish chord spelling, chord quality, scale-degree root and harmonic function.<br>- Handle major/minor context, accidentals, enharmonic spelling and borrowed chords carefully.<br>- Make assumptions explicit (e.g. selected key, tuning or tonal centre).<br>- Do not claim automatic audio transcription or audio recognition unless it is actually implemented.<br><br>INTERFACE<br>Keep the tool understandable: progressive steps, clear notation, expandable explanations and useful visual summaries. Ensure desktop and mobile support.<br><br>DELIVERABLES<br>Complete updated index.html; describe supported analysis cases and limitations; provide worked examples and tests for diatonic, secondary-dominant, modal-interchange and ambiguous cases. |

| --- |

### Phase 7 — Improv

Objetivo: Turn the five Gates into a serious practical musicianship curriculum.

| PHASE 7 — IMPROV REDESIGN: FIVE GATES<br><br>Redesign the Improv section substantially while preserving its five-Gate identity. Do not simply restyle the old questions. Treat the current Gate content as replaceable, but inspect the existing state fields and migrate or preserve user progress safely.<br><br>GATES<br>1. The Horizontal Prison — break out of fixed box thinking; connect positions, intervals, phrases and neck navigation.<br>2. The Chord Tone Architect — target chord tones, outline changes, connect lines to harmony and use voice leading.<br>3. The Rhythmic Displacer — rhythmic variation, displacement, subdivisions, odd meters, syncopation and phrase placement.<br>4. The Modal Alchemist — modal colour, scale/chord relationships, characteristic tones and controlled modal application.<br>5. Total Audiation — develop internal musical conception, melodic direction and the relationship between imagined musical ideas and instrument execution. Avoid duplicating the user's separate ear-training tools.<br><br>FOR EACH GATE<br>- Define purpose, prerequisites, skills and measurable outcomes.<br>- Provide a progression of levels or missions, from foundational to advanced.<br>- Explain the musical idea before asking the user to perform it.<br>- Include varied practical tasks, not just multiple-choice questions.<br>- Provide practice instructions, constraints, reflection prompts and assessment criteria.<br>- Include examples and links to Compendium, Fretboard Mastery and Analysis Lab.<br>- Make progress meaningful and transparent; do not lock theory content behind XP.<br>- Provide ways to resume a Gate and see strengths/areas to revisit.<br><br>PRESERVE<br>Retain the user's overall app progress, Daily plan and unrelated features. If old Gate progress cannot map cleanly to the new system, preserve it in a legacy field or document the migration rather than silently discarding it.<br><br>DELIVERABLES<br>Complete updated index.html; Gate-by-Gate content outline; exercise types; progress mapping/migration notes; test checklist. |

| --- |

### Phase 8 — Listening Vault

Objetivo: Make listening references actionable, searchable and connected to the learning system.

| PHASE 8 — LISTENING VAULT REDESIGN<br><br>Redesign the Listening Vault as an active reference and musical-analysis library, not just a list of artists or genres.<br><br>ORGANISATION<br>- Browse by genre, artist, musical concept and learning objective.<br>- Retain and expand useful existing categories such as Stoner/Doom/Sludge, Prog/Odd Meters, Death Metal/Groove and Classic Rock/Blues.<br>- Keep the theory general and use genre categories as examples and contexts, not as limits.<br>- Include the user's priority interests: stoner, doom, sludge, progressive music, death metal, thrash and blues.<br><br>REFERENCE ENTRY TEMPLATE<br>Where information is available and verified, each entry can include:<br>- Artist and work/track or specific passage.<br>- Genre and context.<br>- What to listen for (harmonic, melodic, rhythmic, textural or phrasing feature).<br>- Relevant theory concepts and links to Dojo chapters.<br>- Harmonic/melodic/rhythmic analysis, with uncertainty clearly marked.<br>- Guitar application or practice idea.<br>- Personal notes/bookmarking and study status.<br><br>EDITORIAL ACCURACY<br>- Do not invent track timestamps, chord progressions, scales, quotes or claims about a recording.<br>- If the exact musical analysis has not been verified, label it as a suggested listening focus or an item requiring verification.<br>- Do not embed copyrighted audio or reproduce lyrics. Link to legitimate listening destinations only if a reliable URL is supplied or verified.<br>- Do not fabricate external URLs.<br><br>FUNCTIONALITY<br>- Search and filter by genre, artist, concept and instrument application.<br>- Allow bookmarks/favourites and personal study notes if supported by the approved data model.<br>- Provide links to relevant Compendium chapters, Fretboard tools, Analysis Lab and Improv Gates.<br>- Ensure the library remains useful even when the user has not signed in.<br><br>DELIVERABLES<br>Complete updated index.html; describe the taxonomy and entry schema; list verified versus suggested references; test search, filters, bookmarks and persistence. |

| --- |

### Phase 9 — Learning and assessment

Objetivo: Connect the content into a meaningful learning journey without turning it into a locked game.

| PHASE 9 — LEARNING PATH, EXERCISES, ASSESSMENT AND REVIEW<br><br>Integrate the learning experience across Dojo, Improv and Listening Vault.<br><br>LEARNING MODES<br>- Progressive path: recommend a sensible sequence based on prerequisites and previous progress.<br>- Free exploration: allow users to open any chapter or tool without arbitrary XP locks.<br>- Explain why a next step is recommended.<br><br>EXERCISE SYSTEM<br>Support a reusable exercise model with task types such as:<br>- Construct a scale/chord/interval set.<br>- Identify a chord or interval from its construction.<br>- Analyse a progression and explain function.<br>- Diagnose an incorrect Roman-numeral analysis.<br>- Compare modes/scales over the same tonal centre.<br>- Transpose a progression while preserving function.<br>- Locate notes or chord tones on the fretboard.<br>- Explain why a progression is ambiguous or why a musical choice creates a particular effect.<br>Avoid repetitive question templates and superficial randomisation.<br><br>FEEDBACK<br>- Give hints, worked reasoning and explanations.<br>- Distinguish an incorrect answer from a partially correct or alternative valid interpretation where possible.<br>- Track attempts and mastery separately from simply opening a chapter.<br>- Use transparent mastery criteria; do not invent precision or claim competence from a single quiz response.<br><br>PROGRESS<br>- Provide a coherent overview across chapters, tools, Gates and Vault references.<br>- Keep static curriculum separate from per-user progress.<br>- Preserve legacy app progress.<br>- Use additive, versioned data structures.<br>- Support local use and optional account sync.<br>- If spaced review is implemented, explain its logic and let users access content freely.<br><br>DELIVERABLES<br>Complete updated index.html; exercise schema; mastery rules; learning-path/prerequisite logic; migration notes; tests for signed-out/local and signed-in/synced use. |

| --- |

### Phase 10 — Integration and release audit

Objetivo: Verify the complete application and prevent regressions before release.

| PHASE 10 — INTEGRATION, REGRESSION AND RELEASE AUDIT<br><br>Perform a full quality audit of the current complete index.html. Do not add major new features during this phase unless a defect must be fixed to make an existing feature work.<br><br>REGRESSION AREAS<br>- Home dashboard and navigation.<br>- Daily plan, task completion, calendar/streaks and existing roadmap.<br>- Dojo Compendium, chapter navigation, search, diagrams and progress.<br>- Fretboard Mastery calculations and interactions.<br>- Harmonic Analysis Lab examples and analysis.<br>- All five Improv Gates and progress.<br>- Listening Vault search, filters, bookmarks and notes.<br>- Setup tools and settings.<br>- Google sign-in/sign-out and signed-out operation.<br>- localStorage persistence, Firestore sync and cross-device behaviour.<br>- Data migration from the original baseline and from each intermediate checkpoint.<br>- Responsive behaviour on small mobile, large mobile/tablet and desktop.<br><br>TECHNICAL AUDIT<br>- Check browser console errors and broken event handlers.<br>- Check missing IDs, duplicate IDs, invalid selectors and dead controls.<br>- Check that event delegation still works after view changes.<br>- Check that re-rendering does not erase user input unexpectedly.<br>- Check performance for large chapter lists and diagrams.<br>- Check accessibility basics: keyboard navigation, focus, labels and contrast.<br>- Check that no secrets or unsafe user data are exposed.<br>- Check Firestore rules assumptions; do not claim rules are secure unless they were actually inspected.<br><br>OUTPUT<br>1. Test matrix with pass/fail/not-tested.<br>2. Bugs found and fixes made.<br>3. Data migration and backup instructions.<br>4. Known limitations.<br>5. Final complete index.html.<br>6. Release checklist and rollback procedure.<br><br>Do not claim a test passed unless it was actually run. Clearly distinguish code inspection from browser testing. |

| --- |

## 12. Acceptance checklist for every phase

☐ The latest complete index.html is attached and was inspected.

☐ The requested phase is the only implementation scope.

☐ No unrelated top-level area was removed or degraded.

☐ The app still loads without a signed-in account.

☐ Existing local user data remains readable.

☐ Firebase login and sync remain intact where relevant.

☐ Desktop and mobile layouts are usable.

☐ No visible control is inert or falsely presented as functional.

☐ The output is a complete file, not partial code or placeholders.

☐ A change log and test checklist are supplied.

☐ The new checkpoint is saved separately from the original baseline.

## 13. Project context handover — paste into a future ChatGPT conversation

| I am continuing a project called The Shred Roadmap, an existing music-learning web app hosted as a static GitHub Pages site. Please read the attached Project Master Document first and treat it as the durable project brief.<br><br>IMPORTANT FILE RULES<br>- The original authoritative source was index (9).html (about 130 KB / 2,038 lines at the time of the audit).<br>- A previous Gemini-generated index(1).html was incomplete and must not be used as the baseline.<br>- Always ask me to provide the latest complete working index.html if it is not attached in the current conversation. Do not pretend you still have access to an old sandbox path.<br>- Keep the untouched original baseline as backup. Never overwrite it.<br>- I am a beginner at coding, so explain technical steps in clear, simple language.<br><br>CONFIRMED PRODUCT DECISIONS<br>- Learning: progressive recommended path AND free exploration.<br>- Language: English.<br>- Platforms: desktop and mobile equally important.<br>- UX: comprehensive but not overwhelming; expandable chapters, clear navigation, interactive diagrams.<br>- Preserve the original app's identity, root structure and useful features.<br><br>PRODUCT VISION<br>I want a deep, almost encyclopaedic music-learning platform, not a shallow quiz app. I am a musician first and a guitarist second, so general music theory is the core curriculum. Guitar applications should be clearly separated as practical sections. Goals: advanced theory, fretboard fluency, complex harmonic analysis, improvisation without relying on memorised shapes, composing riffs/progressions/solos/pieces, and a broad foundation across genres.<br><br>ORIGINAL APP AREAS<br>Home, Daily, Improv, Dojo, Library and Setup.<br>- Preserve useful Home, Daily, Setup, roadmap, progress, login and sync functionality.<br>- Rebuild Dojo learning experience from scratch; its existing educational content/Codex/mini-games can be discarded.<br>- Redesign Improv substantially while retaining five Gates: The Horizontal Prison, The Chord Tone Architect, The Rhythmic Displacer, The Modal Alchemist, Total Audiation.<br>- Redesign Listening Vault into an active listening/reference/analysis library.<br>- Reorganise Library without casually deleting useful content.<br><br>KNOWN TECHNICAL CONTEXT TO VERIFY AGAINST THE CURRENT FILE<br>The app was a single index.html with integrated HTML/CSS/JS, central state, localStorage and optional Google/Firebase Authentication + Firestore sync. A localStorage key observed was shredRoadmapState_v10; a Firestore path observed was users/{uid}. The UI was constrained to about 520 px and used carousel-like navigation. These are audit leads and must be verified against the current source before changes.<br><br>TARGET DOJO<br>1. Music Theory Compendium: deep chapters from fundamentals through advanced harmony, modes, chromaticism, rhythm, voice leading, form and composition.<br>2. Fretboard Mastery: accurate interactive fretboard, notes, intervals, scales, triads, inversions, arpeggios, voicings and theory-to-instrument links.<br>3. Harmonic Analysis Lab: progression analysis, Roman numerals, tonal centres, functions, secondary dominants, modal interchange, modulation, pedal tones, ambiguity and guided diagnosis.<br><br>CHAPTER STANDARD<br>Overview; prerequisites; definitions; construction/derivation; variants; relationships; musical effect; examples/context; separate guitar application; common mistakes; worked examples; varied exercises with solutions; further study.<br><br>EXERCISE PREFERENCES<br>Prioritise harmonic analysis, phrasing and fretboard construction/fluency. Use construct, identify, analyse, diagnose, compare, transpose and apply tasks. Formal staff reading is not required. Ear training and creative composition drills are not essential because I use separate tools for those. Avoid randomising only the key while repeating the same questions.<br><br>GENRE CONTEXT<br>Theory must be general, with examples from stoner, doom, sludge, prog, death metal, thrash, blues and selected classic rock. Explain where ideas occur, why they work and their musical effect. Do not fabricate track analyses or timestamps.<br><br>IMPLEMENTATION APPROACH<br>Use the phase-by-phase Gemini prompts in the Project Master Document. Phase 0 is audit only. Then responsive shell, Dojo structure, theory content, fretboard tools, analysis lab, Improv, Listening Vault, learning/assessment, final regression. For every phase: attach latest full index.html, change only the requested scope, preserve unrelated features and data, return a complete working HTML file, changelog and real test checklist. Save a checkpoint after every phase.<br><br>Please continue from the current project stage: [WRITE CURRENT PHASE / WHAT HAS BEEN COMPLETED HERE]. |

| --- |

## 14. Important project principles and unresolved decisions

### Principles already decided

English is the app language, even though planning conversations may be in Portuguese.

The app is a musicianship platform with guitar-specific applications, not a guitar-only theory course.

The Dojo is a fresh educational rebuild, not a cosmetic refresh.

Improv and Listening Vault are major redesigns, not minor content edits.

Original useful app behaviour and user data must be protected.

The product must support both guided progression and free reference use.

### Decisions to make during Phase 0/implementation

Whether to retain a single physical index.html or introduce separate JS/CSS files while keeping GitHub Pages deployment simple. Prefer the least disruptive maintainable option.

Exact desktop navigation pattern and mobile navigation pattern after inspecting the current visual identity.

Exact chapter taxonomy and order after curriculum review.

Whether notes/bookmarks and exercise attempts should sync immediately or use a local queue; decide based on existing Firebase implementation.

Which Listening Vault entries can be verified and which should remain suggested placeholders until checked.

Whether Total Audiation should include any ear-training-like activities or focus mainly on internal melodic planning, given the user's separate tools.

## 15. Final reminder

The purpose of this document is to preserve intent and prevent scope drift. The project should become deeper, more coherent and more useful without losing the original app's identity or working foundations. Gemini is an implementation assistant, not the authority on the product vision: verify its proposals, keep backups and approve each phase before proceeding.
