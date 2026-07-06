'use client';

import MotionStudio from '@/components/motion/MotionStudio';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /motion — Motion Studio
   Multi-scene animation suite for promo videos:
   text-based motion graphics, image scenes with overlays,
   Typekit fonts, and direct MP4 export.
   ═══════════════════════════════════════════════════════ */

export default function MotionPage() {
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
              style={{ fontFamily: "'proxima-nova', sans-serif", color: 'var(--p-muted, #8a8a8a)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink, #0f1c2e)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted, #8a8a8a)'; }}
            >
              ← Back
            </a>
            <div className="w-px h-4" style={{ background: 'var(--p-line, rgba(0,0,0,0.1))' }} />
            <span
              className="text-[11px] font-bold tracking-[0.08em] uppercase"
              style={{ fontFamily: "'proxima-nova', sans-serif", color: 'var(--p-ink, #0f1c2e)' }}
            >
              Motion Studio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/titles"
              className="text-[9px] font-bold tracking-[0.08em] uppercase no-underline"
              style={{ fontFamily: "'proxima-nova', sans-serif", color: 'var(--p-muted, #8a8a8a)' }}
            >
              Title Cards →
            </a>
            <span
              className="text-[9px] font-medium tracking-[0.08em] uppercase"
              style={{ fontFamily: "'proxima-nova', sans-serif", color: 'var(--p-muted, #8a8a8a)' }}
            >
              animation suite · mp4 export
            </span>
          </div>
        </header>

        {/* Studio */}
        <main className="flex-1 min-h-0">
          <MotionStudio />
        </main>
      </div>
    </ThemeProvider>
  );
}
