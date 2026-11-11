// IMPROV view (the 5 Gates).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { IMPROV_GATES } from "../data/improv.js?v=1";
import { state } from "../store.js?v=1";
import { ui } from "../ui.js?v=1";

export function renderImprov(){
  var html='<div class="eyebrow" style="color:var(--purple);">Expression Track</div><div class="h2" style="font-size:22px;margin-bottom:12px;">The 5 Gates of Freedom</div>';
  html+='<p class="lede">Destroy your muscle memory. This is your progressive masterclass to unlock pure musical audiation. Do not advance until you master every exercise in a Gate.</p>';

  var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
  var allDone = state.improvIndex >= IMPROV_GATES.length;

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
  var tKey = IMPROV_KEYS[dayIndex];

  if (!allDone) {
    html+='<div class="note purple" style="text-align:center; margin-bottom:18px; padding:16px;">'+
          '<div style="font-size:11.5px; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; color:#d8b8ff;">Daily Transposition Target</div>'+
          '<b style="font-size:18px;">'+tKey.k+'</b> <span style="font-size:13px; opacity:0.8;">('+tKey.t+')</span>'+
          '<div style="font-size:12.5px; margin-top:10px; color:#eef0f4; font-weight:normal; line-height:1.5;">Read the exercises below in their example keys, but <b>force yourself to transpose and play them in '+tKey.k+' today</b>. This breaks vertical habits and builds true neck mastery.</div>'+
          '</div>';
  }


  if(allDone){
    html+='<div class="note purple" style="text-align:center;"><b>\ud83c\udfc6 YOU HAVE MASTERED THE 5 GATES!</b><br>You are now a free player. Keep using these tools in your daily jams.</div>';
  }

  IMPROV_GATES.forEach(function(g, i){
    var isPast = i < state.improvIndex;
    var isCur = i === actGate && !allDone;
    var isLocked = i > actGate;

    if(isLocked){
      html+='<div class="card" style="opacity:0.5;"><h3>\ud83d\udd12 Gate '+(i+1)+': '+g.title+'</h3></div>';
      return;
    }

    if(isPast){
      html+='<div class="acc"><div class="acchead" data-action="toggleacc" data-acc="improvG'+i+'"><b style="color:var(--purple);">\u2713 GATE '+(i+1)+': '+g.title.toUpperCase()+'</b><span class="chev'+(ui.lib["improvG"+i]?" open":"")+'">\u203a</span></div>';
      if(ui.lib["improvG"+i]){
        html+='<div class="accbody">';
        g.exercises.forEach(function(ex){
          html+='<p style="font-size:13px; margin-bottom:10px; color:var(--muted);">\u2713 '+ex.t+'</p>';
        });
        html+='</div>';
      }
      html+='</div>';
      return;
    }

    html+='<div class="card" style="border-color:var(--purple); box-shadow: 0 0 12px rgba(176,82,255,0.1);">'+
          '<h3 style="color:var(--purple); font-size:18px;">Gate '+(i+1)+': '+g.title+'</h3>'+
          '<p style="font-size:13.5px; margin-bottom:14px; text-align:justify;">'+g.desc+'</p>';
    
    var exercisesDone = 0;
    html+='<ul class="check">';
    g.exercises.forEach(function(ex, j){
      var isChecked = !!state.improvChecks["g"+i+"e"+j];
      if(isChecked) exercisesDone++;
      var btn = '<button class="mbtn purple'+(isChecked?" on":"")+'" data-action="togimprov" data-g="'+i+'" data-e="'+j+'">'+(isChecked?"\u2713 Mastered":"Unmastered")+'</button>';
      html+='<li class="mrow" style="flex-direction:column; align-items:stretch; gap:8px;">'+
            '<div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">'+
              '<b style="color:var(--text); font-size:14px; flex:1; min-width:0;">'+ex.t+'</b>'+
              '<div style="flex:0 0 auto;">'+btn+'</div>'+
            '</div>'+
            '<div style="font-size:13px; line-height:1.5; color:var(--muted); text-align:justify;">'+
              ex.desc+
              '<div class="note purple" style="margin-top:10px; margin-bottom:4px; padding:10px; font-size:12px; text-align:justify;">'+ex.listen+'</div>'+
            '</div>'+
            '</li>';
    });
    html+='</ul>';

    if(exercisesDone === g.exercises.length){
      html+='<button class="tbtn purple" style="width:100%; margin-top:18px;" data-action="advanceimprov">\ud83d\udd13 Unlock Gate '+(i+2)+'</button>';
    }
    
    html+='</div>';
  });

  return html;
}
