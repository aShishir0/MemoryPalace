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
  // Don't allow assessment until the tutorial is finished
  if (!store.tutorialComplete) {
    console.warn('Assessment blocked — complete the tutorial first.');
    return;
  }

  assessmentPanel.classList.add('hidden');
  store.mode             = 'assessment';
  store.assessment.active = true;
  
  // Pick a random subset of 5-7 objects for the assessment, EXCLUDING paintings
  let pool = store.palaceData.teaching_sequence.filter(slot => !slot.startsWith('painting_'));
  pool = pool.sort(() => Math.random() - 0.5);
  store.assessment.subset = pool.slice(0, Math.min(pool.length, 7));

  store.assessment.total  = store.assessment.subset.length;
  store.assessment.score  = 0;
  store.assessment.mistakes = 0;
  store.assessment.awaitingAnswer = false;
  store.assessment.currentHoveredSlot = null;

  // Load saved spaced rep data
  loadSpacedRep();
  initSpacedRep(store.palaceData);

  // Set scene objects: subset is LOCKED, others are IDLE
  Object.entries(store.meshMap).forEach(([name, mesh]) => {
    if (mesh.userData.hasContent && store.assessment.subset.includes(name)) {
      mesh.userData.revealed = false;
      updateObjectState(mesh, STATES.LOCKED);
    } else {
      updateObjectState(mesh, STATES.IDLE);
    }
  });

  // Reset lights if they were dimmed
  if (store.sceneLights && store.sceneLights.chanLight) {
    store.sceneLights.chanLight.intensity = 3.5;
  }

  // Reset UI elements
  if (submitAnswerBtn) {
    submitAnswerBtn.disabled = false;
    submitAnswerBtn.textContent = 'Submit Answer';
    submitAnswerBtn.classList.add('hidden');
  }
  if (userAnswerEl) {
    userAnswerEl.value = '';
    userAnswerEl.classList.add('hidden');
  }

  updateAssessmentProgress(0, store.assessment.total);
  setupAssessmentListeners();
}

// ── Listener Setup ────────────────────────────────────────────────────────────
function setupAssessmentListeners() {

  // ── Click callback — triggers AI Socratic question ────────────
  store.onObjectClick = async (slotName) => {
    if (store.assessment.awaitingAnswer) return;
    if (!store.assessment.subset.includes(slotName)) return; // Only test subset

    const mesh = store.meshMap[slotName];
    if (!mesh?.userData.hasContent || mesh.userData.revealed) return;

    store.assessment.awaitingAnswer     = true;
    store.assessment.activeSlot         = slotName;
    store.assessment.currentHoveredSlot = slotName;

    // Show panel and loading state
    assessmentPanel.classList.remove('hidden');
    if (aiQuestionEl) {
      aiQuestionEl.textContent = '🤔 Thinking of a question...';
      aiQuestionEl.classList.remove('hidden');
    }
    revealBtn.classList.add('hidden');

    try {
      const { concept, detail, mnemonic } = mesh.userData;
      
      // Fetch pre-generated question or generate if missing (fallback)
      let question = mesh.userData.assignedQuestion;
      if (!question) {
        question = await askConceptQuestion(concept, detail, mnemonic);
        mesh.userData.assignedQuestion = question;
      }

      if (aiQuestionEl) aiQuestionEl.textContent = `💬 ${question}`;
      
      // Show mnemonic as hint when getting the question
      const hintEl = document.getElementById('assessment-hint');
      if (hintEl && mnemonic) {
        hintEl.textContent = `💡 Hint: ${mnemonic}`;
        hintEl.classList.remove('hidden');
      }

      speak(question);

      if (userAnswerEl)  { 
        userAnswerEl.value = ''; 
        userAnswerEl.classList.remove('hidden'); 
        userAnswerEl.focus(); 
        
        // Ensure only one listener is attached
        userAnswerEl.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (submitAnswerBtn && !submitAnswerBtn.disabled) {
              submitAnswerBtn.click();
            }
          }
        };
      }
      if (submitAnswerBtn) submitAnswerBtn.classList.remove('hidden');

    } catch (error) {
      console.error("Error generating question:", error);
      if (aiQuestionEl) {
        aiQuestionEl.textContent = "Error generating question. Check your internet or API key.";
        aiQuestionEl.classList.remove('hidden');
      }
      // API failed — fall back to simple reveal button
      revealBtn.classList.remove('hidden');
      store.assessment.awaitingAnswer = false;
    }
  };

  // ── Submit typed answer → Claude evaluates ────────────────────
  if (submitAnswerBtn) {
    submitAnswerBtn.onclick = async () => {
      const slotName = store.assessment.activeSlot;
      const mesh     = store.meshMap[slotName];
      const answer   = userAnswerEl?.value?.trim();
      if (!answer) return;

      submitAnswerBtn.disabled    = true;
      submitAnswerBtn.textContent = 'Evaluating...';

      try {
        const result = await evaluateAnswer(mesh.userData.concept, mesh.userData.detail, answer);

        if (!result.correct) {
          store.assessment.mistakes++;
          dimLightsForMistake(store.assessment.mistakes);

          if (store.assessment.mistakes >= 3) {
            triggerGameOver();
            return; // Stop further processing
          }
        }

        // Show AI feedback
        let feedbackHTML = `<strong>${result.correct ? '✓ Well done!' : '✗ Not quite'}</strong><br>${result.feedback}`;
        if (result.correct) {
          feedbackHTML += `<br><br><em><strong>Answer:</strong> ${mesh.userData.concept} - ${mesh.userData.detail}</em>`;
        } else {
          feedbackHTML += `
            <br><br>
            <button id="see-answer-btn" class="secondary-btn" style="width:100%; margin-top:8px; font-size: 12px; padding: 6px;">
              View Correct Answer
            </button>
            <br><small>Try again, or click Next to skip.</small>
          `;
        }
        assessmentResult.innerHTML = feedbackHTML;
        assessmentResult.className = result.correct ? 'correct' : 'incorrect';
        assessmentResult.classList.remove('hidden');

        // Attach listener for the reveal button if it exists
        const seeAnswerBtn = document.getElementById('see-answer-btn');
        if (seeAnswerBtn) {
          seeAnswerBtn.onclick = () => {
            const answerReveal = document.createElement('div');
            answerReveal.style.marginTop = '12px';
            answerReveal.style.padding = '10px';
            answerReveal.style.borderLeft = '3px solid var(--gold)';
            answerReveal.style.background = 'rgba(212,175,55,0.1)';
            answerReveal.style.fontSize = '13px';
            answerReveal.innerHTML = `<strong>Correct Answer:</strong> ${mesh.userData.concept}<br><small>${mesh.userData.detail}</small>`;
            assessmentResult.appendChild(answerReveal);
            seeAnswerBtn.classList.add('hidden');
          };
        }

        // Audio feedback
        playTone(result.correct ? 'correct' : 'incorrect');
        speak(result.feedback);

        // Visual state
        if (result.correct) {
          updateObjectState(mesh, STATES.MASTERED);
          mesh.userData.revealed = true;
          store.assessment.score++;
        } else {
          updateObjectState(mesh, STATES.LOCKED); // Revert to locked so they can try again
          // Don't mark revealed, let them try again or click Next
        }

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
        
        const hintEl = document.getElementById('assessment-hint');
        if (hintEl) hintEl.classList.add('hidden');

        submitAnswerBtn.classList.add('hidden');
        submitAnswerBtn.disabled    = false;
        submitAnswerBtn.textContent = 'Submit Answer';
        nextObjectBtn.classList.remove('hidden');
        
        if (result.correct) {
          store.assessment.awaitingAnswer = false;
        } else {
          // Allow skipping or trying another if they want
          store.assessment.awaitingAnswer = false;
        }

        updateAssessmentProgress(store.assessment.score, store.assessment.total);
        
        if (store.assessment.score >= store.assessment.total) {
          setTimeout(() => triggerTopicComplete(), 1500);
        }

      } catch (err) {
        console.error('Evaluation failed:', err);
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
    cancelAssessment();
  };

  // ── Game Over Options ────────────────────────────────────────
  const studyAgainBtn = document.getElementById('study-again-btn');
  if (studyAgainBtn) {
    studyAgainBtn.onclick = () => {
      document.getElementById('game-over').classList.add('hidden');
      
      // Reset lights
      if (store.sceneLights) {
        if (store.sceneLights.chanLight) store.sceneLights.chanLight.intensity = 3.5;
        if (store.sceneLights.ambient) store.sceneLights.ambient.intensity = 0.25;
        if (store.sceneLights.winLight) store.sceneLights.winLight.intensity = 0.5;
      }
      
      // Restart teaching mode
      store.mode = 'teaching';
      import('./teachingMode.js').then(module => {
        module.startTeachingMode();
      });
    };
  }

  const quitBtn = document.getElementById('quit-btn');
  if (quitBtn) {
    quitBtn.onclick = () => {
      window.location.reload(); // Simple way to reset to the start
    };
  }

  const topicHomeBtn = document.getElementById('topic-home-btn');
  if (topicHomeBtn) {
    topicHomeBtn.onclick = () => {
      window.location.reload();
    };
  }
}

// ── Light Dimming & Game Over Logic ──────────────────────────────────────────
function dimLightsForMistake(mistakes) {
  if (!store.sceneLights) return;
  const { chanLight, ambient, winLight, fireLight, barLight } = store.sceneLights;
  
  if (mistakes === 1) {
    if (chanLight) chanLight.intensity = 1.5;
    if (ambient) ambient.intensity = 0.15;
    if (fireLight) fireLight.intensity = 1.5;
    if (barLight) barLight.intensity = 0.8;
  } else if (mistakes === 2) {
    if (chanLight) chanLight.intensity = 0.5;
    if (ambient) ambient.intensity = 0.05;
    if (winLight) winLight.intensity = 0.1;
    if (fireLight) fireLight.intensity = 0.8;
    if (barLight) barLight.intensity = 0.4;
  } else if (mistakes >= 3) {
    if (chanLight) chanLight.intensity = 0.1;
    if (ambient) ambient.intensity = 0;
    if (winLight) winLight.intensity = 0;
    if (fireLight) fireLight.intensity = 0.2;
    if (barLight) barLight.intensity = 0.1;
  }
}

function triggerGameOver() {
  assessmentPanel.classList.add('hidden');
  playTone('incorrect');
  
  const gameOverEl = document.getElementById('game-over');
  if (gameOverEl) gameOverEl.classList.remove('hidden');
  
  // Unlock controls to free the mouse
  if (store.controls) store.controls.unlock();
}

function triggerTopicComplete() {
  assessmentPanel.classList.add('hidden');
  playTone('correct');
  
  const topicCompleteEl = document.getElementById('topic-complete');
  if (topicCompleteEl) topicCompleteEl.classList.remove('hidden');
  
  // Unlock controls to free the mouse
  if (store.controls) store.controls.unlock();
}

/**
 * Resets the assessment UI if the player walks away or clicks next
 */
export function cancelAssessment() {
  assessmentResult.classList.add('hidden');
  nextObjectBtn.classList.add('hidden');
  revealBtn.classList.remove('hidden');
  
  const hintEl = document.getElementById('assessment-hint');
  if (hintEl) hintEl.classList.add('hidden');

  if (aiQuestionEl) aiQuestionEl.classList.add('hidden');
  if (userAnswerEl) {
    userAnswerEl.value = '';
    userAnswerEl.classList.add('hidden');
  }
  if (submitAnswerBtn) {
    submitAnswerBtn.disabled = false;
    submitAnswerBtn.textContent = 'Submit Answer';
    submitAnswerBtn.classList.add('hidden');
  }

  store.assessment.activeSlot         = null;
  store.assessment.currentHoveredSlot = null;
  store.assessment.awaitingAnswer     = false;
  assessmentPanel.classList.add('hidden');
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

  if (store.assessment.score >= store.assessment.total) {
    setTimeout(() => triggerTopicComplete(), 1500);
  }
}

// ── E-key Self-Recall Shortcut ────────────────────────────────────────────────
export function markSelfRecalled(slotName) {
  revealConcept(slotName, true);
}