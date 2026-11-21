// DAILY view.
// Slice 4.10c (D152 points 14, 16, 17, 21, 22, 23): title on the left and today's date on the right (no eyebrow); the
// count as a thin bar under the day buttons; session and companion column share the full width (3 : 2);
// "Phase n · Label" inside the Focused block; the Friday Phase test as a line with one dot per category;
// Mastered / Watched buttons as in LIBRARY; buttons without final punctuation. Behaviour unchanged.
// Slice 4.8c3 (D146): the Improv & Expression block starts with a Review part (already-Mastered exercises).
// Slice 4.7 (D133): DAILY as drawn on the 4.6 canvas: header with the session count, day buttons, numbered blocks,
// the micro-dose as a dashed "+ 5 min" box and, on desktop, the companion column (views/daily-side.js).
// Texts, links, buttons, which items show and every action are unchanged (D24, D30).
// Slice 4.5b (D125, D126): the drawn page header (muted eyebrow + large title).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { PHASES, TESTCATS, THEORY_DOCS, THEORY_GROUPS, THEORY_ITEMS, ESSENTIAL, ESSENTIAL_URL, PREREQ, WARMUP_URL } from "../data/bhgs.js?v=1";
import { IMPROV_GATES } from "../data/improv.js?v=4";
import { DAY_FULL } from "../data/days.js?v=1";
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=2";
import { todayISO, todayName, isWeekendDay, activeDay } from "../logic/dates.js?v=7";
import { k } from "../logic/technique.js?v=34";
import { sessionPlan, isBlockPracticed } from "../logic/daily.js?v=34";
import { BHGS_PACK } from "../pack.js?v=1";
import { linked, checkItem, prereqItem, docItem, chopRow, dayPicker, blk, getDailyActiveSequence } from "./components.js?v=34";
import { renderDailySide } from "./daily-side.js?v=13";
import { improvKeyOfDay, improvReviewPicks, exerciseLines } from "./improv.js?v=25";

// Slice 4.10c (D152 point 16): today's date on the right of the title, long on desktop, short on the phone
// ("Tuesday · November 10th, 2026" / "Tue · Nov 10th, 2026"), from the device's local day like every other date.
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function ordinal(n){ var v = n % 100, s = ['th','st','nd','rd']; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function dailyHeader(){
  var d = new Date(), dn = todayName(), m = MONTHS[d.getMonth()], tail = ordinal(d.getDate()) + ', ' + d.getFullYear();
  return '<header class="page-head daily-head"><div class="page-head-main"><h1 class="page-title">Daily</h1></div>' +
    '<div class="page-head-right"><time class="eyebrow daily-date" datetime="' + todayISO() + '">' +
    '<span class="daily-date-long">' + DAY_FULL[dn] + ' &middot; ' + m + ' ' + tail + '</span>' +
    '<span class="daily-date-short">' + dn + ' &middot; ' + m.slice(0, 3) + ' ' + tail + '</span></time></div></header>';
}

// Slice 4.10c (D152 point 16; D133 point 3): the count as a thin bar under the day buttons, "n of N practiced" and the
// minutes; another day (read-only) shows the minutes only. The fill width comes from a class (twelfths), never a style.
function sessionProgress(day, editable){
  var plan = sessionPlan(day, state.phaseIndex), min = 0, done = 0;
  plan.forEach(function(b){ min += b.min || 0; if(isBlockPracticed(b.name, day)) done++; });
  var minHtml = min ? '<span class="daily-progress-min">' + min + ' min</span>' : '';
  if(!editable) return minHtml ? '<div class="daily-progress ro"><div class="daily-progress-text">' + minHtml + '</div></div>' : '';
  var n = plan.length, fill = n ? Math.round(done * 12 / n) : 0;
  return '<div class="daily-progress"><div class="daily-progress-text"><span class="daily-progress-count">' + done + ' of ' + n + ' practiced</span>' + minHtml + '</div>' +
    '<div class="daily-progress-bar" role="progressbar" aria-label="Blocks practiced" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + done + '" aria-valuetext="' + done + ' of ' + n + ' practiced">' +
    '<span class="daily-progress-fill f' + fill + '"></span></div></div>';
}

// Slice 4.10c (D152 point 16): the phase and its label inside the block that carries the phase content.
function phaseTag(idx, p){ return '<div class="daily-phase"><span>Phase ' + idx + ' &middot; ' + p.label + '</span></div>'; }

// Slice 4.10c (D152 point 22): the Friday Phase Transition Test as a line inside the Focused block: label, the count,
// one dot per category (filled when its level reaches the phase's requirement) and "Open Phase test" (TECHNIQUE page,
// slice 4.10a; only with the BHGS pack). On the phone the parts stack (CSS). Reads only.
var CHEV_RIGHT = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>';
function phaseTestLine(p){
  var met = [], dots = TESTCATS.map(function(c){
    var on = (state.testLevel[c.key] || 0) >= p.testReq;
    if(on) met.push(c.label);
    return '<span class="daily-ptest-dot' + (on ? ' on' : '') + '" data-cat="' + c.key + '" title="' + c.label + '"></span>';
  }).join('');
  var n = TESTCATS.length, req = p.testReq;
  var aria = met.length + ' of ' + n + ' categories at Level ' + req + ' or higher' + (met.length ? ': ' + met.join(', ') : '');
  return '<div class="daily-ptest"><div class="daily-ptest-text"><span class="daily-ptest-label">Phase Transition Test</span>' +
    '<span class="daily-ptest-count">' + met.length + ' of ' + n + '<span class="daily-ptest-word"> categories</span> at Level ' + req + '+</span></div>' +
    '<span class="daily-ptest-dots" role="img" aria-label="' + aria + '">' + dots + '</span>' +
    (BHGS_PACK ? '<button type="button" class="daily-ptest-link" data-action="phasetest">Open Phase test' + CHEV_RIGHT + '</button>' : '') + '</div>';
}

// The "+ 5 min" micro-dose line of the Focused block, as the dashed box of the board.
function microLine(essential, essUrl){
  return '<div class="daily-micro"><span class="daily-micro-tag">+ 5 min</span><span class="daily-micro-link">' + linked(essential + " micro-dose", essUrl) + '</span></div>';
}

// Slice 4.8c3 (D146): the Review part, practised first. Already-Mastered exercises from the practice-driven queue of
// views/improv.js (5 min on weekdays, 3 × 5 min on Sunday), each with a native "Show exercise" that opens its lines
// with today's values. Nothing when nothing is Mastered; reads only, writes nothing.
var REVIEW_NOTE = 'Notes and chords in the rule come from an example key, with their degrees in brackets: play the degrees.';
var CHEVRON = '<svg class="ico daily-review-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>';
function reviewPart(day){
  var picks = improvReviewPicks(day, todayISO());
  if(!picks.length) return '';
  var sun = day === 'Sun', many = picks.length > 1;
  var key = improvKeyOfDay().k.replace(' ', '&nbsp;');
  var help = 'First, from memory: play ' + (many ? 'them' : 'it') + ' in today\'s key (' + key + ')' + (sun && picks.length === 3 ? ', 5&nbsp;min each' : '') +
    ', in your usual tuning, over any track or a drone on the root. Then open ' + (many ? 'each' : 'it') + ' to check.' +
    (sun && !many ? ' Change box or position every 5&nbsp;minutes.' : '');
  var items = picks.map(function(p){
    var name = p.ex.t.replace(/^\d+\.\s*/, '');
    return '<li class="daily-review-ex" data-g="' + p.g + '" data-e="' + p.e + '">' +
      '<p class="daily-review-name"><b>' + name + '</b> &middot; Gate&nbsp;' + (p.g + 1) + '</p>' +
      '<details class="daily-review-more"><summary>' + CHEVRON + '<span class="daily-review-show">Show exercise</span><span class="daily-review-hide">Hide exercise</span></summary>' +
      '<div class="daily-review-body"><p class="daily-review-note">' + REVIEW_NOTE + '</p>' + exerciseLines(p.ex) + '</div></details></li>';
  }).join('');
  return '<div class="daily-review" role="group" aria-label="Review">' +
    '<span class="daily-review-tag">Review &middot; ' + (sun ? 15 : 5) + '&nbsp;min</span>' +
    '<p class="daily-review-help">' + help + '</p>' +
    '<ul class="daily-review-list">' + items + '</ul></div>';
}

// The Improv & Expression block body (weekday and Sunday): the Review part first (4.8c3), then the unchanged texts and button.
function improvBody(day){
  var actGate = Math.min(state.improvIndex, IMPROV_GATES.length - 1);
  var gateObj = IMPROV_GATES[actGate];
  var nextEx = null;
  for(var i=0; i<gateObj.exercises.length; i++){
    if(!state.improvChecks["g"+actGate+"e"+i]) { nextEx = gateObj.exercises[i]; break; }
  }
  var body = reviewPart(day) + '<p class="gate-line">Gate '+(actGate+1)+': '+gateObj.title+'</p>';
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
    html+='<div class="note daily-ro">'+notePrefix+' <b>'+DAY_FULL[activeDay()]+'</b>. <button class="tbtn u-mt-10 u-block" data-action="activateday" data-day="'+day+'">Switch to '+DAY_FULL[day]+' instead</button></div>';
  }

  if(p.kind==="setup"){
    var preBody='<ul class="check">'+PREREQ.map(function(pr,i){
      var kk = k("p0","pre",i);
      if(state.checks[kk] && state.checks[kk] !== todayISO()) return "";
      return prereqItem(pr.t,kk,pr.url,editable);
    }).join("")+'</ul>';
    html+=block("prereq","Prerequisites",null,phaseTag(idx,p)+preBody);
    html+=block("warmup","Warm-Up",null,'<p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p>');
    // Slice 4.10a: the test lives on the TECHNIQUE page since 4.3 (D122), not on HOME; without the BHGS pack there is no TECHNIQUE page.
    if(BHGS_PACK) html+='<div class="note">Run the Phase Transition Test on the TECHNIQUE page for your baseline - it\'s informational here, not required to advance.</div>';
    return html;
  }

  if(wknd){
    html+=block("warmup","Warm-Up","15 min",'<p>Extended warm-up + weak-spot review.</p>');
    if(day==="Sat"){
      var songHtml = getDailyActiveSequence(p.songs||[], p.id+".s", editable, false);
      var body='<p>Deep-dive: polish next solo toward full tempo.</p>' + (songHtml ? '<ul class="check">'+songHtml+'</ul>' : '<p>All this tier\'s solos learned. 🎸</p>');
      html+=block("casual","CASUAL","45 min",body);
    } else {
      html+=block("casual","Improv & Expression","45 min",improvBody(day),"improv");
    }
    return html;
  }

  var essential=ESSENTIAL[day]||"Reinforce Weakest";
  var essUrl=ESSENTIAL_URL[essential];

  html+=block("warmup","Warm-Up","5 min",'<p>'+linked("Ultimate 5-Minute Warm-Up",WARMUP_URL)+'</p>');

  var focusBody=phaseTag(idx,p);
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
    if(p.testReq) focusBody+=phaseTestLine(p);
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
    html+=block("casual","Improv & Expression","15 min",improvBody(day),"improv");
  }

  html+=block("cooldown","Cool-Down","5 min",'<p>Quick review - what clicked, what didn\'t.</p>');
  return html;
}

export function renderDaily(){
  var day=ui.dayOverride||todayName();
  var editable=(day===activeDay());
  // Slice 4.10c (D152 points 14, 16, 17): header, day buttons and the count bar use the full width; then the session
  // and the companion column share it 3 : 2 (the companion goes under the session on narrower windows, CSS).
  var html=dailyHeader();
  html+='<div class="daily-top">'+dayPicker(day)+sessionProgress(day,editable)+'</div>';
  html+='<div class="daily-cols"><div class="daily-main">';
  // Slice 4.7b (D135): the session area is what follows the finger when swiping between days on the phone.
  html+='<div class="daily-swipe">'+renderSession(day,editable)+'</div>';
  html+='</div>'+renderDailySide(day)+'</div>';
  return html;
}
