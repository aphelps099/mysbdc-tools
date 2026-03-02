'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import './title-card.css';
import './tfg-title-card.css';

/* ═══════════════════════════════════════════════════════
   TFGTitleCard — TFG-branded motion graphics title generator
   Dark theme, electric green accent, GT America Extended
   ═══════════════════════════════════════════════════════ */

const TFG_LOGO_URL =
  'https://www.techfuturesgroup.org/wp-content/uploads/2026/01/tfg-lime-ring@4x.png';

// ── TFG Color schemes ──
const SCHEMES = [
  { id: 'dark',  label: 'Dark',  bg: '#0d0d0d', fg: '#e2e6eb', accent: '#4eff00', muted: 'rgba(226,230,235,0.4)',  line: 'rgba(255,255,255,0.1)' },
  { id: 'slate', label: 'Slate', bg: '#131316', fg: '#e2e6eb', accent: '#4eff00', muted: 'rgba(226,230,235,0.35)', line: 'rgba(255,255,255,0.08)' },
  { id: 'green', label: 'Green', bg: '#4eff00', fg: '#0d0d0d', accent: '#0d0d0d', muted: 'rgba(13,13,13,0.45)',    line: 'rgba(13,13,13,0.15)' },
  { id: 'white', label: 'White', bg: '#ffffff', fg: '#0d0d0d', accent: '#4eff00', muted: 'rgba(13,13,13,0.35)',    line: 'rgba(0,0,0,0.08)' },
  { id: 'navy',  label: 'Navy',  bg: '#0f1c2e', fg: '#e2e6eb', accent: '#4eff00', muted: 'rgba(226,230,235,0.4)',  line: 'rgba(255,255,255,0.12)' },
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

// ── Title font options ──
const FONTS = [
  { id: 'extended', label: 'Extended',  family: "var(--extended, 'GT America Extended', sans-serif)", weight: 500, spacing: '-0.03em' },
  { id: 'tobias',   label: 'Tobias',    family: "var(--serif, 'Tobias', Georgia, serif)",             weight: 500, spacing: '-0.02em' },
  { id: 'sans',     label: 'Sans',      family: "var(--sans, 'GT America', sans-serif)",              weight: 600, spacing: '-0.02em' },
] as const;

type FontId = typeof FONTS[number]['id'];

export default function TFGTitleCard() {
  // ── Content state ──
  const [title, setTitle] = useState('Building Tomorrow\'s Startups');
  const [subtitle, setSubtitle] = useState('NorCal SBDC accelerator program');
  const [kicker, setKicker] = useState('TECH FUTURES GROUP');

  // ── Style state ──
  const [scheme, setScheme] = useState<SchemeId>('dark');
  const [layout, setLayout] = useState<LayoutId>('center');
  const [titleFont, setTitleFont] = useState<FontId>('extended');
  const [speed, setSpeed] = useState(1);
  const [showGrain, setShowGrain] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

  // ── Animation state ──
  const [phase, setPhase] = useState<Phase>('idle');
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const colors = SCHEMES.find((s) => s.id === scheme) ?? SCHEMES[0];
  const fontConfig = FONTS.find((f) => f.id === titleFont) ?? FONTS[0];
  const needsDarkLogo = scheme === 'green' || scheme === 'white';

  // Clear all pending timers
  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  // ── Play animation ──
  const play = useCallback(() => {
    clearTimers();
    setPhase('idle');
    const t0 = setTimeout(() => setPhase('entering'), 30);
    timerRef.current.push(t0);

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
    const holdTime = (1800 + 2500) * speed;
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
  const baseDelay = 200;
  const wordDelay = 120;

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
    <div className="flex flex-col h-full" style={{ background: '#0d0d0d' }}>

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
            boxShadow: fullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.4)',
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
                fontFamily: fontConfig.family,
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                fontWeight: fontConfig.weight,
                lineHeight: 1.1,
                color: colors.fg,
                margin: 0,
                letterSpacing: fontConfig.spacing,
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

          {/* TFG logo — top-left */}
          {showLogo && (
            <img
              src={TFG_LOGO_URL}
              alt="TFG"
              className={animClass('tc-corner', 0)}
              style={{
                position: 'absolute',
                top: 24,
                left: 28,
                height: 56,
                width: 'auto',
                animationDelay: '0ms',
                zIndex: 1,
                filter: needsDarkLogo ? 'brightness(0)' : `drop-shadow(0 1px 4px rgba(0,0,0,0.5))`,
              }}
            />
          )}

          {/* Watermark */}
          <div
            className={animClass('tc-watermark', (baseDelay + 150 + titleWords.length * wordDelay + 400) * speed)}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 28,
              fontFamily: "var(--mono, 'GT America Mono', monospace)",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: colors.fg,
              textTransform: 'uppercase',
              animationDelay: `${(baseDelay + 150 + titleWords.length * wordDelay + 400) * speed}ms`,
              zIndex: 1,
            }}
          >
            tech futures group | norcalsbdc
          </div>

          {/* Fullscreen exit hint */}
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 left-4 z-50 cursor-pointer"
              style={{
                background: 'rgba(78,255,0,0.15)',
                color: '#4eff00',
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
        className="tfg-tc-controls shrink-0"
        style={{
          background: '#131316',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 28px 24px',
        }}
      >
        {/* Row 1: Text inputs */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-[0.3]">
            <label className="tfg-tc-label">Kicker</label>
            <input
              type="text"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              placeholder="TECH FUTURES GROUP"
              className="tfg-tc-input tfg-tc-input-kicker w-full"
            />
          </div>
          <div className="flex-1">
            <label className="tfg-tc-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your Title Here"
              className="tfg-tc-input tfg-tc-input-extended w-full"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="tfg-tc-label">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Supporting text goes here"
            className="tfg-tc-input tfg-tc-input-subtitle w-full"
          />
        </div>

        {/* Row 2: Scheme, Layout, Speed, Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">

          {/* Color scheme */}
          <div>
            <label className="tfg-tc-label">Color</label>
            <div className="flex gap-1.5">
              {SCHEMES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScheme(s.id)}
                  title={s.label}
                  className={`tfg-tc-swatch ${scheme === s.id ? 'tfg-tc-swatch-active' : ''}`}
                  style={{
                    background: s.bg,
                    border: scheme === s.id ? `2px solid ${s.accent}` : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: scheme === s.id ? `0 0 0 2px #131316, 0 0 0 4px ${s.accent}` : '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="tfg-tc-label">Layout</label>
            <div className="flex gap-1">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l.id)}
                  className={`tfg-tc-option ${layout === l.id ? 'tfg-tc-option-active' : ''}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title font */}
          <div>
            <label className="tfg-tc-label">Font</label>
            <div className="flex gap-1">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTitleFont(f.id)}
                  className={`tfg-tc-option ${titleFont === f.id ? 'tfg-tc-option-active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className="tfg-tc-label">Speed</label>
            <div className="flex gap-1">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`tfg-tc-option tfg-tc-option-mono ${speed === s ? 'tfg-tc-option-active' : ''}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Grain toggle */}
          <div>
            <label className="tfg-tc-label">Grain</label>
            <button
              onClick={() => setShowGrain((g) => !g)}
              className={`tfg-tc-option ${showGrain ? 'tfg-tc-option-active' : ''}`}
              style={{ fontWeight: 600, padding: '5px 12px' }}
            >
              {showGrain ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Logo toggle */}
          <div>
            <label className="tfg-tc-label">Logo</label>
            <button
              onClick={() => setShowLogo((l) => !l)}
              className={`tfg-tc-option ${showLogo ? 'tfg-tc-option-active' : ''}`}
              style={{ fontWeight: 600, padding: '5px 12px' }}
            >
              {showLogo ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={play} className="tfg-tc-btn tfg-tc-btn-play cursor-pointer">
              ▶ Play
            </button>

            <button
              onClick={exit}
              className="tfg-tc-btn cursor-pointer"
              style={{ opacity: phase === 'visible' || phase === 'entering' ? 1 : 0.4 }}
            >
              Exit ◀
            </button>

            <button onClick={loop} className="tfg-tc-btn cursor-pointer">
              ↻ Loop
            </button>

            <button onClick={reset} className="tfg-tc-btn cursor-pointer" style={{ fontWeight: 600 }}>
              Reset
            </button>

            <button
              onClick={() => setFullscreen(true)}
              title="Fullscreen (F)"
              className="tfg-tc-btn cursor-pointer"
              style={{ fontWeight: 600 }}
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
            color: '#6e7681',
            letterSpacing: '0.04em',
          }}
        >
          SPACE = play/exit &nbsp;·&nbsp; F = fullscreen &nbsp;·&nbsp; ESC = exit fullscreen
        </div>
      </div>
    </div>
  );
}
