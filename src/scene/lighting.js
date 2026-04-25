// src/scene/lighting.js
import * as THREE from 'three';

export function setupLighting(scene) {
  // Warm ambient light
  const ambient = new THREE.AmbientLight(0xffe4b5, 0.5);
  scene.add(ambient);

  // Main overhead point light with shadows
  const mainLight = new THREE.PointLight(0xffd700, 0.8, 30);
  mainLight.position.set(0, 6, 0);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width  = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);

  // Accent lights in two diagonal corners for depth
  const accentLight1 = new THREE.PointLight(0xffcc88, 0.4, 15);
  accentLight1.position.set(-8, 3, -8);
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(0xffcc88, 0.4, 15);
  accentLight2.position.set(8, 3, 8);
  scene.add(accentLight2);

  return { ambient, mainLight, accentLight1, accentLight2 };
}