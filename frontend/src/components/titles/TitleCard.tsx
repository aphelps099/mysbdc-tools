'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import './title-card.css';

/* ═══════════════════════════════════════════════════════
   TitleCard — Motion graphics title generator
   Screen-record-friendly animated title cards
   ═══════════════════════════════════════════════════════ */

// ── Color schemes ──
const SCHEMES = [
  { id: 'navy',  label: 'Navy',  bg: '#0f1c2e', fg: '#ffffff', accent: '#8FC5D9', muted: 'rgba(255,255,255,0.45)', line: 'rgba(255,255,255,0.15)' },
  { id: 'cream', label: 'Cream', bg: '#f0efeb', fg: '#0f1c2e', accent: '#1D5AA7', muted: 'rgba(15,28,46,0.4)',     line: 'rgba(15,28,46,0.12)' },
  { id: 'royal', label: 'Royal', bg: '#1D5AA7', fg: '#ffffff', accent: '#8FC5D9', muted: 'rgba(255,255,255,0.45)', line: 'rgba(255,255,255,0.2)' },
  { id: 'dark',  label: 'Dark',  bg: '#111827', fg: '#e5e7eb', accent: '#4a8fe2', muted: 'rgba(229,231,235,0.4)',  line: 'rgba(255,255,255,0.08)' },
  { id: 'white', label: 'White', bg: '#ffffff', fg: '#0a1528', accent: '#a82039', muted: 'rgba(10,21,40,0.35)',    line: 'rgba(0,0,0,0.08)' },
] as const;

type SchemeId = typeof SCHEMES[number]['id'];

// ── Animation phase ──
type Phase = 'idle' | 'entering' | 'visible' | 'exiting';

// ── Layout options ──
const LAYOUTS = [
  { id: 'center',       label: 'Center' },
  { id: 'lower-left',   label: 'Lower Left' },
  { id: 'lower-center', label: 'Lower Center' },
] as const;

type LayoutId = typeof LAYOUTS[number]['id'];

export default function TitleCard() {
  // ── Content state ──
  const [title, setTitle] = useState('SBDC AI Advisor');
  const [subtitle, setSubtitle] = useState('Empowering advisors with practical AI skills');
  const [kicker, setKicker] = useState('INTRODUCING');

  // ── Style state ──
  const [scheme, setScheme] = useState<SchemeId>('navy');
  const [layout, setLayout] = useState<LayoutId>('center');
  const [speed, setSpeed] = useState(1);
  const [showGrain, setShowGrain] = useState(true);

  // ── Animation state ──
  const [phase, setPhase] = useState<Phase>('idle');
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const colors = SCHEMES.find((s) => s.id === scheme) ?? SCHEMES[0];

  // Clear all pending timers
  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  // ── Play animation ──
  const play = useCallback(() => {
    clearTimers();
    setPhase('idle');
    // Small tick to let idle state flush, then enter
    const t0 = setTimeout(() => setPhase('entering'), 30);
    timerRef.current.push(t0);

    // Transition to "visible" after all enter animations complete
    const enterDuration = 1800 * speed;
    const t1 = setTimeout(() => setPhase('visible'), enterDuration);
    timerRef.current.push(t1);
  }, [speed, clearTimers]);

  // ── Exit animation ──
  const exit = useCallback(() => {
    if (phase !== 'visible' && phase !== 'entering') return;
    clearTimers();
    setPhase('exiting');
    const exitDuration = 600 * speed;
    const t = setTimeout(() => setPhase('idle'), exitDuration);
    timerRef.current.push(t);
  }, [phase, speed, clearTimers]);

  // ── Loop: play → hold → exit → replay ──
  const loop = useCallback(() => {
    play();
    const holdTime = (1800 + 2500) * speed; // enter + hold
    const exitTime = holdTime + 600 * speed;
    const restartTime = exitTime + 400 * speed;

    const t1 = setTimeout(() => setPhase('exiting'), holdTime);
    const t2 = setTimeout(() => setPhase('idle'), exitTime);
    const t3 = setTimeout(() => loop(), restartTime);

    timerRef.current.push(t1, t2, t3);
  }, [play, speed]);

  // ── Reset ──
  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle');
  }, [clearTimers]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
        return;
      }
      if (e.key === 'f' && !fullscreen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setFullscreen(true);
        return;
      }
      if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        if (phase === 'idle') play();
        else if (phase === 'visible') exit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, phase, play, exit]);

  // Cleanup timers on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Title words for staggered reveal ──
  const titleWords = title.split(/\s+/).filter(Boolean);

  // ── Compute stagger delays (ms) ──
  const baseDelay = 200; // after kicker line
  const wordDelay = 120; // between each word

  const animClass = (base: string, delay: number) => {
    if (phase === 'entering' || phase === 'visible') return `${base} tc-animate`;
    if (phase === 'exiting') return `${base} tc-exit`;
    return base;
  };

  // ── Layout alignment ──
  const alignmentClass =
    layout === 'center'       ? 'items-center justify-center text-center' :
    layout === 'lower-left'   ? 'items-start justify-end text-left' :
                                'items-center justify-end text-center';

  const paddingStyle =
    layout === 'center'       ? { padding: '48px' } :
    layout === 'lower-left'   ? { padding: '48px 56px' } :
                                { padding: '48px 56px 64px' };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--p-sand, #f0efeb)' }}>

      {/* ── STAGE (16:9) ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6">
        <div
          className={`tc-stage ${showGrain ? 'tc-grain' : ''} ${fullscreen ? 'tc-fullscreen' : ''} w-full`}
          style={{
            ...paddingStyle,
            aspectRatio: fullscreen ? undefined : '16 / 9',
            maxWidth: fullscreen ? undefined : 960,
            height: fullscreen ? '100%' : undefined,
            background: colors.bg,
            borderRadius: fullscreen ? 0 : 12,
            boxShadow: fullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            ['--tc-speed' as string]: speed,
          }}
        >
          <div className={`flex flex-col gap-4 ${alignmentClass} flex-1 relative z-10`}>

            {/* Kicker line */}
            <div className="flex items-center gap-3">
              <div
                className={animClass('tc-kicker-line', 0)}
                style={{
                  width: 32,
                  height: 2,
                  background: colors.accent,
                  animationDelay: `${0}ms`,
                }}
              />
              <span
                className={animClass('tc-kicker', baseDelay * speed)}
                style={{
                  fontFamily: "var(--sans, 'GT America', sans-serif)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: colors.accent,
                  animationDelay: `${baseDelay * speed}ms`,
                }}
              >
                {kicker}
              </span>
            </div>

            {/* Title — word-by-word reveal */}
            <h1
              style={{
                fontFamily: "var(--display, 'GT Era Display', sans-serif)",
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                fontWeight: 300,
                lineHeight: 1.15,
                color: colors.fg,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {titleWords.map((word, i) => {
                const delay = (baseDelay + 150 + i * wordDelay) * speed;
                return (
                  <span key={`${word}-${i}`}>
                    <span
                      className={animClass('tc-word', delay)}
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      {word}
                    </span>
                    {i < titleWords.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </h1>

            {/* Divider */}
            {subtitle && (
              <div
                className={animClass('tc-divider', (baseDelay + 150 + titleWords.length * wordDelay + 100) * speed)}
                style={{
                  width: layout === 'center' ? 48 : 40,
                  height: 1,
                  background: colors.line,
                  animationDelay: `${(baseDelay + 150 + titleWords.length * wordDelay + 100) * speed}ms`,
                }}
              />
            )}

            {/* Subtitle */}
            {subtitle && (
              <p
                className={animClass('tc-subtitle', (baseDelay + 150 + titleWords.length * wordDelay + 250) * speed)}
                style={{
                  fontFamily: "var(--era-text, 'GT Era Text', sans-serif)",
                  fontSize: 'clamp(13px, 1.6vw, 18px)',
                  fontWeight: 400,
                  color: colors.muted,
                  margin: 0,
                  maxWidth: 520,
                  lineHeight: 1.5,
                  animationDelay: `${(baseDelay + 150 + titleWords.length * wordDelay + 250) * speed}ms`,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Corner accent */}
          <div
            className={animClass('tc-corner', (baseDelay + 150 + titleWords.length * wordDelay + 400) * speed)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 48,
              height: 48,
              border: `1.5px solid ${colors.accent}`,
              borderRadius: 4,
              animationDelay: `${(baseDelay + 150 + titleWords.length * wordDelay + 400) * speed}ms`,
              zIndex: 1,
            }}
          />

          {/* Watermark — always present, fades in */}
          <div
            className={animClass('tc-watermark', (baseDelay + 150 + titleWords.length * wordDelay + 500) * speed)}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 28,
              fontFamily: "var(--sans, 'GT America', sans-serif)",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: colors.fg,
              textTransform: 'uppercase',
              animationDelay: `${(baseDelay + 150 + titleWords.length * wordDelay + 500) * speed}ms`,
              zIndex: 1,
            }}
          >
            aaron phelps | norcalsbdc
          </div>

          {/* Fullscreen exit hint */}
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 left-4 z-50 cursor-pointer"
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 10,
                fontFamily: "var(--sans)",
                letterSpacing: '0.06em',
                opacity: 0.5,
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
            >
              ESC to exit
            </button>
          )}
        </div>
      </div>

      {/* ── CONTROLS PANEL ── */}
      <div
        className="tc-controls shrink-0"
        style={{
          background: 'var(--p-cream, #e8e7e3)',
          borderTop: '1px solid var(--p-line, rgba(0,0,0,0.08))',
          padding: '20px 28px 24px',
        }}
      >
        {/* Row 1: Text inputs */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-[0.3]">
            <label
              className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
            >
              Kicker
            </label>
            <input
              type="text"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              placeholder="INTRODUCING"
              className="w-full"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-ink, #0f1c2e)',
                outline: 'none',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pool, #8FC5D9)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--p-line, rgba(0,0,0,0.1))'; }}
            />
          </div>
          <div className="flex-1">
            <label
              className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your Title Here"
              className="w-full"
              style={{
                fontFamily: "var(--display, 'GT Era Display', sans-serif)",
                fontSize: 16,
                fontWeight: 300,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-ink, #0f1c2e)',
                outline: 'none',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pool, #8FC5D9)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--p-line, rgba(0,0,0,0.1))'; }}
            />
          </div>
        </div>

        <div className="mb-5">
          <label
            className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-1.5"
            style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
          >
            Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Supporting text goes here"
            className="w-full"
            style={{
              fontFamily: "var(--era-text, 'GT Era Text', sans-serif)",
              fontSize: 14,
              fontWeight: 400,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
              background: 'var(--p-white, #fff)',
              color: 'var(--p-ink, #0f1c2e)',
              outline: 'none',
              transition: 'border-color 150ms ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pool, #8FC5D9)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--p-line, rgba(0,0,0,0.1))'; }}
          />
        </div>

        {/* Row 2: Scheme, Layout, Speed, Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">

          {/* Color scheme */}
          <div>
            <label
              className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-2"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
            >
              Color
            </label>
            <div className="flex gap-1.5">
              {SCHEMES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScheme(s.id)}
                  title={s.label}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: s.bg,
                    border: scheme === s.id ? `2px solid ${s.accent}` : '2px solid transparent',
                    boxShadow: scheme === s.id ? `0 0 0 2px var(--p-cream, #e8e7e3), 0 0 0 4px ${s.accent}` : '0 1px 3px rgba(0,0,0,0.12)',
                    transform: scheme === s.id ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label
              className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-2"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
            >
              Layout
            </label>
            <div className="flex gap-1">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l.id)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 10,
                    fontWeight: layout === l.id ? 700 : 500,
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                    background: layout === l.id ? 'var(--p-ink, #0f1c2e)' : 'var(--p-white, #fff)',
                    color: layout === l.id ? '#fff' : 'var(--p-mid, #6b7280)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <label
              className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-2"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
            >
              Speed
            </label>
            <div className="flex gap-1">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    fontWeight: speed === s ? 700 : 400,
                    padding: '5px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                    background: speed === s ? 'var(--p-ink, #0f1c2e)' : 'var(--p-white, #fff)',
                    color: speed === s ? '#fff' : 'var(--p-mid, #6b7280)',
                    minWidth: 38,
                    textAlign: 'center' as const,
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Grain toggle */}
          <div>
            <label
              className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-2"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
            >
              Grain
            </label>
            <button
              onClick={() => setShowGrain((g) => !g)}
              className="cursor-pointer transition-all duration-150"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 10,
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 6,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: showGrain ? 'var(--p-ink, #0f1c2e)' : 'var(--p-white, #fff)',
                color: showGrain ? '#fff' : 'var(--p-mid, #6b7280)',
              }}
            >
              {showGrain ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={play}
              className="cursor-pointer transition-all duration-150"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '9px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#1D5AA7',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(29,90,167,0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(29,90,167,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(29,90,167,0.3)'; }}
            >
              ▶ Play
            </button>

            <button
              onClick={exit}
              className="cursor-pointer transition-all duration-150"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-mid, #6b7280)',
                opacity: phase === 'visible' || phase === 'entering' ? 1 : 0.4,
              }}
            >
              Exit ◀
            </button>

            <button
              onClick={loop}
              className="cursor-pointer transition-all duration-150"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '9px 16px',
                borderRadius: 8,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-mid, #6b7280)',
              }}
            >
              ↻ Loop
            </button>

            <button
              onClick={reset}
              className="cursor-pointer transition-all duration-150"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 600,
                padding: '9px 14px',
                borderRadius: 8,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-mid, #6b7280)',
              }}
            >
              Reset
            </button>

            <button
              onClick={() => setFullscreen(true)}
              title="Fullscreen (F)"
              className="cursor-pointer transition-all duration-150"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 600,
                padding: '9px 14px',
                borderRadius: 8,
                border: '1px solid var(--p-line, rgba(0,0,0,0.1))',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-mid, #6b7280)',
              }}
            >
              ⛶
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div
          className="mt-3 text-right"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 9,
            color: 'var(--p-muted, #8a8a8a)',
            letterSpacing: '0.04em',
          }}
        >
          SPACE = play/exit &nbsp;·&nbsp; F = fullscreen &nbsp;·&nbsp; ESC = exit fullscreen
        </div>
      </div>
    </div>
  );
}
