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
          padding: '20px 24px',
          borderBottom: '1px solid #2d333b',
          background: '#111318',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png"
            alt=""
            height={32}
            style={{ display: 'block', height: 32, width: 'auto' }}
          />
          <div>
            <div style={{
              fontFamily: "'GT America Extended', 'GT America', system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 500,
              color: '#e2e6eb',
              letterSpacing: '-0.01em',
            }}>
              Tech Futures Group
            </div>
            <div style={{
              fontFamily: "'Roboto Mono', 'GT America Mono', monospace",
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
          fontFamily: "'Roboto Mono', 'GT America Mono', monospace",
          fontSize: 10,
          color: '#484f58',
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
