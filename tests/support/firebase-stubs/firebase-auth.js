// Test stand-in for https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js
// The signed-in user comes from window.__SHRED_TEST__.user (null = signed out).
function testState() {
  window.__SHRED_TEST__ = window.__SHRED_TEST__ || { user: null, docs: {}, writes: [], calls: [] };
  return window.__SHRED_TEST__;
}

export function getAuth(app) {
  testState().calls.push('getAuth');
  return { app };
}

export class GoogleAuthProvider {}

export function onAuthStateChanged(auth, callback) {
  testState().calls.push('onAuthStateChanged');
  const user = testState().user || null;
  // Real Firebase reports the auth state asynchronously; keep that timing.
  setTimeout(() => callback(user), 0);
  return () => {};
}

export function signInWithPopup() {
  testState().calls.push('signInWithPopup');
  return Promise.reject(new Error('Sign-in popup is disabled in tests'));
}

export function signOut() {
  testState().calls.push('signOut');
  return Promise.resolve();
}
