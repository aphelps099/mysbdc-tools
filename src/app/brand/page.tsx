'use client';

import BrandHouse from '@/components/brand/BrandHouse';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /brand — NorCal SBDC Brand House
   Visual identity reference — colors, type, logo, voice.
   ═══════════════════════════════════════════════════════ */

export default function BrandPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme" style={{ background: 'var(--p-sand, #f3efe8)' }}>
        <BrandHouse />
      </div>
    </ThemeProvider>
  );
}
