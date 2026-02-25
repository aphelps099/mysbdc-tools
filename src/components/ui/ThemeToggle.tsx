'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      className="
        relative flex items-center
        w-[48px] h-[24px]
        rounded-full
        transition-all duration-300 ease-[var(--ease)]
        cursor-pointer
        focus-visible:outline-2 focus-visible:outline-[var(--royal)] focus-visible:outline-offset-2
      "
      style={{
        background: 'transparent',
        border: isDark ? '0.75px solid rgba(255,255,255,0.15)' : '0.75px solid rgba(0,0,0,0.25)',
        boxShadow: 'none',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon */}
      <span className="absolute left-[6px] top-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{ opacity: isDark ? 0.2 : 0.55 }}
      >
        <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#e5e7eb' : '#d97706'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>
      {/* Moon icon */}
      <span className="absolute right-[6px] top-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{ opacity: isDark ? 0.65 : 0.18 }}
      >
        <svg className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#93c5fd' : '#6b7280'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {/* Thumb */}
      <span
        className="
          absolute top-[3px] w-[16px] h-[16px]
          rounded-full
          transition-all duration-300 ease-[var(--ease)]
        "
        style={{
          left: isDark ? '28px' : '3px',
          background: isDark ? '#93c5fd' : '#152b4e',
          boxShadow: isDark ? '0 0 5px rgba(147,197,253,0.3)' : '0 1px 2px rgba(0,0,0,0.12)',
        }}
      />
    </button>
  );
}
