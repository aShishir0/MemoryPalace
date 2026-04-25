// src/api/claude.js
// Ollama backend.
// Palace building   → gemma4:31b-cloud  (text only, fast)
// Image description → llava:7b          (vision model, free local Ollama)
//
// If gemma4 is slow / unavailable, swap PALACE_MODEL to:
//   "llama3.1:8b"   — fastest, very good for structured JSON
//   "mistral:7b"    — good alternative
//
// For image description the best free local Ollama vision models are:
//   "llava:7b"      — default, good quality
//   "moondream"     — very fast, smaller
//   "llava:13b"     — better quality but slower

const OLLAMA_URL    = 'http://localhost:11434/api/chat';
const PALACE_MODEL  = 'gemma4:31b-cloud'; // text-only palace building
const VISION_MODEL  = 'llava:7b';         // image description

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function callLLM(model, systemPrompt, userPrompt, maxTokens = 4000, images = []) {
  const userMessage = {
    role: 'user',
    content: userPrompt,
    ...(images.length > 0 && { images }) // Ollama vision format
  };

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
      stream: false,
      options: { num_predict: maxTokens },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.message?.content) throw new Error('Invalid response from Ollama');
  return data.message.content.trim();
}

// ── Image Description (vision model) ─────────────────────────────────────────
// Describes a single image (base64 data URL) concisely for the memory palace.
// Returns { concept, detail, mnemonic }.
export async function describeImage(dataUrl, index) {
  const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

  const systemPrompt = `You are an educational AI analyzing images extracted from study documents.
Examine this image carefully. It may be a diagram, chart, figure, graph, or illustration.

Respond with ONLY raw JSON (no markdown, no extra text):
{
  "title": "Short descriptive title — what this image is called (max 6 words)",
  "description": "1 to 3 clear sentences explaining: (1) what this image shows, and (2) why it is important for understanding the topic",
  "mnemonic": "One vivid, memorable sentence to help remember this image"
}`;

  let raw;
  try {
    raw = await callLLM(VISION_MODEL, systemPrompt, 'Describe this educational image.', 350, [base64]);
  } catch (err) {
    console.warn(`[claude] Vision model (${VISION_MODEL}) unavailable:`, err.message);
    console.warn(`[claude] Fix: run "ollama pull ${VISION_MODEL}" in your terminal.`);
    return {
      title:       `Figure ${index + 1}`,
      description: `Image ${index + 1} extracted from your PDF. To get AI descriptions, install the vision model: ollama pull ${VISION_MODEL}`,
      mnemonic:    'A key visual from your study material.',
      // palace-compatible aliases
      concept: `Figure ${index + 1}`,
      detail:  `Image ${index + 1} from your PDF. Run: ollama pull ${VISION_MODEL}`,
    };
  }

  let jsonStr = raw;
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (m) jsonStr = m[1];
  else {
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
    if (s !== -1 && e !== -1) jsonStr = raw.slice(s, e + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr.trim());
    return {
      title:       parsed.title       || `Figure ${index + 1}`,
      description: parsed.description || '',
      mnemonic:    parsed.mnemonic    || '',
      // aliases used by the rest of the app
      concept: parsed.title       || `Figure ${index + 1}`,
      detail:  parsed.description || '',
    };
  } catch (_) {
    return {
      title:       `Figure ${index + 1}`,
      description: raw.slice(0, 300),
      mnemonic:    '',
      concept:     `Figure ${index + 1}`,
      detail:      raw.slice(0, 300),
    };
  }
}

// ── JSON Repair/Clean Helper ──────────────────────────────────────────────────
function cleanJsonString(str) {
  // 1. Remove markdown code fences
  let clean = str.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1');
  
  // 2. Find first { and last }
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) return clean;
  clean = clean.slice(start, end + 1);

  // 3. Remove trailing commas before closing braces/brackets
  clean = clean.replace(/,\s*([\]}])/g, '$1');
  
  // 4. Remove potentially problematic control characters
  clean = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return clean;
}

// ── Palace Builder ────────────────────────────────────────────────────────────
export async function buildPalaceData(sourceText, imageCount = 0) {
  // Slots available for paintings (only as many as we have images)
  const paintingSlots = Array.from({ length: imageCount }, (_, i) => `painting_${i + 1}`);

  // Truncate source text to keep the LLM call fast (~5000 chars is plenty)
  const truncatedText = sourceText.length > 5000
    ? sourceText.slice(0, 5000) + '\n\n[...text truncated for speed...]'
    : sourceText;

  const systemPrompt = `You are an expert educational AI creating spatial memory palaces.

Given study material, you will:
1. Extract key concepts and map each to a physical object in a grand hall
2. Create vivid mnemonics for each concept
3. Generate an optimal teaching sequence (foundational → complex)
4. Provide teaching context for each concept

You MUST ONLY use object names from this exact list:
sofa, coffee_table, bookshelf_1, bookshelf_2, bookshelf_3, dining_table, chairs, desk, monitor, office_chair, floor_lamps, plants, chandelier, piano, billiard_table, bar_counter, trophy_cabinet, grandfather_clock, armchair, paintings, pillars, rugs, fireplace${paintingSlots.length > 0 ? ', ' + paintingSlots.join(', ') : ''}

${paintingSlots.length > 0 ? `IMPORTANT: The user uploaded a document containing ${imageCount} major diagrams/figures. You MUST include exactly these painting slots in your objects: ${paintingSlots.join(', ')}. 
Since you cannot see the images directly, you must INFER what the most important ${imageCount} diagrams or charts in this text would be, and assign them to the painting slots. Give each painting a descriptive "concept" (title) and "detail" (description of what the figure likely shows based on the text).` : ''}

Return ONLY valid JSON, no markdown fences:
{
  "palace_name": "Short catchy name",
  "themes": ["Theme 1", "Theme 2"],
  "teaching_sequence": ["sofa", "bookshelf_1"${paintingSlots.length > 0 ? ', ' + paintingSlots.map(s => `"${s}"`).join(', ') : ''}],
  "objects": {
    "sofa": {
      "concept": "Main concept name",
      "detail": "3 concise bullet points explaining this concept",
      "mnemonic": "Vivid memory association with this object",
      "theme": "Which theme",
      "importance": "high|medium|low",
      "teaching_context": "Additional teaching context",
      "socratic_question": "A test question (max 15 words)"
    }
  }
}`;

  const userPrompt = `Study Material:\n\n${truncatedText}\n\nBuild a memory palace. Return ONLY raw JSON, no markdown.`;

  const rawText = await callLLM(PALACE_MODEL, systemPrompt, userPrompt, 3500);

  const jsonStr = cleanJsonString(rawText);

  try {
    const palaceData = JSON.parse(jsonStr);
    if (!palaceData.teaching_sequence || !palaceData.objects) {
      throw new Error('Invalid palace data structure from LLM');
    }

    // Ensure painting slots exist even if the LLM forgot them
    paintingSlots.forEach((slot, i) => {
      if (!palaceData.objects[slot]) {
        palaceData.objects[slot] = {
          concept:          `Figure ${i + 1}`,
          detail:           `Key diagram ${i + 1} from the text.`,
          mnemonic:         'A visual representation of the concept.',
          theme:            'Visual',
          importance:       'medium',
          teaching_context: 'This image was extracted from your study material.',
          socratic_question: `What does Figure ${i + 1} illustrate?`,
        };
        if (!palaceData.teaching_sequence.includes(slot)) {
          palaceData.teaching_sequence.push(slot);
        }
      }
    });

    return palaceData;
  } catch (err) {
    console.error('Failed to parse palace JSON. Raw output:', rawText);
    console.error('Cleaned JSON string:', jsonStr);
    throw new Error(`JSON Parse Error: ${err.message}. Position: ${err.at || 'unknown'}`);
  }
}

// ── AI Answer Evaluator ───────────────────────────────────────────────────────
export async function evaluateAnswer(concept, detail, userAnswer) {
  const systemPrompt = `You are evaluating if a student's answer demonstrates understanding.
If incorrect, provide a hint without giving the answer.
Respond ONLY with raw JSON: {"correct": boolean, "feedback": "feedback or hint"}`;

  const userPrompt = `Concept: ${concept}\nDetail: ${detail}\nStudent answered: "${userAnswer}"`;
  const raw = await callLLM(PALACE_MODEL, systemPrompt, userPrompt, 150);
  const jsonStr = cleanJsonString(raw);

  try {
    return JSON.parse(jsonStr);
  } catch (_) {
    return { correct: false, feedback: 'Could not evaluate answer. Please try again.' };
  }
}

// ── Socratic Question ─────────────────────────────────────────────────────────
export async function askConceptQuestion(concept, detail) {
  const systemPrompt = `Ask ONE short question (max 15 words) that tests understanding of the concept.
Do NOT mention the memory palace or mnemonics. Respond with ONLY the question.`;
  return callLLM(PALACE_MODEL, systemPrompt, `Concept: ${concept}\nDetail: ${detail}`, 80);
}