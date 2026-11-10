// Test stand-in for https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js
// It never talks to Google. State lives in window.__SHRED_TEST__ (see tests/support/app.js).
function testState() {
  window.__SHRED_TEST__ = window.__SHRED_TEST__ || { user: null, docs: {}, writes: [], calls: [] };
  return window.__SHRED_TEST__;
}

export function initializeApp(config) {
  testState().calls.push('initializeApp');
  return { options: config, name: '[DEFAULT]' };
}
