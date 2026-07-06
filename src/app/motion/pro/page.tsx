'use client';

import ProMotionStudio from '@/components/motion/ProMotionStudio';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /motion/pro — Motion Studio Pro
   Program-brandable copy of Motion Studio: custom colors
   and logo per SBDC program, plus AI script-to-scenes
   storyboarding. Same engine and MP4 export as /motion.
   ═══════════════════════════════════════════════════════ */

export default function MotionProPage() {
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
              Motion Studio <span style={{ color: 'var(--royal, #1D5AA7)' }}>Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/motion"
              className="text-[9px] font-bold tracking-[0.08em] uppercase no-underline"
              style={{ fontFamily: "'proxima-nova', sans-serif", color: 'var(--p-muted, #8a8a8a)' }}
            >
              Standard Studio →
            </a>
            <span
              className="text-[9px] font-medium tracking-[0.08em] uppercase"
              style={{ fontFamily: "'proxima-nova', sans-serif", color: 'var(--p-muted, #8a8a8a)' }}
            >
              program branding · script to scenes
            </span>
          </div>
        </header>

        {/* Studio */}
        <main className="flex-1 min-h-0">
          <ProMotionStudio />
        </main>
      </div>
    </ThemeProvider>
  );
}
