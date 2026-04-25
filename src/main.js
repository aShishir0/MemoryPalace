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
    const { scene, camera, renderer, controls, meshMap, lights, addFrameCallback } =
      initScene(canvas);

    store.scene = scene;
    store.camera = camera;
    store.renderer = renderer;
    store.controls = controls;
    store.controls = controls;
    store.meshMap = meshMap;
    store.sceneLights = lights;

    // 3. Assign concepts to meshes
    assignConceptsToMeshes(meshMap, palaceData.objects);

    // 4. Setup raycaster for hover detection
    const raycasterInstance = setupRaycaster(
      camera,
      meshMap,
      (mesh) => {
        // Update store with currently hovered slot
        store.assessment.currentHoveredSlot = mesh.userData.slotName;
        
        // In assessment mode, test objects glow when hovered
        if (store.mode === 'assessment' && store.assessment.subset.includes(mesh.userData.slotName)) {
          if (mesh.userData.state === STATES.LOCKED) {
            updateObjectState(mesh, STATES.ASSESSMENT_HOVER);
          }
        }
        
        showTooltip(mesh, store.mode);
      },
      () => {
        hideTooltip();
        const hoveredSlot = store.assessment.currentHoveredSlot;
        store.assessment.currentHoveredSlot = null;

        // Revert hover glow
        if (store.mode === 'assessment' && hoveredSlot) {
          const mesh = store.meshMap[hoveredSlot];
          if (mesh && mesh.userData.state === STATES.ASSESSMENT_HOVER) {
            updateObjectState(mesh, STATES.LOCKED);
          }
        }
      }
    );
    addFrameCallback(raycasterInstance.update);

    // 5. Show 3D canvas and UI overlays
    loading.classList.add('hidden');
    canvas.style.display = 'block';
    crosshair.style.display = 'block';
    progressBar.classList.remove('hidden');
    hud.classList.remove('hidden');

    // 6. Update HUD with palace info
    updateHUD();

    // 7. Tutorial Trigger Logic
    store.mode = 'exploring';

    canvas.addEventListener('mousedown', () => {
      const interactedMesh = raycasterInstance.handleInteraction();
      if (!interactedMesh) return;

      const slotName = interactedMesh.userData.slotName;

      // Exploring mode -> Tutorial start
      if (store.mode === 'exploring' && slotName === 'fireplace' && !store.tutorialComplete) {
        console.log('Fireplace interacted! Starting tutorial...');
        store.mode = 'teaching';
        startTeachingMode();
      }

      // Assessment mode -> Click to test
      if (store.mode === 'assessment' && store.onObjectClick) {
        store.onObjectClick(slotName);
      }
    });

    // 8. Load spaced repetition data and highlight due objects
    loadSpacedRep();
    highlightDueObjects();

    // 9. Start ambient sound
    startAmbient();

    // 10. Click canvas to lock pointer for first-person controls
    canvas.addEventListener('click', () => {
      if (!controls.isLocked) {
        controls.lock();
      }
    });

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
  // Ignore shortcuts if the user is typing in an input or textarea
  const tagName = e.target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return;

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