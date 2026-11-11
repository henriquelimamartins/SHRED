// Test data shaped like the app's saved state (mirrors defaultState() in index.html, as on main).
// Kept explicit on purpose: if the app's state shape changes, these tests should notice.

const TEST_USER = { uid: 'test-uid', email: 'tester@example.com' };
const USER_DOC = `users/${TEST_USER.uid}`;

function baseState(overrides = {}) {
  return {
    phaseIndex: 0,
    chop: { alt: 0, sweep: 0, legato: 0, econ: 0, tap: 0 },
    testLevel: { alt: 0, sweep: 0, legato: 0, econ: 0, tap: 0, ult: 0 },
    bonusLevel: {},
    checks: {},
    practiced: {},
    practicedDate: '2026-11-10', // same day as DEFAULT_NOW, so no daily reset on load
    congratsDate: null,
    activeDayOverride: null,
    activeDayDate: null,
    streakDates: [],
    setupGuitar: 'prs',
    setupTuning: 'e_std',
    improvIndex: 0,
    improvChecks: {},
    dojo: { xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: false },
    ...overrides,
  };
}

/** A state with real-looking progress in every area the app stores today. */
function progressState(overrides = {}) {
  return baseState({
    phaseIndex: 0,
    testLevel: { alt: 3, sweep: 2, legato: 1, econ: 0, tap: 0, ult: 0 },
    chop: { alt: 4, sweep: 0, legato: 2, econ: 0, tap: 0 },
    checks: { 'p0.pre.0': '2026-11-01' },
    streakDates: ['2026-11-07', '2026-11-08', '2026-11-09'],
    setupGuitar: 'epi',
    setupTuning: 'drop_d',
    improvIndex: 1,
    improvChecks: { g0e0: true },
    dojo: { xp: 200, level: 1, unlockedCodexes: [1], readCodexes: [1, 2], audioMuted: false },
    ...overrides,
  });
}

// Technique curriculum shape on main (D20: protected). Item counts per phase:
// concept videos (c), exercises (e), solos (s); chop target and test requirement.
const TECHNIQUE_PHASES = [
  { id: 'p0', label: 'Setup', prereq: 2 },
  { id: 'p1', label: 'Beginner', c: 4, e: 4, s: 5, target: 3, testReq: 2 },
  { id: 'p2', label: 'Intermediate', c: 4, e: 4, s: 5, target: 6, testReq: 3 },
  { id: 'p3', label: 'Advanced', c: 4, e: 5, s: 5, target: 8, testReq: 4 },
  { id: 'p4', label: 'Pro', c: 0, e: 6, s: 6, target: 10, testReq: 5 },
];
const CHOP_KEYS = ['alt', 'sweep', 'legato', 'econ', 'tap'];
const TEST_KEYS = ['alt', 'sweep', 'legato', 'econ', 'tap', 'ult'];

/** All checklist keys of a phase, e.g. phaseKeys(1) -> ['p1.c.0', ..., 'p1.s.4']. */
function phaseKeys(index) {
  const p = TECHNIQUE_PHASES[index];
  if (p.prereq) return Array.from({ length: p.prereq }, (_, i) => `p0.pre.${i}`);
  const keys = [];
  for (const [kind, n] of [['c', p.c], ['e', p.e], ['s', p.s]]) {
    for (let i = 0; i < n; i++) keys.push(`${p.id}.${kind}.${i}`);
  }
  return keys;
}

/** { key: value } for every listed key. */
function checksFor(keys, value = '2026-11-01') {
  return Object.fromEntries(keys.map((k) => [k, value]));
}

/** { alt: n, sweep: n, ... } for the given keys. */
function levels(keys, n) {
  return Object.fromEntries(keys.map((k) => [k, n]));
}

module.exports = {
  TEST_USER, USER_DOC, baseState, progressState,
  TECHNIQUE_PHASES, CHOP_KEYS, TEST_KEYS, phaseKeys, checksFor, levels,
};
