'use client';

import LenderResources from '@/components/brand/LenderResources';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /brand/lender-resources — Lender & Partner Resources
   Sub-page of Brand House for lending partnership tools.
   ═══════════════════════════════════════════════════════ */

export default function LenderResourcesPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme" style={{ background: 'var(--p-sand, #f3efe8)' }}>
        <LenderResources />
      </div>
    </ThemeProvider>
  );
}
