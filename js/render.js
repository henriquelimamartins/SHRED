// Page layout, navigation and the main render() that redraws every view.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
// Slice 4.2a (D119): desktop sidebar = brand, Search, menu, account row; phone bottom bar = HOME, DAILY, IMPROV,
// THEORY, MORE (More sheet: Library, Tools); DOJO shown as THEORY (D114), SETUP as TOOLS; the phase bar moved to HOME (D25).
// Slice 4.2b (D113, D119 point 6): with the BHGS pack off, LIBRARY sits in the phone bar instead of More.
// Slice 4.3 (D117, D122): TECHNIQUE joins the menu and the phone bar (HOME, DAILY, TECHNIQUE, IMPROV, THEORY, MORE),
// only with the BHGS pack on; with it off there is no TECHNIQUE destination (D113).
import { hasFirebase, currentUser } from "./firebase.js?v=5";
import { ui } from "./ui.js?v=1";
import { BHGS_PACK } from "./pack.js?v=1";
import { ensureDailyReset } from "./logic/dates.js?v=7";
import { initCalCarousel } from "./views/calendar.js?v=14";
import { renderHome } from "./views/home.js?v=14";
import { renderTechnique } from "./views/technique.js?v=1";
import { renderDaily } from "./views/daily.js?v=14";
import { renderImprov } from "./views/improv.js?v=6";
import { renderLibrary } from "./views/library.js?v=14";
import { renderSetup } from "./views/setup.js?v=7";
import { renderDojoView } from "./views/dojo.js?v=6";

export function initAppLayout() {
  var root = document.getElementById("root");
  root.innerHTML = `
    <nav id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <div class="brand brand-side">THE <span>SHRED</span><br><span class="brand-sub">ROADMAP</span></div>
      </div>
      <div id="sidebar-search" class="sidebar-search"></div>
      <div id="sidebar-nav-inner" class="sidebar-nav"></div>
      <div id="sidebar-account" class="sidebar-account"></div>
    </nav>
    <main class="main-area">
      <header class="topbar" id="topbar"></header>
      <div class="views-container" id="views-container">
        <div class="view-panel" data-view-id="home" id="panel-home"></div>
        <div class="view-panel" data-view-id="daily" id="panel-daily"></div>
        <div class="view-panel" data-view-id="technique" id="panel-technique"></div>
        <div class="view-panel" data-view-id="improv" id="panel-improv"></div>
        <div class="view-panel" data-view-id="dojo" id="panel-dojo"></div>
        <div class="view-panel" data-view-id="library" id="panel-library"></div>
        <div class="view-panel" data-view-id="setup" id="panel-setup"></div>
      </div>
      <div id="more-sheet" class="more-sheet"></div>
      <nav class="botnav" id="botnav"></nav>
    </main>
  `;
}

// Destinations in D117 order. TECHNIQUE only with the BHGS pack on (D113).
const NAV_ITEMS = [
  { view: "home", ic: "\ud83c\udfe0", label: "Home" },
  { view: "daily", ic: "\ud83c\udfaf", label: "Daily" },
  { view: "technique", ic: "\ud83d\udd25", label: "Technique", pack: true },
  { view: "improv", ic: "\ud83e\udde0", label: "Improv", cls: "improv-nav" },
  { view: "dojo", ic: "\ud83d\udcd6", label: "Theory", cls: "theory-nav" },
  { view: "library", ic: "\ud83d\udcda", label: "Library", more: "Resources" },
  { view: "setup", ic: "\ud83d\udee0\ufe0f", label: "Tools", more: "Tools", moreLabel: "Setup" }
].filter(function(n){ return !n.pack || BHGS_PACK; });
// LIBRARY goes into More only with the BHGS pack on (D117 point 3; until the Explorer exists, D119 point 6).
function inMore(n){ return !!n.more && !(n.view === "library" && !BHGS_PACK); }
const MORE_VIEWS = NAV_ITEMS.filter(inMore).map(function(n){ return n.view; });

export function updateNav() {
  var sideHTML = NAV_ITEMS.map(function(n){ return navBtn(n.view, n.ic, n.label, n.cls); }).join("");
  var sidebarNav = document.getElementById('sidebar-nav-inner');
  if(sidebarNav) sidebarNav.innerHTML = sideHTML;

  var barHTML = NAV_ITEMS.filter(function(n){ return !inMore(n); }).map(function(n){ return navBtn(n.view, n.ic, n.label, n.cls); }).join("");
  var moreActive = ui.moreOpen || MORE_VIEWS.indexOf(ui.view) >= 0;
  barHTML += '<button data-action="more" class="more-btn'+(moreActive ? ' active' : '')+'" aria-expanded="'+(ui.moreOpen ? 'true' : 'false')+'"><span class="ic">\u22ef</span>More</button>';
  var botnav = document.getElementById('botnav');
  if(botnav) botnav.innerHTML = '<div class="botnav-inner">' + barHTML + '</div>';

  var sheet = document.getElementById('more-sheet');
  if(sheet){
    var html = '';
    if(ui.moreOpen){
      html += '<div class="more-backdrop" data-action="closemore"></div><div class="more-panel" role="dialog" aria-label="More">';
      var group = null;
      NAV_ITEMS.forEach(function(n){
        if(!inMore(n)) return;
        if(n.more !== group){ group = n.more; html += '<div class="more-group">' + group + '</div>'; }
        html += '<button data-action="go" data-view="'+n.view+'" class="more-item'+(ui.view===n.view ? ' active' : '')+'"><span class="ic">'+n.ic+'</span>'+(n.moreLabel || n.label)+'</button>';
      });
      html += '</div>';
    }
    sheet.innerHTML = html;
    sheet.classList.toggle('open', !!ui.moreOpen);
  }
}
export function navBtn(view,ic,label, customClass){ 
  var cl = ui.view===view ? "active" : "";
  if(ui.view===view && customClass) cl += " " + customClass;
  return '<button data-action="go" data-view="'+view+'" class="'+cl+'"><span class="ic">'+ic+'</span>'+label+'</button>'; 
}

export function render(){
  try {
    ensureDailyReset();
    if(!document.getElementById("views-container")) initAppLayout();

    var tops = {};
    document.querySelectorAll('.view-panel').forEach(function(p){ tops[p.id] = p.scrollTop; });

    var authHTML = '';
    var sideAccount = '';
    if(hasFirebase){
      var shortName = (currentUser && currentUser.email) ? currentUser.email.split('@')[0] : '';
      authHTML += '<div class="auth-container">';
      if(shortName) authHTML += '<span class="user-email">' + shortName + '</span>';
      authHTML += '<button id="authBtn" class="dchip2 auth-btn">' + (currentUser ? "Logout" : "Login") + '</button></div>';
      sideAccount += '<span class="side-user">' + (shortName || 'Not signed in') + '</span>';
      sideAccount += '<button class="dchip2 auth-btn side-auth">' + (currentUser ? "Logout" : "Login") + '</button>';
    }

    // Phone top bar (hidden on desktop, where Search and the account row live in the sidebar).
    var topbarHTML = '<div class="topbar-header">';
    topbarHTML += '<div class="brand mobile-brand">THE <span>SHRED</span> ROADMAP</div>';
    topbarHTML += '<div class="shell-search"><span class="ic">\ud83d\udd0d</span><span class="srch-txt">Search...</span></div>';
    topbarHTML += authHTML + '</div>';
    document.getElementById('topbar').innerHTML = topbarHTML;

    document.getElementById('sidebar-search').innerHTML = '<div class="side-search"><span class="ic">\ud83d\udd0d</span><span>Search...</span></div>';
    document.getElementById('sidebar-account').innerHTML = sideAccount;

    document.getElementById('panel-home').innerHTML = '<div class="panel-content">' + renderHome() + '</div>';
    document.getElementById('panel-daily').innerHTML = '<div class="panel-content">' + renderDaily() + '</div>';
    document.getElementById('panel-technique').innerHTML = BHGS_PACK ? '<div class="panel-content">' + renderTechnique() + '</div>' : '';
    document.getElementById('panel-improv').innerHTML = '<div class="panel-content">' + renderImprov() + '</div>';
    document.getElementById('panel-dojo').innerHTML = '<div class="panel-content">' + renderDojoView() + '</div>';
    document.getElementById('panel-library').innerHTML = '<div class="panel-content">' + renderLibrary() + '</div>';
    document.getElementById('panel-setup').innerHTML = '<div class="panel-content">' + renderSetup() + '</div>';

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
