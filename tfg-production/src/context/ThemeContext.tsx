'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sbdc_theme') as Theme | null;
    if (saved === 'dark') setTheme('dark');
  }, []);

  // Sync class + persist + cleanup on unmount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
    }
    localStorage.setItem('sbdc_theme', theme);

    return () => {
      root.classList.remove('theme-dark');
    };
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
