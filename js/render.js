// Page layout, navigation and the main render() that redraws every view.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
// Slice 4.2a (D119): desktop sidebar = brand, Search, menu, account row; phone bottom bar = HOME, DAILY, IMPROV,
// THEORY, MORE (More sheet: Library, Tools); DOJO shown as THEORY (D114), SETUP as TOOLS; the phase bar moved to HOME (D25).
// Slice 4.2b (D113, D119 point 6): with the BHGS pack off, LIBRARY sits in the phone bar instead of More.
// Slice 4.3 (D117, D122): TECHNIQUE joins the menu and the phone bar (HOME, DAILY, TECHNIQUE, IMPROV, THEORY, MORE),
// only with the BHGS pack on; with it off there is no TECHNIQUE destination (D113).
// Slice 4.4 (D123): the pillar is named IMPROVISATION wherever there is room; the phone bar keeps "Improv" (`short`).
// Slice 4.4 (D117 point 1, D123): the pillar rails sit in the desktop sidebar under Search, hidden on HOME (which
// shows them in full).
// Slice 4.5a (D124): new page "Account & data" (view id `account`, not one of the 7 destinations): opened from an
// "Account & data" button in the desktop sidebar account row (signed in or out) and from an "Account & data" group in
// the phone More sheet.
// Slice 4.5b (D125, D126): desktop sidebar as drawn: menu with line icons, PILLARS / RESOURCES headings, a real value
// per item and the active page's sub-items; the read-only Today block; the account row (Google photo or initial,
// name, real sync state) that opens Account & data. Login / Logout leave the sidebar (Account & data page). The
// account row refreshes itself every few seconds (reads only). D127 (owner): the sidebar rails show on HOME too.
// Slice 4.5b2 (D126 point 1, D128): phone shell as drawn. The shared phone top bar (brand, Search, Login) is gone:
// each page shows its own header (HOME: brand, date, streak). The bottom bar uses the line icons. MORE is a page
// (view id `more`, phone only) instead of a sheet. Login / Logout live only on the Account & data page (D125 point 4).
import { ui } from "./ui.js?v=2";
import { BHGS_PACK } from "./pack.js?v=1";
import { ensureDailyReset } from "./logic/dates.js?v=7";
import { initCalCarousel } from "./views/calendar.js?v=32";
import { renderHome } from "./views/home.js?v=32";
import { renderTechnique } from "./views/technique.js?v=19";
import { renderDaily } from "./views/daily.js?v=32";
import { renderImprov } from "./views/improv.js?v=24";
import { renderLibrary } from "./views/library.js?v=32";
import { renderSetup } from "./views/setup.js?v=23";
import { renderDojoView } from "./views/dojo.js?v=24";
import { renderRails } from "./views/rails.js?v=18";
import { renderAccount } from "./views/account.js?v=17";
import { renderMore } from "./views/more.js?v=15";
import { icon, sidebarMenu, todayBlock, accountRow, syncState } from "./views/shell.js?v=16";

export function initAppLayout() {
  var root = document.getElementById("root");
  root.innerHTML = `
    <nav id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <div class="brand brand-side">THE <span>SHRED</span><br><span class="brand-sub">ROADMAP</span></div>
      </div>
      <div id="sidebar-search" class="sidebar-search"></div>
      <div id="sidebar-rails" class="sidebar-rails"></div>
      <div id="sidebar-nav-inner" class="sidebar-nav"></div>
      <div id="sidebar-today" class="sidebar-today"></div>
      <div id="sidebar-account" class="sidebar-account"></div>
    </nav>
    <main class="main-area">
      <div class="views-container" id="views-container">
        <div class="view-panel" data-view-id="home" id="panel-home"></div>
        <div class="view-panel" data-view-id="daily" id="panel-daily"></div>
        <div class="view-panel" data-view-id="technique" id="panel-technique"></div>
        <div class="view-panel" data-view-id="improv" id="panel-improv"></div>
        <div class="view-panel" data-view-id="dojo" id="panel-dojo"></div>
        <div class="view-panel" data-view-id="library" id="panel-library"></div>
        <div class="view-panel" data-view-id="setup" id="panel-setup"></div>
        <div class="view-panel" data-view-id="account" id="panel-account"></div>
        <div class="view-panel" data-view-id="more" id="panel-more"></div>
      </div>
      <nav class="botnav" id="botnav"></nav>
    </main>
  `;
}

// Destinations in D117 order. TECHNIQUE only with the BHGS pack on (D113).
const NAV_ITEMS = [
  { view: "home", label: "Home" },
  { view: "daily", label: "Daily" },
  { view: "technique", label: "Technique", pack: true },
  { view: "improv", label: "Improvisation", short: "Improv", cls: "improv-nav" },
  { view: "dojo", label: "Theory", cls: "theory-nav" },
  { view: "library", label: "Library", more: "Resources" },
  { view: "setup", label: "Tools", more: "Tools" }
].filter(function(n){ return !n.pack || BHGS_PACK; });
// LIBRARY goes into More only with the BHGS pack on (D117 point 3; until the Explorer exists, D119 point 6).
function inMore(n){ return !!n.more && !(n.view === "library" && !BHGS_PACK); }
// Slice 4.5a (D124): the Account & data page sits in More (phone) and in the account row (desktop), not in the menu.
// On these pages (and on the MORE page itself) the phone bar shows MORE as active.
const MORE_VIEWS = NAV_ITEMS.filter(inMore).map(function(n){ return n.view; }).concat(["account", "more"]);

export function updateNav() {
  var sideHTML = sidebarMenu(NAV_ITEMS);
  var sidebarNav = document.getElementById('sidebar-nav-inner');
  if(sidebarNav) sidebarNav.innerHTML = sideHTML;

  // Phone bottom bar (slice 4.5b2, D128): line icons and short labels, as drawn; MORE opens the MORE page.
  var barHTML = NAV_ITEMS.filter(function(n){ return !inMore(n); }).map(function(n){ return navBtn(n.view, n.short || n.label, n.cls); }).join("");
  var moreActive = MORE_VIEWS.indexOf(ui.view) >= 0;
  barHTML += '<button data-action="more" class="more-btn'+(moreActive ? ' active' : '')+'"'+(moreActive ? ' aria-current="page"' : '')+'>'+icon("more")+'<span class="bn-label">More</span></button>';
  var botnav = document.getElementById('botnav');
  if(botnav) botnav.innerHTML = '<div class="botnav-inner">' + barHTML + '</div>';
}
export function navBtn(view, label, customClass){
  var on = ui.view===view;
  var cl = on ? "active" : "";
  if(on && customClass) cl += " " + customClass;
  return '<button data-action="go" data-view="'+view+'" class="'+cl+'"'+(on ? ' aria-current="page"' : '')+'>'+icon(view)+'<span class="bn-label">'+label+'</span></button>';
}

// Slice 4.5b (D126 point 5): the account row's sync state is re-read every few seconds and on online/offline,
// so it never shows an old state. Reads only; nothing is written.
var lastAccountRow = '';
export function updateAccountRow(){
  var el = document.getElementById('sidebar-account');
  if(!el) return;
  var html = accountRow();
  if(html !== lastAccountRow){ el.innerHTML = html; lastAccountRow = html; }
  // Slice 4.5b2 (D128): the same for the Cloud sync row of the phone MORE page.
  var s = syncState();
  var sub = document.querySelector('#panel-more [data-row="sync"] .more-row-sub');
  if(sub){
    var line = '<i class="sync-dot ' + s.tone + '"></i><span class="sync-text">' + s.text + '</span>';
    if(sub.innerHTML !== line) sub.innerHTML = line;
  }
  // Slice 4.10a: the sync line of the Account card on the Account & data page follows too (it was drawn once and
  // could stay on "Changes not synced yet" while the sidebar row already read "Synced"). Reads only, writes nothing.
  var acct = document.querySelector('#panel-account .account-sync');
  if(acct){
    var acctLine = '<i class="sync-dot ' + s.tone + '"></i>' + s.text;
    if(acct.innerHTML !== acctLine) acct.innerHTML = acctLine;
  }
}

export function render(){
  try {
    ensureDailyReset();
    if(!document.getElementById("views-container")) initAppLayout();

    var tops = {};
    document.querySelectorAll('.view-panel').forEach(function(p){ tops[p.id] = p.scrollTop; });

    document.getElementById('sidebar-search').innerHTML = '<div class="side-search">' + icon("search") + '<span>Search\u2026</span></div>';
    document.getElementById('sidebar-today').innerHTML = todayBlock();
    lastAccountRow = accountRow();
    document.getElementById('sidebar-account').innerHTML = lastAccountRow;
    var sideRails = document.getElementById('sidebar-rails');
    // Slice 4.5b (D127, owner): on desktop the rails stay in the sidebar on every page, HOME included.
    sideRails.innerHTML = renderRails('side');

    document.getElementById('panel-home').innerHTML = '<div class="panel-content">' + renderHome() + '</div>';
    document.getElementById('panel-daily').innerHTML = '<div class="panel-content">' + renderDaily() + '</div>';
    document.getElementById('panel-technique').innerHTML = BHGS_PACK ? '<div class="panel-content">' + renderTechnique() + '</div>' : '';
    document.getElementById('panel-improv').innerHTML = '<div class="panel-content">' + renderImprov() + '</div>';
    document.getElementById('panel-dojo').innerHTML = '<div class="panel-content">' + renderDojoView() + '</div>';
    document.getElementById('panel-library').innerHTML = '<div class="panel-content">' + renderLibrary() + '</div>';
    document.getElementById('panel-setup').innerHTML = '<div class="panel-content">' + renderSetup() + '</div>';
    document.getElementById('panel-account').innerHTML = '<div class="panel-content">' + renderAccount() + '</div>';
    document.getElementById('panel-more').innerHTML = '<div class="panel-content">' + renderMore() + '</div>';

    updateNav();

    document.querySelectorAll('.view-panel').forEach(function(p){
       if(p.id === 'panel-' + ui.view) {
           p.classList.add('active');
       } else {
           p.classList.remove('active');
       }
       p.scrollTop = tops[p.id] || 0;
    });
    
    initCalCarousel();

  } catch(err) {
    console.error("Render error:", err);
    var root=document.getElementById("root");
    if(root) { root.innerHTML = '<div class="render-error"><h3>Render Error:</h3><p>' + err.message + '</p><pre>' + err.stack + '</pre></div>'; }
  }
}
