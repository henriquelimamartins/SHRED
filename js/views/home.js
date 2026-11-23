// HOME view.
// Slice 4.10j (D164; AUDIT-4.10 slice 8: points 9, 13, 1c, 34 and the HOME part of 33): HOME = direction A.
// Header: today's date as the eyebrow and the title "HOME · LEARNING HUB", each long only where it fits on one line
// (fitHomeHeader, as DAILY); on the right the streak line (desktop) or the streak pill (phone). Phone: a brand row
// above it with the logo and the account button (photo in the sync-state ring, which opens the profile panel over
// HOME; signed out "Sign in", which opens Account & data). Then the briefing of the day (next block, the day's
// blocks as tiles, Continue session), Today's key (circle of fifths on desktop, chords, today's box and string),
// Next up for the three pillars and the calendar. From 1180 px two columns, else one. Showing HOME writes nothing.
// Slice 4.5c (D117 point 2, D124 point 3, D127 point 2, D129): Today's session read-only, the calendar as drawn,
// the Progress card with the rails on the phone only (D127). Slice 4.5b2 (D128): HOME's own phone header.
// Slice 4.5a (D124): the Cloud Sync card moved to the Account & data page (js/views/account.js).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { state } from "../store.js?v=5";
import { hasFirebase, currentUser } from "../firebase.js?v=5";
import { BHGS_PACK } from "../pack.js?v=1";
import { renderRails } from "./rails.js?v=25";
import { streakLine, streakPill } from "./streak.js?v=4";
import { icon, sidebarLogo, avatar, syncState } from "./shell.js?v=23";
import { DAY_FULL } from "../data/days.js?v=1";
import { ESSENTIAL } from "../data/bhgs.js?v=1";
import { todayName, todayISO, activeDay, isWeekendDay } from "../logic/dates.js?v=7";
import { renderStreakCalendar } from "./calendar.js?v=40";
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { sessionPlan, isBlockPracticed } from "../logic/daily.js?v=40";
import { improvKeyOfDay, improvDayContext } from "./improv.js?v=31";
import { todayKey, staticCircle, chordRow } from "./daily-side.js?v=19";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
function svg(path, cls){
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg>';
}
const CHEVRON = 'M9 6l6 6-6 6';
// One line icon per DAILY block (the board's shapes; Focused = the target of the micro-dose card).
const BLOCK_ICONS = {
  prereq: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  warmup: 'M12 3c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-7z',
  focused: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  improv: 'M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0',
  casual: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  cooldown: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M8 12h8M8 16h5'
};
const TICK = 'M5 12l5 5 9-10';

// ---------- header (D164 points 1 and 2) ----------
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function ordinal(n){ var v = n % 100, s = ['th','st','nd','rd']; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

// Phone account button (AUDIT-4.10 point 34): signed in, the photo inside the sync-state ring opens the profile
// panel over HOME (D164 point 3); signed out, "Sign in" opens Account & data, where Login lives; without Firebase,
// the person icon opens Account & data. The accessible name says the state, so colour is never the only signal.
function accountButton(){
  if(hasFirebase && currentUser){
    var s = syncState();
    return '<button type="button" class="home-acct" data-action="profile" aria-haspopup="dialog" aria-label="Account · ' + esc(s.text) + '">' +
      '<span class="avatar-ring ring-md ' + s.tone + '" data-tone="' + s.tone + '">' + avatar("sm") + '</span></button>';
  }
  if(hasFirebase) return '<button type="button" class="home-signin" data-action="go" data-view="account">' + icon("person") + '<span>Sign in</span></button>';
  return '<button type="button" class="home-acct home-acct-local" data-action="go" data-view="account" aria-label="Account &amp; data">' + icon("person") + '</button>';
}

function homeHeader(){
  var d = new Date(), dn = todayName(), m = MONTHS[d.getMonth()], tail = ordinal(d.getDate()) + ', ' + d.getFullYear();
  return '<div class="home-brand-row">' + sidebarLogo("home-logo") + accountButton() + '</div>' +
    '<header class="page-head home-head"><div class="page-head-main">' +
    '<time class="eyebrow page-eyebrow home-date" datetime="' + todayISO() + '">' +
    '<span class="home-date-long">' + DAY_FULL[dn] + ' &middot; ' + m + ' ' + tail + '</span>' +
    '<span class="home-date-short">' + dn + ' &middot; ' + m.slice(0, 3) + ' ' + tail + '</span></time>' +
    '<h1 class="page-title home-title"><span class="home-title-long" aria-hidden="true">Home &middot; Learning Hub</span>' +
    '<span class="home-title-short" aria-hidden="true">Home</span><span class="home-sr">Home · Learning Hub</span></h1></div>' +
    '<div class="page-head-right">' + streakLine() + streakPill() + '</div></header>';
}

// The long title and date only where they fit on one line beside the right-hand side (owner, point 33): measured,
// not chosen by device. The same rule as DAILY (D162 point 4).
var headObserver = null, fontsHooked = false;
export function fitHomeHeader(){
  var head = document.querySelector('#panel-home .home-head');
  if(!head || !head.offsetWidth) return; // not on screen: measured when it becomes visible
  head.classList.remove('fit-short-title', 'fit-short-date');
  var right = head.querySelector('.page-head-right');
  var gap = parseFloat(getComputedStyle(head).columnGap) || 0;
  var room = head.clientWidth - (right ? right.getBoundingClientRect().width + gap : 0) - 2;
  var longTitle = head.querySelector('.home-title-long'), longDate = head.querySelector('.home-date-long');
  if(longTitle && longTitle.getBoundingClientRect().width > room) head.classList.add('fit-short-title');
  if(longDate && longDate.getBoundingClientRect().width > room) head.classList.add('fit-short-date');
  head.classList.add('fitted');
}
export function watchHomeHeader(){
  var head = document.querySelector('#panel-home .home-head');
  if(headObserver) headObserver.disconnect();
  if(head && typeof ResizeObserver === 'function'){
    headObserver = new ResizeObserver(function(){ fitHomeHeader(); });
    headObserver.observe(head);
  }
  if(!fontsHooked && document.fonts){
    fontsHooked = true;
    if(document.fonts.ready) document.fonts.ready.then(fitHomeHeader);
    if(document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitHomeHeader);
  }
  fitHomeHeader();
}

// ---------- briefing of the day (D164 point 4) ----------
// The minutes as DAILY writes them in each block head (Focused "30 + 5 min"); none in Phase 0.
function minText(b){
  if(!b.min) return '';
  return b.name === 'focused' ? '30 + 5 min' : b.min + ' min';
}
function blockIcon(b){ return BLOCK_ICONS[b.name === 'casual' && b.title !== 'Casual' ? 'improv' : b.name] || BLOCK_ICONS.cooldown; }

// On the phone a long block title gets its short name, so every tile title stays on one line (owner, 2026-11-23:
// "Improv & Expression" → "Improv"). The full name stays on the desktop and in the tile's accessible name.
function tileTitle(t){
  return t === 'Improv & Expression' ? '<span class="hb-title-long">' + esc(t) + '</span><span class="hb-title-short">Improv</span>' : esc(t);
}
function briefing(){
  var day = activeDay();
  var plan = sessionPlan(day, state.phaseIndex);
  var done = 0, mins = 0, next = null;
  plan.forEach(function(b){
    b.on = isBlockPracticed(b.name, day);
    if(b.on) done++; else if(!next) next = b;
    if(b.min) mins += b.min;
  });
  var meta = done + ' of ' + plan.length + (mins ? ' · ' + mins + ' min' : '');
  var head, sub;
  if(next){
    sub = minText(next);
    // On a weekday the Focused block ends with the day's micro-dose (BHGS, D113).
    if(next.name === 'focused' && BHGS_PACK && !isWeekendDay(day) && ESSENTIAL[day]) sub += (sub ? ' · ' : '') + ESSENTIAL[day];
    head = '<div class="hb-next-wrap"><span class="hb-next-ic">' + svg(blockIcon(next)) + '</span>' +
      '<div class="hb-next-text"><h2 class="hb-next"><span class="hb-next-word">Next</span> · ' + esc(next.title) + '</h2>' +
      (sub ? '<p class="hb-next-sub">' + esc(sub) + '</p>' : '') + '</div></div>';
  } else {
    head = '<div class="hb-next-wrap"><span class="hb-next-ic done">' + svg(TICK) + '</span>' +
      '<div class="hb-next-text"><h2 class="hb-next">Session complete</h2><p class="hb-next-sub">All ' + plan.length + ' blocks practised</p></div></div>';
  }
  var tiles = plan.map(function(b, i){
    var cls = b.on ? ' done' : (b === next ? ' next' : '');
    var st = b.on ? 'practised' : (b === next ? 'next' : 'not practised yet');
    return '<li class="hb-tile' + cls + '" data-block="' + b.name + '" aria-label="' + esc(b.title) + (minText(b) ? ', ' + minText(b) : '') + ', ' + st + '">' +
      '<span class="hb-num" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
      '<span class="hb-ic" aria-hidden="true">' + svg(b.on ? TICK : blockIcon(b)) + '</span>' +
      '<span class="hb-title" aria-hidden="true">' + tileTitle(b.title) + '</span>' +
      (minText(b) ? '<span class="hb-min" aria-hidden="true">' + minText(b) + '</span>' : '') + '</li>';
  }).join('');
  var btn = '<button class="hb-continue" data-action="go" data-view="daily">' + (next ? 'Continue session' : 'Open DAILY') + svg(CHEVRON) + '</button>';
  return '<section class="card home-brief" aria-labelledby="home-brief-label">' +
    '<div class="hb-head"><span class="hb-label" id="home-brief-label">Today\'s session · ' + DAY_FULL[day] + '</span><span class="hb-meta">' + meta + '</span></div>' +
    '<div class="hb-main">' + head + btn + '</div>' +
    '<ul class="hb-tiles hb-n' + plan.length + '">' + tiles + '</ul></section>';
}

// ---------- Today's key (D164 point 5) ----------
function exerciseLabel(t){ return t.replace(/^\d+\.\s*/, '').replace(/^The\s+/, ''); }
function todayKeyCard(){
  var tk = improvKeyOfDay(), sel = todayKey(), c = improvDayContext();
  var ex = IMPROV_GATES[0].exercises;
  var oneString = exerciseLabel(ex[0].t), box = exerciseLabel(ex[1].t);
  return '<section class="card home-key" aria-labelledby="home-key-label">' +
    '<div class="hk-head"><span class="hk-label" id="home-key-label">Today\'s key</span><span class="hk-style">' + esc(tk.t) + '</span></div>' +
    '<p class="hk-name">' + esc(tk.k.replace('#', '♯').replace(/^([A-G])b/, '$1♭')) + '</p>' +
    (sel ? staticCircle(sel) + chordRow(sel) : '') +
    '<div class="hk-tiles">' +
      '<div class="hk-tile"><span class="hk-tile-label">' + esc(box) + '</span><span class="hk-tile-val">Box ' + c.box + ' · frets ' + c.boxFrom + '–' + c.boxTo + '</span></div>' +
      '<div class="hk-tile"><span class="hk-tile-label">' + esc(oneString) + '</span><span class="hk-tile-val">' + c.oneString + ' string</span></div>' +
    '</div>' +
    '<button class="hk-open" data-action="go" data-view="improv"><span>Open <span class="hk-open-page">Improvisation</span></span>' + svg(CHEVRON) + '</button></section>';
}

// ---------- Next up (D164 point 6) ----------
function nextUp(){
  var rows = [];
  if(BHGS_PACK) rows.push({ view: 'technique', ic: 'technique', cls: 'tech', label: 'Technique · Phase ' + state.phaseIndex });
  var allDone = state.improvIndex >= IMPROV_GATES.length;
  rows.push({ view: 'improv', ic: 'improv', cls: 'improv', label: 'Improvisation · ' + (allDone ? 'Complete' : 'Gate ' + (state.improvIndex + 1)) });
  rows.push({ view: 'dojo', ic: 'dojo', cls: 'theory', label: 'Theory' });
  return '<section class="card home-next" aria-labelledby="home-next-title"><h2 class="home-card-title" id="home-next-title">Next up</h2>' +
    '<ul class="hn-list">' + rows.map(function(r){
      return '<li><button class="hn-row hn-' + r.cls + '" data-action="go" data-view="' + r.view + '"><span class="hn-ic">' + icon(r.ic) + '</span>' +
        '<span class="hn-label">' + r.label + '</span>' + svg(CHEVRON, 'hn-chev') + '</button></li>';
    }).join('') + '</ul></section>';
}

/* ---------- view ---------- */
export function renderHome(){
  var html = homeHeader();
  // D127: on desktop the rails live only in the sidebar; the phone shows them in a card (no "Progress" title, point 13).
  html += '<div class="card home-progress" aria-label="Progress">' + renderRails('home') + '</div>';
  // Two columns from 1180 px (briefing and calendar | key and Next up); one column below, in reading order.
  html += '<div class="home-grid"><div class="home-col home-col-main">' + briefing() +
    '<section class="card home-calendar" aria-label="Practice calendar">' + renderStreakCalendar() + '</section></div>' +
    '<div class="home-col home-col-side">' + todayKeyCard() + nextUp() + '</div></div>';
  return html;
}
