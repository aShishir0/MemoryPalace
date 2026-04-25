// src/audio/soundManager.js
// Uses Web Audio API (programmatic tones) + Web Speech API (TTS).
// No audio files required — everything is generated in the browser.

import { store } from '../state/store.js';

// ── Shared Audio Context ──────────────────────────────────────────────────────
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

// ── Ambient Drone ─────────────────────────────────────────────────────────────
// A quiet low sine wave that plays continuously while inside the palace.
let ambientNode = null;

export function startAmbient() {
  if (ambientNode || !store.audio.enabled) return;
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, audioCtx.currentTime); // deep low hum
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime);   // very quiet

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  ambientNode = { osc, gain };
}

export function stopAmbient() {
  if (!ambientNode) return;
  const audioCtx = getCtx();
  ambientNode.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
  setTimeout(() => {
    ambientNode.osc.stop();
    ambientNode = null;
  }, 1100);
}

// ── Short Tone Cues ───────────────────────────────────────────────────────────
// type: 'correct' | 'incorrect' | 'reveal' | 'advance'
export function playTone(type) {
  if (!store.audio.enabled) return;
  const audioCtx = getCtx();

  const configs = {
    correct: { freq: 523, duration: 0.4, gain: 0.3, type: 'sine' }, // C5 — pleasant
    incorrect: { freq: 220, duration: 0.5, gain: 0.25, type: 'sawtooth' }, // A3 — buzzy
    reveal: { freq: 440, duration: 0.2, gain: 0.2, type: 'sine' }, // A4 — soft ping
    advance: { freq: 392, duration: 0.15, gain: 0.15, type: 'sine' }  // G4 — gentle click
  };

  const c = configs[type] || configs.reveal;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = c.type;
  osc.frequency.setValueAtTime(c.freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(c.gain, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + c.duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + c.duration);
}

// ── Text-to-Speech (TTS) ──────────────────────────────────────────────────────
let speaking = false;

export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
  if (!store.audio.ttsEnabled || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel(); // interrupt any current speech
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = rate;
  utt.pitch = pitch;
  utt.onend = () => { speaking = false; };
  speaking = true;
  window.speechSynthesis.speak(utt);
}

export function stopSpeech() {
  window.speechSynthesis?.cancel();
  speaking = false;
}