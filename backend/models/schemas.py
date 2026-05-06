# models/schemas.py
from pydantic import BaseModel

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5

class SourceChunk(BaseModel):
    text: str
    page: int
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    retrieval_time_ms: float
    chunks_searched: int