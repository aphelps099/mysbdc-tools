import {continueRender, delayRender, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// NorCal SBDC brand palette (from src/lib/prompts/chat.ts brand knowledge)
export const COLORS = {
  navy: '#0f1c2e',
  royal: '#1D5AA7',
  pool: '#8FC5D9',
  cream: '#f0efeb',
  brick: '#a82039',
};

// ── Typekit (Adobe Fonts) ──────────────────────────────────────────────
// Kit pkl5rjs carries proxima-nova + proxima-sera. Kits are domain-
// restricted, so when the kit refuses to serve (sandboxed render, domain
// not on the kit's allowlist) we continue with the local GT fallbacks
// registered below rather than failing the render.
const TYPEKIT_KIT_ID = 'pkl5rjs';

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading Adobe Fonts (Typekit)');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://use.typekit.net/${TYPEKIT_KIT_ID}.css`;
  link.onload = () => {
    document.fonts.ready.then(() => continueRender(handle)).catch(() => continueRender(handle));
  };
  link.onerror = () => continueRender(handle);
  document.head.appendChild(link);
}

// Font stacks: Proxima via Typekit first, locally-bundled GT files as the
// offline/off-domain fallback. Proxima has no mono cut — GT America Mono
// always loads from local files, so it is safe everywhere.
export const FONTS = {
  display: `"proxima-nova", "GT America Expanded", "Helvetica Neue", Arial, sans-serif`,
  sans: `"proxima-nova", "GT America", "Helvetica Neue", Arial, sans-serif`,
  serif: `"proxima-sera", "Tobias", Georgia, serif`,
  mono: `"GT America Mono", "SFMono-Regular", "Courier New", monospace`,
};

loadFont({family: 'GT America Expanded', url: staticFile('fonts/GT-America-Expanded-Black.otf'), weight: '900'});
loadFont({family: 'GT America', url: staticFile('fonts/GT-America-Standard-Regular.otf'), weight: '400'});
loadFont({family: 'GT America', url: staticFile('fonts/GT-America-Standard-Medium.otf'), weight: '500'});
loadFont({family: 'GT America', url: staticFile('fonts/GT-America-Standard-Bold.otf'), weight: '700'});
loadFont({family: 'GT America Mono', url: staticFile('fonts/GT-America-Mono-Regular.otf'), weight: '400'});
loadFont({family: 'Tobias', url: staticFile('fonts/Tobias-Medium.otf'), weight: '500'});

// ── Themes ─────────────────────────────────────────────────────────────
// Logos: the legacy NorCal SBDC marks, fetched by copy-assets.sh
// (white for the navy theme, full-color for the cream theme).
export type Theme = 'navy' | 'cream';

export const THEMES = {
  navy: {
    bg: COLORS.navy,
    text: COLORS.cream,
    logo: staticFile('logos/americas-sbdc-norcal-white-180h.png'),
    decor: [COLORS.pool, COLORS.brick],
  },
  cream: {
    bg: COLORS.cream,
    text: COLORS.navy,
    logo: staticFile('logos/americas-sbdc-norcal-400w.png'),
    decor: [COLORS.royal, COLORS.brick],
  },
} as const;

// ── Motion presets ("animation controls" in the teaser builder) ───────
export type Motion = 'classic' | 'energetic' | 'bold';

export const MOTION: Record<Motion, {spring: {damping: number; stiffness?: number}; stagger: number; rise: number; drift: number}> = {
  classic: {spring: {damping: 200}, stagger: 9, rise: 40, drift: 0.03},
  energetic: {spring: {damping: 12, stiffness: 130}, stagger: 6, rise: 70, drift: 0.05},
  bold: {spring: {damping: 15, stiffness: 280}, stagger: 4, rise: 110, drift: 0.07},
};

// ── Color helpers ──────────────────────────────────────────────────────
export const yiqOf = (hex: string): number => {
  const m = hex.replace('#', '');
  if (m.length !== 6) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000;
};

// Readable text color for chips/buttons on top of an accent color
export const contrastOn = (hex: string): string => (yiqOf(hex) < 140 ? COLORS.cream : COLORS.navy);

// Accent used AS text/bars: light accents (pool) vanish on the cream
// theme, so swap to royal there
export const textAccent = (accent: string, theme: Theme): string =>
  theme === 'cream' && yiqOf(accent) > 150 ? COLORS.royal : accent;
