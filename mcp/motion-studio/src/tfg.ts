/* ═══════════════════════════════════════════════════════
   TFG brand layer for the MCP server.
   Mirrors the presets baked into
   src/components/motion/TFGMotionStudio.tsx — the TFG
   schemes are applied per scene as custom colors so the
   shared engine's preset schemes stay untouched.
   ═══════════════════════════════════════════════════════ */

import {
  MotionDoc, Scene, TemplateId, CustomScheme, makeScene, defaultDoc,
} from '../../../src/lib/motion/types';

export const TFG_SCHEMES: Record<string, CustomScheme & { label: string }> = {
  dark:     { label: 'Dark',     bg: '#0a0a0a', fg: '#ffffff', accent: '#4EFF00' },
  charcoal: { label: 'Charcoal', bg: '#272727', fg: '#ffffff', accent: '#4EFF00' },
  green:    { label: 'Green',    bg: '#4EFF00', fg: '#0a0a0a', accent: '#0a0a0a' },
  cream:    { label: 'Cream',    bg: '#F7F6F2', fg: '#0a0a0a', accent: '#48524B' },
  white:    { label: 'White',    bg: '#ffffff', fg: '#0a0a0a', accent: '#48524B' },
};

export type TfgSchemeId = keyof typeof TFG_SCHEMES;

export const TFG_DARK: CustomScheme = { bg: '#0a0a0a', fg: '#ffffff', accent: '#4EFF00' };

/** TFG default copy per template (real numbers from the brand house). */
const TFG_SCENE_DEFAULTS: Partial<Record<TemplateId, Partial<Scene>>> = {
  title: {
    kicker: 'TFG OFFICE HOURS',
    title: 'Scale Your Tech Startup',
    subtitle: 'No-cost advising from Tech Futures Group',
  },
  statement: {
    title: 'Specialist advising. Founder speed.',
  },
  stat: {
    statValue: 70,
    statSuffix: 'M+',
    attribution: 'in SBIR/STTR and grant funding secured by TFG clients',
  },
  list: {
    kicker: 'WHAT TFG DELIVERS',
    body: 'Fundraising strategy that closes\nSBIR/STTR grant support\nGo-to-market with real traction',
  },
  quote: {
    title: 'TFG helped us sharpen the pitch and close our seed round.',
    attribution: 'Startup Founder — TFG Client',
  },
  image: {
    kicker: 'PITCH NIGHT · 6PM',
    title: 'Demo Day',
    subtitle: 'Apply at techfuturesgroup.org',
  },
  endcard: {
    title: 'techfuturesgroup.org',
    subtitle: 'A specialty program of the NorCal SBDC network',
    kicker: 'BOOK A SESSION',
  },
};

/** Fields a caller may set on a scene (everything except id). */
export type SceneInput = Partial<Omit<Scene, 'id' | 'customScheme'>> & {
  template: TemplateId;
  /** TFG scheme name — shorthand for customScheme. */
  tfgScheme?: TfgSchemeId;
  customScheme?: CustomScheme | null;
};

/** Build a full Scene from a sparse input, TFG-branded by default. */
export function tfgScene(input: SceneInput): Scene {
  const { template, tfgScheme, ...rest } = input;
  const overrides: Partial<Scene> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) (overrides as Record<string, unknown>)[k] = v;
  }
  if (tfgScheme) {
    const s = TFG_SCHEMES[tfgScheme];
    overrides.customScheme = { bg: s.bg, fg: s.fg, accent: s.accent };
  }
  return makeScene(template, {
    customScheme: { ...TFG_DARK },
    ...(TFG_SCENE_DEFAULTS[template] ?? {}),
    ...overrides,
  });
}

/** Apply a sparse patch to an existing scene (keeps its id). */
export function patchScene(scene: Scene, patch: Partial<SceneInput>): Scene {
  const { tfgScheme, ...rest } = patch;
  const next: Scene = { ...scene };
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) (next as unknown as Record<string, unknown>)[k] = v;
  }
  if (tfgScheme) {
    const s = TFG_SCHEMES[tfgScheme];
    next.customScheme = { bg: s.bg, fg: s.fg, accent: s.accent };
  }
  return next;
}

/** TFG-branded starting document (Tobias + GT America Extended). */
export function tfgDefaultDoc(): MotionDoc {
  return {
    ...defaultDoc(),
    scenes: [],
    fontHeading: 'Tobias',
    fontBody: 'GT America Extended',
  };
}
