// src/scene/controls.js
// WASD movement logic — used by scene/index.js

export function setupControls(controls) {
  const keys = { w: false, a: false, s: false, d: false };

  document.addEventListener('keydown', e => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyD') keys.d = true;
    // Lock pointer on Enter if not already locked
    if (e.code === 'Enter' && !controls.isLocked) controls.lock();
  });

  document.addEventListener('keyup', e => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyD') keys.d = false;
  });

  // Returns a per-frame movement function — call with delta time each frame
  return function movePlayer(delta) {
    if (!controls.isLocked) return;
    const speed = 5 * delta;
    if (keys.w) controls.moveForward(speed);
    if (keys.s) controls.moveForward(-speed);
    if (keys.d) controls.moveRight(speed);
    if (keys.a) controls.moveRight(-speed);
  };
}