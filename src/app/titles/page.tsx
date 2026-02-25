'use client';

import TitleCard from '@/components/titles/TitleCard';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /titles — Animated title card generator
   Motion graphics-style text animation for video titles.
   Screen-record the stage for clean title sequences.
   ═══════════════════════════════════════════════════════ */

export default function TitlesPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme h-dvh flex flex-col" style={{ background: 'var(--p-sand, #f0efeb)' }}>

        {/* Header */}
        <header
          className="shrink-0 flex items-center justify-between"
          style={{
            height: 48,
            padding: '0 24px',
            borderBottom: '1px solid var(--p-line, rgba(0,0,0,0.08))',
            background: 'var(--p-cream, #e8e7e3)',
          }}
        >
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-[10px] font-bold tracking-[0.1em] uppercase no-underline transition-colors duration-150"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink, #0f1c2e)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted, #8a8a8a)'; }}
            >
              ← Back
            </a>
            <div className="w-px h-4" style={{ background: 'var(--p-line, rgba(0,0,0,0.1))' }} />
            <span
              className="text-[11px] font-bold tracking-[0.08em] uppercase"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink, #0f1c2e)' }}
            >
              Title Cards
            </span>
          </div>
          <span
            className="text-[9px] font-medium tracking-[0.08em] uppercase"
            style={{ fontFamily: 'var(--mono)', color: 'var(--p-muted, #8a8a8a)' }}
          >
            motion graphics
          </span>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0">
          <TitleCard />
        </main>
      </div>
    </ThemeProvider>
  );
}
