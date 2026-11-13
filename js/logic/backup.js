// Download / Restore backup (Phase 3, slice 3.8, DECISIONS D110).
// Pure helpers: the backup file, reading a chosen file, labels for the on-device snapshots and the
// state a restore produces. Nothing here saves or replaces anything; js/events.js does that, in the
// same order as Reset Everything (D106): newer-version stop, cloud read first, backup first.
import { STORAGE_KEY, SCHEMA_VERSION, defaultState, defaultDojoState, readBackups } from "../store.js?v=5";

export const BACKUP_APP = "shred-roadmap";
export const BACKUP_KIND = "backup";
export const MAX_BACKUP_FILE_BYTES = 5 * 1024 * 1024;
export const INVALID_BACKUP_MSG = "This file is not a SHRED Roadmap backup. Nothing was restored.";
export const NEWER_BACKUP_MSG = "This backup was made by a newer version of the app. Reload the page to update.";

// Today's DAILY session is kept from the current state on restore (D110 point 4, as D106).
var DAILY_SESSION_FIELDS = ["practiced", "practicedDate", "congratsDate", "activeDayOverride", "activeDayDate"];

function isPlainObject(v){ return !!v && typeof v === "object" && !Array.isArray(v); }
function copy(v){ return JSON.parse(JSON.stringify(v)); }
function pad(n){ return String(n).padStart(2, "0"); }
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// "12 Nov 2026, 09:14" in the device's local time; "unknown date" when there is no valid time.
export function formatLocalTime(at){
  var d = new Date(at);
  if(!at || isNaN(d.getTime())) return "unknown date";
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

// The reason of an on-device snapshot (D101, D102, D105, D106, D110) in plain words.
var REASON_LABELS = {
  "daily": "Daily backup",
  "migration": "Before app update",
  "before-cloud-sync": "Before cloud sync",
  "before-cloud-load": "Before Load from cloud",
  "before-reset": "Before reset",
  "before-stale-replace": "Before newer progress from another device",
  "before-restore": "Before restore"
};
export function reasonLabel(reason){ return REASON_LABELS[reason] || "Backup"; }

// On-device snapshots, newest first, each with its index in the stored list.
export function listDeviceBackups(){
  var list = readBackups() || [];
  var out = [];
  list.forEach(function(b, i){
    if(b && isPlainObject(b.state)) out.push({ index: i, at: b.at, reason: b.reason, schemaVersion: b.schemaVersion, state: b.state });
  });
  return out.reverse();
}

// File name with the device's local date (D110 point 2).
export function backupFileName(d){
  d = d || new Date();
  return "shred-roadmap-backup-" + d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()) + ".json";
}

// The downloaded file: current state + the on-device snapshots. Progress only, no sign-in data.
export function buildBackupFile(current){
  return {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    exportedAt: new Date().toISOString(),
    schemaVersion: (current && typeof current.schemaVersion === "number") ? current.schemaVersion : 0,
    state: copy(current),
    backups: copy(readBackups() || [])
  };
}

// A bare state: an object with at least two of the app's own fields, with the right types.
function looksLikeState(o){
  if(!isPlainObject(o)) return false;
  var hits = 0;
  if(typeof o.phaseIndex === "number") hits++;
  if(isPlainObject(o.chop)) hits++;
  if(isPlainObject(o.testLevel)) hits++;
  if(isPlainObject(o.checks)) hits++;
  if(Array.isArray(o.streakDates)) hits++;
  if(isPlainObject(o.improvChecks)) hits++;
  if(isPlainObject(o.dojo)) hits++;
  return hits >= 2;
}

// Reads a chosen file (D110 point 3). Accepts a file made by "Download backup", a bare state, or an
// export of the localStorage key ({ "shredRoadmapState_v10": state or its JSON text }).
// Returns { state, at } or null when the file is not a SHRED Roadmap backup.
export function parseBackupFile(text){
  var o;
  try{ o = JSON.parse(text); }catch(e){ return null; }
  if(!isPlainObject(o)) return null;
  if(o.app === BACKUP_APP && o.kind === BACKUP_KIND){
    return looksLikeState(o.state) ? { state: o.state, at: o.exportedAt || null } : null;
  }
  if(Object.prototype.hasOwnProperty.call(o, STORAGE_KEY)){
    var inner = o[STORAGE_KEY];
    if(typeof inner === "string"){ try{ inner = JSON.parse(inner); }catch(e){ return null; } }
    return looksLikeState(inner) ? { state: inner, at: null } : null;
  }
  return looksLikeState(o) ? { state: o, at: null } : null;
}

export function isNewerCopy(s){
  return isPlainObject(s) && typeof s.schemaVersion === "number" && s.schemaVersion > SCHEMA_VERSION;
}

// The state after a restore (D110 point 4). `chosen` has already been through migrate().
// - every field of the chosen copy is taken; fields only in the current state are kept (D82);
// - streak and calendar days = union of both (owner's choice A: a practised day is never lost);
// - today's DAILY session and syncRev stay as they are now;
// - missing app fields get their defaults, as loadState() does.
export function restoredState(current, chosen){
  var next = copy(current || {});
  var c = copy(chosen);
  Object.keys(c).forEach(function(k){ next[k] = c[k]; });

  var days = [];
  [current && current.streakDates, c.streakDates].forEach(function(list){
    if(Array.isArray(list)) list.forEach(function(d){ if(days.indexOf(d) === -1) days.push(d); });
  });
  days.sort(function(a, b){ return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0; });
  next.streakDates = days;

  var fresh = defaultState();
  DAILY_SESSION_FIELDS.forEach(function(f){
    next[f] = (current && Object.prototype.hasOwnProperty.call(current, f)) ? copy(current[f]) : fresh[f];
  });
  if(current && Object.prototype.hasOwnProperty.call(current, "syncRev")) next.syncRev = current.syncRev;
  else delete next.syncRev;

  // Defaults for anything missing, mirroring loadState() (unknown fields untouched).
  var nullable = ["practicedDate", "congratsDate", "activeDayOverride", "activeDayDate"];
  Object.keys(fresh).forEach(function(k){
    if(next[k] === undefined || (next[k] === null && nullable.indexOf(k) === -1)) next[k] = fresh[k];
  });
  next.chop = Object.assign(fresh.chop, isPlainObject(next.chop) ? next.chop : {});
  next.testLevel = Object.assign(fresh.testLevel, isPlainObject(next.testLevel) ? next.testLevel : {});
  next.dojo = Object.assign(defaultDojoState(), isPlainObject(next.dojo) ? next.dojo : {});
  return next;
}
