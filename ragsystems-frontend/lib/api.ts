/**
 * API layer — talks to FastAPI backend at localhost:8000.
 *
 * CORS NOTE: Make sure the FastAPI backend includes CORSMiddleware:
 *
 *   from fastapi.middleware.cors import CORSMiddleware
 *   app.add_middleware(
 *       CORSMiddleware,
 *       allow_origins=["http://localhost:3000", "http://localhost:3001"],
 *       allow_credentials=True,
 *       allow_methods=["*"],
 *       allow_headers=["*"],
 *   )
 */

const API_BASE = 'http://localhost:8000';

/* ─── Upload PDF ─── */
export async function uploadDocument(file: File, signal?: AbortSignal) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: form,
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }
  return res.json();
}

/* ─── Streaming query ─── */
export async function queryStream(
  question: string,
  onToken: (token: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
) {
  const res = await fetch(`${API_BASE}/query/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stream query failed: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onDone();
    return;
  }

  const decoder = new TextDecoder();
  let running = true;

  while (running) {
    const { done, value } = await reader.read();
    if (done) {
      running = false;
      break;
    }
    const chunk = decoder.decode(value, { stream: true });
    onToken(chunk);
  }

  onDone();
}

/* ─── Regular query (sources / metadata) ─── */
export async function queryMetadata(question: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Query failed: ${err}`);
  }
  return res.json();
}

/* ─── Pipeline info (real stats) ─── */
export async function fetchPipelineInfo(signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/pipeline-info`, { signal });

  if (!res.ok) {
    throw new Error('Pipeline info fetch failed');
  }
  return res.json();
}

/* ─── RAGAS evaluation ─── */
export async function evaluate(signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/evaluate`, { signal });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Evaluation failed: ${err}`);
  }
  return res.json();
}

/* ─── Fetch chunks ─── */
export async function fetchChunks(signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/chunks`, { signal });

  if (!res.ok) {
    throw new Error('Chunks fetch failed');
  }
  return res.json();
}
