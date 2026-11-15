// App shell pieces drawn on the 4.0 canvas (slice 4.5b, DECISIONS D125, D126; phone bar icon "more" in 4.5b2, D128):
// line icons, the page header, the desktop sidebar menu (headings, values, sub-items), the Today block and
// the account row with the Google account photo and the real sync state. Showing any of these writes nothing.
import { state, newerSchema } from "../store.js?v=5";
import { hasFirebase, currentUser, cloudReady, cloudReadFailed, SYNC_PENDING_KEY } from "../firebase.js?v=5";
import { ui } from "../ui.js?v=1";
import { BHGS_PACK } from "../pack.js?v=1";
import { PHASES } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { activeDay, totalStreak, currentStreak } from "../logic/dates.js?v=7";
import { sessionPlan, isBlockPracticed } from "../logic/daily.js?v=19";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// Line icons (24 x 24, stroke), the same shapes as the canvas components.
const ICONS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  daily: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M8 15l3 3 5-6',
  technique: 'M13 2L4 14h7l-1 8 9-12h-7z',
  improv: 'M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0',
  dojo: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5',
  library: 'M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-1 2.5 15.5-3.5 1z',
  setup: 'M14 6a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3zM14 6l3-3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  flame: 'M12 3c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-7z',
  tick: 'M5 12l5 5 9-10',
  more: 'M5 12h.01M12 12h.01M19 12h.01'
};
export function icon(name, cls){
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICONS[name] + '"></path></svg>';
}

// Page header as drawn: muted eyebrow + large title, optional detail on the right.
export function pageHeader(eyebrow, title, right){
  return '<header class="page-head"><div class="page-head-main"><div class="eyebrow page-eyebrow">' + eyebrow + '</div>' +
    '<h1 class="page-title">' + title + '</h1></div>' + (right ? '<div class="page-head-right">' + right + '</div>' : '') + '</header>';
}

// ---------- sidebar menu ----------

// Minutes of today's session (sum of the blocks that have minutes), e.g. "60m"; empty when none have minutes.
function sessionMinutes(){
  var total = 0;
  sessionPlan(activeDay(), state.phaseIndex).forEach(function(b){ if(b.min) total += b.min; });
  return total ? total + "m" : "";
}
function currentGate(){ return Math.min(state.improvIndex, IMPROV_GATES.length - 1) + 1; }

// Real value shown on the right of a menu item (D126 point 2).
export function navValue(view){
  if(view === "daily") return sessionMinutes();
  if(view === "technique") return "P" + state.phaseIndex;
  if(view === "improv") return "G" + currentGate();
  if(view === "dojo") return "L1";
  return "";
}

// Sub-items of a page: parts that exist on it (D126 point 2). `target` is a CSS selector inside the page.
export const SUB_ITEMS = {
  technique: [ { label: "Roadmap", target: "#panel-technique .page-head" }, { label: "Chop-builders", target: "#panel-technique .tech-sec-chops" }, { label: "Phase test", target: "#panel-technique .tech-sec-test" } ],
  improv: [ { label: "Gates", target: "#panel-improv .gates-title" } ],
  setup: [ { label: "Setup", target: "#panel-setup .page-head" } ]
};

// The menu: Home and Daily, then PILLARS (Technique with the pack, Improvisation, Theory), then RESOURCES (Library, Tools).
export function sidebarMenu(items){
  var firstPillar = BHGS_PACK ? "technique" : "improv";
  return items.map(function(n){
    var on = ui.view === n.view;
    var head = n.view === firstPillar ? "Pillars" : (n.view === "library" ? "Resources" : "");
    var html = head ? '<div class="side-group">' + head + '</div>' : '';
    var val = navValue(n.view);
    html += '<button data-action="go" data-view="' + n.view + '" class="side-item' + (on ? ' active' + (n.cls ? ' ' + n.cls : '') : '') + '">' +
      icon(n.view) + '<span class="side-label">' + n.label + '</span>' + (val ? '<span class="side-val">' + val + '</span>' : '') + '</button>';
    var subs = SUB_ITEMS[n.view];
    if(on && subs){
      var cur = (ui.sub && ui.sub[n.view]) || 0;
      html += '<div class="side-subs">' + subs.map(function(s, i){
        return '<button data-action="subnav" data-subview="' + n.view + '" data-index="' + i + '" class="side-sub' + (i === cur ? ' on' : '') + '">' + s.label + '</button>';
      }).join("") + '</div>';
    }
    return html;
  }).join("");
}

// ---------- Today block (read-only; DAILY stays the only place to tick, D124, D126) ----------

export function todayBlock(){
  var day = activeDay();
  var plan = sessionPlan(day, state.phaseIndex);
  var done = plan.filter(function(b){ return isBlockPracticed(b.name, day); }).length;
  var html = '<button class="side-today" data-action="go" data-view="daily" aria-label="Today\'s session, open DAILY">';
  html += '<span class="side-today-head"><span class="side-today-title">Today · ' + esc(DAY_FULL[day].slice(0, 3)) + '</span><span class="side-today-count">' + done + ' of ' + plan.length + '</span></span>';
  plan.forEach(function(b){
    var on = isBlockPracticed(b.name, day);
    html += '<span class="side-today-row' + (on ? ' done' : '') + '" data-block="' + b.name + '"><span class="side-box' + (on ? ' on' : '') + '">' + (on ? icon("tick") : '') + '</span>' +
      '<span class="side-today-label">' + esc(b.title) + '</span>' + (b.min ? '<span class="side-today-min">' + b.min + '′</span>' : '') + '</span>';
  });
  var streak = currentStreak();
  html += '<span class="side-today-streak">' + icon("flame") + streak + '-day streak · ' + totalStreak() + ' days logged</span>';
  html += '</button>';
  return html;
}

// ---------- account: photo, name, sync state (D126 points 3 and 5) ----------

export function accountName(full){
  if(!currentUser) return hasFirebase ? "Not signed in" : "This device";
  var dn = (currentUser.displayName || "").trim();
  if(dn) return full ? dn : dn.split(/\s+/)[0];
  return currentUser.email ? currentUser.email.split("@")[0] : "Signed in";
}

// The account photo, or the initial, or a person icon when signed out. A photo that failed once is not retried.
export function avatar(size){
  var cls = 'avatar avatar-' + (size || 'sm');
  if(!currentUser) return '<span class="' + cls + ' avatar-none">' + icon("person") + '</span>';
  var url = currentUser.photoURL || "";
  var initial = esc(accountName(true).charAt(0).toUpperCase() || "?");
  if(url && /^https:\/\//.test(url) && ui.avatarFailed !== url){
    return '<span class="' + cls + '"><img class="avatar-img" src="' + esc(url) + '" alt="" referrerpolicy="no-referrer" data-initial="' + initial + '"></span>';
  }
  return '<span class="' + cls + ' avatar-initial">' + initial + '</span>';
}

function pendingForUser(){
  try{
    var p = JSON.parse(localStorage.getItem(SYNC_PENDING_KEY) || "null");
    return !!(p && currentUser && p.uid === currentUser.uid);
  }catch(e){ return false; }
}

// The real sync state in plain words, with a tone for the dot: ok (green), wait (amber), none (grey).
export function syncState(){
  if(!hasFirebase || !currentUser) return { text: "Saved on this device only", tone: "none" };
  if(newerSchema) return { text: "Newer app version · not syncing", tone: "wait" };
  if(cloudReadFailed) return { text: "Cloud unreachable · saved on this device", tone: "wait" };
  if(!cloudReady) return { text: "Loading cloud progress…", tone: "none" };
  if(typeof navigator !== "undefined" && navigator.onLine === false) return { text: "Offline · saved on this device", tone: "wait" };
  if(pendingForUser()) return { text: "Changes not synced yet", tone: "wait" };
  return { text: "Synced", tone: "ok" };
}

export function accountRow(){
  var s = syncState();
  return '<button class="side-acct' + (ui.view === "account" ? ' active' : '') + '" data-action="go" data-view="account" aria-label="Account and data">' +
    avatar("sm") +
    '<span class="side-acct-text"><span class="side-acct-name">' + esc(accountName(false)) + '</span>' +
    '<span class="side-acct-status"><i class="sync-dot ' + s.tone + '"></i><span class="sync-text">' + s.text + '</span></span></span>' +
    '<span class="side-acct-arrow" aria-hidden="true">›</span></button>';
}
