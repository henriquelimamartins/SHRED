// Technique (BHGS) progress: phase items, phase %, automatic advance, steppers and Jump to phase.
// applyStateChange() is the shared "after a change" step (daily reset, streak, advance, save, render).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, CHOP, TESTCATS, PREREQ } from "../data/bhgs.js?v=1";
import { saveState, state } from "../store.js?v=5";
import { ui, showToast } from "../ui.js?v=1";
import { todayISO, ensureDailyReset, updateStreakStatus } from "./dates.js?v=7";
import { isFullyDoneToday } from "./daily.js?v=9";
import { render } from "../render.js?v=9";

export function k(){return Array.prototype.slice.call(arguments).join(".");}

export function itemKeysForPhase(idx){
  var p=PHASES[idx];
  if(p.kind==="setup"){
    var ks=[]; PREREQ.forEach(function(pr,i){ ks.push(k("p0","pre",i)); });
    return {keys:ks,chopTarget:null,testReq:null};
  }
  var ks3=[];
  (p.concept||[]).forEach(function(_,i){ks3.push(k(p.id,"c",i));});
  p.exercises.forEach(function(_,i){ks3.push(k(p.id,"e",i));});
  p.songs.forEach(function(_,i){ks3.push(k(p.id,"s",i));});
  return {keys:ks3,chopTarget:p.target,testReq:p.testReq};
}
export function phasePercent(idx){
  if(idx<state.phaseIndex) return 100;
  if(idx>state.phaseIndex) return 0;
  var info=itemKeysForPhase(idx);
  var total=info.keys.length+(info.chopTarget?CHOP.length:0)+(info.testReq?TESTCATS.length:0);
  var done=info.keys.filter(function(kk){return !!state.checks[kk];}).length;
  if(info.chopTarget) done+=CHOP.filter(function(c){return state.chop[c.key]>=info.chopTarget;}).length;
  if(info.testReq) done+=TESTCATS.filter(function(c){return state.testLevel[c.key]>=info.testReq;}).length;
  return total?Math.round(done/total*100):0;
}

export function resetPhaseChecks(fromIdx,toIdx){
  for(var i=fromIdx;i<=toIdx;i++){
    var info=itemKeysForPhase(i);
    info.keys.forEach(function(kk){ delete state.checks[kk]; });
  }
}
export function markPhaseComplete(idx){
  var info=itemKeysForPhase(idx);
  info.keys.forEach(function(kk){ state.checks[kk]=true; });
  if(info.chopTarget) CHOP.forEach(function(c){ if((state.chop[c.key]||0)<info.chopTarget) state.chop[c.key]=info.chopTarget; });
  if(info.testReq) TESTCATS.forEach(function(c){ if((state.testLevel[c.key]||0)<info.testReq) state.testLevel[c.key]=info.testReq; });
}

export function applyStateChange(skipAuto){
  ensureDailyReset();
  updateStreakStatus();
  if(!skipAuto){
    var idx=state.phaseIndex;
    if(idx<PHASES.length-1 && phasePercent(idx)===100){ state.phaseIndex=idx+1; showToast("\ud83d\udd25 Phase unlocked: "+PHASES[idx+1].label+"!"); }
  }
  if(isFullyDoneToday() && state.congratsDate!==todayISO()){
    state.congratsDate=todayISO();
    showToast("\ud83e\udd18 Nice work - today's full session is complete!");
  }
  saveState(); render();
}
export function toggleCheck(key){ state.checks[key] = state.checks[key] ? false : todayISO(); applyStateChange(); }
export function setChop(sk,d){ state.chop[sk]=Math.max(0,Math.min(10,(state.chop[sk]||0)+d)); applyStateChange(); }
export function setTest(sk,d){ state.testLevel[sk]=Math.max(0,Math.min(5,(state.testLevel[sk]||0)+d)); applyStateChange(); }
export function setBonusLevel(key,d,max){ state.bonusLevel[key]=Math.max(0,Math.min(max,(state.bonusLevel[key]||0)+d)); applyStateChange(); }

export function handlePhaseSelect(newIdx){
  var oldIdx=state.phaseIndex;
  if(newIdx===oldIdx) return;
  if(newIdx>oldIdx){
    for(var i=oldIdx;i<newIdx;i++) markPhaseComplete(i);
    state.phaseIndex=newIdx;
    applyStateChange(true);
    showToast("Now on "+PHASES[newIdx].label+" - earlier phases marked complete");
  } else {
    ui.phaseJumpPending=newIdx;
    render();
  }
}
export function confirmPhaseJumpBack(){
  var newIdx=ui.phaseJumpPending, oldIdx=state.phaseIndex;
  resetPhaseChecks(newIdx+1,oldIdx);
  state.phaseIndex=newIdx;
  ui.phaseJumpPending=null;
  applyStateChange(true);
  showToast("Now on "+PHASES[newIdx].label+" - later phases reset");
}
export function cancelPhaseJumpBack(){ ui.phaseJumpPending=null; render(); }
