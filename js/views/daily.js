// DAILY view.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, TESTCATS, THEORY_DOCS, THEORY_GROUPS, THEORY_ITEMS, ESSENTIAL, ESSENTIAL_URL, PREREQ, WARMUP_URL } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=1";
import { DAY_FULL } from "../data/days.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { todayISO, todayName, isWeekendDay, activeDay } from "../logic/dates.js?v=7";
import { k } from "../logic/technique.js?v=10";
import { linked, checkItem, prereqItem, docItem, chopRow, dayPicker, blk, getDailyActiveSequence } from "./components.js?v=10";

export function renderDaily(){
  var idx=state.phaseIndex,p=PHASES[idx];
  var day=ui.dayOverride||todayName();
  var act=activeDay();
  var editable=(day===act);
  var wknd=isWeekendDay(day);
  var html='<div class="eyebrow">'+DAY_FULL[day]+' &middot; '+p.label+'</div>';
  html+=dayPicker(day);

  if(!editable){
    var notePrefix = state.activeDayOverride ? "Currently selected practice session is" : "Suggested practice session is";
    html+='<div class="note">'+notePrefix+' <b>'+DAY_FULL[act]+'</b>. <button class="tbtn" data-action="activateday" data-day="'+day+'" style="margin-top:10px;display:block;">Switch to '+DAY_FULL[day]+' instead \u2192</button></div>';
  }

  if(p.kind==="setup"){
    var preBody='<ul class="check">'+PREREQ.map(function(pr,i){
      var kk = k("p0","pre",i);
      if(state.checks[kk] && state.checks[kk] !== todayISO()) return ""; 
      return prereqItem(pr.t,kk,pr.url,editable);
    }).join("")+'</ul>';
    html+=blk("prereq",day,"Prerequisites",null,preBody,editable);
    html+=blk("warmup",day,"Warm-Up",null,'<p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p>',editable);
    html+='<div class="note">Run the Phase Transition Test on Home for your baseline - it\'s informational here, not required to advance.</div>';
    return html;
  }

  if(wknd){
    html+=blk("warmup",day,"Warm-Up","15 min",'<p>Extended warm-up + weak-spot review.</p>',editable);
    if(day==="Sat"){
      var songHtml = getDailyActiveSequence(p.songs||[], p.id+".s", editable, false);
      var body='<p>Deep-dive: polish next solo toward full tempo.</p>' + (songHtml ? '<ul class="check">'+songHtml+'</ul>' : '<p>All this tier\'s solos learned. \ud83c\udfb8</p>');
      html+=blk("casual",day,"CASUAL","45 min",body,editable);
    } else {
      var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
      var gateObj = IMPROV_GATES[actGate];
      var nextEx = null;
      for(var i=0; i<gateObj.exercises.length; i++){
        if(!state.improvChecks["g"+actGate+"e"+i]) { nextEx = gateObj.exercises[i]; break; }
      }
      var body = '<p style="color:var(--text); font-weight:600; margin-bottom:6px;">Gate '+(actGate+1)+': '+gateObj.title+'</p>';
      if(nextEx) body += '<p style="font-size:13px; margin-bottom:10px;"><b>Next up:</b> '+nextEx.t+'</p>';
      else body += '<p style="font-size:13px; margin-bottom:10px;">Ready to unlock the next gate!</p>';
      body += '<button class="tbtn purple" data-action="go" data-view="improv" style="width:100%; text-align:center;">Open Improv Masterclass</button>';
      html+=blk("casual",day,"Improv & Expression","45 min",body,editable,"improv");
    }
    return html;
  }

  var essential=ESSENTIAL[day]||"Reinforce Weakest";
  var essUrl=ESSENTIAL_URL[essential];

  html+=blk("warmup",day,"Warm-Up","5 min",'<p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p>',editable);

  var focusBody='';
  if(day==="Mon"){
    if(p.concept && p.concept.length){
      var conceptHtml = getDailyActiveSequence(p.concept, p.id+".c", editable, true);
      focusBody += conceptHtml ? '<ul class="check">'+conceptHtml+'</ul>' : '<p>All concept videos completed.</p>';
    } else {
      focusBody += '<p>All concept videos completed.</p>';
    }
    
    var monExHtml = p.exercises.map(function(t,i){
      var kk = k(p.id,"e",i);
      return checkItem(t.t, kk, t.url, editable);
    }).join("");
    if(monExHtml) focusBody+='<p style="margin-top:8px;">Exercises in rotation (check off once solid):</p><ul class="check">'+monExHtml+'</ul>';
    else focusBody+='<p style="margin-top:8px;color:var(--muted);">All exercises mastered for this phase! \ud83c\udfb8</p>';

  } else if(day==="Tue"){
    var tueExHtml = p.exercises.map(function(t,i){
      var kk = k(p.id,"e",i);
      return checkItem(t.t, kk, t.url, editable);
    }).join("");
    if(tueExHtml) focusBody+='<p style="margin-bottom:8px;">Exercises in rotation (check off once solid):</p><ul class="check">'+tueExHtml+'</ul>';
    else focusBody+='<p style="margin-bottom:8px;color:var(--muted);">All exercises mastered for this phase! \ud83c\udfb8</p>';
    
    focusBody+='<p style="margin:8px 0;">Chop-builders (picking) - protect ~15 min:</p>'+chopRow(p.target,["alt","sweep"]);
  } else if(day==="Wed"){
    var theoryHtml = "";
    THEORY_DOCS.forEach(function(docItemObj){
      theoryHtml += docItem(docItemObj.t, docItemObj.url);
    });
    
    var activeItem = null, activeGroup = null;
    for(var i=0; i<THEORY_GROUPS.length; i++){
      var g = THEORY_GROUPS[i];
      for(var j=0; j<g.items.length; j++){
        var t = g.items[j];
        if(!state.checks[t.key] || state.checks[t.key] === todayISO()){
          activeItem = t; activeGroup = g; break;
        }
      }
      if(activeItem) break;
    }
    
    if(activeGroup && activeGroup.docs) {
      activeGroup.docs.forEach(function(d){ theoryHtml += docItem(d.t, d.url); });
    }

    var theorySeq = getDailyActiveSequence(THEORY_ITEMS, "theory", editable, true);
    if(theorySeq) {
      theoryHtml += theorySeq;
    } else {
      theoryHtml += '<p style="margin-top:8px;color:var(--muted);">All theory items completed!</p>';
    }
    focusBody+='<p style="margin-bottom:8px;">Theory in rotation:</p><ul class="check">'+theoryHtml+'</ul>';
  } else if(day==="Thu"){
    focusBody+='<p style="margin-bottom:8px;">Chop-builders (legato/economy/tapping):</p>'+chopRow(p.target,["legato","econ","tap"]);
  } else if(day==="Fri"){
    focusBody+='<p>Revisit your hardest exercise or chop-builder from the week, then spend the micro-dose reinforcing whichever skill felt weakest.</p>';
    if(p.testReq){
      var met=TESTCATS.filter(function(c){return (state.testLevel[c.key]||0)>=p.testReq;}).length;
      focusBody+='<div class="note" style="margin-top:10px;">Phase Transition Test: '+met+'/'+TESTCATS.length+' at Level '+p.testReq+'+. <button class="tbtn" data-action="go" data-view="home" style="margin-top:8px;display:block;">Retake Phase Test \u2192</button></div>';
    }
  }
  if(day!=="Fri") focusBody+='<p style="margin-top:10px;">+ 5 min: '+linked(essential+" micro-dose",essUrl)+'</p>';
  html+=blk("focused",day,"Focused","30 + 5 min",focusBody,editable);

  if(day==="Mon"||day==="Thu"){ 
    var casualBody='';
    var songHtml = getDailyActiveSequence(p.songs||[], p.id+".s", editable, false);
    casualBody += songHtml ? '<ul class="check">'+songHtml+'</ul>' : '<p>All this tier\'s solos learned. \ud83c\udfb8</p>';
    html+=blk("casual",day,"Casual","15 min",casualBody,editable);
  }
  else if(day==="Tue" || day==="Wed" || day==="Fri"){ 
    var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
    var gateObj = IMPROV_GATES[actGate];
    var nextEx = null;
    for(var i=0; i<gateObj.exercises.length; i++){
      if(!state.improvChecks["g"+actGate+"e"+i]) { nextEx = gateObj.exercises[i]; break; }
    }
    var body = '<p style="color:var(--text); font-weight:600; margin-bottom:6px;">Gate '+(actGate+1)+': '+gateObj.title+'</p>';
    if(nextEx) body += '<p style="font-size:13px; margin-bottom:10px;"><b>Next up:</b> '+nextEx.t+'</p>';
    else body += '<p style="font-size:13px; margin-bottom:10px;">Ready to unlock the next gate!</p>';
    body += '<button class="tbtn purple" data-action="go" data-view="improv" style="width:100%; text-align:center;">Open Improv Masterclass</button>';
    html+=blk("casual",day,"Improv & Expression","15 min",body,editable,"improv");
  }

  html+=blk("cooldown",day,"Cool-Down","5 min",'<p>Quick review - what clicked, what didn\'t.</p>',editable);
  return html;
}
