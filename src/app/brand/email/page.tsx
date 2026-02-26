'use client';

import EmailTemplates from '@/components/brand/EmailTemplates';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /brand/email — Email Templates & Newsletters
   Sub-page of Brand House for email and newsletter previews.
   ═══════════════════════════════════════════════════════ */

export default function EmailPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme" style={{ background: 'var(--p-sand, #f3efe8)' }}>
        <EmailTemplates />
      </div>
    </ThemeProvider>
  );
}
