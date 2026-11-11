// Persistence: the app's saved state (localStorage key + cloud copy in Firestore users/{uid}).
// Moved unchanged from index.html in Phase 2, slice 2.3 (DECISIONS D95, D97).
// The only technical change: other files cannot reassign `state` (ES module rule), so every
// replacement of the whole state goes through replaceState(). `state` itself is a live binding:
// importers always see the current object.
// Phase 3, slice 3.1 (DECISIONS D101): schemaVersion + automatic on-device backups.
// Phase 3, slice 3.2 (DECISIONS D102): backup before every whole-state replacement.
// Phase 3, slice 3.3 (DECISIONS D103): no cloud write before the cloud was read (cloudReady);
// saveLocal() saves on the device only (used by the daily reset).
import { hasFirebase, currentUser, cloudReady, db, doc, setDoc } from './firebase.js?v=4';

export const STORAGE_KEY="shredRoadmapState_v10";

// --- Schema version and on-device backups (slice 3.1, D101) ---
// Data without schemaVersion is version 0. Migrations only add fields and never run
// unless a backup of the data was written first. Backups never leave the device.
export const SCHEMA_VERSION = 1;
export const BACKUP_KEY = "shredRoadmapBackups_v1";
export const MAX_BACKUPS = 20;

// Device-local calendar day (YYYY-MM-DD), used to take one "daily" backup per day.
function localDayISO(d){
  d = d || new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

// Returns the stored backup list, [] when there is none, or null when it cannot be read
// (then nothing is written over it).
export function readBackups(){
  try{
    var raw = localStorage.getItem(BACKUP_KEY);
    if(!raw) return [];
    var list = JSON.parse(raw);
    return Array.isArray(list) ? list : null;
  }catch(e){ return null; }
}

// Adds a snapshot { at, reason, schemaVersion, state }, keeps the newest MAX_BACKUPS.
// Returns true only when the snapshot was really stored.
export function writeBackup(reason, data){
  try{
    var list = readBackups();
    if(list === null) return false;
    list.push({
      at: new Date().toISOString(),
      reason: reason,
      schemaVersion: (data && typeof data.schemaVersion === "number") ? data.schemaVersion : 0,
      state: JSON.parse(JSON.stringify(data))
    });
    while(list.length > MAX_BACKUPS) list.shift();
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list));
    return true;
  }catch(e){ return false; }
}

// Brings saved data up to SCHEMA_VERSION. Returns a new object; the input is not changed.
// Data that is current or newer is returned as it is (newer data is handled in slice 3.4).
// If the backup cannot be written, the data is returned unmigrated.
export function migrate(data){
  if(!data || typeof data !== "object") return data;
  var v = (typeof data.schemaVersion === "number") ? data.schemaVersion : 0;
  if(v >= SCHEMA_VERSION) return data;
  if(!writeBackup("migration", data)) return data;
  var out = Object.assign({}, data);
  // 0 -> 1: only the version number is added.
  out.schemaVersion = 1;
  return out;
}

// JSON with object keys sorted, so two states compare equal whatever their key order.
function stableJSON(v){
  if(Array.isArray(v)) return "[" + v.map(stableJSON).join(",") + "]";
  if(v && typeof v === "object"){
    return "{" + Object.keys(v).sort().filter(function(k){ return v[k] !== undefined; })
      .map(function(k){ return JSON.stringify(k) + ":" + stableJSON(v[k]); }).join(",") + "}";
  }
  return JSON.stringify(v === undefined ? null : v);
}
export function sameData(a, b){ return stableJSON(a) === stableJSON(b); }

// Safeguard 1 (slice 3.2, D102): call before the whole state is replaced.
// Backs up the current state unless there is nothing to lose (it equals `incoming`, when given,
// or the newest backup). Returns true when the current state is safe: backed up now or already.
export function backupBeforeReplace(reason, incoming){
  if(incoming !== undefined && sameData(state, incoming)) return true;
  var list = readBackups();
  if(list && list.length && sameData(state, list[list.length-1].state)) return true;
  return writeBackup(reason, state);
}

// One automatic snapshot of the current state on the first start-up of each local day.
export function dailyBackup(){
  var list = readBackups();
  if(list === null) return false;
  var today = localDayISO();
  var done = list.some(function(b){ return b && b.reason === "daily" && typeof b.at === "string" && localDayISO(new Date(b.at)) === today; });
  if(done) return false;
  return writeBackup("daily", state);
}

export function defaultDojoState() {
  return {
    xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: false
  };
}

export function defaultState(){
return {phaseIndex:0,chop:{alt:0,sweep:0,legato:0,econ:0,tap:0},testLevel:{alt:0,sweep:0,legato:0,econ:0,tap:0,ult:0},bonusLevel:{},checks:{},practiced:{},practicedDate:null,congratsDate:null,activeDayOverride:null,activeDayDate:null,streakDates:[],setupGuitar:"prs",setupTuning:"e_std",improvIndex:0,improvChecks:{}, dojo: defaultDojoState()};}
export function loadState(){try{var raw=localStorage.getItem(STORAGE_KEY);if(raw){var d=migrate(JSON.parse(raw));return Object.assign(defaultState(),d,{chop:Object.assign(defaultState().chop,d.chop||{}),testLevel:Object.assign(defaultState().testLevel,d.testLevel||{}),bonusLevel:d.bonusLevel||{},checks:d.checks||{},practiced:d.practiced||{},streakDates:d.streakDates||[],setupGuitar:d.setupGuitar||"prs",setupTuning:d.setupTuning||"e_std",improvIndex:d.improvIndex||0,improvChecks:d.improvChecks||{}, dojo: Object.assign(defaultDojoState(), d.dojo||{})});}}catch(e){}var fresh=defaultState();fresh.schemaVersion=SCHEMA_VERSION;return fresh;}

export function saveLocal(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}
}

export function saveState(){
  saveLocal();
  if(hasFirebase && currentUser && db && cloudReady) {
    setDoc(doc(db, "users", currentUser.uid), state).catch(e => console.error("Firebase save err", e));
  }
}

// The one place where the whole state object is replaced (initial load, sign-in sync,
// Reset Everything, manual "Load from cloud").
export let state;
export function replaceState(next){ state = next; }

replaceState(loadState());
dailyBackup();
