// src/ui/hud.js
import { store } from '../state/store.js';

const hud = document.getElementById('hud');

export function updateHUD() {
  const { palaceData } = store;
  if (!palaceData) return;

  hud.innerHTML = `
    <div><strong>🏛️ ${palaceData.palace_name}</strong></div>
    <div>📚 ${Object.keys(palaceData.objects).length} concepts</div>
    <div>🎨 ${palaceData.themes.join(', ')}</div>
    <div style="margin-top:8px; font-size:11px; color:#888;">
      WASD: Move &nbsp;|&nbsp; Mouse: Look &nbsp;|&nbsp; E: Self-Recall
    </div>
    <div style="margin-top:8px;">
      <button onclick="window.__toggleAudio()" style="
        background:none; border:1px solid #555; color:#aaa;
        padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;
      ">🔊 Toggle Sound</button>
    </div>
  `;

  hud.classList.remove('hidden');
}

export function setHUDMode(mode) {
  const badge = hud.querySelector('.mode-indicator');
  if (badge) badge.textContent = mode === 'teaching' ? '📖 Teaching' : '🎯 Assessment';
}