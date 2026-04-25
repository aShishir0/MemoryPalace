// src/scene/objects.js
import * as THREE from 'three';
import { BUILDERS } from './objectBuilders.js';

// ── Object Visual States ──────────────────────────────────────────────────────
export const STATES = {
  IDLE: 'idle',      // Default — fully opaque, base color, no learning state yet
  LOCKED: 'locked',    // Not yet taught — gray/faded (assessment mode)
  LEARNING: 'learning',  // Currently being taught — normal color
  MASTERED: 'mastered',  // Successfully recalled — golden glow
  REVIEW: 'review',     // Due for spaced repetition — pulsing blue glow
  ASSESSMENT_HOVER: 'assessment_hover' // Glow when hovered during assessment
};

// ── Updated Object Slots to match Grand Hall ──────────────────────────────────
export const OBJECT_SLOTS = [
  'fireplace', 'sofa', 'coffee_table', 'bookshelf_1', 'bookshelf_2', 'bookshelf_3',
  'dining_table', 'chairs', 'desk', 'monitor', 'office_chair', 'floor_lamps',
  'plants', 'chandelier', 'piano', 'billiard_table', 'bar_counter', 'trophy_cabinet',
  'grandfather_clock', 'armchair', 'paintings', 'pillars', 'rugs'
];

// ── Object positions (where each group is placed in the room) ─────────────────
const OBJECT_POSITIONS = {
  fireplace: { pos: [0, 0, -13.5], color: 0x8b3820 },
  sofa: { pos: [0, 0, -10], color: 0x1a2840 },
  coffee_table: { pos: [0, 0, -8.8], color: 0x7a3a10 },
  bookshelf_1: { pos: [-11.2, 0, -11], color: 0x4a2208 },
  bookshelf_2: { pos: [-11.2, 0, -4], color: 0x4a2208 },
  bookshelf_3: { pos: [-11.2, 0, 3], color: 0x4a2208 },
  dining_table: { pos: [9, 0, 3.0], color: 0xa05828 },
  chairs: { pos: [9, 0, 3.0], color: 0xa05828 },
  desk: { pos: [10.2, 0, -4.0], color: 0x7a3a10 },
  monitor: { pos: [10.2, 0, -4.0], color: 0x101010 },
  office_chair: { pos: [10.2, 0, -5.2], color: 0x2a4a25 },
  floor_lamps: { pos: [5, 0, -8], color: 0xffcc66 },
  plants: { pos: [0, 0, 12], color: 0x2a6015 },
  chandelier: { pos: [0, 5.7, 0], color: 0xc8a832 },
  piano: { pos: [9, 0, -11.5], color: 0x0a0a12 },
  billiard_table: { pos: [-3, 0, 4.0], color: 0x4a2208 },
  bar_counter: { pos: [-9.2, 0, 10.5], color: 0x4a2208 },
  trophy_cabinet: { pos: [10.0, 0, 8.5], color: 0x4a2208 },
  grandfather_clock: { pos: [-10.8, 0, -9.0], color: 0x5a3010 },
  armchair: { pos: [4.5, 0, -9.8], color: 0x2a1508 },
  paintings: { pos: [0, 3.2, -13.88], color: 0xc09050 },
  pillars: { pos: [-7, 0, 10], color: 0xe0d8c8 },
  rugs: { pos: [0, 0, -9.5], color: 0x7a2020 },
};

// ── Create All Meshes ─────────────────────────────────────────────────────────
export function createObjects(scene) {
  const meshMap = {};

  OBJECT_SLOTS.forEach(name => {
    const def = OBJECT_POSITIONS[name];
    if (!def) return;

    const builder = BUILDERS[name];
    let mesh;

    if (builder) {
      // Use detailed multi-primitive group
      mesh = builder();
      mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
      // Enable shadows on all children
      mesh.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    } else {
      // Fallback to simple box
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: def.color });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }

    mesh.userData = {
      slotName: name,
      baseColor: def.color,
      state: STATES.IDLE,
      hasContent: false
    };

    scene.add(mesh);
    meshMap[name] = mesh;
  });

  return meshMap;
}

// ── Visual State Updater ──────────────────────────────────────────────────────
export function updateObjectState(mesh, newState) {
  mesh.userData.state = newState;

  // For groups, apply state to all child meshes
  const targets = mesh.isGroup ? [] : [mesh];
  if (mesh.isGroup) {
    mesh.traverse(child => { if (child.isMesh) targets.push(child); });
  }

  const baseColor = new THREE.Color(mesh.userData.baseColor);

  targets.forEach(m => {
    const mat = m.material;
    // Store original color if not stored yet
    if (!m.userData._origColor) m.userData._origColor = mat.color.getHex();

    switch (newState) {
      case STATES.IDLE:
        mat.color.setHex(m.userData._origColor);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        if (!mat._wasTransparent) { mat.opacity = 1; mat.transparent = false; }
        break;

      case STATES.LOCKED:
        mat.color.lerpColors(new THREE.Color(m.userData._origColor), new THREE.Color(0x333333), 0.7);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.opacity = 0.45;
        mat.transparent = true;
        break;

      case STATES.ASSESSMENT_HOVER:
        mat.color.lerpColors(new THREE.Color(m.userData._origColor), new THREE.Color(0x333333), 0.4);
        mat.emissive.setHex(0x8b5cf6); // violet glow
        mat.emissiveIntensity = 0.3; // decreased from 0.5
        mat.opacity = 0.15; // decreased from 0.8
        mat.transparent = true;
        break;

      case STATES.LEARNING:
        mat.color.setHex(m.userData._origColor);
        mat.emissive.setHex(0x222222);
        mat.emissiveIntensity = 0.15;
        if (!mat._wasTransparent) { mat.opacity = 1; mat.transparent = false; }
        break;

      case STATES.MASTERED:
        mat.color.setHex(m.userData._origColor);
        mat.emissive.setHex(0xffd700);
        mat.emissiveIntensity = 0.35;
        if (!mat._wasTransparent) { mat.opacity = 1; mat.transparent = false; }
        break;

      case STATES.REVIEW:
        mat.color.setHex(m.userData._origColor);
        mat.emissive.setHex(0x4488ff);
        mat.emissiveIntensity = 0.25; // decreased from 0.45
        mat.opacity = 0.6; // added transparency
        mat.transparent = true;
        break;
    }
  });
}

// ── Assign Claude Concepts to Meshes ─────────────────────────────────────────
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
    mesh.userData.teaching_context = data.teaching_context || '';
    mesh.userData.assignedQuestion = data.socratic_question || '';
  });
}
