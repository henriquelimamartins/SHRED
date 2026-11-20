// IMPROVISATION view (the 5 Gates).
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
import { IMPROV_GATES } from "../data/improv.js?v=2";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { pageHeader } from "./shell.js?v=10";
import { renderRail, improvRail } from "./rails.js?v=12";

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
  var d = new Date();
  var dayOfYear = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000);
  var dayIndex = dayOfYear % IMPROV_KEYS.length;
  return IMPROV_KEYS[dayIndex];
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
    if(ex[l[0]]) html += '<div class="ex-line ex-line-' + l[0] + '"><dt>' + l[1] + '</dt><dd>' + ex[l[0]] + '</dd></div>';
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
    '<p class="improv-target-help">Play every exercise below in <b>' + tKey.k + '</b> today. Notes in the rules come from an example key, ' +
    'with their degrees in brackets: play the degrees. This breaks vertical habits and builds true neck mastery.</p>' +
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
  html+='<p class="improv-lede">Destroy your muscle memory. This is your progressive masterclass to unlock pure musical audiation. Do not advance until you master every exercise in a Gate.</p>';

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
