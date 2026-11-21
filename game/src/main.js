// Twinlight — boot: wires the engine, renderer, input and DOM together,
// runs the frame loop, and owns the HUD and the overlay screens.

import { LEVELS, PANEL_WIDTH, PANEL_HEIGHT } from './config.js';
import { createEngine, SCREENS } from './engine.js';
import { createRenderer } from './render.js';
import { bindPanelClicks, bindKeyboard } from './input.js';
import { loadBest, saveBest } from './storage.js';
import { readShotParams, applyShot } from './shots.js';
import * as audio from './audio.js';

const $ = (id) => document.getElementById(id);

const leftCanvas = $('panel-left');
const rightCanvas = $('panel-right');
const panelsEl = $('panels');
const floatLayer = $('float-layer');
const bannerEl = $('banner');
const toastEl = $('toast');

const renderer = createRenderer(leftCanvas, rightCanvas);

let lastHud = '';

function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function showToast(text, kind) {
  toastEl.textContent = text;
  toastEl.className = `toast show ${kind || ''}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toastEl.className = 'toast';
  }, 1400);
}

function showFloatText(x, y, text) {
  const box = leftCanvas.getBoundingClientRect();
  const layerBox = floatLayer.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = `${box.left - layerBox.left + (x / PANEL_WIDTH) * box.width}px`;
  el.style.top = `${box.top - layerBox.top + (y / PANEL_HEIGHT) * box.height}px`;
  floatLayer.appendChild(el);
  window.setTimeout(() => el.remove(), 1100);
}

function updateHud(state) {
  const level = LEVELS[state.levelIndex];
  const found = state.foundAt.size;
  const total = level.differences;
  const key = [
    state.levelIndex, state.score, state.best, found, total,
    state.hintsLeft, Math.ceil(state.timeLeftMs / 1000), state.screen,
  ].join('|');
  if (key === lastHud) return;
  lastHud = key;

  $('level-name').textContent = `Level ${state.levelIndex + 1} · ${level.name}`;
  $('score').textContent = String(state.score);
  $('best').textContent = state.best > 0 ? `Best ${state.best}` : '';
  $('timer-text').textContent = formatTime(state.timeLeftMs);
  const bar = $('timer-bar');
  const fraction = Math.max(0, state.timeLeftMs / (level.seconds * 1000));
  bar.style.width = `${fraction * 100}%`;
  bar.classList.toggle('low', fraction <= 0.25);
  $('timer').classList.toggle('low', fraction <= 0.25);

  const dots = $('counter-dots');
  dots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = `dot${i < found ? ' found' : ''}`;
    dots.appendChild(dot);
  }
  $('counter-text').textContent = `${total - found} left`;
  $('hint-btn').textContent = `Hint (${state.hintsLeft})`;
  $('hint-btn').disabled = state.hintsLeft <= 0 || state.screen !== SCREENS.PLAYING;
}

function showOverlay(name) {
  for (const el of document.querySelectorAll('.overlay')) el.classList.remove('open');
  if (name) $(`overlay-${name}`).classList.add('open');
}

function onScreenChange(screen, info) {
  if (screen === SCREENS.TITLE) showOverlay('title');
  else if (screen === SCREENS.PAUSED) showOverlay('paused');
  else if (screen === SCREENS.LEVEL_CLEAR) {
    $('clear-score').textContent = `Level score ${engine.state.levelScore}`;
    $('clear-bonus').textContent = `Time bonus +${info ? info.bonus : 0} · Accuracy ${info ? info.accuracy : 100}%`;
    $('clear-next').textContent = `Next: ${LEVELS[engine.state.levelIndex + 1].name}`;
    showOverlay('level-clear');
  } else if (screen === SCREENS.TIME_UP) {
    $('timeup-score').textContent = `Score ${engine.state.score} · ${engine.remaining()} still hidden`;
    showOverlay('time-up');
  } else if (screen === SCREENS.VICTORY) {
    $('victory-score').textContent = `Final score ${engine.state.score}`;
    $('victory-best').textContent = engine.state.score >= engine.state.best && engine.state.best > 0
      ? 'New best score!'
      : `Best ${engine.state.best}`;
    showOverlay('victory');
  } else {
    showOverlay(null);
  }
}

const engine = createEngine({
  loadBest,
  saveBest,
  onHud: updateHud,
  onScreenChange,
  onFound(diff, points, comboStep) {
    renderer.burst(diff.x, diff.y, 'left');
    renderer.burst(diff.x, diff.y, 'right');
    showFloatText(diff.x, diff.y, `+${points}`);
    if (comboStep > 0) showToast(`Combo ×${comboStep + 1} — ${diff.label} found!`, 'good');
    else showToast(`${diff.label} found!`, 'good');
  },
  onWrong() {
    panelsEl.classList.remove('shake');
    void panelsEl.offsetWidth;
    panelsEl.classList.add('shake');
    showToast('Not quite — 5 seconds lost', 'bad');
  },
});

function startFromTitle(levelIndex) {
  audio.unlockAudio();
  audio.playClick();
  engine.startGame(levelIndex);
}

$('start-btn').addEventListener('click', () => startFromTitle(0));
for (const btn of document.querySelectorAll('[data-level]')) {
  btn.addEventListener('click', () => startFromTitle(Number(btn.dataset.level)));
}
$('next-btn').addEventListener('click', () => { audio.playClick(); engine.nextLevel(); });
$('retry-btn').addEventListener('click', () => { audio.playClick(); engine.startLevel(engine.state.levelIndex); });
$('again-btn').addEventListener('click', () => { audio.playClick(); engine.startGame(0); });
$('resume-btn').addEventListener('click', () => { audio.playClick(); engine.togglePause(); });
$('quit-btn').addEventListener('click', () => { audio.playClick(); engine.backToTitle(); });
$('hint-btn').addEventListener('click', () => engine.useHint(performance.now()));
$('pause-btn').addEventListener('click', () => engine.togglePause());
$('mute-btn').addEventListener('click', () => {
  audio.setMuted(!audio.isMuted());
  $('mute-btn').textContent = audio.isMuted() ? 'Sound off' : 'Sound on';
  $('mute-btn').classList.toggle('off', audio.isMuted());
});

bindPanelClicks(leftCanvas, rightCanvas, (x, y, panel) => {
  engine.handleClick(x, y, panel, performance.now());
});

bindKeyboard({
  hint: () => engine.useHint(performance.now()),
  pause: () => engine.togglePause(),
  mute: () => $('mute-btn').click(),
  restart: () => {
    if (engine.state.screen === SCREENS.PLAYING || engine.state.screen === SCREENS.PAUSED) {
      engine.startLevel(engine.state.levelIndex);
    }
  },
  advance: () => {
    if (engine.state.screen === SCREENS.TITLE) startFromTitle(0);
    else if (engine.state.screen === SCREENS.LEVEL_CLEAR) engine.nextLevel();
    else if (engine.state.screen === SCREENS.TIME_UP) engine.startLevel(engine.state.levelIndex);
    else if (engine.state.screen === SCREENS.VICTORY) engine.startGame(0);
  },
});

// Frame loop: the engine ticks the clock, the renderer repaints both panels.
let lastNow = performance.now();
function frame(now) {
  const dtMs = Math.min(now - lastNow, 100);
  lastNow = now;
  engine.tick(now, dtMs);
  renderer.render(engine.state, now, dtMs / 1000);
  const bannerOn = engine.state.screen === SCREENS.PLAYING && now < engine.state.bannerUntil;
  bannerEl.classList.toggle('show', bannerOn);
  if (bannerOn) bannerEl.textContent = engine.state.bannerText;
  requestAnimationFrame(frame);
}

// Shot mode: deterministic demo states for screenshots (?shot=play|win|start).
const shot = readShotParams();
if (shot) {
  applyShot(engine, shot);
  onScreenChange(engine.state.screen, shot.shot === 'win'
    ? { bonus: 320, accuracy: 100 }
    : undefined);
  updateHud(engine.state);
} else {
  showOverlay('title');
}

updateHud(engine.state);
requestAnimationFrame(frame);
