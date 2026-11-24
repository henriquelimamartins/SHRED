// DAILY view.
// Slice 4.10h (D162; AUDIT-4.10 points 24, 25, 28, 31, 33, 32): today's date as the eyebrow above the title; the title
// "Daily Practice" where it fits on one line, else "Daily" (fitDailyHeader); the HOME streak line on the right (phone:
// the streak pill); no count bar or count text; from 1180 px the day buttons sit over the session column only and the
// companion column starts level with them. Behaviour unchanged.
// Slice 4.10c (D152 points 14, 16, 17, 21, 22, 23): title on the left and today's date on the right (no eyebrow); the
// count as a thin bar under the day buttons; session and companion column share the full width (3 : 2);
// "Phase n · Label" inside the Focused block; the Friday Phase test as a line with one dot per category;
// Mastered / Watched buttons as in LIBRARY; buttons without final punctuation. Behaviour unchanged.
// Slice 4.10l (D154 point 3): the optional extra review on Mon, Thu and Sat (extraPart); since slice 4.10m (D167) it
// sits before Cool-Down on Mon and Thu and after Casual on Sat.
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
import { k } from "../logic/technique.js?v=41";
import { BHGS_PACK } from "../pack.js?v=1";
import { linked, checkItem, prereqItem, docItem, chopRow, dayPicker, blk, getDailyActiveSequence } from "./components.js?v=41";
import { renderDailySide } from "./daily-side.js?v=20";
import { streakLine, streakPill } from "./streak.js?v=5";
import { improvKeyOfDay, improvReviewPicks, improvExtraPlan, improvDayContext, exerciseLines, EXTRA_DAYS } from "./improv.js?v=32";

// Slice 4.10h (D162 point 4; AUDIT-4.10 point 33): today's date (the device's local day) as the page eyebrow, long
// ("Tuesday · November 10th, 2026") or short ("Tue · Nov 10th, 2026"); the title "Daily Practice" or "Daily"; on the
// right the HOME streak line (desktop) or the streak pill (phone, CSS). Both forms of the date and of the title are in
// the page; fitDailyHeader() shows the long ones only where they fit on one line. Screen readers always hear
// "Daily Practice" (the visible title spans are hidden from them).
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function ordinal(n){ var v = n % 100, s = ['th','st','nd','rd']; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function dailyHeader(){
  var d = new Date(), dn = todayName(), m = MONTHS[d.getMonth()], tail = ordinal(d.getDate()) + ', ' + d.getFullYear();
  return '<header class="page-head daily-head"><div class="page-head-main">' +
    '<time class="eyebrow page-eyebrow daily-date" datetime="' + todayISO() + '">' +
    '<span class="daily-date-long">' + DAY_FULL[dn] + ' &middot; ' + m + ' ' + tail + '</span>' +
    '<span class="daily-date-short">' + dn + ' &middot; ' + m.slice(0, 3) + ' ' + tail + '</span></time>' +
    '<h1 class="page-title daily-title"><span class="daily-title-long" aria-hidden="true">Daily Practice</span>' +
    '<span class="daily-title-short" aria-hidden="true">Daily</span><span class="daily-sr">Daily Practice</span></h1></div>' +
    '<div class="page-head-right">' + streakLine() + streakPill() + '</div></header>';
}

// Slice 4.10h (D162 point 4): the long title and the long date only where they fit on one line beside the right-hand
// side, measured on the page (not by device). Runs after every render, whenever the header changes size (window
// resize, the DAILY page becoming visible) and once the web fonts have loaded. Reads the layout only; writes nothing.
var headObserver = null, fontsHooked = false;
export function fitDailyHeader(){
  var head = document.querySelector('#panel-daily .daily-head');
  if(!head || !head.offsetWidth) return; // not on screen: measured when it becomes visible
  head.classList.remove('fit-short-title', 'fit-short-date');
  var right = head.querySelector('.page-head-right');
  var gap = parseFloat(getComputedStyle(head).columnGap) || 0;
  var room = head.clientWidth - (right ? right.getBoundingClientRect().width + gap : 0) - 2;
  var longTitle = head.querySelector('.daily-title-long'), longDate = head.querySelector('.daily-date-long');
  if(longTitle && longTitle.getBoundingClientRect().width > room) head.classList.add('fit-short-title');
  if(longDate && longDate.getBoundingClientRect().width > room) head.classList.add('fit-short-date');
  head.classList.add('fitted');
}
export function watchDailyHeader(){
  var head = document.querySelector('#panel-daily .daily-head');
  if(headObserver) headObserver.disconnect();
  if(head && typeof ResizeObserver === 'function'){
    headObserver = new ResizeObserver(function(){ fitDailyHeader(); });
    headObserver.observe(head);
  }
  if(!fontsHooked && document.fonts){
    fontsHooked = true;
    if(document.fonts.ready) document.fonts.ready.then(fitDailyHeader);
    if(document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitDailyHeader);
  }
  fitDailyHeader();
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

// Slice 4.10l (D154 point 3, AUDIT-4.10 point 19): the optional extra review on Mon, Thu and Sat (before Cool-Down on
// Mon / Thu, after Casual on Sat, slice 4.10m). Collapsed by default and outside the blocks: no Practiced tick, not in the session minutes or the count, and
// nothing is written; the review queue is not touched (improv.js).
// Slice 4.10m (D167; owner approved the "Bonus round" pitch, 2026-11-23): a short card instead of paragraphs. Closed:
// bolt icon, EXTRA TIME, one line (Bonus round · n exercises · minutes), Optional. Open: one line with the key and how
// to play, the exercises as tiles (number · Gate, name, 5 min, Show to open its lines; "Next Review too" when it also
// comes up in the next Review), a Combo tile on Mon / Thu, a Free jam tile with one Mastered, and one footer line.
// Nothing Mastered: the card is not openable and its line says the free jam. Owner's 4.10l choices built here: the
// stretch line on all three days, "over a drone or any track" and "If they clash, alternate them every phrase."
var BOLT = '<svg class="ico dx-bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"></path></svg>';
function dxIcon(path){ return '<svg class="ico dx-foot-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg>'; }
var DX_DOWN = '<svg class="ico dx-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>';
function extraHead(sub, subOpen, openable){
  return '<span class="dx-ic">' + BOLT + '</span><span class="dx-text"><span class="daily-extra-title">Extra time</span>' +
    '<span class="dx-sub dx-sub-closed">' + sub + '</span>' + (subOpen ? '<span class="dx-sub dx-sub-open">' + subOpen + '</span>' : '') + '</span>' +
    '<span class="daily-extra-tag">Optional</span>' + (openable ? DX_DOWN : '');
}
function extraTile(cls, tag, name, min, extra, attrs){
  return '<li class="dx-tile' + (cls ? ' ' + cls : '') + '"' + (attrs || '') + '><span class="dx-tag">' + tag + '</span>' +
    '<p class="dx-name">' + name + '</p><div class="dx-row"><span class="dx-min">' + min + '</span>' + (extra || '') + '</div></li>';
}
function extraPart(day){
  if(!EXTRA_DAYS[day]) return '';
  var plan = improvExtraPlan(day, todayISO()), ctx = improvDayContext();
  var key = improvKeyOfDay().k.replace(' ', '&nbsp;'), where = key + ' &middot; box&nbsp;' + ctx.box, mon = day !== 'Sat';
  var count = plan.picks.length, combine = mon && count === 2;
  var min = (combine ? '10&ndash;15' : '10') + '&nbsp;min';
  if(plan.empty){
    return '<div class="daily-extra dx-static" role="group" aria-label="Extra time, optional"><div class="dx-head">' +
      extraHead('Free jam &middot; ' + where + ' &middot; ' + min, '', false) + '</div></div>';
  }
  var sub = 'Bonus round &middot; ' + count + (count === 1 ? ' exercise + free jam' : ' exercises') + ' &middot; ' + min;
  var subOpen = 'In ' + key + ', from memory, over a drone or any track';
  var tiles = plan.picks.map(function(p, k){
    var name = p.ex.t.replace(/^\d+\.\s*/, '');
    var show = '<details class="daily-review-more dx-more"><summary>' + CHEVRON + '<span class="daily-review-show">Show</span><span class="daily-review-hide">Hide</span></summary>' +
      '<div class="daily-review-body"><p class="daily-review-note">' + REVIEW_NOTE + '</p>' + exerciseLines(p.ex) + '</div></details>';
    return extraTile('dx-ex', '0' + (k + 1) + ' &middot; Gate&nbsp;' + (p.g + 1) + (p.again ? '<span class="dx-again">Next Review too</span>' : ''),
      name, '5&nbsp;min', show, ' data-g="' + p.g + '" data-e="' + p.e + '"');
  }).join('');
  if(combine) tiles += extraTile('dx-combo', '+ Combo', 'Both rules at once', '3&ndash;5&nbsp;min', '<span class="dx-note">If they clash, alternate them every phrase.</span>');
  if(plan.jam) tiles += extraTile('dx-jam', '+ Jam', 'Free jam', plan.jam + '&nbsp;min', '<span class="dx-note">' + where + '</span>');
  var foot = '<div class="dx-foot"><span>' + dxIcon('M5 5l14 14M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z') + 'Not counted in the session or the streak</span>' +
    '<span>' + dxIcon('M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5a1.5 1.5 0 0 1 3 0v8M17 13v-2a1.5 1.5 0 0 1 3 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4 15.5a1.5 1.5 0 0 1 2.3-1.9L8 15') + 'Stretch your hands and forearms after</span></div>';
  return '<details class="daily-extra"><summary class="dx-head">' + extraHead(sub, subOpen, true) + '</summary>' +
    '<div class="daily-extra-body"><ul class="dx-tiles">' + tiles + '</ul>' + foot + '</div></details>';
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
      html+=extraPart(day);
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

  // Slice 4.10m (D167; owner): on Mon and Thu the optional extra time comes before Cool-Down (Sat: after Casual).
  html+=extraPart(day);
  html+=block("cooldown","Cool-Down","5 min",'<p>Quick review - what clicked, what didn\'t.</p>');
  return html;
}

export function renderDaily(){
  var day=ui.dayOverride||todayName();
  var editable=(day===activeDay());
  // Slice 4.10h (D162 points 2 and 3): the header uses the full width; under it the first column holds the day buttons
  // and the session, and the companion column sits beside it (3 : 2, from 1180 px) starting level with the day buttons,
  // or under the session on narrower windows (CSS). No count bar or count text.
  var html=dailyHeader();
  html+='<div class="daily-cols"><div class="daily-main">';
  html+='<div class="daily-top">'+dayPicker(day)+'</div>';
  // Slice 4.7b (D135): the session area is what follows the finger when swiping between days on the phone.
  html+='<div class="daily-swipe">'+renderSession(day,editable)+'</div>';
  html+='</div>'+renderDailySide(day)+'</div>';
  return html;
}
