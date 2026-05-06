'use client';

import React from 'react';
import styles from './DocumentsView.module.css';
import type { UploadedDocument } from '@/types';

interface DocumentsViewProps {
  documents: UploadedDocument[];
}

export default function DocumentsView({ documents }: DocumentsViewProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Document Management</h2>
      <p className={styles.description}>
        View and manage your uploaded documents. Currently indexed documents are listed below.
      </p>

      {documents.length === 0 ? (
        <div className={styles.empty}>
          <p>No documents uploaded yet.</p>
          <p>Use the sidebar to upload a PDF.</p>
        </div>
      ) : (
        <div className={styles.documentsList}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.documentCard}>
              <div className={styles.documentInfo}>
                <h3 className={styles.documentName}>{doc.name}</h3>
                <div className={styles.documentMeta}>
                  <span>{doc.pages} pages</span>
                  <span>{doc.size}</span>
                  <span>Uploaded: {doc.uploadedAt}</span>
                </div>
              </div>
              <div className={styles.documentActions}>
                <button className={styles.actionButton}>View Details</button>
                <button className={styles.actionButton}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}