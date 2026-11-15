// LIBRARY view.
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Slice 4.3 (D112, D122): the Shred Roadmap section (phases and Essential Skills) moved to the TECHNIQUE page.
// Slice 4.2b (D113): with the BHGS pack off, the BHGS sections (Shred Roadmap, Theory Track, Creative, Bonus Content),
// the Weekly Rhythm and the BHGS guide text are hidden; Expression Track, Listening Vault and the guide stay.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { CREATIVE, THEORY_DOCS, THEORY_ROOT_ITEMS, THEORY_GROUPS, WEEKLY_RHYTHM } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=1";
import { LISTENING_VAULT } from "../data/listening.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { BHGS_PACK } from "../pack.js?v=1";
import { pageHeader } from "./shell.js?v=4";
import { watchItem, docItem, renderBonusList } from "./components.js?v=20";

export function renderLibrary(){
  var html=pageHeader('Reference &amp; Review','Library');
  html+='<p class="lede">Browse and check off any item, anytime - it all counts toward the same progress as Daily Practice.</p>';
  
  if(BHGS_PACK){
  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="theory"><b>Theory Track</b><span class="acc-right"><span class="acc-sub">Intervals, Modes &amp; Chords</span><span class="chev'+(ui.lib.theory?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.theory) {
    html+='<div class="accbody">';
    html+='<div class="card"><ul class="check">';
    THEORY_DOCS.forEach(function(docItemObj){ html += docItem(docItemObj.t, docItemObj.url); });
    THEORY_ROOT_ITEMS.forEach(function(t){ html += watchItem(t.t, t.key, t.url); });
    html+='</ul></div>';

    THEORY_GROUPS.forEach(function(g){
      html+='<div class="list-card"><h3>'+g.title+'</h3><ul class="check">';
      if(g.docs) g.docs.forEach(function(d){ html+=docItem(d.t, d.url); });
      g.items.forEach(function(t){ html += watchItem(t.t, t.key, t.url); });
      html+='</ul></div>';
    });
    html+='</div>';
  }
  html+='</div>';

  }

  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="expression"><b>Expression Track</b><span class="acc-right"><span class="acc-sub">The 5 Gates</span><span class="chev'+(ui.lib.expression?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.expression){
    html+='<div class="accbody purple-tree">';
    IMPROV_GATES.forEach(function(g, i){
      var gateOpen = !!ui.lib["libGate"+i];
      html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="libGate'+i+'"><b class="improv">Gate '+(i+1)+': '+g.title+'</b><span class="acc-right"><span class="chev'+(gateOpen?" open":"")+'">&#8250;</span></span></div>';
      if(gateOpen){
        html+='<div class="accbody">';
        html+='<p class="u-fs-13 u-mb-12 u-justify">'+g.desc+'</p>';
        html+='<ul class="check">';
        g.exercises.forEach(function(ex, j){
          var isChecked = !!state.improvChecks["g"+i+"e"+j];
          var btn = '<button class="mbtn purple'+(isChecked?" on":"")+'" data-action="togimprov" data-g="'+i+'" data-e="'+j+'">'+(isChecked?"&#10003; Mastered":"Unmastered")+'</button>';
          html+='<li class="mrow mrow-stack">'+
                '<div class="ex-head">'+
                  '<b class="ex-title">'+ex.t+'</b>'+
                  '<div class="ex-btn">'+btn+'</div>'+
                '</div>'+
                '<div class="ex-desc">'+
                  ex.desc+
                  '<div class="note purple ex-listen">'+ex.listen+'</div>'+
                '</div>'+
                '</li>';
        });
        html+='</ul>';
        html+='</div>';
      }
      html+='</div>';
    });
    html+='</div>';
  }
  html+='</div>';

  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="listening"><b>Listening Vault</b><span class="acc-right"><span class="acc-sub">Inspiration &amp; Refs</span><span class="chev'+(ui.lib.listening?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.listening){
    html+='<div class="accbody">';
    LISTENING_VAULT.forEach(function(g){
      html+='<div class="card card-improv">'+
            '<h3 class="h3-improv">'+g.category+'</h3>'+
            '<ul class="plain-list">';
      g.items.forEach(function(item){
        html+='<li class="vault-item">'+
              '<b class="vault-title">🎸 '+item.t+'</b>'+
              '<span class="vault-desc">'+item.desc+'</span></li>';
      });
      html+='</ul></div>';
    });
    html+='</div>';
  }
  html+='</div>';

  if(BHGS_PACK){
  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="creative"><b>Creative</b><span class="acc-right"><span class="acc-sub">Songwriting &amp; Production</span><span class="chev'+(ui.lib.creative?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.creative){
    html+='<div class="accbody"><div class="list-card"><h3>Songwriting</h3><ul class="check">'+CREATIVE.songwriting.map(function(t,j){return watchItem(t.t,"creative.sw."+j,t.url);}).join("")+'</ul></div>'+
      '<div class="list-card"><h3>Production</h3><ul class="check">'+CREATIVE.production.map(function(t,j){return watchItem(t.t,"creative.pr."+j,t.url);}).join("")+'</ul></div></div>';
  }
  html+='</div>';

  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="bonuslib"><b>Bonus Content</b><span class="acc-right"><span class="acc-sub">Extras &amp; Workouts</span><span class="chev'+(ui.lib.bonuslib?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.bonuslib) html+='<div class="accbody"><div class="list-card">'+renderBonusList()+'</div></div>';
  html+='</div>';
  
  }

  html+='<hr class="divider">';
  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="guide"><b>Guide &amp; Info</b><span class="acc-right"><span class="acc-sub">App Instructions</span><span class="chev'+(ui.lib.guide?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.guide) {
    html+='<div class="accbody">';
    if(BHGS_PACK){
      html+='<div class="list-card"><h3>How This Plan Works</h3><p class="u-mb-8 u-justify">Technique is sequential and full-coverage: start at Beginner regardless of ability, and work every exercise, chop-builder and solo in every tier before advancing.</p>'+
        '<p class="u-mb-8 u-justify">To unlock the next phase, you must master all checklist items, hit your chop-builder targets, and reach the required level in all 6 categories of the <b>Phase Transition Test</b> (which includes the Ultimate Technique Workout).</p>'+
        '<p class="u-mb-8 u-justify">Theory and Creative run on their own independent tracks - always available in Library, never gating a phase.</p></div>';
      html+='<div class="list-card"><h3>Weekly Rhythm</h3><table class="info"><tr><th>Day</th><th>Focused</th><th>Casual / Improv</th></tr>'+
        WEEKLY_RHYTHM.map(function(r){return '<tr><td class="day">'+r.day+'</td><td>'+r.focused+'</td><td>'+r.casual+'</td></tr>';}).join("")+'</table></div>';
      html+='<div class="note u-mt-6">This guide and app are based on <b>Bradley Hall\'s Guitar School</b> (BHGS) Official Roadmap. Improv module custom tailored for expression.</div>';
    } else {
      html+='<div class="list-card"><h3>How This App Works</h3><p class="u-mb-8 u-justify">IMPROV takes you through 5 Gates; the Expression Track above lists the same exercises, and the Listening Vault gathers listening references.</p>'+
        '<p class="u-justify">THEORY is always open and never gates anything.</p></div>';
    }
    html+='</div>';
  }
  html+='</div>';
  return html;
}
