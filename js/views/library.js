// LIBRARY view.
// Slice 4.8a (D132 point 4, D137): LIBRARY as drawn on the 4.6 boards. Each section is a card row that opens in place
// (a button with aria-expanded); inside, groups are cards side by side on desktop and stacked on the phone; Watched
// marks are pills; documents show a file icon and their kind; the Listening Vault uses the app red (purple only for the
// Expression Track); on the phone with the BHGS pack on, "‹ More" leads back to MORE (LIBRARY lives there; helper in shell.js since 4.8b).
// Slice 4.8c (D139 point 5): Expression Track exercises use IMPROVISATION's lines, button and listening box.
// Guide: "How This App Works" rewritten with the owner (D120, D137); texts, links, buttons and stored keys otherwise unchanged.
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Slice 4.3 (D112, D122): the Shred Roadmap section (phases and Essential Skills) moved to the TECHNIQUE page.
// Slice 4.2b (D113): with the BHGS pack off, the BHGS sections (Shred Roadmap, Theory Track, Creative, Bonus Content),
// the Weekly Rhythm and the BHGS guide text are hidden; Expression Track, Listening Vault and the guide stay.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { CREATIVE, THEORY_DOCS, THEORY_ROOT_ITEMS, THEORY_GROUPS, WEEKLY_RHYTHM } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { exerciseLines, listenBox, masteryButton } from "./improv.js?v=24";
import { LISTENING_VAULT } from "../data/listening.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=2";
import { BHGS_PACK } from "../pack.js?v=1";
import { pageHeader, backToMore } from "./shell.js?v=16";
import { watchItem, linked, renderBonusList } from "./components.js?v=33";

// Line icons as drawn on the boards (same stroke style as the shell icons).
var LIB_ICONS = {
  chevron: 'M9 6l6 6-6 6',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4'
};
function libIcon(name, cls){
  return '<svg class="ico ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + LIB_ICONS[name] + '"></path></svg>';
}

// A document row: file icon, link and its kind (PDF for the app's own PDFs, Doc for an online document).
function docRow(label, url){
  var kind = /\.pdf$/i.test(url) ? 'PDF' : 'Doc';
  return '<li class="docli lib-doc">' + libIcon('file', 'lib-doc-ic') +
    '<div class="itxt">' + linked(label, url) + '</div>' +
    '<span class="lib-doc-kind">' + kind + '</span></li>';
}

// A section row that opens in place. `cls` adds a colour role (e.g. "lib-sec-improv").
function section(acc, title, sub, body, cls){
  var open = !!ui.lib[acc];
  var html = '<div class="acc lib-sec' + (cls ? ' ' + cls : '') + (open ? ' open' : '') + '">' +
    '<button type="button" class="acchead lib-head" data-action="toggleacc" data-acc="' + acc + '" aria-expanded="' + open + '">' +
    '<b>' + title + '</b><span class="acc-right">' + (sub ? '<span class="acc-sub">' + sub + '</span>' : '') +
    '<span class="chev' + (open ? ' open' : '') + '">' + libIcon('chevron', 'lib-chev') + '</span></span></button>';
  if(open) html += '<div class="accbody lib-body">' + body() + '</div>';
  return html + '</div>';
}

// A group card inside a section (title optional).
function group(title, inner, cls){
  return '<div class="lib-group' + (cls ? ' ' + cls : '') + '">' + (title ? '<h3>' + title + '</h3>' : '') + inner + '</div>';
}

function theoryBody(){
  var first = THEORY_DOCS.map(function(d){ return docRow(d.t, d.url); }).join('') +
    THEORY_ROOT_ITEMS.map(function(t){ return watchItem(t.t, t.key, t.url); }).join('');
  var html = group('Start Here', '<ul class="check">' + first + '</ul>');
  THEORY_GROUPS.forEach(function(g){
    var rows = (g.docs || []).map(function(d){ return docRow(d.t, d.url); }).join('') +
      g.items.map(function(t){ return watchItem(t.t, t.key, t.url); }).join('');
    html += group(g.title, '<ul class="check">' + rows + '</ul>');
  });
  return '<div class="lib-groups">' + html + '</div>';
}

function expressionBody(){
  var html = '';
  IMPROV_GATES.forEach(function(g, i){
    var acc = 'libGate' + i, gateOpen = !!ui.lib[acc];
    html += '<div class="acc lib-gate' + (gateOpen ? ' open' : '') + '">' +
      '<button type="button" class="acchead lib-gate-head" data-action="toggleacc" data-acc="' + acc + '" aria-expanded="' + gateOpen + '">' +
      '<b class="improv">Gate ' + (i + 1) + ': ' + g.title + '</b><span class="acc-right"><span class="chev' + (gateOpen ? ' open' : '') + '">' +
      libIcon('chevron', 'lib-chev') + '</span></span></button>';
    if(gateOpen){
      html += '<div class="accbody lib-gate-body">';
      html += '<p class="lib-gate-desc">' + g.desc + '</p>';
      html += '<ul class="check">';
      g.exercises.forEach(function(ex, j){
        // Slice 4.8c (D139 point 5): the same lines, button and listening box as IMPROVISATION (shared helpers).
        html += '<li class="mrow mrow-stack">' +
          '<div class="ex-head">' +
            '<b class="ex-title">' + ex.t + '</b>' +
            '<div class="ex-btn">' + masteryButton(i, j) + '</div>' +
          '</div>' +
          exerciseLines(ex) + listenBox(ex) +
          '</li>';
      });
      html += '</ul></div>';
    }
    html += '</div>';
  });
  return '<div class="lib-gates">' + html + '</div>';
}

function listeningBody(){
  return '<div class="lib-groups lib-groups-wide">' + LISTENING_VAULT.map(function(g){
    var items = g.items.map(function(item){
      return '<li class="vault-item"><b class="vault-title">' + item.t + '</b><span class="vault-desc">' + item.desc + '</span></li>';
    }).join('');
    return group(g.category, '<ul class="plain-list">' + items + '</ul>', 'lib-group-vault');
  }).join('') + '</div>';
}

function creativeBody(){
  return '<div class="lib-groups">' +
    group('Songwriting', '<ul class="check">' + CREATIVE.songwriting.map(function(t, j){ return watchItem(t.t, "creative.sw." + j, t.url); }).join("") + '</ul>') +
    group('Production', '<ul class="check">' + CREATIVE.production.map(function(t, j){ return watchItem(t.t, "creative.pr." + j, t.url); }).join("") + '</ul>') +
    '</div>';
}

function bonusBody(){
  return '<div class="lib-groups">' + group('', renderBonusList(), 'lib-group-bonus') + '</div>';
}

// Guide texts (D120, D137, owner-approved 2026-11-15). Pages in capitals, pillars with an initial capital,
// "Phase" / "Gate" capitalised only as names.
function paras(list){ return list.map(function(p){ return '<p>' + p + '</p>'; }).join(''); }

function guideBody(){
  var html = '<div class="lib-groups lib-groups-guide">';
  if(BHGS_PACK){
    html += group('How This App Works', paras([
      'The app rests on three pillars: Technique, Improvisation and Theory. DAILY tells you what to practise each day; HOME shows today\'s session, your streak and the calendar.',
      'Technique follows the BHGS Roadmap in order. Phase 0 sets up your prerequisites, warm-up and a baseline test; then, whatever your level, you start at Phase 1 and work through every exercise, chop-builder and solo of a phase before moving on, up to Phase 4. Each of Phases 1 to 4 is complete when every checklist item is mastered, the chop-builder targets are reached and all 6 categories of the Phase Transition Test, including the Ultimate Technique Workout, are at the required level.',
      'Improvisation has its own track: on the IMPROV page you work through 5 Gates, playing every exercise in the key of the day. Exercises you have marked Mastered come back as a short review in DAILY\'s Improvisation block.',
      'Theory is always open: it never locks anything in Technique or Improvisation.',
      'The progress rails show where you stand: BHGS Roadmap for Technique, Musical Development for Improvisation and Theory. Each pillar is counted on its own, never mixed.'
    ]), 'lib-group-text');
    html += group('Weekly Rhythm', '<table class="info"><tr><th>Day</th><th>Focused</th><th>Casual / Improv</th></tr>' +
      WEEKLY_RHYTHM.map(function(r){ return '<tr><td class="day">' + r.day + '</td><td>' + r.focused + '</td><td>' + r.casual + '</td></tr>'; }).join("") +
      '</table>');
    html += '</div>';
    html += '<p class="lib-credit">Technique content (phases, exercises, chop-builders, the Phase Transition Test, and the Technique blocks and micro-doses in DAILY) follows <b>Bradley Hall\'s Guitar School</b> (BHGS) Official Roadmap; the Theory Track, Creative and Bonus Content videos here in LIBRARY are BHGS lessons too. Video links open on Patreon and need a BHGS membership. The daily routine and the Improvisation and Theory pillars are this app\'s own.</p>';
    return html;
  }
  html += group('How This App Works', paras([
    'The app rests on two pillars: Improvisation and Theory. DAILY tells you what to practise each day; HOME shows today\'s session, your streak and the calendar.',
    'Improvisation has its own track: on the IMPROV page you work through 5 Gates, playing every exercise in the key of the day. Exercises you have marked Mastered come back as a short review in DAILY\'s Improvisation block. Here in LIBRARY, the Expression Track lists the same exercises and the Listening Vault gathers listening references.',
    'Theory is always open: it never locks anything in Improvisation.',
    'The Musical Development rails show where you stand in each pillar, each counted on its own.'
  ]), 'lib-group-text');
  return html + '</div>';
}

export function renderLibrary(){
  // Phone with the pack on: LIBRARY is reached from MORE, so the board shows "‹ More" instead of the eyebrow.
  var html = BHGS_PACK ? backToMore() : '';
  html += pageHeader('Reference &amp; Review', 'Library');
  html += '<p class="lede lib-lede">Browse and check off any item, anytime - it all counts toward the same progress as Daily Practice.</p>';

  if(BHGS_PACK) html += section('theory', 'Theory Track', 'Intervals, Modes &amp; Chords', theoryBody);
  html += section('expression', 'Expression Track', 'The 5 Gates', expressionBody, 'lib-sec-improv');
  html += section('listening', 'Listening Vault', 'Inspiration &amp; Refs', listeningBody);
  if(BHGS_PACK){
    html += section('creative', 'Creative', 'Songwriting &amp; Production', creativeBody);
    html += section('bonuslib', 'Bonus Content', 'Extras &amp; Workouts', bonusBody);
  }
  html += '<hr class="divider lib-divider">';
  html += section('guide', 'Guide &amp; Info', 'App Instructions', guideBody);
  return html;
}
