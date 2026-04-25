// src/ui/progressBar.js

const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const progressBar = document.getElementById('progress-bar');

export function showProgressBar() {
  progressBar.classList.remove('hidden');
}

export function hideProgressBar() {
  progressBar.classList.add('hidden');
}

// Update during teaching mode — tracks concepts learned
export function updateTeachingProgress(learned, total) {
  const pct = (learned / total) * 100;
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${learned}/${total} Concepts Learned`;
}

// Update during assessment mode — tracks score
export function updateAssessmentProgress(score, total) {
  const pct = (score / total) * 100;
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `Score: ${score}/${total}`;
}

// Full reset
export function resetProgress() {
  progressFill.style.width = '0%';
  progressLabel.textContent = '0/0';
}