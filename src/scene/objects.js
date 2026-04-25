// src/scene/objects.js
import * as THREE from 'three';

// ── Object Visual States ──────────────────────────────────────────────────────
export const STATES = {
  LOCKED:   'locked',    // Not yet taught — gray/faded
  LEARNING: 'learning',  // Currently being taught — normal color
  MASTERED: 'mastered',  // Successfully recalled — golden glow
  REVIEW:   'review'     // Due for spaced repetition — pulsing blue glow
};

export const OBJECT_SLOTS = [
  'sofa', 'armchair', 'bookshelf', 'desk',
  'painting_1', 'painting_2', 'painting_3',
  'window', 'lamp', 'plant', 'globe', 'clock'
];

// ── Object Definitions ────────────────────────────────────────────────────────
const OBJECT_DEFS = [
  { name: 'sofa',      pos: [-6,   0, -8],   size: [3,   1.2, 1.5], color: 0x8b4513 },
  { name: 'armchair',  pos: [ 6,   0, -8],   size: [1.5, 1.5, 1.5], color: 0xa0522d },
  { name: 'bookshelf', pos: [-9,   0,  0],   size: [0.5, 4,   3  ], color: 0x654321 },
  { name: 'desk',      pos: [ 7,   0,  3],   size: [2,   1.5, 1.2], color: 0x8b7355 },
  { name: 'painting_1',pos: [ 0,   3, -9.8], size: [2,   1.5, 0.1], color: 0xd4af37 },
  { name: 'painting_2',pos: [-5,   3, -9.8], size: [1.5, 2,   0.1], color: 0xcd7f32 },
  { name: 'painting_3',pos: [ 5,   3, -9.8], size: [1.5, 2,   0.1], color: 0xb8860b },
  { name: 'window',    pos: [ 9.8, 3, -3],   size: [0.1, 2,   1.5], color: 0x87ceeb },
  { name: 'lamp',      pos: [ 6.5, 2.5, 3],  size: [0.3, 1,   0.3], color: 0xffd700 },
  { name: 'plant',     pos: [-7,   0,  5],   size: [0.6, 1.2, 0.6], color: 0x228b22 },
  { name: 'globe',     pos: [ 7,   1.5, 3.5],size: [0.5, 0.5, 0.5], color: 0x4169e1 },
  { name: 'clock',     pos: [ 0,   5,  9.8], size: [1,   1,   0.1], color: 0xcd853f }
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
      def.pos[1] + def.size[1] / 2 + 0.01, // sit on floor
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
      // Blue glow — signals "time to review this"
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