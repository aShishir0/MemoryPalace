// src/scene/index.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { buildRoom }      from './room.js';
import { createObjects }  from './objects.js';
import { setupLighting }  from './lighting.js';
import { setupControls }  from './controls.js';

export function initScene(canvas) {
  // ── Scene ──────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  scene.fog = new THREE.Fog(0x0a0a0f, 15, 30);

  // ── Camera ─────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.6, 8);

  // ── Renderer ───────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

  // ── Room + Objects + Lighting ──────────────────────────────────
  buildRoom(scene);
  const meshMap = createObjects(scene);
  setupLighting(scene);

  // ── Pointer Lock Controls ──────────────────────────────────────
  const controls = new PointerLockControls(camera, canvas);

  // ── WASD Movement ──────────────────────────────────────────────
  const movePlayer = setupControls(controls);

  // ── Animation Loop ─────────────────────────────────────────────
  const clock = new THREE.Clock();
  const frameCallbacks = [];

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    movePlayer(delta);
    frameCallbacks.forEach(cb => cb(delta));
    renderer.render(scene, camera);
  }
  animate();

  // ── Responsive Resize ──────────────────────────────────────────
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