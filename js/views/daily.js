// DAILY view.
// Slice 4.7 (D133): DAILY as drawn on the 4.6 canvas: header with the session count, day buttons, numbered blocks,
// the micro-dose as a dashed "+ 5 min" box and, on desktop, the companion column (views/daily-side.js).
// Texts, links, buttons, which items show and every action are unchanged (D24, D30).
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, TESTCATS, THEORY_DOCS, THEORY_GROUPS, THEORY_ITEMS, ESSENTIAL, ESSENTIAL_URL, PREREQ, WARMUP_URL } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=2";
import { DAY_FULL } from "../data/days.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { todayISO, todayName, isWeekendDay, activeDay } from "../logic/dates.js?v=7";
import { k } from "../logic/technique.js?v=26";
import { sessionPlan, isBlockPracticed } from "../logic/daily.js?v=26";
import { pageHeader } from "./shell.js?v=10";
import { linked, checkItem, prereqItem, docItem, chopRow, dayPicker, blk, getDailyActiveSequence } from "./components.js?v=26";
import { renderDailySide } from "./daily-side.js?v=6";

// Header detail (D133 point 3): "n of N practiced · M min" on the active day; another day (read-only) shows the minutes only.
function sessionCount(day, editable){
  var plan = sessionPlan(day, state.phaseIndex), min = 0, done = 0;
  plan.forEach(function(b){ min += b.min || 0; if(isBlockPracticed(b.name, day)) done++; });
  var minText = min ? min + ' min' : '';
  if(!editable) return minText ? '<span class="daily-count">' + minText + '</span>' : '';
  return '<span class="daily-count">' + done + ' of ' + plan.length + '<span class="daily-count-word"> practiced</span>' + (minText ? ' &middot; ' + minText : '') + '</span>';
}

// The "+ 5 min" micro-dose line of the Focused block, as the dashed box of the board.
function microLine(essential, essUrl){
  return '<div class="daily-micro"><span class="daily-micro-tag">+ 5 min</span><span class="daily-micro-link">' + linked(essential + " micro-dose", essUrl) + '</span></div>';
}

// The Improv & Expression block body (weekday and Sunday), unchanged texts and button.
function improvBody(){
  var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
  var gateObj = IMPROV_GATES[actGate];
  var nextEx = null;
  for(var i=0; i<gateObj.exercises.length; i++){
    if(!state.improvChecks["g"+actGate+"e"+i]) { nextEx = gateObj.exercises[i]; break; }
  }
  var body = '<p class="gate-line">Gate '+(actGate+1)+': '+gateObj.title+'</p>';
  if(nextEx) body += '<p class="u-fs-13 u-mb-10"><b>Next up:</b> '+nextEx.t+'</p>';
  else body += '<p class="u-fs-13 u-mb-10">Ready to unlock the next gate!</p>';
  body += '<button class="tbtn purple u-w100 u-center" data-action="go" data-view="improv">Open Improv Masterclass</button>';
  return body;
}

function renderSession(day, editable){
  var idx=state.phaseIndex,p=PHASES[idx];
  var wknd=isWeekendDay(day);
  var html='';
  // Blocks are numbered 01, 02… in the order they are shown (D133 point 3).
  var n=0;
  function block(name,title,minText,bodyHtml,customClass){ n++; return blk(name,day,title,minText,bodyHtml,editable,customClass,n); }

  if(!editable){
    var notePrefix = state.activeDayOverride ? "Currently selected practice session is" : "Suggested practice session is";
    html+='<div class="note daily-ro">'+notePrefix+' <b>'+DAY_FULL[activeDay()]+'</b>. <button class="tbtn u-mt-10 u-block" data-action="activateday" data-day="'+day+'">Switch to '+DAY_FULL[day]+' instead →</button></div>';
  }

  if(p.kind==="setup"){
    var preBody='<ul class="check">'+PREREQ.map(function(pr,i){
      var kk = k("p0","pre",i);
      if(state.checks[kk] && state.checks[kk] !== todayISO()) return "";
      return prereqItem(pr.t,kk,pr.url,editable);
    }).join("")+'</ul>';
    html+=block("prereq","Prerequisites",null,preBody);
    html+=block("warmup","Warm-Up",null,'<p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p>');
    html+='<div class="note">Run the Phase Transition Test on Home for your baseline - it\'s informational here, not required to advance.</div>';
    return html;
  }

  if(wknd){
    html+=block("warmup","Warm-Up","15 min",'<p>Extended warm-up + weak-spot review.</p>');
    if(day==="Sat"){
      var songHtml = getDailyActiveSequence(p.songs||[], p.id+".s", editable, false);
      var body='<p>Deep-dive: polish next solo toward full tempo.</p>' + (songHtml ? '<ul class="check">'+songHtml+'</ul>' : '<p>All this tier\'s solos learned. 🎸</p>');
      html+=block("casual","CASUAL","45 min",body);
    } else {
      html+=block("casual","Improv & Expression","45 min",improvBody(),"improv");
    }
    return html;
  }

  var essential=ESSENTIAL[day]||"Reinforce Weakest";
  var essUrl=ESSENTIAL_URL[essential];

  html+=block("warmup","Warm-Up","5 min",'<p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p>');

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
    if(monExHtml) focusBody+='<p class="u-mt-8">Exercises in rotation (check off once solid):</p><ul class="check">'+monExHtml+'</ul>';
    else focusBody+='<p class="u-mt-8 u-muted">All exercises mastered for this phase! 🎸</p>';

  } else if(day==="Tue"){
    var tueExHtml = p.exercises.map(function(t,i){
      var kk = k(p.id,"e",i);
      return checkItem(t.t, kk, t.url, editable);
    }).join("");
    if(tueExHtml) focusBody+='<p class="u-mb-8">Exercises in rotation (check off once solid):</p><ul class="check">'+tueExHtml+'</ul>';
    else focusBody+='<p class="u-mb-8 u-muted">All exercises mastered for this phase! 🎸</p>';

    focusBody+='<p class="u-my-8">Chop-builders (picking) - protect ~15 min:</p>'+chopRow(p.target,["alt","sweep"]);
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
      theoryHtml += '<p class="u-mt-8 u-muted">All theory items completed!</p>';
    }
    focusBody+='<p class="u-mb-8">Theory in rotation:</p><ul class="check">'+theoryHtml+'</ul>';
  } else if(day==="Thu"){
    focusBody+='<p class="u-mb-8">Chop-builders (legato/economy/tapping):</p>'+chopRow(p.target,["legato","econ","tap"]);
  } else if(day==="Fri"){
    focusBody+='<p>Revisit your hardest exercise or chop-builder from the week, then spend the micro-dose reinforcing whichever skill felt weakest.</p>';
    if(p.testReq){
      var met=TESTCATS.filter(function(c){return (state.testLevel[c.key]||0)>=p.testReq;}).length;
      focusBody+='<div class="note u-mt-10">Phase Transition Test: '+met+'/'+TESTCATS.length+' at Level '+p.testReq+'+. <button class="tbtn u-mt-8 u-block" data-action="go" data-view="home">Retake Phase Test →</button></div>';
    }
  }
  if(day!=="Fri") focusBody+=microLine(essential,essUrl);
  html+=block("focused","Focused","30 + 5 min",focusBody);

  if(day==="Mon"||day==="Thu"){
    var casualBody='';
    var songHtml = getDailyActiveSequence(p.songs||[], p.id+".s", editable, false);
    casualBody += songHtml ? '<ul class="check">'+songHtml+'</ul>' : '<p>All this tier\'s solos learned. 🎸</p>';
    html+=block("casual","Casual","15 min",casualBody);
  }
  else if(day==="Tue" || day==="Wed" || day==="Fri"){
    html+=block("casual","Improv & Expression","15 min",improvBody(),"improv");
  }

  html+=block("cooldown","Cool-Down","5 min",'<p>Quick review - what clicked, what didn\'t.</p>');
  return html;
}

export function renderDaily(){
  var p=PHASES[state.phaseIndex];
  var day=ui.dayOverride||todayName();
  var editable=(day===activeDay());
  var html=pageHeader(DAY_FULL[day]+' &middot; '+p.label,'Daily',sessionCount(day,editable));
  html+='<div class="daily-cols"><div class="daily-main">';
  html+=dayPicker(day);
  // Slice 4.7b (D135): the session area is what follows the finger when swiping between days on the phone.
  html+='<div class="daily-swipe">'+renderSession(day,editable)+'</div>';
  html+='</div>'+renderDailySide(day)+'</div>';
  return html;
}
