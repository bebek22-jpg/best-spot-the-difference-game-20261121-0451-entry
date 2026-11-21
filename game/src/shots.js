// Twinlight — deterministic screenshot scenes.
// `?shot=play&level=1` starts a level mid-hunt with some differences
// already found, so a screenshot shows the game as a player sees it:
// two panels, markers on the found, several still unfound, and the
// counter showing how many remain. The clock is frozen in shot mode so
// the frame is stable. `?shot=win` shows a cleared level; `?shot=start`
// is the title screen. This is the game's own code rendering its own
// state — the same code path a player reaches by playing.

import { LEVELS } from './config.js';
import { getScene } from './scenes.js';

const SHOT_FINDS = {
  // level index -> how many differences the shot has already found
  0: 3,
  1: 2,
  2: 4,
};

const SHOT_TIME_LEFT = {
  0: 151, // 2:31 on the clock
  1: 122, // 2:02
  2: 87, // 1:27
};

const SHOT_SCORE = {
  0: 325,
  1: 610,
  2: 1040,
};

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const level = Math.min(
    Math.max(Number.parseInt(params.get('level') || '1', 10) - 1, 0),
    LEVELS.length - 1,
  );
  return { shot, level };
}

export function applyShot(engine, { shot, level }) {
  const state = engine.state;
  if (shot === 'start') {
    state.screen = engine.SCREENS.TITLE;
    return;
  }
  engine.startGame(level);
  state.frozen = true;
  const scene = getScene(state.sceneKey);
  if (shot === 'win') {
    // Every difference found: the level-clear overlay over full markers.
    const now = performance.now();
    for (const diff of scene.differences) state.foundAt.set(diff.id, now - 3000);
    state.timeLeftMs = 64 * 1000;
    state.score = 1480;
    state.levelScore = 1480;
    state.clicks = 10;
    state.correctClicks = 10;
    state.screen = level >= LEVELS.length - 1 ? engine.SCREENS.VICTORY : engine.SCREENS.LEVEL_CLEAR;
    return;
  }
  // Mid-hunt: a fixed set of finds, spread across the picture.
  const count = SHOT_FINDS[level] ?? 3;
  const now = performance.now();
  const order = [0, 3, 6, 1, 4, 7, 2, 5, 8, 9];
  for (let i = 0; i < count; i++) {
    const diff = scene.differences[order[i] % scene.differences.length];
    state.foundAt.set(diff.id, now - 4000 - i * 900);
  }
  state.timeLeftMs = (SHOT_TIME_LEFT[level] ?? 120) * 1000;
  state.score = SHOT_SCORE[level] ?? 300;
  state.levelScore = state.score;
  state.clicks = count + 1;
  state.correctClicks = count;
  state.bannerUntil = 0;
}
