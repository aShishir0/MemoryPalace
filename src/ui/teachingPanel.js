// src/ui/teachingPanel.js
// Handles showing/hiding the teaching panel UI elements
// Note: Core teaching logic lives in learning/teachingMode.js
//       This file manages only the panel visibility and display helpers

const teachingPanel = document.getElementById('teaching-panel');
const conceptTitle = document.getElementById('concept-title');
const conceptDetail = document.getElementById('concept-detail');
const mnemonicText = document.getElementById('mnemonic-text');
const teachingProgress = document.getElementById('teaching-progress');
const readyAssessmentBtn = document.getElementById('ready-assessment-btn');

export function showTeachingPanel() {
  teachingPanel.classList.remove('hidden');
}

export function hideTeachingPanel() {
  teachingPanel.classList.add('hidden');
}

export function renderConcept(conceptData, index, total) {
  conceptTitle.textContent = conceptData.concept;
  conceptDetail.textContent = conceptData.detail +
    (conceptData.teaching_context ? '\n\n' + conceptData.teaching_context : '');
  mnemonicText.textContent = conceptData.mnemonic;
  teachingProgress.textContent = `Concept ${index + 1} of ${total}`;
}

export function showReadyButton() {
  readyAssessmentBtn.classList.remove('hidden');
}

export function hideReadyButton() {
  readyAssessmentBtn.classList.add('hidden');
}