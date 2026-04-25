// src/main.js — Final integration entry point
// Orchestrates: upload → Claude API → 3D scene → teaching → assessment → spaced rep

import { initScene } from './scene/index.js';
import { buildPalaceData, describeImage } from './api/claude.js';
import { assignConceptsToMeshes, updateObjectState, STATES } from './scene/objects.js';
import { setupRaycaster } from './interaction/raycaster.js';
import { showTooltip, hideTooltip } from './interaction/tooltip.js';
import { setupUploadPanel } from './ui/uploadPanel.js';
import { startTeachingMode } from './learning/teachingMode.js';
import { startAssessmentMode, markSelfRecalled, cancelAssessment } from './learning/assessmentMode.js';
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
setupUploadPanel(async (source) => {
  try {
    // source is now { text, images }
    const { text, images } = source;
    
    // 1. Call LLM to build palace (now fast — text truncated, infers images)
    const palaceData = await buildPalaceData(text, images.length);
    store.palaceData = palaceData;

    // 3. Initialize 3D scene — only create painting frames for actual images
    const { scene, camera, renderer, controls, meshMap, lights, addFrameCallback } =
      initScene(canvas, images.length);

    store.scene = scene;
    store.camera = camera;
    store.renderer = renderer;
    store.controls = controls;
    store.meshMap = meshMap;
    store.sceneLights = lights;

    // 3. Assign concepts to meshes, passing image data
    assignConceptsToMeshes(meshMap, palaceData.objects, images);

    // 4. Setup raycaster for hover detection
    const raycasterInstance = setupRaycaster(
      camera,
      meshMap,
      (mesh, distance) => {
        const MAX_INTERACTION_DIST = 4; // Reduced distance for glow
        const isNear = distance < MAX_INTERACTION_DIST;
        
        // Update store with currently hovered slot (only if near)
        if (isNear) {
          store.assessment.currentHoveredSlot = mesh.userData.slotName;
          showTooltip(mesh, store.mode);
        } else {
          hideTooltip();
          store.assessment.currentHoveredSlot = null;
        }
        
        // In assessment mode, test objects glow when hovered AND near
        if (store.mode === 'assessment' && store.assessment.subset.includes(mesh.userData.slotName)) {
          if (isNear && mesh.userData.state === STATES.LOCKED) {
            updateObjectState(mesh, STATES.ASSESSMENT_HOVER);
          } else if (!isNear && mesh.userData.state === STATES.ASSESSMENT_HOVER) {
            updateObjectState(mesh, STATES.LOCKED);
          }
        }
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
    addFrameCallback((delta) => {
      raycasterInstance.update();
      
      // Auto-close assessment if user walks away
      const panel = document.getElementById('assessment-panel');
      if (panel && !panel.classList.contains('hidden')) {
        const activeSlot = store.assessment.activeSlot;
        if (activeSlot) {
          const mesh = store.meshMap[activeSlot];
          if (mesh) {
            const dist = camera.position.distanceTo(mesh.position);
            if (dist > 6) { // Reduced threshold for better responsiveness
              cancelAssessment();
            }
          }
        }
      }
    });

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
      const hit = raycasterInstance.handleInteraction();
      if (!hit) return;

      const slotName = hit.mesh.userData.slotName;
      const MAX_CLICK_DIST = 5; // Allow clicking from slightly further than glow but still close

      // Painting click → ALWAYS show image info modal, regardless of mode
      if (slotName.startsWith('painting_') && hit.mesh.userData.hasContent) {
        const ud    = hit.mesh.userData;
        const modal = document.getElementById('image-info-modal');

        // Use title/description (new vision format) with concept/detail fallback
        document.getElementById('image-info-title').textContent    = ud.title       || ud.concept   || 'Figure';
        document.getElementById('image-info-detail').textContent   = ud.description || ud.detail    || '';
        document.getElementById('image-info-mnemonic').textContent = ud.mnemonic    || '';

        // Show extracted image if available
        const imgEl = document.getElementById('image-info-img');
        if (ud.imageUrl) {
          imgEl.src = ud.imageUrl;
          imgEl.style.display = 'block';
        } else {
          imgEl.src = '';
          imgEl.style.display = 'none';
        }

        modal.classList.remove('hidden');
        if (controls.isLocked) controls.unlock();
        return; // Prevent other click handlers (like assessment) from firing
      }

      // Exploring mode -> Tutorial start
      if (store.mode === 'exploring') {
        if (slotName === 'fireplace' && !store.tutorialComplete) {
          console.log('Fireplace interacted! Starting tutorial...');
          store.mode = 'teaching';
          startTeachingMode();
          return;
        }
      }

      // Assessment mode -> Click to test (requires being near)
      if (store.mode === 'assessment' && store.onObjectClick) {
        if (hit.distance <= MAX_CLICK_DIST) {
          store.onObjectClick(slotName);
        } else {
          // Tell user to get closer
          const tooltip = document.getElementById('tooltip');
          tooltip.innerHTML = 'Get closer to interact';
          tooltip.classList.remove('hidden');
          setTimeout(() => tooltip.classList.add('hidden'), 1500);
        }
      }
    });

    // 8. Load spaced repetition data and highlight due objects
    loadSpacedRep();
    highlightDueObjects();

    // 9. Start ambient sound
    startAmbient();

    // 10. Click canvas to lock pointer for first-person controls
    canvas.addEventListener('click', () => {
      if (!controls.isLocked && store.mode !== 'teaching' && store.mode !== 'assessment_result') {
        controls.lock();
      }
    });

  } catch (error) {
    console.error('Palace build error:', error);
    loading.classList.add('hidden');

    let errorMessage = `Build Error: ${error.message}`;
    
    if (error.message.includes('401') || error.message.includes('invalid API key')) {
      errorMessage = 'API Key invalid or missing. Please check your .env file.';
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      errorMessage = `Model Not Found: The AI model requested was not found in your Ollama installation. Please check the model name in claude.js or run 'ollama pull' for the correct model.`;
    } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Connection Failed: Could not connect to Ollama. Make sure Ollama is running at http://localhost:11434';
    } else if (error.message.includes('429') || error.message.includes('overloaded')) {
      errorMessage = 'The AI providers are currently overloaded. Please try again in a few minutes.';
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

// ── Image Info Modal Close ───────────────────────────────────────────────────
document.getElementById('close-image-info')?.addEventListener('click', () => {
  document.getElementById('image-info-modal').classList.add('hidden');
  // Re-lock controls if we are still exploring
  if (store.controls && store.mode === 'exploring') {
    store.controls.lock();
  }
});