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
    
    pdfFileName.textContent = `Parsing PDF...`;
    notesInput.value = ''; // Clear text input
    
    try {
      const pdfData = await parsePDF(file);
      currentSource = { text: pdfData.text, images: pdfData.images };
      buildBtn.disabled = false;
      pdfFileName.textContent = `📄 ${file.name}`;
    } catch (error) {
      console.error('PDF parsing error:', error);
      alert('Error parsing PDF. Please try a different file.');
      pdfFileName.textContent = 'Error parsing PDF';
    }
  });
  
  // Text input
  notesInput.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (text.length > 100) {
      currentSource = { text, images: [] };
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
    const stages = [
      { text: "READING NOTES" },
      { text: "MAPPING SPATIAL NODES" },
      { text: "SYNTHESIZING MNMNCS" },
      { text: "AI READY" }
    ];
    
    let stageIndex = 0;
    const status = document.getElementById('loading-status');
    const dots = document.querySelectorAll('.p-dot');
    const lineFill = document.getElementById('progress-line-fill');
    
    const nextStage = () => {
      const s = stages[stageIndex];
      status.textContent = s.text;
      
      dots.forEach((dot, idx) => {
        dot.className = 'p-dot';
        if (idx < stageIndex) dot.classList.add('active');
        else if (idx === stageIndex) dot.classList.add('current');
      });
      
      if (lineFill) {
        lineFill.style.width = `${(stageIndex / (stages.length - 1)) * 100}%`;
      }
      
      if (stageIndex < stages.length - 1) {
        stageIndex++;
      }
    };
    
    nextStage();
    const stageInterval = setInterval(nextStage, 4000);
    
    try {
      await onBuildCallback(currentSource);
    } finally {
      clearInterval(stageInterval);
    }
  });
}