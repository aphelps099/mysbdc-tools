'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamChat } from '@/lib/api';

interface PlayModalProps {
  prompt: string;
  label?: string;
  onClose: () => void;
}

export default function PlayModal({ prompt, label = 'Sample Prompt', onClose }: PlayModalProps) {
  const [content, setContent] = useState('');
  const [phase, setPhase] = useState<'loading' | 'streaming' | 'done' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const streamRef = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  // Auto-scroll as tokens arrive
  useEffect(() => {
    if (scrollRef.current && phase === 'streaming') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, phase]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fire the prompt on mount
  useEffect(() => {
    abortRef.current = false;
    streamRef.current = '';

    streamChat(prompt, [], {
      onToken: (text) => {
        if (abortRef.current) return;
        streamRef.current += text;
        setContent(streamRef.current);
        setPhase('streaming');
      },
      onDone: () => {
        if (abortRef.current) return;
        setPhase('done');
      },
      onCompliance: () => {},
      onError: (msg) => {
        if (abortRef.current) return;
        setErrorMsg(msg);
        setPhase('error');
      },
    }, { useRag: false }).catch(() => {
      if (!abortRef.current) {
        setErrorMsg('Connection failed.');
        setPhase('error');
      }
    });

    return () => { abortRef.current = true; };
  }, [prompt]);

  // Truncate prompt display to ~120 chars
  const promptPreview = prompt.length > 120 ? prompt.slice(0, 120) + '...' : prompt;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'menuFade 0.2s ease both',
        }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative flex flex-col w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 640,
          height: 'min(520px, 55vh)',
          background: 'var(--p-white)',
          border: '1px solid var(--p-line)',
          boxShadow: '0 24px 80px -12px rgba(0,0,0,0.25)',
          animation: 'playModalIn 0.3s cubic-bezier(0.32,0.72,0,1) both',
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-4 md:px-5"
          style={{
            height: 48,
            borderBottom: '1px solid var(--p-line)',
            background: 'var(--p-cream)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: phase === 'streaming' ? '#4ade80' : phase === 'done' ? 'var(--p-mid)' : phase === 'error' ? '#ef4444' : 'var(--p-muted)',
                animation: phase === 'streaming' ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            />
            <span className="learn-label" style={{ color: 'var(--p-muted)' }}>
              {phase === 'loading' ? 'Sending...' : phase === 'streaming' ? 'Generating...' : phase === 'done' ? 'Complete' : 'Error'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors duration-150"
            style={{ background: 'none', border: 'none', color: 'var(--p-mid)' }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        {/* Prompt preview */}
        <div
          className="shrink-0 px-4 py-2.5 md:px-5 md:py-3"
          style={{ borderBottom: '1px solid var(--p-line)', background: 'var(--p-sand)' }}
        >
          <span className="learn-label" style={{ color: 'var(--p-muted)', display: 'block', marginBottom: 4 }}>
            {label}
          </span>
          <p
            className="m-0 text-[11.5px] md:text-[12px] leading-[1.5]"
            style={{
              fontFamily: 'var(--mono, monospace)',
              color: 'var(--p-mid)',
              fontWeight: 400,
            }}
          >
            {promptPreview}
          </p>
        </div>

        {/* Response area */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 md:px-5 md:py-5 learn-scroll"
        >
          {phase === 'loading' && (
            <div className="flex items-center gap-2.5 py-2">
              <div className="flex items-center gap-[3px]">
                <span className="w-[4px] h-[4px] rounded-full thinking-dot" />
                <span className="w-[4px] h-[4px] rounded-full thinking-dot" />
                <span className="w-[4px] h-[4px] rounded-full thinking-dot" />
              </div>
              <span
                className="text-[13px]"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted)', fontWeight: 400 }}
              >
                Thinking...
              </span>
            </div>
          )}

          {(phase === 'streaming' || phase === 'done') && (
            <div className="play-response-text" style={{ fontFamily: 'var(--sans)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {phase === 'streaming' && (
                <span
                  className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom animate-pulse"
                  style={{ background: 'var(--p-mid)' }}
                />
              )}
            </div>
          )}

          {phase === 'error' && (
            <div className="flex items-center gap-2 py-2">
              <span className="text-[13px]" style={{ fontFamily: 'var(--sans)', color: '#ef4444' }}>
                {errorMsg || 'Something went wrong.'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between px-4 md:px-5"
          style={{
            height: 40,
            borderTop: '1px solid var(--p-line)',
            background: 'var(--p-cream)',
          }}
        >
          <span className="learn-label" style={{ color: 'var(--p-muted)', opacity: 0.6 }}>
            Live demo
          </span>
          {phase === 'done' && (
            <button
              onClick={onClose}
              className="learn-label cursor-pointer transition-colors duration-150"
              style={{
                color: 'var(--p-mid)',
                background: 'none',
                border: 'none',
                padding: '2px 8px',
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
