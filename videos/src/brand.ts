import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// NorCal SBDC brand palette (from src/lib/prompts/chat.ts brand knowledge)
export const COLORS = {
  navy: '#0f1c2e',
  royal: '#1D5AA7',
  pool: '#8FC5D9',
  cream: '#f0efeb',
  brick: '#a82039',
};

export const FONTS = {
  display: 'GT America Expanded', // hero headlines (stand-in for GT Era)
  sans: 'GT America',
  mono: 'GT America Mono',
  serif: 'Tobias',
};

// Pick a readable text color for chips/buttons on top of an accent color
export const contrastOn = (hex: string): string => {
  const m = hex.replace('#', '');
  if (m.length !== 6) return COLORS.navy;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 140 ? COLORS.cream : COLORS.navy;
};

loadFont({family: FONTS.display, url: staticFile('fonts/GT-America-Expanded-Black.otf'), weight: '900'});
loadFont({family: FONTS.sans, url: staticFile('fonts/GT-America-Standard-Regular.otf'), weight: '400'});
loadFont({family: FONTS.sans, url: staticFile('fonts/GT-America-Standard-Medium.otf'), weight: '500'});
loadFont({family: FONTS.sans, url: staticFile('fonts/GT-America-Standard-Bold.otf'), weight: '700'});
loadFont({family: FONTS.mono, url: staticFile('fonts/GT-America-Mono-Regular.otf'), weight: '400'});
loadFont({family: FONTS.serif, url: staticFile('fonts/Tobias-Medium.otf'), weight: '500'});
