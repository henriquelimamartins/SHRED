// Legacy THEORY DOJO (level/XP, Codex, Harmonic Architect). Replaced by THEORY in Phase 6 (DECISIONS D12);
// its stored data must still be kept.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { DOJO_LEVELS, CODEX_DATA, HARMONIC_QUESTIONS } from "../data/dojo.js?v=1";
import { saveState, state } from "../store.js?v=3";
import { showToast } from "../ui.js?v=1";

// --- THEORY DOJO LOGIC ---

export let currentMinigame = null;
export let currentQuestion = null;

export function getDojoLevelInfo(xp) {
  let cur = DOJO_LEVELS[0];
  let next = DOJO_LEVELS[1];
  for(let i=0; i<DOJO_LEVELS.length; i++) {
    if(xp >= DOJO_LEVELS[i].req) {
      cur = DOJO_LEVELS[i];
      next = DOJO_LEVELS[i+1] || {req: 999999};
    }
  }
  let pct = next.req === 999999 ? 100 : Math.floor(((xp - cur.req) / (next.req - cur.req)) * 100);
  return { level: cur.l, title: cur.title, pct: pct, nextReq: next.req, codex: cur.codex };
}

export function addXP(amount) {
  state.dojo.xp += amount;
  let info = getDojoLevelInfo(state.dojo.xp);
  if(info.level > state.dojo.level) {
    state.dojo.level = info.level;
    showToast("⭐ Level Up! You are now a " + info.title);
    if(info.codex > 1 && !state.dojo.unlockedCodexes.includes(info.codex)) {
      state.dojo.unlockedCodexes.push(info.codex);
      showToast("📜 📜 New Codex Unlocked!");
    }
  } else {
    showToast("+" + amount + " XP!");
  }
  saveState();
}

export function generateHarmonicQuestion() {
  let available = HARMONIC_QUESTIONS.filter(q => q.lvl <= state.dojo.level);
  if(available.length === 0) available = HARMONIC_QUESTIONS;
  let r = Math.floor(Math.random() * available.length);
  return available[r];
}

export function startArchitectGame() {
  currentMinigame = "architect";
  currentQuestion = generateHarmonicQuestion();
  
  let html = '<div class="game-header"><span class="game-title">🏛️ The Harmonic Architect</span><button class="tbtn" data-action="dojoback">Back</button></div>';
  html += '<div class="question-box"><h4>' + currentQuestion.q + '</h4></div>';
  
  currentQuestion.opts.forEach((opt, idx) => {
    html += '<button class="opt-btn" data-action="dojoans" data-ans="'+idx+'">' + opt + '</button>';
  });
  
  html += '<div id="dojo-feedback" class="feedback-box"></div>';
  document.getElementById('dojo-game-container').innerHTML = html;
  
  document.getElementById('dojo-dash-view').classList.remove('active');
  document.getElementById('dojo-game-view').classList.add('active');
}

export function handleDojoAnswer(idx) {
  var btns = document.querySelectorAll('.opt-btn');
  btns.forEach(b => b.style.pointerEvents = 'none');
  
  var fbox = document.getElementById('dojo-feedback');
  if(idx === currentQuestion.ans) {
    btns[idx].classList.add('correct');
    addXP(50);
    fbox.innerHTML = '<b>✔️ Architect&apos;s Analysis (Correct!)</b><p>' + currentQuestion.exp + '</p><button class="tbtn primary" style="margin-top:12px;" data-action="dojonext">Next Scenario &rsaquo;</button>';
  } else {
    btns[idx].classList.add('wrong');
    btns[currentQuestion.ans].classList.add('correct');
    fbox.innerHTML = '<b>❌ Architect&apos;s Analysis (Incorrect)</b><p>' + currentQuestion.exp + '</p><button class="tbtn" style="margin-top:12px;" data-action="dojoback">Back to Dojo</button>';
  }
  fbox.classList.add('show');
}

export function renderDojoDashboard() {
  let info = getDojoLevelInfo(state.dojo.xp);
  let isMuted = state.dojo.audioMuted;
  
  let html = '<div class="eyebrow" style="color:var(--blue);">THEORY DOJO</div>';
  html += '<div class="h2" style="font-size:24px; margin-bottom:4px;">Level ' + info.level + ' - ' + info.title + '</div>';
  
  html += '<div class="xp-bar-container" style="margin-bottom:18px;">';
  html += '<div class="xp-bar-fill" style="width:'+info.pct+'%;"></div>';
  html += '<div class="xp-text">' + state.dojo.xp + ' / ' + (info.nextReq === 999999 ? 'MAX' : info.nextReq) + ' XP</div>';
  html += '</div>';
  
  html += '<div style="display:flex; justify-content:flex-end; margin-bottom:18px; align-items:center; gap:10px;">';
  html += '<span style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Audio: '+(isMuted?'OFF':'ON')+'</span>';
  html += '<div class="custom-toggle '+(isMuted?'':'on')+'" data-action="togglemute"><div class="knob"></div></div>';
  html += '</div>';
  
  html += '<div class="dojo-dash">';
  
  // Codex Library
  html += '<button class="dojo-btn" style="border-color:var(--blue);" data-action="dojoopen" data-target="codex-list"><div class="ic">📜</div><div class="info"><b>The Architect&apos;s Codex</b><span>Read the theory and context before playing. New modules unlock as you level up.</span></div></button>';
  
  // Games
  html += '<button class="dojo-btn" data-action="dojoplay" data-game="architect"><div class="ic">🏛️</div><div class="info"><b>The Harmonic Architect</b><span>Songwriting decisions and modal tension.</span></div></button>';
  html += '<button class="dojo-btn" data-action="dojoplay" data-game="fretboard"><div class="ic">🎯</div><div class="info"><b>The Fretboard Sniper</b><span>Rapid visual mapping on the neck.</span></div></button>';
  
  if(!isMuted) {
    html += '<button class="dojo-btn" data-action="dojoplay" data-game="rhythm"><div class="ic">🥁</div><div class="info"><b>The Rhythm Decryptor</b><span>Ear training for odd time signatures.</span></div></button>';
  }
  
  html += '</div>';
  return html;
}

export function renderCodexList() {
  let html = '<div class="game-header"><span class="game-title">📜 Library of the Architect</span><button class="tbtn" data-action="dojoback">Back</button></div>';
  html += '<p class="lede">Read these contextualized theory scrolls to unlock your true power in the mini-games.</p>';
  
  Object.keys(CODEX_DATA).forEach(k => {
    let id = parseInt(k,10);
    let unlocked = state.dojo.unlockedCodexes.includes(id);
    let read = state.dojo.readCodexes.includes(id);
    
    if(unlocked) {
      html += '<button class="navbtn dojo-btn codex-item-btn" data-action="readcodex" data-id="'+id+'"><div class="ic">'+(read?'✔️':'📖')+'</div><div class="info"><b>' + CODEX_DATA[id].title + '</b></div></button>';
    } else {
      html += '<div class="navbtn dojo-btn codex-item-btn locked"><div class="ic">🔒</div><div class="info"><b>' + CODEX_DATA[id].title + '</b><span>Unlocks at higher levels.</span></div></div>';
    }
  });
  
  return html;
}

export function renderDojoView() {
  let html = '<div id="dojo-dash-view" class="codex-view active">' + renderDojoDashboard() + '</div>' +
    '<div id="dojo-codex-list" class="codex-view"></div>' +
    '<div id="dojo-codex-reader" class="codex-view codex-content"></div>' +
    '<div id="dojo-game-view" class="codex-view game-area"><div id="dojo-game-container"></div></div>';
  return html;
}
