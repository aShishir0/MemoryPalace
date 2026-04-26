# Memory Palace

*Built for the Infinity Hackathon*

Memory Palace Enhanced is an immersive 3D spatial learning application that transforms your study materials into an interactive virtual memory palace. By leveraging the ancient "Method of Loci" memorization technique alongside modern AI and spaced repetition algorithms, this project aims to drastically improve knowledge retention.

## Features

- **Automated Palace Architecture:** Upload a PDF or paste your raw study notes. The AI automatically parses your content, synthesizes mnemonics, and maps concepts onto interactable 3D objects within a virtual environment.
- **Immersive 3D Environment:** Built with `three.js`. Navigate your custom memory palace using first-person WASD controls.
- **Multi-Modal Learning Paths:**
  - **Teaching Mode:** Take a guided tour through your memory palace. The AI introduces each concept contextually alongside vivid memory tips (mnemonics).
  - **Assessment Mode:** Test your knowledge. Interact with objects to trigger AI-generated Socratic questions based on the learned concepts. Type your answer and receive real-time evaluations and feedback.
- **Spaced Repetition System (SRS):** Powered by an SM-2 algorithm, the game tracks your mastery over each concept. Objects due for review are visually highlighted, and the ambient environment lighting dynamically darkens if you make consecutive mistakes.
- **PDF Image Extraction:** Automatically extracts images and figures from your uploaded PDFs and frames them on the walls of your digital palace for quick visual reference.

## Technology Stack

- **Frontend core:** Vanilla JavaScript (ES6 Modules), HTML5, CSS3.
- **3D Graphics Engine:** [Three.js](https://threejs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **PDF Processing:** `pdfjs-dist` and `pdf-extract-image`
- **Audio:** `howler` (for spatial ambient tracks and feedback tones) combined with the Web Speech API for Text-to-Speech (TTS).
- **AI Integration:** Seamless integration with LLM APIs (Ollama/Claude) for intelligent parsing, question generation, and contextual answer evaluation.

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- Depending on your AI backend configuration (`src/api/claude.js`), you may need Ollama running locally or a valid API key in your environment variables.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aShishir0/MemoryPalace.git
   cd MemoryPalace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory if you are using an external AI API provider.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173/` (or the port provided by Vite).

## How to Play
1. **Upload:** Start by clicking "Upload Document" to upload a `.pdf` file, or "Paste Notes" to input text directly.
2. **Build:** Click the build button and wait for the AI to construct the nodes and map the spatial elements.
3. **Explore:** Use `W A S D` to move and your mouse to look around.
4. **Learn:** Click on the fireplace to begin **Teaching Mode**.
5. **Assess:** Once ready, switch to **Assessment Mode**. Walk up to objects, click them, and answer the Socratic questions to test your recall.

## License
This project was created for the Infinity Hackathon. Check the `LICENSE` file for more details.
