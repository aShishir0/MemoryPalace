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
  mode: 'upload', // 'upload' | 'exploring' | 'teaching' | 'assessment' | 'review'
  tutorialComplete: false, // Set to true when teaching mode finishes

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
    mistakes: 0,
    attempts: {},
    currentHoveredSlot: null,
    subset: [], // Only these 5-7 objects will be tested
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

  // Lights reference
  sceneLights: null,

  // Callback set by assessmentMode.js for click events in assessment mode
  onObjectClick: null,

  // Method to start assessment — set by main.js
  startAssessmentMode: null
};