'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import RoadmapWizard from '@/components/roadmap/RoadmapWizard';

/* ═══════════════════════════════════════════════════════
   /roadmap-apply — Roadmap for Innovation Application
   California SBDC small manufacturer coaching & training.
   Public-facing, no auth required.
   ═══════════════════════════════════════════════════════ */

export default function RoadmapApplyPage() {
  return (
    <ThemeProvider>
      <RoadmapApplyInner />
    </ThemeProvider>
  );
}

function RoadmapApplyInner() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#f7f5f0',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e2ded6',
          background: '#2e4368',
        }}
      >
        <div className="rm-header-logos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.roadmap4innovation.com/hs-fs/hubfs/R4I-Logo-Solid-White.png?width=550&height=122&name=R4I-Logo-Solid-White.png"
            alt="Roadmap 4 Innovation"
            className="rm-header-logo-r4i"
          />
          <div className="rm-header-divider" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <span className="rm-header-label" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Application
          </span>
        </div>
      </header>

      {/* Wizard */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 24px 64px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 560 }}>
          <RoadmapWizard />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontFamily: 'var(--era-text, system-ui)',
          fontSize: 11,
          color: '#a8a29e',
          borderTop: '1px solid #e2ded6',
          letterSpacing: '0.02em',
          lineHeight: 1.6,
        }}
      >
        California SBDC — Roadmap 4 Innovation.
        Funded in part through a cooperative agreement with the U.S. Small Business Administration
        and the Governor&apos;s Office of Business and Economic Development.
      </footer>
    </div>
  );
}
