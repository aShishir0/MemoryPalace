// src/scene/lighting.js
import * as THREE from 'three';

export function setupLighting(scene) {
  // Warm ambient light
  const ambient = new THREE.AmbientLight(0xffe8c0, 0.25);
  scene.add(ambient);

  // Main Chandelier light (center)
  const chanLight = new THREE.PointLight(0xfff8e0, 3.5, 22);
  chanLight.position.set(0, 5.5, 0);
  chanLight.castShadow = true;
  chanLight.shadow.mapSize.set(2048, 2048);
  chanLight.shadow.radius = 6;
  scene.add(chanLight);

  // Secondary chandeliers
  const chanLight2 = new THREE.PointLight(0xffe0a0, 2.0, 18);
  chanLight2.position.set(-9, 5.5, -9);
  scene.add(chanLight2);

  const chanLight3 = new THREE.PointLight(0xffe0a0, 2.0, 18);
  chanLight3.position.set(9, 5.5, -9);
  scene.add(chanLight3);

  // Fireplace light (warm/reddish)
  const fireLight = new THREE.PointLight(0xff5500, 2.5, 9);
  fireLight.position.set(0, 1.0, -13.5);
  scene.add(fireLight);

  // Bar light (warm)
  const barLight = new THREE.PointLight(0xff9922, 1.5, 8);
  barLight.position.set(-11, 2.5, 9);
  scene.add(barLight);

  // Window blue fill
  const winLight = new THREE.DirectionalLight(0x7ab0ff, 0.5);
  winLight.position.set(14, 5, 4);
  scene.add(winLight);

  // Floor lamp lights
  const fl1 = new THREE.PointLight(0xffcc66, 1.2, 7);
  fl1.position.set(-8, 2.4, -4); scene.add(fl1);
  const fl2 = new THREE.PointLight(0xffcc66, 1.2, 7);
  fl2.position.set(11, 2.4, 5); scene.add(fl2);
  const fl3 = new THREE.PointLight(0xffcc66, 1.0, 6);
  fl3.position.set(5, 2.4, -8); scene.add(fl3);

  return { ambient, chanLight, fireLight, barLight, winLight };
}
