'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Chat.module.css';
import type { ChatMessage } from '@/types';

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isStreaming: boolean;
}

const SUGGESTIONS = [
  'What are the main findings in this document?',
  'Summarize the methodology section',
  'List key statistics and data points',
];

export default function Chat({ messages, onSend, isStreaming }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <main className={styles.chat} id="chat-panel">
      {/* Messages or Empty State */}
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyLogo}>RagSystems</div>
            <p className={styles.emptySubtitle}>
              Ask questions about your uploaded documents. The pipeline tracker
              on the right will show each RAG stage in real time.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className={styles.suggestion}
                  onClick={() => onSend(s)}
                  id={`suggestion-${s.slice(0, 10).replace(/\s/g, '-')}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.role === 'user' ? styles.user : styles.assistant
                }`}
              >
                <div
                  className={`${styles.bubble} ${
                    msg.role === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble
                  }`}
                >
                  {/* Message text */}
                  <span>{msg.content}</span>
                  {msg.isStreaming && <span className={styles.streamCursor} />}

                  {/* Typing indicator */}
                  {msg.isStreaming && msg.content === '' && (
                    <div className={styles.typingDots}>
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  )}

                  {/* Source chips (AI only) */}
                  {msg.role === 'assistant' &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <div className={styles.sourcesRow}>
                        {msg.sources.map((src, i) => (
                          <span className={styles.sourceChip} key={i}>
                            📄 p.{src.page}
                            <span className={styles.sourceScore}>
                              {Math.round(src.score * 100)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Meta row: confidence + timing (AI, non-streaming) */}
                  {msg.role === 'assistant' && !msg.isStreaming && (
                    <div className={styles.metaRow}>
                      {msg.confidence !== undefined && (
                        <div className={styles.confidenceDots}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span
                              key={n}
                              className={`${styles.confDot} ${
                                n <= (msg.confidence ?? 0)
                                  ? styles.filled
                                  : ''
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {msg.responseTime !== undefined && (
                        <span className={styles.responseTime}>
                          {msg.responseTime}ms
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents…"
            rows={1}
            disabled={isStreaming}
            id="chat-input"
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            id="send-btn"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
        <div className={styles.inputHint}>
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </main>
  );
}
