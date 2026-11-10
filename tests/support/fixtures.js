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

module.exports = { TEST_USER, USER_DOC, baseState, progressState };
