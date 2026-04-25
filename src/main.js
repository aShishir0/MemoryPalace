// src/main.js — Final integration entry point
// Orchestrates: upload → Claude API → 3D scene → teaching → assessment → spaced rep

import { initScene } from './scene/index.js';
import { buildPalaceData } from './api/claude.js';
import { assignConceptsToMeshes, updateObjectState, STATES } from './scene/objects.js';
import { setupRaycaster } from './interaction/raycaster.js';
import { showTooltip, hideTooltip } from './interaction/tooltip.js';
import { setupUploadPanel } from './ui/uploadPanel.js';
import { startTeachingMode } from './learning/teachingMode.js';
import { startAssessmentMode, markSelfRecalled } from './learning/assessmentMode.js';
import { highlightDueObjects, loadSpacedRep } from './learning/spacedRepetition.js';
import { startAmbient, stopAmbient, stopSpeech } from './audio/soundManager.js';
import { updateHUD } from './ui/hud.js';
import { store } from './state/store.js';

const canvas = document.getElementById('three-canvas');
const loading = document.getElementById('loading');
const crosshair = document.getElementById('crosshair');
const progressBar = document.getElementById('progress-bar');
const hud = document.getElementById('hud');

// ── Upload Panel → Build Palace ──────────────────────────────────────────────
setupUploadPanel(async (sourceText) => {
  try {
    // 1. Call Claude API to build palace
    const palaceData = await buildPalaceData(sourceText);
    store.palaceData = palaceData;

    // 2. Initialize 3D scene
    const { scene, camera, renderer, controls, meshMap, addFrameCallback } =
      initScene(canvas);

    store.scene = scene;
    store.camera = camera;
    store.renderer = renderer;
    store.controls = controls;
    store.meshMap = meshMap;

    // 3. Assign concepts to meshes
    assignConceptsToMeshes(meshMap, palaceData.objects);

    // 4. Setup raycaster for hover detection
    const { update: updateRaycaster } = setupRaycaster(
      camera,
      meshMap,
      (mesh) => {
        // Update store with currently hovered slot
        store.assessment.currentHoveredSlot = mesh.userData.slotName;
        showTooltip(mesh, store.mode);

        // If in assessment mode, trigger AI question via onObjectHover callback
        if (store.mode === 'assessment' && store.onObjectHover) {
          store.onObjectHover(mesh.userData.slotName);
        }
      },
      () => {
        hideTooltip();
        store.assessment.currentHoveredSlot = null;
      }
    );
    addFrameCallback(updateRaycaster);

    // 5. Show 3D canvas and UI overlays
    loading.classList.add('hidden');
    canvas.style.display = 'block';
    crosshair.style.display = 'block';
    progressBar.classList.remove('hidden');
    hud.classList.remove('hidden');

    // 6. Update HUD with palace info
    updateHUD();

    // 7. Start teaching mode
    store.mode = 'teaching';
    startTeachingMode();

    // 8. Load spaced repetition data and highlight due objects
    loadSpacedRep();
    highlightDueObjects();

    // 9. Start ambient sound
    startAmbient();

    // 10. Click canvas to lock pointer for first-person controls
    canvas.addEventListener('click', () => controls.lock(), { once: true });

  } catch (error) {
    console.error('Palace build error:', error);
    loading.classList.add('hidden');

    let errorMessage = 'An unexpected error occurred while building your palace.';
    if (error.message.includes('401') || error.message.includes('invalid API key')) {
      errorMessage = 'API Key invalid or missing. Please check your .env file.';
    } else if (error.message.includes('429') || error.message.includes('overloaded')) {
      errorMessage = 'The AI providers are currently overloaded. Please try again in a few minutes.';
    } else if (error.message.includes('OpenRouter error')) {
      errorMessage = `AI Provider Error: ${error.message}`;
    } else if (error.message.includes('Invalid palace data')) {
      errorMessage = 'The AI returned a malformed response. Try uploading a different document or try again.';
    }

    alert(errorMessage);
  }
});

// ── Set assessment mode starter in store ──────────────────────────────────────
store.startAssessmentMode = startAssessmentMode;

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  // E = self-recall in assessment mode
  if (
    e.code === 'KeyE' &&
    store.mode === 'assessment' &&
    store.assessment.currentHoveredSlot
  ) {
    markSelfRecalled(store.assessment.currentHoveredSlot);
  }
});

// ── Audio Toggle (exposed globally for HUD button onclick) ───────────────────
window.__toggleAudio = () => {
  store.audio.enabled = !store.audio.enabled;
  store.audio.ttsEnabled = store.audio.enabled;
  if (!store.audio.enabled) {
    stopAmbient();
    stopSpeech();
  } else {
    startAmbient();
  }
};