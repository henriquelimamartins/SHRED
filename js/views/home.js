// HOME view.
// Slice 4.5c (D117 point 2, D124 point 3, D127 point 2, D129): HOME as drawn. Header with the streak (desktop:
// "N days in a row · M logged"; phone: the 4.5b2 header); the Progress card with the rails (phone only, D127);
// Today's session read-only (blocks, state and minutes from DAILY; CONTINUE SESSION opens DAILY, the only place
// to tick); the calendar as drawn (month title, ‹ ›, Today only on another month, full month on the phone);
// Today's Improv (current Gate and the key of the day, as on IMPROV). Desktop: two columns. The shortcut
// buttons, the stat row and the "Consistency Grid" card leave. Showing HOME writes nothing.
// Slice 4.5b2 (D126 point 1, D128): on the phone HOME has its own header as drawn (brand, date, streak) instead of the
// shared top bar; the desktop keeps the page header. The Explorer icon of the board comes with the Explorer (Phase 5).
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Slice 4.5a (D124): the "Cloud Sync" card (Save/Load, Download/Restore backup, Reset Everything) moved unchanged
// to the Account & data page (js/views/account.js).
// Slice 3.5 (D106): Reset Everything confirmation text says what is erased and what is kept.
// Slice 3.8 (D110): Download backup / Restore backup in the "Cloud Sync" card (list + confirmation).
// Slice 4.2b (D113): with the BHGS pack off, the phase bar, phase %, Phase Transition Test and Jump to phase are hidden.
// Slice 4.4 (D123): "Improvisation Masterclass" (the pillar's full name where there is room).
// Slice 4.3 (D115, D117, D122): the Phase Transition Test and Jump to phase move to the TECHNIQUE page; a Technique
// shortcut joins the HOME buttons (BHGS pack on); the Library shortcut names what LIBRARY now holds.
// Slice 4.2a (D119, D25): the Technique phase bar sits at the top of HOME instead of the top of every page.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { state } from "../store.js?v=5";
import { totalStreak, currentStreak } from "../logic/dates.js?v=7";
import { renderRails } from "./rails.js?v=9";
import { pageHeader, icon } from "./shell.js?v=7";
import { DAY_FULL } from "../data/days.js?v=1";
import { todayName, activeDay } from "../logic/dates.js?v=7";
import { renderStreakCalendar } from "./calendar.js?v=23";

import { IMPROV_GATES } from "../data/improv.js?v=1";
import { sessionPlan, isBlockPracticed } from "../logic/daily.js?v=23";
import { improvKeyOfDay } from "./improv.js?v=15";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// Today's session, read-only: the blocks of the active DAILY day with their Practiced state (D124 point 3).
function todaySession(){
  var day = activeDay();
  var plan = sessionPlan(day, state.phaseIndex);
  var done = 0, mins = 0;
  var rows = plan.map(function(b){
    var on = isBlockPracticed(b.name, day);
    if(on) done++;
    if(b.min) mins += b.min;
    return '<div class="hs-row' + (on ? ' done' : '') + '" data-block="' + b.name + '">' +
      '<span class="hs-box' + (on ? ' on' : '') + '">' + (on ? icon("tick") : '') + '</span>' +
      '<span class="hs-title">' + esc(b.title) + '</span>' + (b.min ? '<span class="hs-min">' + b.min + '\u2032</span>' : '') + '</div>';
  }).join("");
  var meta = done + ' of ' + plan.length + (mins ? ' \u00b7 ' + mins + ' min' : '');
  return '<section class="card home-session" aria-label="Today\'s session"><div class="home-card-head"><h2 class="home-card-title">Today\'s session</h2>' +
    '<span class="home-card-meta">' + meta + '</span></div>' + rows +
    '<button class="home-continue" data-action="go" data-view="daily">Continue session</button></section>';
}

// Today's Improv: the current Gate and the key of the day, the same values the IMPROV page shows.
function todayImprov(){
  var allDone = state.improvIndex >= IMPROV_GATES.length;
  var title = allDone ? 'All ' + IMPROV_GATES.length + ' Gates complete'
    : 'Gate ' + (state.improvIndex + 1) + ' \u00b7 ' + IMPROV_GATES[state.improvIndex].title;
  var key = improvKeyOfDay();
  return '<button class="card home-link home-improv" data-action="go" data-view="improv">' +
    '<span class="home-link-text"><span class="home-link-label">Today\'s Improv</span>' +
    '<span class="home-link-title">' + esc(title) + '</span>' +
    (allDone ? '' : '<span class="home-link-sub">Today\'s key: ' + esc(key.k) + ' (' + esc(key.t) + ')</span>') + '</span>' +
    '<span class="home-link-arrow" aria-hidden="true">\u203a</span></button>';
}

/* ---------- views ---------- */
export function renderHome(){
  var now=new Date(), MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateLine=DAY_FULL[todayName()]+' \u00b7 '+now.getDate()+' '+MON[now.getMonth()];
  var streak=currentStreak(), logged=totalStreak();
  // Phone header (slice 4.5b2, D128).
  var html='<header class="home-phone-head"><div class="home-phone-brand"><div class="brand home-brand">THE <span>SHRED</span> <small>ROADMAP</small></div>'+
    '<div class="home-date">'+dateLine+'</div></div>'+
    '<div class="streak-pill" aria-label="'+streak+'-day streak">'+icon("flame")+'<strong>'+streak+'</strong></div></header>';
  // Desktop header: the streak on the right (D129).
  var streakLine='<span class="home-streak">'+icon("flame")+'<strong class="streak-run">'+streak+'</strong> '+(streak===1?'day':'days')+' in a row \u00b7 <span class="streak-logged">'+logged+'</span> logged</span>';
  html+=pageHeader(dateLine,'Home',streakLine);
  // D127 (owner): on desktop the rails live only in the sidebar; the Progress card shows on the phone.
  html+='<div class="card home-progress"><h3>Progress</h3>'+renderRails('home')+'</div>';

  html+='<div class="home-cols"><div class="home-col">';
  html+=todaySession();
  html+='<section class="card home-calendar" aria-label="Practice calendar">'+renderStreakCalendar()+'</section>';
  html+='</div><div class="home-col">';
  html+=todayImprov();
  html+='</div></div>';
  return html;
}
