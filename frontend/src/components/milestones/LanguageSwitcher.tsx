'use client';

import { useState, useRef, useEffect } from 'react';
import { LOCALES, useLanguage } from './i18n';

/* ═══════════════════════════════════════════════════════
   Language Switcher — Minimalist flag dropdown
   ═══════════════════════════════════════════════════════ */

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="lang-switcher">
      <button
        className="lang-switcher-btn"
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        type="button"
      >
        <span className="lang-flag">{current.flag}</span>
        <svg
          className={`lang-chevron ${open ? 'lang-chevron-open' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              className={`lang-option ${l.code === locale ? 'lang-option-active' : ''}`}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              type="button"
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-option-label">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
