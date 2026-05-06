import json
import os  # Added to handle directory creation
from langchain_community.document_loaders import PyPDFLoader
from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.vectorstores import FAISS


def ingest_document(file_path: str, pipeline_state: dict) -> dict:
    """
    Load PDF, semantically chunk it, build FAISS index + BM25 texts.
    """
    embeddings = pipeline_state["embeddings"]
    
    # NEW: Create the storage directory if it doesn't exist
    os.makedirs("storage", exist_ok=True)
    
    # Step 1: load
    loader = PyPDFLoader(file_path)
    data = loader.load()

    # Step 2: semantic chunk
    splitter = SemanticChunker(embeddings, 
                breakpoint_threshold_type="percentile",
                breakpoint_threshold_amount=40)
    chunks = splitter.split_documents(data)

    BAD_PHRASES = ["reprint", "figure", "based on the graph", "answer the following"]

    print(f"Total chunks before filtering: {len(chunks)}")
    
    chunks = [
        c for c in chunks
        if len(c.page_content.strip()) > 150
        and not any(phrase in c.page_content.lower() for phrase in BAD_PHRASES)
    ]

    print(f"Clean chunks remaining: {len(chunks)}")
    
    # Ensure we have at least some chunks
    if not chunks:
        print("Warning: All chunks were filtered out. Using original chunks with minimal filtering.")
        chunks = splitter.split_documents(data)
        chunks = [c for c in chunks if len(c.page_content.strip()) > 50]  # Less strict fallback

    # Step 3: build FAISS + save to disk
    vector_db = FAISS.from_documents(chunks, embeddings)
    print(f"FAISS built with {vector_db.index.ntotal} vectors")
    print(f"Sample FAISS chunk: {chunks[0].page_content[:100]}")
    vector_db.save_local("storage/faiss_index")

    # Step 4: save chunks separately for BM25
    # BM25 can't be saved like FAISS — store raw texts in a JSON
    with open("storage/bm25_chunks.json", "w") as f:
        json.dump([c.page_content for c in chunks], f)

    return {"chunks": len(chunks), "pages": len(data)}
