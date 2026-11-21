// Twinlight — best-score persistence in localStorage.
// Guarded: private browsing or a blocked store just means no memory.

import { BEST_KEY } from './config.js';

export function loadBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const value = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Storage unavailable — the score still shows for this run.
  }
}
