'use client';

import TFGTitleCard from '@/components/titles/TFGTitleCard';

/* ═══════════════════════════════════════════════════════
   /titles/tfg — TFG-branded animated title card generator
   Dark theme with electric green accent.
   Screen-record the stage for clean title sequences.
   ═══════════════════════════════════════════════════════ */

export default function TFGTitlesPage() {
  return (
    <div className="h-dvh flex flex-col" style={{ background: '#0d0d0d' }}>

      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between"
        style={{
          height: 48,
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#131316',
        }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-[10px] font-bold tracking-[0.1em] uppercase no-underline transition-colors duration-150"
            style={{ fontFamily: 'var(--sans)', color: '#6e7681' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e2e6eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6e7681'; }}
          >
            ← Back
          </a>
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span
            className="text-[11px] font-bold tracking-[0.08em] uppercase"
            style={{ fontFamily: 'var(--sans)', color: '#e2e6eb' }}
          >
            TFG Title Cards
          </span>
        </div>
        <span
          className="text-[9px] font-medium tracking-[0.08em] uppercase"
          style={{ fontFamily: 'var(--mono)', color: '#4eff00' }}
        >
          tech futures group
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0">
        <TFGTitleCard />
      </main>
    </div>
  );
}
