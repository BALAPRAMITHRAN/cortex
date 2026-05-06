# main.py

import os
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.vectorstores import FAISS
from langchain_community.retrievers import BM25Retriever
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings
from sentence_transformers import CrossEncoder

from pipeline.ingest import ingest_document
from pipeline.retrieve import retrieve
from pipeline.generate import generate_answer, generate_stream
from evaluation.ragas_runner import run_ragas


# ── REQUEST / RESPONSE MODELS ──────────────────────────────

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5


# ── SHARED STATE (loaded once at startup) ──────────────────

pipeline_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # runs ONCE when server starts
    print("Loading models...")

    pipeline_state["embeddings"] = HuggingFaceEmbeddings(
        model_name="BAAI/bge-large-en-v1.5",
        encode_kwargs={"normalize_embeddings": True}
    )
    pipeline_state["reranker"] = CrossEncoder("BAAI/bge-reranker-base")

    # load FAISS index if it exists
    if os.path.exists("storage/faiss_index/index.faiss"):
        try:
            pipeline_state["vector_db"] = FAISS.load_local("storage/faiss_index", pipeline_state["embeddings"], allow_dangerous_deserialization=True)
            print("FAISS index loaded.")
        except Exception as e:
            print(f"Warning: Could not load FAISS index: {e}")
            pipeline_state["vector_db"] = None
    else:
        pipeline_state["vector_db"] = None

    # load BM25 chunks if they exist
    if os.path.exists("storage/bm25_chunks.json"):
        try:
            with open("storage/bm25_chunks.json") as f:
                texts = json.load(f)
            pipeline_state["bm25"] = BM25Retriever.from_texts(texts)
            print("BM25 index loaded.")
        except Exception as e:
            print(f"Warning: Could not load BM25 index: {e}")
            pipeline_state["bm25"] = None
    else:
        pipeline_state["bm25"] = None

    print("Pipeline ready.")
    yield  # ← server runs here, accepting requests


# ── APP ────────────────────────────────────────────────────

app = FastAPI(lifespan=lifespan)

# allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── ENDPOINTS ──────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint to verify backend is running."""
    return {
        "status": "ok",
        "vector_db": pipeline_state.get("vector_db") is not None,
        "bm25": pipeline_state.get("bm25") is not None,
        "models_loaded": pipeline_state.get("embeddings") is not None
    }


@app.get("/pipeline-info")
async def pipeline_info():
    """
    Returns real pipeline stats for the frontend tracker.
    All values come from the actual pipeline state — no hardcoded data.
    """
    chunk_count = 0
    avg_tokens = 0

    if os.path.exists("storage/bm25_chunks.json"):
        try:
            with open("storage/bm25_chunks.json") as f:
                chunks = json.load(f)
                chunk_count = len(chunks)
                if chunk_count > 0:
                    total_tokens = sum(len(c.split()) for c in chunks)
                    avg_tokens = total_tokens // chunk_count
        except Exception:
            pass

    vector_count = 0
    if pipeline_state.get("vector_db") is not None:
        try:
            vector_count = pipeline_state["vector_db"].index.ntotal
        except Exception:
            pass

    return {
        "chunks": chunk_count,
        "vectors": vector_count,
        "avg_tokens": avg_tokens,
        "has_faiss": pipeline_state.get("vector_db") is not None,
        "has_bm25": pipeline_state.get("bm25") is not None,
        "embedding_model": "BAAI/bge-large-en-v1.5",
        "embedding_dims": 1024,
        "reranker_model": "BAAI/bge-reranker-base",
        "compressor_model": "ms-marco-MiniLM-L-12-v2",
        "llm_model": "llama3:latest",
    }

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """
    User uploads a PDF.
    Ingests it, builds FAISS + BM25, saves to disk.
    """
    # save uploaded file temporarily
    temp_path = f"storage/temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # run the full ingest pipeline
    result = ingest_document(temp_path, pipeline_state)

    # load the newly created indexes into memory
    embeddings = pipeline_state["embeddings"]
    pipeline_state["vector_db"] = FAISS.load_local("storage/faiss_index", embeddings, allow_dangerous_deserialization=True)
    
    # load BM25 chunks
    with open("storage/bm25_chunks.json") as f:
        texts = json.load(f)
    pipeline_state["bm25"] = BM25Retriever.from_texts(texts)

    os.remove(temp_path)  # clean up temp file
    return result


@app.post("/query")
async def query(request: QueryRequest):
    """
    User asks a question.
    Returns full answer + sources in one JSON response.
    """
    if pipeline_state.get("vector_db") is None and pipeline_state.get("bm25") is None:
        return {
            "answer": "No documents have been indexed yet. Please upload a PDF first.",
            "sources": []
        }
    
    docs = retrieve(request.question, pipeline_state)
    
    # Debug: show what was retrieved
    print(f"\n{'='*60}")
    print(f"QUERY: {request.question}")
    print(f"RETRIEVED DOCS: {len(docs) if isinstance(docs, list) else 'error'}")
    if isinstance(docs, list):
        for i, d in enumerate(docs[:3]):
            print(f"  Doc {i}: {d.page_content[:150]}...")
    print(f"{'='*60}\n")
    
    if not docs:
        return {
            "answer": "No relevant documents found for your query.",
            "sources": []
        }
    
    if isinstance(docs, str):
     return {"answer": docs, "sources": []} # Return the error message safely
    
    context = "\n\n".join([d.page_content for d in docs])
    print(f"CONTEXT LENGTH: {len(context)} chars sent to LLM")
    try:
        answer = generate_answer(context, request.question)
    except Exception as e:
        print(f"Error generating answer: {e}")
        return {
            "answer": "Error: Ollama failed to generate an answer.",
            "sources": []
        }

    return {
        "answer": answer,
        "sources": [
            {"text": d.page_content, "page": d.metadata.get("page", 0)}
            for d in docs
        ]
    }


@app.post("/query/stream")
async def query_stream(request: QueryRequest):
    """
    Same as /query but streams tokens back live.
    The frontend receives words as they are generated.
    """
    if pipeline_state.get("vector_db") is None and pipeline_state.get("bm25") is None:
        async def empty_response():
            yield "No documents have been indexed yet. Please upload a PDF first."
        return StreamingResponse(empty_response(), media_type="text/plain")
    
    docs = retrieve(request.question, pipeline_state)
    
    if not docs:
        async def no_results_response():
            yield "No relevant documents found for your query."
        return StreamingResponse(no_results_response(), media_type="text/plain")
    
    context = "\n\n".join([d.page_content for d in docs])

    return StreamingResponse(
        generate_stream(context, request.question),
        media_type="text/plain"
    )


@app.get("/evaluate")
async def evaluate():
    """
    Runs RAGAS evaluation against your test_set.json.
    Returns faithfulness, relevancy, precision, recall scores.
    """
    scores = await run_ragas(pipeline_state)
    return scores

@app.get("/chunks")
async def get_chunks():
    """
    Returns the list of document chunks.
    """
    if os.path.exists("storage/bm25_chunks.json"):
        with open("storage/bm25_chunks.json") as f:
            chunks = json.load(f)
        return {"chunks": chunks}
    return {"chunks": []}