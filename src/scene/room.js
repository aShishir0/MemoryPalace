// src/scene/room.js
import * as THREE from 'three';

// ── Materials Helper ──────────────────────────────────────────────────────────
function mat(color, rough=0.8, metal=0, emi=0x000000, emiInt=0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive: emi, emissiveIntensity: emiInt });
}

export function buildRoom(scene) {
  const RW=24, RH=6.5, RD=28;

  const mFloorA  = mat(0x9b7820, 0.85);
  const mFloorB  = mat(0x5e4810, 0.85);
  const mWall    = mat(0xc8aa80, 0.95);
  const mWallPnl = mat(0xb8955e, 0.9);
  const mCeiling = mat(0xf5eedd, 0.98);
  const mWood    = mat(0x7a3a10, 0.72, 0.05);
  const mWoodLt  = mat(0xa05828, 0.72, 0.05);
  const mWoodDk  = mat(0x4a2208, 0.8, 0.05);
  const mMarble  = mat(0xe8e0d0, 0.4, 0.1);
  const mMarbleDk= mat(0xa09880, 0.4, 0.1);

  // Marble checkerboard floor
  for (let i=-12;i<12;i++) for(let j=-14;j<14;j++){
    const m = (i+j)%2===0 ? mMarble : mMarbleDk;
    const t = new THREE.Mesh(new THREE.BoxGeometry(1,0.08,1),m);
    t.position.set(i+0.5,-0.04,j+0.5);
    t.receiveShadow=true; scene.add(t);
  }

  // Ceiling with coffers
  const cMain = new THREE.Mesh(new THREE.BoxGeometry(RW,0.15,RD), mCeiling);
  cMain.position.set(0,RH,0);
  scene.add(cMain);

  for(let x=-9;x<=9;x+=6) for(let z=-12;z<=12;z+=6){
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(5,0.06,5),mat(0xe8e0d0,0.97));
    c1.position.set(x,RH-0.08,z);
    scene.add(c1);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(4.5,0.04,4.5),mWallPnl);
    c2.position.set(x,RH-0.1,z);
    scene.add(c2);
  }

  // Walls
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.2,RH,RD),mWall);
  w1.position.set(-RW/2,RH/2,0);
  scene.add(w1);
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.2,RH,RD),mWall);
  w2.position.set(RW/2,RH/2,0);
  scene.add(w2);
  const w3 = new THREE.Mesh(new THREE.BoxGeometry(RW, RH,0.2),mWall);
  w3.position.set(0,RH/2,-RD/2);
  scene.add(w3);

  const w4a = new THREE.Mesh(new THREE.BoxGeometry(7,RH,0.2),mWall);
  w4a.position.set(-8.5,RH/2,RD/2);
  scene.add(w4a);
  const w4b = new THREE.Mesh(new THREE.BoxGeometry(7,RH,0.2),mWall);
  w4b.position.set(8.5,RH/2,RD/2);
  scene.add(w4b);
  const w4c = new THREE.Mesh(new THREE.BoxGeometry(RW,1.2,0.2),mWall);
  w4c.position.set(0,RH-0.6,RD/2);
  scene.add(w4c);
  const w4d = new THREE.Mesh(new THREE.BoxGeometry(10,0.4,0.2),mWallPnl);
  w4d.position.set(0,RH-1.4,RD/2);
  scene.add(w4d);

  // Wall paneling (wainscoting)
  const panels = [
    [-RW/2+0.12,0,0.08,RD],
    [ RW/2-0.12,0,0.08,RD],
    [0,-RD/2+0.12,RW,0.08],
  ];
  panels.forEach(([x,z,w,d]) => {
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(w,1.2,d),mWoodDk);
    p1.position.set(x,0.6,z);
    scene.add(p1);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(w,0.08,d),mWoodLt);
    p2.position.set(x,1.24,z);
    scene.add(p2);
  });

  // Baseboard
  const bases = [
    [-RW/2+0.12,0,0.05,RD],
    [ RW/2-0.12,0,0.05,RD],
    [0,-RD/2+0.12,RW,0.05],
    [0, RD/2-0.12,RW,0.05],
  ];
  bases.forEach(([x,z,w,d]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w,0.18,d),mWoodDk);
    b.position.set(x,0.09,z);
    scene.add(b);
  });

  // Crown molding
  const crowns = [
    [-RW/2+0.12,0,0.06,RD],
    [ RW/2-0.12,0,0.06,RD],
    [0,-RD/2+0.12,RW,0.06],
  ];
  crowns.forEach(([x,z,w,d]) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w,0.25,d),mWoodDk);
    c.position.set(x,RH-0.13,z);
    scene.add(c);
  });

  // Ceiling beams
  for(let x=-8;x<=8;x+=8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.3,RD),mWoodDk);
    beam.position.set(x,RH-0.15,0);
    scene.add(beam);
  }
  for(let z=-8;z<=8;z+=8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(RW,0.3,0.2),mWoodDk);
    beam.position.set(0,RH-0.15,z);
    scene.add(beam);
  }
}
