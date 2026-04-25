import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

let screenMesh;
let canvas;
let ctx;
let texture;

export function buildPresentationScreen(scene) {
  // Create a 2D canvas to draw text
  canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  ctx = canvas.getContext('2d');

  texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // The giant black rectangle in the room is at z = 14 (the window gap)
  // Let's create a screen mesh that perfectly fits there
  // Width 10, height 4.7
  const geometry = new THREE.PlaneGeometry(10, 4.7);
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    side: THREE.DoubleSide
  });

  screenMesh = new THREE.Mesh(geometry, material);
  screenMesh.position.set(0, 3.25, 13.9); 
  screenMesh.rotation.y = Math.PI;

  scene.add(screenMesh);
  
  // ── CSS3D Object for Teaching Panel ─────────────────────────────
  const panel = document.getElementById('teaching-panel');
  panel.classList.add('is-3d-tv');
  // Initially hidden
  panel.style.display = 'none';

  const cssObject = new CSS3DObject(panel);
  cssObject.position.set(0, 3.25, 13.88); // slightly in front of the TV mesh
  cssObject.rotation.y = Math.PI;
  // Panel is 1800 x 846 px, TV is 10 x 4.7 units
  // 10 / 1800 = 0.00555
  cssObject.scale.set(0.00555, 0.00555, 0.00555);
  scene.add(cssObject);

  // Expose it to toggle visibility later
  window.__css3dTeachingPanel = cssObject;

  // Initial empty state
  updateScreenContent("Memory Palace Enhanced", "Constructing Palace...");
  
  return screenMesh;
}

export function updateScreenContent(title, detailText) {
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#0a0a0f'; // Dark background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border / Glow effect
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  // Title
  ctx.fillStyle = '#e8d4a2'; // Golden color
  ctx.font = 'bold 80px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Draw title
  ctx.fillText(title, canvas.width / 2, 100);

  // Line separator
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 400, 220);
  ctx.lineTo(canvas.width / 2 + 400, 220);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Details
  ctx.fillStyle = '#ffffff';
  ctx.font = '50px "Inter", sans-serif';
  ctx.textAlign = 'left';
  
  // Word wrap logic for detail text
  const words = detailText.split(' ');
  let line = '';
  let y = 320;
  const maxWidth = canvas.width - 300; // 150px padding on each side
  const x = 150;
  const lineHeight = 75;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);

  // Mark texture for update
  texture.needsUpdate = true;
}
