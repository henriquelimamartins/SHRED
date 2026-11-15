// IMPROV view (the 5 Gates).
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Slice 4.4: Improv rail on top (phone).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { IMPROV_GATES } from "../data/improv.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { pageHeader } from "./shell.js?v=5";
import { renderRail, improvRail } from "./rails.js?v=7";

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

export function renderImprov(){
  // Slice 4.4 (D117, D123): the Improv rail at the top of the page on the phone (the desktop sidebar shows it).
  var html=pageHeader('Pillar \u00b7 Musical Development','Improvisation');
  html+='<div class="pillar-rail">'+renderRail(improvRail())+'</div>';
  html+='<div class="eyebrow improv">Expression Track</div><div class="h2 h2-lg u-mb-12 gates-title">The 5 Gates of Freedom</div>';
  html+='<p class="lede">Destroy your muscle memory. This is your progressive masterclass to unlock pure musical audiation. Do not advance until you master every exercise in a Gate.</p>';

  var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
  var allDone = state.improvIndex >= IMPROV_GATES.length;

  var tKey = improvKeyOfDay();

  if (!allDone) {
    html+='<div class="note purple transpose-card">'+
          '<div class="transpose-label">Daily Transposition Target</div>'+
          '<b class="u-fs-18">'+tKey.k+'</b> <span class="transpose-style">('+tKey.t+')</span>'+
          '<div class="transpose-help">Read the exercises below in their example keys, but <b>force yourself to transpose and play them in '+tKey.k+' today</b>. This breaks vertical habits and builds true neck mastery.</div>'+
          '</div>';
  }


  if(allDone){
    html+='<div class="note purple u-center"><b>\ud83c\udfc6 YOU HAVE MASTERED THE 5 GATES!</b><br>You are now a free player. Keep using these tools in your daily jams.</div>';
  }

  IMPROV_GATES.forEach(function(g, i){
    var isPast = i < state.improvIndex;
    var isCur = i === actGate && !allDone;
    var isLocked = i > actGate;

    if(isLocked){
      html+='<div class="card is-locked"><h3>\ud83d\udd12 Gate '+(i+1)+': '+g.title+'</h3></div>';
      return;
    }

    if(isPast){
      html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="improvG'+i+'"><b class="improv">\u2713 GATE '+(i+1)+': '+g.title.toUpperCase()+'</b><span class="chev'+(ui.lib["improvG"+i]?" open":"")+'">\u203a</span></div>';
      if(ui.lib["improvG"+i]){
        html+='<div class="accbody">';
        g.exercises.forEach(function(ex){
          html+='<p class="done-ex">\u2713 '+ex.t+'</p>';
        });
        html+='</div>';
      }
      html+='</div>';
      return;
    }

    html+='<div class="card card-improv glow">'+
          '<h3 class="h3-improv h3-lg">Gate '+(i+1)+': '+g.title+'</h3>'+
          '<p class="gate-desc">'+g.desc+'</p>';
    
    var exercisesDone = 0;
    html+='<ul class="check">';
    g.exercises.forEach(function(ex, j){
      var isChecked = !!state.improvChecks["g"+i+"e"+j];
      if(isChecked) exercisesDone++;
      var btn = '<button class="mbtn purple'+(isChecked?" on":"")+'" data-action="togimprov" data-g="'+i+'" data-e="'+j+'">'+(isChecked?"\u2713 Mastered":"Unmastered")+'</button>';
      html+='<li class="mrow mrow-stack">'+
            '<div class="ex-head">'+
              '<b class="ex-title lg">'+ex.t+'</b>'+
              '<div class="ex-btn">'+btn+'</div>'+
            '</div>'+
            '<div class="ex-desc lg">'+
              ex.desc+
              '<div class="note purple ex-listen lg">'+ex.listen+'</div>'+
            '</div>'+
            '</li>';
    });
    html+='</ul>';

    if(exercisesDone === g.exercises.length){
      html+='<button class="tbtn purple u-w100 u-mt-18" data-action="advanceimprov">\ud83d\udd13 Unlock Gate '+(i+2)+'</button>';
    }
    
    html+='</div>';
  });

  return html;
}
