// Twinlight — every tuning number in one place.
// One file, one job: constants the engine, renderer and scenes share.

export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 400;

export const LEVELS = [
  { name: 'Harbour Dawn', scene: 'harbour', differences: 8, seconds: 180, hints: 3 },
  { name: 'Night Market', scene: 'market', differences: 9, seconds: 150, hints: 3 },
  { name: 'Clockwork Garden', scene: 'garden', differences: 10, seconds: 120, hints: 3 },
];

export const SCORE_FIND = 100;
export const SCORE_COMBO_STEP = 25;
export const SCORE_COMBO_MAX = 100;
export const SCORE_COMBO_WINDOW_MS = 4000;
export const SCORE_TIME_BONUS_PER_SECOND = 5;
export const SCORE_HINT_COST = 50;
export const SCORE_WRONG_COST = 25;
export const WRONG_TIME_PENALTY_SECONDS = 5;

export const HINT_PULSE_MS = 3000;
export const MARKER_RING_MS = 650;
export const WRONG_FLASH_MS = 500;
export const LEVEL_BANNER_MS = 1600;
export const LOW_TIME_SECONDS = 30;
export const TICK_SECONDS = 10;

export const BEST_KEY = 'twinlight.bestScore';
