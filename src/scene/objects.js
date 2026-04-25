// src/scene/objects.js
import * as THREE from 'three';

// ── Object Visual States ──────────────────────────────────────────────────────
export const STATES = {
  LOCKED:   'locked',    // Not yet taught — gray/faded
  LEARNING: 'learning',  // Currently being taught — normal color
  MASTERED: 'mastered',  // Successfully recalled — golden glow
  REVIEW:   'review'     // Due for spaced repetition — pulsing blue glow
};

// ── Updated Object Slots to match Grand Hall ──────────────────────────────────
export const OBJECT_SLOTS = [
  'fireplace', 'sofa', 'coffee_table', 'bookshelf_1', 'bookshelf_2', 'bookshelf_3',
  'dining_table', 'chairs', 'desk', 'monitor', 'office_chair', 'floor_lamps',
  'plants', 'chandelier', 'piano', 'billiard_table', 'bar_counter', 'trophy_cabinet',
  'grandfather_clock', 'armchair', 'paintings', 'pillars', 'rugs'
];

// ── High-Fidelity Object Definitions (from explorer) ──────────────────────────
const OBJECT_DEFS = [
  { name: 'fireplace',      pos: [0, 2.25, -13.5], size: [5.5, 4.5, 0.7], color: 0x8b3820 },
  { name: 'sofa',           pos: [0, 0.3, -10],    size: [4.0, 0.6, 1.1], color: 0x1a2840 },
  { name: 'coffee_table',   pos: [0, 0.48, -8.8],  size: [2.2, 0.08, 1.0], color: 0x7a3a10 },
  { name: 'bookshelf_1',    pos: [-11.2, 2.25, -11], size: [2.2, 4.5, 0.5], color: 0x4a2208 },
  { name: 'bookshelf_2',    pos: [-11.2, 2.25, -4],  size: [2.2, 4.5, 0.5], color: 0x4a2208 },
  { name: 'bookshelf_3',    pos: [-11.2, 2.25, 3],   size: [2.2, 4.5, 0.5], color: 0x4a2208 },
  { name: 'dining_table',   pos: [9, 0.82, 3.0],    size: [3.5, 0.1, 1.6], color: 0xa05828 },
  { name: 'chairs',         pos: [9, 0.55, 3.0],    size: [1.0, 0.8, 1.0], color: 0xa05828 },
  { name: 'desk',           pos: [10.2, 0.82, -4.0], size: [2.4, 0.07, 1.0], color: 0x7a3a10 },
  { name: 'monitor',        pos: [10.2, 1.28, -4.0], size: [0.07, 0.75, 1.1], color: 0x101010 },
  { name: 'office_chair',   pos: [10.2, 0.82, -5.2], size: [0.75, 0.09, 0.75], color: 0x2a4a25 },
  { name: 'floor_lamps',   pos: [5, 2.4, -8],      size: [0.3, 2.3, 0.3], color: 0xffcc66 },
  { name: 'plants',         pos: [0, 0.2, 12],      size: [0.6, 1.2, 0.6], color: 0x2a6015 },
  { name: 'chandelier',     pos: [0, 5.7, 0],       size: [1.5, 1.5, 1.5], color: 0xc8a832 },
  { name: 'piano',          pos: [9, 0.5, -11.5],   size: [2.6, 1.0, 1.6], color: 0x0a0a12 },
  { name: 'billiard_table', pos: [-3, 0.45, 4.0],   size: [3.6, 0.9, 2.0], color: 0x4a2208 },
  { name: 'bar_counter',    pos: [-9.2, 0.58, 10.5], size: [5.5, 1.15, 0.9], color: 0x4a2208 },
  { name: 'trophy_cabinet',  pos: [10.0, 1.9, 8.5], size: [2.2, 3.8, 0.55], color: 0x4a2208 },
  { name: 'grandfather_clock', pos: [-10.8, 1.4, -9.0], size: [0.65, 2.8, 0.5], color: 0x5a3010 },
  { name: 'armchair',       pos: [4.5, 0.25, -9.8], size: [1.1, 0.5, 1.0], color: 0x2a1508 },
  { name: 'paintings',      pos: [0, 3.2, -13.88], size: [2.5, 0.1, 1.8], color: 0xc09050 },
  { name: 'pillars',        pos: [-7, 0.15, 10],   size: [0.7, 4.5, 0.7], color: 0xe0d8c8 },
  { name: 'rugs',           pos: [0, 0.02, -9.5],   size: [7.0, 0.04, 5.5], color: 0x7a2020 },
];

// ── Create All Meshes ─────────────────────────────────────────────────────────
export function createObjects(scene) {
  const meshMap = {};

  OBJECT_DEFS.forEach(def => {
    const geometry = new THREE.BoxGeometry(...def.size);
    const material = new THREE.MeshPhongMaterial({
      color: def.color,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      def.pos[0],
      def.pos[1], // Use exactly the position from the explorer
      def.pos[2]
    );
    mesh.castShadow    = true;
    mesh.receiveShadow = true;

    mesh.userData = {
      slotName:   def.name,
      baseColor:  def.color,
      state:      STATES.LOCKED,
      hasContent: false
    };

    updateObjectState(mesh, STATES.LOCKED);
    scene.add(mesh);
    meshMap[def.name] = mesh;
  });

  return meshMap;
}

// ── Visual State Updater ──────────────────────────────────────────────────────
export function updateObjectState(mesh, newState) {
  mesh.userData.state = newState;
  const mat = mesh.material;
  const baseColor = new THREE.Color(mesh.userData.baseColor);

  switch (newState) {
    case STATES.LOCKED:
      mat.color.setHex(0x444444);
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
      mat.opacity     = 0.5;
      mat.transparent = true;
      break;

    case STATES.LEARNING:
      mat.color.copy(baseColor);
      mat.emissive.setHex(0x222222);
      mat.emissiveIntensity = 0.1;
      mat.opacity     = 1;
      mat.transparent = false;
      break;

    case STATES.MASTERED:
      mat.color.copy(baseColor);
      mat.emissive.setHex(0xffd700);
      mat.emissiveIntensity = 0.3;
      mat.opacity     = 1;
      mat.transparent = false;
      break;

    case STATES.REVIEW:
      mat.color.copy(baseColor);
      mat.emissive.setHex(0x4488ff);
      mat.emissiveIntensity = 0.4;
      mat.opacity     = 1;
      mat.transparent = false;
      break;
  }
}

// ── Assign Claude Concepts to Meshes ─────────────────────────────────────────
export function assignConceptsToMeshes(meshMap, conceptsObj) {
  Object.entries(conceptsObj).forEach(([slotName, data]) => {
    const mesh = meshMap[slotName];
    if (!mesh) return;

    mesh.userData.hasContent       = true;
    mesh.userData.concept          = data.concept;
    mesh.userData.detail           = data.detail;
    mesh.userData.mnemonic         = data.mnemonic;
    mesh.userData.theme            = data.theme;
    mesh.userData.importance       = data.importance;
    mesh.userData.teaching_context = data.teaching_context || '';
  });
}
