'use client';

import ZebsMotionStudio from '@/components/motion/ZebsMotionStudio';

/* ═══════════════════════════════════════════════════════
   /motion/zebs — ZFIT Motion
   The fitness training video editor for Zeb's Platinum
   Fitness: upload Zeb's exercise clips, wrap them in the
   ZFIT series package (brand sting, series title,
   disclaimer, circuit index, module title, end card),
   lay text overlays with gradient fades over the footage,
   drop a music bed with fade-in, and export MP4 with the
   full soundtrack. Same engine as /motion and /motion/tfg.
   ═══════════════════════════════════════════════════════ */

export default function ZebsMotionPage() {
  return (
    <div className="h-dvh flex flex-col" style={{ background: '#000000' }}>

      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between"
        style={{
          height: 48,
          padding: '0 24px',
          borderBottom: '1px solid rgba(253,234,1,0.14)',
          background: '#0d0d0d',
        }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-[10px] font-bold tracking-[0.1em] uppercase no-underline transition-colors duration-150"
            style={{ fontFamily: "'Futura', sans-serif", color: '#777770' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#777770'; }}
          >
            ← Back
          </a>
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="zebs-bolt" aria-hidden />
          <span
            className="text-[12px] font-black tracking-[0.22em] uppercase"
            style={{ fontFamily: "'Futura', sans-serif", color: '#fafafa' }}
          >
            ZFIT <span style={{ color: '#fdea01' }}>Motion</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="text-[9px] font-bold tracking-[0.12em] uppercase"
            style={{ fontFamily: "'Futura', sans-serif", color: '#fdea01' }}
          >
            Zeb&apos;s Platinum Fitness · The 10-Minute Series
          </span>
        </div>
      </header>

      {/* Studio fills the rest */}
      <div className="flex-1 min-h-0">
        <ZebsMotionStudio />
      </div>
    </div>
  );
}
