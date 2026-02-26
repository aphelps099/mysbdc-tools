'use client';

import EventNewsletterGenerator from '@/components/brand/EventNewsletterGenerator';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /brand/email/events-generator — Event Newsletter Generator
   Build Constant Contact–ready HTML event newsletters
   with live preview, AI copy assistance, and one-click export.
   ═══════════════════════════════════════════════════════ */

export default function EventsGeneratorPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme" style={{ background: 'var(--p-sand, #f3efe8)' }}>
        <EventNewsletterGenerator />
      </div>
    </ThemeProvider>
  );
}
