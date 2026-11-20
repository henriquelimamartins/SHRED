// DAILY companion column (slice 4.7, D132 point 1, D133 points 4-5): MICRO-DOSES and KEY.
// Desktop only (hidden on the phone by CSS, D133 point 2). Everything here only reads the state; the key picked
// on the circle lives in `ui.dailyKey` (page state, back to today's key on reload) and is never saved.
import { PHASES, ESSENTIAL, ESSENTIAL_URL } from "../data/bhgs.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { BHGS_PACK } from "../pack.js?v=1";
import { todayName, isWeekendDay, localISO } from "../logic/dates.js?v=7";
import { improvKeyOfDay } from "./improv.js?v=21";

function svg(path, cls){
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg>';
}
const TICK = 'M5 12l5 5 9-10';
const OPEN = 'M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5';
const BACK = 'M4 12a8 8 0 1 0 2.5-5.8M4 5v4h4M12 8v4.5l3 2';
// One line icon per weekday micro-dose (the canvas shapes; Ear Training drawn as headphones).
const MICRO_ICONS = {
  "Ear Training": 'M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z',
  "Rhythm": 'M3 12h3l2-6 4 12 3-9 2 3h4',
  "Time Signatures": 'M4 9l8-5 8 5M6 9v9M10 9v9M14 9v9M18 9v9M4 20h16',
  "Sight-Reading": 'M7 3h7l4 4v14H7zM14 3v4h4',
  "Reinforce Weakest": 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
};
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Monday to Friday of the current local week, as YYYY-MM-DD.
function weekDates(){
  var d = new Date(), back = (d.getDay() + 6) % 7;
  return WEEK.map(function(_, i){ return localISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() - back + i)); });
}

// ---------- MICRO-DOSES (D133 point 4) ----------
function microCard(day){
  var today = todayName(), isToday = day === today;
  var setup = PHASES[state.phaseIndex].kind === "setup"; // Phase 0 (Setup) has no micro-dose
  var none = setup || isWeekendDay(day);
  var html = '<section class="daily-card daily-micro-card" aria-label="Micro-doses this week">' +
    '<div class="dc-head"><span class="dc-label red">Micro-doses &middot; 5 min a day</span><span class="dc-aside">Mon &ndash; Fri</span></div>';
  if(none){
    html += '<p class="dc-none">' + (isToday ? 'No micro-dose today' : 'No micro-dose on ' + DAY_FULL[day]) + '</p>';
  } else {
    var name = ESSENTIAL[day], url = ESSENTIAL_URL[name];
    var whose = isToday ? "Today's micro-dose" : DAY_FULL[day] + "'s micro-dose";
    var line = day === "Fri" ? "The whole Focused block reinforces your weakest skill" : whose + ", at the end of the Focused block";
    html += '<div class="dc-front"><span class="dc-front-ic">' + svg(MICRO_ICONS[name]) + '</span><div class="dc-front-text"><div class="dc-front-name">' + name + '</div><div class="dc-front-line">' + line + '</div></div></div>';
    if(url) html += '<a class="dc-btn red" href="' + url + '" target="_blank" rel="noopener">' + svg(OPEN) + (isToday ? "Open today's video" : 'Open ' + DAY_FULL[day] + "'s video") + '</a>';
  }
  var dates = weekDates(), logged = state.streakDates || [];
  html += '<div class="dc-week">' + WEEK.map(function(d, i){
    var name = ESSENTIAL[d], ticked = logged.indexOf(dates[i]) >= 0, cur = !none && d === day;
    var label = DAY_FULL[d] + ': ' + name + (ticked ? ', practised' : '');
    return '<div class="dc-tile' + (cur ? ' cur' : '') + (ticked ? ' ticked' : '') + '" data-day="' + d + '" role="img" aria-label="' + label + '">' +
      '<span class="dc-tile-day">' + d + '</span><span class="dc-tile-ic">' + svg(ticked ? TICK : MICRO_ICONS[name], ticked ? 'tick' : '') + '</span>' +
      '<span class="dc-tile-name">' + name + '</span></div>';
  }).join('') + '</div>';
  html += '<p class="dc-foot">Friday has no separate video: the whole Focused block reinforces your weakest skill. A tick = a day you practised.</p>';
  return html + '</section>';
}

// ---------- KEY: circle of fifths (D133 point 5) ----------
const LETTERS = 'CDEFGAB', NATURAL = [0, 2, 4, 5, 7, 9, 11];
const SCALE = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10] };
const NUMERALS = { maj: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], min: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] };
const QUALITY = { maj: ['', 'm', 'm', '', '', 'm', '°'], min: ['m', '°', '', 'm', 'm', '', ''] };
// Clockwise from the top. The minor ring is spelled as the app's key list (E♭ minor, B♭ minor); slice 4.7c (D136):
// position 7 is G♭ major / E♭ minor, so each major sits with its relative minor (same key signature, 6 flats).
const RING = {
  maj: ["C", "G", "D", "A", "E", "B", "Gb", "Db", "Ab", "Eb", "Bb", "F"],
  min: ["A", "E", "B", "F#", "C#", "G#", "Eb", "Bb", "F", "C", "G", "D"]
};
function pretty(n){ return n.replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }
// The seven notes of a key, each letter used once (e.g. E♭ minor: E♭ F G♭ A♭ B♭ C♭ D♭).
export function spellKey(tonic, mode){
  var li = LETTERS.indexOf(tonic[0]), acc = tonic[1] === '#' ? 1 : (tonic[1] === 'b' ? -1 : 0);
  var root = (NATURAL[li] + acc + 12) % 12;
  return SCALE[mode].map(function(step, k){
    var l = (li + k) % 7, pc = (root + step) % 12, d = (pc - NATURAL[l] + 12) % 12;
    if(d > 6) d -= 12;
    return LETTERS[l] + (d === 1 ? '#' : d === -1 ? 'b' : d === 2 ? '##' : d === -2 ? 'bb' : '');
  });
}
// Today's key (the Improv key of the day) as a position on the circle; null if it is not on it.
function todayKey(){
  var k = improvKeyOfDay().k.split(' '), mode = k[1] === 'major' ? 'maj' : 'min';
  var i = RING[mode].indexOf(k[0]);
  return i < 0 ? null : { m: mode, i: i };
}
function keyLabel(m, i){ return pretty(RING[m][i]) + (m === 'min' ? ' minor' : ' major'); }

// Slice 4.7c (D136): the chosen key (and its relative) is marked by its slice of the ring, not by a circle:
// curved inner and outer edges on the ring lines, straight sides between keys. Drawn as SVG paths (no inline style).
const C = 140, R_OUT = 135.5, R_MID = 97.5, R_IN = 47.5;
function pt(r, deg){ var a = deg * Math.PI / 180; return (C + r * Math.cos(a)).toFixed(2) + ' ' + (C + r * Math.sin(a)).toFixed(2); }
function sector(r0, r1, i){
  var a0 = i * 30 - 90 - 15, a1 = a0 + 30;
  return 'M' + pt(r1, a0) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + pt(r1, a1) + ' L' + pt(r0, a1) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + pt(r0, a0) + ' Z';
}
// An arc inside the inner ring from angle a0 to a1 (degrees, 0 = right, clockwise positive) with an arrowhead at a1.
function arrowArc(a0, a1, clockwise){
  var r = 38, sweep = clockwise ? 1 : 0;
  var d = 'M' + pt(r, a0) + ' A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + pt(r, a1);
  // Arrowhead: two short strokes at the end, pointing along the direction of travel.
  var t = (a1 + (clockwise ? 90 : -90)) * Math.PI / 180, e = a1 * Math.PI / 180;
  var ex = C + r * Math.cos(e), ey = C + r * Math.sin(e), L = 6;
  var h = function(da){ var a = t + Math.PI + da; return (ex + L * Math.cos(a)).toFixed(2) + ' ' + (ey + L * Math.sin(a)).toFixed(2); };
  d += ' M' + h(0.5) + ' L' + ex.toFixed(2) + ' ' + ey.toFixed(2) + ' L' + h(-0.5);
  return '<path class="kc-arrow" d="' + d + '"></path>';
}
function circleSvg(sel){
  var svg = '<svg class="kc-svg" viewBox="0 0 280 280" aria-hidden="true">';
  [['maj', R_MID, R_OUT], ['min', R_IN, R_MID]].forEach(function(ring){
    for(var i = 0; i < 12; i++){
      var on = sel.m === ring[0] && sel.i === i, rel = !on && sel.i === i;
      if(on || rel) svg += '<path class="kc-sector' + (on ? ' on' : ' rel') + '" data-ring="' + ring[0] + '" d="' + sector(ring[1], ring[2], i) + '"></path>';
    }
  });
  [R_OUT, R_MID, R_IN].forEach(function(r){ svg += '<circle class="kc-line" cx="' + C + '" cy="' + C + '" r="' + r + '"></circle>'; });
  // Centre (owner, slice 4.7c): clockwise = fifths (upper arrow), anticlockwise = fourths (lower arrow).
  svg += arrowArc(-140, -40, true) + arrowArc(140, 40, false);
  // The words follow the arrows (owner): along an arc inside each one, read left to right.
  svg += '<path id="kc-fifths-path" class="kc-guide" d="M' + pt(25, -155) + ' A25 25 0 0 1 ' + pt(25, -25) + '"></path>';
  svg += '<path id="kc-fourths-path" class="kc-guide" d="M' + pt(31, 155) + ' A31 31 0 0 0 ' + pt(31, 25) + '"></path>';
  svg += '<text class="kc-dir"><textPath href="#kc-fifths-path" startOffset="50%" text-anchor="middle">Fifths</textPath></text>';
  svg += '<text class="kc-dir"><textPath href="#kc-fourths-path" startOffset="50%" text-anchor="middle">Fourths</textPath></text>';
  return svg + '</svg>';
}

function keyCard(){
  var today = todayKey(), tk = improvKeyOfDay();
  var sel = ui.dailyKey || today || { m: 'min', i: 0 };
  var isToday = !!today && sel.m === today.m && sel.i === today.i;
  var notes = spellKey(RING[sel.m][sel.i], sel.m);
  var html = '<section class="daily-card daily-key-card" aria-label="Key">' +
    '<div class="dc-head dc-head-key"><span class="dc-label purple">' + (isToday ? "Today's key" : 'Key') + '</span>' +
    (isToday ? '<span class="dc-aside">' + tk.t + '</span>'
      : (today ? '<button type="button" class="dc-today" data-action="keytoday">' + svg(BACK) + 'Today: ' + keyLabel(today.m, today.i) + '</button>' : '')) +
    '</div>' +
    '<div class="dc-keyname">' + keyLabel(sel.m, sel.i) + '</div>' +
    '<div class="kc">' + circleSvg(sel);
  ['maj', 'min'].forEach(function(m){
    RING[m].forEach(function(t, i){
      var on = sel.m === m && sel.i === i, rel = !on && sel.i === i;
      html += '<button type="button" class="kc-key kc-' + m + ' kc-' + m + '-' + i + (on ? ' on' : '') + (rel ? ' rel' : '') + '" data-action="keypick" data-mode="' + m + '" data-i="' + i + '"' +
        ' aria-label="' + keyLabel(m, i) + '" aria-pressed="' + on + '">' + pretty(t) + (m === 'min' ? 'm' : '') + '</button>';
    });
  });
  html += '</div>';
  html += '<div class="kc-degrees">' + notes.map(function(n, k){
    return '<div class="kc-deg' + (k === 0 ? ' root' : '') + '"><span class="kc-num">' + NUMERALS[sel.m][k] + '</span><span class="kc-chord">' + pretty(n) + QUALITY[sel.m][k] + '</span></div>';
  }).join('') + '</div>';
  html += '<p class="dc-foot dc-center">Tap a key on the circle to see its notes and chords.</p>';
  return html + '</section>';
}

export function renderDailySide(day){
  // With the BHGS pack off the micro-doses (BHGS content, D113) are left out; the KEY card stays.
  return '<aside class="daily-side">' + (BHGS_PACK ? microCard(day) : '') + keyCard() + '</aside>';
}
