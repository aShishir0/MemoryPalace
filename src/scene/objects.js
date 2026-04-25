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

// ── Base object slots (no painting frames — added dynamically) ───────────────
export const BASE_OBJECT_SLOTS = [
  'fireplace', 'sofa', 'coffee_table', 'bookshelf_1', 'bookshelf_2', 'bookshelf_3',
  'dining_table', 'chairs', 'desk', 'monitor', 'office_chair', 'floor_lamps',
  'plants', 'chandelier', 'piano', 'billiard_table', 'bar_counter', 'trophy_cabinet',
  'grandfather_clock', 'armchair', 'paintings', 'pillars', 'rugs',
];

// Max supported painting frames
const MAX_PAINTING_SLOTS = 10;

// Build the full slot list for a given image count
export function buildObjectSlots(imageCount = 0) {
  const count = Math.min(imageCount, MAX_PAINTING_SLOTS);
  const paintingSlots = Array.from({ length: count }, (_, i) => `painting_${i + 1}`);
  return [...BASE_OBJECT_SLOTS, ...paintingSlots];
}

// Keep a legacy export for anything that still references OBJECT_SLOTS
export const OBJECT_SLOTS = buildObjectSlots(0);

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
  painting_1:  { pos: [-11.88, 3.4, -7],   color: 0x604020 },  // left wall
  painting_2:  { pos: [-11.88, 3.4,  0],   color: 0x604020 },
  painting_3:  { pos: [-11.88, 3.4,  7],   color: 0x604020 },
  painting_4:  { pos: [-11.88, 3.4, 11],   color: 0x604020 },
  painting_5:  { pos: [ 11.88, 3.4,-11],   color: 0x604020 },  // right wall
  painting_6:  { pos: [ 11.88, 3.4, -7],   color: 0x604020 },
  painting_7:  { pos: [ 11.88, 3.4,  1],   color: 0x604020 },
  painting_8:  { pos: [ 11.88, 3.4,  5],   color: 0x604020 },
  painting_9:  { pos: [ -7.0,  3.4, -13.88], color: 0x604020 }, // back/fireplace wall
  painting_10: { pos: [  7.0,  3.4, -13.88], color: 0x604020 },
};

// ── Create All Meshes ─────────────────────────────────────────────────────────
export function createObjects(scene, imageCount = 0) {
  const meshMap = {};
  const slots   = buildObjectSlots(imageCount);

  slots.forEach(name => {
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

      // Auto-rotate paintings to face the room interior
      if (name.startsWith('painting_')) {
        const [px, , pz] = def.pos;
        if (px < -11)      mesh.rotation.y = Math.PI / 2;   // left wall → face right
        else if (px > 11)  mesh.rotation.y = -Math.PI / 2;  // right wall → face left
        else if (pz < -13) mesh.rotation.y = 0;             // back wall → face forward
        else if (pz > 13)  mesh.rotation.y = Math.PI;       // front wall → face backward
      }
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
export function assignConceptsToMeshes(meshMap, objectData, images = []) {
  let imageIndex = 0;

  console.log(`[objects] Assigning concepts. Images: ${images.length}`);

  for (const [name, data] of Object.entries(objectData)) {
    const mesh = meshMap[name];
    if (!mesh) continue;

    // The text LLM now provides concept/detail for paintings directly
    let resolvedData = { ...data };
    
    // Ensure paintings have a title/description alias for the UI if LLM only returned concept/detail
    if (name.startsWith('painting_')) {
      resolvedData.title = data.title || data.concept || `Figure`;
      resolvedData.description = data.description || data.detail || '';
    }

    mesh.userData = {
      ...mesh.userData,
      ...resolvedData,
      hasContent: true,
      revealed: false,
      assignedQuestion: resolvedData.socratic_question || '',
      imageUrl: null,
    };

    // Apply texture to painting frames
    if (name.startsWith('painting_') && imageIndex < images.length) {
      const imageUrl = images[imageIndex++];
      mesh.userData.imageUrl = imageUrl;

      console.log(`[objects] Applying image to ${name}...`);

      const texture = new THREE.TextureLoader().load(
        imageUrl,
        () => console.log(`[objects] ✓ Textured ${name}`),
        undefined,
        (err) => console.warn(`[objects] ✗ Texture failed ${name}:`, err)
      );
      texture.colorSpace = THREE.SRGBColorSpace;

      const canvasMesh = mesh.getObjectByName('painting_canvas');
      if (canvasMesh) {
        canvasMesh.material = new THREE.MeshStandardMaterial({
          map: texture, roughness: 0.4, metalness: 0.05,
        });
      } else {
        mesh.traverse(child => {
          if (child.isMesh && !child._textured) {
            child.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4 });
            child._textured = true;
          }
        });
      }
    }

    updateObjectState(mesh, STATES.LOCKED);
  }
}


