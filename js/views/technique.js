// TECHNIQUE page (slice 4.3, DECISIONS D112, D115, D117 point 6, D122).
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// The BHGS phases leave LIBRARY and live here: the current phase (checklist, chop-builders, Phase Transition Test),
// every phase (expandable, as in LIBRARY before), Essential Skills and a low-key "Phase settings" (Jump to phase, D115).
// Part of the BHGS pack (D113): with the pack off this page is not reachable and is not drawn.
// Calculations and state keys are unchanged (D20): it reuses the same helpers and row builders as LIBRARY did.
// Slice 4.4 (D123): the Technique rail replaces the phase bar in the header.
// Phone: the current phase is split in three tabs (Checklist, Chop-builders, Phase test); the desktop shows all of it.
// Slice 4.5d (D130): as drawn. Desktop: the rail sits in the progress card (status = phase name), no count beside the
// title. Phone: a sticky 112 px header (title, "Beginner · n of N", rail), no progress card, and link rows to three
// sub-pages (All phases, Essential Skills, Phase settings) with "‹ Technique" to come back (`ui.techSub`, page state
// only, never saved). The desktop shows every part on the page as before.
import { PHASES, CHOP, TESTCATS, ESSENTIAL, ESSENTIAL_URL, PREREQ, WARMUP_URL } from "../data/bhgs.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=2";
import { BHGS_PACK } from "../pack.js?v=1";
import { k, phasePercent, itemKeysForPhase } from "../logic/technique.js?v=33";
import { linked, checkItem, watchItem, prereqItem, chopRow, testRow } from "./components.js?v=33";
import { pageHeader } from "./shell.js?v=16";
import { renderRail, techniqueRail } from "./rails.js?v=18";

export const TECH_TABS = [
  { id: "checklist", label: "Checklist" },
  { id: "chops", label: "Chop-builders" },
  { id: "test", label: "Phase test" }
];

function plural(n, one, many){ return n + " " + (n === 1 ? one : many); }

// Real counts for the current phase, from the same rules as phasePercent (D20, D71).
export function phaseSummary(idx){
  var p = PHASES[idx], info = itemKeysForPhase(idx);
  var isDone = function(kk){ return !!state.checks[kk]; };
  var parts = [], done = 0, total = 0;
  function add(keys, one, many){
    var d = keys.filter(isDone).length;
    done += d; total += keys.length;
    if(keys.length - d > 0) parts.push(plural(keys.length - d, one, many));
  }
  if(p.kind === "setup"){
    add(info.keys, "prerequisite", "prerequisites");
  } else {
    add((p.concept || []).map(function(_, j){ return k(p.id, "c", j); }), "concept video", "concept videos");
    add(p.exercises.map(function(_, j){ return k(p.id, "e", j); }), "exercise", "exercises");
    add(p.songs.map(function(_, j){ return k(p.id, "s", j); }), "solo", "solos");
  }
  if(info.chopTarget){
    var c = CHOP.filter(function(x){ return state.chop[x.key] >= info.chopTarget; }).length;
    done += c; total += CHOP.length;
    if(CHOP.length - c > 0) parts.push(plural(CHOP.length - c, "chop-builder", "chop-builders"));
  }
  if(info.testReq){
    var t = TESTCATS.filter(function(x){ return state.testLevel[x.key] >= info.testReq; }).length;
    done += t; total += TESTCATS.length;
    if(TESTCATS.length - t > 0) parts.push(plural(TESTCATS.length - t, "test category", "test categories"));
  }
  return { done: done, total: total, left: parts };
}

function sectionHead(title, count){
  return '<div class="tech-head"><h3>' + title + '</h3>' + (count ? '<span class="tech-count">' + count + '</span>' : '') + '</div>';
}
function countOf(keys){ return keys.filter(function(kk){ return !!state.checks[kk]; }).length + " of " + keys.length; }

// Checklist of one phase (concept videos, exercises, solos; Phase 0: prerequisites and warm-up).
function checklistCards(i){
  var p = PHASES[i], html = '';
  if(p.kind === "setup"){
    var pre = PREREQ.map(function(_, j){ return k("p0", "pre", j); });
    html += '<div class="tech-card">' + sectionHead("Prerequisites", countOf(pre)) + '<ul class="check">' + PREREQ.map(function(pr, j){ return prereqItem(pr.t, k("p0", "pre", j), pr.url); }).join("") + '</ul></div>';
    html += '<div class="tech-card">' + sectionHead("Warm-Up") + '<p>' + linked("Ultimate 5-Minute Warm-Up", WARMUP_URL) + '</p></div>';
    return html;
  }
  if(p.concept && p.concept.length){
    var ck = p.concept.map(function(_, j){ return k(p.id, "c", j); });
    html += '<div class="tech-card">' + sectionHead("Concept Videos", countOf(ck)) + '<ul class="check">' + p.concept.map(function(t, j){ return watchItem(t.t, k(p.id, "c", j), t.url); }).join("") + '</ul></div>';
  }
  var ek = p.exercises.map(function(_, j){ return k(p.id, "e", j); });
  html += '<div class="tech-card">' + sectionHead("Exercises", countOf(ek)) + '<ul class="check">' + p.exercises.map(function(t, j){ return checkItem(t.t, k(p.id, "e", j), t.url); }).join("") + '</ul></div>';
  var sk = p.songs.map(function(_, j){ return k(p.id, "s", j); });
  html += '<div class="tech-card">' + sectionHead("Solos", countOf(sk)) + '<ul class="check">' + p.songs.map(function(t, j){ return checkItem(t.t, k(p.id, "s", j), t.url); }).join("") + '</ul></div>';
  return html;
}

function chopCard(i){
  var p = PHASES[i];
  if(!p.target) return '<div class="tech-card">' + sectionHead("Chop-Builders") + '<p class="tech-note">No chop-builder target in this phase; levels are your lifetime levels.</p>' + chopRow(null) + '</div>';
  var hit = CHOP.filter(function(c){ return state.chop[c.key] >= p.target; }).length;
  return '<div class="tech-card">' + sectionHead("Chop-Builders", hit + " of " + CHOP.length + " at target") +
    '<p class="tech-note">Target for this phase: Level ' + p.target + '.</p>' + chopRow(p.target) + '</div>';
}

function testCard(i){
  var p = PHASES[i], req = p.testReq || null, next = PHASES[i + 1];
  if(!req) return '<div class="tech-card">' + sectionHead("Phase Transition Test", "baseline") +
    '<p class="tech-note">Track your baseline here - informational at this stage.</p>' + testRow(null) + '</div>';
  var hit = TESTCATS.filter(function(c){ return state.testLevel[c.key] >= req; }).length;
  return '<div class="tech-card">' + sectionHead("Phase Transition Test", hit + " of " + TESTCATS.length + " at Level " + req) +
    '<p class="tech-note">Reach Level ' + req + ' on all ' + TESTCATS.length + ' to unlock ' + (next ? next.label : "the next phase") + '.</p>' + testRow(req) + '</div>';
}

// One earlier or later phase, opened from "All phases": the same content LIBRARY showed (editable, as before).
function phaseBody(i){
  var p = PHASES[i], html = '<div class="accbody">';
  if(p.kind === "setup"){
    html += '<div class="list-card"><h3>Prerequisites</h3><ul class="check">' + PREREQ.map(function(pr, j){ return prereqItem(pr.t, k("p0", "pre", j), pr.url); }).join("") + '</ul></div>';
    html += '<div class="list-card"><h3>Warm-Up</h3><p>' + linked("Ultimate 5-Minute Warm-Up", WARMUP_URL) + '</p></div>';
  } else {
    if(p.concept && p.concept.length) html += '<div class="list-card"><h3>Concept Videos</h3><ul class="check">' + p.concept.map(function(t, j){ return watchItem(t.t, k(p.id, "c", j), t.url); }).join("") + '</ul></div>';
    html += '<div class="list-card"><h3>Exercises</h3><ul class="check">' + p.exercises.map(function(t, j){ return checkItem(t.t, k(p.id, "e", j), t.url); }).join("") + '</ul></div>';
    html += '<div class="list-card"><h3>Chop-Builders <span class="tag">target: Level ' + p.target + '</span></h3>' + chopRow(p.target) + '</div>';
    html += '<div class="list-card"><h3>Solos</h3><ul class="check">' + p.songs.map(function(t, j){ return checkItem(t.t, k(p.id, "s", j), t.url); }).join("") + '</ul></div>';
    html += '<div class="list-card"><h3>Phase Transition Test <span class="tag">target: Level ' + p.testReq + '</span></h3>' + testRow(p.testReq) + '</div>';
  }
  return html + '</div>';
}

function allPhases(){
  var html = '<div class="tech-section-title">All phases</div><div class="tech-phases">';
  PHASES.forEach(function(p, i){
    var cur = i === state.phaseIndex, pct = phasePercent(i);
    var status = cur ? "Current · " + pct + "%" : (i < state.phaseIndex ? "Complete" : "");
    if(cur){
      // Slice 4.5d (D130): as drawn, every row has ›; the current one leads back to the current phase (page top).
      html += '<button class="tech-phase cur" data-action="techsub" data-sub=""><span class="tech-stage">Phase ' + i + '</span><span class="tech-plabel">' + p.label + ' <span class="u-muted">· ' + p.short + '</span></span><span class="tech-pstate">' + status + '</span><span class="chev">&#8250;</span></button>';
      return;
    }
    var open = !!ui.lib["tp" + i];
    html += '<div class="acc tech-acc"><div class="acchead tech-phase" data-action="toggleacc" data-acc="tp' + i + '"><span class="tech-stage">Phase ' + i + '</span><span class="tech-plabel">' + p.label + ' <span class="u-muted">· ' + p.short + '</span></span><span class="tech-pstate">' + status + '</span><span class="chev' + (open ? " open" : "") + '">&#8250;</span></div>';
    if(open) html += phaseBody(i);
    html += '</div>';
  });
  return html + '</div>';
}

function essentialSkills(){
  var open = !!ui.lib.techessentials;
  var html = '<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="techessentials"><b>Essential Skills</b><span class="acc-right"><span class="acc-sub">One a day, in DAILY</span><span class="chev' + (open ? " open" : "") + '">&#8250;</span></span></div>';
  if(open){
    html += '<div class="accbody"><div class="card"><ul class="check">' + Object.keys(ESSENTIAL).map(function(d){
      var label = ESSENTIAL[d], url = ESSENTIAL_URL[label];
      return '<li class="lib-dayrow"><div class="itxt">' + linked(label, url) + ' <span class="tag">(' + DAY_FULL[d] + ')</span></div></li>';
    }).join("") + '</ul></div></div>';
  }
  return html + '</div>';
}

// "Phase settings" (D115): the old HOME "Jump to phase", low-key. Jumping back saves an on-device backup first.
function phaseSettings(){
  var html = '<div class="tech-settings">';
  if(ui.phaseJumpPending !== null && ui.phaseJumpPending !== undefined){
    html += '<p class="text-warn u-justify u-mb-12"><b>Jump back to Phase ' + ui.phaseJumpPending + '?</b> This resets Phase ' + (ui.phaseJumpPending + 1) + ' through Phase ' + state.phaseIndex + "'s checklist items. Chop-builder and test levels are left as they are. A backup is saved on this device first.</p>";
    html += '<div class="u-row"><button class="tbtn u-flex1" data-action="canceljump">Cancel</button><button class="tbtn danger u-flex1" data-action="confirmjump">Confirm</button></div>';
  } else if(ui.phaseSettingsOpen){
    html += '<h3>Phase settings</h3><p class="tech-note u-justify">Advancing happens automatically once every item, chop level and test level in your current phase is done. Jump forward and earlier phases are marked complete too; jump back and later phases reset (a backup is saved on this device first).</p><select class="select" data-action="setphase" aria-label="Current phase">';
    PHASES.forEach(function(p, i){ html += '<option value="' + i + '"' + (i === state.phaseIndex ? " selected" : "") + '>Phase ' + i + ' - ' + p.label + " (" + p.short + ')</option>'; });
    html += '</select><button class="tbtn u-w100 u-mt-12" data-action="phasesettings">Close</button>';
  } else {
    html += '<div class="tech-settings-row"><div class="u-flex1"><h3>Phase settings</h3><p class="tech-note">Set the current phase by hand. Moving back clears the checklist of the later phases; a backup is saved on this device first.</p></div>' +
      '<button class="tbtn" data-action="phasesettings">Change phase…</button></div>';
  }
  return html + '</div>';
}

export const TECH_SUBS = [
  { id: "phases", label: "All phases", sub: "Setup to Pro" },
  { id: "essentials", label: "Essential Skills", sub: "One a day, in DAILY" },
  { id: "settings", label: "Phase settings", sub: "Change phase by hand", cls: "tech-link-dashed" }
];

// Phone sub-page frame: a back link to the main TECHNIQUE page (hidden on the desktop).
function part(id, body){
  return '<section class="tech-part tech-part-' + id + '" data-part="' + id + '">' +
    '<button class="tech-back" data-action="techsub" data-sub="">\u2039 Technique</button>' + body + '</section>';
}

export function renderTechnique(){
  if(!BHGS_PACK) return '';
  var i = state.phaseIndex, cur = PHASES[i], pct = phasePercent(i), sum = phaseSummary(i);
  var tab = ui.techTab || "checklist";
  var sub = ui.techSub || "";
  var cardRail = techniqueRail();
  cardRail.status = cur.label; // as drawn: the % sits next to the rail in the card
  var html = '<div class="tech-page' + (sub ? ' tech-in-sub sub-' + sub : '') + '">';
  html += '<div class="tech-header">' + pageHeader('Pillar · BHGS Roadmap', 'Technique', '<span class="tech-sub">' + cur.label + ' · ' + sum.done + ' of ' + sum.total + '</span>') + renderRail(techniqueRail()) + '</div>';

  html += '<div class="tech-main">';
  html += '<div class="tech-progress card"><div class="tech-progress-rail">' + renderRail(cardRail) + '</div>' +
    '<div class="tech-progress-num"><div class="bignum">' + pct + '%</div><div class="tech-progress-txt"><b>Phase ' + i + ' · ' + cur.label + '</b><br>' +
    sum.done + ' of ' + sum.total + ' done in this phase.' + (sum.left.length ? '<br>Left: ' + sum.left.join(" · ") + '.' : '') + '</div></div></div>';

  html += '<div class="tech-tabs" role="tablist">' + TECH_TABS.map(function(t){
    var on = t.id === tab;
    return '<button role="tab" aria-selected="' + (on ? "true" : "false") + '" class="tech-tab' + (on ? " on" : "") + '" data-action="techtab" data-tab="' + t.id + '">' + t.label + '</button>';
  }).join("") + '</div>';

  html += '<div class="tech-cols tab-' + tab + '">' +
    '<div class="tech-col tech-sec-checklist">' + checklistCards(i) + '</div>' +
    '<div class="tech-col"><div class="tech-sec-chops">' + chopCard(i) + '</div><div class="tech-sec-test">' + testCard(i) + '</div></div>' +
    '</div>';

  // Phone link rows (hidden on the desktop).
  html += '<div class="tech-links">' + TECH_SUBS.map(function(l){
    return '<button class="tech-link' + (l.cls ? ' ' + l.cls : '') + '" data-action="techsub" data-sub="' + l.id + '">' +
      '<span class="tech-link-text">' + l.label + ' <span class="u-muted">\u00b7 ' + l.sub + '</span></span><span class="tech-link-arrow" aria-hidden="true">\u203a</span></button>';
  }).join("") + '</div>';
  html += '</div>';

  html += part("phases", allPhases());
  html += part("essentials", '<div class="tech-section-title">Reference</div>' + essentialSkills());
  html += part("settings", phaseSettings());
  return html + '</div>';
}
