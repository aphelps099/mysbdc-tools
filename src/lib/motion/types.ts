/* ═══════════════════════════════════════════════════════
   Motion Studio — core types
   A MotionDoc is a sequence of scenes rendered
   deterministically as a pure function of time, so the
   same code drives the live preview and the MP4 export.
   ═══════════════════════════════════════════════════════ */

// ── Canvas aspect presets ──
export const ASPECTS = [
  { id: '16:9', label: 'Landscape', hint: 'YouTube · Slides', w: 1920, h: 1080 },
  { id: '1:1',  label: 'Square',    hint: 'Feed posts',       w: 1080, h: 1080 },
  { id: '9:16', label: 'Vertical',  hint: 'Reels · Stories',  w: 1080, h: 1920 },
  { id: '4:5',  label: 'Portrait',  hint: 'Instagram feed',   w: 1080, h: 1350 },
] as const;

export type AspectId = typeof ASPECTS[number]['id'];

// ── Brand color schemes (mirrors TitleCard) ──
export const SCHEMES = [
  { id: 'navy',  label: 'Navy',  bg: '#0f1c2e', fg: '#ffffff', accent: '#8FC5D9', muted: 'rgba(255,255,255,0.5)',  line: 'rgba(255,255,255,0.16)' },
  { id: 'cream', label: 'Cream', bg: '#f0efeb', fg: '#0f1c2e', accent: '#1D5AA7', muted: 'rgba(15,28,46,0.45)',    line: 'rgba(15,28,46,0.14)' },
  { id: 'royal', label: 'Royal', bg: '#1D5AA7', fg: '#ffffff', accent: '#8FC5D9', muted: 'rgba(255,255,255,0.55)', line: 'rgba(255,255,255,0.22)' },
  { id: 'dark',  label: 'Dark',  bg: '#111827', fg: '#e5e7eb', accent: '#4a8fe2', muted: 'rgba(229,231,235,0.45)', line: 'rgba(255,255,255,0.1)' },
  { id: 'white', label: 'White', bg: '#ffffff', fg: '#0a1528', accent: '#a82039', muted: 'rgba(10,21,40,0.4)',     line: 'rgba(0,0,0,0.1)' },
] as const;

export type SchemeId = typeof SCHEMES[number]['id'];
export type Scheme = typeof SCHEMES[number];

export function getScheme(id: SchemeId): Scheme {
  return SCHEMES.find((s) => s.id === id) ?? SCHEMES[0];
}

// ── Scene templates ──
export const TEMPLATES = [
  { id: 'title',     label: 'Title',     hint: 'Kicker · title · subtitle' },
  { id: 'statement', label: 'Statement', hint: 'One big line' },
  { id: 'stat',      label: 'Stat',      hint: 'Animated number + label' },
  { id: 'list',      label: 'Agenda',    hint: 'Staggered list of lines' },
  { id: 'quote',     label: 'Quote',     hint: 'Pull quote + attribution' },
  { id: 'image',     label: 'Image',     hint: 'Photo + text overlay' },
  { id: 'endcard',   label: 'End Card',  hint: 'Logo · CTA · date' },
] as const;

export type TemplateId = typeof TEMPLATES[number]['id'];

// ── Text animation presets ──
export const TEXT_ANIMS = [
  { id: 'rise',           label: 'Rise' },
  { id: 'word-stagger',   label: 'Word Stagger' },
  { id: 'letter-cascade', label: 'Letter Cascade' },
  { id: 'typewriter',     label: 'Typewriter' },
  { id: 'wipe',           label: 'Wipe' },
  { id: 'blur-in',        label: 'Blur In' },
  { id: 'scale-in',       label: 'Scale In' },
  { id: 'mask-reveal',    label: 'Mask Reveal' },
] as const;

export type TextAnimId = typeof TEXT_ANIMS[number]['id'];

// ── Scene transitions (into the scene) ──
export const TRANSITIONS = [
  { id: 'cut',   label: 'Cut' },
  { id: 'fade',  label: 'Fade' },
  { id: 'wipe',  label: 'Wipe' },
  { id: 'slide', label: 'Slide' },
] as const;

export type TransitionId = typeof TRANSITIONS[number]['id'];

// ── Image motion (Ken Burns) ──
export const KEN_BURNS = [
  { id: 'none',      label: 'Still' },
  { id: 'zoom-in',   label: 'Zoom In' },
  { id: 'zoom-out',  label: 'Zoom Out' },
  { id: 'pan-left',  label: 'Pan ←' },
  { id: 'pan-right', label: 'Pan →' },
] as const;

export type KenBurnsId = typeof KEN_BURNS[number]['id'];

// ── Image overlays for text legibility ──
export const OVERLAYS = [
  { id: 'none',            label: 'None' },
  { id: 'scrim',           label: 'Scrim' },
  { id: 'gradient-bottom', label: 'Grad ↓' },
  { id: 'gradient-left',   label: 'Grad ←' },
  { id: 'brand',           label: 'Brand' },
] as const;

export type OverlayId = typeof OVERLAYS[number]['id'];

// ── Alignment ──
export const ALIGNMENTS = [
  { id: 'center',       label: 'Center' },
  { id: 'lower-left',   label: 'Lower Left' },
  { id: 'lower-center', label: 'Lower Center' },
] as const;

export type AlignId = typeof ALIGNMENTS[number]['id'];

// ── Scene ──
export interface Scene {
  id: string;
  template: TemplateId;
  /** Total scene duration in ms (enter + hold + exit). */
  duration: number;
  scheme: SchemeId;
  anim: TextAnimId;
  /** Transition INTO this scene from the previous one. */
  transition: TransitionId;
  align: AlignId;
  /** Use the serif (heading) font for the main line of this scene. */
  serifTitle: boolean;

  // Text content (used per-template)
  kicker: string;
  title: string;
  subtitle: string;
  /** Agenda/list lines, newline separated. */
  body: string;
  /** Quote attribution / stat label. */
  attribution: string;

  // Stat template
  statPrefix: string;
  statValue: number;
  statSuffix: string;

  // Image template
  imageId: string | null;
  kenBurns: KenBurnsId;
  overlay: OverlayId;
  /** 0–1 overlay strength. */
  overlayOpacity: number;
}

// ── Document ──
export interface MotionDoc {
  aspect: AspectId;
  fps: number;
  scenes: Scene[];
  /** CSS font-family for big display text. */
  fontHeading: string;
  /** CSS font-family for kickers, labels, body. */
  fontBody: string;
  watermark: string;
  showGrain: boolean;
}

// ── Loaded image assets, keyed by imageId ──
export interface ImageAsset {
  id: string;
  name: string;
  url: string;
  img: HTMLImageElement;
}

export type AssetMap = Record<string, ImageAsset>;

let sceneCounter = 0;

export function makeScene(template: TemplateId, overrides: Partial<Scene> = {}): Scene {
  sceneCounter += 1;
  const base: Scene = {
    id: `scene-${Date.now().toString(36)}-${sceneCounter}`,
    template,
    duration: 4000,
    scheme: 'navy',
    anim: 'word-stagger',
    transition: 'fade',
    align: 'center',
    serifTitle: false,
    kicker: '',
    title: '',
    subtitle: '',
    body: '',
    attribution: '',
    statPrefix: '$',
    statValue: 0,
    statSuffix: '',
    imageId: null,
    kenBurns: 'zoom-in',
    overlay: 'gradient-bottom',
    overlayOpacity: 0.65,
  };

  const defaults: Partial<Record<TemplateId, Partial<Scene>>> = {
    title: {
      kicker: 'UPCOMING WORKSHOP',
      title: 'Grow Your Business with AI',
      subtitle: 'A free hands-on webinar from NorCal SBDC',
    },
    statement: {
      title: 'Free expert advising. Real results.',
      anim: 'mask-reveal',
      serifTitle: true,
    },
    stat: {
      statPrefix: '$',
      statValue: 474,
      statSuffix: 'M',
      attribution: 'in capital accessed by NorCal small businesses',
      anim: 'rise',
      duration: 3500,
    },
    list: {
      kicker: 'WHAT YOU WILL LEARN',
      body: 'Practical AI tools for daily work\nMarketing that actually converts\nFunding options and how to qualify',
      anim: 'rise',
      align: 'lower-left',
      duration: 5000,
    },
    quote: {
      title: 'The SBDC helped us go from an idea to a thriving storefront.',
      attribution: 'Maria G. — Small Business Owner',
      serifTitle: true,
      anim: 'blur-in',
      duration: 5000,
    },
    image: {
      kicker: 'SEPT 24 · 12PM',
      title: 'Marketing Bootcamp',
      subtitle: 'Register free at norcalsbdc.org',
      align: 'lower-left',
      anim: 'rise',
    },
    endcard: {
      title: 'norcalsbdc.org',
      subtitle: 'Funded in part through a cooperative agreement with the U.S. SBA',
      kicker: 'REGISTER TODAY',
      duration: 3500,
      anim: 'rise',
    },
  };

  return { ...base, ...(defaults[template] ?? {}), ...overrides };
}

export function defaultDoc(): MotionDoc {
  return {
    aspect: '16:9',
    fps: 30,
    scenes: [
      makeScene('title'),
      makeScene('list'),
      makeScene('endcard'),
    ],
    fontHeading: 'proxima-sera',
    fontBody: 'proxima-nova',
    watermark: '',
    showGrain: true,
  };
}

export function getAspect(id: AspectId) {
  return ASPECTS.find((a) => a.id === id) ?? ASPECTS[0];
}

export function docDuration(doc: MotionDoc): number {
  return doc.scenes.reduce((sum, s) => sum + s.duration, 0);
}

/** Locate the active scene + local time for a global time t (ms). */
export function sceneAt(doc: MotionDoc, t: number): { index: number; local: number } {
  let acc = 0;
  for (let i = 0; i < doc.scenes.length; i++) {
    const d = doc.scenes[i].duration;
    if (t < acc + d || i === doc.scenes.length - 1) {
      return { index: i, local: Math.min(t - acc, d) };
    }
    acc += d;
  }
  return { index: 0, local: 0 };
}
