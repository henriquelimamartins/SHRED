// HOME view.
// Slice 4.10j (D164; AUDIT-4.10 slice 8: points 9, 13, 1c, 34 and the HOME part of 33): HOME = direction A.
// Header: today's date as the eyebrow and the title "HOME · LEARNING HUB", each long only where it fits on one line
// (fitHomeHeader, as DAILY); on the right the streak line (desktop) or the streak pill (phone). Phone: a brand row
// above it with the logo and the account button (photo in the sync-state ring, which opens the profile panel over
// HOME; signed out "Sign in", which opens Account & data). Then the briefing of the day (next block, the day's
// blocks as tiles, Continue session), Today's key (circle of fifths, chords, today's box and string) and the
// calendar. From 1180 px two columns, else one. Showing HOME writes nothing.
// Slice 4.10m (D167): the circle is interactive on desktop and phone (another key → "Key" and a "Today: …" button,
// as DAILY; page state ui.homeKey, never saved); the 4-Fret Box tile follows the chosen key; Next up leaves HOME.
// Slice 4.10o (D169, option A5): Today's key adds "Gate n · up next"; a This week card (the current local week day by
// day, then Current streak, Longest streak, Practising since with the days logged), desktop only; three columns from
// 1400 px (briefing + calendar | key | This week), two from 1180 px (This week under the calendar), one below; the
// streak line leaves the header on desktop (the phone keeps its pill).
// Slice 4.5c (D117 point 2, D124 point 3, D127 point 2, D129): Today's session read-only, the calendar as drawn,
// the Progress card with the rails on the phone only (D127). Slice 4.5b2 (D128): HOME's own phone header.
// Slice 4.5a (D124): the Cloud Sync card moved to the Account & data page (js/views/account.js).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=2";
import { hasFirebase, currentUser } from "../firebase.js?v=5";
import { BHGS_PACK } from "../pack.js?v=1";
import { renderRails } from "./rails.js?v=27";
import { streakLine, streakPill } from "./streak.js?v=6";
import { icon, sidebarLogo, avatar, syncState } from "./shell.js?v=25";
import { DAY_FULL } from "../data/days.js?v=1";
import { ESSENTIAL } from "../data/bhgs.js?v=1";
import { todayName, todayISO, activeDay, isWeekendDay, localISO, currentStreak, totalStreak } from "../logic/dates.js?v=7";
import { renderStreakCalendar } from "./calendar.js?v=42";
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { sessionPlan, isBlockPracticed } from "../logic/daily.js?v=42";
import { improvKeyOfDay, improvDayContext, boxFrets } from "./improv.js?v=33";
import { todayKey, keyLabel, homeCircle, chordRow, RING, spellKey, pretty, NUMERALS, QUALITY } from "./daily-side.js?v=21";
import { loggedDays, longestStreak } from "./account.js?v=26";

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
    // Slice 4.10m (D167): the tile's name is text for screen readers (an aria-label on a plain list item is not read
    // reliably); the visible parts stay hidden from them.
    return '<li class="hb-tile' + cls + '" data-block="' + b.name + '"><span class="home-sr">' + esc(b.title) + (minText(b) ? ', ' + minText(b) : '') + ', ' + st + '</span>' +
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

// ---------- Today's key (D164 point 5; slice 4.10m, D167) ----------
// The card starts on today's key (the Improv key of the day) and offers another one on the circle; the choice lives in
// ui.homeKey (page state, back to today's key on reload) and never touches DAILY's own choice (ui.dailyKey).
const BACK = 'M4 12a8 8 0 1 0 2.5-5.8M4 5v4h4M12 8v4.5l3 2';
function exerciseLabel(t){ return t.replace(/^\d+\.\s*/, '').replace(/^The\s+/, ''); }

// Slice 4.10o (D169 point 2): "Gate n · up next" = the first exercise of the current Gate not marked Mastered, its
// CHANGES in degrees and, only when every degree is a plain chord of the key on screen, the chords in that key; a degree
// with a suffix ("i5", "V7", "I7") or outside the key's mode leaves the chords out. Read only, the same data as IMPROVISATION.
function changesInKey(changes, sel){
  if(!changes || !sel) return '';
  var notes = spellKey(RING[sel.m][sel.i], sel.m), out = [];
  var ok = changes.split(/\s*[–-]\s*/).every(function(t){
    var k = NUMERALS[sel.m].indexOf(t);
    if(k < 0) return false;
    out.push(pretty(notes[k]) + QUALITY[sel.m][k]);
    return true;
  });
  return ok ? out.join(' – ') : '';
}
function upNext(sel){
  var gi = Math.min(state.improvIndex || 0, IMPROV_GATES.length - 1), g = IMPROV_GATES[gi], checks = state.improvChecks || {};
  var ei = g.exercises.findIndex(function(e, k){ return !checks['g' + gi + 'e' + k]; });
  if(ei < 0) return '';
  var ex = g.exercises[ei], chords = changesInKey(ex.changes, sel);
  return '<div class="hk-next"><span class="hk-next-label">Gate ' + (gi + 1) + ' · up next</span>' +
    '<span class="hk-next-title">' + esc(ex.t.replace(/^\d+\.\s*/, '')) + '</span>' +
    (ex.changes ? '<span class="hk-next-line"><span class="hk-next-deg">' + esc(ex.changes) + '</span>' +
      (chords ? '<span class="hk-next-chords">' + esc(chords) + '</span>' : '') + '</span>' : '') +
    (ex.track ? '<span class="hk-next-track">' + esc(ex.track) + '</span>' : '') + '</div>';
}
function todayKeyCard(){
  var tk = improvKeyOfDay(), today = todayKey(), c = improvDayContext();
  var sel = ui.homeKey || today;
  var isToday = !!today && !!sel && sel.m === today.m && sel.i === today.i;
  var ex = IMPROV_GATES[0].exercises;
  var oneString = exerciseLabel(ex[0].t), box = exerciseLabel(ex[1].t);
  // The 4-Fret Box frets follow the key on screen (owner): today's box number, on the minor pentatonic of the chosen
  // key (a major key uses its relative minor's box: the same notes). The One-String Doom string does not depend on the key.
  var from = c.boxFrom, to = c.boxTo;
  if(sel && !isToday){ var f = boxFrets(RING.min[sel.i], c.box - 1); if(f){ from = f[0]; to = f[1]; } }
  var name = sel ? keyLabel(sel.m, sel.i) : tk.k.replace('#', '♯').replace(/^([A-G])b/, '$1♭');
  var aside = isToday || !sel || !today ? '<span class="hk-style">' + esc(tk.t) + '</span>'
    : '<button type="button" class="hk-today" data-action="homekeytoday">' + svg(BACK) + 'Today: ' + keyLabel(today.m, today.i) + '</button>';
  return '<section class="card home-key" aria-labelledby="home-key-label">' +
    '<div class="hk-head"><span class="hk-label" id="home-key-label">' + (isToday || !sel ? 'Today\'s key' : 'Key') + '</span>' + aside + '</div>' +
    '<p class="hk-name">' + esc(name) + '</p>' +
    (sel ? homeCircle(sel) + chordRow(sel) : '') +
    '<div class="hk-tiles">' +
      '<div class="hk-tile"><span class="hk-tile-label">' + esc(box) + '</span><span class="hk-tile-val">Box ' + c.box + ' · frets ' + from + '–' + to + '</span></div>' +
      '<div class="hk-tile"><span class="hk-tile-label">' + esc(oneString) + '</span><span class="hk-tile-val">' + c.oneString + ' string</span></div>' +
    '</div>' + upNext(sel) +
    '<button class="hk-open" data-action="go" data-view="improv"><span>Open <span class="hk-open-page">Improvisation</span></span>' + svg(CHEVRON) + '</button></section>';
}

// ---------- This week (slice 4.10o, D169 point 3; desktop only) ----------
// One row per day of the current local week (Monday first): the day's plan from sessionPlan() (what DAILY shows), its
// minutes and its state from streakDates (Practised / Today / Rest; nothing for a day still to come); then the
// current and longest streak and the first logged month with the days logged. Real values only (D71); reads only.
var WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const IC_TROPHY = 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4v3h-4z';
const IC_FLAME = 'M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5.5.5 1.5 1.5 2.5 2.5 2.5-.5-2.5-.5-5 0-7.5z';
const IC_FLAG = 'M5 21V4M5 4h11l-2 4 2 4H5';
function dayPlan(dk){
  var plan = sessionPlan(dk, state.phaseIndex), mins = 0;
  plan.forEach(function(b){ mins += b.min || 0; });
  var main = (plan.length > 2 ? plan[2] : plan[plan.length - 1]).title.replace('Improv & Expression', 'Improv');
  // The micro-dose and the Phase test are BHGS (D113): shown only with the pack, and only on a full weekday session.
  if(BHGS_PACK && plan.length > 2 && ESSENTIAL[dk]) main += ' · ' + ESSENTIAL[dk];
  if(BHGS_PACK && plan.length > 2 && dk === 'Fri') main = 'Phase test · ' + main;
  return { text: main, mins: mins };
}
function thisWeek(){
  var days = loggedDays(), logged = {};
  days.forEach(function(d){ logged[d] = true; });
  var now = new Date(), today = localISO(now), dow = (now.getDay() + 6) % 7, n = 0, rows = '';
  for(var k = 0; k < 7; k++){
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow + k), iso = localISO(d);
    var future = iso > today, isToday = iso === today, hit = !future && !!logged[iso];
    if(hit) n++;
    var st = hit ? 'Practised' : isToday ? 'Today' : future ? '' : 'Rest', p = dayPlan(WEEK[k]);
    rows += '<li class="hw-row' + (hit ? ' hit' : '') + (isToday ? ' today' : '') + (future ? ' future' : '') + '" data-day="' + WEEK[k] + '"' + (isToday ? ' aria-current="date"' : '') + '>' +
      '<span class="hw-dot" aria-hidden="true">' + (hit ? svg(TICK) : '') + '</span>' +
      '<span class="hw-main"><span class="hw-day">' + WEEK[k] + ' <span class="hw-num">' + d.getDate() + '</span></span>' +
      '<span class="hw-plan">' + esc(p.text) + '</span></span>' +
      '<span class="hw-side">' + (st ? '<span class="hw-state">' + st + '</span>' : '') + (p.mins ? '<span class="hw-min">' + p.mins + ' min</span>' : '') + '</span></li>';
  }
  var pl = function(v){ return v + (v === 1 ? ' day' : ' days'); }, total = totalStreak();
  var since = days.length ? (function(p){ return SHORT_MONTHS[+p[1] - 1] + ' ' + p[0]; })(days[0].split('-')) : 'Not yet';
  // Owner (2026-11-24, during the slice): compact blocks, label on top, the icon beside the value; the days logged on
  // their own line (to the right of the value where there is room).
  var stat = function(cls, ic, label, val, sub){
    return '<div class="hw-stat ' + cls + '"><span class="hw-stat-label">' + label + '</span>' +
      '<span class="hw-stat-row"><span class="hw-stat-ic" aria-hidden="true">' + svg(ic) + '</span><span class="hw-stat-val">' + val + '</span>' +
      (sub ? '<span class="hw-stat-sub">' + sub + '</span>' : '') + '</span></div>';
  };
  return '<section class="card home-week" aria-labelledby="home-week-label">' +
    '<div class="hw-head"><h2 class="hw-label" id="home-week-label">This week</h2><span class="hw-meta"><b>' + n + '</b> of 7 days practised</span></div>' +
    '<div class="hw-bar" aria-hidden="true"><i class="f' + n + '"></i></div>' +
    '<ul class="hw-rows">' + rows + '</ul>' +
    '<div class="hw-stats">' + stat('s-current', IC_FLAME, 'Current streak', pl(currentStreak())) +
      stat('s-best', IC_TROPHY, 'Longest streak', pl(longestStreak(days))) +
      stat('s-since', IC_FLAG, 'Practising since', since, days.length ? pl(total) + ' logged' : '') + '</div></section>';
}

/* ---------- view ---------- */
export function renderHome(){
  var html = homeHeader();
  // D127: on desktop the rails live only in the sidebar; the phone shows them in a card (no "Progress" title, point 13).
  html += '<div class="card home-progress" aria-label="Progress">' + renderRails('home') + '</div>';
  // Slice 4.10o (D169): three columns from 1400 px (briefing and calendar | key | This week), two from 1180 px (This week
  // under the calendar | key), one below, in reading order; This week is not shown on the phone (CSS).
  html += '<div class="home-grid"><div class="home-col home-col-main">' + briefing() +
    '<section class="card home-calendar" aria-label="Practice calendar">' + renderStreakCalendar() + '</section></div>' +
    '<div class="home-col home-col-side">' + todayKeyCard() + '</div>' +
    '<div class="home-col home-col-week">' + thisWeek() + '</div></div>';
  return html;
}
