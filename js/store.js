// Persistence: the app's saved state (localStorage key + cloud copy in Firestore users/{uid}).
// Moved unchanged from index.html in Phase 2, slice 2.3 (DECISIONS D95, D97).
// The only technical change: other files cannot reassign `state` (ES module rule), so every
// replacement of the whole state goes through replaceState(). `state` itself is a live binding:
// importers always see the current object.
import { hasFirebase, currentUser, db, doc, setDoc } from './firebase.js?v=1';

export const STORAGE_KEY="shredRoadmapState_v10";

export function defaultDojoState() {
  return {
    xp: 0, level: 1, unlockedCodexes: [1], readCodexes: [], audioMuted: false
  };
}

export function defaultState(){
return {phaseIndex:0,chop:{alt:0,sweep:0,legato:0,econ:0,tap:0},testLevel:{alt:0,sweep:0,legato:0,econ:0,tap:0,ult:0},bonusLevel:{},checks:{},practiced:{},practicedDate:null,congratsDate:null,activeDayOverride:null,activeDayDate:null,streakDates:[],setupGuitar:"prs",setupTuning:"e_std",improvIndex:0,improvChecks:{}, dojo: defaultDojoState()};}
export function loadState(){try{var raw=localStorage.getItem(STORAGE_KEY);if(raw){var d=JSON.parse(raw);return Object.assign(defaultState(),d,{chop:Object.assign(defaultState().chop,d.chop||{}),testLevel:Object.assign(defaultState().testLevel,d.testLevel||{}),bonusLevel:d.bonusLevel||{},checks:d.checks||{},practiced:d.practiced||{},streakDates:d.streakDates||[],setupGuitar:d.setupGuitar||"prs",setupTuning:d.setupTuning||"e_std",improvIndex:d.improvIndex||0,improvChecks:d.improvChecks||{}, dojo: Object.assign(defaultDojoState(), d.dojo||{})});}}catch(e){}return defaultState();}

export function saveState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}
  if(hasFirebase && currentUser && db) {
    setDoc(doc(db, "users", currentUser.uid), state).catch(e => console.error("Firebase save err", e));
  }
}

// The one place where the whole state object is replaced (initial load, sign-in sync,
// Reset Everything, manual "Load from cloud").
export let state;
export function replaceState(next){ state = next; }

replaceState(loadState());
