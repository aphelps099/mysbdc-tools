'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sbdc_policy_accepted';

interface AIPolicyGateProps {
  children: React.ReactNode;
}

/* Shared animation config */
const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
const fadeUp = (delay: number, duration = 0.5) =>
  `policyFadeUp ${duration}s ${ease} ${delay}s both` as const;

/** Render each word as a stagger-animated span */
function WordStagger({ words, baseDelay, step = 0.06, color, bold }: {
  words: string[];
  baseDelay: number;
  step?: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: 0,
            animation: fadeUp(baseDelay + i * step, 0.45),
            color,
            fontWeight: bold ? 500 : undefined,
            marginRight: '0.3em',
          }}
        >
          {word}
        </span>
      ))}
    </>
  );
}

export default function AIPolicyGate({ children }: AIPolicyGateProps) {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setAccepted(stored === '1');
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setAccepted(true);
  };

  if (accepted === null) return null;
  if (accepted) return <>{children}</>;

  const bg = '#0c1929';
  const border = 'rgba(255,255,255,0.10)';
  const textWhite = '#ffffff';
  const textGrey = 'rgba(255,255,255,0.55)';
  const textMuted = 'rgba(255,255,255,0.35)';

  /* ── Timing cascade ── */
  const t = {
    icon: 0.05,
    titleWords: 0.15,     // word-by-word
    subtitle: 0.45,
    headerLine: 0.5,
    body1: 0.6,
    body2: 0.75,
    contactWords: 0.9,    // word-by-word
    links: 1.25,
    footerLine: 1.35,
    button: 1.45,
  };

  return (
    <>
      <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)' }} aria-hidden>
        {children}
      </div>

      {/* ── Full-screen overlay ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{
          background: 'rgba(6,12,24,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="w-full max-w-[520px] mx-2 sm:mx-4 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: bg,
            border: `1px solid ${border}`,
            boxShadow: '0 25px 80px -16px rgba(0,0,0,0.7)',
          }}
        >
          {/* ─── Header ─── */}
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 shrink-0">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4" style={{ opacity: 0, animation: fadeUp(t.icon, 0.6) }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <svg className="w-5 h-5" style={{ color: textWhite }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
            </div>

            {/* Title — word by word */}
            <h2
              className="text-[22px] font-bold tracking-[-0.02em] text-center"
              style={{ fontFamily: 'var(--display)' }}
            >
              <WordStagger
                words={['Before', 'You', 'Begin']}
                baseDelay={t.titleWords}
                step={0.08}
                color={textWhite}
              />
            </h2>

            {/* Subtitle */}
            <p
              className="text-[13px] font-normal text-center mt-1.5"
              style={{
                fontFamily: 'var(--sans)',
                color: textMuted,
                opacity: 0,
                animation: fadeUp(t.subtitle),
              }}
            >
              NorCal SBDC &middot; Prototype
            </p>
          </div>

          {/* Animated header border */}
          <div style={{ height: 1, background: border, transformOrigin: 'left', animation: `policyLineExpand 0.5s ${ease} ${t.headerLine}s both` }} />

          {/* ─── Body — line by line ─── */}
          <div className="px-5 sm:px-8 py-5 sm:py-6">
            <p
              className="text-[14px] leading-[1.8] font-normal"
              style={{ fontFamily: 'var(--sans)', color: textGrey, opacity: 0, animation: fadeUp(t.body1) }}
            >
              This platform is an internal prototype created by the NorCal SBDC to explore AI-powered advising tools. It is not intended for real-time client advising and is for internal network use as an exercise only.
            </p>

            <p
              className="text-[14px] leading-[1.8] font-normal mt-4"
              style={{ fontFamily: 'var(--sans)', color: textWhite, opacity: 0, animation: fadeUp(t.body2) }}
            >
              Never place client-sensitive information into the chat. Always carefully review each output, especially anything related to financial advice.
            </p>

            {/* Contact — word by word */}
            <p
              className="text-[13px] leading-[1.7] font-normal mt-5"
              style={{ fontFamily: 'var(--sans)' }}
            >
              <WordStagger
                words={['Questions?', 'Contact']}
                baseDelay={t.contactWords}
                step={0.06}
                color={textMuted}
              />
              <WordStagger
                words={['Aaron', 'Phelps,']}
                baseDelay={t.contactWords + 0.14}
                step={0.06}
                color={textGrey}
                bold
              />
              <WordStagger
                words={['Marketing', '&', 'Technology', 'Director']}
                baseDelay={t.contactWords + 0.28}
                step={0.05}
                color={textMuted}
              />
            </p>

            {/* Links — simple text */}
            <div
              className="flex items-center gap-x-3 mt-2"
              style={{ opacity: 0, animation: fadeUp(t.links) }}
            >
              <a
                href="mailto:phelps@norcalsbdc.org"
                className="text-[13px] font-normal transition-colors duration-150"
                style={{ fontFamily: 'var(--sans)', color: 'rgba(255,255,255,0.45)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = textWhite; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                email
              </a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
              <a
                href="https://linkedin.com/in/aaroncphelps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-normal transition-colors duration-150"
                style={{ fontFamily: 'var(--sans)', color: 'rgba(255,255,255,0.45)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = textWhite; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              >
                linkedin
              </a>
            </div>
          </div>

          {/* Animated footer border */}
          <div style={{ height: 1, background: border, transformOrigin: 'right', animation: `policyLineExpand 0.5s ${ease} ${t.footerLine}s both` }} />

          {/* ─── Footer ─── */}
          <div className="px-5 sm:px-8 py-4 sm:py-5 shrink-0" style={{ opacity: 0, animation: fadeUp(t.button) }}>
            <button
              onClick={handleAccept}
              className="w-full py-3 rounded-full font-semibold text-[14px] cursor-pointer transition-all duration-200"
              style={{
                fontFamily: 'var(--sans)',
                background: 'transparent',
                color: textWhite,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,1)';
                e.currentTarget.style.color = '#0c1929';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              I Understand &mdash; Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
