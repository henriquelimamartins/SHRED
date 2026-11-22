// SETUP view (Guitar Setup Companion), shown as TOOLS · Guitar Setup.
// Slice 4.8b (D132 point 5, D138): as drawn on the 4.6 boards. Guitar and tuning as labelled fields; the Recommended
// Measurements as tiles at the top (one row on desktop, two columns on the phone); the note names the chosen guitar,
// tuning and scale (it always said "E standard ... 25\" scale" before); the steps numbered, one row each, so a figure
// (I12) can later sit beside each step; "‹ More" on the phone. Values come from data/setup.js, unchanged.
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { setupData } from "../data/setup.js?v=1";
import { pageHeader, backToMore } from "./shell.js?v=19";
import { state } from "../store.js?v=5";

// Tunings offered, in menu order (owner, D138: all six kept until I01).
export const TUNINGS = [
  ["e_std", "E Standard"], ["drop_d", "Drop D"], ["d_std", "D Standard"],
  ["drop_c", "Drop C"], ["c_std", "C Standard"], ["dadfae", "DADFAE"]
];
export function tuningLabel(key){
  for (var i = 0; i < TUNINGS.length; i++) if (TUNINGS[i][0] === key) return TUNINGS[i][1];
  return key;
}

export function formatGauge(g){
  var inches = gaugeInches(g);
  return inches === g ? g : inches + ' (' + g + ')';
}
// "10-46" -> '0.010" - 0.046"' (anything else is returned as it is).
export function gaugeInches(g){
  var parts = g.split('-');
  if(parts.length === 2) {
    var p1 = parseInt(parts[0], 10);
    var p2 = parseInt(parts[1], 10);
    var s1 = (p1 >= 10 && p1 <= 19) ? "0.0" + p1 : "0." + p1;
    var s2 = (p2 >= 10 && p2 <= 99) ? "0.0" + p2 : "0." + p2;
    return s1 + '" - ' + s2 + '"';
  }
  return g;
}

function esc(t){ return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

var VIDEO_ICON = '<svg class="ico btn-video-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v12H4zM10 9.5l5 2.5-5 2.5z"></path></svg>';

function field(label, action, options, value){
  return '<label class="setup-field"><span class="setup-field-label">' + label + '</span><span class="setup-select-wrap">' +
    '<select class="select setup-select" data-action="' + action + '">' +
    options.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === value ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
    '</select></label>';
}

function tile(label, value, sub){
  return '<div class="setup-tile"><div class="setup-tile-label">' + label + '</div><div class="setup-tile-val">' + value + '</div><div class="setup-tile-sub">' + sub + '</div></div>';
}

// The measurement tiles (labels as drawn on the 4.6 boards).
export function setupTiles(guitar, conf){
  var t = [tile('String Gauge', conf.gauge, gaugeInches(conf.gauge))];
  if(guitar === "prs") t.push(tile('Tremolo Float', '1.6 mm', '1/16" off body'));
  t.push(tile('Neck Relief', conf.relief + ' mm', 'at 8th fret'));
  t.push(tile('Action · Low E', conf.actBass + ' mm', 'at 12th fret'));
  t.push(tile('Action · High E', conf.actTreb + ' mm', 'at 12th fret'));
  t.push(tile('Pickup · Neck', '2.5 mm', 'to string'));
  t.push(tile('Pickup · Bridge', '1.5 mm', 'to string'));
  return t;
}

// The steps for the chosen guitar and tuning: { title, paras: [html] }.
// Texts rewritten in 4.8b with the owner (D138) and checked by the content verifier (D134) against PRS's published
// setup guides (support.prsguitars.com: step-by-step setup, SE specifications, PRS Tremolo, neck relief, pickup height)
// and StewMac (Tune-o-matic); values still come from data/setup.js.
export function setupSteps(guitar, conf){
  var isPrs = guitar === "prs";
  var g = setupData[guitar];
  var steps = [];
  steps.push({ title: 'Remove Strings and Clean', paras: [
    'Take the old strings off and clean the fretboard and frets. About every six months, if an unfinished fretboard (rosewood, laurel, ebony) looks dry, wipe on a thin coat of fretboard conditioner, leave it for 10 minutes, then wipe off the excess. Never oil a lacquered maple fretboard. Clean the body and hardware with instrument-safe products.',
    'While the strings are off, put a little nut lubricant (or graphite from a soft pencil) into each nut slot, so the strings slide freely instead of sticking and pinging.'
  ]});
  steps.push({ title: 'Restring and Stretch', paras: [
    'Fit the new strings, seat each one in its saddle slot, and tune up to pitch from below. Stretch each string by gently pulling it away from the fretboard along its length, then retune; repeat until it stays in tune. Measuring before the strings settle gives false readings.'
  ]});
  if(isPrs) steps.push({ title: 'Set the Tremolo Float', paras: [
    'The PRS tremolo sits parallel to the body, with a gap of about 1.6 mm (1/16") underneath it. To change it, remove the back cavity cover and turn the two claw screws about a quarter turn at a time: tighten to pull the bridge down, loosen to let it rise. Retune after every turn, because the strings and springs balance each other.',
    'If you change the saddle heights later, check the float again.'
  ]});
  steps.push({ title: 'Adjust Neck Relief (Truss Rod)', paras: [
    'Capo the 1st fret and hold the Low E down at the last fret. At the 8th fret, measure the gap between the bottom of the string and the top of the fret with a feeler gauge: aim for <b>' + conf.relief + ' mm</b>.',
    'Too much gap: tighten the truss rod (clockwise, looking at the headstock) an eighth of a turn at a time. No gap: loosen it (anticlockwise). Retune and give the neck a few minutes to settle before measuring again.'
  ]});
  steps.push({ title: 'Set the String Action', paras: [
    'Measure at the 12th fret, from the top of the fret to the bottom of the string. Set the Low E to <b>' + conf.actBass + ' mm</b> and the High E to <b>' + conf.actTreb + ' - ' + (conf.actTreb + 0.1).toFixed(1) + ' mm</b>.',
    (isPrs
      ? 'Raise or lower each saddle with the small Allen key on its height screws, and set the middle strings so the saddles follow the ' + g.radius + ' fretboard radius.'
      : 'Turn the two thumbwheels of the Tune-o-matic bridge: the bass-side wheel sets the Low E, the treble-side wheel the High E. The saddles already follow the ' + g.radius + ' fretboard radius.') +
    ' Then bend the High E a step and a half above the 15th fret: if the note chokes, raise that side slightly.'
  ]});
  steps.push({ title: 'Set Intonation', paras: [
    'Do this once the action is set. Tune the open string, then compare the note fretted at the 12th fret with the 12th-fret harmonic. If the fretted note is <b>sharp</b>, move the saddle <b>away from the neck</b>; if it is <b>flat</b>, move it <b>towards the neck</b>. ' +
    (isPrs ? 'On the PRS tremolo the intonation screws are at the back of the bridge.' : 'On the Tune-o-matic the intonation screws face the neck.') +
    ' Retune the open string after every adjustment and repeat until both match.'
  ]});
  steps.push({ title: 'Adjust Pickup Height', paras: [
    'Hold the Low E down at the last fret (' + (isPrs ? '24th' : '22nd') + ') and measure from the top of the pickup to the bottom of the string; repeat with the High E. With the height screws, set the bass side to <b>2.5 mm</b> and the treble side to <b>1.5 mm</b>.',
    'Too close, and the magnets pull on the strings: sustain suffers and notes can go out of tune. Keeping the bass side a little lower keeps the low end tight under high gain.'
  ]});
  return steps;
}

export function setupLede(){
  return 'Work through these steps in order: each one changes what the next one measures. The goal is a low action for fast playing without fret buzz.';
}

export function setupNote(guitar, tuning, conf){
  var g = setupData[guitar];
  return '<b>Note:</b> These targets suit ' + conf.gauge + ' strings in ' + tuningLabel(tuning) + ' on the ' + g.name + ' (' + g.scale + ' scale). Treat them as a starting point: if a note buzzes or chokes, raise that side a little.';
}

export function renderSetup(){
  var guitar = state.setupGuitar, tuning = state.setupTuning;
  var isPrs = guitar === "prs";
  var conf = setupData[guitar][tuning];

  var html = backToMore();
  html += pageHeader('Tools · Gear optimization', 'Guitar Setup');

  html += '<div class="setup-fields">' +
    field('Guitar', 'setGuitar', [["prs", 'PRS (25")'], ["epi", 'Les Paul (24.75")']], guitar) +
    field('Tuning', 'setTuning', TUNINGS, tuning) + '</div>';

  html += '<section class="setup-measure" aria-labelledby="setup-measure-title"><h2 id="setup-measure-title" class="setup-measure-title">Recommended Measurements</h2>' +
    '<div class="setup-tiles">' + setupTiles(guitar, conf).join('') + '</div></section>';

  var steps = setupSteps(guitar, conf);
  var vidUrl = isPrs ? 'https://www.youtube.com/watch?v=wmoc9ksdZdE' : 'https://www.youtube.com/watch?v=3Dhn56ybQHg';
  var vidTitle = isPrs ? 'Official PRS Setup Guide' : 'Epiphone Les Paul Setup Guide';

  html += '<div class="setup-cols">';
  html += '<p class="lede setup-lede">' + setupLede() + '</p>';
  html += '<div class="note setup-note">' + setupNote(guitar, tuning, conf) + '</div>';
  html += '<ol class="setup-steps" aria-label="Steps">' + steps.map(function(s, i){
    return '<li class="setup-step"><span class="setup-num" aria-hidden="true">' + (i + 1) + '</span><div class="setup-step-body">' +
      '<h3 class="setup-step-title">' + s.title + '</h3>' + s.paras.map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div></li>';
  }).join('') + '</ol>';
  html += '<button class="tbtn primary btn-video setup-video" data-action="openvideo" data-url="' + esc(vidUrl) + '">' + VIDEO_ICON + vidTitle + '</button>';
  html += '</div>';
  return html;
}
