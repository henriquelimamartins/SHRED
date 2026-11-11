// LIBRARY view.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, CREATIVE, THEORY_DOCS, THEORY_ROOT_ITEMS, THEORY_GROUPS, ESSENTIAL, ESSENTIAL_URL, PREREQ, WARMUP_URL, WEEKLY_RHYTHM } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=1";
import { LISTENING_VAULT } from "../data/listening.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { state } from "../store.js?v=3";
import { ui } from "../ui.js?v=1";
import { k, phasePercent } from "../logic/technique.js?v=4";
import { linked, checkItem, watchItem, prereqItem, docItem, chopRow, testRow, renderBonusList } from "./components.js?v=4";

export function renderLibrary(){
  var html='<div class="eyebrow">Reference &amp; Review</div><div class="h2" style="font-size:22px;margin-bottom:8px;">Library</div>';
  html+='<p class="lede">Browse and check off any item, anytime - it all counts toward the same progress as Daily Practice.</p>';
  
  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="shredroadmap"><b>Shred Roadmap</b><span class="acc-right"><span class="acc-sub">Essential Skills &amp; Phases</span><span class="chev'+(ui.lib.shredroadmap?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.shredroadmap){
    html+='<div class="accbody">';
    html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="essentials"><b>Essential Skills</b><span class="acc-right"><span class="chev'+(ui.lib.essentials?" open":"")+'">&#8250;</span></span></div>';
    if(ui.lib.essentials){ 
      html+='<div class="accbody"><div class="card"><ul class="check">'+Object.keys(ESSENTIAL).map(function(d){
        var label=ESSENTIAL[d], url=ESSENTIAL_URL[label];
        return '<li style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #23262f;"><div class="itxt">'+linked(label,url)+' <span class="tag">('+DAY_FULL[d]+')</span></div></li>';
      }).join("")+'</ul></div></div>'; 
    }
    html+='</div>';

    PHASES.forEach(function(p,i){
      var open=!!ui.lib["p"+i],pct=phasePercent(i);
      html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="p'+i+'"><b>'+p.label.toUpperCase()+'</b><span class="acc-right"><span class="acc-sub">Phase '+i+' &middot; '+p.short+' ('+pct+'%)</span><span class="chev'+(open?" open":"")+'">&#8250;</span></span></div>';
      if(open){
        html+='<div class="accbody">';
        if(p.kind==="setup"){
          html+='<div class="list-card"><h3>Prerequisites</h3><ul class="check">'+PREREQ.map(function(pr,j){return prereqItem(pr.t,k("p0","pre",j),pr.url);}).join("")+'</ul></div>';
          html+='<div class="list-card"><h3>Warm-Up</h3><p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p></div>';
        } else {
          if(p.concept&&p.concept.length) html+='<div class="list-card"><h3>Concept Videos</h3><ul class="check">'+p.concept.map(function(t,j){return watchItem(t.t,k(p.id,"c",j),t.url);}).join("")+'</ul></div>';
          html+='<div class="list-card"><h3>Exercises</h3><ul class="check">'+p.exercises.map(function(t,j){return checkItem(t.t,k(p.id,"e",j),t.url);}).join("")+'</ul></div>';
          html+='<div class="list-card"><h3>Chop-Builders <span class="tag">target: Level '+p.target+'</span></h3>'+chopRow(p.target)+'</div>';
          html+='<div class="list-card"><h3>Solos</h3><ul class="check">'+p.songs.map(function(t,j){return checkItem(t.t,k(p.id,"s",j),t.url);}).join("")+'</ul></div>';
          html+='<div class="list-card"><h3>Phase Transition Test <span class="tag">target: Level '+p.testReq+'</span></h3>'+testRow(p.testReq)+'</div>';
        }
        html+='</div>';
      }
      html+='</div>';
    });
    html+='</div>';
  }
  html+='</div>';

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

  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="expression"><b>Expression Track</b><span class="acc-right"><span class="acc-sub">The 5 Gates</span><span class="chev'+(ui.lib.expression?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.expression){
    html+='<div class="accbody purple-tree">';
    IMPROV_GATES.forEach(function(g, i){
      var gateOpen = !!ui.lib["libGate"+i];
      html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="libGate'+i+'"><b style="color:var(--purple);">Gate '+(i+1)+': '+g.title+'</b><span class="acc-right"><span class="chev'+(gateOpen?" open":"")+'">&#8250;</span></span></div>';
      if(gateOpen){
        html+='<div class="accbody">';
        html+='<p style="font-size:13px; margin-bottom:12px; text-align:justify;">'+g.desc+'</p>';
        html+='<ul class="check">';
        g.exercises.forEach(function(ex, j){
          var isChecked = !!state.improvChecks["g"+i+"e"+j];
          var btn = '<button class="mbtn purple'+(isChecked?" on":"")+'" data-action="togimprov" data-g="'+i+'" data-e="'+j+'">'+(isChecked?"&#10003; Mastered":"Unmastered")+'</button>';
          html+='<li class="mrow" style="flex-direction:column; align-items:stretch; gap:8px;">'+
                '<div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">'+
                  '<b style="color:var(--text); font-size:13.5px; flex:1; min-width:0;">'+ex.t+'</b>'+
                  '<div style="flex:0 0 auto;">'+btn+'</div>'+
                '</div>'+
                '<div style="font-size:12.5px; line-height:1.5; color:var(--muted); text-align:justify;">'+
                  ex.desc+
                  '<div class="note purple" style="margin-top:8px; margin-bottom:4px; padding:8px; font-size:11.5px; text-align:justify;">'+ex.listen+'</div>'+
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
      html+='<div class="card" style="border-color:var(--purple); box-shadow: 0 0 10px rgba(176,82,255,0.05);">'+
            '<h3 style="color:var(--purple);">'+g.category+'</h3>'+
            '<ul style="padding:0; margin:0; list-style:none;">';
      g.items.forEach(function(item){
        html+='<li style="font-size:13px; color:var(--text); padding:12px 0; border-bottom:1px solid #23262f;">'+
              '<b style="color:#eef0f4; font-size:14px; margin-bottom:6px; display:block;">🎸 '+item.t+'</b>'+
              '<span style="color:var(--muted); line-height:1.5; display:block; text-align:justify;">'+item.desc+'</span></li>';
      });
      html+='</ul></div>';
    });
    html+='</div>';
  }
  html+='</div>';

  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="creative"><b>Creative</b><span class="acc-right"><span class="acc-sub">Songwriting &amp; Production</span><span class="chev'+(ui.lib.creative?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.creative){
    html+='<div class="accbody"><div class="list-card"><h3>Songwriting</h3><ul class="check">'+CREATIVE.songwriting.map(function(t,j){return watchItem(t.t,"creative.sw."+j,t.url);}).join("")+'</ul></div>'+
      '<div class="list-card"><h3>Production</h3><ul class="check">'+CREATIVE.production.map(function(t,j){return watchItem(t.t,"creative.pr."+j,t.url);}).join("")+'</ul></div></div>';
  }
  html+='</div>';

  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="bonuslib"><b>Bonus Content</b><span class="acc-right"><span class="acc-sub">Extras &amp; Workouts</span><span class="chev'+(ui.lib.bonuslib?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.bonuslib) html+='<div class="accbody"><div class="list-card">'+renderBonusList()+'</div></div>';
  html+='</div>';
  
  html+='<hr style="border:0; border-top:1px solid #23262f; margin:24px 0;">';
  html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="guide"><b>Guide &amp; Info</b><span class="acc-right"><span class="acc-sub">App Instructions</span><span class="chev'+(ui.lib.guide?" open":"")+'">&#8250;</span></span></div>';
  if(ui.lib.guide) {
    html+='<div class="accbody">';
    html+='<div class="list-card"><h3>How This Plan Works</h3><p style="margin-bottom:8px;text-align:justify;">Technique is sequential and full-coverage: start at Beginner regardless of ability, and work every exercise, chop-builder and solo in every tier before advancing.</p>'+
      '<p style="margin-bottom:8px;text-align:justify;">To unlock the next phase, you must master all checklist items, hit your chop-builder targets, and reach the required level in all 6 categories of the <b>Phase Transition Test</b> (which includes the Ultimate Technique Workout).</p>'+
      '<p style="margin-bottom:8px;text-align:justify;">Theory and Creative run on their own independent tracks - always available in Library, never gating a phase.</p></div>';
    html+='<div class="list-card"><h3>Weekly Rhythm</h3><table class="info"><tr><th>Day</th><th>Focused</th><th>Casual / Improv</th></tr>'+
      WEEKLY_RHYTHM.map(function(r){return '<tr><td class="day">'+r.day+'</td><td>'+r.focused+'</td><td>'+r.casual+'</td></tr>';}).join("")+'</table></div>';
    html+='<div class="note" style="margin-top:6px;">This guide and app are based on <b>Bradley Hall\'s Guitar School</b> (BHGS) Official Roadmap. Improv module custom tailored for expression.</div>';
    html+='</div>';
  }
  html+='</div>';
  return html;
}
