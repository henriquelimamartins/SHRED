// IMPROVISATION view (the 5 Gates).
// Slice 4.8c3 (D146): the Review queue for DAILY (improvReviewPicks) and the new intro line (D145 point 5).
// Slice 4.8c (D132 point 3, D139): as drawn on the 4.6 boards. Desktop: the current Gate card on the left; the Daily
// Transposition Target and the list of the 5 Gates on the right (stacked when narrow). Phone: target, Gate card, list.
// Each exercise shows its lines (CHANGES, SCALE, TUNING, METER, TRACK, RULE) and a listening box (D140: one or two
// references, each labelled Verified analysis / Stylistic association); the
// example key is gone (the target gives the key). Passed Gates open in place in the list; locked Gates show a lock.
// Same actions and stored keys as before (togimprov, advanceimprov, toggleacc improvG{i}); showing the page writes nothing.
// `exerciseLines`, `listenBox` and `masteryButton` are shared with LIBRARY's Expression Track (one source of text).
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Slice 4.4: Improv rail on top (phone).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { pageHeader } from "./shell.js?v=15";
import { renderRail, improvRail } from "./rails.js?v=17";

// The Daily Transposition Target (one key per day of the year). Slice 4.5c (D129): moved out of renderImprov()
// unchanged so HOME's "Today's Improv" card shows the same key as this page.
export function improvKeyOfDay(){
  var IMPROV_KEYS = [
    {k:"E minor", t:"Classic Heavy / Thrash"},
    {k:"B minor", t:"Prog / Melodic Death"},
    {k:"C# minor", t:"Sabbath / Doom Core"},
    {k:"C minor", t:"Sludge / Heavy Drop"},
    {k:"A minor", t:"Neoclassical / Classic Rock"},
    {k:"D minor", t:"Opeth / Dark Prog"},
    {k:"G minor", t:"Groove Metal"},
    {k:"F# minor", t:"Technical / Prog"},
    {k:"Bb minor", t:"Drop Bb Death Metal"},
    {k:"Eb minor", t:"Hendrix / Dark Blues"},
    {k:"G# minor", t:"Modern Metal"},
    {k:"F minor", t:"Moody / Symphonic"}
  ];
  var dayIndex = improvDayOfYear() % IMPROV_KEYS.length;
  return IMPROV_KEYS[dayIndex];
}

// Day of the year (local day), the clock of every daily rotation on this page. Same formula as before (4.8c2 moved it).
function improvDayOfYear(){
  var d = new Date();
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000);
}

// Slice 4.8c2 (D142): the string of "One-String Doom" and the pentatonic box of "The 4-Fret Box" rotate by day, like
// the key. 12 keys and 5 boxes share no divisor, so all 60 key/box pairs come round in 60 days; the string moves on
// every 12 days, so each key meets each of the 4 strings. Nothing is stored.
var ONE_STRINGS = ['G', 'D', 'B', 'A'];
// Root fret on the low E string (0–11) for each key of the day.
var ROOT_FRET = { 'E': 0, 'F': 1, 'F#': 2, 'G': 3, 'G#': 4, 'A': 5, 'Bb': 6, 'B': 7, 'C': 8, 'C#': 9, 'D': 10, 'Eb': 11 };
// Fret span of each minor-pentatonic box relative to that root (box 1 = root on the low E string; box 3 has a one-fret
// stretch). Checked by the music-theory verifier (D134), whose 12-key table is in tests/improv-fixes.spec.js.
var BOX_SPANS = [[0, 3], [2, 5], [4, 8], [7, 10], [9, 12]];
// The box between frets 1 and 17, no open strings; the lower placement when two fit.
export function boxFrets(root, box){
  var r = ROOT_FRET[root], span = BOX_SPANS[box];
  for(var shift = -12; shift <= 12; shift += 12){
    var lo = r + span[0] + shift, hi = r + span[1] + shift;
    if(lo >= 1 && hi <= 17) return [lo, hi];
  }
  return null;
}
export function improvDayContext(){
  var day = improvDayOfYear();
  var key = improvKeyOfDay();
  var root = key.k.split(' ')[0];
  var box = day % 5;
  var frets = boxFrets(root, box), lo = frets[0], hi = frets[1];
  return {
    root: root,
    oneString: ONE_STRINGS[Math.floor(day / 12) % ONE_STRINGS.length],
    box: box + 1, boxFrom: lo, boxTo: hi,
    boxFrets: lo + ' and ' + hi,
    boxName: 'box ' + (box + 1) + ' of the ' + key.k + ' pentatonic'
  };
}
// Slice 4.8c3 (D146): the Review part of DAILY's Improv block. One or more already-Mastered exercises come back,
// driven by practice, not by the calendar: the queue moves by the review slots of the days logged in `streakDates`
// before today (Tue, Wed, Fri 1; Sun 3; Mon, Thu, Sat 0, the days without an Improv block), so missed days skip
// nothing and today's pick never changes when today is ticked. The pool is walked in rounds: each round visits every
// Mastered exercise once, in an order shuffled per round from a fixed seed, so no exercise is tied to a weekday.
// Reads only; nothing is stored.
export var REVIEW_SLOTS = { Tue: 1, Wed: 1, Fri: 1, Sun: 3 };
var WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Every exercise marked Mastered, from every Gate, in data order.
export function reviewPool(){
  var pool = [], checks = state.improvChecks || {};
  IMPROV_GATES.forEach(function(g, gi){
    g.exercises.forEach(function(ex, ei){
      if(checks["g" + gi + "e" + ei] === true) pool.push({ g: gi, e: ei, ex: ex });
    });
  });
  return pool;
}
// Review slots used by the days practised before today (local days, YYYY-MM-DD).
export function reviewQueuePosition(today){
  var seen = {}, n = 0, dates = Array.isArray(state.streakDates) ? state.streakDates : [];
  dates.forEach(function(d){
    if(typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= today || seen[d]) return;
    seen[d] = true;
    var p = d.split('-');
    n += REVIEW_SLOTS[WEEKDAY_KEYS[new Date(+p[0], +p[1] - 1, +p[2]).getDay()]] || 0;
  });
  return n;
}
// The order of round `round` over `size` exercises: a Fisher–Yates shuffle from a fixed seed (mulberry32).
export function reviewRoundOrder(size, round){
  var a = Math.imul(round + 1, 0x9E3779B1) | 0;
  function rnd(){
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  var order = [];
  for(var i = 0; i < size; i++) order.push(i);
  for(var j = size - 1; j > 0; j--){ var k = Math.floor(rnd() * (j + 1)), tmp = order[j]; order[j] = order[k]; order[k] = tmp; }
  return order;
}
// The exercises the session of `day` reviews next: up to its slots, all different.
export function improvReviewPicks(day, today){
  var pool = reviewPool(), want = REVIEW_SLOTS[day] || 0;
  if(!pool.length || !want) return [];
  var size = pool.length, start = reviewQueuePosition(today), picks = [], taken = {};
  for(var j = 0; picks.length < Math.min(want, size) && j < want + 3; j++){
    var s = start + j, i = reviewRoundOrder(size, Math.floor(s / size))[s % size];
    if(taken[i]) continue;
    taken[i] = true;
    picks.push(pool[i]);
  }
  return picks;
}

function fillRule(text){
  if(text.indexOf('{') < 0) return text;
  var c = improvDayContext();
  return text.replace(/\{(oneString|boxFrets|boxName)\}/g, function(m, k){ return '<b class="ex-today">' + c[k] + '</b>'; });
}

// Line icons as drawn on the boards (same stroke style as the shell icons).
var IMPROV_ICONS = {
  listen: 'M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  unlock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 5.8-1',
  check: 'M5 12l5 5 9-10',
  chevron: 'M9 6l6 6-6 6'
};
function improvIcon(name, cls){
  return '<svg class="ico ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + IMPROV_ICONS[name] + '"></path></svg>';
}

// The lines of one exercise, in the order of the boards; only the lines the exercise has.
var EX_LINES = [['changes', 'Changes'], ['scale', 'Scale'], ['tuning', 'Tuning'], ['meter', 'Meter'], ['track', 'Track'], ['rule', 'Rule']];
export function exerciseLines(ex){
  var html = '<dl class="ex-lines">';
  EX_LINES.forEach(function(l){
    if(ex[l[0]]) html += '<div class="ex-line ex-line-' + l[0] + '"><dt>' + l[1] + '</dt><dd>' + (l[0] === 'rule' ? fillRule(ex.rule) : ex[l[0]]) + '</dd></div>';
  });
  return html + '</dl>';
}

// The listening references in one box (D139 point 7, D140): each with its classification label, by and note.
var REF_LABELS = { verified: 'Verified analysis', stylistic: 'Stylistic association' };
export function listenBox(ex){
  var items = ex.refs.map(function(r){
    return '<li class="ex-ref" data-kind="' + r.kind + '"><span class="ex-listen-label">' + REF_LABELS[r.kind] + '</span>' +
      '<p><b>' + r.by + '</b> \u00b7 ' + r.listen + '</p></li>';
  }).join('');
  return '<div class="ex-listen" role="group" aria-label="Listening">' + improvIcon('listen', 'ex-listen-ic') +
    '<ul class="ex-refs">' + items + '</ul></div>';
}

// The Mastered / Unmastered button (same action and text as before; the app's usual shape, D139 point 6).
export function masteryButton(g, e){
  var isChecked = !!state.improvChecks["g" + g + "e" + e];
  return '<button class="mbtn purple' + (isChecked ? " on" : "") + '" data-action="togimprov" data-g="' + g + '" data-e="' + e + '" aria-pressed="' + isChecked + '">' +
    (isChecked ? "✓ Mastered" : "Unmastered") + '</button>';
}

function targetCard(tKey){
  return '<section class="improv-target" aria-label="Daily Transposition Target">' +
    '<div class="improv-target-label">Daily Transposition Target</div>' +
    '<div class="improv-target-key"><b class="improv-key">' + tKey.k + '</b><span class="improv-style">' + tKey.t + '</span></div>' +
    '<p class="improv-target-help">Play every exercise below on today\'s root, <b>' + tKey.k.split(' ')[0] + '</b>: in <b>' + tKey.k + '</b>, or in the scale its SCALE line names. ' +
    'Notes and chords in the rules come from an example key, with their degrees in brackets: play the degrees. This breaks vertical habits and builds true neck mastery.</p>' +
    '</section>';
}

function gateCard(g, i){
  var done = 0;
  var rows = g.exercises.map(function(ex, j){
    var isChecked = !!state.improvChecks["g" + i + "e" + j];
    if(isChecked) done++;
    return '<li class="improv-ex' + (isChecked ? ' done' : '') + '">' +
      '<div class="ex-head"><h3 class="ex-title">' + ex.t + '</h3><div class="ex-btn">' + masteryButton(i, j) + '</div></div>' +
      exerciseLines(ex) + listenBox(ex) + '</li>';
  }).join('');
  var html = '<section class="improv-gate" data-gate="' + i + '">' +
    '<div class="improv-gate-head"><h2 class="improv-gate-title">Gate ' + (i + 1) + ' · ' + g.title + '</h2>' +
    '<span class="improv-gate-count">' + done + ' of ' + g.exercises.length + ' mastered</span></div>' +
    '<p class="improv-gate-desc">' + g.desc + '</p>' +
    '<ul class="improv-exs">' + rows + '</ul>';
  if(done === g.exercises.length){
    html += '<button class="tbtn purple improv-unlock" data-action="advanceimprov">' + improvIcon('unlock', 'improv-unlock-ic') + 'Unlock Gate ' + (i + 2) + '</button>';
  }
  return html + '</section>';
}

// The list of the 5 Gates: passed (open in place to list their exercises, as before), current, locked.
function gatesList(actGate, allDone){
  var html = '<section class="improv-list"><h2 class="improv-list-title gates-title">The 5 Gates of Freedom</h2>';
  IMPROV_GATES.forEach(function(g, i){
    var isPast = i < state.improvIndex;
    var isCur = i === actGate && !allDone;
    var name = '<span class="improv-row-gate">Gate ' + (i + 1) + '</span><span class="improv-row-name">' + g.title + '</span>';
    if(isPast){
      var acc = 'improvG' + i, open = !!ui.lib[acc];
      html += '<div class="improv-row-wrap' + (open ? ' open' : '') + '">' +
        '<button type="button" class="improv-row passed" data-action="toggleacc" data-acc="' + acc + '" aria-expanded="' + open + '">' + name +
        '<span class="improv-row-state">' + improvIcon('check', 'improv-row-check') + 'Mastered</span>' +
        '<span class="chev' + (open ? ' open' : '') + '">' + improvIcon('chevron', 'improv-chev') + '</span></button>';
      if(open){
        html += '<ul class="improv-row-body">' + g.exercises.map(function(ex){ return '<li class="done-ex">' + ex.t + '</li>'; }).join('') + '</ul>';
      }
      html += '</div>';
    } else if(isCur){
      var n = 0;
      g.exercises.forEach(function(ex, j){ if(state.improvChecks["g" + i + "e" + j]) n++; });
      html += '<div class="improv-row cur" aria-current="step">' + name + '<span class="improv-row-state">Current · ' + n + ' of ' + g.exercises.length + '</span></div>';
    } else {
      html += '<div class="improv-row locked">' + name + '<span class="improv-row-lock" role="img" aria-label="Locked">' + improvIcon('lock', 'improv-lock-ic') + '</span></div>';
    }
  });
  return html + '</section>';
}

export function renderImprov(){
  // Slice 4.4 (D117, D123): the Improv rail at the top of the page on the phone (the desktop sidebar shows it).
  var html=pageHeader('Pillar · Musical Development','Improvisation');
  html+='<div class="pillar-rail">'+renderRail(improvRail())+'</div>';
  html+='<p class="improv-lede">Use the boxes and positions you know without being tied to them. Five Gates of constraints train your ear to lead your hands, in a new key every day. Mark every exercise of a Gate Mastered to open the next; mastered exercises come back in DAILY as review.</p>';

  var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
  var allDone = state.improvIndex >= IMPROV_GATES.length;

  html += '<div class="improv-cols">';
  if(allDone){
    html += '<section class="improv-done">' + improvIcon('check', 'improv-done-ic') +
      '<div><b>YOU HAVE MASTERED THE 5 GATES!</b><p>You are now a free player. Keep using these tools in your daily jams.</p></div></section>';
  } else {
    html += targetCard(improvKeyOfDay());
    html += gateCard(IMPROV_GATES[actGate], actGate);
  }
  html += gatesList(actGate, allDone);
  return html + '</div>';
}
