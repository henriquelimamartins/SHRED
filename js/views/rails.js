// Pillar rails (slice 4.4, DECISIONS D19a, D116, D117, D123).
// One rail per pillar: TECHNIQUE (red, P0-P4), IMPROVISATION (purple, G1-G5), THEORY (blue, L1-L5); Improv and Theory sit
// under "MUSICAL DEVELOPMENT". Nodes: completed = filled disc; current = ring whose outline fills from the left along
// the top and the bottom at once; future = empty ring. The line between two nodes fills only once the earlier level
// is complete. Real values only (D71):
// - TECHNIQUE = the phase and phase % (same calculation as before, D20); hidden with the BHGS pack off (D113).
// - IMPROV = exactly what the IMPROV page shows (D116): the current Gate and its marked exercises.
// - THEORY = Level 1, "Not started" until Theory v1 (Phase 6); the legacy DOJO levels are not used (owner, D123).
// Drawn with SVG attributes and CSS classes only (no inline style), so the CSP can drop 'unsafe-inline' later (4.8).
import { PHASES } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { state } from "../store.js?v=5";
import { BHGS_PACK } from "../pack.js?v=1";
import { phasePercent } from "../logic/technique.js?v=36";

function clamp01(x){ return Math.max(0, Math.min(1, x)); }

export function techniqueRail(){
  var i = Math.min(state.phaseIndex, PHASES.length - 1), pct = phasePercent(i);
  return { id: "technique", label: "Technique", stage: "Phase " + i, status: pct + "%", cur: i, part: pct / 100, pct: pct, prefix: "P", start: 0 };
}

export function improvRail(){
  var n = IMPROV_GATES.length;
  if(state.improvIndex >= n) return { id: "improv", label: "Improvisation", stage: "Gate " + n, status: "Complete", cur: n, part: 1, pct: 100, prefix: "G", start: 1 };
  var g = Math.max(0, state.improvIndex), ex = IMPROV_GATES[g].exercises;
  var done = ex.filter(function(_, j){ return !!state.improvChecks["g" + g + "e" + j]; }).length;
  var part = ex.length ? done / ex.length : 0;
  return { id: "improv", label: "Improvisation", stage: "Gate " + (g + 1), status: done + "/" + ex.length, cur: g, part: part, pct: Math.round(part * 100), prefix: "G", start: 1 };
}

export function theoryRail(){
  return { id: "theory", label: "Theory", stage: "Level 1", status: "Not started", cur: 0, part: 0, pct: 0, prefix: "L", start: 1 };
}

// Ring outline filled from the left (9 o'clock) along the top and the bottom at once, up to `part` of the way.
function ringArcs(part){
  var r = 6.5, c = 8, a = clamp01(part) * Math.PI;
  if(a <= 0) return "";
  if(a >= Math.PI - 1e-6) return '<circle class="rn-fill" cx="8" cy="8" r="6.5"/>';
  var x = (c - r * Math.cos(a)).toFixed(3), yTop = (c - r * Math.sin(a)).toFixed(3), yBot = (c + r * Math.sin(a)).toFixed(3);
  return '<path class="rn-fill" d="M1.5 8 A6.5 6.5 0 0 1 ' + x + ' ' + yTop + '"/>' +
         '<path class="rn-fill" d="M1.5 8 A6.5 6.5 0 0 0 ' + x + ' ' + yBot + '"/>';
}

function node(i, rail){
  var svg = '<svg class="rn" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">';
  var st;
  if(i < rail.cur){ st = "done"; svg += '<circle class="rn-disc" cx="8" cy="8" r="8"/>'; }
  else if(i === rail.cur){ st = "current"; svg += '<circle class="rn-track" cx="8" cy="8" r="6.5"/>' + ringArcs(rail.part); }
  else { st = "future"; svg += '<circle class="rn-track" cx="8" cy="8" r="6.5"/>'; }
  return '<span class="rail-node" data-state="' + st + '">' + svg + '</svg></span>';
}

export function renderRail(rail){
  var nodes = "", labels = "";
  for(var i = 0; i < 5; i++){
    nodes += node(i, rail);
    labels += '<span class="' + (i === rail.cur ? "cur" : "") + '">' + rail.prefix + (i + rail.start) + '</span>';
  }
  var filled = Math.min(rail.cur, 4);
  return '<div class="rail rail-' + rail.id + '" data-rail="' + rail.id + '" data-cur="' + rail.cur + '" data-pct="' + rail.pct + '" role="img" aria-label="' +
    rail.label + ': ' + rail.stage + (rail.status ? ', ' + rail.status : '') + '">' +
    '<div class="rail-head"><span class="rail-name">' + rail.label + ' · <span class="rail-stage">' + rail.stage + '</span></span><span class="rail-status">' + rail.status + '</span></div>' +
    '<div class="rail-track"><span class="rail-line"></span><span class="rail-line-fill fill-' + filled + '"></span><span class="rail-nodes">' + nodes + '</span></div>' +
    '<div class="rail-labels" aria-hidden="true">' + labels + '</div></div>';
}

// The rails block: "BHGS ROADMAP" (Technique), then "MUSICAL DEVELOPMENT" (Improvisation, Theory); headings by the owner (D123). On HOME (desktop) the three rails
// sit side by side, with a vertical divider between Technique and Musical Development (owner, D123).
export function renderRails(where){
  var html = '<div class="rails rails-' + where + (BHGS_PACK ? '' : ' rails-nopack') + '">';
  if(BHGS_PACK) html += '<div class="rails-col rails-tech"><div class="rails-group">BHGS Roadmap</div>' + renderRail(techniqueRail()) + '</div>';
  html += '<div class="rails-col rails-md"><div class="rails-group">Musical Development</div><div class="rails-md-row">' + renderRail(improvRail()) + renderRail(theoryRail()) + '</div></div>';
  return html + '</div>';
}

// ---------- progress card and phone subtitles (slice 4.10e, D152 points 2, 10 and 11) ----------

// Desktop progress card on TECHNIQUE, IMPROVISATION and THEORY: the rail on the left takes the room the text leaves;
// the text on the right, right-aligned, title over one line; no percentage and no "Remaining" line. Real values only (D71).
// Hidden on the phone, where the pillar header carries the rail (D131).
export function progressCard(rail, title, line){
  return '<section class="pillar-card card" data-card="' + rail.id + '"><div class="pillar-card-rail">' + renderRail(rail) + '</div>' +
    '<p class="pillar-card-text"><b class="pillar-card-title">' + title + '</b><span class="pillar-card-line">' + line + '</span></p></section>';
}

// Improvisation: the current Gate and its exercises mastered (the same count as the rail and the IMPROV page, D116).
function improvCount(){
  var n = IMPROV_GATES.length;
  if(state.improvIndex >= n){
    var all = 0, done = 0;
    IMPROV_GATES.forEach(function(g, gi){ g.exercises.forEach(function(_, j){ all++; if(state.improvChecks["g" + gi + "e" + j]) done++; }); });
    return { complete: true, gate: n, done: done, total: all };
  }
  var g = Math.max(0, state.improvIndex), ex = IMPROV_GATES[g].exercises;
  return { complete: false, gate: g + 1, title: IMPROV_GATES[g].title, done: ex.filter(function(_, j){ return !!state.improvChecks["g" + g + "e" + j]; }).length, total: ex.length };
}

export function improvCard(){
  var c = improvCount(), rail = improvRail();
  if(c.complete) return progressCard(rail, 'All ' + c.gate + ' Gates complete', c.done + ' of ' + c.total + ' exercises mastered');
  rail.status = c.done + ' of ' + c.total; // as drawn
  return progressCard(rail, 'Gate ' + c.gate + ' \u00b7 ' + c.title, c.done + ' of ' + c.total + ' exercises mastered');
}

export function theoryCard(){
  return progressCard(theoryRail(), 'Level 1 \u00b7 Not started', 'Progress starts with Theory v1 (Phase 6)');
}

// Phone pillar headers: the subtitle on the right of the small "Pillar · …" line, as TECHNIQUE has.
export function improvSub(){
  var c = improvCount();
  return 'G' + c.gate + ' \u00b7 ' + (c.complete ? 'Complete' : c.done + ' of ' + c.total);
}
export function theorySub(){ return 'L1 \u00b7 Not started'; } // "L1 · n of N" once Theory v1 exists (Phase 6)

// The rail under the phone pillar header (as drawn): the % on the right, since the subtitle already gives the count
// (IMPROVISATION) or the state (THEORY, which therefore shows nothing there).
export function improvPageRail(){ var r = improvRail(); r.status = r.pct + '%'; return renderRail(r); }
export function theoryPageRail(){ var r = theoryRail(); r.status = ''; return renderRail(r); }
