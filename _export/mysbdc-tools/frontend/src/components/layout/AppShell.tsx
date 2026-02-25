'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-dvh flex overflow-hidden">
      {/* ─── Desktop Sidebar ─── */}
      <div className="hidden md:block w-[var(--sidebar-width)] shrink-0">
        <Sidebar />
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[var(--sidebar-width)] max-w-[85vw] h-full overflow-y-auto shadow-xl fade-in">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        {/* Content area with mobile header offset */}
        <main className="flex-1 overflow-hidden md:mt-0 mt-[var(--header-height)]">
          {children}
        </main>
      </div>
    </div>
  );
}
