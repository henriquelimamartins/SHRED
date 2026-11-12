// Dates, daily reset and streak.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
// Slice 3.3 (D103): ensureDailyReset() saves on the device only.
// Slice 3.6 (D108): on a new day, ticks left from an earlier day are logged under that day, never today.
import { DAYS } from "../data/days.js?v=1";
import { saveLocal, state } from "../store.js?v=5";

export function todayISO(){return new Date().toISOString().slice(0,10);}
export function todayName(){return DAYS[new Date().getDay()];}
export function isWeekendDay(d){return d==="Sat"||d==="Sun";}
export function activeDay(){ if(state.activeDayOverride && state.activeDayDate===todayISO()) return state.activeDayOverride; return todayName(); }

export function ensureDailyReset(){
  var t=todayISO();
  if(state.practicedDate!==t){
    logPracticedDay(t); // slice 3.6 (D108): was updateStreakStatus(), which logged yesterday's ticks under today's date
    state.practiced={};
    state.practicedDate=t;
    saveLocal(); // slice 3.3 (D103): the daily reset is not written to the cloud by itself
  }
}

// Slice 3.6 (D108): the ticks still in state.practiced belong to state.practicedDate. Log that day
// (if it has a tick, is a valid earlier date and is not logged yet); today is never added here.
// Days already logged are never removed or rewritten (D33).
function logPracticedDay(t){
  var d = state.practicedDate;
  var hasPracticed = Object.keys(state.practiced || {}).some(function(k){ return state.practiced[k]; });
  if (!hasPracticed || typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= t) return;
  if (!Array.isArray(state.streakDates)) return;
  if (state.streakDates.indexOf(d) === -1) state.streakDates.push(d);
}

export function totalStreak(){return (state.streakDates||[]).length;}

export function updateStreakStatus(){
  var t = todayISO();
  var hasPracticed = Object.keys(state.practiced).some(function(k){ return state.practiced[k]; });
  var idx = state.streakDates.indexOf(t);
  
  if (hasPracticed && idx === -1) {
    state.streakDates.push(t);
  } else if (!hasPracticed && idx !== -1 && state.practicedDate === t) {
    state.streakDates.splice(idx, 1);
  }
}

export function currentStreak(){
  var dates = state.streakDates.slice().sort().reverse();
  if(dates.length===0) return 0;
  var streak = 0;
  var checkDate = new Date();
  var todayStr = checkDate.toISOString().slice(0,10);
  checkDate.setDate(checkDate.getDate() - 1);
  var yestStr = checkDate.toISOString().slice(0,10);
  
  var dStart = new Date();
  if(dates.indexOf(todayStr) !== -1) {
     streak = 1; 
  } else if(dates.indexOf(yestStr) !== -1) {
     streak = 1;
     dStart.setDate(dStart.getDate() - 1);
  } else {
     return 0;
  }
  
  for(var i=1; i<=1000; i++){
     dStart.setDate(dStart.getDate() - 1);
     var iso = dStart.toISOString().slice(0,10);
     if(dates.indexOf(iso) !== -1) streak++;
     else break;
  }
  return streak;
}
