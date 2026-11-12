// User actions: the central click/change handlers, the calendar swipe listener and Reset Everything.
// The manual cloud Save/Load handlers and confirmReset() are moved unchanged (no persistence change).
// Slice 3.1 (D101): "Load from cloud" passes cloud data through migrate() (schemaVersion).
// Slice 3.3 (D103): no cloud write (manual Save, Reset) before the cloud was read this session.
// Slice 3.2 (D102): backup before "Load from cloud" and Reset Everything replace the state; no backup, no reset.
// Slice 3.4 (D105): manual Save and Reset use the checked write queue (requestCloudWrite); manual Load
// uses loadFromCloud(); nothing is saved or reset over data from a newer app version.
// Slice 3.5 (D106): Reset Everything erases progress only (D83) and keeps streak, calendar, today's
// DAILY session, SETUP, sync fields and unknown fields; signed in, it waits for the first cloud read.
// Slice 2.5: the SETUP video button ("openvideo") and the search box are handled here only (no inline onclick).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { CODEX_DATA } from "./data/dojo.js?v=1";
import { defaultState, defaultDojoState, saveState, state, replaceState, backupBeforeReplace, newerSchema, NEWER_SCHEMA_MSG } from "./store.js?v=5";
import { hasFirebase, auth, db, googleProvider, currentUser, cloudReady, cloudReadFailed, CLOUD_READ_FAILED_MSG, requestCloudWrite, loadFromCloud, signInWithPopup, signOut } from "./firebase.js?v=5";
import { ui, showToast } from "./ui.js?v=1";
import { toggleCheck, setChop, setTest, setBonusLevel, handlePhaseSelect, confirmPhaseJumpBack, cancelPhaseJumpBack } from "./logic/technique.js?v=9";
import { toggleBlockPracticed, setActiveDay, resetActiveDay } from "./logic/daily.js?v=9";
import { changeCalMonth } from "./views/calendar.js?v=9";
import { currentMinigame, addXP, startArchitectGame, handleDojoAnswer, renderCodexList } from "./views/dojo.js?v=5";
import { updateNav, render } from "./render.js?v=9";

export function handleReset(){ ui.resetConfirm=true; render(); }
export function cancelReset(){ ui.resetConfirm=false; render(); }
// Slice 3.5 (D106): the state after Reset Everything. Only progress is erased: Technique, every mark in
// `checks` (Technique, BHGS theory videos, Creative), Improv and legacy DOJO data. Everything else is
// kept as it is, including fields this app does not know (D82) and the DOJO sound setting.
var RESET_FIELDS = ["phaseIndex","chop","testLevel","bonusLevel","checks","improvIndex","improvChecks"];
export function progressResetState(current){
  var fresh = defaultState();
  var next = JSON.parse(JSON.stringify(current));
  RESET_FIELDS.forEach(function(f){ next[f] = fresh[f]; });
  var dojo = defaultDojoState();
  if(current.dojo && typeof current.dojo.audioMuted === "boolean") dojo.audioMuted = current.dojo.audioMuted;
  next.dojo = dojo;
  return next;
}

export function confirmReset(){
  // Slice 3.4 (D105): nothing is reset over data saved by a newer app version.
  if(newerSchema){ ui.resetConfirm=false; render(); showToast(NEWER_SCHEMA_MSG); return; }
  // Slice 3.5 (D106): signed in, no reset before this session has read the cloud (it would be undone
  // by the sign-in sync or never reach the account). Same message as manual "Save to cloud".
  if(hasFirebase && currentUser && !cloudReady){
    ui.resetConfirm=false;
    render();
    showToast(cloudReadFailed ? CLOUD_READ_FAILED_MSG : "Cloud progress is still loading. Try again in a moment.");
    return;
  }
  var next = progressResetState(state);
  // Slice 3.2 (D102): no reset without a backup of the current state.
  if(!backupBeforeReplace("before-reset", next)){
    ui.resetConfirm=false;
    render();
    showToast("Could not back up your progress. Nothing was reset.");
    return;
  }
  replaceState(next);
  // Saved on the device; signed in, sent through the checked write queue (D105). The localStorage
  // key is no longer removed (D106), so the next start-up needs no migration.
  saveState();
  ui.resetConfirm=false;
  render();
  showToast("Progress has been reset. Streak, calendar and SETUP were kept.");
}

// Calendar carousel scroll listener for fluid swiping and month preview
document.addEventListener("scroll", function(e) {
  if(e.target && e.target.id === "cal-carousel") {
    var carousel = e.target;
    var panels = carousel.querySelectorAll('.cal-panel');
    var width = carousel.offsetWidth;
    var scrollLeft = carousel.scrollLeft;
    var index = Math.round(scrollLeft / width);
    if(panels[index]) {
      var ym = panels[index].getAttribute('data-ym').split('-');
      var y = parseInt(ym[0], 10);
      var m = parseInt(ym[1], 10);
      if(ui.calYear !== y || ui.calMonth !== m) {
        ui.calYear = y;
        ui.calMonth = m;
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var tTitle = document.getElementById('cal-month-title');
        var yTitle = document.getElementById('cal-year-title');
        if(tTitle) tTitle.textContent = monthNames[m];
        if(yTitle) yTitle.textContent = y;
      }
    }
  }
}, {capture: true, passive: true});


document.addEventListener("click",function(e){

  if(e.target.closest("a")) return;
  var t=e.target.closest("[data-action],[data-toggle],#authBtn,.shell-search");
  if(!t) return;

  if(t.id === "authBtn"){
    if(currentUser){ signOut(auth).then(() => { showToast("Logged out"); render(); }); } 
    else { signInWithPopup(auth, googleProvider).catch(err => showToast("Login failed")); }
    return;
  }
  if(t.classList.contains("shell-search")){
    showToast("Global search coming in a future phase");
    return;
  }

  if(t.dataset.toggle){ toggleCheck(t.dataset.toggle); return; }
  var a=t.dataset.action;
  
  if(a==="go"){
    ui.view=t.dataset.view;
    var panel = document.getElementById('panel-' + ui.view);
    if(panel) panel.scrollTo({top: 0, behavior: 'smooth'});
    updateNav();
    render();
    return;
  }
  
  if(a==="toggleacc"){ui.lib[t.dataset.acc]=!ui.lib[t.dataset.acc]; render();}
  else if(a==="setday"){ ui.dayOverride=t.dataset.day; render(); }
  else if(a==="chop"){ setChop(t.dataset.t,parseInt(t.dataset.d,10)); }
  else if(a==="test"){ setTest(t.dataset.t,parseInt(t.dataset.d,10)); }
  else if(a==="bonuslvl"){ setBonusLevel(t.dataset.k,parseInt(t.dataset.d,10),parseInt(t.dataset.max,10)); }
  else if(a==="blockprac"){ toggleBlockPracticed(t.dataset.block,t.dataset.day); }
  else if(a==="togm"){ toggleCheck(t.dataset.key); }
  else if(a==="togimprov"){ 
    var gk = "g"+t.dataset.g+"e"+t.dataset.e;
    state.improvChecks[gk] = !state.improvChecks[gk]; 
    saveState(); render();
  }
  else if(a==="advanceimprov"){ 
    state.improvIndex++; 
    showToast("\ud83d\udd13 New Gate Unlocked!"); 
    saveState(); render();
  }
  else if(a==="activateday"){ setActiveDay(t.dataset.day); }
  else if(a==="resetactiveday"){ resetActiveDay(); }
  else if(a==="cloudsave"){ 
    if(!currentUser) { showToast("Please login first to save to cloud."); return; }
    if(newerSchema) { showToast(NEWER_SCHEMA_MSG); return; } // slice 3.4 (D105)
    // Slice 3.3 (D103): never write over cloud data this session has not read.
    if(!cloudReady) { showToast(cloudReadFailed ? CLOUD_READ_FAILED_MSG : "Cloud progress is still loading. Try again in a moment."); return; }
    // Slice 3.4 (D105): checked write; a conflict or newer data shows its own message.
    requestCloudWrite().then(outcome => {
      if(outcome === "ok") showToast("Progress manually saved to cloud!");
      else if(outcome === "error") showToast("Error saving to cloud.");
    });
  }
  else if(a==="cloudload"){ 
    if(!currentUser) { showToast("Please login first to load from cloud."); return; }
    if(newerSchema) { showToast(NEWER_SCHEMA_MSG); return; } // slice 3.4 (D105)
    // Slice 3.1 (D101) migrate, 3.2 (D102) backup first, 3.3 (D103) read allows writes, 3.4 (D105) syncRev:
    // all inside loadFromCloud().
    loadFromCloud().then(result => {
      if(result === "loaded") showToast("Progress loaded from cloud!");
      else if(result === "none") showToast("No cloud data found.");
      // "newer": loadFromCloud already showed the newer-version message.
    }).catch(() => showToast("Error loading from cloud."));
  }
  else if(a==="reset"){ handleReset(); }
  else if(a==="cancelreset"){ cancelReset(); }
  else if(a==="confirmreset"){ confirmReset(); }
  else if(a==="canceljump"){ cancelPhaseJumpBack(); }
  else if(a==="confirmjump"){ confirmPhaseJumpBack(); }
  else if(a==="togglemute"){ state.dojo.audioMuted = !state.dojo.audioMuted; saveState(); render(); }
  else if(a==="dojoopen"){
    document.querySelectorAll('.codex-view').forEach(e=>e.classList.remove('active'));
    let targetId = t.dataset.target;
    let targetElem = document.getElementById('dojo-' + targetId);
    if(targetId === 'codex-list') targetElem.innerHTML = renderCodexList();
    targetElem.classList.add('active');
  }
  else if(a==="dojoback"){
    document.querySelectorAll('.codex-view').forEach(e=>e.classList.remove('active'));
    document.getElementById('dojo-dash-view').classList.add('active');
    render();
  }
  else if(a==="readcodex"){
    let id = parseInt(t.dataset.id,10);
    if(!state.dojo.readCodexes.includes(id)) {
      state.dojo.readCodexes.push(id);
      addXP(100);
    }
    document.querySelectorAll('.codex-view').forEach(e=>e.classList.remove('active'));
    let reader = document.getElementById('dojo-codex-reader');
    reader.innerHTML = '<div class="game-header" style="margin-bottom:8px;"><button class="tbtn" data-action="dojoopen" data-target="codex-list">&lsaquo; Back to Library</button></div>' + 
      '<h2>' + CODEX_DATA[id].title + '</h2>' + CODEX_DATA[id].content;
    reader.classList.add('active');
  }
  else if(a==="dojoplay"){
    if(t.dataset.game === 'architect') startArchitectGame();
    else showToast("Mini-game coming in next update!");
  }
  else if(a==="dojoans"){
    handleDojoAnswer(parseInt(t.dataset.ans, 10));
  }
  else if(a==="dojonext"){
    if(currentMinigame === 'architect') startArchitectGame();
  }
  else if(a==="calprev"){ changeCalMonth(-1); }
  else if(a==="calnext"){ changeCalMonth(1); }
  else if(a==="caltoday"){ ui.calMonth = new Date().getMonth(); ui.calYear = new Date().getFullYear(); render(); }
  else if(a==="openvideo"){ window.open(t.dataset.url, '_blank'); }

});

document.addEventListener("change",function(e){
  if(e.target.dataset.action==="setphase") handlePhaseSelect(parseInt(e.target.value,10));
  if(e.target.dataset.action==="setGuitar") { state.setupGuitar = e.target.value; saveState(); render(); }
  if(e.target.dataset.action==="setTuning") { state.setupTuning = e.target.value; saveState(); render(); }
});
