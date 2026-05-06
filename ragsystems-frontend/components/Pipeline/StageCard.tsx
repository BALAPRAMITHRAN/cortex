'use client';

import React from 'react';
import styles from './StageCard.module.css';
import type { PipelineStage } from '@/types';
import {
  ChunkingVisual,
  EmbeddingVisual,
  RetrievalVisual,
  RerankingVisual,
  CompressionVisual,
  GenerationVisual,
} from './MiniVisuals';

interface StageCardProps {
  stage: PipelineStage;
  index: number;
}

/* Map stage id → its SVG mini visual */
function getVisual(stageId: number, active: boolean) {
  switch (stageId) {
    case 1: return <ChunkingVisual />;
    case 2: return <EmbeddingVisual />;
    case 3: return <RetrievalVisual />;
    case 4: return <RerankingVisual active={active} />;
    case 5: return <CompressionVisual active={active} />;
    case 6: return <GenerationVisual active={active} />;
    default: return null;
  }
}

export default function StageCard({ stage, index }: StageCardProps) {
  const { id, name, subtitle, status, progress, stats, tags } = stage;
  const isActive  = status === 'active';
  const isDone    = status === 'done';
  const isWaiting = status === 'waiting';

  const cardClass = [
    styles.card,
    isDone    ? styles.done    : '',
    isActive  ? styles.active  : '',
    isWaiting ? styles.waiting : '',
  ].join(' ');

  const dotClass = [
    styles.statusDot,
    isDone    ? styles.dotDone    : '',
    isActive  ? styles.dotActive  : '',
    isWaiting ? styles.dotWaiting : '',
  ].join(' ');

  const fillClass = [
    styles.progressFill,
    isDone    ? styles.fillDone    : '',
    isActive  ? styles.fillActive  : '',
    isWaiting ? styles.fillWaiting : '',
  ].join(' ');

  const showBody = !isWaiting;

  return (
    <div
      className={cardClass}
      style={{ animationDelay: `${index * 80}ms` }}
      id={`pipeline-stage-${id}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.stageNum}>S{id}</span>
        <span className={styles.stageName}>{name}</span>
        <span className={dotClass} />
      </div>

      {/* Subtitle always visible */}
      <div className={styles.subtitle}>{subtitle}</div>

      {/* Collapsible body */}
      <div className={`${styles.body} ${showBody ? '' : styles.bodyHidden}`}>
        {/* Mini visual */}
        <div className={styles.visualWrap}>
          {getVisual(id, isActive)}
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div className={styles.statRow} key={i}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className={styles.tags}>
          {tags.map((t) => (
            <span className={styles.tag} key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div
          className={fillClass}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
