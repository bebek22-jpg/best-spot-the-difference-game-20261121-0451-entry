// Twinlight — every sound is synthesised with WebAudio oscillators.
// No audio files, no network: the whole soundtrack is made in code.

let ctx = null;
let muted = false;
let master = null;

function ensureContext() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio() {
  ensureContext();
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.value = muted ? 0 : 0.5;
}

export function isMuted() {
  return muted;
}

function tone({ frequency, endFrequency, type, startAt, duration, volume }) {
  const audio = ensureContext();
  if (!audio || muted) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now + startAt);
  if (endFrequency) osc.frequency.exponentialRampToValueAtTime(endFrequency, now + startAt + duration);
  gain.gain.setValueAtTime(0, now + startAt);
  gain.gain.linearRampToValueAtTime(volume, now + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + startAt + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now + startAt);
  osc.stop(now + startAt + duration + 0.05);
}

function chimeNotes(notes, type, duration, volume) {
  notes.forEach((frequency, i) => {
    tone({ frequency, type, startAt: i * 0.07, duration, volume });
  });
}

// A bright rising triad: the satisfying "found it" ping.
export function playFound(comboStep) {
  const base = 660 * Math.pow(1.059463, Math.min(comboStep, 8));
  chimeNotes([base, base * 1.25, base * 1.5], 'sine', 0.34, 0.22);
  tone({ frequency: base * 2, type: 'triangle', startAt: 0.1, duration: 0.28, volume: 0.1 });
}

// A soft low buzz for a miss — a nudge, not a punishment.
export function playWrong() {
  tone({ frequency: 180, endFrequency: 120, type: 'sawtooth', startAt: 0, duration: 0.22, volume: 0.12 });
  tone({ frequency: 90, type: 'sine', startAt: 0, duration: 0.25, volume: 0.14 });
}

// A gentle two-note sparkle when a hint lights up.
export function playHint() {
  chimeNotes([880, 1174.66], 'triangle', 0.3, 0.16);
}

export function playClick() {
  tone({ frequency: 520, type: 'sine', startAt: 0, duration: 0.08, volume: 0.12 });
}

// A short tick when the clock runs low.
export function playTick() {
  tone({ frequency: 1200, type: 'square', startAt: 0, duration: 0.05, volume: 0.06 });
}

// Level-clear fanfare: a rising major arpeggio.
export function playLevelClear() {
  chimeNotes([523.25, 659.25, 783.99, 1046.5], 'triangle', 0.42, 0.2);
}

// Full-victory fanfare with a warm low root underneath.
export function playVictory() {
  chimeNotes([523.25, 659.25, 783.99, 1046.5, 1318.51], 'triangle', 0.5, 0.2);
  tone({ frequency: 130.81, type: 'sine', startAt: 0, duration: 1.1, volume: 0.16 });
}

export function playTimeUp() {
  chimeNotes([392, 329.63, 261.63], 'sine', 0.5, 0.16);
}
