// src/api/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ── PDF Text Extractor ────────────────────────────────────────────────────────
// Reads a File object and returns { text, pageCount }.
export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return {
    text: fullText.trim(),
    pageCount: pdf.numPages
  };
}

// ── Text Chunker ──────────────────────────────────────────────────────────────
// Splits large text into manageable chunks by paragraph boundary.
// Useful if you want to process very long PDFs in multiple API calls.
export function chunkText(text, maxChunkSize = 8000) {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += '\n\n' + para;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}