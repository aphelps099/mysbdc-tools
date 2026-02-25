'use client';

import { useState } from 'react';

interface CopyBlockProps {
  text: string;
  label?: string;
  onPlay?: () => void;
}

const btnBase = {
  fontFamily: 'var(--mono, monospace)',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  border: 'none',
  padding: '4px 10px',
  borderRadius: 6,
} as const;

export default function CopyBlock({ text, label = 'SAMPLE PROMPT', onPlay }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      className="rounded-xl md:rounded-2xl overflow-hidden my-3 md:my-5"
      style={{
        background: 'var(--p-code-bg, #162d50)',
        boxShadow: '0 2px 12px -2px rgba(15,28,46,0.2)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 md:px-5 md:py-3"
        style={{
          background: 'var(--p-code-header, rgba(255,255,255,0.04))',
          borderBottom: '1px solid var(--p-code-border, rgba(255,255,255,0.06))',
        }}
      >
        <span
          className="learn-label"
          style={{ color: 'var(--p-code-label, #8FC5D9)' }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Play button — only shown when onPlay is provided */}
          {onPlay && (
            <button
              onClick={onPlay}
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
              style={{
                ...btnBase,
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#4ade80';
                e.currentTarget.style.background = 'rgba(74,222,128,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
            style={{
              ...btnBase,
              color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)',
              background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)',
              animation: copied ? 'copySuccess 0.3s ease' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }
            }}
          >
            {copied ? (
              <>
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt content */}
      <div className="px-3.5 py-3 md:px-5 md:py-4">
        <pre
          className="whitespace-pre-wrap text-[12.5px] md:text-[13px] leading-[1.7]"
          style={{
            fontFamily: 'var(--mono, monospace)',
            color: 'var(--p-code-text, rgba(240,239,235,0.9))',
            margin: 0,
            fontWeight: 400,
          }}
        >
          {text}
        </pre>
      </div>
    </div>
  );
}
