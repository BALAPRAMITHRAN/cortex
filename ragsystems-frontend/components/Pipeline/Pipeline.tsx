'use client';

import React, { useEffect, useRef } from 'react';
import styles from './Pipeline.module.css';
import StageCard from './StageCard';
import type { PipelineStage } from '@/types';

interface PipelineProps {
  stages: PipelineStage[];
}

export default function Pipeline({ stages }: PipelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to the first active stage when pipeline changes */
  useEffect(() => {
    const activeStage = stages.find((s) => s.status === 'active');
    if (activeStage && scrollRef.current) {
      const el = document.getElementById(`pipeline-stage-${activeStage.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [stages]);

  return (
    <aside className={styles.panel} id="pipeline-panel">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>Live Pipeline</h2>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            Live
          </span>
        </div>
        <p className={styles.subtitle}>6-stage RAG execution tracker</p>
      </div>

      {/* Stage Cards */}
      <div className={styles.stages} ref={scrollRef}>
        {stages.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <StageCard stage={stage} index={i} />
            {i < stages.length - 1 && (
              <div className={styles.connector}>
                <div
                  className={`${styles.connectorLine} ${
                    stage.status === 'done'
                      ? styles.connectorDone
                      : stage.status === 'active'
                      ? styles.connectorActive
                      : ''
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </aside>
  );
}
