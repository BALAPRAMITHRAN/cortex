import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RagSystems — Retrieval-Augmented Generation Pipeline',
  description:
    'A production RAG interface with live pipeline tracking, semantic chunking, hybrid retrieval, cross-encoder reranking, and RAGAS evaluation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
