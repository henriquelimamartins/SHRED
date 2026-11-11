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
// Slice 3.4 (D105): stale sessions never overwrite newer cloud data. Every cloud write is a
// transaction that checks the cloud `syncRev` against the one this session last read or wrote
// (`knownRev`); writes are sent one at a time; the cloud is re-read when the app becomes visible or
// the network returns; unsent changes are marked pending on the device (SYNC_PENDING_KEY); data
// saved by a newer app version (schemaVersion) is never written over.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, runTransaction, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { state, replaceState, defaultState, STORAGE_KEY, migrate, backupBeforeReplace, sameData, saveLocal, newerSchema, isNewerSchema, markNewerSchema, NEWER_SCHEMA_MSG } from './store.js?v=5';

// Firebase functions the rest of the app uses, so only this file loads the Firebase SDK.
export { doc, getDoc, signInWithPopup, signOut };

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

// --- Slice 3.4 (D105): stale sessions ---
export const SYNC_PENDING_KEY = "shredRoadmapSyncPending_v1";
export const STALE_REPLACED_MSG = "Newer progress from another device was loaded. Your last change here was kept only in this device's backups.";
export const CLOUD_UPDATED_MSG = "Updated with newer progress from another device.";

// syncRev of the cloud copy this session last read or wrote (absent in the data = 0).
let knownRev = 0;
// Counts whole-state replacements from the cloud, so a write that finishes after one does not
// overwrite knownRev with an older value.
let replaceCount = 0;
// UI functions handed over by initFirebase (the UI files import this file, not the other way round).
let uiRender = function(){}, uiToast = function(){};

export function revOf(data){
  return (data && typeof data.syncRev === "number" && isFinite(data.syncRev)) ? data.syncRev : 0;
}
function userRef(user){ return doc(db, "users", user.uid); }
function withoutRev(data){ var c = Object.assign({}, data); delete c.syncRev; return c; }

// Pending mark: { uid, baseRev } = this device has changes for that account, made on top of the
// cloud copy with syncRev baseRev, that may not have reached the cloud yet.
function readPending(){
  try{
    var p = JSON.parse(localStorage.getItem(SYNC_PENDING_KEY) || "null");
    return (p && typeof p.uid === "string" && typeof p.baseRev === "number") ? p : null;
  }catch(e){ return null; }
}
function setPending(uid, baseRev){
  try{ localStorage.setItem(SYNC_PENDING_KEY, JSON.stringify({ uid: uid, baseRev: baseRev })); }catch(e){}
}
function clearPending(){
  try{ localStorage.removeItem(SYNC_PENDING_KEY); }catch(e){}
}
function pendingFor(user){
  var p = readPending();
  return (p && user && p.uid === user.uid) ? p : null;
}

// Stops all writing when cloud data comes from a newer app version (D105 point 7).
function stopForNewerSchema(){
  markNewerSchema();
  uiToast(NEWER_SCHEMA_MSG);
  uiRender();
}

// The cloud copy replaces the local state (the cloud wins, D80): backup first (D102 store),
// pending mark cleared, the cloud's syncRev remembered. `message` is shown only when the
// local state really changed. Returns false when the cloud data is from a newer app version.
function adoptCloud(cloud, reason, message){
  if(isNewerSchema(cloud)){ stopForNewerSchema(); return false; }
  const incoming = Object.assign(defaultState(), migrate(cloud));
  const changed = !sameData(withoutRev(state), withoutRev(incoming));
  if(changed) backupBeforeReplace(reason, incoming); // the cloud still wins if this fails (D80)
  replaceState(incoming);
  replaceCount++;
  knownRev = revOf(cloud);
  clearPending();
  state.setupGuitar = state.setupGuitar || "prs";
  state.setupTuning = state.setupTuning || "e_std";
  state.improvIndex = state.improvIndex || 0;
  state.improvChecks = state.improvChecks || {};
  saveLocal();
  uiRender();
  if(changed && message) uiToast(message);
  return true;
}

// --- Write queue (D105 points 2, 4, 6) ---
// One write at a time. Saves requested while a write is running are merged into one follow-up
// write of the latest state. Returns a promise of the outcome:
// "ok" | "conflict" (cloud was newer and was loaded) | "error" (not sent, kept pending) |
// "newer" (cloud from a newer app version) | "skipped" (not signed in, cloud not read yet, ...).
let writing = false;
let followUp = null; // { promise, resolve } shared by every save requested during a write

function canWriteCloud(){ return !!(hasFirebase && currentUser && db && cloudReady && !newerSchema); }

export function requestCloudWrite(){
  if(!canWriteCloud()) return Promise.resolve("skipped");
  setPending(currentUser.uid, knownRev);
  if(writing){
    if(!followUp){
      let resolve;
      const promise = new Promise(function(r){ resolve = r; });
      followUp = { promise: promise, resolve: resolve };
    }
    return followUp.promise;
  }
  writing = true;
  const first = writeOnce();
  first.then(async function(outcome){
    while(followUp){
      const next = followUp;
      followUp = null;
      // After a conflict or a failure the follow-up is not sent: the cloud copy was loaded,
      // or the change stays pending on the device.
      if(outcome === "ok") outcome = await writeOnce();
      next.resolve(outcome);
    }
    writing = false;
  });
  return first;
}

async function writeOnce(){
  const user = currentUser;
  if(!canWriteCloud()) return "skipped";
  const base = knownRev;
  const startCount = replaceCount;
  const data = JSON.parse(JSON.stringify(state));
  data.syncRev = base + 1;
  let result;
  try {
    result = await runTransaction(db, async function(tx){
      const snap = await tx.get(userRef(user));
      if(snap.exists()){
        const cloud = snap.data();
        if(isNewerSchema(cloud)) return { kind: "newer" };
        if(revOf(cloud) !== base) return { kind: "conflict", cloud: cloud };
      }
      // No cloud document (new account or deleted): nothing newer can be lost.
      tx.set(userRef(user), data);
      return { kind: "ok" };
    });
  } catch(e) {
    console.warn("Cloud save not sent (kept on this device):", e);
    return "error";
  }
  if(currentUser !== user) return "skipped"; // signed out or another account meanwhile
  if(result.kind === "newer"){ stopForNewerSchema(); return "newer"; }
  if(result.kind === "conflict"){
    adoptCloud(result.cloud, "before-stale-replace", STALE_REPLACED_MSG);
    return "conflict";
  }
  if(startCount === replaceCount){
    knownRev = base + 1;
    state.syncRev = knownRev;
    saveLocal();
  }
  if(followUp) setPending(user.uid, knownRev); else clearPending();
  return "ok";
}

// --- Re-read on return (D105 points 5, 6) ---
// When the app becomes visible again or the network returns: load a newer cloud copy, or send
// changes still pending on this device if the cloud has not moved on.
let refreshing = false;
export async function refreshFromCloud(){
  if(!canWriteCloud() || writing || refreshing) return;
  const user = currentUser;
  refreshing = true;
  let snap;
  try { snap = await getDoc(userRef(user)); }
  catch(e) { refreshing = false; return; } // still offline: try again next time
  refreshing = false;
  if(currentUser !== user || !canWriteCloud() || writing) return;
  const pending = pendingFor(user);
  if(!snap.exists()){
    if(pending) requestCloudWrite();
    return;
  }
  const cloud = snap.data();
  if(isNewerSchema(cloud)){ stopForNewerSchema(); return; }
  const rev = revOf(cloud);
  if(rev === knownRev){
    if(pending) requestCloudWrite();
    return;
  }
  // An older copy (e.g. from the offline cache) never replaces newer local data.
  if(rev < knownRev) return;
  if(pending) adoptCloud(cloud, "before-stale-replace", STALE_REPLACED_MSG);
  else adoptCloud(cloud, "before-cloud-update", CLOUD_UPDATED_MSG);
}

// Manual "Load from cloud": the cloud copy replaces the local state (backup first).
// Returns "loaded" | "none" (no cloud document) | "newer"; throws when the cloud cannot be read.
export async function loadFromCloud(){
  const user = currentUser;
  const snap = await getDoc(userRef(user));
  if(currentUser !== user) return "none";
  if(!snap.exists()) return "none";
  if(!adoptCloud(snap.data(), "before-cloud-load", null)) return "newer";
  markCloudRead(); // slice 3.3 (D103): a successful read allows cloud writes
  return "loaded";
}

export function initFirebase(render, showToast) {
uiRender = render; uiToast = showToast;
if(hasFirebase) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = initializeFirestore(app, { localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}) });

    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      cloudReady = false; cloudReadFailed = false; // slice 3.3 (D103): read before any write
      knownRev = 0; followUp = null;
      if(user && newerSchema) { uiToast(NEWER_SCHEMA_MSG); render(); return; } // slice 3.4 (D105)
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
            const cloud = docSnap.data();
            const pending = pendingFor(user);
            if(isNewerSchema(cloud)) { stopForNewerSchema(); return; }
            if(pending && pending.baseRev === revOf(cloud)) {
              // Slice 3.4 (D105 point 6): this device has unsent changes and the cloud has not
              // moved on since: keep them and send them now.
              knownRev = revOf(cloud);
              markCloudRead();
              render();
              const outcome = await requestCloudWrite();
              if(outcome === "ok") showToast("Local progress saved to cloud!");
              return;
            }
            // Slice 3.1 (D101) migrate, slice 3.2 (D102) backup first; the cloud wins (D80).
            // Unsent changes on top of an older cloud copy: the cloud still wins (D105 point 6).
            if(pending) adoptCloud(cloud, "before-stale-replace", STALE_REPLACED_MSG);
            else if(adoptCloud(cloud, "before-cloud-sync", null)) showToast("Progress synced from cloud!");
            markCloudRead();
          } else {
            markCloudRead();
            knownRev = 0;
            const outcome = await requestCloudWrite();
            if(outcome === "ok") showToast("Local progress saved to cloud!");
          }
        } catch(e) { console.error("Sync error:", e); }
      }
      render();
    });

    // Slice 3.4 (D105 point 5): re-read the cloud when the app comes back or the network returns.
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "visible") refreshFromCloud();
    });
    window.addEventListener("online", function(){ refreshFromCloud(); });
  } catch(e) { console.error("Firebase init error:", e); }
}
}
