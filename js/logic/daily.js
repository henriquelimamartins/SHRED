// DAILY session blocks (Practiced boxes) and the active session day.
// Slice 4.5b (D126): sessionPlan() lists a day's blocks with the titles and minutes DAILY shows, for the read-only
// Today block in the sidebar (a test checks it matches the DAILY page for every day).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES } from "../data/bhgs.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { saveState, state } from "../store.js?v=5";
import { showToast } from "../ui.js?v=2";
import { todayISO, isWeekendDay, activeDay, ensureDailyReset } from "./dates.js?v=7";
import { applyStateChange } from "./technique.js?v=37";
import { render } from "../render.js?v=37";

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
export function sessionPlan(day,idx){
  var p=PHASES[idx];
  if(p.kind==="setup") return [{name:"prereq",title:"Prerequisites",min:0},{name:"warmup",title:"Warm-Up",min:0}];
  if(isWeekendDay(day)) return [{name:"warmup",title:"Warm-Up",min:15},{name:"casual",title:day==="Sat"?"Casual":"Improv & Expression",min:45}];
  return [
    {name:"warmup",title:"Warm-Up",min:5},
    {name:"focused",title:"Focused",min:35},
    {name:"casual",title:(day==="Mon"||day==="Thu")?"Casual":"Improv & Expression",min:15},
    {name:"cooldown",title:"Cool-Down",min:5}
  ];
}
export function isFullyDoneToday(){
  var st=dailyBlocksStatus(activeDay(),state.phaseIndex);
  var keys=Object.keys(st);
  return keys.length>0 && keys.every(function(kk){return st[kk];});
}

export function setActiveDay(d){ state.activeDayOverride=d; state.activeDayDate=todayISO(); saveState(); render(); showToast(DAY_FULL[d]+" is now your active session"); }
export function resetActiveDay(){ state.activeDayOverride=null; saveState(); render(); }
