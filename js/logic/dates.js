// Dates, daily reset and streak.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { DAYS } from "../data/days.js?v=1";
import { saveState, state } from "../store.js?v=1";

export function todayISO(){return new Date().toISOString().slice(0,10);}
export function todayName(){return DAYS[new Date().getDay()];}
export function isWeekendDay(d){return d==="Sat"||d==="Sun";}
export function activeDay(){ if(state.activeDayOverride && state.activeDayDate===todayISO()) return state.activeDayOverride; return todayName(); }

export function ensureDailyReset(){
  var t=todayISO();
  if(state.practicedDate!==t){
    updateStreakStatus();
    state.practiced={};
    state.practicedDate=t;
    saveState();
  }
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
