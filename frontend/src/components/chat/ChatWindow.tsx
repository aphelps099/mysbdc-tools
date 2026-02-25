'use client';

import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import StreamingMessage from './StreamingMessage';
import type { Message } from '@/lib/types';

interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onChipClick?: (label: string) => void;
}

export default function ChatWindow({ messages, isStreaming, streamingContent, onChipClick }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[var(--chat-max-width)] mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {isEmpty ? (
          <WelcomeState onChipClick={onChipClick} />
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                hasCompliance={msg.hasCompliance}
                model={msg.model}
              />
            ))}
            {isStreaming && <StreamingMessage content={streamingContent} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}

// Map chip labels to exact prompt library titles
const CHIP_MAPPINGS: Record<string, string> = {
  'Review a business plan': 'Business Plan Review',
  'Draft a client email': 'Email Follow-up Templates',
  'Prep for a session': 'Difficult Conversation Prep',
  'SBA loan guidance': 'Funding Readiness Assessment',
  'Market research': 'Market Research Kickstart',
  'Workshop promo': 'Workshop Promotion Generator',
};

function WelcomeState({ onChipClick }: { onChipClick?: (label: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="chat-avatar w-8 h-8 rounded-full mb-5" />
      <h1 className="text-display text-[28px] text-[var(--text-primary)] mb-3">
        SBDC Advisor AI
      </h1>
      <p className="text-[16px] font-[var(--era-text)] font-light text-[var(--text-secondary)] max-w-md leading-relaxed">
        Your AI-powered assistant for small business advising. Ask a question, choose a prompt, or start a workflow.
      </p>

      {/* Quick start chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-lg">
        {Object.keys(CHIP_MAPPINGS).map((label) => (
          <button
            key={label}
            onClick={() => onChipClick?.(CHIP_MAPPINGS[label])}
            className="
              px-4 py-2
              text-[14px] font-[var(--era-text)] font-normal
              text-[var(--text-secondary)]
              bg-[var(--cream)] border border-[var(--rule-light)]
              rounded-full
              hover:bg-white hover:border-[var(--rule)] hover:text-[var(--text-primary)]
              transition-all duration-[var(--duration-fast)]
              cursor-pointer
            "
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
