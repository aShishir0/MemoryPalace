// src/scene/objectBuilders.js
// Multi-primitive builders for realistic objects
import * as THREE from 'three';

const M = (c, r=0.7, m=0, e=0x000000) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e });

function box(w,h,d,mat){ return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); }
function cyl(r,h,s,mat){ return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s), mat); }
function sphere(r,mat){ return new THREE.Mesh(new THREE.SphereGeometry(r,12,12), mat); }

function grp(parts){ const g=new THREE.Group(); parts.forEach(p=>g.add(p)); return g; }
function pos(m,x,y,z){ m.position.set(x,y,z); return m; }

// ─── FIREPLACE ───
export function buildFireplace(){
  const g = new THREE.Group();
  // Back wall
  g.add(pos(box(5.5,4.5,0.4, M(0x2a1008)), 0,2.25,0));
  // Mantle
  g.add(pos(box(5.8,0.2,0.8, M(0x8b6040,0.5)), 0,3.3,0.2));
  // Pillars
  g.add(pos(box(0.35,2.8,0.5, M(0x8b6040)), -2.2,1.4,0.15));
  g.add(pos(box(0.35,2.8,0.5, M(0x8b6040)), 2.2,1.4,0.15));
  // Opening
  g.add(pos(box(3.8,0.15,0.5, M(0x333333)), 0,2.85,0.15));
  g.add(pos(box(3.8,2.2,0.3, M(0x111111,0.9)), 0,1.1,0.05));
  // Fire glow
  const fire = pos(box(2.5,0.8,0.2, M(0xff3300,0.5,0,0xff2200)), 0,0.5,0.2);
  fire.material.emissiveIntensity = 1.5;
  g.add(fire);
  // Logs
  g.add(pos(cyl(0.12,2.0,6, M(0x3a1a08)), 0,0.15,0.3));
  g.children[g.children.length-1].rotation.z = Math.PI/2;
  return g;
}

// ─── SOFA ───
export function buildSofa(){
  const g = new THREE.Group();
  const fab = M(0x1a2840);
  // Base/seat
  g.add(pos(box(4.0,0.35,1.1, fab), 0,0.25,0));
  // Back
  g.add(pos(box(4.0,0.6,0.2, fab), 0,0.7,-0.45));
  // Cushions
  for(let i=-1;i<=1;i++)
    g.add(pos(box(1.2,0.15,0.9, M(0x223355)), i*1.3,0.5,0.05));
  // Arms
  g.add(pos(box(0.2,0.45,1.1, fab), -1.9,0.45,0));
  g.add(pos(box(0.2,0.45,1.1, fab), 1.9,0.45,0));
  // Legs
  for(let x of[-1.7,1.7]) for(let z of[-0.4,0.4])
    g.add(pos(cyl(0.05,0.12,6, M(0x333333,0.3,0.8)), x,0.06,z));
  return g;
}

// ─── COFFEE TABLE ───
export function buildCoffeeTable(){
  const g = new THREE.Group();
  const wd = M(0x7a3a10,0.6);
  g.add(pos(box(2.2,0.06,1.0, wd), 0,0.48,0));
  g.add(pos(box(1.8,0.03,0.7, M(0x88888840,0.2,0.1)), 0,0.52,0));
  for(let x of[-0.9,0.9]) for(let z of[-0.4,0.4])
    g.add(pos(cyl(0.04,0.42,6, M(0x444444,0.3,0.7)), x,0.24,z));
  return g;
}

// ─── BOOKSHELF ───
export function buildBookshelf(){
  const g = new THREE.Group();
  const wd = M(0x4a2208,0.8);
  // Frame
  g.add(pos(box(2.2,4.5,0.5, wd), 0,2.25,0));
  // Shelves
  for(let y=0.5; y<4.5; y+=0.9)
    g.add(pos(box(2.0,0.06,0.48, M(0x5a3218)), 0,y,0.01));
  // Books (colored blocks per shelf)
  const colors = [0xaa2222,0x2244aa,0x22aa44,0xaa8822,0x8822aa];
  for(let si=0; si<4; si++){
    const y = 0.55 + si*0.9;
    for(let bi=0; bi<5; bi++){
      const bk = box(0.15+Math.random()*0.1, 0.6+Math.random()*0.2, 0.35,
        M(colors[(si*5+bi)%colors.length]));
      bk.position.set(-0.7+bi*0.35, y+0.35, 0);
      g.add(bk);
    }
  }
  return g;
}

// ─── DINING TABLE ───
export function buildDiningTable(){
  const g = new THREE.Group();
  const wd = M(0xa05828,0.6);
  g.add(pos(box(3.5,0.1,1.6, wd), 0,0.82,0));
  for(let x of[-1.5,1.5]) for(let z of[-0.6,0.6])
    g.add(pos(cyl(0.06,0.78,8, M(0x5a3010,0.5,0.2)), x,0.41,z));
  return g;
}

// ─── CHAIR ───
export function buildChairs(){
  const g = new THREE.Group();
  const wd = M(0xa05828,0.7);
  for(let dx of[-0.8,0.8]){
    const c = new THREE.Group();
    c.add(pos(box(0.5,0.04,0.5, wd), 0,0.5,0));
    c.add(pos(box(0.5,0.6,0.06, wd), 0,0.8,-0.22));
    for(let x of[-0.2,0.2]) for(let z of[-0.2,0.2])
      c.add(pos(cyl(0.03,0.5,6, wd), x,0.25,z));
    c.position.set(dx,0,0.8);
    g.add(c);
    const c2 = c.clone();
    c2.position.set(dx,0,-0.8);
    c2.rotation.y = Math.PI;
    g.add(c2);
  }
  return g;
}

// ─── DESK ───
export function buildDesk(){
  const g = new THREE.Group();
  const wd = M(0x7a3a10,0.6);
  g.add(pos(box(2.4,0.07,1.0, wd), 0,0.82,0));
  // Drawers
  g.add(pos(box(0.7,0.5,0.9, M(0x5a2a08)), -0.7,0.55,0));
  g.add(pos(box(0.08,0.04,0.05, M(0xccaa66,0.3,0.6)), -0.7,0.65,0.46));
  g.add(pos(box(0.08,0.04,0.05, M(0xccaa66,0.3,0.6)), -0.7,0.45,0.46));
  // Legs
  g.add(pos(cyl(0.04,0.78,6, M(0x444444,0.3,0.7)), 1.0,0.39,-0.4));
  g.add(pos(cyl(0.04,0.78,6, M(0x444444,0.3,0.7)), 1.0,0.39,0.4));
  return g;
}

// ─── MONITOR ───
export function buildMonitor(){
  const g = new THREE.Group();
  // Screen
  const screen = pos(box(0.05,0.65,1.0, M(0x050510,0.3,0.1)), 0,1.28,0);
  g.add(screen);
  // Bezel
  g.add(pos(box(0.06,0.7,1.05, M(0x222222,0.5,0.3)), 0,1.28,0));
  // Stand
  g.add(pos(cyl(0.04,0.25,8, M(0x333333,0.3,0.7)), 0,0.98,0));
  g.add(pos(box(0.05,0.02,0.35, M(0x333333,0.3,0.7)), 0,0.86,0));
  // Screen glow
  const glow = pos(box(0.04,0.55,0.85, M(0x1144aa,0.5,0,0x2266cc)), 0.04,1.28,0);
  glow.material.emissiveIntensity = 0.6;
  g.add(glow);
  return g;
}

// ─── OFFICE CHAIR ───
export function buildOfficeChair(){
  const g = new THREE.Group();
  const fab = M(0x2a4a25);
  g.add(pos(box(0.6,0.08,0.6, fab), 0,0.52,0));
  g.add(pos(box(0.55,0.6,0.08, fab), 0,0.85,-0.26));
  g.add(pos(cyl(0.04,0.35,8, M(0x333333,0.3,0.8)), 0,0.33,0));
  // Wheel base
  for(let a=0;a<5;a++){
    const arm = pos(cyl(0.02,0.3,6, M(0x333333,0.3,0.8)), 0.15,0.08,0);
    arm.rotation.z = Math.PI/2;
    const pivot = new THREE.Group();
    pivot.add(arm);
    pivot.rotation.y = (a/5)*Math.PI*2;
    g.add(pivot);
  }
  return g;
}

// ─── FLOOR LAMP ───
export function buildFloorLamp(){
  const g = new THREE.Group();
  g.add(pos(cyl(0.25,0.05,12, M(0x444444,0.3,0.7)), 0,0.025,0));
  g.add(pos(cyl(0.03,2.0,8, M(0x888866,0.4,0.5)), 0,1.05,0));
  // Shade
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25,0.35,0.4,12,1,true),
    M(0xffeecc,0.9,0,0xffcc66)
  );
  shade.material.emissiveIntensity = 0.4;
  shade.material.side = THREE.DoubleSide;
  shade.position.set(0,2.2,0);
  g.add(shade);
  return g;
}

// ─── PLANT ───
export function buildPlant(){
  const g = new THREE.Group();
  // Pot
  g.add(pos(cyl(0.25,0.4,8, M(0x8b4513)), 0,0.2,0));
  g.add(pos(cyl(0.28,0.05,8, M(0x7a3a10)), 0,0.42,0));
  // Soil
  g.add(pos(cyl(0.22,0.05,8, M(0x2a1a08)), 0,0.43,0));
  // Leaves (spheres)
  for(let i=0;i<6;i++){
    const a = (i/6)*Math.PI*2;
    const leaf = sphere(0.18, M(0x2a6015,0.8,0,0x0a2005));
    leaf.position.set(Math.cos(a)*0.15, 0.7+Math.random()*0.3, Math.sin(a)*0.15);
    leaf.scale.set(1, 0.6+Math.random()*0.4, 1);
    g.add(leaf);
  }
  g.add(pos(sphere(0.22, M(0x33771a,0.8,0,0x0a2005)), 0,0.85,0));
  return g;
}

// ─── CHANDELIER ───
export function buildChandelier(){
  const g = new THREE.Group();
  const gold = M(0xc8a832,0.3,0.6);
  g.add(pos(cyl(0.04,0.6,6, gold), 0,0.3,0));
  g.add(pos(cyl(0.5,0.08,16, gold), 0,0,0));
  // Arms + candles
  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2;
    const arm = pos(cyl(0.02,0.6,4, gold), Math.cos(a)*0.5,-0.15,Math.sin(a)*0.5);
    arm.rotation.z = Math.PI/2;
    arm.rotation.y = -a;
    g.add(arm);
    const candle = pos(cyl(0.03,0.15,6, M(0xfffff0)), Math.cos(a)*0.8,-0.05,Math.sin(a)*0.8);
    g.add(candle);
    const flame = pos(sphere(0.03, M(0xffaa00,0.5,0,0xff8800)), Math.cos(a)*0.8,0.05,Math.sin(a)*0.8);
    flame.material.emissiveIntensity = 2;
    g.add(flame);
  }
  return g;
}

// ─── PIANO ───
export function buildPiano(){
  const g = new THREE.Group();
  const blk = M(0x0a0a12,0.5,0.1);
  g.add(pos(box(2.6,0.8,1.6, blk), 0,0.4,0));
  g.add(pos(box(2.6,0.6,0.08, blk), 0,1.1,-0.76));
  // Keys
  const wk = M(0xfff8e8,0.4);
  const bk = M(0x111111,0.5);
  for(let i=0;i<20;i++){
    g.add(pos(box(0.1,0.02,0.3, wk), -1.1+i*0.115, 0.82, 0.6));
    if(i%7!==2 && i%7!==6 && i<19)
      g.add(pos(box(0.06,0.03,0.18, bk), -1.05+i*0.115, 0.84, 0.52));
  }
  // Legs
  for(let x of[-1.1,1.1]) g.add(pos(cyl(0.06,0.4,6, blk), x,0,0.5));
  g.add(pos(cyl(0.06,0.4,6, blk), 0,0,-0.6));
  return g;
}

// ─── BILLIARD TABLE ───
export function buildBilliardTable(){
  const g = new THREE.Group();
  const wd = M(0x4a2208,0.7);
  g.add(pos(box(3.6,0.15,2.0, wd), 0,0.88,0));
  // Green felt
  g.add(pos(box(3.3,0.04,1.7, M(0x0a5a20,0.9)), 0,0.96,0));
  // Rails
  g.add(pos(box(3.6,0.1,0.12, M(0x3a1808)), 0,0.98,-0.94));
  g.add(pos(box(3.6,0.1,0.12, M(0x3a1808)), 0,0.98,0.94));
  g.add(pos(box(0.12,0.1,2.0, M(0x3a1808)), -1.74,0.98,0));
  g.add(pos(box(0.12,0.1,2.0, M(0x3a1808)), 1.74,0.98,0));
  // Legs
  for(let x of[-1.6,1.6]) for(let z of[-0.8,0.8])
    g.add(pos(cyl(0.08,0.8,8, wd), x,0.4,z));
  return g;
}

// ─── BAR COUNTER ───
export function buildBarCounter(){
  const g = new THREE.Group();
  const wd = M(0x4a2208,0.7);
  g.add(pos(box(5.5,1.15,0.9, wd), 0,0.58,0));
  g.add(pos(box(5.7,0.08,1.0, M(0x6a3a18,0.5)), 0,1.18,0));
  // Bottles
  for(let i=0;i<6;i++){
    const c = [0x22aa44,0xaa6622,0x4422aa,0xaa2222,0x228888,0xaaaa22][i];
    g.add(pos(cyl(0.05,0.3,8, M(c,0.2,0.1)), -2+i*0.8, 1.35, -0.2));
  }
  // Stools
  for(let i=0;i<3;i++){
    const s = new THREE.Group();
    s.add(pos(cyl(0.18,0.04,8, M(0x2a1a08)), 0,0.65,0));
    s.add(pos(cyl(0.03,0.6,6, M(0x444444,0.3,0.7)), 0,0.34,0));
    s.position.set(-1.8+i*1.8, 0, 0.8);
    g.add(s);
  }
  return g;
}

// ─── TROPHY CABINET ───
export function buildTrophyCabinet(){
  const g = new THREE.Group();
  const wd = M(0x4a2208,0.7);
  g.add(pos(box(2.2,3.8,0.55, wd), 0,1.9,0));
  // Glass front
  const glass = pos(box(1.9,3.4,0.02, new THREE.MeshStandardMaterial({
    color: 0xaaccff, roughness:0.1, metalness:0.1, transparent:true, opacity:0.15
  })), 0,1.9,0.28);
  g.add(glass);
  // Shelves + trophies
  for(let si=0;si<4;si++){
    const y = 0.5 + si*0.9;
    g.add(pos(box(1.9,0.04,0.5, M(0x5a3218)), 0,y,0));
    // Trophy
    const t = new THREE.Group();
    t.add(pos(cyl(0.08,0.02,8, M(0xdaa520,0.2,0.8)), 0,0,0));
    t.add(pos(cyl(0.03,0.15,6, M(0xdaa520,0.2,0.8)), 0,0.08,0));
    t.add(pos(sphere(0.06, M(0xdaa520,0.2,0.8)), 0,0.2,0));
    t.position.set(-0.4+si*0.3, y+0.05, 0);
    g.add(t);
  }
  return g;
}

// ─── GRANDFATHER CLOCK ───
export function buildGrandfatherClock(){
  const g = new THREE.Group();
  const wd = M(0x5a3010,0.7);
  g.add(pos(box(0.55,2.0,0.4, wd), 0,1.0,0));
  g.add(pos(box(0.65,0.8,0.5, wd), 0,2.4,0));
  g.add(pos(box(0.6,0.15,0.45, M(0x6a4020)), 0,2.85,0));
  // Clock face
  g.add(pos(cyl(0.22,0.03,16, M(0xfff8e0,0.5)), 0,2.4,0.26));
  g.children[g.children.length-1].rotation.x = Math.PI/2;
  // Pendulum
  g.add(pos(cyl(0.01,0.8,4, M(0xccaa44,0.3,0.7)), 0,0.5,0.15));
  g.add(pos(cyl(0.06,0.02,12, M(0xdaa520,0.2,0.8)), 0,0.1,0.15));
  return g;
}

// ─── ARMCHAIR ───
export function buildArmchair(){
  const g = new THREE.Group();
  const fab = M(0x5a2a15,0.85);
  g.add(pos(box(1.0,0.25,0.9, fab), 0,0.2,0));
  g.add(pos(box(1.0,0.55,0.15, fab), 0,0.5,-0.38));
  g.add(pos(box(0.15,0.35,0.9, fab), -0.42,0.35,0));
  g.add(pos(box(0.15,0.35,0.9, fab), 0.42,0.35,0));
  // Cushion
  g.add(pos(box(0.75,0.1,0.7, M(0x6a3a1a)), 0,0.35,0.05));
  // Legs
  for(let x of[-0.4,0.4]) for(let z of[-0.35,0.35])
    g.add(pos(cyl(0.035,0.1,6, M(0x333333,0.3,0.7)), x,0.05,z));
  return g;
}

// ─── PAINTINGS ───
export function buildPaintings(){
  const g = new THREE.Group();
  // Frame
  g.add(pos(box(2.5,0.08,1.8, M(0xc09050,0.4,0.3)), 0,0,0));
  // Canvas
  g.add(pos(box(2.2,0.06,1.5, M(0x2a4a6a,0.9)), 0,0.02,0));
  // Inner frame detail
  g.add(pos(box(2.35,0.07,0.04, M(0xdaa520,0.3,0.5)), 0,0.01,0.77));
  g.add(pos(box(2.35,0.07,0.04, M(0xdaa520,0.3,0.5)), 0,0.01,-0.77));
  g.add(pos(box(0.04,0.07,1.5, M(0xdaa520,0.3,0.5)), 1.17,0.01,0));
  g.add(pos(box(0.04,0.07,1.5, M(0xdaa520,0.3,0.5)), -1.17,0.01,0));
  return g;
}

// ─── PILLAR ───
export function buildPillar(){
  const g = new THREE.Group();
  const marble = M(0xe0d8c8,0.3,0.1);
  g.add(pos(box(0.8,0.2,0.8, marble), 0,0.1,0));
  g.add(pos(cyl(0.3,4.0,12, marble), 0,2.2,0));
  g.add(pos(box(0.85,0.2,0.85, marble), 0,4.3,0));
  // Fluting detail
  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2;
    const f = pos(cyl(0.04,3.8,4, M(0xd0c8b8,0.4,0.1)),
      Math.cos(a)*0.28, 2.2, Math.sin(a)*0.28);
    g.add(f);
  }
  return g;
}

// ─── RUG ───
export function buildRug(){
  const g = new THREE.Group();
  g.add(pos(box(7.0,0.03,5.5, M(0x7a2020,0.95)), 0,0.015,0));
  // Border pattern
  g.add(pos(box(6.6,0.035,0.15, M(0xc9a84c,0.9)), 0,0.025,-2.55));
  g.add(pos(box(6.6,0.035,0.15, M(0xc9a84c,0.9)), 0,0.025,2.55));
  g.add(pos(box(0.15,0.035,5.5, M(0xc9a84c,0.9)), -3.3,0.025,0));
  g.add(pos(box(0.15,0.035,5.5, M(0xc9a84c,0.9)), 3.3,0.025,0));
  // Center medallion
  g.add(pos(cyl(0.8,0.04,16, M(0x9a3030,0.95)), 0,0.03,0));
  g.add(pos(cyl(0.5,0.045,16, M(0xb08930,0.9)), 0,0.035,0));
  return g;
}

export function buildWallFrame(){
  const g = new THREE.Group();
  // Ornate outer frame
  g.add(pos(box(2.8, 2.2, 0.12, M(0x7a5030, 0.4, 0.2)), 0, 0, 0));
  // Inner gold inlay
  g.add(pos(box(2.5, 1.95, 0.11, M(0xc9a84c, 0.3, 0.4)), 0, 0, 0.005));
  // Canvas area (inset) — texture applied here
  const canvas = pos(box(2.3, 1.75, 0.06, M(0xffffff, 0.9)), 0, 0, 0.06);
  canvas.name = 'painting_canvas';
  g.add(canvas);
  return g;
}

export const BUILDERS = {
  fireplace: buildFireplace,
  sofa: buildSofa,
  coffee_table: buildCoffeeTable,
  bookshelf_1: buildBookshelf,
  bookshelf_2: buildBookshelf,
  bookshelf_3: buildBookshelf,
  dining_table: buildDiningTable,
  chairs: buildChairs,
  desk: buildDesk,
  monitor: buildMonitor,
  office_chair: buildOfficeChair,
  floor_lamps: buildFloorLamp,
  plants: buildPlant,
  chandelier: buildChandelier,
  piano: buildPiano,
  billiard_table: buildBilliardTable,
  bar_counter: buildBarCounter,
  trophy_cabinet: buildTrophyCabinet,
  grandfather_clock: buildGrandfatherClock,
  armchair: buildArmchair,
  paintings: buildPaintings,
  pillars: buildPillar,
  rugs: buildRug,
  // painting_1..10 — distributed across all 4 walls
  painting_1:  buildWallFrame,
  painting_2:  buildWallFrame,
  painting_3:  buildWallFrame,
  painting_4:  buildWallFrame,
  painting_5:  buildWallFrame,
  painting_6:  buildWallFrame,
  painting_7:  buildWallFrame,
  painting_8:  buildWallFrame,
  painting_9:  buildWallFrame,
  painting_10: buildWallFrame,
};
