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
        <div className="tfg-header-entrance" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg className="tfg-logo-pop" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#4eff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <div>
            <div style={{
              fontFamily: 'var(--extended, system-ui)',
              fontSize: 20,
              fontWeight: 500,
              color: '#e2e6eb',
              letterSpacing: '-0.01em',
            }}>
              Tech Futures Group
            </div>
            <div style={{
              fontFamily: 'var(--mono, monospace)',
              fontSize: 10,
              fontWeight: 500,
              color: '#4eff00',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}>
              Application 2026
            </div>
          </div>
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
