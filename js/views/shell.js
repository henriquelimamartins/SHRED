// App shell pieces drawn on the 4.0 canvas (slice 4.5b, DECISIONS D125, D126; phone bar icon "more" in 4.5b2, D128):
// line icons, the page header, the desktop sidebar menu (headings, values) and the account row with the Google
// account photo and the real sync state. Showing any of these writes nothing.
// Slice 4.10d (D152 points 1, 3, 4, 8; D154 point 1): the sidebar logo (ridge mark + wordmark), thin lines between
// the menu groups, no sub-items (the menu never changes height), no Today block, a ring round the photo in the
// colour of the sync state.
import { state, newerSchema } from "../store.js?v=5";
import { hasFirebase, currentUser, cloudReady, cloudReadFailed, SYNC_PENDING_KEY } from "../firebase.js?v=5";
import { ui } from "../ui.js?v=2";
import { BHGS_PACK } from "../pack.js?v=1";
import { PHASES } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { activeDay } from "../logic/dates.js?v=7";
import { sessionPlan } from "../logic/daily.js?v=39";

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

// Sidebar logo (D152 point 1, D154 point 1): the ridge mark (sun and one open ridge line, no tile, no outline) on the
// left of the wordmark. "ROADMAP" uses the font, weight and letter-spacing of "THE SHRED", only larger, so both lines
// are the same width. Sizes from the 4.10 canvas: the top of the sun sits on the cap top of THE SHRED and the bottom
// of the ridge line on the baseline of ROADMAP. The mark is decoration; the words name the app.
// Slice 4.10j (D164 point 2): the phone HOME header uses the same logo, smaller (`cls` = "home-logo").
export function sidebarLogo(cls){
  return '<div class="side-logo' + (cls ? ' ' + cls : '') + '"><svg class="side-logo-mark" viewBox="0 0 205 204.83" aria-hidden="true" focusable="false">' +
    '<circle class="logo-sun" cx="110.5" cy="68.2" r="58"></circle>' +
    '<path class="logo-ground" d="M3.5 200.4 L56 118.4 L86 150.4 L118 94.4 L156 146.4 L176 130.4 L201.5 200.4 Z"></path>' +
    '<path class="logo-ridge" d="M3.5 200.4 L56 118.4 L86 150.4 L118 94.4 L156 146.4 L176 130.4 L201.5 200.4"></path></svg>' +
    '<div class="side-logo-words"><span class="side-logo-top">THE <span class="side-logo-red">SHRED</span></span>' +
    '<span class="side-logo-bottom">ROADMAP</span></div></div>';
}

// Phone only (CSS): "‹ More" back to MORE, for pages reached from MORE (LIBRARY with the BHGS pack, TOOLS).
// Slice 4.8a drew it in LIBRARY; 4.8b moved it here so TOOLS uses the same link (D137).
export function backToMore(){
  return '<button type="button" class="page-back" data-action="more"><svg class="ico page-back-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>More</button>';
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

// The menu: Home and Daily, a thin line, PILLARS (Technique with the pack, Improvisation, Theory), a thin line,
// RESOURCES (Library, Tools). No sub-items (D152 point 4): the menu has the same height on every page.
export function sidebarMenu(items){
  var firstPillar = BHGS_PACK ? "technique" : "improv";
  return items.map(function(n){
    var on = ui.view === n.view;
    var head = n.view === firstPillar ? "Pillars" : (n.view === "library" ? "Resources" : "");
    var html = head ? '<div class="side-sep" aria-hidden="true"></div><div class="side-group">' + head + '</div>' : '';
    var val = navValue(n.view);
    html += '<button data-action="go" data-view="' + n.view + '" class="side-item' + (on ? ' active' + (n.cls ? ' ' + n.cls : '') : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
      icon(n.view) + '<span class="side-label">' + n.label + '</span>' + (val ? '<span class="side-val">' + val + '</span>' : '') + '</button>';
    return html;
  }).join("");
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

// The photo inside a ring in the colour of the sync state (D152 point 3): green synced, amber waiting, grey
// otherwise. The same tone as the dot; the words beside it say the state, so colour is never the only signal.
export function accountRow(){
  var s = syncState();
  return '<button class="side-acct' + (ui.view === "account" ? ' active' : '') + '" data-action="go" data-view="account" aria-label="Account and data">' +
    '<span class="avatar-ring ' + s.tone + '" data-tone="' + s.tone + '">' + avatar("xs") + '</span>' +
    '<span class="side-acct-text"><span class="side-acct-name">' + esc(accountName(false)) + '</span>' +
    '<span class="side-acct-status"><i class="sync-dot ' + s.tone + '"></i><span class="sync-text">' + s.text + '</span></span></span>' +
    '<span class="side-acct-arrow" aria-hidden="true">›</span></button>';
}
