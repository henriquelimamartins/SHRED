// ACCOUNT & DATA page (slice 4.5a, D124; D117 point 2).
// Cloud Sync (Save / Load), Download backup / Restore backup and Reset Everything moved here from HOME unchanged:
// same texts, buttons, restore list, confirmations and data-actions (handled in js/events.js, D105, D106, D110).
// Reached from the desktop sidebar account row and the phone MORE page; it is not one of the 7 destinations (D11).
// Opening this page writes nothing.
// Slice 4.5b (D125 point 4, D126): drawn page header; the Account card shows the Google account photo (or initial),
// name, email, the real sync state and Login / Logout (moved here from the sidebar; same sign-in code).
// Slice 4.8e (D149): the page as drawn on the 4.6 boards: groups ACCOUNT, CLOUD SYNC, BACKUPS, SETTINGS, RESET;
// each action is a row (line icon, name, one-line description, button on the right); Restore and Reset open in
// place under their row. The data-actions, messages, confirmations and warning texts are the same as before.
// Settings holds only what exists: Sound (the same `dojo.audioMuted` switch that was on THEORY until 4.8d).
// Without Firebase the Cloud sync group is left out; signed out it stays (its buttons explain that login is needed).
import { hasFirebase, currentUser } from "../firebase.js?v=5";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=2";
import { listDeviceBackups, formatLocalTime, reasonLabel } from "../logic/backup.js?v=2";
import { pageHeader, avatar, accountName, syncState, backToMore } from "./shell.js?v=19";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// Line icons drawn on the 4.6 boards (24 px grid, stroke 1.8).
var ACCT_ICONS = {
  upload: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5M12 20v-8M9 14.5l3-3 3 3',
  cloudload: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5M12 12v8M9 17.5l3 3 3-3',
  download: 'M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14',
  restore: 'M4 12a8 8 0 1 0 2.5-5.8M4 5v4h4M12 8v4.5l3 2',
  sound: 'M4 10v4h3l5 4V6l-5 4zM16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10',
  warn: 'M12 4l9 16H3zM12 10v4.5M12 17.5v.5',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4'
};
function acctIcon(name, cls){
  return '<svg class="ico ' + (cls || 'acct-row-ic') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ACCT_ICONS[name] + '"></path></svg>';
}

function group(id, title, body){
  return '<section class="acct-group" data-group="' + id + '" aria-labelledby="acct-h-' + id + '"><h2 class="acct-group-title" id="acct-h-' + id + '">' + title + '</h2>' + body + '</section>';
}

// One row: icon, name + description, the control on the right; an optional panel opens under it.
function row(o){
  return '<div class="acct-row' + (o.panel ? ' is-open' : '') + '" data-row="' + o.id + '">' + acctIcon(o.icon) +
    '<span class="acct-row-text"><span class="acct-row-name" id="acct-n-' + o.id + '">' + o.name + '</span>' +
    '<span class="acct-row-sub" id="acct-s-' + o.id + '">' + o.sub + '</span></span>' + o.control + '</div>' +
    (o.panel ? '<div class="acct-panel" id="acct-panel-' + o.id + '">' + o.panel + '</div>' : '');
}
function btn(action, label, extra){
  return '<button type="button" class="acct-btn" data-action="' + action + '"' + (extra || '') + '>' + label + '</button>';
}
// While a restore or reset confirmation waits for an answer, Save, Load and Download are disabled (as before 4.8e,
// when the confirmation replaced those buttons), so nothing changes the progress underneath the question.
function pending(){ return !!(ui.restorePick || ui.resetConfirm); }
function off(){ return pending() ? ' disabled' : ''; }

// Slice 3.8 (D110): the restore list and its confirmation (texts and actions as before; 4.8e: no emoji).
function renderRestore(){
  var html='';
  if(ui.restorePick){
    var p=ui.restorePick;
    var when=p.at?formatLocalTime(p.at):"the file";
    html+='<p class="text-warn acct-warn"><b>Restore progress from '+esc(when)+'?</b> ('+esc(p.label)+') Your current progress is replaced by this copy. Streak and calendar days from both are kept, and so is today\'s DAILY session. A backup of your current progress is saved on this device first.</p>'+
      '<div class="acct-actions"><button type="button" class="acct-btn" data-action="cancelrestore">Cancel</button><button type="button" class="acct-btn danger" data-action="confirmrestore">Yes, restore</button></div>';
    return html;
  }
  var list=listDeviceBackups();
  html+='<p class="acct-panel-text">Choose a copy saved on this device (newest first), or a backup file you downloaded.</p>';
  if(!list.length) html+='<p class="acct-panel-text acct-empty">No backups on this device yet.</p>';
  else {
    html+='<div class="acct-copies">';
    list.forEach(function(b){
      html+='<button type="button" class="acct-copy" data-action="pickrestore" data-index="'+b.index+'">'+esc(formatLocalTime(b.at))+' · '+esc(reasonLabel(b.reason))+'</button>';
    });
    html+='</div>';
  }
  html+='<div class="acct-actions"><button type="button" class="acct-btn" data-action="cancelrestore">Cancel</button><button type="button" class="acct-btn" data-action="pickrestorefile">'+acctIcon('file','acct-btn-ic')+'From file…</button></div>';
  return html;
}

// Who is signed in, in plain words, with Login / Logout (D125 point 4).
function accountCard(){
  var html='<div class="account-card acct-card"><div class="account-id">'+avatar("lg")+'<div class="account-who">';
  if(!hasFirebase){
    html+='<div class="account-name">This device</div><p class="account-note">Cloud sync is not available. Your progress is saved on this device only.</p></div></div>';
    return html+'</div>';
  }
  if(currentUser){
    var s=syncState();
    html+='<div class="account-name">'+esc(accountName(true))+'</div>'+(currentUser.email?'<div class="account-email">'+esc(currentUser.email)+'</div>':'')+
      '<div class="account-sync"><i class="sync-dot '+s.tone+'"></i>'+s.text+'</div>';
  } else {
    html+='<div class="account-name">Not signed in</div><p class="account-note">Not signed in. Your progress is saved on this device only. Log in to keep it in your account.</p>';
  }
  html+='</div><button type="button" class="acct-btn account-auth">'+(currentUser?"Logout":"Login")+'</button></div></div>';
  return html;
}

function cloudGroup(){
  return group('cloud', 'Cloud sync', '<div class="acct-card acct-list">' +
    row({ id: 'save', icon: 'upload', name: 'Save to cloud', sub: 'Your progress syncs automatically when logged in. Push a save by hand.', control: btn('cloudsave', 'Save', ' aria-describedby="acct-s-save"' + off()) }) +
    row({ id: 'load', icon: 'cloudload', name: 'Load from cloud', sub: 'Pull your latest cloud progress. A backup is saved on this device first.', control: btn('cloudload', 'Load', ' aria-describedby="acct-s-load"' + off()) }) +
    '</div>');
}

function backupsGroup(){
  var open = !!(ui.restoreOpen || ui.restorePick) && !ui.resetConfirm; // never two panels at once
  return group('backups', 'Backups', '<div class="acct-card acct-list">' +
    row({ id: 'download', icon: 'download', name: 'Download backup', sub: 'Save a copy of your progress as a file.', control: btn('downloadbackup', 'Download', ' aria-describedby="acct-s-download"' + off()) }) +
    row({ id: 'restore', icon: 'restore', name: 'Restore backup', sub: 'From a copy on this device or from a file.',
      control: btn('openrestore', 'Restore…', ' aria-describedby="acct-s-restore" aria-expanded="' + open + '"' + (open ? ' aria-controls="acct-panel-restore"' : '')),
      panel: open ? renderRestore() : '' }) +
    '</div>');
}

// Settings: only what exists (D132 point 7, D149 point 4). Sound = the switch that was on THEORY (`dojo.audioMuted`).
function settingsGroup(){
  var on = !state.dojo.audioMuted;
  var sw = '<button type="button" class="acct-switch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" aria-labelledby="acct-n-sound" aria-describedby="acct-s-sound" data-action="togglemute"><span class="acct-switch-track"><span class="acct-switch-knob"></span></span></button>';
  return group('settings', 'Settings', '<div class="acct-card acct-list">' +
    row({ id: 'sound', icon: 'sound', name: 'Sound', sub: 'Exercises that need sound are marked. When it is off, the app asks before one starts.', control: sw }) +
    '</div>');
}

function resetGroup(){
  var panel = '';
  if(ui.resetConfirm){
    panel = '<p class="text-warn acct-warn"><b>Reset all progress?</b> This erases Technique, Improv, Theory and Creative progress. Your streak, calendar and SETUP are kept. A backup is saved on this device first.</p>'+
      '<div class="acct-actions"><button type="button" class="acct-btn" data-action="cancelreset">Cancel</button><button type="button" class="acct-btn danger" data-action="confirmreset">Yes, reset progress</button></div>';
  }
  return group('reset', 'Reset', '<div class="acct-list acct-danger">' +
    row({ id: 'reset', icon: 'warn', name: 'Reset progress', sub: 'Erases Technique, Improv, Theory and Creative progress. Your streak, calendar and SETUP are kept. A backup is saved on this device first.',
      control: btn('reset', 'Reset…', ' aria-describedby="acct-s-reset" aria-expanded="' + !!ui.resetConfirm + '"' + (ui.resetConfirm ? ' aria-controls="acct-panel-reset"' : '')),
      panel: panel }) +
    '</div>');
}

export function renderAccount(){
  var html=backToMore()+pageHeader('Account','Account &amp; data');
  html+='<div class="acct-cols"><div class="acct-col">'+
    group('account', 'Account', accountCard())+
    (hasFirebase ? cloudGroup() : '')+
    backupsGroup()+
    '</div><div class="acct-col">'+
    settingsGroup()+
    resetGroup()+
    '</div></div>';
  return html;
}
