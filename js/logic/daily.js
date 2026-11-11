// DAILY session blocks (Practiced boxes) and the active session day.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES } from "../data/bhgs.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { saveState, state } from "../store.js?v=2";
import { showToast } from "../ui.js?v=1";
import { todayISO, isWeekendDay, activeDay, ensureDailyReset } from "./dates.js?v=2";
import { applyStateChange } from "./technique.js?v=3";
import { render } from "../render.js?v=3";

export function blockPKey(name,day){ return name+"."+day; }
export function isBlockPracticed(name,day){ return !!state.practiced[blockPKey(name,day)]; }
export function toggleBlockPracticed(name,day){ ensureDailyReset(); var kk=blockPKey(name,day); state.practiced[kk]=!state.practiced[kk]; applyStateChange(); }
export function dailyBlocksStatus(day,idx){
  var p=PHASES[idx],st={};
  if(p.kind==="setup"){ st.prereq=isBlockPracticed("prereq",day); st.warmup=isBlockPracticed("warmup",day); return st; }
  st.warmup=isBlockPracticed("warmup",day);
  if(isWeekendDay(day)){ st.casual=isBlockPracticed("casual",day); return st; }
  st.focused=isBlockPracticed("focused",day);
  st.casual=isBlockPracticed("casual",day);
  st.cooldown=isBlockPracticed("cooldown",day);
  return st;
}
export function isFullyDoneToday(){
  var st=dailyBlocksStatus(activeDay(),state.phaseIndex);
  var keys=Object.keys(st);
  return keys.length>0 && keys.every(function(kk){return st[kk];});
}

export function setActiveDay(d){ state.activeDayOverride=d; state.activeDayDate=todayISO(); saveState(); render(); showToast(DAY_FULL[d]+" is now your active session"); }
export function resetActiveDay(){ state.activeDayOverride=null; saveState(); render(); }
