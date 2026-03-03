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
          padding: '20px 24px',
          borderBottom: '1px solid #e2ded6',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{
            fontFamily: 'var(--display, system-ui)',
            fontSize: 17,
            fontWeight: 300,
            color: '#1a1a1a',
            letterSpacing: '-0.01em',
          }}>
            Roadmap
            <span style={{ color: '#0e7c6b', fontWeight: 500 }}> 4 </span>
            Innovation
          </span>
          <span style={{
            margin: '0 12px',
            color: '#e2ded6',
            fontSize: 18,
            fontWeight: 300,
          }}>
            |
          </span>
          <span style={{
            fontFamily: 'var(--era-text, system-ui)',
            fontSize: 11,
            fontWeight: 600,
            color: '#0e7c6b',
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
          }}>
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
