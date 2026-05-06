/* ─── Stage Status ─── */
export type StageStatus = 'done' | 'active' | 'waiting' | 'idle';

/* ─── Pipeline Stage ─── */
export interface PipelineStage {
  id: number;
  name: string;
  subtitle: string;
  status: StageStatus;
  progress: number;
  stats: StatRow[];
  tags: string[];
}

export interface StatRow {
  label: string;
  value: string;
}

/* ─── Chat ─── */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  confidence?: number;
  responseTime?: number;
  isStreaming?: boolean;
}

export interface Source {
  page: number;
  score: number;
  text?: string;
}

/* ─── RAGAS ─── */
export interface RagasScores {
  faithfulness: number | null;
  relevancy: number | null;
  precision: number | null;
  recall: number | null;
}

/* ─── Documents ─── */
export interface UploadedDocument {
  id: string;
  name: string;
  pages: number;
  uploadedAt: string;
  size: string;
}
