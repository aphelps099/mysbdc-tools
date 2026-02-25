'use client';

import Image from 'next/image';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-[var(--header-height)] bg-[var(--navy)] flex items-center justify-between px-4">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-[var(--radius-sm)] text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-[var(--duration-fast)] cursor-pointer"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <Image
        src="/sbdc-white-2026.png"
        alt="NorCal SBDC"
        width={80}
        height={32}
        className="object-contain"
      />

      <span
        className="text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase text-white/40"
      >
        tools
      </span>
    </header>
  );
}
