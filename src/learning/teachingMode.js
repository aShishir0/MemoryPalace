// src/learning/teachingMode.js
// Manages the teaching phase: walks the user through concepts in sequence,
// updates object visual states, and coordinates with sound/TTS.

import { store }                          from '../state/store.js';
import { updateObjectState, STATES }      from '../scene/objects.js';
import { speak, playTone, startAmbient }  from '../audio/soundManager.js';
import { updateTeachingProgress }         from '../ui/progressBar.js';
import { renderConcept, showReadyButton } from '../ui/teachingPanel.js';

// DOM refs
const teachingPanel      = document.getElementById('teaching-panel');
const prevBtn            = document.getElementById('prev-concept-btn');
const nextBtn            = document.getElementById('next-concept-btn');
const markLearnedBtn     = document.getElementById('mark-learned-btn');
const readyAssessmentBtn = document.getElementById('ready-assessment-btn');

let currentIndex = 0;
export const learnedConcepts = new Set();

// ── Entry Point ───────────────────────────────────────────────────────────────
export function startTeachingMode() {
  teachingPanel.classList.remove('hidden');
  currentIndex = 0;
  learnedConcepts.clear();

  // Sanitize teaching_sequence: keep only slots that exist in BOTH meshMap and palaceData.objects
  store.palaceData.teaching_sequence = store.palaceData.teaching_sequence.filter(
    slot => store.meshMap[slot] && store.palaceData.objects[slot]
  );

  if (store.palaceData.teaching_sequence.length === 0) {
    console.error('No valid teaching slots found — LLM may have returned wrong object names.');
    teachingPanel.classList.add('hidden');
    return;
  }

  // Start ambient palace sound
  startAmbient();

  // Light up the first object
  const firstSlot = store.palaceData.teaching_sequence[0];
  const firstMesh = store.meshMap[firstSlot];
  if (firstMesh) updateObjectState(firstMesh, STATES.LEARNING);

  showConcept(currentIndex);
  setupEventListeners();
}

// ── Show Concept at Index ─────────────────────────────────────────────────────
function showConcept(index) {
  const seq      = store.palaceData.teaching_sequence;
  const slotName = seq[index];
  const data     = store.palaceData.objects[slotName];
  if (!data) return;

  // Update card UI via teachingPanel helper
  renderConcept(data, index, seq.length);

  // Button states
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === seq.length - 1;

  // Object visual state
  const mesh = store.meshMap[slotName];
  if (mesh && mesh.userData.state !== STATES.MASTERED) {
    updateObjectState(mesh, STATES.LEARNING);
  }

  // Show assessment button if all learned
  if (learnedConcepts.size === seq.length) showReadyButton();

  // TTS — read concept name + mnemonic aloud
  speak(`${data.concept}. ${data.mnemonic}`);
}

// ── Event Listeners ───────────────────────────────────────────────────────────
function setupEventListeners() {
  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      playTone('advance');
      showConcept(currentIndex);
    }
  };

  nextBtn.onclick = () => {
    if (currentIndex < store.palaceData.teaching_sequence.length - 1) {
      currentIndex++;
      playTone('advance');
      showConcept(currentIndex);
    }
  };

  markLearnedBtn.onclick = () => {
    const slotName = store.palaceData.teaching_sequence[currentIndex];
    learnedConcepts.add(slotName);
    playTone('correct');
    updateTeachingProgress(learnedConcepts.size, store.palaceData.teaching_sequence.length);

    if (currentIndex < store.palaceData.teaching_sequence.length - 1) {
      currentIndex++;
      showConcept(currentIndex);
    } else {
      // All concepts shown — reveal the assessment button
      showReadyButton();
    }
  };

  readyAssessmentBtn.onclick = () => {
    endTeachingMode();
    store.startAssessmentMode();
  };
}

// ── End Teaching Mode ─────────────────────────────────────────────────────────
function endTeachingMode() {
  teachingPanel.classList.add('hidden');
  store.tutorialComplete = true;

  // Reset all objects to LOCKED so the player has to recall them in assessment
  store.palaceData.teaching_sequence.forEach(slotName => {
    updateObjectState(store.meshMap[slotName], STATES.LOCKED);
  });
}