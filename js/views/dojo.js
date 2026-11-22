// THEORY destination (DECISIONS D114): the legacy DOJO content (Codex, The Harmonic Architect) until Theory v1
// replaces it in Phase 6 (D12). Its stored data (state.dojo) is kept, unused (D82).
// Slice 4.4: Theory rail on top (phone). Slice 4.5b (D125, D126): the drawn page header.
// Slice 4.8d (D132 point 6, D148): as drawn on the 4.6 boards, in the Theory blue with line icons; the level and
// XP leave the screen; reading and playing write nothing (no XP, levels, unlocked or read modules; ends the
// conflict with D40); every Codex module is open; the game walks through all 15 questions in a shuffled order
// without repeats. THEORY itself writes nothing; the sound switch (dojo.audioMuted) is on Account & data since slice 4.8e (D149). The view ids (`dojo`, `dojo-*`) and the
// data-action names are unchanged.
import { CODEX_DATA, HARMONIC_QUESTIONS } from "../data/dojo.js?v=2";
import { pageHeader } from "./shell.js?v=19";
import { theoryPageRail, theoryCard, theorySub } from "./rails.js?v=21";

// Line icons (24 x 24, stroke), the shapes of the 4.6 THEORY boards.
const TH_ICONS = {
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5',
  architect: 'M4 9l8-5 8 5M6 9v9M10 9v9M14 9v9M18 9v9M4 20h16',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  rhythm: 'M3 12h3l2-6 4 12 3-9 2 3h4',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  tick: 'M5 12l5 5 9-10',
  cross: 'M6 6l12 12M18 6L6 18'
};
function thIcon(name, cls){
  return '<svg class="ico ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + TH_ICONS[name] + '"></path></svg>';
}

// A title with a "‹ Back" button (Codex list, a module, the game), as drawn.
function subHead(title, action, target){
  return '<div class="theory-sub-head"><h2 class="theory-sub-title" tabindex="-1">' + title + '</h2>' +
    '<button type="button" class="theory-back" data-action="' + action + '"' + (target ? ' data-target="' + target + '"' : '') + '>' +
    thIcon('back', 'theory-back-ic') + 'Back</button></div>';
}

// A card row: icon tile, title and line, then tags and ›. A row that is not built yet is not a button (D148 point 7).
function row(o){
  var inner = '<span class="theory-row-icon">' + thIcon(o.icon, 'theory-row-ic') + '</span>' +
    '<span class="theory-row-text"><span class="theory-row-title">' + o.title + '</span>' +
    (o.sub ? '<span class="theory-row-sub">' + o.sub + '</span>' : '') + '</span>' +
    (o.tags ? '<span class="theory-row-tags">' + o.tags.map(function(t){ return '<span class="theory-tag">' + t + '</span>'; }).join('') + '</span>' : '');
  if(o.soon) return '<div class="theory-row is-soon" data-game="' + o.game + '">' + inner + '</div>';
  return '<button type="button" class="theory-row" ' + o.attrs + '>' + inner + thIcon('chevron', 'theory-row-chev') + '</button>';
}

// --- The Harmonic Architect: every question, shuffled, no repeats until all have appeared (page state only) ---

export let currentMinigame = null;
export let currentQuestion = null;
let architectDeck = [];
let lastQuestionIndex = -1;

function shuffledIndexes(n){
  var a = [];
  for(var i = 0; i < n; i++) a.push(i);
  for(var j = n - 1; j > 0; j--){
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = a[j]; a[j] = a[k]; a[k] = tmp;
  }
  return a;
}

export function generateHarmonicQuestion() {
  if(!architectDeck.length){
    architectDeck = shuffledIndexes(HARMONIC_QUESTIONS.length);
    // A new round never starts with the question that ended the last one.
    if(architectDeck.length > 1 && architectDeck[0] === lastQuestionIndex){
      var first = architectDeck[0]; architectDeck[0] = architectDeck[1]; architectDeck[1] = first;
    }
  }
  lastQuestionIndex = architectDeck.shift();
  return HARMONIC_QUESTIONS[lastQuestionIndex];
}

export function startArchitectGame() {
  currentMinigame = "architect";
  currentQuestion = generateHarmonicQuestion();

  let html = subHead('The Harmonic Architect', 'dojoback');
  html += '<div class="question-box"><p>' + currentQuestion.q + '</p></div>';
  html += '<div class="theory-opts">';
  currentQuestion.opts.forEach((opt, idx) => {
    html += '<button type="button" class="opt-btn" data-action="dojoans" data-ans="' + idx + '"><span class="opt-text">' + opt + '</span></button>';
  });
  html += '</div>';
  html += '<div id="dojo-feedback" class="feedback-box"></div>';
  // Always displayed, so screen readers announce the result (the feedback box itself starts hidden).
  html += '<p id="dojo-announce" class="theory-sr" aria-live="polite"></p>';
  document.getElementById('dojo-game-container').innerHTML = html;

  document.querySelectorAll('#panel-dojo .codex-view').forEach(e => e.classList.remove('active'));
  document.getElementById('dojo-game-view').classList.add('active');
  focusSubTitle('dojo-game-view');
}

// Keyboard and screen-reader users land on the new screen's title (it can take focus, tabindex -1).
export function focusSubTitle(viewId){
  var h = document.querySelector('#' + viewId + ' .theory-sub-title');
  if(h) h.focus();
}

// Answering writes nothing (D148 point 3). The options become disabled buttons (no style set from code).
export function handleDojoAnswer(idx) {
  if(!currentQuestion) return;
  var btns = document.querySelectorAll('#dojo-game-container .opt-btn');
  if(!btns.length || btns[0].disabled || !(idx >= 0 && idx < btns.length)) return;
  btns.forEach(b => { b.disabled = true; });
  var right = idx === currentQuestion.ans;
  btns[currentQuestion.ans].classList.add('correct');
  btns[currentQuestion.ans].insertAdjacentHTML('beforeend', thIcon('tick', 'opt-ic'));
  if(!right){
    btns[idx].classList.add('wrong');
    btns[idx].insertAdjacentHTML('beforeend', thIcon('cross', 'opt-ic'));
  }
  var fbox = document.getElementById('dojo-feedback');
  fbox.classList.toggle('is-right', right);
  fbox.classList.toggle('is-wrong', !right);
  fbox.innerHTML = '<div class="feedback-title">' + thIcon(right ? 'tick' : 'cross', 'feedback-ic') +
    'Architect&apos;s analysis · ' + (right ? 'Correct' : 'Incorrect') + '</div>' +
    '<p>' + currentQuestion.exp + '</p>' +
    '<button type="button" class="theory-next" data-action="dojonext">Next scenario</button>';
  fbox.classList.add('show');
  var plain = function(html){ var d = document.createElement('div'); d.innerHTML = html; return d.textContent; };
  document.getElementById('dojo-announce').textContent = (right ? 'Correct. ' : 'Incorrect. The answer is ' + plain(currentQuestion.opts[currentQuestion.ans]) + '. ') + plain(currentQuestion.exp);
  var next = fbox.querySelector('.theory-next');
  if(next) next.focus();
}

// --- Dashboard: READ, PLAY (the Audio card moved to Account & data in slice 4.8e) ---

export function renderDojoDashboard() {
  // Slice 4.8e (D149 point 5): the Audio switch moved to Account & data › Settings (Sound). Anything that needs
  // sound is always shown, marked "Needs sound", whether sound is on or off.
  let left = '';
  left += '<section class="theory-group theory-read"><h2 class="theory-group-title">Read</h2>' +
    row({ icon: 'book', title: 'The Architect&apos;s Codex', sub: 'Read the theory and context before playing.', attrs: 'data-action="dojoopen" data-target="codex-list"' }) +
    '</section>';

  let right = '<section class="theory-group theory-play"><h2 class="theory-group-title">Play</h2><div class="theory-rows">';
  right += row({ icon: 'architect', title: 'The Harmonic Architect', sub: 'Songwriting decisions and modal tension.', attrs: 'data-action="dojoplay" data-game="architect"' });
  right += row({ icon: 'target', title: 'The Fretboard Sniper', sub: 'Rapid visual mapping on the neck.', soon: true, game: 'fretboard', tags: ['Not built yet'] });
  right += row({ icon: 'rhythm', title: 'The Rhythm Decryptor', sub: 'Ear training for odd time signatures.', soon: true, game: 'rhythm', tags: ['Needs sound', 'Not built yet'] });
  right += '</div></section>';

  return '<div class="theory-cols"><div class="theory-col theory-col-left">' + left + '</div><div class="theory-col theory-col-right">' + right + '</div></div>';
}

// --- Codex: every module open, no lock and no "read" mark (reading creates no status, D40) ---

export function renderCodexList() {
  let html = subHead('Library of the Architect', 'dojoback');
  html += '<p class="theory-lede">Read these contextualized theory scrolls before playing the mini-games.</p>';
  html += '<div class="theory-rows">';
  Object.keys(CODEX_DATA).forEach(k => {
    let id = parseInt(k,10);
    html += '<button type="button" class="theory-row theory-codex-row" data-action="readcodex" data-id="' + id + '">' +
      thIcon('book', 'theory-codex-ic') + '<span class="theory-row-text"><span class="theory-codex-title">' + CODEX_DATA[id].title + '</span></span>' +
      thIcon('chevron', 'theory-row-chev') + '</button>';
  });
  html += '</div>';
  return html;
}

export function renderCodexReader(id) {
  if(!CODEX_DATA[id]) return '';
  return subHead(CODEX_DATA[id].title, 'dojoopen', 'codex-list') + '<div class="codex-content">' + CODEX_DATA[id].content + '</div>';
}

export function renderDojoView() {
  // Slice 4.4 (D117, D123): the Theory rail (Level 1, not started) at the top of the page on the phone.
  // Slice 4.10e (D152 points 10, 11): phone subtitle "L1 · Not started"; desktop progress card.
  let html = pageHeader('Pillar · Musical Development', 'Theory', '<span class="pillar-sub">' + theorySub() + '</span>') +
    '<div class="pillar-rail">' + theoryPageRail() + '</div>' + theoryCard() +
    '<div id="dojo-dash-view" class="codex-view active">' + renderDojoDashboard() + '</div>' +
    '<div id="dojo-codex-list" class="codex-view"></div>' +
    '<div id="dojo-codex-reader" class="codex-view"></div>' +
    '<div id="dojo-game-view" class="codex-view game-area"><div id="dojo-game-container"></div></div>';
  return html;
}
