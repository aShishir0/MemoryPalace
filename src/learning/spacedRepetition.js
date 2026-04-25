// src/learning/spacedRepetition.js
// Implementation of the SM-2 algorithm (SuperMemo 2) for long-term retention.

import { store } from '../state/store.js';
import { updateObjectState, STATES } from '../scene/objects.js';

// ── SM-2 Card Factory ─────────────────────────────────────────────────────────
export function initCard() {
  return {
    interval:    1,    // days until next review
    easeFactor:  2.5,  // difficulty multiplier
    repetitions: 0,    // successful reviews in a row
    nextReview:  null  // ISO date string
  };
}

// ── Update Card After Review ──────────────────────────────────────────────────
// grade: 0–5  (0–1 = fail, 2 = barely pass, 3 = ok, 4 = good, 5 = perfect)
export function updateCard(card, grade) {
  const c = { ...card };

  if (grade < 3) {
    // Failed — reset to beginning
    c.repetitions = 0;
    c.interval    = 1;
  } else {
    // Passed — advance interval
    if (c.repetitions === 0) c.interval = 1;
    else if (c.repetitions === 1) c.interval = 6;
    else c.interval = Math.round(c.interval * c.easeFactor);
    c.repetitions++;
  }

  // Update ease factor (clamped to minimum 1.3 to prevent intervals collapsing)
  c.easeFactor = Math.max(
    1.3,
    c.easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  );

  // Schedule next review
  const next = new Date();
  next.setDate(next.getDate() + c.interval);
  c.nextReview = next.toISOString();

  return c;
}

// ── Due Check ─────────────────────────────────────────────────────────────────
export function isDue(card) {
  if (!card.nextReview) return true; // never reviewed yet
  return new Date(card.nextReview) <= new Date();
}

// ── Grade Mapping ─────────────────────────────────────────────────────────────
// Converts a simple boolean to the 0–5 SM-2 grade scale.
export function boolToGrade(correct) {
  return correct ? 4 : 1;
}

// ── Init All Concept Cards ────────────────────────────────────────────────────
// Adds a fresh card to store.spacedRep for every concept not already tracked.
export function initSpacedRep(palaceData) {
  palaceData.teaching_sequence.forEach(slotName => {
    if (!store.spacedRep[slotName]) {
      store.spacedRep[slotName] = initCard();
    }
  });
}

// ── Persist to localStorage ───────────────────────────────────────────────────
export function saveSpacedRep() {
  try { localStorage.setItem('mp_spacedRep', JSON.stringify(store.spacedRep)); } catch {}
}

export function loadSpacedRep() {
  try {
    const saved = localStorage.getItem('mp_spacedRep');
    if (saved) store.spacedRep = JSON.parse(saved);
  } catch {}
}

// ── Highlight Due Objects ─────────────────────────────────────────────────────
// Marks mastered objects that are due for review with the REVIEW visual state
// (blue glow), so learners know what to revisit on return sessions.
export function highlightDueObjects() {
  Object.entries(store.spacedRep).forEach(([slotName, card]) => {
    const mesh = store.meshMap[slotName];
    if (!mesh) return;
    if (isDue(card) && mesh.userData.state === STATES.MASTERED) {
      updateObjectState(mesh, STATES.REVIEW);
    }
  });
}