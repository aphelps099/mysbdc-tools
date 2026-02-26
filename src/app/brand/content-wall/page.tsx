'use client';

import ContentWall from '@/components/brand/ContentWall';
import { ThemeProvider } from '@/context/ThemeContext';

export default function ContentWallPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme">
        <ContentWall />
      </div>
    </ThemeProvider>
  );
}
