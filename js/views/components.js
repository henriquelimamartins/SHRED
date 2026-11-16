// Small HTML builders shared by the views (checklist rows, steppers, day picker, DAILY blocks).
// Slice 4.4 (D123): the 5-segment phase bar (progressBar) is gone; the pillar rails (views/rails.js) replace it.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { CHOP, TESTCATS, BONUS } from "../data/bhgs.js?v=1";
import { DAY_ORDER } from "../data/days.js?v=1";
import { state } from "../store.js?v=5";
import { todayISO, todayName, activeDay } from "../logic/dates.js?v=7";
import { isBlockPracticed } from "../logic/daily.js?v=25";

/* ---------- render helpers ---------- */
export function linked(label,url){ return url? '<a href="'+url+'" target="_blank" rel="noopener">'+label+'</a>' : label; }
export function checkItem(label,key,url,editable){
  if(editable===undefined) editable=true;
  var c=!!state.checks[key];
  var btn = editable
    ? '<button class="mbtn'+(c?" on":"")+'" data-action="togm" data-key="'+key+'">'+(c?"\u2713 Mastered":"Unmastered")+'</button>'
    : '<button class="mbtn ro'+(c?" on":"")+'">'+(c?"\u2713 Mastered":"Unmastered")+'</button>';
  return '<li class="mrow"><div class="itxt'+(c?" done":"")+'">'+linked(label,url)+'</div>'+btn+'</li>';
}
export function watchItem(label,key,url,editable){
  if(editable===undefined) editable=true;
  var c=!!state.checks[key];
  var btn = editable
    ? '<button class="mbtn blue'+(c?" on":"")+'" data-action="togm" data-key="'+key+'">'+(c?"\u2713 Watched":"Unwatched")+'</button>'
    : '<button class="mbtn ro blue'+(c?" on":"")+'">'+(c?"\u2713 Watched":"Unwatched")+'</button>';
  return '<li class="mrow"><div class="itxt'+(c?" done":"")+'">'+linked(label,url)+'</div>'+btn+'</li>';
}
export function prereqItem(label,key,url,editable){
  if(editable===undefined) editable=true;
  var c=!!state.checks[key];
  var btn = editable
    ? '<button class="mbtn blue'+(c?" on":"")+'" data-action="togm" data-key="'+key+'">'+(c?"\u2713 Completed":"Incomplete")+'</button>'
    : '<button class="mbtn ro blue'+(c?" on":"")+'">'+(c?"\u2713 Completed":"Incomplete")+'</button>';
  return '<li class="mrow"><div class="itxt'+(c?" done":"")+'">'+linked(label,url)+'</div>'+btn+'</li>';
}
export function docItem(label,url){ return '<li class="docli"><div class="docic">\ud83d\udcd6</div><div class="itxt">'+linked(label,url)+'</div></li>'; }
export function chopRow(target,onlyKeys,editable){
  if(editable===undefined) editable=true;
  var list=onlyKeys?CHOP.filter(function(c){return onlyKeys.indexOf(c.key)!==-1;}):CHOP;
  return list.map(function(c){
    var lvl=state.chop[c.key]||0,hit=target&&lvl>=target;
    var minus=editable?'<button data-action="chop" data-t="'+c.key+'" data-d="-1"> - </button>':'';
    var plus=editable?'<button data-action="chop" data-t="'+c.key+'" data-d="1">+</button>':'';
    return '<div class="chop"><div class="nm">'+linked(c.label,c.url)+(target?'<b>target: Level '+target+'</b>':'<b>lifetime level</b>')+'</div><div class="stepper">'+
      minus+'<div class="lvl'+(hit?" hit":"")+'">'+lvl+(target?"/"+target:"/10")+'</div>'+plus+'</div></div>';
  }).join("");
}
export function testRow(req){
  return TESTCATS.map(function(c){
    var lvl=state.testLevel[c.key]||0,hit=req&&lvl>=req;
    var displayTitle = linked(c.label,c.url) + (c.emoji ? ' <span class="emoji-inline">'+c.emoji+'</span>' : '');
    return '<div class="chop"><div class="nm">'+displayTitle+(req?'<b>need: Level '+req+'</b>':'<b>baseline</b>')+'</div><div class="stepper">'+
      '<button data-action="test" data-t="'+c.key+'" data-d="-1"> - </button><div class="lvl'+(hit?" hit":"")+'">'+lvl+'/5</div>'+
      '<button data-action="test" data-t="'+c.key+'" data-d="1">+</button></div></div>';
  }).join("");
}
export function renderBonusList(){
  return BONUS.map(function(b){
    if(b.slider){
      var lvl=state.bonusLevel[b.slider.key]||0;
      var isMax = lvl >= b.slider.max;
      return '<div class="chop"><div class="nm">'+linked(b.t,b.url)+'</div><div class="stepper">'+
        '<button data-action="bonuslvl" data-k="'+b.slider.key+'" data-max="'+b.slider.max+'" data-d="-1"> - </button>'+
        '<div class="lvl'+(isMax?" hit":"")+'">'+lvl+'/'+b.slider.max+'</div>'+
        '<button data-action="bonuslvl" data-k="'+b.slider.key+'" data-max="'+b.slider.max+'" data-d="1">+</button></div></div>';
    }
    return '<div class="chop"><div class="nm">'+linked(b.t,b.url)+'</div></div>';
  }).join("");
}
export function dayPicker(selectedDay){
  // Slice 4.7 (D133): the selected day is marked for screen readers (aria-pressed) and today with aria-current.
  var today=todayName(), act=activeDay();
  return '<div class="daypick" role="group" aria-label="Day">'+DAY_ORDER.map(function(d){
    var cls="dchip2"+(d===selectedDay?" on":"")+(d===today?" istoday":"")+(d===act&&act!==today?" isactive":"");
    return '<button type="button" class="'+cls+'" data-action="setday" data-day="'+d+'" aria-pressed="'+(d===selectedDay)+'"'+(d===today?' aria-current="date"':'')+'>'+d+'</button>';
  }).join("")+'</div>';
}
// Slice 4.7 (D133): `num` (optional) shows the block number (01, 02…) before the title; "Practiced" is a button
// (the same data-action), with the label before the box as drawn. Read-only days show a disabled button.
export function blk(name,day,title,minText,bodyHtml,editable,customClass,num){
  if(editable===undefined) editable=true;
  var done=isBlockPracticed(name,day);
  var check = editable
    ? '<button type="button" class="blkcheck" data-action="blockprac" data-block="'+name+'" data-day="'+day+'" aria-pressed="'+done+'"><span>Practiced</span><span class="box'+(done?" on":"")+'"></span></button>'
    : '<button type="button" class="blkcheck ro" disabled aria-pressed="'+done+'"><span>Practiced</span><span class="box'+(done?" on":"")+'"></span></button>';
  var cClass = customClass ? ' ' + customClass : '';
  var numHtml = num ? '<span class="blk-num" aria-hidden="true">'+(num<10?"0":"")+num+'</span>' : '';
  return '<div class="blk'+cClass+(done?" done-today":"")+'"><div class="top">'+numHtml+'<div class="nm">'+title+'</div><div class="topright">'+(minText?'<div class="min">'+minText+'</div>':'')+check+'</div></div>'+bodyHtml+'</div>';
}

export function getDailyActiveSequence(list, prefix, editable, isWatch){
  var html="";
  for(var i=0; i<list.length; i++){
    var kk = list[i].key ? list[i].key : (prefix + "." + i);
    var val = state.checks[kk];
    if(val){
      if(val === todayISO()){
        html += isWatch ? watchItem(list[i].t, kk, list[i].url, editable) : checkItem(list[i].t, kk, list[i].url, editable);
        break; 
      }
    } else {
      html += isWatch ? watchItem(list[i].t, kk, list[i].url, editable) : checkItem(list[i].t, kk, list[i].url, editable);
      break; 
    }
  }
  return html;
}
