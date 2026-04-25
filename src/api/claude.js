// src/api/claude.js
// Uses OpenRouter API (OpenAI-compatible) with Llama 3.3 70B Instruct (free)

const API_URL = 'http://localhost:11434/api/chat';
const MODEL = 'gemma4:31b-cloud';

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function callLLM(systemPrompt, userPrompt, maxTokens = 4000) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: {
          num_predict: maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.message || !data.message.content) {
      throw new Error(`Invalid response format from Ollama`);
    }
    return data.message.content.trim();
  } catch (e) {
    console.error('Ollama call failed:', e);
    throw e;
  }
}

// ── Palace Builder ────────────────────────────────────────────────────────────
// Sends study text to Llama and returns a full palace data object with
// teaching sequence, concepts, mnemonics, and spatial assignments.
export async function buildPalaceData(sourceText) {
  const systemPrompt = `You are an expert educational AI that creates spatial memory palaces using the Method of Loci technique.

Given study material, you will:
1. Extract 10-12 key concepts
2. Map each concept to a physical object in a room
3. Create vivid mnemonics for each
4. Generate an optimal TEACHING SEQUENCE (order to introduce concepts)
5. Provide context and details for teaching mode

Available objects: sofa, armchair, bookshelf, desk, painting_1, painting_2, painting_3, window, lamp, plant, globe, clock

Teaching sequence should:
- Start with foundational concepts
- Build progressively to complex ideas
- Group related concepts near each other in the sequence
- Consider cognitive load (don't overload early)

Return ONLY valid JSON with no markdown fences, no preamble, matching this schema exactly:
{
  "palace_name": "Short catchy name",
  "themes": ["Theme 1", "Theme 2"],
  "teaching_sequence": ["sofa", "bookshelf", "desk"],
  "objects": {
    "sofa": {
      "concept": "Main concept name",
      "detail": "2-3 sentence explanation for teaching mode",
      "mnemonic": "Vivid memory association with sofa",
      "theme": "Which theme this belongs to",
      "importance": "high|medium|low",
      "teaching_context": "Additional context for when teaching this concept"
    }
  }
}`;

  const userPrompt = `Study Material:\n\n${sourceText}\n\nExtract key concepts and build a memory palace with teaching sequence. Return ONLY raw JSON, no markdown.`;

  const rawText = await callLLM(systemPrompt, userPrompt, 4000);

  // Strip markdown code fences if the model added them anyway
  let jsonStr = rawText;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    // sometimes it just outputs `{ ... }` but with extra text around it
    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = rawText.slice(startIdx, endIdx + 1);
    }
  }

  try {
    const palaceData = JSON.parse(jsonStr.trim());
    if (!palaceData.teaching_sequence || !palaceData.objects) {
      throw new Error('Invalid palace data structure from LLM');
    }
    return palaceData;
  } catch (err) {
    console.error("Failed to parse JSON. Raw LLM output:", rawText);
    throw err;
  }
}

// ── AI Tutor — Socratic Question Generator ────────────────────────────────────
// Asks Llama to generate a short Socratic question to prompt recall
// without giving away the answer.
export async function askConceptQuestion(concept, detail, mnemonic) {
  const systemPrompt = `You are a Socratic tutor helping a student recall a concept from a memory palace.
Ask ONE short question (max 20 words) that prompts recall WITHOUT giving away the answer.
Respond with ONLY the question, no preamble, no explanation.`;

  const userPrompt = `Concept: ${concept}\nDetail: ${detail}\nMnemonic: ${mnemonic}`;

  return callLLM(systemPrompt, userPrompt, 80);
}

// ── AI Answer Evaluator ───────────────────────────────────────────────────────
// Sends the student's typed answer to Llama and returns { correct, feedback }.
export async function evaluateAnswer(concept, detail, userAnswer) {
  const systemPrompt = `You are evaluating if a student's answer demonstrates understanding of a concept.
Respond ONLY with raw JSON (no markdown): {"correct": true, "feedback": "one encouraging sentence"}`;

  const userPrompt = `Concept: ${concept}\nFull detail: ${detail}\nStudent answered: "${userAnswer}"`;

  const raw = await callLLM(systemPrompt, userPrompt, 150);

  let jsonStr = raw;
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = raw.slice(startIdx, endIdx + 1);
    }
  }

  try {
    return JSON.parse(jsonStr.trim());
  } catch (err) {
    console.error("Failed to parse evaluation JSON. Raw LLM output:", raw);
    throw err;
  }
}