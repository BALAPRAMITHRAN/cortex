# pipeline/retrieve.py
from langchain_classic.retrievers import ContextualCompressionRetriever

from langchain_community.document_compressors import FlashrankRerank


def retrieve(query: str, state: dict) -> list:
    
    """
    Hybrid retrieval with reranking and compression.
    Returns top 5 most relevant documents.
    """

    if "vector_db" not in state or state["vector_db"] is None:
        return "Error: No documents have been uploaded yet. Please upload a PDF first."
    # Check if indexes are initialized
    if state.get("bm25") is None and state.get("vector_db") is None:
        return []  # No documents indexed yet
    
    # FIX 2: Create BGE-prefixed query for vector retrieval
    bge_query = f"Represent this sentence for retrieval: {query}"
    
    # Manual ensemble: combine BM25 (lexical) + FAISS (semantic)
    all_docs = []
    doc_scores = {}  # Track which retriever returned each doc
    
    # Get results from BM25 if available
    if state.get("bm25") is not None:
        bm25_docs = state["bm25"].invoke(query)
        for i, doc in enumerate(bm25_docs[:10]):
            doc_key = hash(doc.page_content[:200])
            # Give BM25 results a score based on position (higher position = higher score)
            doc_scores[doc_key] = (doc, (10 - i) * 0.5)  # Weight BM25 at 50%
            all_docs.append(doc)
    
    # Get results from vector DB if available
    if state.get("vector_db") is not None:
        # FIX 3: Use bge_query for vector retrieval
        vector_docs = state["vector_db"].as_retriever(k=10).invoke(bge_query)
        for i, doc in enumerate(vector_docs[:10]):
            doc_key = hash(doc.page_content[:200])
            if doc_key in doc_scores:
                # Same doc from both retrievers - boost the score
                existing_doc, score = doc_scores[doc_key]
                doc_scores[doc_key] = (existing_doc, score + (10 - i) * 0.5)
            else:
                # New doc from vector DB
                doc_scores[doc_key] = (doc, (10 - i) * 0.5)  # Weight vector at 50%
                all_docs.append(doc)
    
    if not all_docs:
        return []

    # Sort by combined scores
    sorted_pairs = sorted(doc_scores.items(), key=lambda x: x[1][1], reverse=True)
    docs = [pair[1][0] for pair in sorted_pairs[:20]]

    # Apply compression with FlashRank
    compressor = FlashrankRerank(model="ms-marco-MiniLM-L-12-v2")
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
         base_retriever = state["vector_db"].as_retriever(k=20)  # Use vector retriever as base
    )
    
    # FIX 3: Use bge_query for compression retrieval
    compressed_docs = compression_retriever.invoke(bge_query)

    # Rerank using CrossEncoder (faster, no additional model loading needed)
    if not compressed_docs:
        return []
    
    # Use original query for reranking, not bge_query
    pairs = [[query, d.page_content] for d in compressed_docs]
    scores = state["reranker"].predict(pairs)
    reranked = [d for s, d in sorted(zip(scores, compressed_docs), key=lambda x: x[0], reverse=True)][:10]

    # Return top 5
    return reranked[:5]