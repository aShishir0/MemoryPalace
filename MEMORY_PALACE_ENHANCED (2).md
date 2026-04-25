# 🏛️ Memory Palace Enhanced — Complete Build Guide
### AI-Powered 3D Spatial Learning with PDF Support | Teaching-First Flow | 4-Member Team

---

## 📌 Project Overview

**Memory Palace Enhanced** transforms PDFs and notes into a navigable 3D learning environment. It uses the **Method of Loci** technique — automated by AI — but with a structured learning flow:

**Phase 1: Teaching Mode** → AI teaches you each concept with context and mnemonics
**Phase 2: Assessment Mode** → Test your recall by navigating the palace

### Key Improvements Over Base Version
- ✅ **PDF Upload Support** — Direct PDF parsing with text + image extraction
- ✅ **Teaching-First Flow** — Systematic concept introduction before testing
- ✅ **Progress Tracking** — Visual indicators of learning progress
- ✅ **Enhanced Pedagogy** — Spaced presentation → active recall → assessment
- ✅ **Sound + Voice Narration** — Ambient soundscape, TTS reads mnemonics aloud, audio cues for quiz feedback
- ✅ **Adaptive AI Tutor + Spaced Repetition** — Claude asks Socratic questions, SM-2 algorithm schedules reviews, objects glow when due

### Tech Stack
| Layer | Technology |
|---|---|
| 3D Rendering | Three.js (r155+) |
| AI Brain | Claude API (`claude-sonnet-4-20250514`) |
| PDF Parsing | PDF.js (Mozilla) |
| Controls | PointerLockControls (Three.js addon) |
| Build Tool | Vite (vanilla JS) |
| Audio | Web Audio API (sound cues) + Web Speech API (TTS, browser built-in) |
| Spaced Rep | SM-2 algorithm (vanilla JS, no library) |
| State | Enhanced state management with learning phases + review scheduling |

### Enhanced Flow
```
User uploads PDF or pastes notes
  ↓
Claude extracts concepts + generates teaching sequence
  ↓
TEACHING MODE: User walks through room, concepts reveal one-by-one with full context
  ↓
User indicates "Ready for Assessment"
  ↓
ASSESSMENT MODE: Concepts hidden, user must recall before reveal
  ↓
Score + spaced repetition recommendations
```

---

## 👥 Enhanced Team Division

| Member | Part | Focus | Est. Time |
|---|---|---|---|
| Member 1 | **Part 1** | 3D room + navigation + visual states (mastered/learning/locked/review) | 3–3.5h |
| Member 2 | **Part 2** | PDF parsing + Claude API + teaching sequence + AI question generation | 3–3.5h |
| Member 3 | **Part 3** | Teaching mode UI + progressive reveal + interaction + Sound/TTS system | 3–3.5h |
| Member 4 | **Part 4** | Assessment mode + scoring + spaced repetition + phase transitions + integration | 3.5–4h |

---

## 🗂️ Enhanced File Structure

```
memory-palace-enhanced/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                  ← App entry (M4 integrates)
│   ├── api/
│   │   ├── claude.js            ← Claude API calls (Member 2)
│   │   └── pdfParser.js         ← PDF.js integration (Member 2)
│   ├── scene/
│   │   ├── room.js              ← Room geometry (Member 1)
│   │   ├── objects.js           ← Furniture meshes with states (Member 1)
│   │   ├── lighting.js          ← Dynamic lighting (Member 1)
│   │   └── controls.js          ← WASD controls (Member 1)
│   ├── interaction/
│   │   ├── raycaster.js         ← Hover detection (Member 3)
│   │   └── tooltip.js           ← Context-aware tooltips (Member 3)
│   ├── learning/
│   │   ├── teachingMode.js      ← Teaching sequence logic (Member 3)
│   │   ├── assessmentMode.js    ← Assessment/quiz logic + AI questions (Member 4)
│   │   └── spacedRepetition.js  ← SM-2 algorithm + review scheduling (Member 4)
│   ├── audio/
│   │   └── soundManager.js      ← Ambient sound + TTS + sound cues (Member 3)
│   ├── state/
│   │   └── store.js             ← Enhanced state with phases (Member 4)
│   └── ui/
│       ├── uploadPanel.js       ← PDF/text upload UI (Member 2)
│       ├── teachingPanel.js     ← Teaching mode UI (Member 3)
│       ├── progressBar.js       ← Learning progress (Member 3)
│       └── hud.js               ← Enhanced HUD (Member 4)
├── public/
│   ├── textures/                ← Materials
│   └── sounds/                  ← Optional audio files
└── style.css
```

---

# 🔨 PART 1 — Enhanced 3D Room with Visual States
### Owner: Member 1 | Time: ~3.5 hours

---

## New Concepts

### Object Visual States
Each object now has 3 visual states:
1. **Locked** (🔒) — Gray/faded, not yet taught
2. **Learning** (📖) — Normal color, currently being taught
3. **Mastered** (✅) — Golden glow, successfully recalled

### Progressive Reveal System
Objects start locked and unlock as teaching progresses.

---

## Step 1 — Enhanced Package Setup (30 min)

> **Note:** Folder structure was created manually using the PowerShell command below, then pushed to GitHub. If you cloned from GitHub, all files are already there — skip the folder creation.
>
> If starting from scratch in a new machine, run this in PowerShell from your desired parent folder:
> ```powershell
> mkdir memory-palace-enhanced; cd memory-palace-enhanced; mkdir src/api, src/scene, src/interaction, src/learning, src/audio, src/state, src/ui, public/textures, public/sounds -Force; New-Item index.html, package.json, vite.config.js, style.css, src/main.js, src/api/claude.js, src/api/pdfParser.js, src/scene/index.js, src/scene/room.js, src/scene/objects.js, src/scene/lighting.js, src/scene/controls.js, src/interaction/raycaster.js, src/interaction/tooltip.js, src/learning/teachingMode.js, src/learning/assessmentMode.js, src/learning/spacedRepetition.js, src/audio/soundManager.js, src/state/store.js, src/ui/uploadPanel.js, src/ui/teachingPanel.js, src/ui/progressBar.js, src/ui/hud.js -ItemType File
> ```

After cloning (or after manual setup), install dependencies:
```bash
npm install three pdfjs-dist howler
npm install --save-dev vite
```

`package.json`:
```json
{
  "name": "memory-palace-enhanced",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.170.0",
    "pdfjs-dist": "^4.0.379",
    "howler": "^2.2.4"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

---

## Step 2 — Enhanced HTML Structure (20 min)

`index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Memory Palace Enhanced</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <!-- Upload Panel -->
  <div id="upload-panel">
    <h1>🏛️ Memory Palace Enhanced</h1>
    <p class="subtitle">Transform your study materials into an immersive 3D learning experience</p>
    
    <div class="upload-options">
      <div class="upload-box" id="pdf-upload-box">
        <div class="upload-icon">📄</div>
        <h3>Upload PDF</h3>
        <input type="file" id="pdf-input" accept=".pdf" hidden />
        <button class="upload-btn" onclick="document.getElementById('pdf-input').click()">
          Choose PDF
        </button>
        <p class="file-name" id="pdf-file-name"></p>
      </div>
      
      <div class="divider">OR</div>
      
      <div class="upload-box">
        <div class="upload-icon">📝</div>
        <h3>Paste Notes</h3>
        <textarea id="notes-input" placeholder="Paste your study notes here..."></textarea>
      </div>
    </div>
    
    <button id="build-btn" class="primary-btn" disabled>Build My Learning Palace</button>
  </div>

  <!-- Teaching Mode Panel -->
  <div id="teaching-panel" class="hidden">
    <div class="teaching-card">
      <div class="teaching-header">
        <span class="mode-badge">📖 Teaching Mode</span>
        <span class="progress-text" id="teaching-progress">Concept 1 of 10</span>
      </div>
      
      <div class="concept-content">
        <h2 id="concept-title">Loading...</h2>
        <div id="concept-detail" class="detail-text"></div>
        <div id="concept-mnemonic" class="mnemonic-box">
          <strong>💡 Memory Tip:</strong>
          <p id="mnemonic-text"></p>
        </div>
      </div>
      
      <div class="teaching-controls">
        <button id="prev-concept-btn" class="secondary-btn">← Previous</button>
        <button id="mark-learned-btn" class="primary-btn">✓ I've Got This</button>
        <button id="next-concept-btn" class="primary-btn">Next →</button>
      </div>
      
      <button id="ready-assessment-btn" class="assessment-ready-btn hidden">
        🎯 I'm Ready for Assessment
      </button>
    </div>
  </div>

  <!-- Assessment Mode Panel -->
  <div id="assessment-panel" class="hidden">
    <div class="assessment-card">
      <h3>Try to recall what this object represents</h3>
      <p class="hint-text">Walk around and hover over objects to test yourself</p>
      <button id="reveal-btn" class="reveal-btn">Reveal Answer</button>
      <div id="assessment-result" class="hidden"></div>
      <button id="next-object-btn" class="hidden">Next Object →</button>
    </div>
  </div>

  <!-- 3D Canvas -->
  <canvas id="three-canvas" style="display:none;"></canvas>

  <!-- UI Overlays -->
  <div id="tooltip" class="tooltip hidden"></div>
  <div id="hud" class="hud hidden"></div>
  <div id="progress-bar" class="progress-bar hidden">
    <div class="progress-fill" id="progress-fill"></div>
    <span class="progress-label" id="progress-label">0/10 Mastered</span>
  </div>
  <div id="crosshair">+</div>
  <div id="loading" class="hidden">
    <div class="loading-spinner"></div>
    <p>🤖 AI is building your learning palace...</p>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## Step 3 — Enhanced Styling (30 min)

`style.css`:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  color: #f0e6d3;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* Upload Panel */
#upload-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px;
  gap: 30px;
}

#upload-panel h1 {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #c9a84c 0%, #f4d03f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.upload-options {
  display: flex;
  gap: 30px;
  align-items: center;
  width: 100%;
  max-width: 900px;
}

.upload-box {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border: 2px dashed rgba(201,168,76,0.3);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-box:hover {
  border-color: rgba(201,168,76,0.6);
  background: rgba(255,255,255,0.05);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-box h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #f0e6d3;
}

.upload-btn, .primary-btn {
  background: #c9a84c;
  color: #0a0a0f;
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.upload-btn:hover, .primary-btn:hover {
  background: #f4d03f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201,168,76,0.3);
}

.primary-btn:disabled {
  background: #555;
  cursor: not-allowed;
  transform: none;
}

.file-name {
  margin-top: 12px;
  font-size: 13px;
  color: #c9a84c;
  min-height: 20px;
}

#notes-input {
  width: 100%;
  height: 200px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(201,168,76,0.2);
  color: #f0e6d3;
  padding: 16px;
  font-size: 14px;
  border-radius: 8px;
  resize: none;
  font-family: 'Courier New', monospace;
}

.divider {
  font-size: 18px;
  color: #666;
  font-weight: 600;
}

/* Teaching Panel */
#teaching-panel {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: 600px;
  width: 90%;
}

.teaching-card {
  background: rgba(10,10,20,0.95);
  border: 2px solid #c9a84c;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.teaching-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(201,168,76,0.3);
}

.mode-badge {
  background: rgba(201,168,76,0.2);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.progress-text {
  font-size: 13px;
  color: #999;
}

.concept-content h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #c9a84c;
}

.detail-text {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
  color: #ddd;
}

.mnemonic-box {
  background: rgba(201,168,76,0.1);
  border-left: 3px solid #c9a84c;
  padding: 14px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.mnemonic-box strong {
  display: block;
  margin-bottom: 6px;
  color: #c9a84c;
}

.mnemonic-box p {
  font-size: 14px;
  line-height: 1.5;
  color: #eee;
}

.teaching-controls {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.secondary-btn {
  background: rgba(255,255,255,0.1);
  color: #f0e6d3;
  border: 1px solid rgba(201,168,76,0.3);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: #c9a84c;
}

.assessment-ready-btn {
  width: 100%;
  margin-top: 16px;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.assessment-ready-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74,222,128,0.4);
}

/* Assessment Panel */
#assessment-panel {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: 500px;
  width: 90%;
}

.assessment-card {
  background: rgba(10,10,20,0.95);
  border: 2px solid #8b5cf6;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.assessment-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #a78bfa;
}

.hint-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.reveal-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.reveal-btn:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

#assessment-result {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
}

#assessment-result.correct {
  background: rgba(74,222,128,0.2);
  border: 1px solid #22c55e;
  color: #4ade80;
}

#assessment-result.incorrect {
  background: rgba(239,68,68,0.2);
  border: 1px solid #dc2626;
  color: #f87171;
}

/* Progress Bar */
.progress-bar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a84c 0%, #f4d03f 100%);
  transition: width 0.5s ease;
  width: 0%;
}

.progress-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

/* 3D Canvas */
#three-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Tooltip */
.tooltip {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10,10,20,0.95);
  border: 2px solid #c9a84c;
  padding: 20px 28px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
  pointer-events: none;
  backdrop-filter: blur(10px);
}

.tooltip.hidden { display: none; }

.tooltip h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #c9a84c;
}

.tooltip p {
  font-size: 14px;
  line-height: 1.5;
  color: #ddd;
}

/* HUD */
.hud {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.7);
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.8;
  border: 1px solid rgba(201,168,76,0.3);
}

.hud.hidden { display: none; }

/* Crosshair */
#crosshair {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255,255,255,0.4);
  font-size: 20px;
  pointer-events: none;
  display: none;
}

/* Loading */
#loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  text-align: center;
  background: rgba(0,0,0,0.9);
  padding: 40px 60px;
  border-radius: 16px;
  border: 2px solid #c9a84c;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(201,168,76,0.2);
  border-top-color: #c9a84c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

#loading p {
  font-size: 16px;
  color: #c9a84c;
}

.hidden { display: none !important; }
```

---

## Step 4 — Enhanced Object System (`src/scene/objects.js`) (60 min)

Objects now have visual states that change based on learning progress.

```javascript
// src/scene/objects.js
import * as THREE from 'three';

const OBJECT_SLOTS = [
  'sofa', 'armchair', 'bookshelf', 'desk',
  'painting_1', 'painting_2', 'painting_3',
  'window', 'lamp', 'plant', 'globe', 'clock'
];

// Object visual states
const STATES = {
  LOCKED: 'locked',      // Not yet taught - gray/faded
  LEARNING: 'learning',  // Currently being taught - normal
  MASTERED: 'mastered',  // Successfully recalled - golden glow
  REVIEW: 'review'       // Due for spaced repetition review - pulsing blue glow
};

export function createObjects(scene) {
  const meshMap = {};
  
  // Define object positions and sizes
  const objectDefs = [
    { name: 'sofa', pos: [-6, 0, -8], size: [3, 1.2, 1.5], color: 0x8b4513 },
    { name: 'armchair', pos: [6, 0, -8], size: [1.5, 1.5, 1.5], color: 0xa0522d },
    { name: 'bookshelf', pos: [-9, 0, 0], size: [0.5, 4, 3], color: 0x654321 },
    { name: 'desk', pos: [7, 0, 3], size: [2, 1.5, 1.2], color: 0x8b7355 },
    { name: 'painting_1', pos: [0, 3, -9.8], size: [2, 1.5, 0.1], color: 0xd4af37 },
    { name: 'painting_2', pos: [-5, 3, -9.8], size: [1.5, 2, 0.1], color: 0xcd7f32 },
    { name: 'painting_3', pos: [5, 3, -9.8], size: [1.5, 2, 0.1], color: 0xb8860b },
    { name: 'window', pos: [9.8, 3, -3], size: [0.1, 2, 1.5], color: 0x87ceeb },
    { name: 'lamp', pos: [6.5, 2.5, 3], size: [0.3, 1, 0.3], color: 0xffd700 },
    { name: 'plant', pos: [-7, 0, 5], size: [0.6, 1.2, 0.6], color: 0x228b22 },
    { name: 'globe', pos: [7, 1.5, 3.5], size: [0.5, 0.5, 0.5], color: 0x4169e1 },
    { name: 'clock', pos: [0, 5, 9.8], size: [1, 1, 0.1], color: 0xcd853f }
  ];
  
  objectDefs.forEach(def => {
    const geometry = new THREE.BoxGeometry(...def.size);
    const material = new THREE.MeshPhongMaterial({
      color: def.color,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(def.pos[0], def.pos[1] + def.size[1]/2 + 0.01, def.pos[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Initialize userData
    mesh.userData = {
      slotName: def.name,
      baseColor: def.color,
      state: STATES.LOCKED,
      hasContent: false
    };
    
    // Start in locked state
    updateObjectState(mesh, STATES.LOCKED);
    
    scene.add(mesh);
    meshMap[def.name] = mesh;
  });
  
  return meshMap;
}

// Update visual appearance based on state
export function updateObjectState(mesh, newState) {
  mesh.userData.state = newState;
  const material = mesh.material;
  const baseColor = new THREE.Color(mesh.userData.baseColor);
  
  switch(newState) {
    case STATES.LOCKED:
      // Faded gray
      material.color.setHex(0x444444);
      material.emissive.setHex(0x000000);
      material.emissiveIntensity = 0;
      material.opacity = 0.5;
      material.transparent = true;
      break;
      
    case STATES.LEARNING:
      // Normal color
      material.color.copy(baseColor);
      material.emissive.setHex(0x222222);
      material.emissiveIntensity = 0.1;
      material.opacity = 1;
      material.transparent = false;
      break;
      
    case STATES.MASTERED:
      // Golden glow
      material.color.copy(baseColor);
      material.emissive.setHex(0xffd700);
      material.emissiveIntensity = 0.3;
      material.opacity = 1;
      material.transparent = false;
      break;
      
    case STATES.REVIEW:
      // Pulsing blue glow — signals "time to review this"
      material.color.copy(baseColor);
      material.emissive.setHex(0x4488ff);
      material.emissiveIntensity = 0.4;
      material.opacity = 1;
      material.transparent = false;
      // Note: animate pulse in the animation loop via store.reviewPulse
      break;
  }
}

// Assign concepts from Claude API response
export function assignConceptsToMeshes(meshMap, conceptsObj) {
  Object.entries(conceptsObj).forEach(([slotName, data]) => {
    const mesh = meshMap[slotName];
    if (!mesh) return;
    
    mesh.userData.hasContent = true;
    mesh.userData.concept = data.concept;
    mesh.userData.detail = data.detail;
    mesh.userData.mnemonic = data.mnemonic;
    mesh.userData.theme = data.theme;
    mesh.userData.importance = data.importance;
  });
}

export { STATES };
export { OBJECT_SLOTS };
```

---

## Step 5 — Enhanced Room and Lighting (same as base, add to scene/room.js and scene/lighting.js)

*(Keep the same room geometry from the original guide, but add slightly warmer ambient lighting)*

`src/scene/lighting.js`:
```javascript
// src/scene/lighting.js
import * as THREE from 'three';

export function setupLighting(scene) {
  // Warm ambient light
  const ambient = new THREE.AmbientLight(0xffe4b5, 0.5);
  scene.add(ambient);
  
  // Main overhead light
  const mainLight = new THREE.PointLight(0xffd700, 0.8, 30);
  mainLight.position.set(0, 6, 0);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);
  
  // Accent lights in corners
  const accentLight1 = new THREE.PointLight(0xffcc88, 0.4, 15);
  accentLight1.position.set(-8, 3, -8);
  scene.add(accentLight1);
  
  const accentLight2 = new THREE.PointLight(0xffcc88, 0.4, 15);
  accentLight2.position.set(8, 3, 8);
  scene.add(accentLight2);
  
  return { ambient, mainLight, accentLight1, accentLight2 };
}
```

---

# 🔨 PART 2 — PDF Parsing & Enhanced Claude API
### Owner: Member 2 | Time: ~3.5 hours

---

## New Concepts

### PDF.js Integration
Parse PDFs to extract text and images. Handle multi-page documents.

### Teaching Sequence Generation
Claude now generates not just concepts, but an optimal teaching order.

---

## Step 1 — PDF Parser (`src/api/pdfParser.js`) (90 min)

```javascript
// src/api/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const images = [];
  
  // Extract text from all pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
    
    // Optional: Extract images (advanced)
    // const ops = await page.getOperatorList();
    // ... image extraction logic ...
  }
  
  return {
    text: fullText.trim(),
    pageCount: pdf.numPages,
    images: images
  };
}

// Chunk text into manageable sections
export function chunkText(text, maxChunkSize = 8000) {
  // Simple chunking by paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const chunks = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += '\n\n' + para;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  
  return chunks;
}
```

---

## Step 2 — Enhanced Claude API (`src/api/claude.js`) (90 min)

```javascript
// src/api/claude.js

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

// Enhanced prompt for teaching sequence generation
export async function buildPalaceData(sourceText) {
  const systemPrompt = `You are an expert educational AI that creates spatial memory palaces using the Method of Loci technique.

Given study material, you will:
1. Extract 10-12 key concepts
2. Map each concept to a physical object in a room
3. Create vivid mnemonics for each
4. Generate an optimal TEACHING SEQUENCE (order to introduce concepts)
5. Provide context and details for teaching mode

Available objects: sofa, armchair, bookshelf, desk, painting_1, painting_2, painting_3, window, lamp, plant, globe, clock

Teaching sequence should:
- Start with foundational concepts
- Build progressively to complex ideas
- Group related concepts near each other in the sequence
- Consider cognitive load (don't overload early)

Return JSON matching this schema:
{
  "palace_name": "Short catchy name",
  "themes": ["Theme 1", "Theme 2"],
  "teaching_sequence": ["sofa", "bookshelf", "desk", ...],
  "objects": {
    "sofa": {
      "concept": "Main concept name",
      "detail": "2-3 sentence explanation for teaching mode",
      "mnemonic": "Vivid memory association with sofa",
      "theme": "Which theme this belongs to",
      "importance": "high|medium|low",
      "teaching_context": "Additional context for when teaching this concept"
    },
    // ... more objects
  }
}`;

  const userPrompt = `Study Material:

${sourceText}

Extract key concepts and build a memory palace with teaching sequence.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.content[0].text;
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      rawText.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText;
    
    const palaceData = JSON.parse(jsonStr.trim());
    
    // Validate required fields
    if (!palaceData.teaching_sequence || !palaceData.objects) {
      throw new Error('Invalid palace data structure');
    }
    
    return palaceData;
    
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

// --- NEW: AI Tutor — asks a Socratic question instead of just revealing the answer ---
export async function askConceptQuestion(concept, detail, mnemonic) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: `You are a Socratic tutor helping a student recall a concept from a memory palace.
Ask ONE short question (max 20 words) that prompts recall WITHOUT giving away the answer.
Respond with ONLY the question, no preamble.`,
      messages: [{
        role: 'user',
        content: `Concept: ${concept}\nDetail: ${detail}\nMnemonic: ${mnemonic}`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text.trim();
}

// --- NEW: AI answer evaluation ---
export async function evaluateAnswer(concept, detail, userAnswer) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: `You are evaluating if a student's answer demonstrates understanding of a concept.
Respond ONLY with JSON: {"correct": true/false, "feedback": "one sentence of encouraging feedback"}`,
      messages: [{
        role: 'user',
        content: `Concept: ${concept}\nFull detail: ${detail}\nStudent answered: "${userAnswer}"`
      }]
    })
  });
  const data = await response.json();
  const raw = data.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}
```

---

## Step 3 — Upload Panel UI (`src/ui/uploadPanel.js`) (30 min)

```javascript
// src/ui/uploadPanel.js
import { parsePDF } from '../api/pdfParser.js';

const pdfInput = document.getElementById('pdf-input');
const notesInput = document.getElementById('notes-input');
const buildBtn = document.getElementById('build-btn');
const pdfFileName = document.getElementById('pdf-file-name');
const uploadPanel = document.getElementById('upload-panel');
const loading = document.getElementById('loading');

let currentSource = null;

export function setupUploadPanel(onBuildCallback) {
  // PDF file selection
  pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    pdfFileName.textContent = `📄 ${file.name}`;
    notesInput.value = ''; // Clear text input
    
    loading.classList.remove('hidden');
    
    try {
      const pdfData = await parsePDF(file);
      currentSource = pdfData.text;
      buildBtn.disabled = false;
      loading.classList.add('hidden');
    } catch (error) {
      console.error('PDF parsing error:', error);
      alert('Error parsing PDF. Please try a different file.');
      loading.classList.add('hidden');
    }
  });
  
  // Text input
  notesInput.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (text.length > 100) {
      currentSource = text;
      buildBtn.disabled = false;
      pdfFileName.textContent = ''; // Clear PDF name
    } else {
      buildBtn.disabled = true;
    }
  });
  
  // Build button
  buildBtn.addEventListener('click', async () => {
    if (!currentSource) return;
    
    uploadPanel.style.display = 'none';
    loading.classList.remove('hidden');
    
    await onBuildCallback(currentSource);
  });
}
```

---

# 🔨 PART 3 — Teaching Mode System
### Owner: Member 3 | Time: ~3 hours

---

## Concept: Progressive Teaching Flow

Teaching mode walks the user through concepts in optimal order:
1. Show concept card with full context
2. User marks "I've got this" when ready
3. Object state changes: LOCKED → LEARNING → ready for assessment
4. Progress bar updates
5. After all concepts taught → unlock assessment mode

---

## Step 1 — Teaching Mode Logic (`src/learning/teachingMode.js`) (90 min)

```javascript
// src/learning/teachingMode.js
import { store } from '../state/store.js';
import { updateObjectState, STATES } from '../scene/objects.js';

const teachingPanel = document.getElementById('teaching-panel');
const conceptTitle = document.getElementById('concept-title');
const conceptDetail = document.getElementById('concept-detail');
const mnemonicText = document.getElementById('mnemonic-text');
const teachingProgress = document.getElementById('teaching-progress');
const prevBtn = document.getElementById('prev-concept-btn');
const nextBtn = document.getElementById('next-concept-btn');
const markLearnedBtn = document.getElementById('mark-learned-btn');
const readyAssessmentBtn = document.getElementById('ready-assessment-btn');

let currentIndex = 0;
let learnedConcepts = new Set();

export function startTeachingMode() {
  teachingPanel.classList.remove('hidden');
  currentIndex = 0;
  learnedConcepts.clear();
  
  // Set first object to LEARNING state
  const firstSlot = store.palaceData.teaching_sequence[0];
  const firstMesh = store.meshMap[firstSlot];
  updateObjectState(firstMesh, STATES.LEARNING);
  
  showConcept(currentIndex);
  setupEventListeners();
}

function showConcept(index) {
  const sequence = store.palaceData.teaching_sequence;
  const slotName = sequence[index];
  const conceptData = store.palaceData.objects[slotName];
  
  if (!conceptData) return;
  
  // Update UI
  conceptTitle.textContent = conceptData.concept;
  conceptDetail.textContent = conceptData.detail + 
    (conceptData.teaching_context ? '\n\n' + conceptData.teaching_context : '');
  mnemonicText.textContent = conceptData.mnemonic;
  teachingProgress.textContent = `Concept ${index + 1} of ${sequence.length}`;
  
  // Update buttons
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === sequence.length - 1;
  
  // Show "Ready for Assessment" if all concepts learned
  if (learnedConcepts.size === sequence.length) {
    readyAssessmentBtn.classList.remove('hidden');
  }
  
  // Update object state to LEARNING (if not already mastered)
  const mesh = store.meshMap[slotName];
  if (mesh.userData.state !== STATES.MASTERED) {
    updateObjectState(mesh, STATES.LEARNING);
  }
  
  // Focus camera on object
  focusCameraOnObject(mesh);
}

function focusCameraOnObject(mesh) {
  // Smoothly move camera to face the object
  const camera = store.camera;
  const targetPos = mesh.position.clone();
  
  // Calculate ideal camera position (5 units away)
  const direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize();
  const idealCameraPos = targetPos.clone().add(direction.multiplyScalar(5));
  
  // Smooth transition (using animation library or manual lerp in animation loop)
  // For simplicity, instant move:
  camera.lookAt(targetPos);
}

function setupEventListeners() {
  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      showConcept(currentIndex);
    }
  };
  
  nextBtn.onclick = () => {
    if (currentIndex < store.palaceData.teaching_sequence.length - 1) {
      currentIndex++;
      showConcept(currentIndex);
    }
  };
  
  markLearnedBtn.onclick = () => {
    const slotName = store.palaceData.teaching_sequence[currentIndex];
    learnedConcepts.add(slotName);
    
    // Update progress bar
    updateProgressBar();
    
    // Optionally auto-advance to next
    if (currentIndex < store.palaceData.teaching_sequence.length - 1) {
      currentIndex++;
      showConcept(currentIndex);
    } else {
      // All concepts shown, allow assessment
      readyAssessmentBtn.classList.remove('hidden');
    }
  };
  
  readyAssessmentBtn.onclick = () => {
    endTeachingMode();
    store.startAssessmentMode();
  };
}

function updateProgressBar() {
  const total = store.palaceData.teaching_sequence.length;
  const learned = learnedConcepts.size;
  
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');
  
  const percentage = (learned / total) * 100;
  progressFill.style.width = `${percentage}%`;
  progressLabel.textContent = `${learned}/${total} Concepts Learned`;
}

function endTeachingMode() {
  teachingPanel.classList.add('hidden');
  
  // Set all taught concepts to LOCKED state for assessment
  store.palaceData.teaching_sequence.forEach(slotName => {
    const mesh = store.meshMap[slotName];
    updateObjectState(mesh, STATES.LOCKED);
  });
}

export { learnedConcepts };
```

---

## Step 2 — Enhanced Interaction (`src/interaction/raycaster.js` & `tooltip.js`)

*(Similar to base version, but tooltips now show different content based on mode)*

`src/interaction/tooltip.js`:
```javascript
// src/interaction/tooltip.js
import { store } from '../state/store.js';

const tooltip = document.getElementById('tooltip');

export function showTooltip(mesh, mode) {
  if (!mesh.userData.hasContent) return;
  
  const { concept, detail, mnemonic } = mesh.userData;
  
  if (mode === 'teaching') {
    // In teaching mode, show full info
    tooltip.innerHTML = `
      <h3>${concept}</h3>
      <p>${detail}</p>
      <div style="margin-top:10px; padding-top:10px; border-top:1px solid #c9a84c;">
        <strong>💡 Mnemonic:</strong> ${mnemonic}
      </div>
    `;
  } else if (mode === 'assessment') {
    // In assessment mode, hide details until reveal
    if (mesh.userData.revealed) {
      tooltip.innerHTML = `
        <h3>${concept}</h3>
        <p>${detail}</p>
      `;
    } else {
      tooltip.innerHTML = `
        <h3>???</h3>
        <p>Try to recall what this ${mesh.userData.slotName} represents</p>
      `;
    }
  }
  
  tooltip.classList.remove('hidden');
}

export function hideTooltip() {
  tooltip.classList.add('hidden');
}
```

---

# 🔨 PART 4 — Assessment Mode & Integration
### Owner: Member 4 | Time: ~3.5 hours

---

## Concept: Assessment Flow

1. All objects start LOCKED (hidden)
2. User walks around, hovers objects
3. Can self-recall (press E) or reveal answer
4. If recalled correctly → MASTERED state (golden glow)
5. Track score
6. Show final results

---

## Step 1 — Enhanced State Store (`src/state/store.js`) (30 min)

```javascript
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
  
  // Method to start assessment
  startAssessmentMode: null // Will be set by main.js
};
```

---

## Step 2 — Assessment Mode (`src/learning/assessmentMode.js`) (90 min)

```javascript
// src/learning/assessmentMode.js
import { store } from '../state/store.js';
import { updateObjectState, STATES } from '../scene/objects.js';

const assessmentPanel = document.getElementById('assessment-panel');
const revealBtn = document.getElementById('reveal-btn');
const assessmentResult = document.getElementById('assessment-result');
const nextObjectBtn = document.getElementById('next-object-btn');

export function startAssessmentMode() {
  assessmentPanel.classList.remove('hidden');
  store.mode = 'assessment';
  store.assessment.active = true;
  store.assessment.total = store.palaceData.teaching_sequence.length;
  store.assessment.score = 0;
  
  // Reset all objects to LOCKED
  Object.values(store.meshMap).forEach(mesh => {
    if (mesh.userData.hasContent) {
      mesh.userData.revealed = false;
      updateObjectState(mesh, STATES.LOCKED);
    }
  });
  
  setupAssessmentListeners();
}

function setupAssessmentListeners() {
  revealBtn.onclick = () => {
    const slotName = store.assessment.currentHoveredSlot;
    if (!slotName) return;
    
    revealConcept(slotName, false); // false = not self-recalled
  };
}

export function revealConcept(slotName, selfRecalled) {
  const mesh = store.meshMap[slotName];
  if (!mesh || !mesh.userData.hasContent) return;
  
  mesh.userData.revealed = true;
  
  // Update result UI
  if (selfRecalled) {
    store.assessment.score++;
    assessmentResult.innerHTML = `
      <strong>✓ Correct!</strong><br>
      ${mesh.userData.concept}: ${mesh.userData.detail}
    `;
    assessmentResult.className = 'correct';
    updateObjectState(mesh, STATES.MASTERED);
  } else {
    assessmentResult.innerHTML = `
      <strong>Answer:</strong><br>
      ${mesh.userData.concept}: ${mesh.userData.detail}
    `;
    assessmentResult.className = 'incorrect';
    updateObjectState(mesh, STATES.LEARNING);
  }
  
  assessmentResult.classList.remove('hidden');
  revealBtn.classList.add('hidden');
  nextObjectBtn.classList.remove('hidden');
  
  updateScore();
}

export function markSelfRecalled(slotName) {
  revealConcept(slotName, true);
}

function updateScore() {
  const progressLabel = document.getElementById('progress-label');
  progressLabel.textContent = `Score: ${store.assessment.score}/${store.assessment.total}`;
  
  const progressFill = document.getElementById('progress-fill');
  const percentage = (store.assessment.score / store.assessment.total) * 100;
  progressFill.style.width = `${percentage}%`;
}

nextObjectBtn.onclick = () => {
  assessmentResult.classList.add('hidden');
  nextObjectBtn.classList.add('hidden');
  revealBtn.classList.remove('hidden');
  store.assessment.currentHoveredSlot = null;
};
```

---

## Step 3 — Main Integration (`src/main.js`) (90 min)

```javascript
// src/main.js — Member 4 final integration

import { initScene } from './scene/index.js';
import { buildPalaceData } from './api/claude.js';
import { assignConceptsToMeshes } from './scene/objects.js';
import { setupRaycaster } from './interaction/raycaster.js';
import { showTooltip, hideTooltip } from './interaction/tooltip.js';
import { setupUploadPanel } from './ui/uploadPanel.js';
import { startTeachingMode } from './learning/teachingMode.js';
import { startAssessmentMode, markSelfRecalled } from './learning/assessmentMode.js';
import { store } from './state/store.js';

const canvas = document.getElementById('three-canvas');
const loading = document.getElementById('loading');
const crosshair = document.getElementById('crosshair');
const progressBar = document.getElementById('progress-bar');
const hud = document.getElementById('hud');

// Set up upload panel
setupUploadPanel(async (sourceText) => {
  try {
    // 1. Call Claude API to build palace
    const palaceData = await buildPalaceData(sourceText);
    store.palaceData = palaceData;
    
    // 2. Initialize 3D scene
    const { scene, camera, renderer, controls, meshMap, addFrameCallback } = initScene(canvas);
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
        store.assessment.currentHoveredSlot = mesh.userData.slotName;
        showTooltip(mesh, store.mode);
      },
      () => hideTooltip()
    );
    addFrameCallback(updateRaycaster);
    
    // 5. Show 3D canvas
    loading.classList.add('hidden');
    canvas.style.display = 'block';
    crosshair.style.display = 'block';
    progressBar.classList.remove('hidden');
    hud.classList.remove('hidden');
    
    // 6. Update HUD
    updateHUD();
    
    // 7. Start teaching mode
    store.mode = 'teaching';
    startTeachingMode();
    
    // 8. Setup controls
    canvas.addEventListener('click', () => controls.lock(), { once: true });
    
  } catch (error) {
    console.error('Palace build error:', error);
    loading.classList.add('hidden');
    alert('Error building palace. Please check your API key and try again.');
  }
});

// Set assessment mode starter in store
store.startAssessmentMode = startAssessmentMode;

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  // E = self-recall in assessment mode
  if (e.code === 'KeyE' && store.mode === 'assessment' && store.assessment.currentHoveredSlot) {
    markSelfRecalled(store.assessment.currentHoveredSlot);
  }
});

function updateHUD() {
  const { palaceData } = store;
  if (!palaceData) return;
  
  hud.innerHTML = `
    <div><strong>🏛️ ${palaceData.palace_name}</strong></div>
    <div>📚 ${Object.keys(palaceData.objects).length} concepts</div>
    <div>🎨 ${palaceData.themes.join(', ')}</div>
    <div style="margin-top:8px;font-size:11px;color:#888">
      WASD: Move • Mouse: Look • E: Self-Recall
    </div>
  `;
}
```

---

## Step 4 — Scene Initialization (`src/scene/index.js`)

```javascript
// src/scene/index.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { buildRoom } from './room.js';
import { createObjects } from './objects.js';
import { setupLighting } from './lighting.js';

export function initScene(canvas) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  scene.fog = new THREE.Fog(0x0a0a0f, 15, 30);
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.6, 8);
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Build room
  buildRoom(scene);
  
  // Create objects
  const meshMap = createObjects(scene);
  
  // Setup lighting
  setupLighting(scene);
  
  // Controls
  const controls = new PointerLockControls(camera, canvas);
  
  // Movement
  const moveSpeed = 5;
  const keys = { w: false, a: false, s: false, d: false };
  
  document.addEventListener('keydown', e => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyD') keys.d = true;
  });
  
  document.addEventListener('keyup', e => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyD') keys.d = false;
  });
  
  // Animation loop
  const clock = new THREE.Clock();
  const frameCallbacks = [];
  
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    // Movement
    if (controls.isLocked) {
      const velocity = moveSpeed * delta;
      if (keys.w) controls.moveForward(velocity);
      if (keys.s) controls.moveForward(-velocity);
      if (keys.d) controls.moveRight(velocity);
      if (keys.a) controls.moveRight(-velocity);
    }
    
    // Frame callbacks (raycaster, etc)
    frameCallbacks.forEach(cb => cb(delta));
    
    renderer.render(scene, camera);
  }
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  return {
    scene,
    camera,
    renderer,
    controls,
    meshMap,
    addFrameCallback: (cb) => frameCallbacks.push(cb)
  };
}
```

---

---

# 🔨 PART 5 — Sound + Voice Narration
### Owner: Member 3 (add-on) | Time: ~1.5 hours

---

## Concept

Two browser-native APIs — no extra dependencies:
- **Web Speech API** (`SpeechSynthesis`) — TTS, available in all modern browsers
- **Web Audio API** — programmatic sound tones for cues and ambient drone

---

## Step 1 — Sound Manager (`src/audio/soundManager.js`)

```javascript
// src/audio/soundManager.js

// ── Web Audio context (shared) ──────────────────────────────────────────────
const ctx = new (window.AudioContext || window.webkitAudioContext)();

// Ambient drone — plays quietly while inside the palace
let ambientNode = null;

export function startAmbient() {
  if (ambientNode) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, ctx.currentTime);       // deep low hum
  gain.gain.setValueAtTime(0.04, ctx.currentTime);          // very quiet

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  ambientNode = { osc, gain };
}

export function stopAmbient() {
  if (!ambientNode) return;
  ambientNode.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
  setTimeout(() => { ambientNode.osc.stop(); ambientNode = null; }, 1100);
}

// Play a short tone — type: 'correct' | 'incorrect' | 'reveal' | 'advance'
export function playTone(type) {
  const configs = {
    correct:   { freq: 523, duration: 0.4, gain: 0.3, type: 'sine' },    // C5 — pleasant
    incorrect: { freq: 220, duration: 0.5, gain: 0.25, type: 'sawtooth' }, // A3 — buzzy
    reveal:    { freq: 440, duration: 0.2, gain: 0.2, type: 'sine' },    // A4 — soft ping
    advance:   { freq: 392, duration: 0.15, gain: 0.15, type: 'sine' }   // G4 — gentle click
  };

  const c = configs[type] || configs.reveal;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = c.type;
  osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
  gain.gain.setValueAtTime(c.gain, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + c.duration);
}

// ── Web Speech API (TTS) ────────────────────────────────────────────────────
let speaking = false;

export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel(); // stop any current speech
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = rate;
  utt.pitch = pitch;
  utt.onend = () => { speaking = false; };
  speaking = true;
  window.speechSynthesis.speak(utt);
}

export function stopSpeech() {
  window.speechSynthesis?.cancel();
  speaking = false;
}
```

---

## Step 2 — Wire into Teaching Mode

In `src/learning/teachingMode.js`, import and call sound functions:

```javascript
// Add to imports at top of teachingMode.js
import { speak, playTone, startAmbient } from '../audio/soundManager.js';

// In startTeachingMode(), after teachingPanel shows:
startAmbient();

// In showConcept(), after updating UI — read mnemonic aloud:
speak(`${conceptData.concept}. ${conceptData.mnemonic}`);

// In nextBtn.onclick and prevBtn.onclick:
playTone('advance');

// In markLearnedBtn.onclick (concept marked as learned):
playTone('correct');
```

---

## Step 3 — Wire into Assessment Mode

In `src/learning/assessmentMode.js`, add audio feedback:

```javascript
// Add to imports
import { speak, playTone } from '../audio/soundManager.js';

// In revealConcept(), after selfRecalled check:
if (selfRecalled) {
  playTone('correct');
} else {
  playTone('incorrect');
}

// When AI question appears (see Part 6), read question aloud:
speak(question);
```

---

## Step 4 — Audio Toggle in HUD (optional quality-of-life)

Add a mute button to the HUD in `main.js` `updateHUD()`:

```javascript
hud.innerHTML = `
  ...existing content...
  <div style="margin-top:8px;">
    <button onclick="window.__toggleAudio()" style="background:none;border:1px solid #555;color:#aaa;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;">
      🔊 Toggle Sound
    </button>
  </div>
`;

import { startAmbient, stopAmbient, stopSpeech } from './audio/soundManager.js';
window.__toggleAudio = () => {
  store.audio.enabled = !store.audio.enabled;
  store.audio.ttsEnabled = store.audio.enabled;
  if (!store.audio.enabled) { stopAmbient(); stopSpeech(); }
  else startAmbient();
};
```

---

# 🔨 PART 6 — Adaptive AI Tutor + Spaced Repetition
### Owner: Member 4 (add-on) | Time: ~2 hours

---

## Concept

Two independent systems that work together:

**AI Tutor** — when hovering an object in assessment mode, instead of just a "Reveal" button, Claude generates a Socratic question. User types their answer. Claude grades it and gives one-sentence feedback.

**SM-2 Spaced Repetition** — after each answer, the SM-2 algorithm calculates when to show that concept again. On return visits, objects due for review glow blue. The palace becomes a long-term study companion.

---

## Step 1 — Spaced Repetition Engine (`src/learning/spacedRepetition.js`)

```javascript
// src/learning/spacedRepetition.js
// Implementation of the SM-2 algorithm (SuperMemo 2)

/**
 * SM-2 card state per concept
 * { interval: number (days), easeFactor: number, repetitions: number, nextReview: Date|null }
 */

export function initCard() {
  return { interval: 1, easeFactor: 2.5, repetitions: 0, nextReview: null };
}

/**
 * Update a card after a review.
 * @param {object} card  - existing SM-2 card
 * @param {number} grade - 0–5 (0-1 = fail, 2 = barely, 3 = ok, 4 = good, 5 = perfect)
 * @returns updated card
 */
export function updateCard(card, grade) {
  const c = { ...card };

  if (grade < 3) {
    // Failed — reset repetitions, short interval
    c.repetitions = 0;
    c.interval = 1;
  } else {
    // Passed
    if (c.repetitions === 0) c.interval = 1;
    else if (c.repetitions === 1) c.interval = 6;
    else c.interval = Math.round(c.interval * c.easeFactor);

    c.repetitions++;
  }

  // Update ease factor (clamped to minimum 1.3)
  c.easeFactor = Math.max(1.3, c.easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  // Set next review date
  const next = new Date();
  next.setDate(next.getDate() + c.interval);
  c.nextReview = next.toISOString();

  return c;
}

/** Returns true if this card is due today or overdue */
export function isDue(card) {
  if (!card.nextReview) return true; // never reviewed
  return new Date(card.nextReview) <= new Date();
}

/** Grade 0-5 from a boolean correct/incorrect (simple mapping) */
export function boolToGrade(correct) {
  return correct ? 4 : 1;
}

/** Initialise spaced rep state for all concepts in palace */
export function initSpacedRep(palaceData, store) {
  palaceData.teaching_sequence.forEach(slotName => {
    if (!store.spacedRep[slotName]) {
      store.spacedRep[slotName] = initCard();
    }
  });
}

/** Persist to localStorage so it survives page refresh */
export function saveSpacedRep(store) {
  try {
    localStorage.setItem('mp_spacedRep', JSON.stringify(store.spacedRep));
  } catch {}
}

export function loadSpacedRep(store) {
  try {
    const saved = localStorage.getItem('mp_spacedRep');
    if (saved) store.spacedRep = JSON.parse(saved);
  } catch {}
}

/** Mark objects that are due for review with REVIEW visual state */
export function highlightDueObjects(store, updateObjectState, STATES) {
  Object.entries(store.spacedRep).forEach(([slotName, card]) => {
    const mesh = store.meshMap[slotName];
    if (!mesh) return;
    if (isDue(card) && mesh.userData.state === STATES.MASTERED) {
      updateObjectState(mesh, STATES.REVIEW);
    }
  });
}
```

---

## Step 2 — Update Assessment Mode to Use AI Questions

Replace the existing `revealBtn.onclick` block in `src/learning/assessmentMode.js`:

```javascript
// src/learning/assessmentMode.js — updated sections only
import { askConceptQuestion, evaluateAnswer } from '../api/claude.js';
import { updateCard, boolToGrade, initSpacedRep, saveSpacedRep, loadSpacedRep } from './spacedRepetition.js';
import { speak, playTone } from '../audio/soundManager.js';
import { store } from '../state/store.js';
import { updateObjectState, STATES } from '../scene/objects.js';

// Replace the assessment panel HTML content via JS for the AI question flow
// Add this to index.html inside #assessment-panel .assessment-card:
//   <div id="ai-question" class="hidden" style="font-style:italic;color:#a78bfa;margin-bottom:12px;"></div>
//   <input id="user-answer" type="text" class="hidden" placeholder="Type your answer..." />
//   <button id="submit-answer-btn" class="primary-btn hidden">Submit Answer</button>

export function startAssessmentMode() {
  assessmentPanel.classList.remove('hidden');
  store.mode = 'assessment';
  store.assessment.active = true;
  store.assessment.total = store.palaceData.teaching_sequence.length;
  store.assessment.score = 0;

  // Load any saved spaced rep data
  loadSpacedRep(store);
  initSpacedRep(store.palaceData, store);

  // Reset all objects to LOCKED
  Object.values(store.meshMap).forEach(mesh => {
    if (mesh.userData.hasContent) {
      mesh.userData.revealed = false;
      updateObjectState(mesh, STATES.LOCKED);
    }
  });

  setupAssessmentListeners();
}

function setupAssessmentListeners() {
  const aiQuestion = document.getElementById('ai-question');
  const userAnswer = document.getElementById('user-answer');
  const submitBtn = document.getElementById('submit-answer-btn');

  // When user hovers a new object → ask Claude for a question
  // Called from raycaster hover callback via store
  store.onObjectHover = async (slotName) => {
    if (store.assessment.awaitingAnswer) return;
    const mesh = store.meshMap[slotName];
    if (!mesh?.userData.hasContent || mesh.userData.revealed) return;

    store.assessment.awaitingAnswer = true;
    store.assessment.currentHoveredSlot = slotName;

    // Show loading state
    aiQuestion.textContent = '🤔 Thinking of a question...';
    aiQuestion.classList.remove('hidden');
    revealBtn.classList.add('hidden');

    try {
      const { concept, detail, mnemonic } = mesh.userData;
      const question = await askConceptQuestion(concept, detail, mnemonic);
      aiQuestion.textContent = `💬 ${question}`;
      speak(question);

      userAnswer.value = '';
      userAnswer.classList.remove('hidden');
      submitBtn.classList.remove('hidden');
      userAnswer.focus();
    } catch {
      // Fallback to simple reveal if API fails
      aiQuestion.classList.add('hidden');
      revealBtn.classList.remove('hidden');
      store.assessment.awaitingAnswer = false;
    }
  };

  // Submit typed answer for AI evaluation
  submitBtn.onclick = async () => {
    const slotName = store.assessment.currentHoveredSlot;
    const mesh = store.meshMap[slotName];
    const answer = userAnswer.value.trim();
    if (!answer) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Evaluating...';

    try {
      const result = await evaluateAnswer(mesh.userData.concept, mesh.userData.detail, answer);

      // Show feedback
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

      // Update visual state
      updateObjectState(mesh, result.correct ? STATES.MASTERED : STATES.LEARNING);
      mesh.userData.revealed = true;
      if (result.correct) store.assessment.score++;

      // Update spaced repetition
      const grade = boolToGrade(result.correct);
      store.spacedRep[slotName] = updateCard(store.spacedRep[slotName], grade);
      saveSpacedRep(store);

      // Reset question UI
      aiQuestion.classList.add('hidden');
      userAnswer.classList.add('hidden');
      submitBtn.classList.add('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Answer';
      nextObjectBtn.classList.remove('hidden');
      store.assessment.awaitingAnswer = false;

      updateScore();
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Answer';
    }
  };

  // Also keep reveal btn as fallback (skip question)
  revealBtn.onclick = () => {
    const slotName = store.assessment.currentHoveredSlot;
    if (!slotName) return;
    revealConcept(slotName, false);
  };
}
```

---

## Step 3 — Wire Spaced Rep into main.js

After palace loads, call `highlightDueObjects` to glow any concepts due for review:

```javascript
// In main.js, after startTeachingMode() — add:
import { highlightDueObjects, loadSpacedRep } from './learning/spacedRepetition.js';
import { startAmbient } from './audio/soundManager.js';

// Inside the onBuildCallback, after assignConceptsToMeshes:
loadSpacedRep(store);
highlightDueObjects(store, updateObjectState, STATES); // blue glow on due objects
startAmbient(); // begin ambient sound as palace loads
```

---

## Step 4 — Add CSS for Answer Input

Add to `style.css`:

```css
#user-answer {
  width: 100%;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(0,0,0,0.4);
  border: 1px solid #8b5cf6;
  color: #f0e6d3;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

#user-answer:focus {
  outline: none;
  border-color: #a78bfa;
  box-shadow: 0 0 8px rgba(139,92,246,0.3);
}

#ai-question {
  font-size: 15px;
  line-height: 1.5;
  color: #a78bfa;
  margin-bottom: 12px;
  min-height: 40px;
}
```

---

# 🔗 Enhanced Integration Checklist

- [ ] **Member 1:** Room renders, objects have 4 visual states (locked/learning/mastered/review)
- [ ] **Member 2:** PDF upload works, text extraction successful, Claude API returns teaching_sequence; `askConceptQuestion` and `evaluateAnswer` functions work
- [ ] **Member 3:** Teaching mode shows concepts in order, TTS reads mnemonic aloud on each concept reveal, ambient sound plays on palace entry, correct/incorrect audio cues work in assessment
- [ ] **Member 4:** Assessment mode asks AI question before revealing answer, spaced repetition schedules next review, objects glow blue when due for review, scoring works, transitions smooth
- [ ] **Full Flow:** Upload PDF → Teaching mode walks through concepts (with TTS) → Assessment mode asks questions + evaluates answers → Spaced rep schedules reviews → Return sessions show only due concepts → Final score

---

# 🚀 Running Enhanced Version

## Team Members — Getting Started

Clone the repo, install, and run:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install
npm run dev
```

Create a `.env` file in the root (never commit this):
```
VITE_CLAUDE_API_KEY=sk-ant-api03-...
```

Add `.env` to `.gitignore` so API keys are never pushed:
```bash
echo ".env" >> .gitignore
```

Then start the dev server:
```bash
npm run dev
```

---

# 🔨 MISSING FILES — Complete Code
### All files not explicitly covered in Parts 1–6

---

## `src/scene/controls.js`

```javascript
// src/scene/controls.js
// WASD movement logic — imported and used by scene/index.js

export function setupControls(controls) {
  const keys = { w: false, a: false, s: false, d: false };

  document.addEventListener('keydown', e => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyD') keys.d = true;
    // Lock pointer on Enter
    if (e.code === 'Enter' && !controls.isLocked) controls.lock();
  });

  document.addEventListener('keyup', e => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyD') keys.d = false;
  });

  // Returns a function to call each frame with delta time
  return function movePlayer(delta) {
    if (!controls.isLocked) return;
    const speed = 5 * delta;
    if (keys.w) controls.moveForward(speed);
    if (keys.s) controls.moveForward(-speed);
    if (keys.d) controls.moveRight(speed);
    if (keys.a) controls.moveRight(-speed);
  };
}
```

---

## `src/interaction/raycaster.js`

```javascript
// src/interaction/raycaster.js
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0); // always cast from screen center (crosshair)

let lastHovered = null;

export function setupRaycaster(camera, meshMap, onHover, onLeave) {
  const meshes = Object.values(meshMap);

  function update() {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
      const mesh = hits[0].object;
      if (mesh !== lastHovered) {
        lastHovered = mesh;
        onHover(mesh);
      }
    } else {
      if (lastHovered) {
        onLeave();
        lastHovered = null;
      }
    }
  }

  return { update };
}
```

---

## `src/ui/hud.js`

```javascript
// src/ui/hud.js
import { store } from '../state/store.js';

const hud = document.getElementById('hud');

export function updateHUD() {
  const { palaceData } = store;
  if (!palaceData) return;

  hud.innerHTML = `
    <div><strong>🏛️ ${palaceData.palace_name}</strong></div>
    <div>📚 ${Object.keys(palaceData.objects).length} concepts</div>
    <div>🎨 ${palaceData.themes.join(', ')}</div>
    <div style="margin-top:8px; font-size:11px; color:#888;">
      WASD: Move &nbsp;|&nbsp; Mouse: Look &nbsp;|&nbsp; E: Self-Recall
    </div>
    <div style="margin-top:8px;">
      <button onclick="window.__toggleAudio()" style="
        background:none; border:1px solid #555; color:#aaa;
        padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;
      ">🔊 Toggle Sound</button>
    </div>
  `;

  hud.classList.remove('hidden');
}

export function setHUDMode(mode) {
  const badge = hud.querySelector('.mode-indicator');
  if (badge) badge.textContent = mode === 'teaching' ? '📖 Teaching' : '🎯 Assessment';
}
```

---

## `src/ui/progressBar.js`

```javascript
// src/ui/progressBar.js

const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const progressBar = document.getElementById('progress-bar');

export function showProgressBar() {
  progressBar.classList.remove('hidden');
}

export function hideProgressBar() {
  progressBar.classList.add('hidden');
}

// Update during teaching mode — tracks concepts learned
export function updateTeachingProgress(learned, total) {
  const pct = (learned / total) * 100;
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${learned}/${total} Concepts Learned`;
}

// Update during assessment mode — tracks score
export function updateAssessmentProgress(score, total) {
  const pct = (score / total) * 100;
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `Score: ${score}/${total}`;
}

// Full reset
export function resetProgress() {
  progressFill.style.width = '0%';
  progressLabel.textContent = '0/0';
}
```

---

## `src/ui/teachingPanel.js`

```javascript
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
```

---

## `src/scene/room.js`

```javascript
// src/scene/room.js
import * as THREE from 'three';

export function buildRoom(scene) {
  const mat = (color) => new THREE.MeshPhongMaterial({ color, side: THREE.BackSide });

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0x3d2b1f })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0x1a1a2e })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8;
  scene.add(ceiling);

  // Walls (box inside-out)
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(20, 8, 20),
    mat(0x2c1810)
  );
  room.position.y = 4;
  scene.add(room);
}
```

---

## 🔊 `public/sounds/` — What to Put Here

The `soundManager.js` uses the Web Audio API to generate tones programmatically so **no audio files are required**. However you can optionally add:

| File | Purpose | Free Source |
|---|---|---|
| `ambient.mp3` | Background room tone (replace the oscillator) | freesound.org → search "room tone" |
| `correct.mp3` | Correct answer chime | freesound.org → search "success chime" |
| `incorrect.mp3` | Wrong answer buzz | freesound.org → search "error buzz" |

If you add these, update `soundManager.js` to use `new Audio('sounds/ambient.mp3')` instead of the oscillator. Otherwise leave the folder empty — it works fine without files.

---

## 🖼️ `public/textures/` — What to Put Here

Three.js can texture the room walls/floor/furniture. These are all optional — the app works without them.

| File | Applied To | Free Source |
|---|---|---|
| `wood.jpg` | Floor, desk, bookshelf | ambientcg.com → "Wood" |
| `plaster.jpg` | Walls | ambientcg.com → "Plaster" |
| `fabric.jpg` | Sofa, armchair | ambientcg.com → "Fabric" |

To apply a texture in `objects.js`:
```javascript
const loader = new THREE.TextureLoader();
const woodTex = loader.load('/textures/wood.jpg');
const material = new THREE.MeshPhongMaterial({ map: woodTex });
```

Leave the folder empty for now and add textures later as a visual polish step.

---

# 🎯 Key Improvements Summary

1. **PDF Upload** — Direct PDF parsing with PDF.js
2. **Teaching-First Flow** — Structured introduction before assessment
3. **Visual States** — Objects show learning progress (locked → learning → mastered → review)
4. **Progress Tracking** — Real-time progress bar and score
5. **Better Pedagogy** — Active learning before passive testing
6. **Enhanced UX** — Clearer UI states, better feedback
7. **Sound + Voice Narration** — Ambient soundscape immerses you in the palace; TTS reads mnemonics aloud so auditory learners aren't left out; distinct audio tones for correct vs incorrect answers give instant emotional feedback
8. **Adaptive AI Tutor** — Claude asks a Socratic question when you hover an object in assessment mode; you type your answer; Claude evaluates it and gives feedback — forces real active recall instead of passive reveal
9. **Spaced Repetition (SM-2)** — Every concept gets an interval + ease factor tracked in `store.spacedRep`; after each session, next review date is calculated; when you return, only due concepts glow blue — long-term retention built in

---

*Enhanced version focuses on pedagogically sound learning flow: teach first, then assess. The PDF upload transforms passive reading into active spatial exploration.*
