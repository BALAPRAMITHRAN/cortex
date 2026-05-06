'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './Sidebar.module.css';
import type { UploadedDocument } from '@/types';

interface SidebarProps {
  documents: UploadedDocument[];
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function Sidebar({ documents, onUpload, uploading }: SidebarProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onUpload(file);
      }
    },
    [onUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
        e.target.value = '';
      }
    },
    [onUpload],
  );

  return (
    <aside className={styles.sidebar} id="sidebar">
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Document Library</h2>
        <span className={styles.count}>
          {documents.length} document{documents.length !== 1 ? 's' : ''} indexed
        </span>
      </div>

      {/* Upload Zone */}
      <div
        className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        id="upload-zone"
      >
        <div className={styles.uploadIcon}>↑</div>
        <span className={styles.uploadLabel}>Upload PDF</span>
        <span className={styles.uploadHint}>Drop here or click to browse</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className={styles.uploadInput}
          onChange={handleFileSelect}
          id="file-input"
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className={styles.uploadProgress}>
          <div className={styles.uploadSpinner} />
          <span className={styles.uploadProgressText}>Processing PDF…</span>
        </div>
      )}

      {/* Document List */}
      <div className={styles.docList}>
        {documents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <p className={styles.emptyText}>
              No documents yet.<br />
              Upload a PDF to get started.
            </p>
          </div>
        ) : (
          documents.map((doc, i) => (
            <div
              className={styles.docItem}
              key={doc.id}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={styles.docIcon}>📕</div>
              <div className={styles.docInfo}>
                <div className={styles.docName} title={doc.name}>
                  {doc.name}
                </div>
                <div className={styles.docMeta}>
                  {doc.pages} pages · {doc.size}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
