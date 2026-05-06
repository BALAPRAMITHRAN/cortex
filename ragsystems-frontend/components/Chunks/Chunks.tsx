'use client';

import React from 'react';
import styles from './Chunks.module.css';

interface ChunksProps {
  chunks: string[];
}

export default function Chunks({ chunks }: ChunksProps) {
  return (
    <div className={styles.chunks}>
      <h2>Document Chunks</h2>
      <div className={styles.chunkList}>
        {chunks.length > 0 ? (
          chunks.map((chunk, index) => (
            <div key={index} className={styles.chunk}>
              <p>{chunk}</p>
            </div>
          ))
        ) : (
          <p>No chunks available. Upload a document first.</p>
        )}
      </div>
    </div>
  );
}