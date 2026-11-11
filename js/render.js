// Page layout, navigation and the main render() that redraws every view.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { hasFirebase, currentUser } from "./firebase.js?v=4";
import { ui } from "./ui.js?v=1";
import { ensureDailyReset } from "./logic/dates.js?v=4";
import { progressBar } from "./views/components.js?v=5";
import { initCalCarousel } from "./views/calendar.js?v=5";
import { renderHome } from "./views/home.js?v=5";
import { renderDaily } from "./views/daily.js?v=5";
import { renderImprov } from "./views/improv.js?v=4";
import { renderLibrary } from "./views/library.js?v=5";
import { renderSetup } from "./views/setup.js?v=5";
import { renderDojoView } from "./views/dojo.js?v=4";

export function initAppLayout() {
  var root = document.getElementById("root");
  root.innerHTML = `
    <nav id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <div class="brand" style="font-size:22px; margin-bottom:0;">THE <span style="color:var(--accent);">SHRED</span><br><span style="font-size:16px;color:#fff;letter-spacing:2px;">ROADMAP</span></div>
      </div>
      <div id="sidebar-nav-inner" class="sidebar-nav"></div>
    </nav>
    <main class="main-area">
      <header class="topbar" id="topbar"></header>
      <div class="views-container" id="views-container">
        <div class="view-panel" data-view-id="home" id="panel-home"></div>
        <div class="view-panel" data-view-id="daily" id="panel-daily"></div>
        <div class="view-panel" data-view-id="improv" id="panel-improv"></div>
        <div class="view-panel" data-view-id="dojo" id="panel-dojo"></div>
        <div class="view-panel" data-view-id="library" id="panel-library"></div>
        <div class="view-panel" data-view-id="setup" id="panel-setup"></div>
      </div>
      <nav class="botnav" id="botnav"></nav>
    </main>
  `;
}

export function updateNav() {
  var innerHTML =
    navBtn("home","\ud83c\udfe0","Home") + 
    navBtn("daily","\ud83c\udfaf","Daily") + 
    navBtn("improv","\ud83e\udde0","Improv", "improv-nav") + 
    navBtn("dojo","⚔️","Dojo", "dojo-nav") + 
    navBtn("library","\ud83d\udcda","Library") + 
    navBtn("setup","\ud83d\udee0\ufe0f","Setup");

  var botnav = document.getElementById('botnav');
  if(botnav) botnav.innerHTML = '<div class="botnav-inner">' + innerHTML + '</div>';

  var sidebarNav = document.getElementById('sidebar-nav-inner');
  if(sidebarNav) sidebarNav.innerHTML = innerHTML;
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

    var topbarHTML = '<div class="topbar-header">';
    topbarHTML += '<div class="brand mobile-brand">THE <span>SHRED</span> ROADMAP</div>';
    
    // Future search integration
    topbarHTML += '<div class="shell-search"><span class="ic">🔍</span><span class="srch-txt">Search...</span></div>';
    
    if(hasFirebase){
      topbarHTML += '<div class="auth-container">';
      if(currentUser && currentUser.email){
        var shortName = currentUser.email.split('@')[0];
        topbarHTML += '<span class="user-email">' + shortName + '</span>';
      }
      topbarHTML += '<button id="authBtn" class="dchip2" style="padding:7px 12px; margin:0; border-color:var(--border); color:var(--text);">' + (currentUser ? "Logout" : "Login") + '</button></div>';
    }
    topbarHTML += '</div>' + progressBar();
    document.getElementById('topbar').innerHTML = topbarHTML;

    document.getElementById('panel-home').innerHTML = '<div class="panel-content">' + renderHome() + '</div>';
    document.getElementById('panel-daily').innerHTML = '<div class="panel-content">' + renderDaily() + '</div>';
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
    if(root) { root.innerHTML = '<div style="padding: 20px; color: #ff3b30; font-family: monospace;"><h3>Render Error:</h3><p>' + err.message + '</p><pre>' + err.stack + '</pre></div>'; }
  }
}
