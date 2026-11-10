// Test stand-in for https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js
// Documents live in window.__SHRED_TEST__.docs (keyed by path, e.g. "users/test-uid").
// Every write is recorded in window.__SHRED_TEST__.writes so tests can check what the app saved.
function testState() {
  window.__SHRED_TEST__ = window.__SHRED_TEST__ || { user: null, docs: {}, writes: [], calls: [] };
  return window.__SHRED_TEST__;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getFirestore(app) {
  return { app };
}

export function initializeFirestore(app, settings) {
  testState().calls.push('initializeFirestore');
  return { app, settings };
}

export function persistentLocalCache(options) {
  return { kind: 'persistentLocalCache', options };
}

export function persistentMultipleTabManager() {
  return { kind: 'persistentMultipleTabManager' };
}

export function doc(db, ...segments) {
  return { path: segments.join('/') };
}

export async function getDoc(ref) {
  testState().calls.push('getDoc:' + ref.path);
  const stored = testState().docs[ref.path];
  return {
    exists: () => stored !== undefined,
    data: () => (stored === undefined ? undefined : clone(stored)),
  };
}

export async function setDoc(ref, data) {
  const copy = clone(data);
  testState().writes.push({ path: ref.path, data: copy, at: Date.now() });
  testState().docs[ref.path] = copy;
}
