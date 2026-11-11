// Firebase: configuration, start-up, Google sign-in and the sign-in sync.
// Moved unchanged from index.html in Phase 2, slice 2.3 (DECISIONS D95, D97).
// `auth`, `db`, `googleProvider` and `currentUser` are live bindings: other files read them,
// only this file changes them. The sign-in sync replaces the state through replaceState().
// render and showToast belong to the UI; index.html hands them over when it starts Firebase.
// Slice 3.1 (D101): the sign-in sync passes cloud data through migrate() (schemaVersion).
// Slice 3.2 (D102): the local state is backed up before the sign-in sync replaces it.
// Slice 3.3 (D103): `cloudReady` stays false until this session has read the cloud; until then
// nothing is written to the cloud. If the read fails, `cloudReadFailed` is set and no cloud writes
// happen for the rest of the session (a successful manual "Load from cloud" lifts it).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { state, replaceState, defaultState, STORAGE_KEY, migrate, backupBeforeReplace } from './store.js?v=4';

// Firebase functions the rest of the app uses, so only this file loads the Firebase SDK.
export { doc, setDoc, getDoc, signInWithPopup, signOut };

const firebaseConfig = {
  apiKey: "AIzaSyDO-7ovvVwmowSa6KIoPwglO93nnp2kS4Y",
  authDomain: "shred-auth.firebaseapp.com",
  projectId: "shred-auth",
  storageBucket: "shred-auth.firebasestorage.app",
  messagingSenderId: "372290387192",
  appId: "1:372290387192:web:3052450efe7d7f8eaa4f0d",
  measurementId: "G-NLJVRXEG85"
};

export const hasFirebase = !!firebaseConfig.apiKey;
export let auth, db, googleProvider, currentUser = null;
export let cloudReady = false, cloudReadFailed = false;
export const CLOUD_READ_FAILED_MSG = "Could not reach your cloud progress. Changes are saved on this device only.";

// A successful read of the account's cloud copy (sign-in sync or manual Load) allows cloud writes.
export function markCloudRead(){ cloudReady = true; cloudReadFailed = false; }

export function initFirebase(render, showToast) {
if(hasFirebase) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = initializeFirestore(app, { localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}) });

    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      cloudReady = false; cloudReadFailed = false; // slice 3.3 (D103): read before any write
      if(user) {
        let docSnap;
        try {
          docSnap = await getDoc(doc(db, "users", user.uid));
        } catch(e) {
          console.error("Sync error:", e);
          if(currentUser === user){ cloudReadFailed = true; showToast(CLOUD_READ_FAILED_MSG); }
          render();
          return;
        }
        if(currentUser !== user) return; // signed out or another account while reading
        try {
          if(docSnap.exists()){
            // Slice 3.1 (D101): cloud data is brought to the current schemaVersion (backup first).
            const incoming = Object.assign(defaultState(), migrate(docSnap.data()));
            // Slice 3.2 (D102): back up local state first; the cloud still wins if that fails (D80).
            backupBeforeReplace("before-cloud-sync", incoming);
            replaceState(incoming);
            markCloudRead();
            state.setupGuitar = state.setupGuitar || "prs";
            state.setupTuning = state.setupTuning || "e_std";
            state.improvIndex = state.improvIndex || 0;
            state.improvChecks = state.improvChecks || {};
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            showToast("Progress synced from cloud!");
          } else {
            markCloudRead();
            await setDoc(doc(db, "users", user.uid), state);
            showToast("Local progress saved to cloud!");
          }
        } catch(e) { console.error("Sync error:", e); }
      }
      render();
    });
  } catch(e) { console.error("Firebase init error:", e); }
}
}
