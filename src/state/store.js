// src/state/store.js

export const store = {
  // Scene references
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  meshMap: {},

  // Palace data from Claude
  palaceData: null,

  // Learning flow
  mode: 'upload', // 'upload' | 'teaching' | 'assessment' | 'review'

  // Teaching progress
  teaching: {
    currentIndex: 0,
    learnedConcepts: new Set()
  },

  // Assessment data
  assessment: {
    active: false,
    score: 0,
    total: 0,
    attempts: {},
    currentHoveredSlot: null,
    awaitingAnswer: false  // true when Claude has asked a question, waiting for user input
  },

  // Spaced repetition data (SM-2 per concept)
  // shape: { [slotName]: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: Date } }
  spacedRep: {},

  // Audio
  audio: {
    enabled: true,
    ttsEnabled: true
  },

  // Callback set by assessmentMode.js for hover events in assessment mode
  onObjectHover: null,

  // Method to start assessment — set by main.js
  startAssessmentMode: null
};