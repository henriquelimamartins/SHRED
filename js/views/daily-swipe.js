// DAILY on the phone: swipe sideways between days (slice 4.7b, I14, D135).
// The session follows the finger; on release past a threshold (a quarter of the width, or a quick flick) the
// next / previous day slides in, otherwise it springs back. It stops at Monday and Sunday (no wrap-around).
// A swipe does exactly what tapping a day button does (ui.dayOverride + render): it only changes the day being
// viewed, never the active session, and writes nothing. Vertical scrolling stays native (CSS touch-action: pan-y).
import { DAY_ORDER } from "../data/days.js?v=1";
import { ui } from "../ui.js?v=2";
import { todayName } from "../logic/dates.js?v=7";
import { render } from "../render.js?v=43";

const PHONE = '(max-width: 767px)';
const DECIDE_PX = 10;        // movement before the gesture is read as sideways or vertical
const EDGE_GIVE = 0.25;      // how much the session follows the finger past Monday / Sunday
const EDGE_MAX = 60;         // ...and at most this many px
const FLICK_SPEED = 0.3;     // px per ms that counts as a quick flick (a slow drag is ~0.1)
const FLICK_MIN = 30;        // a flick still needs this many px
const SLIDE_MS = 180;
const EDGE_ZONE = 24;        // px from the screen edges left to the system back / forward gesture

let g = null;                // the gesture in progress
let swallowClickUntil = 0;   // a swipe never ends as a tap on a button underneath
let busyUntil = 0;           // no new gesture while a day slides out / in

function reducedMotion(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function shownDay(){ return ui.dayOverride || todayName(); }
function neighbour(dir){ // dir +1 = next day, -1 = previous day; null past Monday / Sunday
  var i = DAY_ORDER.indexOf(shownDay()) + dir;
  return i >= 0 && i < DAY_ORDER.length ? DAY_ORDER[i] : null;
}
function setX(el, x, animate){
  el.style.transition = animate ? 'transform ' + SLIDE_MS + 'ms ease-out' : 'none';
  el.style.transform = x ? 'translateX(' + x + 'px)' : '';
  // Back at rest: leave no inline style behind (D118: no inline styles in the views).
  if(!x){
    if(animate) setTimeout(function(){ if(!el.style.transform) el.removeAttribute('style'); }, SLIDE_MS + 20);
    else el.removeAttribute('style');
  }
}

function showDay(day, dir){
  ui.dayOverride = day;                 // the same as tapping the day button ("setday")
  render();
  if(reducedMotion()){ busyUntil = 0; return; }
  var el = document.querySelector('#panel-daily .daily-swipe');
  if(!el) return;
  el.classList.add(dir > 0 ? 'swipe-in-next' : 'swipe-in-prev');
  el.addEventListener('animationend', function(){ el.classList.remove('swipe-in-next', 'swipe-in-prev'); }, { once: true });
}

function onDown(e){
  if(e.pointerType !== 'touch' || !e.isPrimary) return;
  if(!window.matchMedia || !window.matchMedia(PHONE).matches) return;
  swallowClickUntil = 0;
  if(e.timeStamp < busyUntil) return;
  if(e.clientX < EDGE_ZONE || e.clientX > window.innerWidth - EDGE_ZONE) return;
  var el = e.target.closest && e.target.closest('#panel-daily .daily-swipe');
  if(!el) return;
  g = { el: el, id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: e.timeStamp, dx: 0, mode: null, pts: [{ t: e.timeStamp, x: e.clientX }] };
}

function onMove(e){
  if(!g || e.pointerId !== g.id) return;
  if(!g.el.isConnected){ g = null; return; } // the page was drawn again mid-gesture
  var dx = e.clientX - g.x0, dy = e.clientY - g.y0;
  if(!g.mode){
    if(Math.abs(dx) < DECIDE_PX && Math.abs(dy) < DECIDE_PX) return;
    g.mode = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; // the same split as the browser's pan-y
    if(g.mode === 'y'){ g = null; return; }
    try { g.el.setPointerCapture(g.id); } catch(err) {}
  }
  var dir = dx < 0 ? 1 : -1;            // finger to the left = next day
  if(!neighbour(dir)) dx = Math.max(-EDGE_MAX, Math.min(EDGE_MAX, dx * EDGE_GIVE));
  g.dx = dx;
  g.pts.push({ t: e.timeStamp, x: e.clientX });
  if(g.pts.length > 6) g.pts.shift();
  setX(g.el, dx, false);
}

function onUp(e){
  if(!g || e.pointerId !== g.id) return;
  var cur = g; g = null;
  if(cur.mode !== 'x') return;
  swallowClickUntil = e.timeStamp + 300; // event time, not the wall clock; cleared by the next touch
  var dir = cur.dx < 0 ? 1 : -1, day = neighbour(dir);
  var w = cur.el.offsetWidth || window.innerWidth;
  // Flick speed from the last part of the movement (not from the start), so a slow start then a quick flick counts.
  var p0 = cur.pts[0];
  for(var i = cur.pts.length - 1; i >= 0; i--){ p0 = cur.pts[i]; if(e.timeStamp - cur.pts[i].t >= 100) break; }
  var v = (e.clientX - p0.x) / Math.max(1, e.timeStamp - p0.t);   // signed: a flick back cancels
  var flick = Math.abs(v) > FLICK_SPEED && Math.sign(v) === Math.sign(cur.dx) && Math.abs(cur.dx) > FLICK_MIN;
  var go = day && cur.el.isConnected && (Math.abs(cur.dx) > w / 4 || flick) && !(Math.abs(v) > FLICK_SPEED && Math.sign(v) !== Math.sign(cur.dx));
  if(!go){ if(cur.el.isConnected) setX(cur.el, 0, !reducedMotion()); return; }
  if(reducedMotion()){ showDay(day, dir); return; }
  busyUntil = e.timeStamp + 2 * SLIDE_MS + 50;
  setX(cur.el, -dir * w, true);
  setTimeout(function(){ showDay(day, dir); }, SLIDE_MS);
}

function onCancel(e){
  if(!g || e.pointerId !== g.id) return;
  var cur = g; g = null;
  if(cur.mode === 'x') setX(cur.el, 0, !reducedMotion());
}

export function initDailySwipe(){
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerup', onUp, { passive: true });
  document.addEventListener('pointercancel', onCancel, { passive: true });
  document.addEventListener('click', function(e){
    if(e.timeStamp < swallowClickUntil && e.target.closest && e.target.closest('#panel-daily')){ e.stopPropagation(); e.preventDefault(); }
  }, true);
}
