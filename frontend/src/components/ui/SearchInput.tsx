'use client';

import { useRef, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  variant?: 'light' | 'dark';
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  resultCount,
  variant = 'light',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const isDark = variant === 'dark';

  return (
    <div
      className={`relative group ${focused ? 'search-focused' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="relative flex items-center h-14 cursor-text">
        {/* Search icon */}
        <div className="pl-1 pr-0 flex items-center">
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${
              isDark
                ? focused ? 'text-white' : 'text-white/40'
                : focused ? 'text-[var(--navy)]' : 'text-[var(--text-tertiary)]'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`
            flex-1 h-full pl-3.5 pr-4
            text-[17px] font-[var(--sans)] font-light
            bg-transparent focus:outline-none
            ${isDark
              ? 'text-white placeholder:text-white/30'
              : 'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]'
            }
          `}
        />

        {/* Right side: result count + clear */}
        <div className="pr-1 flex items-center gap-2.5 shrink-0">
          {value && resultCount !== undefined && (
            <span className={`text-[12px] font-[var(--mono)] tabular-nums ${
              isDark ? 'text-white/40' : 'text-[var(--text-tertiary)]'
            }`}>
              {resultCount}
            </span>
          )}
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                inputRef.current?.focus();
              }}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'text-white/40 hover:text-white hover:bg-white/10'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--cream)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Bottom line — faint at rest */}
      <div className={`absolute bottom-0 left-0 right-0 h-px ${
        isDark ? 'bg-white/10' : 'bg-[var(--rule-light)]'
      }`} />

      {/* Animated underline — sweeps left-to-right on focus */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] search-underline ${
        isDark ? 'bg-white' : 'bg-[var(--navy)]'
      }`} />
    </div>
  );
}
