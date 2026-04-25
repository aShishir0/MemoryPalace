// src/interaction/tooltip.js
import { store } from '../state/store.js';

const tooltip = document.getElementById('tooltip');

export function showTooltip(mesh, mode) {
  if (!mesh.userData.hasContent) return;

  const { concept, detail, mnemonic, slotName } = mesh.userData;

  if (mode === 'teaching') {
    // Full information shown during teaching mode
    tooltip.innerHTML = `
      <h3>${concept}</h3>
      <p>${detail}</p>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid #c9a84c;">
        <strong>💡 Mnemonic:</strong> ${mnemonic}
      </div>
    `;
  } else if (mode === 'assessment') {
    // Hide details until user has revealed the object
    if (mesh.userData.revealed) {
      tooltip.innerHTML = `
        <h3>${concept}</h3>
        <p>${detail}</p>
      `;
    } else {
      tooltip.innerHTML = `
        <h3>???</h3>
        <p>Try to recall what this <em>${slotName}</em> represents</p>
      `;
    }
  }

  tooltip.classList.remove('hidden');
}

export function hideTooltip() {
  tooltip.classList.add('hidden');
}