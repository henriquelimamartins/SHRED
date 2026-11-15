// ACCOUNT & DATA page (slice 4.5a, D124; D117 point 2).
// Cloud Sync (Save / Load), Download backup / Restore backup and Reset Everything moved here from HOME unchanged:
// same texts, buttons, restore list, confirmations and data-actions (handled in js/events.js, D105, D106, D110).
// Reached from the desktop sidebar account row and the phone More sheet; it is not one of the 7 destinations (D11).
// Opening this page writes nothing.
import { hasFirebase, currentUser } from "../firebase.js?v=5";
import { ui } from "../ui.js?v=1";
import { listDeviceBackups, formatLocalTime, reasonLabel } from "../logic/backup.js?v=2";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// Slice 3.8 (D110): the restore list and its confirmation (moved unchanged from js/views/home.js).
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
  html+='<p class="u-justify"><b>Restore backup</b> — choose a copy saved on this device (newest first), or a backup file you downloaded.</p>';
  if(!list.length) html+='<p class="u-mt-10">No backups on this device yet.</p>';
  else {
    html+='<div class="u-stack u-mt-12">';
    list.forEach(function(b){
      html+='<button class="tbtn u-w100 u-left" data-action="pickrestore" data-index="'+b.index+'">'+esc(formatLocalTime(b.at))+' · '+esc(reasonLabel(b.reason))+'</button>';
    });
    html+='</div>';
  }
  html+='<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cancelrestore">Cancel</button><button class="tbtn u-flex1" data-action="pickrestorefile">📄 From file…</button></div>';
  return html;
}

// Who is signed in, in plain words. Login / Logout stays in the sidebar account row and the phone top bar.
function accountText(){
  if(!hasFirebase) return 'Cloud sync is not available. Your progress is saved on this device only.';
  var name = (currentUser && currentUser.email) ? currentUser.email.split('@')[0] : '';
  if(currentUser) return 'Signed in as <b>'+esc(name || 'your account')+'</b>.';
  return 'Not signed in. Your progress is saved on this device only. Log in to keep it in your account.';
}

export function renderAccount(){
  var html='<div class="eyebrow">Account &amp; data</div>';
  html+='<div class="card account-card"><h3>Account</h3><p class="u-justify">'+accountText()+'</p></div>';

  // The "Cloud Sync" card, moved unchanged from HOME (slices 3.5, 3.8).
  html+='<div class="card"><h3>Cloud Sync</h3>';
  if(ui.resetConfirm){
    html+='<p class="text-warn u-justify"><b>Reset all progress?</b> This erases Technique, Improv, Theory and Creative progress. Your streak, calendar and SETUP are kept. A backup is saved on this device first.</p>'+
      '<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cancelreset">Cancel</button><button class="tbtn danger u-flex1" data-action="confirmreset">Yes, reset progress</button></div>';
  } else if(ui.restoreOpen || ui.restorePick){
    html+=renderRestore();
  } else {
    html+='<p class="u-justify">Your progress syncs automatically when logged in. You can also manually push a save or pull your latest cloud backup here.</p>'+
      '<div class="u-row u-mt-14"><button class="tbtn u-flex1" data-action="cloudsave">☁️ Save</button><button class="tbtn u-flex1" data-action="cloudload">☁️ Load</button></div>'+
      '<div class="u-row u-mt-12"><button class="tbtn u-flex1" data-action="downloadbackup">⬇️ Download backup</button><button class="tbtn u-flex1" data-action="openrestore">↩️ Restore backup</button></div>'+
      '<button class="tbtn danger u-w100 u-mt-12" data-action="reset">⚠️ Reset Everything</button>';
  }
  html+='</div>';
  return html;
}
