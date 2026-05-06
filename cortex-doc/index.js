const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, ExternalHyperlink, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 36, color: "1a1a2e" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, bold: true, size: 28, color: "16213e" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: "0f3460" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, ...opts })]
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    shading: { type: ShadingType.CLEAR, fill: "F4F4F4" },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "333333" })]
  });
}

function bullet(text, bold_prefix = null) {
  const children = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix + ": ", bold: true, size: 22 }));
    children.push(new TextRun({ text, size: 22 }));
  } else {
    children.push(new TextRun({ text, size: 22 }));
  }
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E0E0E0", space: 1 } },
    children: []
  });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: "1a1a2e" },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: "FFFFFF" })] })]
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: cell.startsWith('/') || cell.startsWith('GET') || cell.startsWith('POST') ? "Courier New" : "Arial" })] })]
    }))
  }));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }, {
      reference: "numbered",
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1a1a2e" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "16213e" },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "0f3460" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Title block
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "CORTEX", bold: true, size: 72, color: "1a1a2e", font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Local Privacy-First RAG System", size: 32, color: "0f3460", font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 240 },
        children: [new TextRun({ text: "A local, privacy-first RAG system that ingests PDFs, builds hybrid FAISS + BM25 indexes, and answers natural language questions using reranked retrieval and a local Ollama LLM — with built-in RAGAS evaluation.", size: 22, color: "555555", italics: true })]
      }),
      divider(),

      // Overview
      h1("Overview"),
      p("CORTEX is an open-source, fully local Retrieval-Augmented Generation (RAG) system. It runs entirely on your machine — no cloud APIs, no data leaving your environment. Upload PDFs, ask questions in natural language, and get accurate, source-grounded answers powered by a local LLM."),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),

      // Architecture
      h1("Architecture"),
      makeTable(
        ["Component", "Technology", "Purpose"],
        [
          ["FastAPI Backend", "Python / Uvicorn", "REST API + pipeline orchestration"],
          ["Embeddings", "BAAI/bge-large-en-v1.5", "1024-dim semantic vectors"],
          ["Reranker", "BAAI/bge-reranker-base", "Cross-encoder reranking"],
          ["Vector Store", "FAISS (faiss-cpu)", "Approximate nearest neighbor search"],
          ["Lexical Search", "BM25 (rank-bm25)", "Keyword-based retrieval"],
          ["Compressor", "FlashRank ms-marco-MiniLM-L-12", "Context compression"],
          ["LLM", "llama3.2:1b via Ollama", "Local answer generation"],
          ["Frontend", "Next.js + TypeScript", "Web UI for upload & query"],
          ["Evaluation", "RAGAS", "Faithfulness, relevancy, precision"],
        ],
        [2800, 3000, 3560]
      ),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),
      divider(),

      // Prerequisites
      h1("Prerequisites"),
      h2("1. Python 3.10+"),
      p("Download from python.org. Ensure python and pip are available in your PATH."),
      h2("2. Node.js 18+"),
      p("Download from nodejs.org. Includes the npm package manager."),
      h2("3. Ollama (Local LLM Runtime)"),
      p("Download from ollama.ai, then pull the required models:"),
      code("ollama pull llama3.2:1b"),
      code("ollama pull llama3:latest   # for RAGAS evaluation"),
      h2("4. Git"),
      p("Download from git-scm.com for cloning the repository."),
      divider(),

      // Installation
      h1("Installation"),
      h2("Clone the Repository"),
      code("git clone https://github.com/your-username/cortex.git"),
      code("cd cortex"),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),

      h2("Backend Setup"),
      new Paragraph({
        numbering: { reference: "numbered", level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "Navigate to the backend directory", size: 22 })]
      }),
      code("cd backend"),
      new Paragraph({
        numbering: { reference: "numbered", level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "Create and activate a virtual environment", size: 22 })]
      }),
      code("python -m venv rag"),
      code("# Windows PowerShell:"),
      code(".\\rag\\Scripts\\Activate.ps1"),
      code("# macOS / Linux:"),
      code("source rag/bin/activate"),
      new Paragraph({
        numbering: { reference: "numbered", level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "Install Python dependencies", size: 22 })]
      }),
      code("pip install -r requirements.txt"),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),

      h2("Frontend Setup"),
      new Paragraph({
        numbering: { reference: "numbered", level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "Navigate to the frontend directory", size: 22 })]
      }),
      code("cd ragsystems-frontend"),
      new Paragraph({
        numbering: { reference: "numbered", level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "Install Node.js dependencies", size: 22 })]
      }),
      code("npm install"),
      divider(),

      // Running the system
      h1("Running the System"),
      h2("1. Start Ollama"),
      code("ollama serve"),
      h2("2. Start the Backend"),
      p("In a terminal with the virtual environment activated:"),
      code("cd backend"),
      code("uvicorn main:app --reload --host 0.0.0.0 --port 8000"),
      h2("3. Start the Frontend"),
      p("In a separate terminal:"),
      code("cd ragsystems-frontend"),
      code("npm run dev"),
      h2("4. Access the App"),
      bullet("Frontend UI:  http://localhost:3000"),
      bullet("Backend API:  http://localhost:8000"),
      bullet("Health check: http://localhost:8000/health"),
      divider(),

      // Usage Guide
      h1("Usage Guide"),
      h2("Upload a PDF"),
      p("Open http://localhost:3000 in your browser. Click the upload button, select a PDF file. The system will automatically:"),
      bullet("Extract text using PyPDFLoader"),
      bullet("Split into semantic chunks using SemanticChunker + BAAI embeddings"),
      bullet("Filter noisy/short chunks"),
      bullet("Build and persist a FAISS vector index"),
      bullet("Build and persist a BM25 lexical index"),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),

      h2("Ask Questions"),
      p("Type your question in the query input. The retrieval pipeline will:"),
      bullet("Run hybrid BM25 + FAISS retrieval"),
      bullet("Apply FlashRank context compression"),
      bullet("Rerank results with the CrossEncoder (BAAI/bge-reranker-base)"),
      bullet("Generate a grounded answer using llama3.2:1b via Ollama"),
      bullet("Return the answer with source chunk references"),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),

      h2("Streaming Responses"),
      p("Use the /query/stream endpoint for real-time token-by-token streaming. The frontend consumes this stream for a smoother user experience."),
      h2("Pipeline Stats"),
      p("The UI displays live pipeline metadata including chunk count, vector count, average tokens per chunk, and active model info via the /pipeline-info endpoint."),
      divider(),

      // API Reference
      h1("API Reference"),
      p("Base URL: http://localhost:8000"),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),
      makeTable(
        ["Method", "Endpoint", "Description"],
        [
          ["GET", "/health", "Server status check"],
          ["GET", "/pipeline-info", "Index statistics and model info"],
          ["POST", "/upload", "Upload PDF (multipart/form-data)"],
          ["POST", "/query", "Ask a question (JSON body)"],
          ["POST", "/query/stream", "Streaming question answering"],
        ],
        [1200, 2200, 5960]
      ),
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }),
      h3("Example: Upload PDF"),
      code('curl -X POST -F "file=@document.pdf" http://localhost:8000/upload'),
      h3("Example: Query"),
      code('curl -X POST -H "Content-Type: application/json" \\'),
      code('  -d \'{"question": "What is machine learning?", "top_k": 5}\' \\'),
      code('  http://localhost:8000/query'),
      h3("Example: Response"),
      code('{'),
      code('  "answer": "Machine learning is ...",'),
      code('  "sources": [{ "text": "...", "page": 1 }]'),
      code('}'),
      divider(),

      // Project Structure
      h1("Project Structure"),
      code("cortex/"),
      code("├── backend/"),
      code("│   ├── main.py              # FastAPI server + orchestration"),
      code("│   ├── requirements.txt     # Python dependencies"),
      code("│   ├── models/"),
      code("│   │   └── schemas.py       # Pydantic request/response models"),
      code("│   ├── pipeline/"),
      code("│   │   ├── ingest.py        # PDF ingestion + indexing"),
      code("│   │   ├── retrieve.py      # Hybrid retrieval + reranking"),
      code("│   │   └── generate.py      # Ollama LLM answer generation"),
      code("│   ├── evaluation/"),
      code("│   │   └── ragas_runner.py  # RAGAS evaluation runner"),
      code("│   └── storage/"),
      code("│       ├── faiss_index/     # Persisted FAISS vector index"),
      code("│       ├── bm25_chunks.json # BM25 chunk data"),
      code("│       └── test_set.json    # RAGAS evaluation questions"),
      code("├── ragsystems-frontend/"),
      code("│   ├── app/                 # Next.js pages"),
      code("│   ├── components/          # React components"),
      code("│   ├── lib/api.ts           # API client"),
      code("│   └── package.json         # Node dependencies"),
      code("└── rag/                     # Python virtual environment (gitignored)"),
      divider(),

      // RAGAS Evaluation
      h1("Evaluation with RAGAS"),
      p("CORTEX includes built-in RAG quality evaluation using the RAGAS framework."),
      h2("Prepare a Test Set"),
      p("Create storage/test_set.json with question/ground_truth pairs:"),
      code('['),
      code('  {'),
      code('    "question": "What is retrieval-augmented generation?",'),
      code('    "ground_truth": "RAG is a technique that combines ..."'),
      code('  }'),
      code(']'),
      h2("Run Evaluation"),
      code("cd backend"),
      code("python evaluation/ragas_runner.py"),
      h2("Metrics"),
      bullet("Faithfulness", "Answer accuracy relative to retrieved context"),
      bullet("Answer Relevancy", "How well the answer addresses the question"),
      bullet("Context Precision", "Quality and relevance of retrieved chunks"),
      divider(),

      // Troubleshooting
      h1("Troubleshooting"),
      makeTable(
        ["Problem", "Solution"],
        [
          ["Ollama connection error", "Run ollama serve and verify with ollama list"],
          ["Import / dependency error", "Activate venv and run pip install -r requirements.txt"],
          ["CORS error in browser", "Backend allows localhost:3000 — check browser console"],
          ["PDF processing fails", "Ensure PDF is text-based (not scanned image-only)"],
          ["FAISS index not loading", "Delete storage/faiss_index/ and re-upload your PDF"],
          ["Slow first load", "Embedding models download on first run — this is one-time only"],
        ],
        [3600, 5760]
      ),
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }),
      divider(),

      // Models
      h1("Models Used"),
      makeTable(
        ["Role", "Model", "Notes"],
        [
          ["Embeddings", "BAAI/bge-large-en-v1.5", "1024 dimensions, English-optimized"],
          ["Reranker", "BAAI/bge-reranker-base", "CrossEncoder for scoring"],
          ["Compressor", "ms-marco-MiniLM-L-12-v2", "FlashRank context compression"],
          ["LLM", "llama3.2:1b (Ollama)", "Fast local inference"],
          ["Eval LLM", "llama3:latest (Ollama)", "Used by RAGAS evaluation"],
        ],
        [1800, 3200, 4360]
      ),
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }),
      divider(),

      // Contributing
      h1("Contributing"),
      p("Contributions are welcome! Please open an issue to discuss your idea before submitting a pull request. Make sure all changes are tested end-to-end with the full pipeline."),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),

      // License
      h1("License"),
      p("This project is licensed under the MIT License. See the LICENSE file for details."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("CORTEX_README.docx", buffer);
  console.log("Done!");
});