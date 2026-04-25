// src/learning/assessmentMode.js
// Handles assessment phase: AI Socratic questions, answer evaluation,
// spaced repetition updates, and scoring.

import { store }                                    from '../state/store.js';
import { updateObjectState, STATES }                from '../scene/objects.js';
import { askConceptQuestion, evaluateAnswer }        from '../api/claude.js';
import { updateCard, boolToGrade,
         initSpacedRep, saveSpacedRep,
         loadSpacedRep }                            from './spacedRepetition.js';
import { speak, playTone }                          from '../audio/soundManager.js';
import { updateAssessmentProgress }                 from '../ui/progressBar.js';

// DOM refs
const assessmentPanel  = document.getElementById('assessment-panel');
const revealBtn        = document.getElementById('reveal-btn');
const assessmentResult = document.getElementById('assessment-result');
const nextObjectBtn    = document.getElementById('next-object-btn');
const aiQuestionEl     = document.getElementById('ai-question');
const userAnswerEl     = document.getElementById('user-answer');
const submitAnswerBtn  = document.getElementById('submit-answer-btn');

// ── Entry Point ───────────────────────────────────────────────────────────────
export function startAssessmentMode() {
  assessmentPanel.classList.remove('hidden');
  store.mode             = 'assessment';
  store.assessment.active = true;
  store.assessment.total  = store.palaceData.teaching_sequence.length;
  store.assessment.score  = 0;

  // Load saved spaced rep data (for returning sessions)
  loadSpacedRep();
  initSpacedRep(store.palaceData);

  // Reset all objects to LOCKED
  Object.values(store.meshMap).forEach(mesh => {
    if (mesh.userData.hasContent) {
      mesh.userData.revealed = false;
      updateObjectState(mesh, STATES.LOCKED);
    }
  });

  setupAssessmentListeners();
}

// ── Listener Setup ────────────────────────────────────────────────────────────
function setupAssessmentListeners() {

  // ── Hover callback — triggers AI Socratic question ────────────
  // Called from main.js raycaster when in assessment mode
  store.onObjectHover = async (slotName) => {
    if (store.assessment.awaitingAnswer) return;
    const mesh = store.meshMap[slotName];
    if (!mesh?.userData.hasContent || mesh.userData.revealed) return;

    store.assessment.awaitingAnswer     = true;
    store.assessment.currentHoveredSlot = slotName;

    // Show loading state
    if (aiQuestionEl) {
      aiQuestionEl.textContent = '🤔 Thinking of a question...';
      aiQuestionEl.classList.remove('hidden');
    }
    revealBtn.classList.add('hidden');

    try {
      const { concept, detail, mnemonic } = mesh.userData;
      const question = await askConceptQuestion(concept, detail, mnemonic);

      if (aiQuestionEl) aiQuestionEl.textContent = `💬 ${question}`;
      speak(question);

      if (userAnswerEl)  { userAnswerEl.value = ''; userAnswerEl.classList.remove('hidden'); userAnswerEl.focus(); }
      if (submitAnswerBtn) submitAnswerBtn.classList.remove('hidden');

    } catch {
      // API failed — fall back to simple reveal button
      if (aiQuestionEl) aiQuestionEl.classList.add('hidden');
      revealBtn.classList.remove('hidden');
      store.assessment.awaitingAnswer = false;
    }
  };

  // ── Submit typed answer → Claude evaluates ────────────────────
  if (submitAnswerBtn) {
    submitAnswerBtn.onclick = async () => {
      const slotName = store.assessment.currentHoveredSlot;
      const mesh     = store.meshMap[slotName];
      const answer   = userAnswerEl?.value?.trim();
      if (!answer) return;

      submitAnswerBtn.disabled    = true;
      submitAnswerBtn.textContent = 'Evaluating...';

      try {
        const result = await evaluateAnswer(mesh.userData.concept, mesh.userData.detail, answer);

        // Show AI feedback
        assessmentResult.innerHTML = `
          <strong>${result.correct ? '✓ Well done!' : '✗ Not quite'}</strong><br>
          ${result.feedback}<br><br>
          <em>${mesh.userData.concept}: ${mesh.userData.detail}</em>
        `;
        assessmentResult.className = result.correct ? 'correct' : 'incorrect';
        assessmentResult.classList.remove('hidden');

        // Audio feedback
        playTone(result.correct ? 'correct' : 'incorrect');
        speak(result.feedback);

        // Visual state
        updateObjectState(mesh, result.correct ? STATES.MASTERED : STATES.LEARNING);
        mesh.userData.revealed = true;
        if (result.correct) store.assessment.score++;

        // Spaced repetition update
        const grade = boolToGrade(result.correct);
        store.spacedRep[slotName] = updateCard(
          store.spacedRep[slotName] || { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: null },
          grade
        );
        saveSpacedRep();

        // Reset question UI
        if (aiQuestionEl)  aiQuestionEl.classList.add('hidden');
        if (userAnswerEl)  userAnswerEl.classList.add('hidden');
        submitAnswerBtn.classList.add('hidden');
        submitAnswerBtn.disabled    = false;
        submitAnswerBtn.textContent = 'Submit Answer';
        nextObjectBtn.classList.remove('hidden');
        store.assessment.awaitingAnswer = false;

        updateAssessmentProgress(store.assessment.score, store.assessment.total);

      } catch {
        submitAnswerBtn.disabled    = false;
        submitAnswerBtn.textContent = 'Submit Answer';
      }
    };
  }

  // ── Fallback reveal button (skips AI question) ────────────────
  revealBtn.onclick = () => {
    const slotName = store.assessment.currentHoveredSlot;
    if (!slotName) return;
    revealConcept(slotName, false);
  };

  // ── Next object ───────────────────────────────────────────────
  nextObjectBtn.onclick = () => {
    assessmentResult.classList.add('hidden');
    nextObjectBtn.classList.add('hidden');
    revealBtn.classList.remove('hidden');
    store.assessment.currentHoveredSlot = null;
    store.assessment.awaitingAnswer     = false;
  };
}

// ── Reveal + Score a Concept ──────────────────────────────────────────────────
export function revealConcept(slotName, selfRecalled) {
  const mesh = store.meshMap[slotName];
  if (!mesh || !mesh.userData.hasContent) return;

  mesh.userData.revealed = true;

  if (selfRecalled) {
    store.assessment.score++;
    assessmentResult.innerHTML = `
      <strong>✓ Correct!</strong><br>
      ${mesh.userData.concept}: ${mesh.userData.detail}
    `;
    assessmentResult.className = 'correct';
    updateObjectState(mesh, STATES.MASTERED);
    playTone('correct');
  } else {
    assessmentResult.innerHTML = `
      <strong>Answer:</strong><br>
      ${mesh.userData.concept}: ${mesh.userData.detail}
    `;
    assessmentResult.className = 'incorrect';
    updateObjectState(mesh, STATES.LEARNING);
    playTone('incorrect');
  }

  assessmentResult.classList.remove('hidden');
  revealBtn.classList.add('hidden');
  nextObjectBtn.classList.remove('hidden');

  // Spaced repetition update
  const grade = boolToGrade(selfRecalled);
  store.spacedRep[slotName] = updateCard(
    store.spacedRep[slotName] || { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: null },
    grade
  );
  saveSpacedRep();

  updateAssessmentProgress(store.assessment.score, store.assessment.total);
}

// ── E-key Self-Recall Shortcut ────────────────────────────────────────────────
export function markSelfRecalled(slotName) {
  revealConcept(slotName, true);
}