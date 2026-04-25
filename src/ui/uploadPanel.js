// src/ui/uploadPanel.js
import { parsePDF } from '../api/pdfParser.js';

const pdfInput = document.getElementById('pdf-input');
const notesInput = document.getElementById('notes-input');
const buildBtn = document.getElementById('build-btn');
const pdfFileName = document.getElementById('pdf-file-name');
const uploadPanel = document.getElementById('upload-panel');
const loading = document.getElementById('loading');

let currentSource = null;

export function setupUploadPanel(onBuildCallback) {
  // PDF file selection
  pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    pdfFileName.textContent = `📄 ${file.name}`;
    notesInput.value = ''; // Clear text input
    
    loading.classList.remove('hidden');
    
    try {
      const pdfData = await parsePDF(file);
      currentSource = pdfData.text;
      buildBtn.disabled = false;
      loading.classList.add('hidden');
    } catch (error) {
      console.error('PDF parsing error:', error);
      alert('Error parsing PDF. Please try a different file.');
      loading.classList.add('hidden');
    }
  });
  
  // Text input
  notesInput.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (text.length > 100) {
      currentSource = text;
      buildBtn.disabled = false;
      pdfFileName.textContent = ''; // Clear PDF name
    } else {
      buildBtn.disabled = true;
    }
  });
  
  // Build button
  buildBtn.addEventListener('click', async () => {
    if (!currentSource) return;
    
    uploadPanel.style.display = 'none';
    loading.classList.remove('hidden');

    // Premium Loading Animation
    const chips = [
      { title: "Reading Notes", desc: "Analyzing your source material", icon: "📄" },
      { title: "Spatial Mapping", desc: "Placing concepts in the hall", icon: "🏛️" },
      { title: "Synthesizing MNMNCS", desc: "Crafting vivid associations", icon: "💡" },
      { title: "AI Ready", desc: "Finalizing your learning palace", icon: "✨" }
    ];
    
    let chipIndex = 0;
    const wrapper = document.getElementById('chips-wrapper');
    const status = document.getElementById('loading-status');
    
    const nextChip = () => {
      const c = chips[chipIndex];
      status.textContent = c.title + "...";
      wrapper.innerHTML = `
        <div class="loading-chip">
          <div class="chip-icon">${c.icon}</div>
          <div class="chip-info">
            <span class="chip-title">${c.title}</span>
            <span class="chip-desc">${c.desc}</span>
          </div>
        </div>
      `;
      chipIndex = (chipIndex + 1) % chips.length;
    };
    
    nextChip();
    const chipInterval = setInterval(nextChip, 3000);
    
    try {
      await onBuildCallback(currentSource);
    } finally {
      clearInterval(chipInterval);
    }
  });
}