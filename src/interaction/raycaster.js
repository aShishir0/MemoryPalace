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