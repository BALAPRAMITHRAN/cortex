# CORTEX

**Local Privacy-First RAG System**

A fully local Retrieval-Augmented Generation (RAG) system that ingests PDFs, builds hybrid FAISS + BM25 indexes, and answers natural language queries using reranked retrieval and a local LLM — with built-in RAGAS evaluation.

---

## Overview

CORTEX is designed to eliminate dependency on cloud APIs.
All computation — embedding, retrieval, reranking, and generation — runs locally.

**Key properties:**

* No data leaves your machine
* Hybrid retrieval (semantic + lexical)
* Cross-encoder reranking for precision
* Context compression for efficiency
* Built-in evaluation using RAGAS

---

## Architecture

| Component      | Technology             | Purpose                      |
| -------------- | ---------------------- | ---------------------------- |
| Backend        | FastAPI + Uvicorn      | API + pipeline orchestration |
| Embeddings     | BAAI/bge-large-en-v1.5 | Semantic vector generation   |
| Vector Store   | FAISS                  | ANN search                   |
| Lexical Search | BM25 (rank-bm25)       | Keyword retrieval            |
| Reranker       | BAAI/bge-reranker-base | Cross-encoder scoring        |
| Compressor     | FlashRank MiniLM       | Context compression          |
| LLM            | llama3.2:1b (Ollama)   | Local generation             |
| Frontend       | Next.js + TypeScript   | UI                           |
| Evaluation     | RAGAS                  | Quality metrics              |

---

## Pipeline (Core Logic)

1. **Ingestion**

   * PDF → text extraction
   * Semantic chunking
   * Noise filtering

2. **Indexing**

   * FAISS (vector index)
   * BM25 (lexical index)

3. **Retrieval**

   * Hybrid search (BM25 + FAISS)
   * Top-k merging

4. **Optimization**

   * FlashRank compression
   * Cross-encoder reranking

5. **Generation**

   * Prompt construction
   * Local LLM inference (Ollama)

---

## Prerequisites

* Python 3.10+
* Node.js 18+
* Git
* Ollama

```bash
ollama pull llama3.2:1b
ollama pull llama3:latest
```

---

## Installation

### Clone

```bash
git clone https://github.com/your-username/cortex.git
cd cortex
```

---

### Backend Setup

```bash
cd backend
python -m venv rag
```

**Windows:**

```bash
.\rag\Scripts\Activate.ps1
```

**Mac/Linux:**

```bash
source rag/bin/activate
```

```bash
pip install -r requirements.txt
```

---

### Frontend Setup

```bash
cd ragsystems-frontend
npm install
```

---

## Running the System

### 1. Start Ollama

```bash
ollama serve
```

### 2. Start Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend

```bash
cd ragsystems-frontend
npm run dev
```

---

## Access Points

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:8000](http://localhost:8000)
* Health: [http://localhost:8000/health](http://localhost:8000/health)

---

## Usage

### Upload PDF

* Upload via UI
* System performs:

  * Chunking
  * Embedding
  * FAISS + BM25 indexing

---

### Query

```bash
curl -X POST http://localhost:8000/query \
-H "Content-Type: application/json" \
-d '{"question":"What is RAG?","top_k":5}'
```

---

### Response Format

```json
{
  "answer": "...",
  "sources": [
    { "text": "...", "page": 1 }
  ]
}
```

---

### Streaming Endpoint

```
POST /query/stream
```

Token-by-token response streaming.

---

## API Reference

| Method | Endpoint       | Description  |
| ------ | -------------- | ------------ |
| GET    | /health        | Status check |
| GET    | /pipeline-info | Metadata     |
| POST   | /upload        | Upload PDF   |
| POST   | /query         | Ask question |
| POST   | /query/stream  | Streaming    |

---

## Project Structure

```
cortex/
├── backend/
│   ├── main.py
│   ├── pipeline/
│   │   ├── ingest.py
│   │   ├── retrieve.py
│   │   └── generate.py
│   ├── evaluation/
│   │   └── ragas_runner.py
│   └── storage/
│
├── ragsystems-frontend/
│
└── rag/ (venv)
```

---

## Evaluation (RAGAS)

### Test Set

```json
[
  {
    "question": "...",
    "ground_truth": "..."
  }
]
```

### Run

```bash
cd backend
python evaluation/ragas_runner.py
```

### Metrics

* Faithfulness
* Answer Relevancy
* Context Precision

---

## Troubleshooting

| Issue              | Fix                  |
| ------------------ | -------------------- |
| Ollama not working | Run `ollama serve`   |
| Import errors      | Activate venv        |
| CORS error         | Check backend config |
| PDF fails          | Use text-based PDF   |
| FAISS issues       | Rebuild index        |
| Slow first run     | Model download       |

---

## Models

| Role       | Model                  |
| ---------- | ---------------------- |
| Embedding  | BAAI/bge-large-en-v1.5 |
| Reranker   | BAAI/bge-reranker-base |
| Compressor | MiniLM                 |
| LLM        | llama3.2:1b            |
| Eval LLM   | llama3                 |

---

## Contributing

* Open issue before PR
* Ensure full pipeline works
* Keep changes modular

---

## License

MIT License

---




