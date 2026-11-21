// Twinlight — draws the two panels and everything on top of them:
// the scene itself, the golden find-markers, the hint pulse, wrong-click
// flashes and the sparkle particles. The HUD lives in the DOM; this file
// owns only the canvases.

import { getScene } from './scenes.js';
import { MARKER_RING_MS, WRONG_FLASH_MS } from './config.js';
import { easeOutBack, easeOutCubic, clamp } from './random.js';

const MARKER_COLOR = '#ffd23e';
const MARKER_EDGE = '#b8860b';
const HINT_COLOR = '#4aa8ff';

export function createRenderer(leftCanvas, rightCanvas) {
  const leftCtx = leftCanvas.getContext('2d');
  const rightCtx = rightCanvas.getContext('2d');
  const particles = [];

  function burst(x, y, panel) {
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 40 + Math.random() * 70;
      particles.push({
        x, y, panel,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.7 + Math.random() * 0.4,
        age: 0,
        size: 2 + Math.random() * 3,
        color: i % 3 === 0 ? '#ffffff' : MARKER_COLOR,
      });
    }
  }

  function drawFoundMarker(ctx, diff, ageMs) {
    const t = clamp(ageMs / MARKER_RING_MS, 0, 1);
    const scale = easeOutBack(t);
    const radius = (diff.r + 7) * scale;
    if (radius <= 0) return;
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * t;
    // Soft halo while the ring lands.
    if (t < 1) {
      ctx.fillStyle = 'rgba(255, 210, 62, 0.35)';
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, radius + 10 * (1 - t), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = MARKER_EDGE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = MARKER_COLOR;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    // A small star at the ring's top once it has settled.
    if (t >= 1) {
      ctx.fillStyle = MARKER_COLOR;
      ctx.strokeStyle = MARKER_EDGE;
      ctx.lineWidth = 1.2;
      const sx = diff.x;
      const sy = diff.y - radius - 4;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        const a2 = a + Math.PI / 5;
        ctx.lineTo(sx + Math.cos(a) * 7, sy + Math.sin(a) * 7);
        ctx.lineTo(sx + Math.cos(a2) * 3, sy + Math.sin(a2) * 3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHintPulse(ctx, diff, now) {
    const pulse = (Math.sin(now / 180) + 1) / 2;
    const radius = diff.r + 8 + pulse * 7;
    ctx.save();
    ctx.globalAlpha = 0.55 + pulse * 0.45;
    ctx.strokeStyle = HINT_COLOR;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawWrongFlash(ctx, flash, ageMs) {
    const t = clamp(ageMs / WRONG_FLASH_MS, 0, 1);
    const alpha = 1 - easeOutCubic(t);
    const size = 12 + t * 6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(flash.x - size, flash.y - size);
    ctx.lineTo(flash.x + size, flash.y + size);
    ctx.moveTo(flash.x + size, flash.y - size);
    ctx.lineTo(flash.x - size, flash.y + size);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles(ctx, panel, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.panel !== panel) continue;
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 140 * dt;
      const alpha = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function renderPanel(ctx, sceneKey, variant, state, now, dt) {
    const scene = getScene(sceneKey);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    scene.draw(ctx, variant);
    // Found markers on both panels at once.
    for (const diff of scene.differences) {
      const foundAt = state.foundAt.get(diff.id);
      if (foundAt !== undefined) drawFoundMarker(ctx, diff, now - foundAt);
    }
    // Hint pulse, if one is live.
    if (state.hint && now < state.hint.until) {
      const diff = scene.differences.find((d) => d.id === state.hint.id);
      if (diff) drawHintPulse(ctx, diff, now);
    }
    // Wrong-click flashes for this panel.
    const panel = variant === 0 ? 'left' : 'right';
    for (const flash of state.wrongFlashes) {
      if (flash.panel === panel) drawWrongFlash(ctx, flash, now - flash.at);
    }
    drawParticles(ctx, panel, dt);
  }

  return {
    burst,
    render(state, now, dt) {
      renderPanel(leftCtx, state.sceneKey, 0, state, now, dt);
      renderPanel(rightCtx, state.sceneKey, 1, state, now, dt);
    },
  };
}
