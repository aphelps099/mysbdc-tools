'use client';

import { useState } from 'react';

import ComplianceFooter from '../compliance/ComplianceFooter';
import MarkdownContent from './MarkdownContent';
import type { MessageAction } from '@/lib/types';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  hasCompliance?: boolean;
  model?: string;
  actions?: MessageAction[];
  onActionClick?: (action: MessageAction) => void;
  isLatestAssistant?: boolean;
}

export default function MessageBubble({ role, content, hasCompliance, model, actions, onActionClick, isLatestAssistant }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end fade-in">
        <div className="max-w-[85%] bg-[var(--user-bubble-bg)] rounded-2xl rounded-br-md px-5 py-3.5">
          <p className="text-[19px] font-[var(--era-text)] font-normal leading-[1.75] text-[var(--text-primary)] whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 fade-in">
      {/* Avatar */}
      <div className="chat-avatar w-4 h-4 rounded-full shrink-0 mt-1.5" />

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <MarkdownContent content={content} />

        {/* Workflow action buttons */}
        {actions && actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => isLatestAssistant && onActionClick?.(action)}
                disabled={!isLatestAssistant}
                className="transition-all duration-150 cursor-pointer disabled:cursor-default disabled:opacity-40"
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontFamily: 'var(--sans)',
                  fontWeight: 500,
                  borderRadius: 999,
                  border: action.action === 'command'
                    ? '1px solid var(--p-line)'
                    : '1px solid rgba(29, 78, 137, 0.3)',
                  color: action.action === 'command'
                    ? 'var(--p-mid)'
                    : 'var(--royal)',
                  background: action.action === 'command'
                    ? 'var(--p-cream, #f5f1eb)'
                    : 'rgba(29, 78, 137, 0.06)',
                }}
                onMouseEnter={(e) => {
                  if (!isLatestAssistant) return;
                  if (action.action === 'command') {
                    e.currentTarget.style.background = 'var(--p-white, #fff)';
                    e.currentTarget.style.borderColor = 'var(--p-mid)';
                  } else {
                    e.currentTarget.style.background = 'rgba(29, 78, 137, 0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (action.action === 'command') {
                    e.currentTarget.style.background = 'var(--p-cream, #f5f1eb)';
                    e.currentTarget.style.borderColor = 'var(--p-line)';
                  } else {
                    e.currentTarget.style.background = 'rgba(29, 78, 137, 0.06)';
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={handleCopy}
            className={`
              text-[10px] uppercase
              transition-colors duration-[var(--duration-fast)]
              cursor-pointer
              ${copied
                ? 'text-green-600'
                : 'text-[var(--text-tertiary)]/60 hover:text-[var(--text-secondary)]'
              }
            `}
            style={{
              fontFamily: 'var(--era-text)',
              fontWeight: 500,
              letterSpacing: '0.1em',
            }}
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
          {model && (
            <span
              className="text-[9px] uppercase"
              style={{
                fontFamily: 'var(--era-text)',
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: 'var(--text-tertiary)',
                opacity: 0.5,
              }}
            >
              {model}
            </span>
          )}
        </div>
        {hasCompliance && <ComplianceFooter />}
      </div>
    </div>
  );
}
