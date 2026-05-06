'use client';

import React, { useState } from 'react';
import styles from './SettingsView.module.css';

interface SettingsViewProps {
  pipelineInfo: {
    embedding_model: string;
    embedding_dims: number;
    reranker_model: string;
    compressor_model: string;
    llm_model: string;
  };
}

export default function SettingsView({ pipelineInfo }: SettingsViewProps) {
  const [settings, setSettings] = useState({
    embeddingModel: pipelineInfo.embedding_model,
    rerankerModel: pipelineInfo.reranker_model,
    compressorModel: pipelineInfo.compressor_model,
    llmModel: pipelineInfo.llm_model,
    temperature: 0.1,
    topK: 5,
  });

  const handleChange = (field: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save to backend
    alert('Settings saved! (Not yet implemented)');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Pipeline Settings</h2>
      <p className={styles.description}>
        Configure the RAG pipeline parameters. Changes will take effect on next document upload or query.
      </p>

      <div className={styles.settingsForm}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Models</h3>

          <div className={styles.field}>
            <label className={styles.label}>Embedding Model</label>
            <input
              type="text"
              value={settings.embeddingModel}
              onChange={(e) => handleChange('embeddingModel', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Reranker Model</label>
            <input
              type="text"
              value={settings.rerankerModel}
              onChange={(e) => handleChange('rerankerModel', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Compressor Model</label>
            <input
              type="text"
              value={settings.compressorModel}
              onChange={(e) => handleChange('compressorModel', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>LLM Model</label>
            <input
              type="text"
              value={settings.llmModel}
              onChange={(e) => handleChange('llmModel', e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Parameters</h3>

          <div className={styles.field}>
            <label className={styles.label}>Temperature</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Top K Retrieval</label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.topK}
              onChange={(e) => handleChange('topK', parseInt(e.target.value))}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleSave} className={styles.saveButton}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}