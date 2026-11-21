// UI state shared by the views (open view, open accordions, pending confirmations) and the notifications.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.

export let ui={view:"home",lib:{},dayOverride:null,resetConfirm:false,phaseJumpPending:null};
export const APP_VIEWS = ["home", "daily", "improv", "dojo", "library", "setup"];

// Notifications (slice 4.10b, D152 point 6): stacked cards with an icon and a colour per kind, a close button and
// auto-close after 4 s (paused while hovered or focused). Desktop: top right; phone: above the bottom bar (CSS).
// The newest card carries id="toast"; when none is shown an empty #toast stays in the stack. Messages are set as text
// (never as HTML); a card on screen has the class "show", as the old single toast did. Callers may pass a kind; otherwise it is read from the message (persistence files stay untouched).
var TOAST_MS = 4000;
var TOAST_MAX = 3;
var TOAST_ICONS = {
  success: "M5 12l5 5 9-10",
  info: "M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  warn: "M12 4l9 16H3zM12 10v4M12 17h.01",
  error: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16h.01",
  unlock: "M7 11V7a5 5 0 0 1 9.6-2M5 11h14v10H5zM12 15v2",
  milestone: "M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 11.5c0-1.5.6-2.6 1.4-3.4C9.6 10 11 10.5 11 10.5 10.4 7.5 12 5 12 3z"
};
export function toastKind(msg){
  var m = String(msg);
  if(/^(Updated with newer progress|Cloud progress is still loading|No cloud data found|Global search)/.test(m)) return "info";
  if(/^(Could not back up|Could not create|Error |Login failed|This file is not)/.test(m)) return "error";
  if(/^(Could not reach|Your progress was saved by a newer|This backup was made by a newer|Newer progress from another device|Please login first|This backup is no longer)/.test(m)) return "warn";
  return "success";
}
function toastStack(){
  var s = document.getElementById("toasts");
  if(!s){ s = document.createElement("div"); s.id = "toasts"; s.className = "toasts"; document.body.appendChild(s); }
  return s;
}
function svgIcon(d, size){
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", size); svg.setAttribute("height", size); svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round"); svg.setAttribute("aria-hidden", "true");
  var path = document.createElementNS(ns, "path"); path.setAttribute("d", d); svg.appendChild(path);
  return svg;
}
function keepPlaceholder(stack){
  if(document.getElementById("toast")) return;
  var ph = document.createElement("div"); ph.id = "toast"; ph.className = "toast-empty"; ph.hidden = true;
  stack.appendChild(ph);
}
function closeToast(card){
  if(!card || card._closing) return;
  card._closing = true;
  clearTimeout(card._timer);
  var stack = card.parentNode;
  card.classList.remove("show");
  card.classList.add("toast-out");
  setTimeout(function(){
    if(card.parentNode) card.parentNode.removeChild(card);
    if(stack){
      if(!document.getElementById("toast")){
        var cards = stack.querySelectorAll(".toast-card");
        if(cards.length) cards[cards.length - 1].id = "toast"; else keepPlaceholder(stack);
      }
    }
  }, 180);
}
function armToast(card){
  clearTimeout(card._timer);
  card._timer = setTimeout(function(){ if(!card._hold) closeToast(card); }, TOAST_MS);
}
export function showToast(msg, kind){
  var text = String(msg);
  var k = kind || toastKind(text);
  var stack = toastStack();
  var old = document.getElementById("toast");
  if(old && old.classList.contains("toast-empty")) old.parentNode.removeChild(old);
  else if(old) old.removeAttribute("id");
  var cards = stack.querySelectorAll(".toast-card");
  for(var i = 0; i < cards.length; i++){
    if(cards[i]._text === text && !cards[i]._closing){ stack.removeChild(cards[i]); }
  }
  var card = document.createElement("div");
  card.className = "toast-card show toast-" + k;
  card.setAttribute("role", k === "error" || k === "warn" ? "alert" : "status");
  card._text = text;
  var ic = document.createElement("span"); ic.className = "toast-icon"; ic.appendChild(svgIcon(TOAST_ICONS[k] || TOAST_ICONS.success, 16));
  var body = document.createElement("span"); body.className = "toast-text"; body.textContent = text;
  var close = document.createElement("button"); close.type = "button"; close.className = "toast-close"; close.setAttribute("aria-label", "Close notification");
  close.appendChild(svgIcon("M6 6l12 12M18 6L6 18", 16));
  close.addEventListener("click", function(){ closeToast(card); });
  card.appendChild(ic); card.appendChild(body); card.appendChild(close);
  card.addEventListener("mouseenter", function(){ card._hold = true; clearTimeout(card._timer); });
  card.addEventListener("mouseleave", function(){ card._hold = false; armToast(card); });
  card.addEventListener("focusin", function(){ card._hold = true; clearTimeout(card._timer); });
  card.addEventListener("focusout", function(){ card._hold = false; armToast(card); });
  card.id = "toast";
  stack.appendChild(card);
  var all = stack.querySelectorAll(".toast-card");
  for(var j = 0; j < all.length - TOAST_MAX; j++) closeToast(all[j]);
  armToast(card);
}
