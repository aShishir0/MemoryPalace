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
    
    await onBuildCallback(currentSource);
  });
}