// Twinlight — keyboard and mouse input.
// Clicks on either panel map to scene coordinates; keys drive the
// hint, pause, restart and level flow. No pointer ever leaves the page.

import { PANEL_WIDTH, PANEL_HEIGHT } from './config.js';

export function panelCoordinates(canvas, event) {
  const box = canvas.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * PANEL_WIDTH;
  const y = ((event.clientY - box.top) / box.height) * PANEL_HEIGHT;
  return { x, y };
}

export function bindPanelClicks(leftCanvas, rightCanvas, onPanelClick) {
  for (const [canvas, panel] of [[leftCanvas, 'left'], [rightCanvas, 'right']]) {
    canvas.addEventListener('click', (event) => {
      const { x, y } = panelCoordinates(canvas, event);
      onPanelClick(x, y, panel);
    });
  }
}

export function bindKeyboard(actions) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') actions.hint();
    else if (key === 'p' || key === 'escape') actions.pause();
    else if (key === 'm') actions.mute();
    else if (key === 'r') actions.restart();
    else if (key === 'n' || key === 'enter') actions.advance();
  });
}
