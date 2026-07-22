/* ═══════════════════════════════════════════════════════
   SBDC brand layer for the Motion Composer MCP.
   Mirrors mcp/motion-studio/src/tfg.ts. Scheme values come
   from the "FAV NorCal SBDC Design System" token set
   (docs/new interface - sbdc - motion - pro) — the five
   canonical schemes plus reference tokens. Schemes apply
   per scene as custom colors so the shared engine's preset
   schemes stay untouched.
   ═══════════════════════════════════════════════════════ */

import {
  MotionDoc, Scene, TemplateId, CustomScheme, makeScene, defaultDoc,
} from '../../../src/lib/motion/types';

/** Full token set, for reference and future use (berry is accent-only —
    never a background; use it as a short rule, not a fill). */
export const SBDC_TOKENS = {
  navy: '#0f1c2d', navySoft: '#253247', cobalt: '#1b5faf', cobaltDark: '#144b8c',
  pool: '#8fc5d9', poolPale: '#dcecf2', paper: '#fdfdfd', cream: '#f5f1e8',
  slate: '#2c3240', slateLight: '#687080', berry: '#c23c3c', evergreen: '#00675c',
  skyTint: '#b9e5f5',
} as const;

/** The five canonical scene schemes (bg / text / kicker-accent). */
export const SBDC_SCHEMES: Record<string, CustomScheme & { label: string }> = {
  navy:   { label: 'Navy',      bg: SBDC_TOKENS.navy,     fg: SBDC_TOKENS.paper, accent: SBDC_TOKENS.pool },
  paper:  { label: 'Paper',     bg: SBDC_TOKENS.paper,    fg: SBDC_TOKENS.navy,  accent: SBDC_TOKENS.cobalt },
  cream:  { label: 'Cream',     bg: SBDC_TOKENS.cream,    fg: SBDC_TOKENS.navy,  accent: SBDC_TOKENS.cobalt },
  cobalt: { label: 'Cobalt',    bg: SBDC_TOKENS.cobalt,   fg: SBDC_TOKENS.paper, accent: SBDC_TOKENS.poolPale },
  pool:   { label: 'Pool Pale', bg: SBDC_TOKENS.poolPale, fg: SBDC_TOKENS.navy,  accent: SBDC_TOKENS.cobalt },
};

export type SbdcSchemeId = keyof typeof SBDC_SCHEMES;

export const SBDC_NAVY: CustomScheme = {
  bg: SBDC_TOKENS.navy, fg: SBDC_TOKENS.paper, accent: SBDC_TOKENS.pool,
};

/** SBDC default copy per template — plain, direct, second person,
    sentence case (caps only in kickers), no exclamation marks. */
const SBDC_SCENE_DEFAULTS: Partial<Record<TemplateId, Partial<Scene>>> = {
  title: {
    kicker: 'FREE WEBINAR',
    title: 'Turn your idea into a business',
    subtitle: 'A free hands-on webinar from NorCal SBDC',
  },
  statement: {
    title: 'Free expert advising. Real results.',
    serifTitle: true,
  },
  stat: {
    statPrefix: '$',
    statValue: 474,
    statSuffix: 'M',
    attribution: 'in capital accessed by NorCal small businesses',
  },
  list: {
    kicker: 'WHAT YOU WILL LEARN',
    body: 'Practical tools you can use the same day\nMarketing that actually converts\nFunding options and how to qualify',
  },
  quote: {
    title: 'The SBDC helped us go from an idea to a thriving storefront.',
    attribution: 'Maria G. — Small Business Owner',
    serifTitle: true,
  },
  image: {
    kicker: 'STOCKTON · JUL 7',
    title: 'Marketing bootcamp',
    subtitle: 'Register free at norcalsbdc.org',
  },
  disclaimer: {
    kicker: 'ABOUT THE SBDC',
    body: 'Funded in part through a cooperative agreement with the U.S. Small Business Administration. All services are provided at no cost.',
  },
  endcard: {
    title: 'norcalsbdc.org',
    subtitle: 'Funded in part through a cooperative agreement with the U.S. SBA',
    kicker: 'REGISTER TODAY',
    logoText: 'NORCAL SBDC',
    logoMark: 'star',
  },
};

/** Fields a caller may set on a scene (everything except id). */
export type SceneInput = Partial<Omit<Scene, 'id' | 'customScheme'>> & {
  template: TemplateId;
  /** SBDC scheme name — shorthand for customScheme. */
  sbdcScheme?: SbdcSchemeId;
  customScheme?: CustomScheme | null;
};

/** Build a full Scene from a sparse input, SBDC-branded by default. */
export function sbdcScene(input: SceneInput): Scene {
  const { template, sbdcScheme, ...rest } = input;
  const overrides: Partial<Scene> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) (overrides as Record<string, unknown>)[k] = v;
  }
  if (sbdcScheme) {
    const s = SBDC_SCHEMES[sbdcScheme];
    overrides.customScheme = { bg: s.bg, fg: s.fg, accent: s.accent };
  }
  return makeScene(template, {
    customScheme: { ...SBDC_NAVY },
    ...(SBDC_SCENE_DEFAULTS[template] ?? {}),
    ...overrides,
  });
}

/** Apply a sparse patch to an existing scene (keeps its id). */
export function patchScene(scene: Scene, patch: Partial<SceneInput>): Scene {
  const { sbdcScheme, ...rest } = patch;
  const next: Scene = { ...scene };
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) (next as unknown as Record<string, unknown>)[k] = v;
  }
  if (sbdcScheme) {
    const s = SBDC_SCHEMES[sbdcScheme];
    next.customScheme = { bg: s.bg, fg: s.fg, accent: s.accent };
  }
  return next;
}

/** SBDC-branded starting document (proxima-sera + proxima-nova). */
export function sbdcDefaultDoc(): MotionDoc {
  return {
    ...defaultDoc(),
    scenes: [],
    fontHeading: 'proxima-sera',
    fontBody: 'proxima-nova',
  };
}
