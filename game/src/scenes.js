// Twinlight — the three scenes, drawn procedurally on canvas.
// Each scene paints the same picture twice: variant 0 is the original
// (left panel), variant 1 is the altered copy (right panel). Every planted
// difference is listed in the scene's `differences` with its hit zone.

import { PANEL_WIDTH, PANEL_HEIGHT } from './config.js';

// ---------- tiny drawing helpers ----------

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s) {
  circle(ctx, x, y, 20 * s, '#ffffff');
  circle(ctx, x + 22 * s, y - 6 * s, 24 * s, '#ffffff');
  circle(ctx, x + 46 * s, y, 18 * s, '#ffffff');
  ellipse(ctx, x + 22 * s, y + 10 * s, 38 * s, 12 * s, '#ffffff');
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 6 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 6 * s, y - 8 * s, x + 12 * s, y);
  ctx.stroke();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------- Scene 1: Harbour Dawn ----------

function drawHarbour(ctx, variant) {
  const W = PANEL_WIDTH;
  const H = PANEL_HEIGHT;

  // Dawn sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(0.55, '#ffeecf');
  sky.addColorStop(1, '#a9d8e8');
  rect(ctx, 0, 0, W, H * 0.62, sky);

  // Sun with rays — difference 1: 8 rays vs 5.
  const rays = variant === 0 ? 8 : 5;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + 0.2;
    line(ctx, 90 + Math.cos(a) * 34, 70 + Math.sin(a) * 34,
      90 + Math.cos(a) * 52, 70 + Math.sin(a) * 52, '#f5a623', 4);
  }
  circle(ctx, 90, 70, 30, '#ffcf4d');
  circle(ctx, 90, 70, 24, '#ffe27a');

  // Clouds — difference 2: the middle cloud vanishes.
  cloud(ctx, 170, 52, 0.8);
  if (variant === 0) cloud(ctx, 300, 62, 1);
  cloud(ctx, 440, 46, 0.7);

  // Gulls — difference 5: the lowest gull vanishes.
  gull(ctx, 200, 96, 1, '#5a6b7a');
  gull(ctx, 330, 84, 0.85, '#5a6b7a');
  if (variant === 0) gull(ctx, 255, 118, 0.9, '#5a6b7a');

  // Sea.
  const sea = ctx.createLinearGradient(0, H * 0.6, 0, H);
  sea.addColorStop(0, '#7cc4dd');
  sea.addColorStop(1, '#2e7fa8');
  rect(ctx, 0, H * 0.6, W, H * 0.4, sea);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[40, 268, 60], [200, 292, 70], [330, 262, 55], [470, 300, 60], [90, 330, 55], [250, 350, 70], [420, 360, 55]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 5, wx + wl, wy);
    ctx.stroke();
  }

  // Wooden dock, bottom left.
  rect(ctx, 0, 330, 210, 70, '#8a6a44');
  rect(ctx, 0, 330, 210, 10, '#a87f52');
  for (let i = 0; i < 6; i++) line(ctx, 18 + i * 36, 334, 18 + i * 36, 396, '#6f5334', 2);
  rect(ctx, 196, 330, 14, 70, '#6f5334');

  // Crates on the dock — difference 8: three crates vs two.
  rect(ctx, 88, 306, 30, 26, '#c98f4e');
  rect(ctx, 92, 310, 22, 3, '#a8743a');
  rect(ctx, 122, 306, 30, 26, '#c98f4e');
  rect(ctx, 126, 310, 22, 3, '#a8743a');
  if (variant === 0) {
    rect(ctx, 105, 282, 30, 26, '#d9a55f');
    rect(ctx, 109, 286, 22, 3, '#b58545');
  }
  // Rope coil beside the crates.
  ctx.strokeStyle = '#e8d3a0';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(168, 322, 12, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(168, 322, 6, 0, Math.PI * 2); ctx.stroke();

  // Sailboat — difference 4: red flag vs teal flag.
  line(ctx, 150, 258, 150, 196, '#5a4632', 4);
  poly(ctx, [[154, 200], [154, 252], [196, 252]], '#fff6e0');
  poly(ctx, [[146, 206], [146, 252], [112, 252]], '#ffe9c4');
  poly(ctx, [[150, 196], [178, 204], [150, 212]], variant === 0 ? '#e0483e' : '#2aa198');
  ctx.fillStyle = '#7a5230';
  ctx.beginPath();
  ctx.moveTo(104, 256); ctx.lineTo(204, 256); ctx.lineTo(188, 274); ctx.lineTo(120, 274);
  ctx.closePath(); ctx.fill();

  // Rowboat.
  ctx.fillStyle = '#4a7a5a';
  ctx.beginPath();
  ctx.moveTo(330, 312); ctx.lineTo(396, 312); ctx.lineTo(384, 330); ctx.lineTo(342, 330);
  ctx.closePath(); ctx.fill();
  line(ctx, 352, 312, 344, 292, '#8a6a44', 4);

  // Jumping fish — difference 6: present vs absent.
  if (variant === 0) {
    ellipse(ctx, 362, 292, 12, 6, '#ff8c42');
    poly(ctx, [[372, 292], [382, 285], [382, 299]], '#ff8c42');
    circle(ctx, 356, 290, 1.8, '#222');
    line(ctx, 348, 300, 340, 294, '#ffffff', 2);
    line(ctx, 376, 300, 384, 294, '#ffffff', 2);
  }

  // Buoy — difference 7: orange vs yellow.
  circle(ctx, 430, 332, 13, variant === 0 ? '#ff7b2e' : '#ffd23e');
  rect(ctx, 427, 312, 6, 10, '#333');
  circle(ctx, 430, 310, 3.5, '#ff5252');

  // Lighthouse — difference 3: three red bands vs two.
  rect(ctx, 452, 120, 44, 190, '#f5f0e6');
  rect(ctx, 452, 120, 44, 190, 'rgba(0,0,0,0)');
  rect(ctx, 452, 150, 44, 22, '#e0483e');
  rect(ctx, 452, 210, 44, 22, '#e0483e');
  if (variant === 0) rect(ctx, 452, 270, 44, 22, '#e0483e');
  rect(ctx, 446, 104, 56, 20, '#37474f');
  circle(ctx, 474, 100, 12, '#ffe27a');
  poly(ctx, [[446, 104], [502, 104], [474, 82]], '#e0483e');
  // Light beam.
  ctx.fillStyle = 'rgba(255, 226, 122, 0.35)';
  ctx.beginPath();
  ctx.moveTo(462, 104); ctx.lineTo(330, 60); ctx.lineTo(330, 128); ctx.closePath();
  ctx.fill();
  // Lit window.
  rect(ctx, 468, 186, 12, 16, '#ffe27a');
  rect(ctx, 468, 246, 12, 16, '#5a6b7a');
}

const HARBOUR_DIFFERENCES = [
  { id: 'sun-rays', x: 90, y: 70, r: 46, label: 'Sun rays' },
  { id: 'middle-cloud', x: 300, y: 62, r: 36, label: 'Middle cloud' },
  { id: 'lighthouse-bands', x: 474, y: 210, r: 42, label: 'Lighthouse bands' },
  { id: 'boat-flag', x: 164, y: 204, r: 26, label: 'Boat flag' },
  { id: 'third-gull', x: 255, y: 112, r: 26, label: 'Third gull' },
  { id: 'jumping-fish', x: 362, y: 292, r: 26, label: 'Jumping fish' },
  { id: 'buoy-colour', x: 430, y: 328, r: 24, label: 'Buoy colour' },
  { id: 'crates', x: 120, y: 306, r: 32, label: 'Crates' },
];

// ---------- Scene 2: Night Market ----------

function drawMarket(ctx, variant) {
  const W = PANEL_WIDTH;
  const H = PANEL_HEIGHT;

  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, '#141b33');
  sky.addColorStop(1, '#2c3e6b');
  rect(ctx, 0, 0, W, H * 0.7, sky);
  for (const [sx, sy, sr] of [[40, 40, 2], [150, 26, 1.6], [250, 48, 2], [330, 30, 1.5], [420, 56, 2], [500, 30, 1.6], [200, 80, 1.4], [480, 110, 1.8], [60, 130, 1.5]]) {
    star(ctx, sx, sy, sr, '#ffe9a8');
  }

  // Moon — difference 1: full moon vs crescent.
  circle(ctx, 90, 70, 28, '#fdf6d8');
  if (variant === 1) circle(ctx, 102, 64, 24, '#1b2547');
  circle(ctx, 82, 62, 5, 'rgba(0,0,0,0.08)');
  circle(ctx, 98, 80, 4, 'rgba(0,0,0,0.08)');

  // String lights across the top — difference 7: one bulb dark.
  ctx.strokeStyle = '#0c1226';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.quadraticCurveTo(280, 120, 560, 60);
  ctx.stroke();
  const bulbs = [[80, 78], [160, 94], [240, 102], [320, 102], [400, 94], [480, 78]];
  bulbs.forEach(([bx, by], i) => {
    const dark = variant === 1 && i === 3;
    circle(ctx, bx, by + 8, 6, dark ? '#3a4666' : '#ffd23e');
    if (!dark) circle(ctx, bx, by + 8, 10, 'rgba(255,210,62,0.25)');
  });

  // Ground: cobblestones.
  rect(ctx, 0, 300, W, 100, '#4a4458');
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      ellipse(ctx, 28 + col * 56 + (row % 2) * 28, 316 + row * 28, 24, 10, row % 2 ? '#554e63' : '#453f52');
    }
  }

  // Left stall: fruit stall with striped awning — difference 4: 5 stripes vs 4.
  rect(ctx, 60, 200, 150, 110, '#6b4a2f');
  rect(ctx, 60, 200, 150, 12, '#54371f');
  const stripes = variant === 0 ? 5 : 4;
  for (let i = 0; i < stripes; i++) {
    rect(ctx, 54 + i * (162 / stripes), 168, 162 / stripes, 34, i % 2 ? '#f2ead8' : '#d64541');
  }
  rect(ctx, 54, 168, 162, 6, '#8e2f2b');
  // Fruit crates — difference 5: red apples vs orange oranges.
  rect(ctx, 76, 268, 56, 34, '#8a6a44');
  rect(ctx, 146, 268, 56, 34, '#8a6a44');
  const fruit = variant === 0 ? '#e0483e' : '#ff8c2e';
  for (const [fx, fy] of [[88, 262], [104, 256], [120, 262], [158, 262], [174, 256], [190, 262]]) {
    circle(ctx, fx, fy, 8, fruit);
    line(ctx, fx, fy - 8, fx + 3, fy - 13, '#4a7a3a', 2);
  }
  // Fruit sign.
  rect(ctx, 100, 214, 70, 24, '#f2ead8');
  ctx.fillStyle = '#333';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FRUIT', 135, 231);

  // Cat on the stall roof — difference 3: present vs absent.
  if (variant === 0) {
    ellipse(ctx, 150, 160, 20, 10, '#2b2b33');
    circle(ctx, 168, 152, 9, '#2b2b33');
    poly(ctx, [[162, 146], [166, 136], [170, 146]], '#2b2b33');
    poly(ctx, [[170, 146], [174, 136], [178, 146]], '#2b2b33');
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 158);
    ctx.quadraticCurveTo(120, 146, 128, 138);
    ctx.stroke();
    circle(ctx, 165, 151, 1.6, '#ffd23e');
    circle(ctx, 171, 151, 1.6, '#ffd23e');
  }

  // Middle: food cart with steaming pot — difference 9: 3 steam curls vs 2.
  rect(ctx, 250, 250, 90, 60, '#7a5a38');
  circle(ctx, 262, 312, 12, '#333');
  circle(ctx, 328, 312, 12, '#333');
  ellipse(ctx, 295, 246, 42, 16, '#37474f');
  ellipse(ctx, 295, 240, 42, 14, '#546e7a');
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 3;
  const curls = variant === 0 ? 3 : 2;
  for (let i = 0; i < curls; i++) {
    const cx = 272 + i * 22;
    ctx.beginPath();
    ctx.moveTo(cx, 232);
    ctx.quadraticCurveTo(cx + 8, 218, cx, 204);
    ctx.quadraticCurveTo(cx - 8, 192, cx + 2, 182);
    ctx.stroke();
  }

  // Right stall: lantern stall.
  rect(ctx, 380, 200, 150, 110, '#5a3a4a');
  rect(ctx, 380, 200, 150, 12, '#452c39');
  for (let i = 0; i < 4; i++) {
    rect(ctx, 374 + i * 40, 168, 40, 34, i % 2 ? '#f2ead8' : '#7a4a8a');
  }
  rect(ctx, 374, 168, 162, 6, '#4a2a5a');
  // Lanterns — difference 2: middle lantern red vs gold.
  for (const [lx, lcol] of [[404, '#e0483e'], [452, variant === 0 ? '#e0483e' : '#ffd23e'], [500, '#e0483e']]) {
    ellipse(ctx, lx, 236, 14, 20, lcol);
    rect(ctx, lx - 6, 214, 12, 6, '#d9a441');
    rect(ctx, lx - 6, 254, 12, 6, '#d9a441');
    line(ctx, lx, 202, lx, 214, '#222', 2);
  }
  // Round vs square sign — difference 8.
  if (variant === 0) {
    circle(ctx, 455, 292, 16, '#f2ead8');
  } else {
    rect(ctx, 439, 276, 32, 32, '#f2ead8');
  }
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText('TEA', 455, 296);

  // Bicycle — difference 6: basket present vs absent.
  circle(ctx, 452, 344, 20, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#cfd8dc';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(442, 348, 20, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(498, 348, 20, 0, Math.PI * 2); ctx.stroke();
  line(ctx, 442, 348, 470, 322, '#cfd8dc', 3);
  line(ctx, 498, 348, 470, 322, '#cfd8dc', 3);
  line(ctx, 470, 322, 452, 322, '#cfd8dc', 3);
  line(ctx, 452, 322, 442, 348, '#cfd8dc', 3);
  line(ctx, 452, 322, 446, 312, '#cfd8dc', 3);
  line(ctx, 470, 322, 486, 312, '#cfd8dc', 3);
  if (variant === 0) {
    rect(ctx, 478, 300, 26, 18, '#8a6a44');
    line(ctx, 478, 306, 504, 306, '#6f5334', 2);
  }
}

const MARKET_DIFFERENCES = [
  { id: 'moon-phase', x: 90, y: 70, r: 36, label: 'Moon phase' },
  { id: 'lantern-colour', x: 452, y: 236, r: 26, label: 'Lantern colour' },
  { id: 'roof-cat', x: 150, y: 152, r: 28, label: 'Roof cat' },
  { id: 'awning-stripes', x: 135, y: 185, r: 42, label: 'Awning stripes' },
  { id: 'fruit-colour', x: 139, y: 262, r: 32, label: 'Fruit colour' },
  { id: 'bicycle-basket', x: 491, y: 309, r: 26, label: 'Bicycle basket' },
  { id: 'dark-bulb', x: 320, y: 108, r: 20, label: 'Dark bulb' },
  { id: 'sign-shape', x: 455, y: 292, r: 26, label: 'Sign shape' },
  { id: 'steam-curls', x: 294, y: 208, r: 30, label: 'Steam curls' },
];

// ---------- Scene 3: Clockwork Garden ----------

function gear(ctx, x, y, r, teeth, color, angle) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = angle + (i / teeth) * Math.PI * 2;
    const a2 = a + Math.PI / teeth;
    ctx.lineTo(x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18);
    ctx.lineTo(x + Math.cos(a2) * r * 1.18, y + Math.sin(a2) * r * 1.18);
    ctx.lineTo(x + Math.cos(a2) * r, y + Math.sin(a2) * r);
  }
  ctx.closePath();
  ctx.fill();
  circle(ctx, x, y, r * 0.55, '#f5f0e6');
  circle(ctx, x, y, r * 0.18, color);
}

function flower(ctx, x, y, petal, center) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(ctx, x, y, 5, center);
}

function drawGarden(ctx, variant) {
  const W = PANEL_WIDTH;
  const H = PANEL_HEIGHT;

  // Fresh morning sky and lawn.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#9fd8ef');
  sky.addColorStop(1, '#dff5e3');
  rect(ctx, 0, 0, W, H * 0.55, sky);
  cloud(ctx, 120, 50, 0.9);
  cloud(ctx, 330, 38, 0.7);
  rect(ctx, 0, H * 0.55, W, H * 0.45, '#7cb85a');
  ellipse(ctx, 280, 400, 300, 90, '#6aa84e');

  // Hedge along the back.
  ellipse(ctx, 60, 228, 70, 26, '#4a8a3a');
  ellipse(ctx, 180, 224, 80, 28, '#4a8a3a');
  ellipse(ctx, 300, 228, 70, 26, '#4a8a3a');
  ellipse(ctx, 520, 228, 60, 26, '#4a8a3a');

  // Fence with a bird — difference 9: bird present vs absent.
  for (let i = 0; i < 5; i++) rect(ctx, 24 + i * 26, 196, 8, 40, '#a87f52');
  rect(ctx, 20, 208, 140, 6, '#8a6a44');
  if (variant === 0) {
    ellipse(ctx, 62, 188, 10, 7, '#3a7bd5');
    circle(ctx, 70, 182, 5, '#3a7bd5');
    poly(ctx, [[74, 182], [80, 184], [74, 186]], '#ff8c2e');
    line(ctx, 58, 194, 58, 198, '#333', 2);
    line(ctx, 64, 194, 64, 198, '#333', 2);
  }

  // Path stones — difference 10: six stones vs five.
  const stones = variant === 0 ? 6 : 5;
  for (let i = 0; i < stones; i++) {
    ellipse(ctx, 250 + i * 22, 372 - (i % 2) * 8, 14, 8, '#d8cfc0');
  }

  // Fountain — difference 3: three jets vs two.
  ellipse(ctx, 150, 300, 64, 20, '#b8c4cc');
  ellipse(ctx, 150, 294, 54, 15, '#7cc4dd');
  rect(ctx, 142, 246, 16, 48, '#b8c4cc');
  ellipse(ctx, 150, 244, 24, 8, '#b8c4cc');
  ctx.strokeStyle = '#a8dcf0';
  ctx.lineWidth = 4;
  const jets = variant === 0 ? 3 : 2;
  for (let i = 0; i < jets; i++) {
    const jx = 150 + (i - (jets - 1) / 2) * 18;
    ctx.beginPath();
    ctx.moveTo(jx, 244);
    ctx.quadraticCurveTo(jx, 214, jx + (i - (jets - 1) / 2) * 10, 204);
    ctx.stroke();
    circle(ctx, jx + (i - (jets - 1) / 2) * 10, 202, 4, '#a8dcf0');
  }

  // Flower bed — difference 5: five flowers vs four.
  ellipse(ctx, 100, 344, 70, 22, '#5a9a44');
  const blooms = variant === 0 ? 5 : 4;
  const bloomCols = ['#ff6b81', '#ffd23e', '#ff6b81', '#c084fc', '#ffd23e'];
  for (let i = 0; i < blooms; i++) {
    flower(ctx, 52 + i * 24, 338 - (i % 2) * 8, bloomCols[i], '#fff3b0');
  }

  // Butterfly — difference 4: blue vs purple wings.
  const wing = variant === 0 ? '#4aa8ff' : '#b06bff';
  ellipse(ctx, 238, 128, 12, 16, wing);
  ellipse(ctx, 262, 128, 12, 16, wing);
  ellipse(ctx, 242, 140, 8, 10, wing);
  ellipse(ctx, 258, 140, 8, 10, wing);
  ellipse(ctx, 250, 132, 3, 14, '#333');
  line(ctx, 248, 118, 242, 108, '#333', 2);
  line(ctx, 252, 118, 258, 108, '#333', 2);

  // Bench — difference 8: four slats vs three.
  rect(ctx, 196, 306, 64, 8, '#8a6a44');
  const slats = variant === 0 ? 4 : 3;
  for (let i = 0; i < slats; i++) {
    rect(ctx, 196, 282 + i * 8, 64, 5, '#a87f52');
  }
  rect(ctx, 200, 314, 6, 26, '#6f5334');
  rect(ctx, 250, 314, 6, 26, '#6f5334');

  // Sundial — difference 6: shadow points left vs right.
  ellipse(ctx, 300, 306, 26, 10, '#d8cfc0');
  poly(ctx, [[300, 306], [292, 288], [306, 288]], '#8a6a44');
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  if (variant === 0) {
    ctx.moveTo(300, 306); ctx.lineTo(268, 300); ctx.lineTo(272, 312); ctx.closePath();
  } else {
    ctx.moveTo(300, 306); ctx.lineTo(332, 300); ctx.lineTo(328, 312); ctx.closePath();
  }
  ctx.fill();

  // Clock tower — difference 1: hands at 3:00 vs 4:30.
  rect(ctx, 396, 120, 72, 180, '#c9b8a3');
  rect(ctx, 390, 108, 84, 16, '#8a6a44');
  poly(ctx, [[390, 108], [474, 108], [432, 76]], '#a8553e');
  circle(ctx, 432, 152, 26, '#fdf6e3');
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(432, 152, 26, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, 432 + Math.cos(a) * 22, 152 + Math.sin(a) * 22,
      432 + Math.cos(a) * 25, 152 + Math.sin(a) * 25, '#5a4632', 2);
  }
  if (variant === 0) {
    line(ctx, 432, 152, 432, 134, '#333', 4); // hour hand up (12)
    line(ctx, 432, 152, 450, 152, '#333', 3); // minute hand right (3:00)
  } else {
    line(ctx, 432, 152, 442, 164, '#333', 4); // hour hand ~4:30
    line(ctx, 432, 152, 432, 170, '#333', 3); // minute hand down
  }
  circle(ctx, 432, 152, 3, '#e0483e');
  rect(ctx, 420, 240, 24, 40, '#5a4632');
  rect(ctx, 408, 200, 16, 20, '#7cc4dd');
  rect(ctx, 440, 200, 16, 20, '#7cc4dd');

  // Gears on the tower wall — difference 2: small gear present vs absent.
  gear(ctx, 372, 232, 18, 8, '#d9a441', 0.3);
  if (variant === 0) gear(ctx, 352, 196, 11, 7, '#c08452', 0.8);
  gear(ctx, 492, 200, 14, 8, '#d9a441', 0.1);

  // Topiary — difference 7: sphere vs cone.
  rect(ctx, 516, 300, 8, 40, '#6f5334');
  if (variant === 0) {
    circle(ctx, 520, 282, 22, '#3f8a4a');
    circle(ctx, 512, 274, 8, '#4fae5a');
  } else {
    poly(ctx, [[498, 302], [542, 302], [520, 258]], '#3f8a4a');
    circle(ctx, 520, 258, 5, '#4fae5a');
  }
}

const GARDEN_DIFFERENCES = [
  { id: 'clock-hands', x: 432, y: 152, r: 34, label: 'Clock hands' },
  { id: 'small-gear', x: 352, y: 196, r: 26, label: 'Small gear' },
  { id: 'fountain-jets', x: 150, y: 220, r: 32, label: 'Fountain jets' },
  { id: 'butterfly-colour', x: 250, y: 130, r: 26, label: 'Butterfly colour' },
  { id: 'flower-count', x: 100, y: 338, r: 34, label: 'Flower count' },
  { id: 'sundial-shadow', x: 300, y: 302, r: 28, label: 'Sundial shadow' },
  { id: 'topiary-shape', x: 520, y: 282, r: 30, label: 'Topiary shape' },
  { id: 'bench-slats', x: 228, y: 294, r: 30, label: 'Bench slats' },
  { id: 'fence-bird', x: 62, y: 186, r: 22, label: 'Fence bird' },
  { id: 'path-stones', x: 300, y: 368, r: 32, label: 'Path stones' },
];

// ---------- registry ----------

export const SCENES = {
  harbour: { draw: drawHarbour, differences: HARBOUR_DIFFERENCES },
  market: { draw: drawMarket, differences: MARKET_DIFFERENCES },
  garden: { draw: drawGarden, differences: GARDEN_DIFFERENCES },
};

export function getScene(key) {
  return SCENES[key];
}

export function sceneDifferenceCount(key) {
  return SCENES[key].differences.length;
}
