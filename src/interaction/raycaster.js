// src/interaction/raycaster.js
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0); // always cast from screen center (crosshair)

let lastHoveredGroup = null;

// Walk up the parent chain to find the root group that has slotName in userData
function findSlotRoot(object) {
  let current = object;
  while (current) {
    if (current.userData && current.userData.slotName) return current;
    current = current.parent;
  }
  return null;
}

export function setupRaycaster(camera, meshMap, onHover, onLeave) {
  const groups = Object.values(meshMap);

  function update() {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObjects(groups, true); // recursive for Groups

    if (hits.length > 0) {
      const root = findSlotRoot(hits[0].object);
      if (root) {
        if (root !== lastHoveredGroup) {
          lastHoveredGroup = root;
          onHover(root, hits[0].distance);
        } else {
          // Keep updating distance even if same object is hovered
          onHover(root, hits[0].distance);
        }
      }
    } else {
      if (lastHoveredGroup) {
        onLeave();
        lastHoveredGroup = null;
      }
    }
  }

  // Handle click interaction
  function handleInteraction() {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObjects(groups, true);
    if (hits.length > 0) {
      return { mesh: findSlotRoot(hits[0].object), distance: hits[0].distance };
    }
    return null;
  }

  return { update, handleInteraction };
}