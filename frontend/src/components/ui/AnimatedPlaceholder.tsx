'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const PHRASES = [
  'Describe your idea',
  'Prepare for advising',
  'Explore a question',
];

/* ── Timing (ms) ── */
const CHAR_STAGGER  = 28;   // delay between each character entering
const CHAR_DURATION = 420;  // how long each character's entrance takes
const HOLD_MS       = 2200; // how long the full phrase stays visible
const EXIT_MS       = 600;  // how long the exit drift takes
const PAUSE_MS      = 180;  // brief pause between exit and next entrance

interface AnimatedPlaceholderProps {
  visible: boolean;
  fontSize?: number;
}

export default function AnimatedPlaceholder({ visible, fontSize = 18 }: AnimatedPlaceholderProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>('entering');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chars = PHRASES[index].split('');

  const clear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  /* Phase state-machine */
  const scheduleHold = useCallback(() => {
    const dur = PHRASES[index].split('').length * CHAR_STAGGER + CHAR_DURATION;
    timeoutRef.current = setTimeout(() => setPhase('holding'), dur);
  }, [index]);

  const scheduleExit = useCallback(() => {
    timeoutRef.current = setTimeout(() => setPhase('exiting'), HOLD_MS);
  }, []);

  const scheduleNext = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
      setPhase('entering');
    }, EXIT_MS + PAUSE_MS);
  }, []);

  useEffect(() => {
    if (!visible) return;
    clear();
    if (phase === 'entering') scheduleHold();
    else if (phase === 'holding') scheduleExit();
    else if (phase === 'exiting') scheduleNext();
    return clear;
  }, [visible, phase, scheduleHold, scheduleExit, scheduleNext]);

  /* Reset on visibility change */
  useEffect(() => {
    if (visible) {
      setIndex(0);
      setPhase('entering');
    }
  }, [visible]);

  if (!visible) return null;

  const isExiting = phase === 'exiting';

  return (
    <span
      aria-hidden
      className="pointer-events-none select-none absolute left-0 top-0 h-full flex items-center"
      style={{
        fontFamily: 'var(--display)',
        fontSize,
        fontWeight: 300,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        /* Whole-phrase exit drift */
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(-8px)' : 'translateY(0)',
        transition: isExiting
          ? `opacity ${EXIT_MS}ms cubic-bezier(0.4,0,1,1), transform ${EXIT_MS}ms cubic-bezier(0.4,0,1,1)`
          : 'none',
      }}
    >
      {chars.map((char, i) => {
        const delay = i * CHAR_STAGGER;
        const entered = phase !== 'entering';

        return (
          <span
            key={`${index}-${i}`}
            style={{
              display: 'inline-block',
              color: 'var(--p-mid, #78716c)',
              opacity: entered ? 0.88 : 0,
              transform: entered ? 'translateY(0)' : 'translateY(10px)',
              filter: entered ? 'blur(0)' : 'blur(3px)',
              transition: [
                `opacity ${CHAR_DURATION}ms cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
                `transform ${CHAR_DURATION}ms cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
                `filter ${CHAR_DURATION}ms cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
              ].join(', '),
              /* Preserve whitespace width */
              minWidth: char === ' ' ? '0.25em' : undefined,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}
