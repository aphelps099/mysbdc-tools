'use client';

import TFGMotionStudio from '@/components/motion/TFGMotionStudio';

/* ═══════════════════════════════════════════════════════
   /motion/tfg — TFG Motion
   Motion Studio with the Tech Futures Group brand baked
   in: brand-house schemes, GT America Extended + Tobias,
   TFG marks on end cards, and TFG-voiced script-to-scenes.
   Same engine and MP4 export as /motion and /motion/pro.
   ═══════════════════════════════════════════════════════ */

export default function TFGMotionPage() {
  return (
    <div className="h-dvh flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between"
        style={{
          height: 48,
          padding: '0 24px',
          borderBottom: '1px solid rgba(78,255,0,0.12)',
          background: '#141414',
        }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-[10px] font-bold tracking-[0.1em] uppercase no-underline transition-colors duration-150"
            style={{ fontFamily: "'GT America Extended', sans-serif", color: '#6e7671' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f2f2ef'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6e7671'; }}
          >
            ← Back
          </a>
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="tfg-ring" aria-hidden />
          <span
            className="text-[11px] font-bold tracking-[0.08em] uppercase"
            style={{ fontFamily: "'GT America Extended', sans-serif", color: '#f2f2ef' }}
          >
            TFG <span style={{ color: '#4EFF00' }}>Motion</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/motion/pro"
            className="text-[9px] font-bold tracking-[0.08em] uppercase no-underline"
            style={{ fontFamily: "'GT America Extended', sans-serif", color: '#6e7671' }}
          >
            Motion Studio Pro →
          </a>
          <span
            className="text-[9px] font-medium tracking-[0.08em] uppercase"
            style={{ fontFamily: "'GT America Extended', sans-serif", color: '#4EFF00' }}
          >
            tech futures group
          </span>
        </div>
      </header>

      {/* Studio */}
      <main className="flex-1 min-h-0">
        <TFGMotionStudio />
      </main>
    </div>
  );
}
