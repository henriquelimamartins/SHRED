// HOME view.
// Slice 3.5 (D106): Reset Everything confirmation text says what is erased and what is kept.
// Slice 3.8 (D110): Download backup / Restore backup in the "Cloud Sync" card (list + confirmation).
// Slice 4.2b (D113): with the BHGS pack off, the phase bar, phase %, Phase Transition Test and Jump to phase are hidden.
// Slice 4.2a (D119, D25): the Technique phase bar sits at the top of HOME instead of the top of every page.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, TESTCATS } from "../data/bhgs.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { BHGS_PACK } from "../pack.js?v=1";
import { totalStreak, currentStreak } from "../logic/dates.js?v=7";
import { phasePercent } from "../logic/technique.js?v=13";
import { testRow, progressBar } from "./components.js?v=13";
import { renderStreakCalendar } from "./calendar.js?v=13";
import { listDeviceBackups, formatLocalTime, reasonLabel } from "../logic/backup.js?v=1";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// Slice 3.8 (D110): the restore list and its confirmation.
function renderRestore(){
  var html='';
  if(ui.restorePick){
    var p=ui.restorePick;
    var when=p.at?formatLocalTime(p.at):"the file";
    html+='<p class="text-warn u-justify"><b>Restore progress from '+esc(when)+'?</b> ('+esc(p.label)+') Your current progress is replaced by this copy. Streak and calendar days from both are kept, and so is today\'s DAILY session. A backup of your current progress is saved on this device first.</p>'+
      '<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cancelrestore">Cancel</button><button class="tbtn danger u-flex1" data-action="confirmrestore">Yes, restore</button></div>';
    return html;
  }
  var list=listDeviceBackups();
  html+='<p class="u-justify"><b>Restore backup</b> \u2014 choose a copy saved on this device (newest first), or a backup file you downloaded.</p>';
  if(!list.length) html+='<p class="u-mt-10">No backups on this device yet.</p>';
  else {
    html+='<div class="u-stack u-mt-12">';
    list.forEach(function(b){
      html+='<button class="tbtn u-w100 u-left" data-action="pickrestore" data-index="'+b.index+'">'+esc(formatLocalTime(b.at))+' \u00b7 '+esc(reasonLabel(b.reason))+'</button>';
    });
    html+='</div>';
  }
  html+='<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cancelrestore">Cancel</button><button class="tbtn u-flex1" data-action="pickrestorefile">\ud83d\udcc4 From file\u2026</button></div>';
  return html;
}

/* ---------- views ---------- */
export function renderHome(){
  var cur=PHASES[state.phaseIndex],pct=phasePercent(state.phaseIndex);
  var req=cur.testReq||null;
  var html=BHGS_PACK?'<div class="home-phasebar">'+progressBar()+'</div>':'';
  html+='<div class="eyebrow">Daily Practice System</div>';
  
  html+='<div class="statrow">'+(BHGS_PACK?'<div class="stat"><div class="bignum">'+pct+'%</div><div class="lbl">'+cur.label+'</div></div>':'')+
    '<div class="stat"><div class="bignum">\ud83d\udd25'+totalStreak()+'</div><div class="lbl">Days Logged</div></div></div>';
    
  var streakText = currentStreak() === 1 ? "You've practiced 1 day in a row!" : "You've practiced " + currentStreak() + " days in a row!";
  html+='<div class="card"><h3>Consistency Grid <span class="tag">'+streakText+'</span></h3>';
  html+=renderStreakCalendar();
  html+='</div>';

  if(BHGS_PACK) html+='<div class="card"><h3>\ud83e\uddea Phase Transition Test <span class="tag">1-Minute Workout</span></h3>'+
    (req?'<p class="u-mb-12">Reach Level '+req+' on all '+TESTCATS.length+' to unlock '+(PHASES[state.phaseIndex+1]?PHASES[state.phaseIndex+1].label:"the next phase")+'.</p>':'<p class="u-mb-12">Track your baseline here - informational at this stage.</p>')+
    testRow(req)+'</div>';
    
  html+='<button class="navbtn accent" data-action="go" data-view="daily"><div class="ic">\ud83c\udfaf</div><div><b>Daily Practice</b><span>Structured session, any day you pick</span></div></button>';
  html+='<button class="navbtn purple" data-action="go" data-view="improv"><div class="ic">\ud83e\udde0</div><div><b>Improv Masterclass</b><span>The 5 Gates of Freedom</span></div></button>';
  html+='<button class="navbtn" data-action="go" data-view="library"><div class="ic">\ud83d\udcda</div><div><b>Library &amp; Info</b><span>'+(BHGS_PACK?'Browse phases & essential skills':'Expression Track, Listening Vault & guide')+'</span></div></button>';
  html+='<button class="navbtn setupbtn" data-action="go" data-view="setup"><div class="ic">\ud83d\udee0\ufe0f</div><div><b>Setup Companion</b><span>Optimize your gear for shredding</span></div></button>';

  if(BHGS_PACK){
  html+='<div class="card"><h3>Jump to phase</h3>';
  if(ui.phaseJumpPending!==null){
    html+='<p class="text-warn u-justify u-mb-12"><b>Jump back to Phase '+ui.phaseJumpPending+'?</b> This resets Phase '+(ui.phaseJumpPending+1)+' through Phase '+state.phaseIndex+"'s checklist items. Chop-builder and test levels are left as they are.</p>";
    html+='<div class="u-row"><button class="tbtn u-flex1" data-action="canceljump">Cancel</button><button class="tbtn danger u-flex1" data-action="confirmjump">Confirm</button></div>';
  } else {
    html+='<p class="u-justify">Advancing happens automatically once every item, chop level and test level in your current phase is done. Jump forward and earlier phases are marked complete too; jump back and later phases reset.</p><select class="select" data-action="setphase">';
    PHASES.forEach(function(p,i){html+='<option value="'+i+'"'+(i===state.phaseIndex?" selected":"")+'>Phase '+i+' - '+p.label+" ("+p.short+')</option>';});
    html+='</select>';
  }
  html+='</div>';
  }

  html+='<div class="card"><h3>Cloud Sync</h3>';
  if(ui.resetConfirm){
    html+='<p class="text-warn u-justify"><b>Reset all progress?</b> This erases Technique, Improv, Theory and Creative progress. Your streak, calendar and SETUP are kept. A backup is saved on this device first.</p>'+
      '<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cancelreset">Cancel</button><button class="tbtn danger u-flex1" data-action="confirmreset">Yes, reset progress</button></div>';
  } else if(ui.restoreOpen || ui.restorePick){
    html+=renderRestore();
  } else {
    html+='<p class="u-justify">Your progress syncs automatically when logged in. You can also manually push a save or pull your latest cloud backup here.</p>'+
      '<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cloudsave">\u2601\ufe0f Save</button><button class="tbtn u-flex1" data-action="cloudload">\u2601\ufe0f Load</button></div>'+
      '<div class="u-row u-mt-12"><button class="tbtn u-flex1" data-action="downloadbackup">\u2b07\ufe0f Download backup</button><button class="tbtn u-flex1" data-action="openrestore">\u21a9\ufe0f Restore backup</button></div>'+
      '<button class="tbtn danger u-w100 u-mt-12" data-action="reset">\u26a0\ufe0f Reset Everything</button>';
  }
  html+='</div>';
  return html;
}
