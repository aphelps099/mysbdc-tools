'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import TFGWizard from '@/components/tfg/TFGWizard';

/* ═══════════════════════════════════════════════════════
   /tfg-apply — TFG Application Page
   Public-facing, no auth required.
   Dark theme with TFG green accent (#4eff00).
   ═══════════════════════════════════════════════════════ */

export default function TFGApplyPage() {
  return (
    <ThemeProvider>
      <TFGApplyInner />
    </ThemeProvider>
  );
}

function TFGApplyInner() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0d0d0d',
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
          padding: '24px 24px',
          borderBottom: '1px solid #2d333b',
          background: '#111318',
        }}
      >
        <div className="tfg-header-entrance" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{
            fontFamily: 'var(--extended, system-ui)',
            fontSize: 18,
            fontWeight: 500,
            color: '#e2e6eb',
            letterSpacing: '-0.01em',
          }}>
            Tech Futures Group
          </span>
          <span style={{
            margin: '0 12px',
            color: '#2d333b',
            fontSize: 18,
            fontWeight: 300,
          }}>
            |
          </span>
          <span style={{
            fontFamily: 'var(--mono, monospace)',
            fontSize: 10,
            fontWeight: 500,
            color: '#4eff00',
            letterSpacing: '0.12em',
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
          <TFGWizard />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontFamily: 'var(--era-text, system-ui)',
          fontSize: 11,
          color: '#8b949e',
          borderTop: '1px solid #2d333b',
          letterSpacing: '0.02em',
        }}
      >
        Tech Futures Group — A program of the NorCal SBDC.
        Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.
      </footer>
    </div>
  );
}
