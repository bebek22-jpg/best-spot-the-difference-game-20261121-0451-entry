// Twinlight — the game engine: state machine, clicks, scoring, timer,
// hints and level flow. It knows nothing about the DOM except through the
// callbacks the boot code hands it; the renderer draws what it holds.

import { LEVELS, SCORE_FIND, SCORE_COMBO_STEP, SCORE_COMBO_MAX, SCORE_COMBO_WINDOW_MS,
  SCORE_TIME_BONUS_PER_SECOND, SCORE_HINT_COST, SCORE_WRONG_COST, WRONG_TIME_PENALTY_SECONDS,
  HINT_PULSE_MS, TICK_SECONDS, LOW_TIME_SECONDS } from './config.js';
import { getScene } from './scenes.js';
import * as audio from './audio.js';

export const SCREENS = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_CLEAR: 'level-clear',
  TIME_UP: 'time-up',
  VICTORY: 'victory',
};

export function createEngine(hooks) {
  const state = {
    screen: SCREENS.TITLE,
    levelIndex: 0,
    sceneKey: LEVELS[0].scene,
    foundAt: new Map(),
    hint: null,
    wrongFlashes: [],
    score: 0,
    best: hooks.loadBest(),
    levelScore: 0,
    hintsLeft: LEVELS[0].hints,
    timeLeftMs: LEVELS[0].seconds * 1000,
    lastFindAt: 0,
    comboStep: 0,
    clicks: 0,
    correctClicks: 0,
    levelStartedAt: 0,
    lastTickSecond: -1,
    bannerUntil: 0,
    bannerText: '',
    frozen: false, // shot mode: the clock never runs
  };

  function scene() {
    return getScene(state.sceneKey);
  }

  function totalDifferences() {
    return scene().differences.length;
  }

  function remaining() {
    return totalDifferences() - state.foundAt.size;
  }

  function level() {
    return LEVELS[state.levelIndex];
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.sceneKey = level().scene;
    state.foundAt = new Map();
    state.hint = null;
    state.wrongFlashes = [];
    state.levelScore = 0;
    state.hintsLeft = level().hints;
    state.timeLeftMs = level().seconds * 1000;
    state.lastFindAt = 0;
    state.comboStep = 0;
    state.clicks = 0;
    state.correctClicks = 0;
    state.lastTickSecond = -1;
    state.screen = SCREENS.PLAYING;
    state.levelStartedAt = performance.now();
    state.bannerText = `Level ${index + 1} — ${level().name}`;
    state.bannerUntil = performance.now() + 1600;
    hooks.onScreenChange(state.screen);
    hooks.onHud(state);
  }

  function startGame(levelIndex = 0) {
    state.score = 0;
    state.comboStep = 0;
    audio.unlockAudio();
    startLevel(levelIndex);
  }

  function differenceAt(x, y) {
    for (const diff of scene().differences) {
      if (state.foundAt.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
    }
    return null;
  }

  function handleClick(x, y, panel, now) {
    if (state.screen !== SCREENS.PLAYING) return;
    audio.unlockAudio();
    state.clicks += 1;
    const diff = differenceAt(x, y);
    if (diff) {
      state.correctClicks += 1;
      const quick = state.lastFindAt > 0 && now - state.lastFindAt < SCORE_COMBO_WINDOW_MS;
      state.comboStep = quick ? Math.min(state.comboStep + 1, 4) : 0;
      state.lastFindAt = now;
      const points = SCORE_FIND + state.comboStep * SCORE_COMBO_STEP;
      state.score += points;
      state.levelScore += points;
      state.foundAt.set(diff.id, now);
      audio.playFound(state.comboStep);
      hooks.onFound(diff, points, state.comboStep);
      if (remaining() === 0) completeLevel(now);
    } else {
      state.score = Math.max(0, state.score - SCORE_WRONG_COST);
      state.timeLeftMs = Math.max(0, state.timeLeftMs - WRONG_TIME_PENALTY_SECONDS * 1000);
      state.comboStep = 0;
      state.wrongFlashes.push({ x, y, panel, at: now });
      audio.playWrong();
      hooks.onWrong(x, y, panel);
    }
    hooks.onHud(state);
  }

  function completeLevel(now) {
    const bonus = Math.ceil(state.timeLeftMs / 1000) * SCORE_TIME_BONUS_PER_SECOND;
    state.score += bonus;
    state.levelScore += bonus;
    const accuracy = state.clicks === 0 ? 100 : Math.round((state.correctClicks / state.clicks) * 100);
    const isLast = state.levelIndex === LEVELS.length - 1;
    if (state.score > state.best) {
      state.best = state.score;
      hooks.saveBest(state.best);
    }
    if (isLast) {
      state.screen = SCREENS.VICTORY;
      audio.playVictory();
    } else {
      state.screen = SCREENS.LEVEL_CLEAR;
      audio.playLevelClear();
    }
    hooks.onScreenChange(state.screen, { bonus, accuracy });
    hooks.onHud(state);
  }

  function useHint(now) {
    if (state.screen !== SCREENS.PLAYING) return;
    if (state.hintsLeft <= 0) return;
    const unfound = scene().differences.filter((d) => !state.foundAt.has(d.id));
    if (unfound.length === 0) return;
    const diff = unfound[Math.floor(Math.random() * unfound.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - SCORE_HINT_COST);
    state.hint = { id: diff.id, until: now + HINT_PULSE_MS };
    audio.playHint();
    hooks.onHud(state);
  }

  function nextLevel() {
    if (state.screen !== SCREENS.LEVEL_CLEAR) return;
    startLevel(state.levelIndex + 1);
  }

  function togglePause() {
    if (state.screen === SCREENS.PLAYING) {
      state.screen = SCREENS.PAUSED;
      hooks.onScreenChange(state.screen);
    } else if (state.screen === SCREENS.PAUSED) {
      state.screen = SCREENS.PLAYING;
      hooks.onScreenChange(state.screen);
    }
  }

  function backToTitle() {
    state.screen = SCREENS.TITLE;
    hooks.onScreenChange(state.screen);
    hooks.onHud(state);
  }

  function tick(now, dtMs) {
    if (state.screen !== SCREENS.PLAYING || state.frozen) return;
    state.timeLeftMs -= dtMs;
    // Drop expired wrong flashes.
    state.wrongFlashes = state.wrongFlashes.filter((f) => now - f.at < 600);
    const seconds = Math.ceil(state.timeLeftMs / 1000);
    if (seconds <= TICK_SECONDS && seconds !== state.lastTickSecond && seconds > 0) {
      state.lastTickSecond = seconds;
      audio.playTick();
    }
    if (state.timeLeftMs <= 0) {
      state.timeLeftMs = 0;
      state.screen = SCREENS.TIME_UP;
      audio.playTimeUp();
      hooks.onScreenChange(state.screen);
    }
    hooks.onHud(state);
  }

  return {
    state,
    SCREENS,
    startGame,
    startLevel,
    handleClick,
    useHint,
    nextLevel,
    togglePause,
    backToTitle,
    tick,
    remaining,
    totalDifferences,
    level,
    isLowTime() {
      return state.timeLeftMs <= LOW_TIME_SECONDS * 1000;
    },
  };
}
