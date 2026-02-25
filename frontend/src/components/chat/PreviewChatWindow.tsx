'use client';

import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import StreamingMessage from './StreamingMessage';
import SbdcLogo from '../preview/SbdcLogo';
import type { Message, MessageAction } from '@/lib/types';

interface PreviewChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onChipClick?: (label: string) => void;
  onToolClick?: (toolId: string) => void;
  onOpenPolicy?: () => void;
  onActionClick?: (action: MessageAction) => void;
}

export default function PreviewChatWindow({ messages, isStreaming, streamingContent, onChipClick, onToolClick, onOpenPolicy, onActionClick }: PreviewChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
      {/* Streaming focus gradient — subtle top fade while AI is responding */}
      {isStreaming && (
        <div
          className="sticky top-0 left-0 right-0 h-[60px] z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, var(--p-sand) 0%, transparent 100%)',
            animation: 'pvEnter 0.6s ease both',
          }}
        />
      )}

      <div className="max-w-[var(--chat-max-width)] w-full mx-auto px-3 md:px-4 py-6 pb-[120px] box-border">
        {isEmpty ? (
          <PreviewWelcomeState onChipClick={onChipClick} onToolClick={onToolClick} onOpenPolicy={onOpenPolicy} />
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isLatestAssistant = msg.role === 'assistant'
                && !isStreaming
                && index === messages.map((m, i) => m.role === 'assistant' ? i : -1).filter(i => i >= 0).pop();
              return (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  hasCompliance={msg.hasCompliance}
                  model={msg.model}
                  actions={msg.actions}
                  onActionClick={onActionClick}
                  isLatestAssistant={isLatestAssistant}
                />
              );
            })}
            {isStreaming && <StreamingMessage content={streamingContent} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}

const TOOL_MAPPINGS: Record<string, string> = {
  'Review a business plan': 'business-plan-review',
  'Funding readiness': 'funding-readiness',
  'SWOT Analysis': 'swot-facilitator',
  'Prep for a session': 'session-prep',
  'Draft a client email': 'client-followup',
  'Getting started with AI': 'ai-walkthrough',
};

const CARDS = [
  {
    label: 'Review a business plan',
    color: 'blue' as const,
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  {
    label: 'Funding readiness',
    color: 'red' as const,
    icon: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </>
    ),
  },
  {
    label: 'SWOT Analysis',
    color: 'purple' as const,
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
];

const PILLS = [
  { label: 'Prep for a session', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
  { label: 'Draft a client email', icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></> },
  { label: 'Getting started with AI', icon: <><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><line x1="9" y1="21" x2="15" y2="21" /></> },
];

const colorMap = {
  blue:   { bg: 'var(--p-soft-blue)',   stroke: 'var(--p-blue)',   accent: 'var(--p-blue)' },
  red:    { bg: 'var(--p-soft-red)',    stroke: 'var(--p-red)',    accent: 'var(--p-red)' },
  purple: { bg: 'var(--p-soft-purple)', stroke: 'var(--p-purple)', accent: 'var(--p-purple)' },
};

function PreviewWelcomeState({ onChipClick, onToolClick, onOpenPolicy }: { onChipClick?: (label: string) => void; onToolClick?: (toolId: string) => void; onOpenPolicy?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-0 md:px-4 pb-[100px]">
      {/* Animated SVG Logo */}
      <div className="mb-2.5 pv-stagger-1">
        <SbdcLogo style={{ height: 40, width: 'auto', display: 'block' }} />
      </div>

      {/* Eyebrow */}
      <span
        className="pv-stagger-2 mb-2.5"
        style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-muted)' }}
      >
        Advisor AI
      </span>

      {/* Title — GT Era thin + heavy */}
      <h1
        className="pv-stagger-3 mb-2"
        style={{
          fontFamily: 'var(--display)',
          fontWeight: 100,
          fontSize: 'clamp(34px, 5vw, 51px)',
          letterSpacing: '-0.04em',
          textAlign: 'center',
          lineHeight: 1.08,
          color: 'var(--p-ink)',
        }}
      >
        What are you<br />
        <strong style={{ fontWeight: 900, fontFamily: 'var(--display)' }}>working on?</strong>
      </h1>

      {/* Sub */}
      <p
        className="pv-stagger-4 mb-9"
        style={{ fontSize: 14, color: 'var(--p-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.65 }}
      >
        Ask a question, choose a prompt, or start a workflow.
        {onOpenPolicy && (
          <>
            {' '}Review our{' '}
            <button
              onClick={onOpenPolicy}
              className="cursor-pointer transition-colors duration-150"
              style={{ color: 'var(--p-mid)', textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', padding: 0, font: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-mid)'; }}
            >
              AI&nbsp;Policy
            </button>.
          </>
        )}
      </p>

      {/* ─── Mobile cards — clean white with accent stripe ─── */}
      <div className="flex flex-col gap-2.5 w-full md:hidden">
        {CARDS.map((card, i) => {
          const c = colorMap[card.color];
          return (
            <button
              key={card.label}
              onClick={() => onToolClick?.(TOOL_MAPPINGS[card.label])}
              className={`pv-stagger-${i + 5} group relative flex items-center gap-3.5 pl-5 pr-4 py-4 rounded-xl cursor-pointer text-left transition-all duration-200 active:scale-[0.98]`}
              style={{
                background: 'var(--p-white)',
                border: '1px solid var(--p-line)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              {/* Left accent stripe */}
              <span
                className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-r-full"
                style={{ background: c.accent }}
              />
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth={1.5}>{card.icon}</svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold leading-tight" style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)' }}>{card.label}</p>
              </div>
              <svg className="w-4 h-4 shrink-0 opacity-25 group-active:opacity-50 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="var(--p-ink)" strokeWidth={2}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* ─── Desktop cards — 3-column grid ─── */}
      <div className="hidden md:grid grid-cols-3 gap-2 w-full max-w-[620px]">
        {CARDS.map((card, i) => {
          const c = colorMap[card.color];
          return (
            <button
              key={card.label}
              onClick={() => onToolClick?.(TOOL_MAPPINGS[card.label])}
              className={`pv-stagger-${i + 5} group relative flex flex-col min-h-[132px] p-[18px_16px_16px] rounded-xl cursor-pointer text-left transition-all duration-[250ms]`}
              style={{ background: 'var(--p-white)', border: '1px solid var(--p-line)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--p-navy)'; e.currentTarget.style.boxShadow = '0 6px 24px -6px rgba(22,45,80,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--p-line)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <span
                className="absolute top-[-1px] left-[14px] right-[14px] h-[2px] rounded-b-sm opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms]"
                style={{ background: c.accent }}
              />
              <div className="flex items-start justify-between mb-auto">
                <div className="w-9 h-9 rounded-[9px] flex items-center justify-center group-hover:scale-105 transition-transform duration-[250ms]" style={{ background: c.bg }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth={1.5}>{card.icon}</svg>
                </div>
                <span
                  className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center opacity-0 -translate-x-0.5 translate-y-0.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[250ms]"
                  style={{ background: 'var(--p-sand)' }}
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="var(--p-navy)" strokeWidth={2}>
                    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
              </div>
              <div className="mt-3">
                <p className="text-[13px] font-bold leading-tight" style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink)' }}>{card.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Desktop pills row ─── */}
      <div className="hidden md:grid grid-cols-3 gap-2 w-full max-w-[620px] mt-2">
        {PILLS.map((pill, i) => (
          <button
            key={pill.label}
            onClick={() => onToolClick?.(TOOL_MAPPINGS[pill.label])}
            className={`pv-stagger-${i + 8} flex items-center gap-[7px] py-[9px] px-3 rounded-[9px] cursor-pointer text-left transition-all duration-200`}
            style={{ background: 'var(--p-cream)', border: '1px solid var(--p-line)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--p-navy)'; e.currentTarget.style.background = 'var(--p-white)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--p-line)'; e.currentTarget.style.background = 'var(--p-cream)'; }}
          >
            <svg className="w-[13px] h-[13px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--p-muted)" strokeWidth={1.5}>{pill.icon}</svg>
            <span className="text-[11px] font-bold" style={{ fontFamily: 'var(--sans)', color: 'var(--p-mid)' }}>{pill.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
