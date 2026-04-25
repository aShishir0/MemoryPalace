// src/scene/room.js
import * as THREE from 'three';

export function buildRoom(scene) {
  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0x3d2b1f })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({ color: 0x1a1a2e })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8;
  scene.add(ceiling);

  // Walls — a single inside-out box
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(20, 8, 20),
    new THREE.MeshPhongMaterial({ color: 0x2c1810, side: THREE.BackSide })
  );
  room.position.y = 4;
  scene.add(room);
}