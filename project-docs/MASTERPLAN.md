# THE SHRED ROADMAP — PROJECT MASTERPLAN

> **Version 1.2 — 2 November 2026**
>
> Updated from the complete Version 1.0/1.1 project document. This revision preserves the existing product vision, curriculum, technical safeguards, phase sequence and implementation prompts, while incorporating the decisions approved during the Phase 2 specification process.
>
> This document is the durable source of product requirements and project context. Historical technical observations must always be verified against the latest approved application source before implementation.

# THE SHRED ROADMAP

**Project Master Document**

Product vision • Technical context • Architecture • Curriculum • Gemini implementation prompts

**Version 1.2 | 2 November 2026**

A durable handover document for continuing the project across conversations and development sessions.

---

## How to use this document

This document is the project's durable source of context. It records product decisions, the intended application architecture, curriculum requirements, technical safeguards, implementation sequence and prompts for Gemini.

It is designed to be re-uploaded into future ChatGPT conversations if project context is lost.

### Source of truth

Use the following hierarchy:

1. `MASTERPLAN.md` — authoritative product vision, permanent requirements and project principles.
2. `CHECKPOINT.md` — current implementation status, immediate next steps and active risks.
3. `PHASE_LOG.md` — implementation history, approvals, completed work and phase status.
4. Latest approved complete `index.html` from `main` — authoritative application code.
5. Current approved phase specification — exact implementation scope and acceptance criteria for the active phase.

If these sources conflict, identify the discrepancy explicitly. Do not silently choose whichever version is more convenient.

### Development rules

- Keep `baseline-original` unchanged as the historical reference.
- For new implementation work, use the latest approved complete `index.html` from `main`.
- Never use an older local attachment or an unapproved generated file as the application baseline.
- Develop only on the authorised phase-specific branch.
- Give Gemini the latest approved complete `index.html` and only the specification or prompt for the current phase.
- Do not ask Gemini to implement multiple large phases in one operation.
- After each phase, preserve the complete updated HTML as a named checkpoint.
- Run the applicable acceptance checks before moving to the next phase.
- Do not merge a phase into `main` before the owner has reviewed and approved the implementation.
- If Gemini cannot safely complete a phase in one response, require it to stop at a clear checkpoint rather than omit code or silently simplify features.
- Never claim that a browser, Firebase, authentication, synchronisation or cross-device test passed unless it was actually performed.

### Documentation relationship

The Masterplan is not intended to duplicate the detailed implementation history.

- Permanent product decisions and requirements belong here.
- Actual implementation events, approvals, test results and branch history belong in `PHASE_LOG.md`.
- Immediate project status and next actions belong in `CHECKPOINT.md`.
- Detailed phase-specific requirements belong in the corresponding approved phase specification.

Historical prompts and decisions may remain in this document for context, but they must be clearly identified as historical or superseded whenever they no longer represent the current requirements.

---

# 1. Executive project brief

The Shred Roadmap is intended to become a comprehensive, long-term music-learning and musicianship platform.

It should feel like a premium, carefully edited music-theory compendium and practical learning environment, not a shallow quiz app or an XP-driven game.

The user is a musician first and a guitarist second. General music theory and musicianship form the foundation, with guitar-specific applications presented clearly as a practical layer.

The application must combine academic depth, practical musical understanding, meaningful exercises, a coherent learning path and freedom to explore the complete educational library.

## Confirmed product decisions

| Decision | Confirmed requirement |
|---|---|
| Learning model | A recommended progressive learning path and unrestricted free exploration must coexist. |
| Language | English throughout the application, curriculum and code comments. |
| Platforms | Desktop and mobile have equal priority. Responsive design is required. |
| Information density | Comprehensive depth, presented through clear hierarchy and controlled information density. |
| Navigation | Hybrid visual categories, search and filters; persistent desktop category sidebar; simplified mobile category selection; continuous chapter reader. |
| Visual learning | Visual representations are integral whenever they materially improve understanding. Static diagrams and interactive tools must be distinguished. |
| Original application | Preserve useful functionality, technical foundations and recognisable visual identity. |
| DOJO | Rebuild the educational experience around the approved three-area structure. Old educational UI and obsolete game architecture may be replaced. |
| IMPROV | Substantially redesign the five Gates as a practical musicianship and musical-independence curriculum. |
| Listening Vault | Redesign and expand it into an active listening, reference and analysis library. |
| Theory progression | Reading theory never generates progress, XP, completion or mastery status. |
| Practical progression | Progression is based exclusively on meaningful practical exercises and work. |
| Progress indicators | Maintain two independent systems: `TECHNIQUE ROADMAP` and `MUSICAL DEVELOPMENT`. |
| DAILY | Preserve its existing functionality. Phase 2 must not redesign or repurpose it. |

## The two progression systems

The application has two independent progression systems.

**TECHNIQUE ROADMAP**

The existing phase-based technique progression.

Its calculations, phase segmentation, red visual treatment and established behaviour must be preserved unless a future explicitly approved phase authorises a change.

Its visible label must be:

`TECHNIQUE ROADMAP`

**MUSICAL DEVELOPMENT**

A separate global practical-learning progression system.

It contains two subdivisions:

- DOJO
- IMPROV

It must reflect meaningful evidence from practical exercises and work completed in those two learning areas.

It must not be an arbitrary sum of XP, a decorative percentage or a measure of how many theory chapters have been opened.

The two indicators must remain conceptually and technically independent.

---

# 2. Learning goals and scope

The application should help the learner achieve all of the following:

- Develop advanced understanding of music theory.
- Know the fretboard deeply and navigate it without hesitation.
- Understand harmony and analyse complex music.
- Improvise freely without depending exclusively on memorised shapes.
- Compose riffs, progressions, solos and complete pieces.
- Build a broad theoretical foundation applicable to many musical genres.
- Connect theoretical understanding to listening, musical decisions and practical execution.
- Develop genuine musical independence rather than simply accumulating completed lessons.

## Depth and editorial standard

The desired depth is encyclopaedic and almost academic, while remaining readable and practical.

A substantial chapter should explain concepts, definitions, construction, terminology, classifications, exceptions, relationships, historical context where useful, examples, musical effects, practical applications, common misconceptions and exercises.

Avoid superficial one-paragraph explanations.

The Compendium should be a reliable long-term reference, not merely a sequence of short lessons.

## Exercise preferences

Prioritise:

- Harmonic analysis.
- Phrasing.
- Fretboard construction and fluency.
- Understanding chord tones and harmonic movement.
- Practical application of theoretical concepts.
- Musical decision-making and problem-solving.

Use practical theory tasks such as:

- Construct.
- Identify.
- Analyse.
- Diagnose.
- Compare.
- Classify.
- Transpose.
- Apply.
- Explain.
- Create.

Do not make formal staff-reading a prerequisite. Simplified chord-symbol and Roman-numeral notation is appropriate.

Ear-training drills and open-ended creative composition exercises are not essential as isolated activities because the user has separate tools for some of these purposes. However, internal musical conception and practical musical decision-making remain relevant, especially in IMPROV.

Do not rely on randomised tonalities with an unchanged question template. Vary the cognitive task and musical context.

## Visual requirements

Visual learning is a core part of the educational experience.

Use diagrams and visual representations wherever they materially improve understanding, clarify relationships or demonstrate musical structure.

Examples include:

- Interactive guitar fretboard with selectable notes, intervals, scales, chords, arpeggios and positions.
- Interval and scale diagrams.
- Circle of Fifths and key-signature visualisation, including accidentals.
- Chord construction, inversions, extensions and voicing diagrams.
- Progression and harmonic-analysis visualisations.
- Harmonic function and resolution diagrams.
- Side-by-side mode and scale comparisons.
- Voice-leading visualisations.
- Rhythm, meter and subdivision diagrams.
- Simplified harmonic notation using chord letters (A, B, C...) and Roman numerals (I, ii, iii, IV, V...).

Visuals should appear close to the explanations they support, not only in a separate gallery at the end of a chapter.

Prefer reusable HTML/CSS/SVG implementations where appropriate. Avoid unnecessary dependencies.

Static educational diagrams and interactive learning tools are different things. Interaction should be added when it provides genuine educational value.

## Genre context

The theory must remain general rather than being restricted to a genre.

Use grounded musical examples and explain where a concept appears, why it works and what effect it creates.

Priority reference worlds include:

- Stoner.
- Doom.
- Sludge.
- Progressive music.
- Death metal.
- Thrash.
- Blues.
- Selected classic rock.

These are preferred contexts for examples, not limits on the curriculum.

---

# 3. Original application: baseline inventory

## Authoritative application baseline

The authoritative application baseline for new work is the latest approved complete `index.html` in the repository's `main` branch.

`baseline-original` must remain unchanged as the historical reference and recovery point.

Older local files, previous Gemini outputs and unapproved branch implementations must not be treated as the current baseline.

The original technical audit identified a single-file web application, but all technical characteristics must be re-verified against the current approved source before coding.

## Existing top-level areas

| Area | Current role / known content | Decision |
|---|---|---|
| HOME | Dashboard, roadmap overview, progress and access to app areas. | Preserve and improve. |
| DAILY | Daily practice plan, tasks, completion, calendar/streak concepts. | Preserve existing behaviour. |
| IMPROV | Five original Gates and related exercises/references. | Redesign deeply; retain the five-Gate identity. |
| DOJO | Previously XP/levels, Codex and small learning games/quizzes. | Rebuild the educational experience around the approved structure. |
| LIBRARY | Roadmap/resources, Creative material, Listening Vault and extra information. | Reorganise and preserve useful material. |
| SETUP | Guitar setup/configuration and maintenance companion. | Preserve as an independent useful tool. |

## Known technical characteristics — verify in source

The earlier audit identified the following characteristics. They are audit leads, not guarantees about the current implementation.

- Single-file web app: HTML, CSS and JavaScript integrated in one `index.html`.
- Interface and views rendered or updated through JavaScript.
- Interaction using delegated events and `data-action` attributes.
- State held in a central JavaScript state object.
- `localStorage` used for local persistence; a key observed during the earlier audit was `shredRoadmapState_v10`.
- Firebase Authentication with Google sign-in and Cloud Firestore used for optional account login and cross-device synchronisation.
- A user document path observed during the earlier audit was `users/{uid}`.
- The original app included the five IMPROV Gates:
  - The Horizontal Prison.
  - The Chord Tone Architect.
  - The Rhythmic Displacer.
  - The Modal Alchemist.
  - Total Audiation.
- The Listening Vault included genre/reference groupings around Stoner/Doom/Sludge, Prog/Odd Meters, Death Metal/Groove and Classic Rock/Blues.
- Artists represented in the earlier reference material included Tony Iommi, David Gilmour, Mikael Åkerfeldt, John Petrucci, Guthrie Govan, Chuck Schuldiner, Dimebag Darrell and Nick DiSalvo.

The application source must be re-inspected before implementation.

Do not assume that old function names, selectors, data fields, Firebase paths, libraries or layouts are still present.

Gemini must report discrepancies and preserve all unrelated working functionality.

## Phase 1 baseline

Phase 1 established the current responsive UI and navigation foundation.

The latest approved Phase 1 `index.html` in `main` is the source of truth for the current visual and technical implementation.

The project has since approved additional Phase 2 requirements that extend the interface, particularly the two progression indicators and the new DOJO navigation and reading experience.

These additions must respect the Phase 1 design system rather than introduce an unrelated visual language.

---

# 4. Target information architecture

## Top-level navigation

The six official application areas are:

**HOME** — personal dashboard, current learning path, recommended next step, recent activity and progress.

**DAILY** — practice schedule and tasks, retaining existing useful behaviour.

**DOJO** — learning centre with:
1. Music Theory Compendium.
2. Fretboard Mastery.
3. Harmonic Analysis Lab.

**IMPROV** — five deep learning Gates focused on practical melodic, rhythmic, harmonic and improvisational independence.

**LIBRARY** — Listening Vault, technical roadmap, Creative resources and other reference material.

**SETUP** — guitar configuration and maintenance companion.

`IMPROV` is the official product and navigation label. Use it consistently in navigation, headers, cards, progress indicators, Gates and subdivision labels.

In ordinary explanatory English, use natural grammatical forms such as “the improvisation track”, “improvisation exercises” and “improvisational development”. Do not force the product label into grammatically unnatural sentences.

## DOJO: three connected learning areas

### A. Music Theory Compendium

A structured encyclopaedia from fundamentals to advanced theory.

The curriculum should include:

- Sound and pitch concepts.
- Notes and enharmonic spelling.
- Intervals.
- Accidentals and key signatures.
- Scales.
- Modes.
- Diatonic harmony.
- Triads.
- Seventh chords.
- Extensions and alterations.
- Inversions.
- Chord symbols.
- Functional harmony.
- Cadences.
- Secondary dominants.
- Modal interchange.
- Modulation.
- Chromatic harmony.
- Voice leading.
- Counterpoint.
- Rhythmic concepts.
- Form and composition.

The final syllabus must be sequenced and reviewed for gaps.

The Compendium supports both a recommended learning path and unrestricted free exploration.

Theory chapters must always be accessible. There are no XP locks, reading completion requirements or theory-reading progress states.

### B. Fretboard Mastery

Interactive guitar-focused application:

- Note locations.
- Interval relationships.
- String tuning and string-to-string relationships.
- Scale patterns and positions.
- Triads and inversions.
- Arpeggios.
- Chord voicings.
- CAGED and alternative visualisation systems.
- Mapping shapes to keys and harmonic functions.
- Target notes and phrase resolution.

It should explain the underlying theory rather than teach shapes in isolation.

### C. Harmonic Analysis Lab

A practical workspace for analysing progressions, riffs and excerpts.

It should address:

- Tonal centres.
- Roman-numeral analysis.
- Diatonic and non-diatonic chords.
- Modal interchange.
- Secondary dominants.
- Pedal tones and drones.
- Ambiguous harmony.
- Modulations.
- Harmonic rhythm.
- Genre-specific devices.
- Explanations of why a progression creates a particular effect.

Provide guided examples and structured analysis tasks.

## IMPROV: five Gates

IMPROV is the practical musicianship and musical-independence layer of The Shred Roadmap.

Its purpose is not simply to teach scale patterns, licks or improvisational vocabulary. It must develop the learner's ability to understand musical relationships, navigate the guitar fretboard freely, make intentional melodic and rhythmic decisions, and translate musical ideas into coherent performance.

The five Gates retain their identities while being substantially redesigned.

### 1. The Horizontal Prison — Fretboard Independence

- Break dependence on fixed box patterns and memorised positions.
- Locate notes and intervals across strings and fretboard regions.
- Connect scales, arpeggios, intervals and positions.
- Develop horizontal and vertical fretboard navigation.
- Transfer phrases across strings, positions and octaves.
- Explore alternative ways of playing the same musical idea.

### 2. The Chord Tone Architect — Harmonic Independence

- Understand and target chord tones within changing harmony.
- Apply triads, seventh chords, arpeggios and guide tones.
- Connect melodic lines to chord progressions.
- Develop voice leading between successive chords.
- Understand stability, tension and resolution.
- Construct melodies that meaningfully reflect the underlying harmony.

### 3. The Rhythmic Displacer — Rhythmic Independence

- Understand subdivisions, rhythmic groupings and accents.
- Develop syncopation, displacement and phrase variation.
- Work with odd meters and changing rhythmic structures.
- Manipulate rests, note duration, density and rhythmic space.
- Transform motifs through rhythmic variation.
- Develop control over groove, phrasing and rhythmic intention.

### 4. The Modal Alchemist — Modal and Melodic Independence

- Understand the interval structure and characteristic notes of scales and modes.
- Compare different modes over the same tonic.
- Relate modal choices to chords, tonal centres and harmonic contexts.
- Identify characteristic tones, tensions and resolutions.
- Apply modal colour to riffs, progressions and improvisation.
- Understand the difference between theoretical compatibility and convincing musical application.

### 5. Total Audiation — Integrated Musical Independence

- Develop the ability to conceive coherent musical ideas internally.
- Build phrases using motifs, repetition, variation and transformation.
- Apply call-and-response, melodic direction and structured development.
- Control tension, resolution, dynamics, density and space.
- Translate internally conceived ideas into deliberate guitar performance.
- Avoid unnecessary duplication of the user's separate ear-training tools.

### Core pedagogical principle

The Gates should progressively develop the following capabilities:

**No Shape → Understand → Locate → Hear → Choose → Execute → Create**

This is a guiding pedagogical principle rather than a rigid sequence that every exercise must follow.

The learner should progressively move beyond memorised shapes and patterns towards understanding the musical relationships behind them, locating those relationships on the fretboard, making deliberate musical choices and creating original phrases.

### Relationship with DOJO

IMPROV must function as the practical application layer of DOJO.

Its activities should connect directly to relevant concepts from:

- Music Theory Compendium.
- Fretboard Mastery.
- Harmonic Analysis Lab.

A learner should be able to move between theoretical understanding and practical application without treating them as disconnected subjects.

Relevant chapters, concepts and practical exercises should be explicitly linked wherever appropriate.

### Exercise and assessment principles

Each Gate should contain:

- A clear learning objective.
- Prerequisites and links to relevant DOJO concepts.
- Progressive levels of difficulty.
- Substantial explanations and demonstrations.
- Varied practical tasks.
- Clear success criteria and feedback.
- Opportunities for repetition, review and application.
- Exercises that combine multiple musical skills as the learner progresses.

Exercises should include, where appropriate:

- Construction and identification.
- Fretboard location and navigation.
- Harmonic and melodic analysis.
- Transposition.
- Rhythmic transformation.
- Target-note selection.
- Phrase development.
- Practical guitar execution.
- Integrated creative challenges.

Do not reduce the Gates to repetitive multiple-choice quizzes or arbitrary random-key exercises.

Distinguish between completing an exercise and demonstrating genuine mastery.

Do not claim that a learner's physical performance, timing, tone or musical execution has been verified unless the application actually receives and evaluates the relevant performance data.

### Musical Context and Application

IMPROV should use meaningful musical situations and examples drawn from a broad range of styles.

Priority reference worlds may include stoner, doom, sludge, progressive music, death metal, thrash, blues and selected classic rock, without restricting the curriculum to these genres.

Real musical references should be used where they genuinely help explain a concept.

Distinguish verified musical analysis from stylistic association and suggested listening.

The objective is to help the learner understand how musical concepts function in real music and how to apply them independently.

### Definition of success

The redesign should be judged by the learner's developing musical independence.

A successful learner should increasingly be able to:

- Understand the musical relationships behind patterns and shapes.
- Navigate the fretboard without depending exclusively on memorised positions.
- Recognise and respond to harmonic and rhythmic context.
- Choose notes and phrases intentionally.
- Connect theoretical knowledge to practical guitar performance.
- Develop and execute coherent musical ideas.

The objective is not simply to increase the number of scales, licks or exercises completed.

## Relationship between DOJO and IMPROV

DOJO establishes theoretical understanding and structured practical knowledge.

IMPROV develops the ability to apply that understanding in musical situations.

The two areas must be connected through explicit references and exercise relationships.

The learning experience should allow movement in both directions:

- A theory chapter should identify relevant practical exercises or tools where appropriate.
- A practical exercise should link back to the theory that explains the musical concept.
- An exercise may require concepts from multiple chapters or learning areas.
- Practical progression must be based on exercise evidence, not on opening or reading reference material.

## Listening Vault

Transform the current reference collection into an active listening and analysis library.

Each entry may include:

- Artist/work/track or passage.
- Genre/context.
- Concepts to notice.
- Harmonic or melodic analysis.
- Rhythmic and phrasing observations.
- Guitar application.
- Links to relevant chapters.
- Personal study notes.

Do not invent track timestamps, musical claims or quotations. Require verification or mark them as editorial suggestions awaiting review.

---

# 5. Chapter editorial template

Use this template as the default quality bar for substantial Compendium chapters.

Not every section must be equally long, but no chapter should be a shallow definition plus quiz.

1. **Overview** — what the subject is, why it matters and what the learner will be able to do.
2. **Prerequisites** — concepts that should already be understood, with links back to chapters.
3. **Definitions and terminology** — precise language and notation.
4. **Construction / derivation** — show how the concept is built, not merely the result.
5. **Classifications and variants** — types, categories, exceptions and edge cases.
6. **Relationships** — links to scales, chords, keys, functions, rhythm or other relevant concepts.
7. **Musical effect** — sound, tension, colour, stability, ambiguity and expressive consequences.
8. **Context and examples** — use examples from varied genres, explaining why they work.
9. **Guitar application** — a clearly separated practical section, where relevant.
10. **Common mistakes** — misconceptions, spelling errors, analytical traps and oversimplifications.
11. **Worked examples** — step-by-step reasoning, not just final answers.
12. **Exercises** — varied task types, progressive difficulty, answer explanations and hints.
13. **Further study** — related chapters, references and suggested next steps.

The template is an editorial standard, not a rigid requirement to create identical chapter structures regardless of subject.

## Visual integration

Visuals must be embedded close to the explanation they support.

Examples include:

- Circle of Fifths and key signatures.
- Interval and scale diagrams.
- Chord construction and inversion diagrams.
- Fretboard maps.
- Harmonic progressions and function diagrams.
- Voice-leading examples.
- Rhythmic structures and subdivisions.
- Modal comparisons.

Each visual should have a clear educational purpose.

Use appropriate labels, legends and captions. Ensure readability on mobile and do not rely on colour alone to communicate musical information.

---

# 5A. Musical Context, Application and Functional Harmony

## Musical Context and Application

The Compendium must teach both the theoretical structure of music and its practical meaning.

Substantial chapters should integrate the following dimensions where relevant:

**Theory** — definitions, terminology, construction, derivation and notation.

**Conceptual Understanding** — relationships, classifications, variations, comparisons and exceptions.

**Sound and Musical Identity** — characteristic intervals, notes, tensions, resolutions, stability, colour and expressive effect.

**Harmonic Context** — chord compatibility, harmonic functions, progressions, tonal relationships and relevant tensions.

**Practical Application** — guitar examples, riffs, chord voicings, arpeggios, target notes, phrasing and other relevant applications.

**Musical Context and Listening** — real artists, recordings, tracks, passages and stylistic situations, with clear source and evidence distinctions.

**Creation and Practice** — exercises and challenges that require the learner to apply the concept independently.

These dimensions form a flexible editorial framework. They are not mandatory sections of identical length in every chapter. Their inclusion must depend on the subject and learning objectives.

A useful guiding sequence is:

**Theory → Understanding → Sound → Application → Musical Context → Creation**

Where relevant, comparisons should isolate the musical variable being studied. For example, comparing E Aeolian, E Dorian and E Phrygian over the same tonic can help demonstrate how characteristic intervals change the musical identity.

Explain characteristic notes, target notes, tensions and resolutions rather than presenting scales as collections of shapes.

### Musical reference classification

Musical references should be classified clearly:

- **Verified Analysis** — a specific musical passage or recording has been examined and the stated analysis is supported.
- **Stylistic Association** — the example illustrates a broader stylistic tendency but is not presented as proof of a specific theoretical analysis.
- **Suggested Listening** — a recommendation intended to help the learner recognise or explore a concept.

Never invent track details, timestamps, progressions, quotations or analytical claims.

## Functional Harmony and Chord Functions

Functional harmony must be a substantial and progressively developed component of the Music Theory Compendium.

The learner must understand not only how chords are constructed, but also how chords behave and relate to one another within a tonal context.

The curriculum should cover, progressively and in appropriate depth:

- The concept of harmonic function.
- Tonic, predominant and dominant functions.
- The relationship between scale degrees, chord construction and harmonic roles.
- Diatonic chord functions in major and minor tonalities.
- Roman-numeral analysis and chord-symbol interpretation.
- Functional relationships between chords.
- Common harmonic progressions and their underlying logic.
- Cadences and their structural and expressive roles.
- Harmonic rhythm and phrase structure.
- Chord inversions, bass movement and voice leading.
- Seventh chords and their functional behaviour.
- Secondary dominants and tonicisation.
- Leading-tone chords and applied dominant relationships.
- Modal mixture and borrowed chords.
- Modal and non-functional harmonic contexts.
- Chromatic harmony and altered harmonic relationships.
- Modulation and larger-scale tonal organisation.
- Ambiguous progressions and alternative analytical interpretations.

The curriculum must explain the distinction between:

- How a chord is constructed.
- What scale degree or root it represents.
- What harmonic function it may fulfil.
- How its position, voicing, bass movement and surrounding chords affect its behaviour.
- How the same chord can behave differently depending on context.

Do not teach harmonic function as a rigid label assigned to every chord independently of context.

Explain the importance of tonal centre, voice leading, phrase position, harmonic motion and musical style.

### Functional Harmony in Practical Music

Functional harmony must be connected to practical musical understanding.

Where relevant, chapters and exercises should include:

- Building progressions from harmonic functions.
- Analysing progressions using Roman numerals.
- Comparing alternative progressions that use similar chords but create different effects.
- Identifying harmonic goals and points of arrival.
- Understanding why dominant motion creates expectation and how that expectation may be fulfilled, delayed or avoided.
- Reharmonising simple progressions.
- Applying inversions and voice leading to create smoother or more deliberate movement.
- Relating chord functions to guitar voicings, triads, arpeggios and fretboard navigation.
- Analysing real riffs, progressions and musical passages where reliable references are available.

Examples should draw from varied musical styles, including the user's preferred reference worlds, without making any genre a limit on the curriculum.

### Relationship with the Other Learning Areas

Functional harmony must connect to:

**Fretboard Mastery:** locating chord roots, thirds, fifths, sevenths, guide tones, inversions and voice-leading options across the neck.

**Harmonic Analysis Lab:** identifying tonal centres, functions, cadences, non-diatonic events, tonicisation, modulation and alternative interpretations.

**IMPROV:** targeting chord tones, following harmonic movement, resolving tensions and creating melodies that reflect chord changes.

**Listening Vault:** recognising functional movement and its expressive effect in real musical examples.

The aim is to develop an integrated understanding of harmony rather than a collection of disconnected theoretical definitions.

---

# 6. Learning path, assessment and progress

## Learning modes

Support two modes at the same time:

1. A recommended sequential path for learners who want guidance.
2. Free exploration where all appropriate reference content can be opened directly.

The recommended path is guidance, not a lock.

It may explain prerequisites and suggest next steps, while free exploration remains available.

Theory content must always remain accessible without XP, level gates or completion requirements.

## Theory reading and progression

Reading theory does not generate progress.

Do not:

- Track chapter reading as completion.
- Track chapter reading as studied status.
- Track chapter reading as mastery.
- Provide a “Mark as Studied” action.
- Introduce an equivalent action under another name.
- Award XP for reading theory.
- Use theory reading to populate progression indicators.
- Lock theory content behind practical progress requirements.

Opening, browsing or finishing a theory chapter must not contribute to progression indicators.

A chapter may be opened, revisited or read in any order without creating a theory-reading progress record.

Bookmarks, personal notes and preferences may be supported as separate user features, but they must not be confused with learning achievement.

## Practical progression

Practical progression belongs exclusively to exercises and demonstrated practical work in DOJO and IMPROV.

The intended global indicator is:

`MUSICAL DEVELOPMENT`

Its two subdivisions are:

- DOJO.
- IMPROV.

It must remain independent of:

`TECHNIQUE ROADMAP`

Do not implement arbitrary XP totals or display invented percentages.

The underlying evidence model, competency dimensions, weighting, difficulty treatment and mastery thresholds must be defined transparently before meaningful progress is displayed.

Until reliable exercise records and criteria exist, show an honest neutral/empty state rather than fabricated progress.

The global indicator must not imply that physical performance has been assessed unless the application actually receives and evaluates the relevant performance data.

The exact practical scoring and competency model remains an open design decision for a future approved phase.

## TECHNIQUE ROADMAP

The existing TECHNIQUE ROADMAP is a separate, phase-based progression system.

Its calculations, phase segmentation, red visual treatment and behaviour must remain unchanged during Phase 2.

Its visible label must be:

`TECHNIQUE ROADMAP`

The addition of MUSICAL DEVELOPMENT must not replace, merge with or modify this system.

## DAILY

DAILY routines, task completion and existing behaviour must remain untouched by Phase 2.

Daily activity must not silently become a source of MUSICAL DEVELOPMENT unless a future approved specification explicitly defines a practical exercise record and its relationship to that system.

## Future assessment principles

When the practical exercise system is implemented in later phases, assess demonstrated work through varied task formats:

- Construct.
- Identify.
- Classify.
- Analyse.
- Diagnose.
- Compare.
- Transpose.
- Apply.
- Explain.

Track attempts and mastery separately from theory reading.

Show explanations and worked solutions after attempts. Avoid unexplained right/wrong feedback.

Do not claim competence from a single quiz response.

Distinguish between:

- Opening educational material.
- Attempting an exercise.
- Completing an exercise.
- Repeated successful application.
- Demonstrated mastery, where the system has sufficient evidence to support that conclusion.

Keep static curriculum definitions separate from user-specific practical exercise records, assessment evidence and preferences.

---

# 7. UX and visual direction

Premium, professional, editorial feel; strong typography and consistent spacing.

Retain the Phase 1 visual design system and existing dark visual identity.

The experience should combine modern, discoverable navigation with an editorial, readable learning environment.

Avoid excessive cards, fragmented panels, deep accordion navigation and unnecessary visual clutter.

## 7.1 Global header and progression

The header contains two independent progress indicators.

### TECHNIQUE ROADMAP

- Existing red, phase-segmented technique progression.
- Preserve its existing calculation and behaviour.
- Keep its established red visual treatment.
- Display the explicit label `TECHNIQUE ROADMAP`.

### MUSICAL DEVELOPMENT

- New global practical-learning indicator.
- Contains DOJO and IMPROV subdivisions.
- Driven only by meaningful practical exercise evidence.
- Must not be populated with placeholder percentages, arbitrary XP or theory-reading activity.
- Must have a neutral/empty state until valid evidence and criteria exist.

### Responsive presentation

- Desktop: place the two indicators adjacent to one another, side by side.
- Mobile: use a compact stacked or otherwise space-efficient arrangement without compromising clarity.
- Keep the two systems conceptually and technically independent.

## 7.2 DOJO Hub

The DOJO Hub presents three connected areas:

1. Music Theory Compendium.
2. Fretboard Mastery.
3. Harmonic Analysis Lab.

On desktop, use a three-column card layout where available space permits.

On mobile, stack the areas in a clear vertical layout.

The Hub should communicate the purpose of each area and how they connect without overwhelming the user.

## 7.3 Compendium Explorer

The Compendium Explorer uses a hybrid pattern.

**Desktop:**

- Persistent category sidebar.
- Central content area.
- Search.
- Useful filters.
- Clear category and chapter hierarchy.
- Recommended path and free exploration.

**Mobile:**

- Simplified category-selection view.
- Search.
- Category navigation.
- Clear route to the chapter list.
- Simple back navigation.
- Avoid deep nested accordion navigation.

The Explorer must preserve the curriculum themes and topic structure while improving the way users navigate and discover content.

## 7.4 Chapter Reader

Chapter reading uses a continuous editorial page rather than a sequence of nested dropdowns.

**Desktop:**

- Side table of contents.
- Central article.
- Clear section hierarchy.
- Readable article width.

**Mobile:**

- Single-column reading layout.
- Compact or collapsible chapter index.
- Clear navigation back to the chapter list.
- Diagrams and examples must remain legible.

Avoid excessive cards or fragmented panels.

## 7.5 Visual educational resource system

Every substantial theoretical concept must use visual representations whenever they materially improve understanding, clarify relationships or demonstrate musical structure.

Examples include:

- Circle of Fifths and key signatures.
- Intervals.
- Scales.
- Chords.
- Fretboard maps.
- Harmonic progressions and functions.
- Voice leading.
- Rhythm, meter and subdivision.
- Modal comparisons.

Place diagrams close to the explanation they support.

Use reusable, responsive HTML/CSS/SVG where appropriate. Keep diagram data separate from rendering where practical.

Ensure:

- Clear labels.
- Legends where necessary.
- Captions where useful.
- Sufficient contrast.
- Mobile legibility.
- Consistent notation.
- No reliance on colour alone.

Distinguish static explanatory diagrams from interactive tools.

Interaction should be added only when it provides genuine educational value.

Phase 2 must establish the conventions and demonstrate at least one representative diagram in the Chapter Reader environment. It must not attempt to build the entire future diagram library.

## 7.6 Visual hierarchy and accessibility

- Retain the Phase 1 design system.
- Combine modern navigation with editorial reading.
- Avoid turning every section into a card.
- Use expandable disclosure only where it improves comprehension, not as the primary navigation model.
- Preserve accessible controls, keyboard focus and readable contrast.
- Ensure touch targets are appropriate on mobile.
- Avoid horizontal overflow.

---

# 8. Data, persistence and compatibility principles

Preserve existing state fields and data formats unless a documented migration is necessary.

Do not overwrite or discard existing user data while rebuilding DOJO.

Keep static curriculum/content definitions separate from per-user practical progress.

Store only user-specific state where appropriate, such as:

- Practical exercise attempts.
- Exercise completion records.
- Assessment evidence.
- Mastery evidence, where supported by transparent criteria.
- Bookmarks.
- Personal notes.
- Preferences.

Do not create chapter-reading completion or studied-state records.

Use additive schema changes where possible and include a versioned migration path.

Maintain optional login: the app should remain useful without signing in.

Maintain local-first behaviour and ensure account sync does not silently overwrite newer data.

Document how conflict resolution works. Do not invent a last-write-wins strategy without checking the current implementation.

Never expose Firebase private credentials or secrets in client code.

Firebase web configuration is not a server secret, but security must rely on correct Firestore Security Rules and Auth checks.

Do not change Firebase project identifiers, collections, document paths or rules without explicit evidence, owner approval and a migration plan.

## Progression data separation

The architecture must distinguish:

1. Static curriculum definitions.
2. User preferences and personal reference data.
3. Practical exercise records.
4. Assessment and mastery evidence.
5. TECHNIQUE ROADMAP state.
6. MUSICAL DEVELOPMENT calculations and presentation.

Theory reading must not be used as a proxy for practical learning.

The existing TECHNIQUE ROADMAP data must not be repurposed as MUSICAL DEVELOPMENT data.

Do not assume that legacy DOJO XP or level fields are meaningful evidence of the new learning model. Inspect them, identify whether any information is worth preserving and document the migration decision.

Legacy UI and functions may be removed where appropriate. Preserve useful user data rather than obsolete architecture for its own sake.

---

# 9. Development workflow and safeguards

## Repository and branch strategy

Repository:

`https://github.com/henriquelimamartins/SHRED/`

Branches:

- `main` — stable, approved production version.
- `baseline-original` — untouched original reference.
- Phase-specific branches — development and testing.

Create new development branches from the latest approved `main`.

Never experiment directly on `main` or `baseline-original`.

The owner performs GitHub operations.

Inspect every changed file in Pull Requests. Merge only after the owner has approved the implementation.

## Implementation workflow

Before each Gemini phase:

1. Attach the latest approved complete `index.html`.
2. Attach the current approved phase specification or prompt.
3. Require Gemini to inspect the source before editing.
4. Ask it to identify the exact functions, state fields, styles and sections it intends to change.
5. Respect the phase scope and exclusions.
6. Require a complete updated `index.html`.
7. Require a change log and manual test checklist.
8. Review the output independently.
9. Run applicable acceptance tests.
10. Preserve a named checkpoint.
11. Obtain explicit owner approval before merging.

Do not edit the only copy of the application.

## Deliverables

Require:

- Complete updated `index.html`.
- Concise change log.
- List of functions, state fields and files changed.
- Migration notes, if any.
- Manual acceptance-test checklist.
- Known limitations and unfinished work.

If the complete file is too large for one response, require a reliable downloadable artifact or clearly staged output.

Never accept omitted sections or placeholders such as “rest of code unchanged”.

## Testing and claims

After each phase, test desktop and mobile, signed-out and signed-in states, local persistence and cross-device sync where applicable.

Clearly distinguish:

- Static source inspection.
- Automated tests.
- Browser tests.
- Manual tests.
- Firebase/Auth tests.
- Cross-device tests.
- Tests not performed.

Do not claim that a test passed unless it was actually run.

Do not assume that successful local operation proves Firebase or cross-device behaviour.

## Checkpoints

Keep named checkpoints, for example:

- `baseline-approved`.
- `phase-01-ui`.
- `phase-02-dojo-shell`.
- `phase-03-compendium`.
- `phase-04-advanced-theory`.

A checkpoint must identify the exact source file and phase state it represents.

---

# 10. Gemini master instructions

## Master prompt — include with every implementation phase

**Objective:** Set the global context and safeguards. Paste this before the phase-specific prompt, or prepend it to the relevant phase prompt.

You are acting as a senior front-end engineer, software architect, UX designer and music-education content architect working on an existing application called The Shred Roadmap.

### PROJECT CONTEXT

The Shred Roadmap is an existing web application. Its current authoritative implementation is the latest approved complete `index.html` from the `main` branch.

The untouched original file in `baseline-original` is a historical recovery reference, not the current implementation baseline.

Do not use older local attachments, outdated copies or failed/simplified alternatives.

The app has six top-level areas:

- HOME.
- DAILY.
- DOJO.
- IMPROV.
- LIBRARY.
- SETUP.

It has existing local persistence and optional Google/Firebase authentication with Firestore synchronisation. Verify all technical details against the attached source before relying on them.

### PRODUCT VISION

Build a comprehensive, long-term music-learning platform with encyclopaedic music theory, deep fretboard fluency, harmonic analysis and practical improvisational development.

The user thinks of themselves as a musician first and a guitarist second.

General music theory is the core curriculum; guitar application must be clearly separated as a practical layer.

The experience must feel premium, professional, editorial and useful for years, not like a shallow quiz game.

### CONFIRMED DECISIONS

- Both a progressive recommended learning path and free exploration.
- English language throughout the application and learning content.
- Desktop and mobile have equal priority.
- Comprehensive depth without overwhelming presentation.
- Hybrid navigation: visual categories, search and filters; persistent desktop category sidebar; simplified mobile category selection.
- Continuous editorial chapter reader.
- Visual educational resources wherever they materially improve understanding.
- No theory-reading progress, studied status, reading XP or theory content locks.
- Practical progression only through meaningful exercise and practical-work evidence.
- `TECHNIQUE ROADMAP` and `MUSICAL DEVELOPMENT` are independent systems.
- `MUSICAL DEVELOPMENT` has DOJO and IMPROV subdivisions.
- DAILY functionality must be preserved.

### SCOPE

- Rebuild the DOJO learning experience around Music Theory Compendium, Fretboard Mastery and Harmonic Analysis Lab.
- Treat obsolete DOJO educational content, Codex structure and mini-games as replaceable. Preserve useful user data and technical integration where appropriate.
- Redesign IMPROV substantially, retaining and deepening its five-Gate identity:
  - The Horizontal Prison.
  - The Chord Tone Architect.
  - The Rhythmic Displacer.
  - The Modal Alchemist.
  - Total Audiation.
- Redesign and expand the Listening Vault into an active reference and analysis library.
- Preserve and sensibly integrate HOME, DAILY, SETUP, existing TECHNIQUE ROADMAP progression and other useful LIBRARY content.

### NON-NEGOTIABLE SAFEGUARDS

1. The latest approved complete `index.html` from `main` is the source of truth for the current application. Inspect it; do not guess.
2. Keep `baseline-original` untouched as a historical reference.
3. Do not replace the whole application with a simplified rewrite.
4. Do not remove or break unrelated features, state fields, Firebase integration, local persistence or existing user data.
5. Do not change authentication, Firestore paths, Firebase project configuration or security assumptions without explaining the reason and migration impact.
6. Keep static educational content separate from user-specific progress.
7. Make schema changes additive and versioned wherever possible.
8. Do not use XP as a gate that blocks access to educational content.
9. Theory reading must never create progress, completion, studied status, mastery or XP.
10. Do not provide a “Mark as Studied” action or an equivalent mechanism.
11. Do not make the learning experience a multiple-choice quiz bank. Include construction, analysis, diagnosis, comparison, transposition and application tasks.
12. Do not produce superficial or fabricated music-theory content.
13. Preserve the existing TECHNIQUE ROADMAP calculations and behaviour unless the current approved phase explicitly authorises a change.
14. Do not modify DAILY functionality unless explicitly authorised.
15. Do not fabricate MUSICAL DEVELOPMENT progress, percentages, XP or mastery.
16. Do not output placeholders or omit unchanged code. The deliverable must be a complete working updated `index.html`.

### WORKING METHOD

Only perform the phase requested in the current prompt.

First inspect the attached current file.

State the relevant existing architecture and the exact areas you plan to change.

Implement only after that inspection.

Preserve unrelated code.

At the end, provide:

- Complete updated `index.html`.
- Concise change log.
- List of functions, state fields and files changed.
- Migration notes, if any.
- Manual acceptance-test checklist.
- Known limitations and unfinished work.

If the task cannot be completed safely in one pass, stop at a clear checkpoint and explain exactly what remains.

Never silently simplify or pretend incomplete work is finished.

---

# 11. Step-by-step Gemini prompts

Use the Master Instructions above together with one prompt at a time.

Attach the latest approved complete `index.html` on every implementation phase.

The prompts for completed phases are historical records. Do not repeat completed phases unless a specific defect or regression is identified and the owner authorises the work.

## Phase 0 — Audit and architecture

**Status:** COMPLETE. Historical prompt retained for context.

**Objective:** Understand the actual code and approve a safe architecture before implementation.

Historical instruction:

PHASE 0 — SOURCE AUDIT AND ARCHITECTURE ONLY (DO NOT EDIT CODE)

Inspect the original application source thoroughly and produce an implementation architecture. Do not modify the file, generate replacement code or redesign the app.

1. Map the full application:
   - Top-level navigation and every subview.
   - Render functions, event handlers, delegated actions and important DOM selectors.
   - CSS/layout system and responsive breakpoints.
   - Central state object and every persistence mechanism.
   - localStorage keys and versioning.
   - Firebase Auth initialisation, Google sign-in/out, Firestore reads/writes and document paths.
   - Roadmap, Daily, Improv, Dojo, Library, Listening Vault and Setup functionality.
   - External libraries, assets, fonts and other dependencies.
2. Identify the minimum set of existing behaviours that must be preserved.
3. Identify which Dojo educational structures can be discarded and which technical services/state integrations may be reused.
4. Identify the exact Improv and Listening Vault structures that will need replacement or migration.
5. Propose a revised information architecture retaining the app's recognisable identity and useful top-level structure.
6. Propose a modular internal code organisation suitable for a single-file GitHub Pages app. Do not assume a build system or server exists.
7. Propose data models for static curriculum content and per-user progress. Include migration/versioning and local-first/offline considerations.
8. Explain how the progressive path and free exploration coexist without content locks.
9. Identify risks, technical debt, unknowns and dependencies.
10. Provide a phase-by-phase implementation plan with dependencies and test gates.

Output:

A. Verified source inventory.

B. Existing feature preservation matrix.

C. Proposed navigation and information architecture.

D. Proposed code/component organisation.

E. Proposed curriculum/content data model.

F. Proposed user-progress data model and migration plan.

G. Firebase/local persistence compatibility plan.

H. Risks and open questions.

I. Detailed implementation sequence and acceptance criteria.

Be explicit about anything you could not verify. Do not infer missing functionality. Do not change the file.

**Historical note:** this prompt originally referred to the original source as the authoritative baseline. That wording is superseded. The latest approved complete `index.html` from `main` is the current implementation baseline.

## Phase 1 — Responsive UI and navigation

**Status:** COMPLETE — TESTED AND APPROVED.

**Objective:** Create the design foundation before adding large content modules.

Historical implementation scope:

- Preserve the recognisable Shred Roadmap identity and unrelated working features.
- Replace the narrow, mobile-only-feeling layout with a polished responsive experience for desktop and mobile equally.
- On desktop, use a clear persistent navigation/sidebar or equivalent structure and a readable main content area.
- On mobile, provide compact, touch-friendly navigation without horizontal overflow.
- Retain the six top-level areas: HOME, DAILY, DOJO, IMPROV, LIBRARY and SETUP.
- Add a consistent page header, breadcrumbs or section context where useful, reusable content containers, typography, spacing, buttons, tabs, accordions and status indicators.
- Establish a visual language for theory, worked examples, guitar application, exercises, warnings and references.
- Add a search entry point in the shell if the architecture supports it, without pretending it searches content until implemented.
- Ensure accessibility: keyboard focus, semantic controls, sufficient contrast, labels and touch target sizes.

The original Phase 1 prompt included expandable chapters and progressive disclosure. Those instructions are historical and do not override the later approved Phase 2 navigation blueprint.

The Phase 2 Explorer and Chapter Reader must follow the current hybrid-navigation and continuous-reading requirements in this Masterplan and the approved Phase 2 specification.

**Integration:** Phase 1 was approved and merged into `main` by the owner. Do not repeat its merge.

## Phase 2 — DOJO information architecture and Compendium shell

**Status:** SPECIFICATION APPROVED — IMPLEMENTATION NOT APPROVED — INDEPENDENT AUDIT NEXT.

**Working branch:** `phase-2-dojo-shell`.

**Approved specification:** `project-docs/PHASE-2-SPEC.md` on `phase-2-dojo-shell`.

**Approval date:** 1 November 2026.

The approved Phase 2 specification and Addenda A, B and C are the exact scope authority for Phase 2. Read the complete specification before any implementation work.

### Specification approval

The owner explicitly approved the Phase 2 specification draft and all three addenda.

**Core specification:** DOJO information architecture, Compendium structure, Chapter Reader, curriculum relationships, data principles, progression separation, scope and acceptance criteria.

**Addendum A — Visual Learning**

Visual representations must accompany substantial concepts wherever they materially improve understanding.

Examples include Circle of Fifths, key signatures, intervals, scales, chords, fretboard maps, harmonic progressions/functions, voice leading, rhythm and modal comparisons.

Diagrams should be embedded near the relevant explanation, responsive and legible.

Static diagrams and interactive tools must be distinguished.

Phase 2 establishes conventions and includes at least one representative diagram; it does not build the complete diagram library.

**Addendum B — IMPROV Naming**

`IMPROV` is the official navigation/product label, including bars, cards, progress, Gates and subdivision labels.

Natural explanatory English uses grammatical terms such as “the improvisation track”, “improvisation exercises” and “improvisational development”.

**Addendum C — Navigation and Visual Experience Blueprint**

Defines:

- Dual independent progress indicators.
- DOJO Hub.
- Desktop and mobile Explorer patterns.
- Continuous Chapter Reader.
- Visual educational resource conventions.
- Preservation of the Phase 1 visual language.
- Consistent navigation.

### Approved Phase 2 product and UX decisions

1. **Two independent progression systems**
   - `TECHNIQUE ROADMAP` remains the existing red, phase-segmented technique progression. Its calculations and behaviour must remain unchanged in Phase 2.
   - `MUSICAL DEVELOPMENT` is a separate global practical-learning indicator with DOJO and IMPROV subdivisions.
   - It is driven only by meaningful practical exercise evidence.
   - No fabricated percentages, arbitrary XP totals or unsupported mastery claims.
   - The evidence model and weighting remain to be designed in a future approved phase.
   - Desktop indicators sit side by side; mobile uses a compact stacked or equivalent responsive arrangement.

2. **Theory reading never creates progress**
   - No chapter reading states.
   - No studied status.
   - No “Mark as Studied”.
   - No XP for reading.
   - No theory content locks.

3. **Recommended path and free exploration** coexist. The recommended path guides but never blocks access.

4. **DOJO Hub:** Music Theory Compendium, Fretboard Mastery and Harmonic Analysis Lab.

5. **Compendium Explorer:** desktop persistent category sidebar and central content; mobile simplified category selection with search and clear navigation. Avoid deep accordion-heavy navigation.

6. **Chapter Reader:** continuous editorial reading page; desktop side table of contents and compact mobile chapter index.

7. **Bidirectional learning links:** relevant theory chapters link to practical exercises/tools and practical activities link back to supporting theory.

8. **Curriculum:** preserve the approved topic structure and exactly nine Functional Harmony chapters as specified in `PHASE-2-SPEC.md`.

9. **DAILY:** existing routines, tasks, progress and behaviour remain unchanged in Phase 2.

10. **Legacy DOJO:** old UI/functions may be replaced where appropriate. Preserve useful user data, not obsolete architecture for its own sake.

### Phase 2 implementation status

The Phase 2 implementation is not approved and has not been merged into `main`.

The current branch implementation must be independently audited against:

- The approved Phase 2 specification.
- The latest approved `main` baseline.
- The technical safeguards in this Masterplan.

Do not assume that the existing branch implementation fully satisfies the approved requirements.

### Stage 1 — Independent implementation audit

The next action is an independent audit of the complete current Phase 2 branch implementation.

This is a no-code-change stage.

The audit must provide:

- Exact baseline and branch commit/file identification.
- Requirements compliance matrix (PASS / PARTIAL / FAIL / NOT VERIFIABLE) with source evidence.
- Regression risk review for HOME, DAILY, TECHNIQUE ROADMAP, IMPROV, LIBRARY, SETUP, authentication, persistence and Firebase.
- Data preservation and migration review, including unknown/future state fields and asynchronous account/session race risks.
- Desktop/mobile UX and visual-learning review against Addendum C.
- Critical defects with severity.
- Recommendation: incremental correction, partial rebuild or rebuild from approved `main`.
- Truthful test status separating static inspection, automated tests, browser tests, Firebase/auth tests and manual tests still required.

**Stage 1 restrictions:**

- Do not edit code or project files.
- Do not create commits.
- Do not change branches.
- Do not implement fixes.
- Do not produce a replacement `index.html`.

Stop after the report and wait for explicit owner approval.

### Stage 2 — Implementation gate

Stage 2 does not begin automatically after the audit.

The owner must review the report and explicitly approve the implementation strategy.

Only then may the authorised implementation scope proceed.

Do not merge Phase 2 into `main` until the complete implementation has been reviewed, tested and approved by the owner.

## Phase 3 — Compendium foundations and harmony

**Objective:** Establish the editorial standard and create the first substantial body of theory.

Populate the DOJO Compendium with substantial, accurate English-language learning content.

Work only on the agreed chapters in this phase; do not attempt to fill the entire advanced syllabus in one pass.

### Content standard

Every substantial chapter should explain:

- What the concept is and why it matters.
- Prerequisites.
- Precise terminology.
- Construction and derivation.
- Classifications and variants.
- Exceptions.
- Relationships to other concepts.
- Musical effect.
- Worked examples.
- Common errors.
- Applications.
- Exercises and solutions.

Integrate visual explanations wherever they materially improve understanding.

### First coherent learning block

- Pitch, pitch classes and octave equivalence.
- Note names and enharmonic spelling.
- Natural notes, sharps, flats and accidentals.
- Semitones, whole tones and interval measurement.
- Interval qualities and compound intervals.
- Key signatures and the Circle of Fifths.
- Major and minor scales, including construction and spelling.
- Scale degrees and basic tonal-centre concepts.

Then add the next block if implementation and output quality allow:

- Triads and chord construction.
- Chord qualities and inversions.
- Diatonic triads in major and minor keys.
- Seventh chords and chord symbols.
- Roman-numeral analysis and basic harmonic function.

### Chapter requirements

1. Use precise examples in multiple keys, not just C major.
2. Explain spelling as well as pitch equivalence.
3. Include comparison tables or visual diagrams where they genuinely clarify.
4. Include at least three different exercise formats across the chapter set.
5. Provide worked solutions and reasoning, not only an answer key.
6. Include guitar application in a clearly separate subsection where relevant.
7. Link prerequisites and follow-up topics.
8. Do not introduce reading-completion or studied-state progression.
9. Keep practical exercise evidence separate from chapter reading.

Do not invent historical claims, quotations or artist-specific examples. If uncertain, mark an example for verification rather than presenting it as fact.

Keep content data separate from rendering code.

Ensure mobile readability and do not overload the initial chapter view.

### Deliverables

- Complete updated `index.html`.
- List of chapters completed and their coverage.
- Content-quality self-audit.
- Exercise inventory.
- Visual resources introduced.
- Exact list of what remains for the next content block.

## Phase 4 — Advanced theory

**Objective:** Expand the encyclopaedia into advanced harmony, modes, chromaticism, rhythm and form.

Continue the existing Compendium using the same approved chapter template, terminology, notation conventions and visual system.

Do not rewrite earlier chapters unless a factual error is identified. Report any correction explicitly.

Develop substantial chapters covering:

- Natural minor, harmonic minor and melodic minor; parallel and relative relationships.
- Modes: derivation, interval formulas, characteristic tones, modal centres and modal harmony.
- Pentatonic and blues scales, symmetrical scales and selected synthetic scales.
- Triad extensions, seventh chords, ninth/eleventh/thirteenth chords, altered tensions and chord-symbol conventions.
- Inversions, slash chords, voicings and voice-leading implications.
- Diatonic harmony in major and minor.
- Functional harmony, tonic/predominant/dominant roles, cadences and harmonic rhythm.
- Secondary dominants and applied chords.
- Modal mixture/interchange and borrowed chords.
- Modulation, tonicisation and ambiguous tonal centres.
- Chromatic harmony, diminished harmony, augmented harmony and other relevant advanced devices.
- Voice leading, common-tone relationships and counterpoint fundamentals.
- Rhythm, meter, subdivisions, syncopation, odd meters and polyrhythmic concepts where appropriate.
- Musical form and composition principles relevant to the user's goals.

For each topic, explain construction, notation, context, musical effect, common misconceptions and analytical use.

Distinguish standard practice from stylistic conventions.

Use examples across genres, but do not reduce general theory to metal/blues examples.

Include exercises that require construction, comparison, analysis, diagnosis, transposition and application.

Vary the underlying musical examples and task types; do not merely randomise a root note.

Maintain internal links, prerequisite relationships and a coherent recommended path.

Do not create content locks or reading-based progress.

If scope is too large, divide the work into clearly defined sub-batches and stop after a complete, reviewed batch.

### Deliverables

- Complete updated `index.html`.
- Chapter coverage matrix.
- New/changed terminology.
- Exercise inventory.
- Visual resource inventory.
- Content audit.
- Next-batch recommendation.

## Phase 5 — Fretboard Mastery

**Objective:** Build the interactive guitar visualisation and practical fretboard exercises.

Implement Fretboard Mastery as a real interactive learning tool, not a static diagram.

### Core fretboard

- Render a configurable guitar fretboard with selectable string count/tuning and a useful default standard tuning.
- Show note names, enharmonic spelling, pitch classes, intervals, scale degrees and selected chord tones.
- Allow the user to select a root/key and a scale, mode, chord or interval set.
- Highlight notes consistently and provide a legend.
- Support practical fret ranges and responsive interaction on mobile.
- Include controls to show/hide labels and switch between note names, interval names and scale degrees.
- Ensure note calculations are derived correctly from tuning and fret position; avoid hard-coded pattern-only displays.

### Learning tools

- Note-finding and interval mapping across the neck.
- Scale construction and position visualisation.
- Triads, inversions, arpeggios and chord-tone mapping.
- Chord voicing visualisation where practical.
- String relationship and octave-pattern exploration.
- Connect fretboard shapes to keys, scale degrees and harmonic function.
- Provide examples that explain why a shape works rather than teaching memorised boxes alone.

### Pedagogy

Add guided practical tasks such as:

- Locate all minor thirds from a selected note.
- Map a scale degree across strings.
- Construct a triad in a chosen area.
- Identify chord tones within a position.

Give hints and explanations.

Link each tool to its relevant Compendium chapter and, where appropriate, IMPROV Gates.

Practical exercise records may contribute to MUSICAL DEVELOPMENT only when the relevant evidence model and criteria have been approved and implemented.

### Technical quality

- Use accurate tuning/fret mathematics and test enharmonic edge cases.
- Avoid rendering too many DOM elements unnecessarily.
- Ensure touch-friendly controls and keyboard accessibility where practical.
- Avoid mobile horizontal overflow.
- Preserve existing app state and unrelated features.

### Deliverables

- Complete updated `index.html`.
- Explanation of the calculation model.
- Supported tunings/ranges.
- Note-accuracy tests across open strings and multiple frets.
- Mobile/desktop checks.
- Practical exercise data and progression implications.

## Phase 6 — Harmonic Analysis Lab

**Objective:** Create a useful analysis environment with explicit assumptions and nuanced explanations.

Build the Harmonic Analysis Lab as a guided analysis workspace.

### Required capabilities

- Let the learner enter or select a key/tonal centre and a chord progression.
- Display chord symbols and Roman numerals together where meaningful.
- Identify diatonic chords and flag non-diatonic chords for analysis rather than automatically labelling them as errors.
- Support tonic/predominant/dominant function, cadences, secondary dominants, modal interchange, borrowed chords, tonicisation, modulation, pedal points/drones and ambiguous progressions.
- Show harmonic rhythm and progression structure.
- Explain alternative interpretations where a progression is genuinely ambiguous.
- Provide step-by-step worked analyses and guided exercises.
- Include a diagnosis mode where the learner corrects a flawed analysis and receives reasoning.
- Link to Compendium chapters and relevant IMPROV Gates.
- Include visual representations of harmonic relationships where they materially improve understanding.

### Important musical rules

- Do not imply that every chord progression has one unambiguous Roman-numeral interpretation.
- Distinguish chord spelling, chord quality, scale-degree root and harmonic function.
- Handle major/minor context, accidentals, enharmonic spelling and borrowed chords carefully.
- Make assumptions explicit (e.g. selected key, tuning or tonal centre).
- Do not claim automatic audio transcription or audio recognition unless it is actually implemented.

### Interface

Keep the tool understandable: progressive steps, clear notation, expandable explanations and useful visual summaries.

Ensure desktop and mobile support.

### Deliverables

- Complete updated `index.html`.
- Supported analysis cases and limitations.
- Worked examples.
- Tests for diatonic, secondary-dominant, modal-interchange and ambiguous cases.

## Phase 7 — IMPROV

**Objective:** Turn the five Gates into a serious practical musicianship curriculum.

Redesign the IMPROV section substantially while preserving its five-Gate identity.

Do not simply restyle old questions.

Treat current Gate content as replaceable, but inspect existing state fields and migrate or preserve user progress safely.

### Gates

1. The Horizontal Prison — break out of fixed-box thinking; connect positions, intervals, phrases and neck navigation.
2. The Chord Tone Architect — target chord tones, outline changes, connect lines to harmony and use voice leading.
3. The Rhythmic Displacer — rhythmic variation, displacement, subdivisions, odd meters, syncopation and phrase placement.
4. The Modal Alchemist — modal colour, scale/chord relationships, characteristic tones and controlled modal application.
5. Total Audiation — develop internal musical conception, melodic direction and the relationship between imagined musical ideas and instrument execution. Avoid duplicating the user's separate ear-training tools.

### For each Gate

- Define purpose, prerequisites, skills and measurable outcomes.
- Provide a progression of levels or missions, from foundational to advanced.
- Explain the musical idea before asking the user to perform it.
- Include varied practical tasks, not just multiple-choice questions.
- Provide practice instructions, constraints, reflection prompts and assessment criteria.
- Include examples and links to Compendium, Fretboard Mastery and Analysis Lab.
- Make progress meaningful and transparent.
- Do not lock theory content behind XP.
- Provide ways to resume a Gate and see strengths/areas to revisit.
- Link practical activities back to relevant theoretical material.

### Progression

IMPROV practical exercises may contribute to the IMPROV subdivision of MUSICAL DEVELOPMENT.

Only meaningful exercise evidence may contribute.

Do not award arbitrary XP or claim mastery without transparent criteria and sufficient evidence.

The exact global competency and weighting model must be approved before meaningful progress values are displayed.

### Preserve

Retain the user's overall app progress, DAILY plan and unrelated features.

If old Gate progress cannot map cleanly to the new system, preserve it in a legacy field or document the migration rather than silently discarding it.

### Deliverables

- Complete updated `index.html`.
- Gate-by-Gate content outline.
- Exercise types.
- Progress mapping/migration notes.
- Practical progression evidence model.
- Test checklist.

## Phase 8 — Listening Vault

**Objective:** Make listening references actionable, searchable and connected to the learning system.

Redesign the Listening Vault as an active reference and musical-analysis library, not just a list of artists or genres.

### Organisation

- Browse by genre, artist, musical concept and learning objective.
- Retain and expand useful existing categories such as Stoner/Doom/Sludge, Prog/Odd Meters, Death Metal/Groove and Classic Rock/Blues.
- Keep theory general and use genre categories as examples and contexts, not as limits.
- Include the user's priority interests: stoner, doom, sludge, progressive music, death metal, thrash and blues.

### Reference entry template

Where information is available and verified, each entry can include:

- Artist and work/track or specific passage.
- Genre and context.
- What to listen for (harmonic, melodic, rhythmic, textural or phrasing feature).
- Relevant theory concepts and links to DOJO chapters.
- Harmonic/melodic/rhythmic analysis, with uncertainty clearly marked.
- Guitar application or practice idea.
- Personal notes and bookmarking.

### Editorial accuracy

- Do not invent track timestamps, chord progressions, scales, quotes or claims about a recording.
- If the exact musical analysis has not been verified, label it as a suggested listening focus or an item requiring verification.
- Do not embed copyrighted audio or reproduce lyrics.
- Link to legitimate listening destinations only if a reliable URL is supplied or verified.
- Do not fabricate external URLs.

### Functionality

- Search and filter by genre, artist, concept and instrument application.
- Allow bookmarks/favourites and personal study notes if supported by the approved data model.
- Provide links to relevant Compendium chapters, Fretboard tools, Analysis Lab and IMPROV Gates.
- Ensure the library remains useful even when the user has not signed in.

### Deliverables

- Complete updated `index.html`.
- Taxonomy and entry schema.
- Verified versus suggested references.
- Tests for search, filters, bookmarks and persistence.

## Phase 9 — Learning and assessment

**Objective:** Connect the content into a meaningful learning journey without turning it into a locked game.

Integrate the learning experience across DOJO, IMPROV and Listening Vault.

### Learning modes

- Progressive path: recommend a sensible sequence based on prerequisites and practical evidence where relevant.
- Free exploration: allow users to open any chapter or tool without arbitrary XP locks.
- Explain why a next step is recommended.

Theory reading must not create progress or be used as an assessment signal.

### Exercise system

Support a reusable exercise model with task types such as:

- Construct a scale/chord/interval set.
- Identify a chord or interval from its construction.
- Analyse a progression and explain function.
- Diagnose an incorrect Roman-numeral analysis.
- Compare modes/scales over the same tonal centre.
- Transpose a progression while preserving function.
- Locate notes or chord tones on the fretboard.
- Explain why a progression is ambiguous or why a musical choice creates a particular effect.

Avoid repetitive question templates and superficial randomisation.

### Feedback

- Give hints, worked reasoning and explanations.
- Distinguish an incorrect answer from a partially correct or alternative valid interpretation where possible.
- Track attempts and practical mastery separately from simply opening a chapter.
- Use transparent mastery criteria.
- Do not invent precision or claim competence from a single quiz response.

### Progress

- Provide a coherent overview across practical exercises, tools and Gates.
- Keep static curriculum separate from per-user practical progress.
- Preserve legacy app progress where useful.
- Use additive, versioned data structures.
- Support local use and optional account sync.
- If spaced review is implemented, explain its logic and let users access content freely.
- Keep TECHNIQUE ROADMAP independent from MUSICAL DEVELOPMENT.
- Keep DAILY outside MUSICAL DEVELOPMENT unless a future approved specification explicitly defines its contribution.

### MUSICAL DEVELOPMENT evidence model

Before displaying meaningful progress, define:

- Competency dimensions.
- What counts as valid practical evidence.
- How exercise difficulty is represented.
- How repeated attempts are treated.
- How completion differs from mastery.
- How evidence contributes to DOJO and IMPROV subdivisions.
- How the global indicator is calculated.
- How incomplete or insufficient evidence is represented.

The model must be understandable and defensible.

Do not reduce it to an arbitrary XP total.

### Deliverables

- Complete updated `index.html`.
- Exercise schema.
- Mastery rules.
- Learning-path/prerequisite logic.
- MUSICAL DEVELOPMENT evidence model.
- Migration notes.
- Tests for signed-out/local and signed-in/synced use.

## Phase 10 — Integration and release audit

**Objective:** Verify the complete application and prevent regressions before release.

Perform a full quality audit of the current complete `index.html`.

Do not add major new features during this phase unless a defect must be fixed to make an existing feature work.

### Regression areas

- HOME dashboard and navigation.
- DAILY plan, task completion, calendar/streaks and existing roadmap.
- TECHNIQUE ROADMAP calculations, display and behaviour.
- MUSICAL DEVELOPMENT calculations, evidence and subdivisions.
- DOJO Compendium, chapter navigation, search, diagrams and practical exercises.
- Fretboard Mastery calculations and interactions.
- Harmonic Analysis Lab examples and analysis.
- All five IMPROV Gates and practical progress.
- Listening Vault search, filters, bookmarks and notes.
- SETUP tools and settings.
- Google sign-in/sign-out and signed-out operation.
- localStorage persistence, Firestore sync and cross-device behaviour.
- Data migration from the original baseline and from each intermediate checkpoint.
- Responsive behaviour on small mobile, large mobile/tablet and desktop.

### Technical audit

- Check browser console errors and broken event handlers.
- Check missing IDs, duplicate IDs, invalid selectors and dead controls.
- Check that event delegation still works after view changes.
- Check that re-rendering does not erase user input unexpectedly.
- Check performance for large chapter lists and diagrams.
- Check accessibility basics: keyboard navigation, focus, labels and contrast.
- Check that no secrets or unsafe user data are exposed.
- Check Firestore rules assumptions; do not claim rules are secure unless they were actually inspected.
- Verify that theory reading never creates progression evidence.
- Verify that TECHNIQUE ROADMAP remains independent.
- Verify that DAILY has not been unintentionally integrated into MUSICAL DEVELOPMENT.

### Output

1. Test matrix with pass/fail/not-tested.
2. Bugs found and fixes made.
3. Data migration and backup instructions.
4. Known limitations.
5. Final complete `index.html`.
6. Release checklist and rollback procedure.

Do not claim a test passed unless it was actually run.

Clearly distinguish code inspection from browser testing.

---

# 12. Acceptance checklist for every phase

Before approving a phase, verify:

- [ ] The latest approved complete `index.html` is attached and was inspected.
- [ ] The requested phase is the only implementation scope.
- [ ] No unrelated top-level area was removed or degraded.
- [ ] The app still loads without a signed-in account.
- [ ] Existing local user data remains readable.
- [ ] Firebase login and sync remain intact where relevant.
- [ ] Desktop and mobile layouts are usable.
- [ ] No visible control is inert or falsely presented as functional.
- [ ] The output is a complete file, not partial code or placeholders.
- [ ] A change log and test checklist are supplied.
- [ ] The new checkpoint is saved separately from the original baseline.
- [ ] Theory reading does not create progress, completion or mastery.
- [ ] TECHNIQUE ROADMAP remains independent and unchanged unless explicitly authorised.
- [ ] DAILY functionality remains intact.
- [ ] MUSICAL DEVELOPMENT does not display fabricated progress.
- [ ] Visual resources are legible and educationally useful where applicable.
- [ ] The implementation complies with the approved phase specification.

A phase is not approved merely because Gemini reports that it is complete.

---

# 13. Project context handover — paste into a future ChatGPT conversation

The Shred Roadmap is a long-term music-learning application.

Read `MASTERPLAN.md`, `CHECKPOINT.md`, `PHASE_LOG.md`, the latest approved `index.html` from `main`, and the current approved phase specification before acting.

Speak to the owner in clear European Portuguese.

All application-facing text, curriculum content and code comments must be in English.

## Current project status — 2 November 2026

- Phase 0 — Source Audit and Architecture: complete.
- Phase 1 — Responsive UI and Navigation Foundation: complete, tested and approved. Its Pull Request was merged into `main` by the owner.
- Phase 2 — DOJO Information Architecture and Compendium Shell: specification approved, implementation not approved.
- The Phase 2 specification is `project-docs/PHASE-2-SPEC.md` on `phase-2-dojo-shell`.
- The owner approved the core specification and Addenda A, B and C on 1 November 2026.
- The next action is an independent, no-code-change audit of the existing Phase 2 branch against the approved specification and latest approved `main` baseline.
- Stage 2 implementation requires explicit owner approval after reviewing the audit.
- Phases 3–10 have not yet been started unless a later approved project document records otherwise.

## Official application structure

The official top-level areas are:

- HOME.
- DAILY.
- DOJO.
- IMPROV.
- LIBRARY.
- SETUP.

DOJO contains:

1. Music Theory Compendium.
2. Fretboard Mastery.
3. Harmonic Analysis Lab.

IMPROV retains five Gates:

1. The Horizontal Prison.
2. The Chord Tone Architect.
3. The Rhythmic Displacer.
4. The Modal Alchemist.
5. Total Audiation.

LIBRARY includes the Listening Vault.

## Progression rules

`TECHNIQUE ROADMAP` is the existing independent, red, phase-based technique progression. Preserve its behaviour and calculations.

`MUSICAL DEVELOPMENT` is the separate global practical-learning indicator with DOJO and IMPROV subdivisions.

Only meaningful practical exercise evidence may contribute to MUSICAL DEVELOPMENT.

Theory reading never contributes.

Do not invent XP, percentages or mastery.

DAILY functionality remains unchanged. DAILY does not contribute to MUSICAL DEVELOPMENT unless a future approved specification explicitly defines this relationship.

## Phase 2 rules

The approved `PHASE-2-SPEC.md` is authoritative for exact Phase 2 scope and acceptance criteria.

The next action is Stage 1: independent inspection and reporting only.

Do not implement fixes before the owner reviews the audit and explicitly approves Stage 2.

Never modify `main` experimentally.

Never merge without owner approval.

Never claim tests that were not actually run.

## Technical safeguards

- Protect existing user progress.
- Do not change Firebase configuration, authentication or Firestore paths without approval.
- Keep schema changes additive and versioned.
- Preserve the latest approved `main` baseline.
- Keep `baseline-original` untouched.
- Distinguish verified facts, assumptions and untested behaviour.
- Do not sacrifice working functionality for convenience.

---

# 14. Important project principles and unresolved decisions

## Principles already decided

1. English is the application language, even though planning conversations may be in Portuguese.
2. The app is a musicianship platform with guitar-specific applications, not a guitar-only theory course.
3. DOJO is a substantial educational rebuild, not a cosmetic refresh.
4. IMPROV and Listening Vault are major redesigns, not minor content edits.
5. Original useful application behaviour and user data must be protected.
6. The product must support both guided progression and free reference use.
7. Theory content must always be accessible.
8. Theory reading never creates progression, XP, completion or mastery.
9. Practical progression is based exclusively on meaningful exercise and practical-work evidence.
10. TECHNIQUE ROADMAP and MUSICAL DEVELOPMENT are independent.
11. MUSICAL DEVELOPMENT has DOJO and IMPROV subdivisions.
12. DAILY functionality must be preserved.
13. The Compendium must integrate visual learning resources where they materially improve understanding.
14. The DOJO Explorer uses hybrid desktop/mobile navigation, not deep accordion-heavy navigation.
15. Chapter reading uses a continuous editorial page.
16. `IMPROV` is the official navigation and product label; ordinary explanatory English should remain grammatical.
17. The approved Phase 2 specification takes precedence over older conflicting Phase 2 planning instructions.

## Decisions still open

These are genuine unresolved decisions and must not be invented by Gemini.

1. **Practical progression model:** exact competency dimensions, evidence requirements, weighting, difficulty treatment and mastery thresholds for MUSICAL DEVELOPMENT.
2. **Technical code organisation:** whether to retain a single physical `index.html` or introduce separate JS/CSS files while keeping GitHub Pages deployment simple. Prefer the least disruptive maintainable option.
3. **Persistence and synchronisation:** whether notes/bookmarks and exercise attempts should sync immediately or use a local queue; decide based on the actual Firebase implementation.
4. **Listening Vault verification:** which entries can be verified and which should remain suggested placeholders until checked.
5. **Total Audiation scope:** whether it should include any ear-training-like activities or focus mainly on internal melodic planning, given the user's separate tools.

## Decisions no longer open

Do not reopen the following without explicit owner approval:

- DOJO Hub structure.
- Desktop/mobile Compendium navigation pattern.
- Continuous Chapter Reader approach.
- No theory-reading progress.
- Separation between TECHNIQUE ROADMAP and MUSICAL DEVELOPMENT.
- DOJO and IMPROV as the two MUSICAL DEVELOPMENT subdivisions.
- Official IMPROV naming convention.
- Visual-learning principle and Phase 2 representative-diagram requirement.
- Preservation of DAILY functionality during Phase 2.

---

# 15. Final reminder

The purpose of this document is to preserve intent and prevent scope drift.

The project should become deeper, more coherent and more useful without losing the original application's identity, working foundations or user data.

Gemini is an implementation assistant, not the authority on the product vision.

The owner approves product decisions, implementation scope and phase completion.

Verify proposals, preserve backups, review every change and approve each phase before proceeding.

**Preserve what works. Improve what needs to evolve. Never sacrifice project continuity for convenience.**
