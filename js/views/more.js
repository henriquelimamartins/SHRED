// MORE page on the phone (slice 4.5b2, DECISIONS D126 point 1, D128), as drawn on the 4.0 canvas:
// the title with the account photo (opens Account & data), then rows grouped as RESOURCES, TOOLS and ACCOUNT & DATA.
// Rows only open pages or panels (and Download backup, which changes nothing); showing this page writes nothing.
// Not drawn yet, so left out: Key & Scale Explorer (Phase 5) and Metronome (Phase 8). No rails here (D125 point 1).
import { state } from "../store.js?v=5";
import { BHGS_PACK } from "../pack.js?v=1";
import { setupData } from "../data/setup.js?v=1";
import { pageHeader, avatar, syncState } from "./shell.js?v=10";

function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

// The same names the SETUP page shows in its tuning list.
const TUNING_LABEL = { e_std: "E Standard", drop_d: "Drop D", d_std: "D Standard", drop_c: "Drop C", c_std: "C Standard", dadfae: "DADFAE" };

function setupLine(){
  var g = setupData[state.setupGuitar];
  var name = g ? g.name : state.setupGuitar;
  return name + " · " + (TUNING_LABEL[state.setupTuning] || state.setupTuning);
}

// One row: label, subtitle, ›. `attrs` holds the data-action (and data-view) of the row.
function row(attrs, label, sub, cls){
  return '<button class="more-row' + (cls ? ' ' + cls : '') + '" ' + attrs + '>' +
    '<span class="more-row-text"><span class="more-row-label">' + esc(label) + '</span>' +
    '<span class="more-row-sub">' + sub + '</span></span>' +
    '<span class="more-row-arrow" aria-hidden="true">›</span></button>';
}

function group(id, title, rows){
  return '<section class="more-group" data-group="' + id + '"><h2 class="more-group-title">' + title + '</h2>' +
    '<div class="more-list">' + rows.join("") + '</div></section>';
}

export function renderMore(){
  var acct = '<button class="more-acct" data-action="go" data-view="account" aria-label="Account and data">' + avatar("md") + '</button>';
  var html = pageHeader("Resources &amp; account", "More", acct);

  // With the BHGS pack off LIBRARY sits in the phone bar, so RESOURCES would be empty until the Explorer exists.
  if(BHGS_PACK){
    html += group("resources", "Resources", [
      row('data-action="go" data-view="library"', "Library", "Theory Track, Expression Track, Listening Vault &amp; guide")
    ]);
  }
  html += group("tools", "Tools", [
    row('data-action="go" data-view="setup"', "Guitar setup", esc(setupLine()))
  ]);
  var s = syncState();
  html += group("account", "Account &amp; data", [
    row('data-action="go" data-view="account" data-row="sync"', "Cloud sync", '<i class="sync-dot ' + s.tone + '"></i><span class="sync-text">' + s.text + '</span>'),
    row('data-action="downloadbackup" data-row="download"', "Download backup", "Save a copy of your progress as a file"),
    row('data-action="morerestore" data-row="restore"', "Restore backup", "From this device or from a file"),
    row('data-action="morereset" data-row="reset"', "Reset progress", "Keeps streak, calendar and setup", "more-row-danger")
  ]);
  return html;
}
