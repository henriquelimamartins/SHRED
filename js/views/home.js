// HOME view.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, TESTCATS } from "../data/bhgs.js?v=1";
import { state } from "../store.js?v=1";
import { ui } from "../ui.js?v=1";
import { totalStreak, currentStreak } from "../logic/dates.js?v=1";
import { phasePercent } from "../logic/technique.js?v=1";
import { testRow } from "./components.js?v=1";
import { renderStreakCalendar } from "./calendar.js?v=1";

/* ---------- views ---------- */
export function renderHome(){
  var cur=PHASES[state.phaseIndex],pct=phasePercent(state.phaseIndex);
  var req=cur.testReq||null;
  var html='<div class="eyebrow">Daily Practice System</div>';
  
  html+='<div class="statrow"><div class="stat"><div class="bignum">'+pct+'%</div><div class="lbl">'+cur.label+'</div></div>'+
    '<div class="stat"><div class="bignum">\ud83d\udd25'+totalStreak()+'</div><div class="lbl">Days Logged</div></div></div>';
    
  var streakText = currentStreak() === 1 ? "You've practiced 1 day in a row!" : "You've practiced " + currentStreak() + " days in a row!";
  html+='<div class="card"><h3>Consistency Grid <span class="tag">'+streakText+'</span></h3>';
  html+=renderStreakCalendar();
  html+='</div>';

  html+='<div class="card"><h3>\ud83e\uddea Phase Transition Test <span class="tag">1-Minute Workout</span></h3>'+
    (req?'<p style="margin-bottom:12px;">Reach Level '+req+' on all '+TESTCATS.length+' to unlock '+(PHASES[state.phaseIndex+1]?PHASES[state.phaseIndex+1].label:"the next phase")+'.</p>':'<p style="margin-bottom:12px;">Track your baseline here - informational at this stage.</p>')+
    testRow(req)+'</div>';
    
  html+='<button class="navbtn accent" data-action="go" data-view="daily"><div class="ic">\ud83c\udfaf</div><div><b>Daily Practice</b><span>Structured session, any day you pick</span></div></button>';
  html+='<button class="navbtn purple" data-action="go" data-view="improv"><div class="ic">\ud83e\udde0</div><div><b>Improv Masterclass</b><span>The 5 Gates of Freedom</span></div></button>';
  html+='<button class="navbtn" data-action="go" data-view="library"><div class="ic">\ud83d\udcda</div><div><b>Library &amp; Info</b><span>Browse phases & essential skills</span></div></button>';
  html+='<button class="navbtn setupbtn" data-action="go" data-view="setup"><div class="ic">\ud83d\udee0\ufe0f</div><div><b>Setup Companion</b><span>Optimize your gear for shredding</span></div></button>';

  html+='<div class="card"><h3>Jump to phase</h3>';
  if(ui.phaseJumpPending!==null){
    html+='<p style="margin-bottom:12px;color:#ffb3ac;text-align:justify;"><b>Jump back to Phase '+ui.phaseJumpPending+'?</b> This resets Phase '+(ui.phaseJumpPending+1)+' through Phase '+state.phaseIndex+"'s checklist items. Chop-builder and test levels are left as they are.</p>";
    html+='<div style="display:flex;gap:12px;"><button class="tbtn" style="flex:1;" data-action="canceljump">Cancel</button><button class="tbtn danger" style="flex:1;" data-action="confirmjump">Confirm</button></div>';
  } else {
    html+='<p style="text-align:justify;">Advancing happens automatically once every item, chop level and test level in your current phase is done. Jump forward and earlier phases are marked complete too; jump back and later phases reset.</p><select class="select" data-action="setphase">';
    PHASES.forEach(function(p,i){html+='<option value="'+i+'"'+(i===state.phaseIndex?" selected":"")+'>Phase '+i+' - '+p.label+" ("+p.short+')</option>';});
    html+='</select>';
  }
  html+='</div>';

  html+='<div class="card"><h3>Cloud Sync</h3>';
  if(ui.resetConfirm){
    html+='<p style="color:#ffb3ac;text-align:justify;"><b>Delete everything?</b> This wipes every phase, checklist, chop level, test level and streak. This cannot be undone.</p>'+
      '<div style="display:flex;gap:12px;margin-top:14px;"><button class="tbtn" style="flex:1;" data-action="cancelreset">Cancel</button><button class="tbtn danger" style="flex:1;" data-action="confirmreset">Yes, delete everything</button></div>';
  } else {
    html+='<p style="text-align:justify;">Your progress syncs automatically when logged in. You can also manually push a save or pull your latest cloud backup here.</p>'+
      '<div style="display:flex;gap:12px;margin-top:14px;"><button class="tbtn" style="flex:1;" data-action="cloudsave">\u2601\ufe0f Save</button><button class="tbtn" style="flex:1;" data-action="cloudload">\u2601\ufe0f Load</button></div>'+
      '<button class="tbtn danger" style="width:100%;margin-top:12px;" data-action="reset">\u26a0\ufe0f Reset Everything</button>';
  }
  html+='</div>';
  return html;
}
