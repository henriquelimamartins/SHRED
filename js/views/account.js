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
// Slice 4.10i (D163; D152 points 15, 18, 23): eyebrow SETTINGS and first group PROFILE; signed in, the PROFILE card is
// one button that opens the profile panel (desktop dialog, phone sheet from the bottom), where Logout now lives;
// signed out the card keeps Login. The panel shows the photo in the sync-state ring, name, email, "Signed in with
// Google", the sync state, four boxes from `streakDates` and the three rails without a percentage. Page state only
// (`ui.profileOpen`); nothing is written. Buttons end without punctuation ("Restore", "Reset", "From file").
import { hasFirebase, currentUser } from "../firebase.js?v=5";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=2";
import { listDeviceBackups, formatLocalTime, reasonLabel } from "../logic/backup.js?v=2";
import { pageHeader, avatar, accountName, syncState, backToMore } from "./shell.js?v=21";
import { totalStreak, currentStreak, localISO } from "../logic/dates.js?v=7";
import { renderRail, techniqueRail, improvRail, theoryRail } from "./rails.js?v=23";
import { phaseSummary } from "./technique.js?v=24";
import { PHASES } from "../data/bhgs.js?v=1";
import { BHGS_PACK } from "../pack.js?v=1";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// Line icons drawn on the 4.6 boards (24 px grid, stroke 1.8).
var ACCT_ICONS = {
  upload: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5M12 20v-8M9 14.5l3-3 3 3',
  cloudload: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5M12 12v8M9 17.5l3 3 3-3',
  download: 'M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14',
  restore: 'M4 12a8 8 0 1 0 2.5-5.8M4 5v4h4M12 8v4.5l3 2',
  sound: 'M4 10v4h3l5 4V6l-5 4zM16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10',
  warn: 'M12 4l9 16H3zM12 10v4.5M12 17.5v.5',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4',
  chevron: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  google: 'M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.5v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.2zM12 20c2.3 0 4.2-.8 5.5-2.1l-2.7-2.1c-.7.5-1.7.8-2.8.8a4.9 4.9 0 0 1-4.6-3.4H4.6v2.1A8 8 0 0 0 12 20z'
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
  html+='<div class="acct-actions"><button type="button" class="acct-btn" data-action="cancelrestore">Cancel</button><button type="button" class="acct-btn" data-action="pickrestorefile">'+acctIcon('file','acct-btn-ic')+'From file</button></div>';
  return html;
}

// Slice 4.10i (D163 points 2 and 3): who is signed in. Signed in, the whole card is one button that opens the profile
// panel (Logout lives there); signed out the card keeps Login (no panel without an account); without Firebase,
// "This device" with no button. The photo sits in a ring in the sync-state colour (D157 point 5).
function ring(size, tone){
  return '<span class="avatar-ring ring-' + size + ' ' + tone + '" data-tone="' + tone + '">' + avatar(size) + '</span>';
}
function accountCard(){
  if(!hasFirebase){
    return '<div class="account-card acct-card"><div class="account-id">'+avatar("lg")+'<div class="account-who">'+
      '<div class="account-name">This device</div><p class="account-note">Cloud sync is not available. Your progress is saved on this device only.</p></div></div></div>';
  }
  if(!currentUser){
    return '<div class="account-card acct-card"><div class="account-id">'+avatar("lg")+'<div class="account-who">'+
      '<div class="account-name">Not signed in</div><p class="account-note">Not signed in. Your progress is saved on this device only. Log in to keep it in your account.</p></div>'+
      '<button type="button" class="acct-btn account-auth">Login</button></div></div>';
  }
  var s=syncState();
  return '<button type="button" class="account-card acct-card profile-card" data-action="profile" aria-haspopup="dialog" aria-expanded="'+!!ui.profileOpen+'">'+
    '<span class="account-id">'+ring("lg", s.tone)+'<span class="account-who">'+
    '<span class="account-name">'+esc(accountName(true))+'</span>'+(currentUser.email?'<span class="account-email">'+esc(currentUser.email)+'</span>':'')+
    '<span class="account-sync"><i class="sync-dot '+s.tone+'"></i>'+s.text+'</span></span>'+
    '<span class="profile-card-more"><span class="profile-card-more-text">View profile</span>'+acctIcon('chevron','profile-card-ic')+'</span></span></button>';
}

// ---------- profile panel (slice 4.10i, D163 point 4) ----------

var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function loggedDays(){
  var seen = {};
  (state.streakDates || []).forEach(function(d){ if(typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) seen[d] = true; });
  return Object.keys(seen).sort();
}
// The longest run of consecutive local calendar days in `streakDates` (D71: real values only).
export function longestStreak(days){
  var best = 0, run = 0, prev = null;
  days.forEach(function(d){
    var next = null;
    if(prev){ var q = prev.split("-"); next = localISO(new Date(+q[0], +q[1] - 1, +q[2] + 1)); }
    run = (prev && d === next) ? run + 1 : 1;
    if(run > best) best = run;
    prev = d;
  });
  return best;
}
function daysText(n){ return n + (n === 1 ? " day" : " days"); }
function stat(label, value, sub){
  return '<div class="profile-stat"><span class="profile-stat-label">' + label + '</span><span class="profile-stat-val">' + value + '</span>' +
    (sub ? '<span class="profile-stat-sub">' + sub + '</span>' : '') + '</div>';
}
// The three rails with their values and no percentage (D163 point 4, as D152 point 2).
function profileRails(){
  var html = '';
  if(BHGS_PACK){
    var t = techniqueRail(), i = Math.min(state.phaseIndex, PHASES.length - 1), sum = phaseSummary(i);
    t.status = sum.done + ' of ' + sum.total + ' done';
    html += '<div class="profile-rail">' + renderRail(t) + '</div>';
  }
  var m = improvRail();
  if(m.status !== "Complete"){ var p = m.status.split("/"); m.status = p[0] + ' of ' + p[1] + ' mastered'; }
  html += '<div class="profile-rail">' + renderRail(m) + '</div>';
  html += '<div class="profile-rail">' + renderRail(theoryRail()) + '</div>';
  return html;
}
export function renderProfilePanel(){
  var s = syncState(), days = loggedDays();
  var since = days.length ? (function(p){ return MONTHS[+p[1] - 1] + ' ' + p[0]; })(days[0].split("-")) : "Not yet";
  var html = '<div class="profile-backdrop" data-action="closeprofile"></div>' +
    '<div class="profile-dialog' + (ui.profileAnim ? ' is-entering' : '') + '" id="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">' +
    '<div class="profile-head"><h2 class="profile-title" id="profile-title">Profile</h2>' +
    '<button type="button" class="profile-close" data-action="closeprofile" aria-label="Close profile">' + acctIcon('close', 'profile-close-ic') + '</button></div>' +
    '<div class="profile-id">' + ring("xl", s.tone) +
    '<div class="profile-name">' + esc(accountName(true)) + '</div>' +
    (currentUser && currentUser.email ? '<div class="profile-email">' + esc(currentUser.email) + '</div>' : '') +
    '<div class="profile-meta"><span class="profile-google">' + acctIcon('google', 'profile-meta-ic') + 'Signed in with Google</span>' +
    '<span class="profile-sync"><i class="sync-dot ' + s.tone + '"></i>' + s.text + '</span></div></div>' +
    '<div class="profile-stats">' +
      stat('Practising since', since, days.length ? 'first logged day' : '') +
      stat('Days logged', String(totalStreak())) +
      stat('Current streak', daysText(currentStreak())) +
      stat('Longest streak', daysText(longestStreak(days))) +
    '</div>' +
    '<h3 class="profile-subhead">Pillars</h3><div class="profile-rails">' + profileRails() + '</div>' +
    '<button type="button" class="profile-logout account-auth">' + acctIcon('logout', 'profile-logout-ic') + 'Logout</button>' +
    '</div>';
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
      control: btn('openrestore', 'Restore', ' aria-describedby="acct-s-restore" aria-expanded="' + open + '"' + (open ? ' aria-controls="acct-panel-restore"' : '')),
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
      control: btn('reset', 'Reset', ' aria-describedby="acct-s-reset" aria-expanded="' + !!ui.resetConfirm + '"' + (ui.resetConfirm ? ' aria-controls="acct-panel-reset"' : '')),
      panel: panel }) +
    '</div>');
}

export function renderAccount(){
  var html=backToMore()+pageHeader('Settings','Account &amp; data');
  html+='<div class="acct-cols"><div class="acct-col">'+
    group('profile', 'Profile', accountCard())+
    (hasFirebase ? cloudGroup() : '')+
    backupsGroup()+
    '</div><div class="acct-col">'+
    settingsGroup()+
    resetGroup()+
    '</div></div>';
  return html;
}
