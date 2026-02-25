'use client';

import { useState, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';

const THINKING_PHRASES = [
  'Thinking',
  'Researching',
  'Analyzing',
  'Working on it',
  '"The secret of getting ahead is getting started." — Mark Twain',
  'Pulling it together',
  '"Do what you can, with what you have, where you are." — Theodore Roosevelt',
  'Almost there',
  '"It always seems impossible until it\'s done." — Nelson Mandela',
  'Drafting response',
  '"The best way to predict the future is to create it." — Peter Drucker',
];

const ASTERISK_FORMS = ['✦', '✶', '✳'] as const;

interface StreamingMessageProps {
  content: string;
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [asteriskIndex, setAsteriskIndex] = useState(0);

  useEffect(() => {
    if (content) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % THINKING_PHRASES.length);
        setVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [content]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAsteriskIndex((i) => (i + 1) % ASTERISK_FORMS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const asteriskSizes = [8, 11, 9];

  if (!content) {
    const phrase = THINKING_PHRASES[phraseIndex];
    const isQuote = phrase.startsWith('"');

    return (
      <div className="flex gap-2 fade-in">
        <div
          className="chat-avatar-streaming w-4 h-4 rounded-full shrink-0 mt-1.5 transition-all duration-500"
          style={{ fontSize: `${asteriskSizes[asteriskIndex]}px` }}
        >
          {ASTERISK_FORMS[asteriskIndex]}
        </div>
        <div className="flex items-center gap-2.5 py-2.5">
          <div className="flex items-center gap-[3px]">
            <span className="w-[4px] h-[4px] rounded-full thinking-dot" />
            <span className="w-[4px] h-[4px] rounded-full thinking-dot" />
            <span className="w-[4px] h-[4px] rounded-full thinking-dot" />
          </div>
          <span
            className={`
              text-[14px] font-[var(--era-text)] transition-opacity duration-300
              ${isQuote ? 'italic text-[var(--text-tertiary)] font-light' : 'text-[var(--text-secondary)] font-normal'}
              ${visible ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {isQuote ? phrase : `${phrase}...`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div
        className="chat-avatar-streaming w-4 h-4 rounded-full shrink-0 mt-1.5 transition-all duration-500"
        style={{ fontSize: `${asteriskSizes[asteriskIndex]}px` }}
      >
        {ASTERISK_FORMS[asteriskIndex]}
      </div>
      <div className="flex-1 min-w-0">
        <MarkdownContent content={content} />
        <span className="inline-block w-[2px] h-[1.1em] bg-[var(--royal)] ml-0.5 align-text-bottom animate-pulse" />
      </div>
    </div>
  );
}
