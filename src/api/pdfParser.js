// src/api/pdfParser.js
// Extracts major images, diagrams, charts and figures from a PDF.
//
// Three-tier approach:
//  A) Raw XObject / inline image extraction (raster images stored directly)
//  B) Render+crop pages that contain Form XObjects (vector figures, EPS embeds)
//  C) Render+crop pages that are diagram-heavy (path ops >> text ops)
//
// All results are cropped to the tightest non-background bounding box so
// you get the figure itself, not the surrounding page/margin/text.

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MIN_DIM    = 100;  // px — skip icons / decorations
const MAX_IMAGES = 10;   // one per painting frame
const RENDER_SCALE = 2.5; // higher = sharper crops

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function rgbToRgba(src) {
  const n   = src.length / 3;
  const dst = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    dst[i*4]   = src[i*3];
    dst[i*4+1] = src[i*3+1];
    dst[i*4+2] = src[i*3+2];
    dst[i*4+3] = 255;
  }
  return dst;
}

/**
 * Scan a rendered canvas and crop to the tightest non-white / non-transparent
 * bounding box, with a small padding.  Returns null if the cropped area is
 * too small (blank / decorative page).
 */
function cropToContent(srcCanvas, padding = 8) {
  const { width, height } = srcCanvas;
  const ctx    = srcCanvas.getContext('2d');
  const pixels = ctx.getImageData(0, 0, width, height).data;

  let top = height, bottom = -1, left = width, right = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = pixels[i + 3];
      // Treat near-white (>240,>240,>240) or near-transparent as background
      if (a < 20 || (pixels[i] > 240 && pixels[i+1] > 240 && pixels[i+2] > 240)) continue;
      if (y < top)    top    = y;
      if (y > bottom) bottom = y;
      if (x < left)  left   = x;
      if (x > right)  right  = x;
    }
  }

  if (bottom < 0) return null; // entirely blank

  top    = Math.max(0,        top    - padding);
  bottom = Math.min(height-1, bottom + padding);
  left   = Math.max(0,        left   - padding);
  right  = Math.min(width-1,  right  + padding);

  const w = right - left + 1;
  const h = bottom - top + 1;
  if (w < MIN_DIM || h < MIN_DIM) return null;

  const out = document.createElement('canvas');
  out.width  = w;
  out.height = h;
  out.getContext('2d').drawImage(srcCanvas, left, top, w, h, 0, 0, w, h);
  return out.toDataURL('image/jpeg', 0.88);
}

/** Render a full PDF page to an offscreen canvas at RENDER_SCALE */
async function renderPage(page) {
  const viewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas   = document.createElement('canvas');
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas;
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy A — raw XObject / inline image extraction
// ─────────────────────────────────────────────────────────────────────────────

function imageObjToDataURL(imgObj) {
  const { width, height, data } = imgObj;
  if (!width || !height || !data) return null;

  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  let rgba;
  if (data.length === width * height * 4) {
    rgba = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
  } else if (data.length === width * height * 3) {
    rgba = rgbToRgba(data);
  } else {
    return null;
  }

  ctx.putImageData(new ImageData(rgba, width, height), 0, 0);
  return canvas.toDataURL('image/png');
}

async function extractRawImages(page, ops) {
  const results = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    let imgObj = null;

    if (fn === pdfjsLib.OPS.paintImageXObject) {
      const name = ops.argsArray[i][0];
      try { imgObj = page.objs.get(name); } catch (_) {}
      if (!imgObj) {
        imgObj = await new Promise(resolve => {
          try { page.objs.get(name, resolve); } catch (_) { resolve(null); }
        });
      }
    } else if (fn === pdfjsLib.OPS.paintInlineImageXObject) {
      imgObj = ops.argsArray[i][0]; // data is directly in args
    }

    if (!imgObj?.data) continue;
    if (imgObj.width < MIN_DIM || imgObj.height < MIN_DIM) continue;

    const url = imageObjToDataURL(imgObj);
    if (url) {
      console.log(`[pdfParser] Raw image ${imgObj.width}×${imgObj.height}`);
      results.push(url);
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page classifier — what kind of visual content does this page have?
// ─────────────────────────────────────────────────────────────────────────────

function classifyPage(ops) {
  const OPS = pdfjsLib.OPS;
  let imageOps = 0, textOps = 0, pathOps = 0, formOps = 0;

  for (const fn of ops.fnArray) {
    if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) imageOps++;
    if (fn === OPS.showText || fn === OPS.showSpacedText ||
        fn === OPS.nextLineShowText || fn === OPS.nextLineSetSpacingShowText) textOps++;
    if (fn === OPS.fill || fn === OPS.eoFill ||
        fn === OPS.stroke || fn === OPS.fillStroke ||
        fn === OPS.eoFillStroke) pathOps++;
    if (fn === OPS.paintFormXObjectBegin) formOps++;
  }

  const total = ops.fnArray.length || 1;
  return {
    hasRasterImages: imageOps > 0,
    hasFormXObjects: formOps > 0,       // vector EPS / PDF figures
    isDiagramHeavy:  pathOps > 40 && pathOps > textOps * 1.5 && textOps < 80,
    isTextOnly:      textOps / total > 0.6 && imageOps === 0 && formOps === 0 && pathOps < 20,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  const rawImages    = [];  // from Strategy A
  const renderQueue  = [];  // pages queued for Strategy B/C (render + crop)

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // ── Text ──────────────────────────────────────────────────────────────
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(i => i.str).join(' ') + '\n\n';

    if (rawImages.length >= MAX_IMAGES) continue;

    try {
      const ops    = await page.getOperatorList();
      const info   = classifyPage(ops);

      // Strategy A — raw pixel data
      if (info.hasRasterImages) {
        const found = await extractRawImages(page, ops);
        rawImages.push(...found.slice(0, MAX_IMAGES - rawImages.length));
        if (found.length) console.log(`[pdfParser] Page ${pageNum}: ${found.length} raw image(s)`);
      }

      // Queue for render+crop if it's a vector figure or diagram page
      if (!info.isTextOnly && (info.hasFormXObjects || info.isDiagramHeavy)) {
        renderQueue.push({ pageNum, page });
      }
    } catch (err) {
      console.warn(`[pdfParser] Page ${pageNum} error:`, err);
    }
  }

  // ── Strategy B/C — render diagram/vector pages and crop ─────────────────
  const renderedImages = [];
  if (renderQueue.length > 0) {
    console.log(`[pdfParser] Render-crop queue: ${renderQueue.length} page(s)`);
    for (const { pageNum, page } of renderQueue) {
      if (rawImages.length + renderedImages.length >= MAX_IMAGES) break;
      try {
        const canvas = await renderPage(page);
        const url    = cropToContent(canvas);
        if (url) {
          renderedImages.push(url);
          console.log(`[pdfParser] Render-cropped page ${pageNum}`);
        }
      } catch (err) {
        console.warn(`[pdfParser] Render-crop failed p${pageNum}:`, err);
      }
    }
  }

  // Merge: raw images first (they're the cleanest), then rendered crops
  let images = [...rawImages, ...renderedImages].slice(0, MAX_IMAGES);

  // ── Strategy D (Fallback) — ensure we have at least 4 images if available
  if (images.length < 4 && pdf.numPages > 0) {
    console.log(`[pdfParser] Found only ${images.length} images. Extracting pages as fallback...`);
    // Try to grab the first few pages until we have 4 images total
    for (let p = 1; p <= pdf.numPages && images.length < 4; p++) {
      try {
        const page = await pdf.getPage(p);
        const canvas = await renderPage(page);
        const url = cropToContent(canvas, 20); 
        // Quick check to avoid identical crops if possible, though mostly just padding out the gallery
        if (url && !images.includes(url)) {
          images.push(url);
          console.log(`[pdfParser] Fallback added page ${p} as image.`);
        }
      } catch (err) {
        console.warn(`[pdfParser] Fallback render failed on page ${p}:`, err);
      }
    }
  }

  console.log(`[pdfParser] Done. ${images.length} image(s) from ${pdf.numPages} pages.`);

  return { text: fullText.trim(), images, pageCount: pdf.numPages };
}

// ─────────────────────────────────────────────────────────────────────────────
// Text chunker
// ─────────────────────────────────────────────────────────────────────────────
export function chunkText(text, maxChunkSize = 8000) {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const chunks = [];
  let cur = '';
  for (const para of paragraphs) {
    if ((cur + para).length > maxChunkSize) {
      if (cur) chunks.push(cur.trim());
      cur = para;
    } else {
      cur += '\n\n' + para;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
}