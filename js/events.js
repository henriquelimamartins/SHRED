// User actions: the central click/change handlers, the calendar swipe listener and Reset Everything.
// The manual cloud Save/Load handlers and confirmReset() are moved unchanged (no persistence change).
// Slice 3.1 (D101): "Load from cloud" passes cloud data through migrate() (schemaVersion).
// Slice 3.2 (D102): backup before "Load from cloud" and Reset Everything replace the state; no backup, no reset.
// Slice 2.5: the SETUP video button ("openvideo") and the search box are handled here only (no inline onclick).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { CODEX_DATA } from "./data/dojo.js?v=1";
import { STORAGE_KEY, defaultState, saveState, state, replaceState, migrate, backupBeforeReplace } from "./store.js?v=3";
import { hasFirebase, auth, db, googleProvider, currentUser, doc, setDoc, getDoc, signInWithPopup, signOut } from "./firebase.js?v=3";
import { ui, showToast } from "./ui.js?v=1";
import { toggleCheck, setChop, setTest, setBonusLevel, handlePhaseSelect, confirmPhaseJumpBack, cancelPhaseJumpBack } from "./logic/technique.js?v=4";
import { toggleBlockPracticed, setActiveDay, resetActiveDay } from "./logic/daily.js?v=4";
import { changeCalMonth } from "./views/calendar.js?v=4";
import { currentMinigame, addXP, startArchitectGame, handleDojoAnswer, renderCodexList } from "./views/dojo.js?v=3";
import { updateNav, render } from "./render.js?v=4";

export function handleReset(){ ui.resetConfirm=true; render(); }
export function cancelReset(){ ui.resetConfirm=false; render(); }
export function confirmReset(){
  // Slice 3.2 (D102): no reset without a backup of the current state.
  if(!backupBeforeReplace("before-reset")){
    ui.resetConfirm=false;
    render();
    showToast("Could not back up your progress. Nothing was reset.");
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  replaceState(defaultState());
  if(hasFirebase && currentUser && db) { setDoc(doc(db, "users", currentUser.uid), state).catch(e => console.error(e)); }
  ui.resetConfirm=false;
  render();
  showToast("Everything has been reset.");
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
    setDoc(doc(db, "users", currentUser.uid), state).then(() => showToast("Progress manually saved to cloud!")).catch(() => showToast("Error saving to cloud."));
  }
  else if(a==="cloudload"){ 
    if(!currentUser) { showToast("Please login first to load from cloud."); return; }
    getDoc(doc(db, "users", currentUser.uid)).then(docSnap => {
      if(docSnap.exists()){
        const incoming = Object.assign(defaultState(), migrate(docSnap.data())); // slice 3.1 (D101)
        backupBeforeReplace("before-cloud-load", incoming); // slice 3.2 (D102): cloud still wins if this fails
        replaceState(incoming);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        render();
        showToast("Progress loaded from cloud!");
      } else {
        showToast("No cloud data found.");
      }
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
