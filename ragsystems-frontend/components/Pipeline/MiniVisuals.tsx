'use client';

import React from 'react';

/* ═══════════════════════════════════════════════════════════
   Mini SVG Visualizations for each pipeline stage
   ═══════════════════════════════════════════════════════════ */

/* ─── Stage 1: Semantic Chunking ─── */
export function ChunkingVisual() {
  const chunks = [
    { w: 28, color: '#5b4fff' },
    { w: 42, color: '#7c6bff' },
    { w: 18, color: '#9d8fff' },
    { w: 35, color: '#5b4fff' },
    { w: 24, color: '#c4bbff' },
    { w: 50, color: '#7c6bff' },
    { w: 16, color: '#9d8fff' },
    { w: 38, color: '#5b4fff' },
    { w: 22, color: '#c4bbff' },
  ];

  let x = 4;
  const rects: React.ReactNode[] = [];
  const lines: React.ReactNode[] = [];

  chunks.forEach((c, i) => {
    rects.push(
      <rect
        key={`r${i}`}
        x={x}
        y={8}
        width={c.w}
        height={18}
        rx={3}
        fill={c.color}
        opacity={0.75}
      />
    );
    x += c.w;
    if (i < chunks.length - 1) {
      lines.push(
        <line
          key={`l${i}`}
          x1={x + 1}
          y1={4}
          x2={x + 1}
          y2={30}
          stroke="var(--ink3)"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      );
      x += 4;
    }
  });

  return (
    <svg
      viewBox="0 0 310 34"
      width="100%"
      height="34"
      style={{ display: 'block' }}
      aria-label="Document chunks visualization"
    >
      {/* base strip */}
      <rect x={2} y={6} width={306} height={22} rx={4} fill="var(--line)" />
      {rects}
      {lines}
    </svg>
  );
}

/* ─── Stage 2: BGE Embeddings Scatter ─── */
export function EmbeddingVisual() {
  const dots = [
    // Cluster 1 (top-left)
    { cx: 35, cy: 12, r: 3.5 },
    { cx: 48, cy: 18, r: 3 },
    { cx: 28, cy: 22, r: 2.5 },
    { cx: 42, cy: 8, r: 2.8 },
    { cx: 55, cy: 14, r: 3.2 },
    // Cluster 2 (center-right)
    { cx: 130, cy: 22, r: 3 },
    { cx: 145, cy: 16, r: 3.5 },
    { cx: 138, cy: 28, r: 2.5 },
    { cx: 155, cy: 20, r: 2.8 },
    // Cluster 3 (bottom-right)
    { cx: 210, cy: 30, r: 3.2 },
    { cx: 225, cy: 24, r: 3 },
    { cx: 218, cy: 36, r: 2.5 },
    { cx: 235, cy: 28, r: 2.8 },
    { cx: 200, cy: 34, r: 3 },
    // Outlier
    { cx: 160, cy: 38, r: 2 },
  ];

  return (
    <svg
      viewBox="0 0 270 46"
      width="100%"
      height="46"
      style={{ display: 'block' }}
      aria-label="Embedding space scatter plot"
    >
      <rect x={0} y={0} width={270} height={46} rx={6} fill="#f8f7ff" />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill="var(--accent)"
          opacity={0.6 + (i % 3) * 0.13}
        />
      ))}
    </svg>
  );
}

/* ─── Stage 3: Hybrid Retrieval ─── */
export function RetrievalVisual() {
  const bm25Bars = [85, 68, 50];
  const vecBars = [78, 72, 55];

  return (
    <svg
      viewBox="0 0 270 64"
      width="100%"
      height="64"
      style={{ display: 'block' }}
      aria-label="Hybrid retrieval BM25 + Vector fusion"
    >
      {/* BM25 column */}
      <text x={10} y={10} fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink3)">
        BM25
      </text>
      {bm25Bars.map((w, i) => (
        <rect
          key={`b${i}`}
          x={10}
          y={16 + i * 14}
          width={w * 0.7}
          height={8}
          rx={2}
          fill="#d97706"
          opacity={0.6 + i * 0.1}
        />
      ))}

      {/* Vector column */}
      <text x={100} y={10} fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink3)">
        Vector
      </text>
      {vecBars.map((w, i) => (
        <rect
          key={`v${i}`}
          x={100}
          y={16 + i * 14}
          width={w * 0.7}
          height={8}
          rx={2}
          fill="var(--accent)"
          opacity={0.6 + i * 0.1}
        />
      ))}

      {/* Merge arrow */}
      <line x1={172} y1={32} x2={196} y2={32} stroke="var(--ink3)" strokeWidth={1.5} />
      <polygon points="196,28 204,32 196,36" fill="var(--ink3)" />

      {/* RRF column */}
      <text x={212} y={10} fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink3)">
        RRF
      </text>
      <rect x={212} y={16} width={48} height={8} rx={2} fill="var(--green)" opacity={0.8} />
      <rect x={212} y={30} width={40} height={8} rx={2} fill="var(--green)" opacity={0.65} />
      <rect x={212} y={44} width={32} height={8} rx={2} fill="var(--green)" opacity={0.5} />
    </svg>
  );
}

/* ─── Stage 4: Cross-Encoder Reranking ─── */
export function RerankingVisual({ active }: { active?: boolean }) {
  const items = [
    { label: 'Doc 3', score: 0.94, order: 0 },
    { label: 'Doc 7', score: 0.89, order: 1 },
    { label: 'Doc 1', score: 0.82, order: 2 },
    { label: 'Doc 12', score: 0.71, order: 3 },
    { label: 'Doc 5', score: 0.63, order: 4 },
  ];

  return (
    <svg
      viewBox="0 0 270 80"
      width="100%"
      height="80"
      style={{ display: 'block' }}
      aria-label="Cross-encoder reranking visualization"
    >
      {items.map((item, i) => {
        const y = 4 + i * 15;
        const barW = item.score * 150;
        return (
          <g
            key={i}
            style={
              active
                ? {
                    animation: `reorderItem 2s ${i * 0.3}s ease-in-out infinite`,
                  }
                : undefined
            }
          >
            <text
              x={4}
              y={y + 9}
              fontSize={8}
              fontFamily="var(--font-mono)"
              fill="var(--ink2)"
            >
              {item.label}
            </text>
            <rect
              x={48}
              y={y + 1}
              width={barW}
              height={10}
              rx={3}
              fill="var(--accent)"
              opacity={0.4 + item.score * 0.5}
            />
            <text
              x={48 + barW + 5}
              y={y + 9}
              fontSize={7.5}
              fontFamily="var(--font-mono)"
              fill="var(--ink3)"
            >
              {item.score.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Stage 5: Context Compression ─── */
export function CompressionVisual({ active }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 270 56"
      width="100%"
      height="56"
      style={{ display: 'block' }}
      aria-label="Context compression before/after"
    >
      {/* Before block */}
      <rect x={20} y={4} width={60} height={48} rx={4} fill="#d4d4d8" opacity={0.5} />
      <text
        x={50}
        y={30}
        textAnchor="middle"
        fontSize={7}
        fontFamily="var(--font-mono)"
        fill="var(--ink3)"
      >
        1800 tok
      </text>

      {/* Arrow */}
      <g
        style={
          active
            ? { animation: 'compressArrow 1.5s ease-in-out infinite' }
            : undefined
        }
      >
        <line x1={90} y1={28} x2={135} y2={28} stroke="var(--ink3)" strokeWidth={1.5} />
        <polygon points="135,24 143,28 135,32" fill="var(--ink3)" />
      </g>

      {/* Compression label */}
      <text
        x={116}
        y={18}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fontFamily="var(--font-mono)"
        fill="var(--red)"
      >
        −62%
      </text>

      {/* After block */}
      <rect x={155} y={16} width={60} height={24} rx={4} fill="var(--accent)" opacity={0.25} />
      <rect x={155} y={16} width={60} height={24} rx={4} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      <text
        x={185}
        y={31}
        textAnchor="middle"
        fontSize={7}
        fontFamily="var(--font-mono)"
        fill="var(--accent)"
      >
        680 tok
      </text>
    </svg>
  );
}

/* ─── Stage 6: LLM Generation ─── */
export function GenerationVisual({ active }: { active?: boolean }) {
  const tokens = ['The', 'answer', 'based', 'on', 'the', 'context', '...'];

  return (
    <svg
      viewBox="0 0 270 52"
      width="100%"
      height="52"
      style={{ display: 'block' }}
      aria-label="LLM generation token stream"
    >
      {/* Prompt box */}
      <rect x={4} y={8} width={80} height={36} rx={4} fill="var(--accent-soft)" stroke="var(--accent-mid)" strokeWidth={1} />
      <text x={10} y={22} fontSize={6} fontFamily="var(--font-mono)" fill="var(--ink2)">
        SYSTEM +
      </text>
      <text x={10} y={31} fontSize={6} fontFamily="var(--font-mono)" fill="var(--ink2)">
        CONTEXT +
      </text>
      <text x={10} y={40} fontSize={6} fontFamily="var(--font-mono)" fill="var(--ink2)">
        QUERY
      </text>

      {/* Arrow */}
      <line x1={90} y1={26} x2={108} y2={26} stroke="var(--ink3)" strokeWidth={1.5} />
      <polygon points="108,22 116,26 108,30" fill="var(--ink3)" />

      {/* Token stream */}
      {tokens.map((tok, i) => (
        <rect
          key={i}
          x={120 + i * 20}
          y={18}
          width={16}
          height={16}
          rx={8}
          fill="var(--accent)"
          opacity={active ? 0.15 + (i / tokens.length) * 0.6 : 0.3}
          style={
            active
              ? {
                  animation: `tokenAppear 0.4s ${i * 0.2}s ease-out both`,
                }
              : undefined
          }
        />
      ))}
      {tokens.map((tok, i) => (
        <text
          key={`t${i}`}
          x={120 + i * 20 + 8}
          y={29}
          textAnchor="middle"
          fontSize={5}
          fontFamily="var(--font-mono)"
          fill="var(--accent)"
          opacity={active ? 0 : 0.6}
          style={
            active
              ? {
                  animation: `tokenAppear 0.4s ${i * 0.2}s ease-out forwards`,
                }
              : undefined
          }
        >
          {tok.slice(0, 3)}
        </text>
      ))}
    </svg>
  );
}
