'use client';

import React from 'react';
import styles from './RagasBar.module.css';
import type { RagasScores } from '@/types';

interface RagasBarProps {
  scores: RagasScores;
  onEvaluate: () => void;
  evaluating: boolean;
}

type MetricKey = keyof RagasScores;

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'faithfulness', label: 'Faithfulness' },
  { key: 'relevancy',    label: 'Relevancy' },
  { key: 'precision',    label: 'Precision' },
  { key: 'recall',       label: 'Recall' },
];

function getColor(score: number | null): string {
  if (score === null) return 'empty';
  if (score >= 0.85) return 'green';
  if (score >= 0.65) return 'amber';
  return 'red';
}

function formatScore(score: number | null): string {
  if (score === null) return '—';
  return score.toFixed(2);
}

export default function RagasBar({
  scores,
  onEvaluate,
  evaluating,
}: RagasBarProps) {
  return (
    <div className={styles.bar} id="ragas-bar">
      <span className={styles.label}>RAGAS EVAL</span>

      <div className={styles.metrics}>
        {METRICS.map(({ key, label }) => {
          const val = scores[key];
          const color = getColor(val);
          return (
            <div className={styles.metricCard} key={key} id={`metric-${key}`}>
              <span className={styles.metricName}>{label}</span>
              <span className={`${styles.metricScore} ${styles[color]}`}>
                {formatScore(val)}
              </span>
              <div
                className={`${styles.underline} ${styles[color]}`}
                style={{
                  width: val !== null ? `${val * 100}%` : '100%',
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        className={`${styles.evalBtn} ${evaluating ? styles.evalBtnLoading : ''}`}
        onClick={onEvaluate}
        disabled={evaluating}
        id="evaluate-btn"
      >
        Run Evaluation →
      </button>
    </div>
  );
}
