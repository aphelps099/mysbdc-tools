'use client';

import Image from 'next/image';
import { ThemeProvider } from '@/context/ThemeContext';
import Smart641Wizard from '@/components/intake/Smart641Wizard';
import { LanguageProvider, useLanguage } from '@/components/intake/i18n';
import LanguageSwitcher from '@/components/intake/LanguageSwitcher';

/* ═══════════════════════════════════════════════════════
   /intake — Smart 641 Intake Page
   Public-facing, no auth required.
   ═══════════════════════════════════════════════════════ */

export default function IntakePage() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <IntakePageInner />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function IntakePageInner() {
  const { t } = useLanguage();

  return (
    <div
      className="preview-theme"
      style={{
        minHeight: '100dvh',
        background: 'var(--p-sand, #f3efe8)',
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
          borderBottom: '1px solid var(--p-line, #e7e2da)',
          background: 'var(--p-cream, #faf8f4)',
          position: 'relative',
        }}
      >
        <Image
          src="/sbdc-blue-2026.png"
          alt="NorCal SBDC"
          width={160}
          height={40}
          style={{ height: 36, width: 'auto' }}
          priority
        />
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
          <LanguageSwitcher />
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
          <Smart641Wizard />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontFamily: 'var(--era-text)',
          fontSize: 11,
          color: 'var(--p-muted, #a8a29e)',
          borderTop: '1px solid var(--p-line, #e7e2da)',
          letterSpacing: '0.02em',
        }}
      >
        {t('footer.text')}
      </footer>
    </div>
  );
}
