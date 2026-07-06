'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MotionDoc, Scene, TemplateId, AssetMap, ImageAsset, CustomScheme, TextAnimId, AlignId, TransitionId,
  ASPECTS, TEMPLATES, TEXT_ANIMS, TRANSITIONS, KEN_BURNS, OVERLAYS, ALIGNMENTS,
  defaultDoc, makeScene, getAspect, resolveScheme, docDuration, sceneAt,
} from '@/lib/motion/types';
import { renderFrame } from '@/lib/motion/render';
import {
  exportMp4, exportWebm, exportPng, downloadBlob, supportsMp4Export,
} from '@/lib/motion/export';
import {
  FontOption, builtinFonts, loadTypekitKit, registerFontFile, ensureFontsReady, DEFAULT_KIT_ID,
} from '@/lib/motion/fonts';
import { Field, TextInput, TextArea, Seg, Slider, Section } from './controls';
import './motion-studio.css';
import './motion-studio-tfg.css';

/* ═══════════════════════════════════════════════════════
   TFGMotionStudio — Motion Studio with the Tech Futures
   Group brand baked in (techfuturesgroup.org brand house:
   near-black, charcoal, electric green, GT America
   Extended + Tobias). Shares the render/export engine with
   /motion and /motion/pro; the TFG scheme presets are
   applied per scene as custom colors so the shared engine
   and NorCal preset schemes stay untouched.
   ═══════════════════════════════════════════════════════ */

const SERIF_OPTS = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
] as const;

// TFG brand-house schemes (accents kept AA-readable on light backgrounds)
const TFG_SCHEMES: { id: string; label: string; bg: string; fg: string; accent: string }[] = [
  { id: 'dark',     label: 'Dark',     bg: '#0a0a0a', fg: '#ffffff', accent: '#4EFF00' },
  { id: 'charcoal', label: 'Charcoal', bg: '#272727', fg: '#ffffff', accent: '#4EFF00' },
  { id: 'green',    label: 'Green',    bg: '#4EFF00', fg: '#0a0a0a', accent: '#0a0a0a' },
  { id: 'cream',    label: 'Cream',    bg: '#F7F6F2', fg: '#0a0a0a', accent: '#48524B' },
  { id: 'white',    label: 'White',    bg: '#ffffff', fg: '#0a0a0a', accent: '#48524B' },
];

const TFG_DARK: CustomScheme = { bg: '#0a0a0a', fg: '#ffffff', accent: '#4EFF00' };
const DEFAULT_BRAND: CustomScheme = { ...TFG_DARK };

// AI storyboards return the shared preset ids — map them onto TFG colors
const AI_SCHEME_TO_TFG: Record<string, CustomScheme> = {
  navy:  TFG_SCHEMES[0], // dark
  dark:  TFG_SCHEMES[1], // charcoal
  royal: TFG_SCHEMES[2], // green
  cream: TFG_SCHEMES[3],
  white: TFG_SCHEMES[4],
};

// TFG default copy per template (real numbers from the brand house)
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

function tfgScene(template: TemplateId, overrides: Partial<Scene> = {}): Scene {
  return makeScene(template, {
    customScheme: { ...TFG_DARK },
    ...(TFG_SCENE_DEFAULTS[template] ?? {}),
    ...overrides,
  });
}

function tfgDefaultDoc(): MotionDoc {
  return {
    ...defaultDoc(),
    scenes: [tfgScene('title'), tfgScene('list'), tfgScene('endcard')],
    fontHeading: 'Tobias',
    fontBody: 'GT America Extended',
  };
}

interface GeneratedScene {
  template: TemplateId;
  kicker?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  attribution?: string;
  statPrefix?: string;
  statValue?: number;
  statSuffix?: string;
  anim?: string;
  align?: string;
  scheme?: string;
  serifTitle?: boolean;
  durationMs?: number;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

function fmtTime(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function sameScheme(a: CustomScheme | null | undefined, b: { bg: string; fg: string; accent: string }): boolean {
  return !!a && a.bg.toLowerCase() === b.bg.toLowerCase()
    && a.fg.toLowerCase() === b.fg.toLowerCase()
    && a.accent.toLowerCase() === b.accent.toLowerCase();
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="ms-color-row">
      <span className="ms-color-label">{label}</span>
      <input
        type="color"
        className="ms-color-input"
        value={HEX_RE.test(value) ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        key={value}
        type="text"
        className="ms-input ms-color-hex"
        defaultValue={value}
        onBlur={(e) => { const v = e.target.value.trim(); if (HEX_RE.test(v)) onChange(v); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = (e.target as HTMLInputElement).value.trim();
            if (HEX_RE.test(v)) onChange(v);
          }
        }}
      />
    </div>
  );
}

export default function TFGMotionStudio() {
  // ── Document & selection ──
  const [doc, setDoc] = useState<MotionDoc>(tfgDefaultDoc);
  const [selectedId, setSelectedId] = useState<string | null>(doc.scenes[0]?.id ?? null);
  const docRef = useRef(doc);
  docRef.current = doc;

  const selected = doc.scenes.find((s) => s.id === selectedId) ?? null;
  const selectedIndex = selected ? doc.scenes.indexOf(selected) : -1;
  const totalMs = docDuration(doc);
  const aspect = getAspect(doc.aspect);

  // ── Assets ──
  const assetsRef = useRef<AssetMap>({});
  const [images, setImages] = useState<ImageAsset[]>([]);

  useEffect(() => {
    // TFG marks as the built-in end-card logos (brand uploads still win)
    let alive = true;
    (async () => {
      for (const [id, url] of [
        ['__logo-white', '/tfg-lockup-light.png'],  // full lockup, dark backgrounds
        ['__logo-blue', '/tfg-lockup-dark.png'],    // full lockup, light backgrounds
      ] as const) {
        try {
          const img = await loadImage(url);
          if (alive) assetsRef.current[id] = { id, name: url, url, img };
        } catch { /* logo missing — end card just skips it */ }
      }
    })();
    return () => { alive = false; };
  }, []);

  // ── Brand ──
  const [brandName, setBrandName] = useState('Tech Futures Group');
  const [brandColors, setBrandColors] = useState<CustomScheme>(DEFAULT_BRAND);
  const [logoLight, setLogoLight] = useState<ImageAsset | null>(null); // light mark, dark backgrounds
  const [logoDark, setLogoDark] = useState<ImageAsset | null>(null);   // dark mark, light backgrounds
  const logoLightRef = useRef<HTMLInputElement>(null);
  const logoDarkRef = useRef<HTMLInputElement>(null);

  const handleLogoFile = async (file: File, kind: 'light' | 'dark') => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const id = kind === 'light' ? '__logo-brand-light' : '__logo-brand-dark';
      const asset: ImageAsset = { id, name: file.name, url, img };
      assetsRef.current[id] = asset;
      (kind === 'light' ? setLogoLight : setLogoDark)(asset);
    } catch {
      URL.revokeObjectURL(url);
    }
  };

  const removeLogo = (kind: 'light' | 'dark') => {
    const id = kind === 'light' ? '__logo-brand-light' : '__logo-brand-dark';
    const existing = assetsRef.current[id];
    if (existing) URL.revokeObjectURL(existing.url);
    delete assetsRef.current[id];
    (kind === 'light' ? setLogoLight : setLogoDark)(null);
  };

  const applyBrandToAll = () => {
    setDoc((d) => ({ ...d, scenes: d.scenes.map((s) => ({ ...s, customScheme: { ...brandColors } })) }));
  };

  const resetToTfgDark = () => {
    setDoc((d) => ({ ...d, scenes: d.scenes.map((s) => ({ ...s, customScheme: { ...TFG_DARK } })) }));
  };

  // ── Fonts ──
  const [fontOptions, setFontOptions] = useState<FontOption[]>(builtinFonts);
  const [kitInput, setKitInput] = useState(DEFAULT_KIT_ID);
  const [kitStatus, setKitStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    ensureFontsReady([doc.fontHeading, doc.fontBody]);
  }, [doc.fontHeading, doc.fontBody]);

  // ── Playback ──
  const [playing, setPlaying] = useState(true);
  const [loopMode, setLoopMode] = useState(true);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const loopRef = useRef(loopMode);
  loopRef.current = loopMode;
  const playheadRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const playheadElRef = useRef<HTMLDivElement>(null);
  const timeElRef = useRef<HTMLSpanElement>(null);
  const [stageDims, setStageDims] = useState({ w: 640, h: 360 });

  // Fit the stage into the available space
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const pad = 8;
      const bw = el.clientWidth - pad;
      const bh = el.clientHeight - pad;
      const ratio = aspect.w / aspect.h;
      let w = bw;
      let h = w / ratio;
      if (h > bh) { h = bh; w = h * ratio; }
      setStageDims({ w: Math.max(200, w), h: Math.max(120, h) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect.w, aspect.h]);

  // Render loop — draws every frame from the deterministic renderer
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      const d = docRef.current;
      const total = docDuration(d);

      if (playingRef.current && total > 0) {
        playheadRef.current += dt;
        if (playheadRef.current >= total) {
          if (loopRef.current) playheadRef.current %= total;
          else { playheadRef.current = total - 1; setPlaying(false); }
        }
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const { w: W, h: H } = getAspect(d.aspect);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      renderFrame(ctx, d, playheadRef.current, assetsRef.current);

      // Imperative UI updates (no React re-render at 60fps)
      if (playheadElRef.current && total > 0) {
        playheadElRef.current.style.left = `${(playheadRef.current / total) * 100}%`;
      }
      if (timeElRef.current) {
        timeElRef.current.textContent = `${fmtTime(playheadRef.current)} / ${fmtTime(total)}`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Space = play/pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === ' ' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Doc/scene mutation helpers ──
  const patchDoc = useCallback((p: Partial<MotionDoc>) => {
    setDoc((d) => ({ ...d, ...p }));
  }, []);

  const patchScene = useCallback((id: string, p: Partial<Scene>) => {
    setDoc((d) => ({ ...d, scenes: d.scenes.map((s) => (s.id === id ? { ...s, ...p } : s)) }));
  }, []);

  const sceneStart = useCallback((index: number) => {
    return docRef.current.scenes.slice(0, index).reduce((a, s) => a + s.duration, 0);
  }, []);

  const seekToScene = useCallback((index: number) => {
    playheadRef.current = sceneStart(index) + 1;
  }, [sceneStart]);

  const addScene = (template: TemplateId) => {
    const scene = tfgScene(template);
    setDoc((d) => {
      const i = selectedIndex >= 0 ? selectedIndex + 1 : d.scenes.length;
      const scenes = [...d.scenes];
      scenes.splice(i, 0, scene);
      return { ...d, scenes };
    });
    setSelectedId(scene.id);
  };

  const duplicateScene = (id: string) => {
    setDoc((d) => {
      const i = d.scenes.findIndex((s) => s.id === id);
      if (i < 0) return d;
      const copy = { ...d.scenes[i], id: `${d.scenes[i].id}-copy-${Math.floor(Math.random() * 1e6)}` };
      const scenes = [...d.scenes];
      scenes.splice(i + 1, 0, copy);
      setSelectedId(copy.id);
      return { ...d, scenes };
    });
  };

  const removeScene = (id: string) => {
    setDoc((d) => {
      const i = d.scenes.findIndex((s) => s.id === id);
      const scenes = d.scenes.filter((s) => s.id !== id);
      if (selectedId === id) setSelectedId(scenes[Math.max(0, i - 1)]?.id ?? null);
      return { ...d, scenes };
    });
  };

  const moveScene = (id: string, dir: -1 | 1) => {
    setDoc((d) => {
      const i = d.scenes.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.scenes.length) return d;
      const scenes = [...d.scenes];
      [scenes[i], scenes[j]] = [scenes[j], scenes[i]];
      return { ...d, scenes };
    });
  };

  // ── Timeline scrubbing ──
  const timelineRef = useRef<HTMLDivElement>(null);

  const scrubTo = useCallback((clientX: number) => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const total = docDuration(docRef.current);
    playheadRef.current = ratio * total;
    const { index } = sceneAt(docRef.current, playheadRef.current);
    const scene = docRef.current.scenes[index];
    if (scene) setSelectedId(scene.id);
  }, []);

  const onTimelinePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    scrubTo(e.clientX);
    const move = (ev: PointerEvent) => scrubTo(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // ── Image upload ──
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const asset: ImageAsset = { id: `img-${Date.now().toString(36)}`, name: file.name, url, img };
      assetsRef.current[asset.id] = asset;
      setImages((list) => [...list, asset]);
      if (selected) patchScene(selected.id, { imageId: asset.id });
    } catch {
      URL.revokeObjectURL(url);
    }
  };

  // ── Typekit / font uploads ──
  const [loadingKit, setLoadingKit] = useState(false);
  const fontFileRef = useRef<HTMLInputElement>(null);

  const handleLoadKit = async () => {
    setLoadingKit(true);
    setKitStatus(null);
    try {
      const families = await loadTypekitKit(kitInput);
      if (families.length) {
        setFontOptions((opts) => {
          const known = new Set(opts.map((o) => o.family));
          const added = families
            .filter((f) => !known.has(f))
            .map((f) => ({ family: f, label: f, source: 'typekit' as const }));
          return [...opts, ...added];
        });
        setKitStatus({ ok: true, msg: `Kit loaded — fonts available: ${families.join(', ')}` });
      } else {
        setKitStatus({ ok: true, msg: 'Kit stylesheet loaded. Type the font family names it provides (e.g. proxima-nova) in the font fields.' });
      }
      await ensureFontsReady([doc.fontHeading, doc.fontBody]);
    } catch (e) {
      setKitStatus({ ok: false, msg: e instanceof Error ? e.message : 'Failed to load kit' });
    } finally {
      setLoadingKit(false);
    }
  };

  const handleFontFiles = async (files: FileList) => {
    const added: FontOption[] = [];
    let err: string | null = null;
    for (const file of Array.from(files)) {
      try {
        added.push(await registerFontFile(file));
      } catch {
        err = `Couldn't read ${file.name}`;
      }
    }
    if (added.length) {
      setFontOptions((opts) => {
        const known = new Set(opts.map((o) => o.family));
        return [...opts, ...added.filter((a) => !known.has(a.family))];
      });
      setKitStatus({ ok: true, msg: `Registered: ${added.map((a) => a.family).join(', ')}` });
    } else if (err) {
      setKitStatus({ ok: false, msg: err });
    }
  };

  // ── Script → scenes ──
  const [script, setScript] = useState('');
  const [scriptNotes, setScriptNotes] = useState('');
  const [scriptMode, setScriptMode] = useState<'replace' | 'append'>('replace');
  const [useBrandOnGenerated, setUseBrandOnGenerated] = useState<'on' | 'off'>('off');
  const [generating, setGenerating] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const scriptFileRef = useRef<HTMLInputElement>(null);

  const handleScriptFile = async (file: File) => {
    const text = await file.text();
    setScript(text.slice(0, 40000));
  };

  const mapGenerated = (g: GeneratedScene): Scene => {
    const overrides: Partial<Scene> = {
      kicker: g.kicker ?? '',
      title: g.title ?? '',
      subtitle: g.subtitle ?? '',
      body: g.body ?? '',
      attribution: g.attribution ?? '',
    };
    if (g.statPrefix !== undefined) overrides.statPrefix = g.statPrefix;
    if (g.statValue !== undefined) overrides.statValue = g.statValue;
    if (g.statSuffix !== undefined) overrides.statSuffix = g.statSuffix;
    if (g.anim) overrides.anim = g.anim as TextAnimId;
    if (g.align) overrides.align = g.align as AlignId;
    if (g.serifTitle !== undefined) overrides.serifTitle = g.serifTitle;
    if (g.durationMs) overrides.duration = g.durationMs;
    // Generated preset ids land on the TFG palette; brand toggle forces one look
    const mapped = (g.scheme && AI_SCHEME_TO_TFG[g.scheme]) || TFG_DARK;
    overrides.customScheme = useBrandOnGenerated === 'on'
      ? { ...brandColors }
      : { bg: mapped.bg, fg: mapped.fg, accent: mapped.accent };
    return tfgScene(g.template, overrides);
  };

  const handleGenerateScenes = async () => {
    if (!script.trim() || generating) return;
    setGenerating(true);
    setScriptStatus(null);
    try {
      const res = await fetch('/api/ai/motion-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          notes: scriptNotes || undefined,
          aspect: doc.aspect,
          brandName: brandName || 'Tech Futures Group',
          brand: 'tfg',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      const generated: GeneratedScene[] = data.scenes ?? [];
      if (!generated.length) throw new Error('No scenes came back — try a clearer script.');
      const mapped = generated.map(mapGenerated);
      setDoc((d) => ({
        ...d,
        scenes: scriptMode === 'replace' ? mapped : [...d.scenes, ...mapped],
      }));
      setSelectedId(mapped[0].id);
      playheadRef.current = scriptMode === 'replace' ? 0 : docDuration(docRef.current);
      setPlaying(true);
      setScriptStatus({ ok: true, msg: `${mapped.length} scenes ${scriptMode === 'replace' ? 'created' : 'added'} — review and tweak each one.` });
    } catch (e) {
      setScriptStatus({ ok: false, msg: e instanceof Error ? e.message : 'Generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  // ── Export ──
  const [exporting, setExporting] = useState<null | 'mp4' | 'webm' | 'png'>(null);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Resolved after mount so SSR and first client render match
  const [mp4Supported, setMp4Supported] = useState<boolean | null>(null);
  useEffect(() => { setMp4Supported(supportsMp4Export()); }, []);

  const handleExportVideo = async (kind: 'mp4' | 'webm') => {
    setPlaying(false);
    setExporting(kind);
    setProgress(0);
    setExportStatus(null);
    abortRef.current = new AbortController();
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      await ensureFontsReady([doc.fontHeading, doc.fontBody]);
      const onP = (p: { ratio: number }) => setProgress(p.ratio);
      const blob = kind === 'mp4'
        ? await exportMp4(doc, assetsRef.current, onP, abortRef.current.signal)
        : await exportWebm(doc, assetsRef.current, onP, abortRef.current.signal);
      const base = brandName ? brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'tfg-motion';
      downloadBlob(blob, `${base}-${doc.aspect.replace(':', 'x')}-${stamp}.${kind}`);
      setExportStatus({ ok: true, msg: `${kind.toUpperCase()} exported — check your downloads.` });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setExportStatus({ ok: false, msg: 'Export cancelled.' });
      } else {
        setExportStatus({ ok: false, msg: e instanceof Error ? e.message : 'Export failed' });
      }
    } finally {
      setExporting(null);
      abortRef.current = null;
    }
  };

  const handleExportPng = async () => {
    setExporting('png');
    setExportStatus(null);
    try {
      await ensureFontsReady([doc.fontHeading, doc.fontBody]);
      const blob = await exportPng(doc, assetsRef.current, playheadRef.current);
      downloadBlob(blob, `tfg-frame-${doc.aspect.replace(':', 'x')}.png`);
      setExportStatus({ ok: true, msg: 'PNG frame exported.' });
    } catch (e) {
      setExportStatus({ ok: false, msg: e instanceof Error ? e.message : 'Export failed' });
    } finally {
      setExporting(null);
    }
  };

  // ── Scene preview label ──
  const sceneLabel = (s: Scene) =>
    s.template === 'stat'
      ? `${s.statPrefix}${s.statValue.toLocaleString('en-US')}${s.statSuffix}`
      : s.template === 'list'
        ? (s.body.split('\n')[0] || 'Agenda')
        : (s.title || TEMPLATES.find((t) => t.id === s.template)?.label || '');

  const activeTfgSwatch = selected
    ? TFG_SCHEMES.find((s) => sameScheme(selected.customScheme, s))
    : undefined;

  return (
    <div className="ms-root ms-tfg">

      {/* ══ Scene strip ══ */}
      <aside className="ms-scenes">
        <p className="ms-scenes-title">Scenes · {fmtTime(totalMs)}</p>

        {doc.scenes.map((s, i) => {
          const scheme = resolveScheme(s);
          const active = s.id === selectedId;
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              className={`ms-scene-card ${active ? 'is-active' : ''}`}
              onClick={() => { setSelectedId(s.id); seekToScene(i); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedId(s.id); seekToScene(i); } }}
            >
              <div className="ms-scene-card-top">
                <span className="ms-scene-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ms-scene-kind">{TEMPLATES.find((t) => t.id === s.template)?.label}</span>
                <span className="ms-scene-dot" style={{ background: scheme.bg }} />
              </div>
              <div className="ms-scene-preview">{sceneLabel(s) || '—'}</div>
              <div className="ms-scene-meta">{(s.duration / 1000).toFixed(1)}s · {TEXT_ANIMS.find((a) => a.id === s.anim)?.label}</div>

              {active && (
                <div className="ms-scene-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="ms-icon-btn" title="Move up" disabled={i === 0} onClick={() => moveScene(s.id, -1)}>↑</button>
                  <button className="ms-icon-btn" title="Move down" disabled={i === doc.scenes.length - 1} onClick={() => moveScene(s.id, 1)}>↓</button>
                  <button className="ms-icon-btn" title="Duplicate" onClick={() => duplicateScene(s.id)}>⧉</button>
                  <button className="ms-icon-btn is-danger" title="Delete" disabled={doc.scenes.length <= 1} onClick={() => removeScene(s.id)}>✕</button>
                </div>
              )}
            </div>
          );
        })}

        <p className="ms-scenes-title" style={{ marginTop: 10 }}>Add Scene</p>
        <div className="ms-add-grid">
          {TEMPLATES.map((t) => (
            <button key={t.id} className="ms-add-btn" title={t.hint} onClick={() => addScene(t.id)}>
              + {t.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ══ Preview ══ */}
      <div className="ms-center">
        <div className="ms-stage-wrap" ref={wrapRef}>
          <div className="ms-stage" ref={stageRef} style={{ width: stageDims.w, height: stageDims.h }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Transport */}
        <div className="ms-transport">
          <button className="ms-btn is-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button
            className="ms-btn"
            onClick={() => { playheadRef.current = 0; setPlaying(true); }}
          >
            ⏮ Restart
          </button>
          <button
            className={`ms-btn ${loopMode ? 'is-toggled' : ''}`}
            onClick={() => setLoopMode((l) => !l)}
            title="Loop playback"
          >
            ↻ Loop
          </button>
          <button
            className="ms-btn"
            onClick={() => stageRef.current?.requestFullscreen?.()}
            title="Fullscreen preview"
          >
            ⛶
          </button>
          <span className="ms-time" ref={timeElRef}>0:00.0 / 0:00.0</span>
        </div>

        {/* Timeline */}
        <div className="ms-timeline" ref={timelineRef} onPointerDown={onTimelinePointerDown}>
          {doc.scenes.map((s) => (
            <div
              key={s.id}
              className={`ms-tl-scene ${s.id === selectedId ? 'is-active' : ''}`}
              style={{ width: `${(s.duration / Math.max(1, totalMs)) * 100}%` }}
            >
              <span className="ms-tl-label">{sceneLabel(s)}</span>
            </div>
          ))}
          <div className="ms-playhead" ref={playheadElRef} style={{ left: 0 }} />
        </div>
      </div>

      {/* ══ Inspector ══ */}
      <aside className="ms-inspector">

        {/* — Scene — */}
        {selected && (
          <Section
            title={`Scene ${selectedIndex + 1} — ${TEMPLATES.find((t) => t.id === selected.template)?.label}`}
            badge={TEMPLATES.find((t) => t.id === selected.template)?.hint}
          >
            {(selected.template === 'title' || selected.template === 'image' || selected.template === 'endcard' || selected.template === 'list') && (
              <Field label={selected.template === 'endcard' ? 'CTA line' : 'Kicker'}>
                <TextInput value={selected.kicker} onChange={(v) => patchScene(selected.id, { kicker: v })} placeholder="TFG OFFICE HOURS" />
              </Field>
            )}

            {selected.template !== 'list' && selected.template !== 'stat' && (
              <Field label={selected.template === 'quote' ? 'Quote' : selected.template === 'endcard' ? 'URL / main line' : 'Title'}>
                {selected.template === 'quote' || selected.template === 'statement' ? (
                  <TextArea value={selected.title} onChange={(v) => patchScene(selected.id, { title: v })} rows={2} />
                ) : (
                  <TextInput value={selected.title} onChange={(v) => patchScene(selected.id, { title: v })} />
                )}
              </Field>
            )}

            {(selected.template === 'title' || selected.template === 'image' || selected.template === 'endcard') && (
              <Field label={selected.template === 'endcard' ? 'Fine print' : 'Subtitle'}>
                <TextInput value={selected.subtitle} onChange={(v) => patchScene(selected.id, { subtitle: v })} />
              </Field>
            )}

            {selected.template === 'list' && (
              <Field label="Lines (one per row)">
                <TextArea value={selected.body} onChange={(v) => patchScene(selected.id, { body: v })} rows={4} />
              </Field>
            )}

            {selected.template === 'stat' && (
              <>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Field label="Prefix">
                    <TextInput value={selected.statPrefix} onChange={(v) => patchScene(selected.id, { statPrefix: v })} placeholder="$" />
                  </Field>
                  <Field label="Value">
                    <input
                      type="number"
                      className="ms-input ms-input-mono"
                      value={selected.statValue}
                      onChange={(e) => patchScene(selected.id, { statValue: Number(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Suffix">
                    <TextInput value={selected.statSuffix} onChange={(v) => patchScene(selected.id, { statSuffix: v })} placeholder="M+" />
                  </Field>
                </div>
                <Field label="Label">
                  <TextInput value={selected.attribution} onChange={(v) => patchScene(selected.id, { attribution: v })} />
                </Field>
              </>
            )}

            {selected.template === 'quote' && (
              <Field label="Attribution">
                <TextInput value={selected.attribution} onChange={(v) => patchScene(selected.id, { attribution: v })} placeholder="Name — Startup" />
              </Field>
            )}

            {/* Image controls */}
            {selected.template === 'image' && (
              <>
                <Field label="Image">
                  {selected.imageId && assetsRef.current[selected.imageId] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={assetsRef.current[selected.imageId].url}
                      alt=""
                      className="ms-img-thumb"
                      style={{ marginBottom: 6 }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ms-file-btn" onClick={() => imageInputRef.current?.click()}>
                      ⬆ Upload image
                    </button>
                    {images.length > 0 && (
                      <select
                        className="ms-input"
                        style={{ width: 'auto', flex: 1 }}
                        value={selected.imageId ?? ''}
                        onChange={(e) => patchScene(selected.id, { imageId: e.target.value || null })}
                      >
                        <option value="">— none —</option>
                        {images.map((im) => (
                          <option key={im.id} value={im.id}>{im.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }}
                  />
                </Field>
                <Field label="Motion">
                  <Seg options={KEN_BURNS} value={selected.kenBurns} onChange={(v) => patchScene(selected.id, { kenBurns: v })} small />
                </Field>
                <Field label="Overlay">
                  <Seg options={OVERLAYS} value={selected.overlay} onChange={(v) => patchScene(selected.id, { overlay: v })} small />
                </Field>
                {selected.overlay !== 'none' && (
                  <Field label="Overlay strength">
                    <Slider
                      value={selected.overlayOpacity}
                      onChange={(v) => patchScene(selected.id, { overlayOpacity: v })}
                      min={0.1} max={1} step={0.05}
                      format={(v) => `${Math.round(v * 100)}%`}
                    />
                  </Field>
                )}
              </>
            )}

            <Field label="Animation">
              <Seg options={TEXT_ANIMS} value={selected.anim} onChange={(v) => patchScene(selected.id, { anim: v })} small />
            </Field>

            <Field label="Heading typeface">
              <Seg
                options={SERIF_OPTS}
                value={selected.serifTitle ? 'serif' : 'sans'}
                onChange={(v) => patchScene(selected.id, { serifTitle: v === 'serif' })}
                small
              />
            </Field>

            <Field label="Duration">
              <Slider
                value={selected.duration}
                onChange={(v) => patchScene(selected.id, { duration: v })}
                min={1500} max={10000} step={250}
                format={(v) => `${(v / 1000).toFixed(2)}s`}
              />
            </Field>

            <Field label="Color scheme">
              <div className="ms-swatches">
                {TFG_SCHEMES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    title={s.label}
                    className={`ms-swatch ${activeTfgSwatch?.id === s.id ? 'is-active' : ''}`}
                    style={{ background: s.bg, borderColor: s.accent }}
                    onClick={() => patchScene(selected.id, { customScheme: { bg: s.bg, fg: s.fg, accent: s.accent } })}
                  />
                ))}
                <button
                  type="button"
                  title="Custom colors"
                  className={`ms-swatch ms-swatch-custom ${selected.customScheme && !activeTfgSwatch ? 'is-active' : ''}`}
                  onClick={() => patchScene(selected.id, { customScheme: { ...brandColors } })}
                />
              </div>
              {selected.customScheme && !activeTfgSwatch && (
                <div style={{ marginTop: 10 }}>
                  <ColorRow
                    label="Background"
                    value={selected.customScheme.bg}
                    onChange={(v) => patchScene(selected.id, { customScheme: { ...selected.customScheme!, bg: v } })}
                  />
                  <ColorRow
                    label="Text"
                    value={selected.customScheme.fg}
                    onChange={(v) => patchScene(selected.id, { customScheme: { ...selected.customScheme!, fg: v } })}
                  />
                  <ColorRow
                    label="Accent"
                    value={selected.customScheme.accent}
                    onChange={(v) => patchScene(selected.id, { customScheme: { ...selected.customScheme!, accent: v } })}
                  />
                </div>
              )}
            </Field>

            <Field label="Alignment">
              <Seg options={ALIGNMENTS} value={selected.align} onChange={(v) => patchScene(selected.id, { align: v })} small />
            </Field>

            {selectedIndex > 0 && (
              <Field label="Transition in">
                <Seg options={TRANSITIONS} value={selected.transition} onChange={(v) => patchScene(selected.id, { transition: v as TransitionId })} small />
              </Field>
            )}
          </Section>
        )}

        {/* — Script → Scenes — */}
        <Section title="Script → Scenes" badge="AI storyboard">
          <Field label="Script or transcript">
            <TextArea
              value={script}
              onChange={setScript}
              rows={5}
              placeholder={'Paste your video script or an SRT transcript with timestamps…\n\nThe AI storyboards it into TFG-branded scenes: key lines become statements, numbers become animated stats, steps become agendas.'}
            />
            <div style={{ marginTop: 6 }}>
              <button className="ms-file-btn" onClick={() => scriptFileRef.current?.click()}>
                ⬆ Upload .txt / .srt / .vtt
              </button>
              <input
                ref={scriptFileRef}
                type="file"
                accept=".txt,.srt,.vtt,.md,text/plain"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScriptFile(f); e.target.value = ''; }}
              />
            </div>
          </Field>
          <Field label="Creative direction (optional)">
            <TextInput
              value={scriptNotes}
              onChange={setScriptNotes}
              placeholder="e.g. punchy and technical, demo-day energy"
            />
          </Field>
          <Field label="Mode">
            <Seg
              options={[{ id: 'replace', label: 'Replace scenes' }, { id: 'append', label: 'Append' }] as const}
              value={scriptMode}
              onChange={setScriptMode}
              small
            />
          </Field>
          <Field label="Force brand colors on result">
            <Seg
              options={[{ id: 'on', label: 'On' }, { id: 'off', label: 'Off' }] as const}
              value={useBrandOnGenerated}
              onChange={setUseBrandOnGenerated}
              small
            />
          </Field>
          <button
            className="ms-btn is-primary"
            style={{ width: '100%' }}
            disabled={generating || !script.trim()}
            onClick={handleGenerateScenes}
          >
            {generating ? 'Storyboarding…' : '✦ Generate scenes'}
          </button>
          {scriptStatus && (
            <p className={`ms-status ${scriptStatus.ok ? 'is-ok' : 'is-err'}`}>{scriptStatus.msg}</p>
          )}
          <p className="ms-hint">
            Generated scenes land on the TFG palette (dark-led, green for one high-impact beat).
            Timestamped transcripts (SRT) pace scenes to the voiceover beats.
          </p>
        </Section>

        {/* — Brand — */}
        <Section title="Brand" badge="TFG defaults">
          <Field label="Program name">
            <TextInput value={brandName} onChange={setBrandName} placeholder="Tech Futures Group" />
          </Field>
          <Field label="Brand colors">
            <ColorRow label="Background" value={brandColors.bg} onChange={(v) => setBrandColors((c) => ({ ...c, bg: v }))} />
            <ColorRow label="Text" value={brandColors.fg} onChange={(v) => setBrandColors((c) => ({ ...c, fg: v }))} />
            <ColorRow label="Accent" value={brandColors.accent} onChange={(v) => setBrandColors((c) => ({ ...c, accent: v }))} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="ms-btn" style={{ flex: 1, padding: '7px 8px' }} onClick={applyBrandToAll}>
                Apply to all scenes
              </button>
              <button className="ms-btn" style={{ flex: 1, padding: '7px 8px' }} onClick={resetToTfgDark}>
                Reset to TFG dark
              </button>
            </div>
            <p className="ms-hint">
              Each scene keeps its own copy of colors — pick a TFG swatch per scene, or the rainbow
              swatch for one-off custom colors.
            </p>
          </Field>
          <Field label="Logo (end cards)">
            <div className="ms-logo-row">
              {logoLight ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoLight.url} alt="Light logo" className="ms-logo-thumb is-dark-bg" />
                  <button className="ms-icon-btn is-danger" style={{ flex: 'none', padding: '4px 10px' }} onClick={() => removeLogo('light')}>✕</button>
                </>
              ) : (
                <button className="ms-file-btn" onClick={() => logoLightRef.current?.click()}>
                  ⬆ Light logo (dark backgrounds)
                </button>
              )}
            </div>
            <div className="ms-logo-row">
              {logoDark ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoDark.url} alt="Dark logo" className="ms-logo-thumb is-light-bg" />
                  <button className="ms-icon-btn is-danger" style={{ flex: 'none', padding: '4px 10px' }} onClick={() => removeLogo('dark')}>✕</button>
                </>
              ) : (
                <button className="ms-file-btn" onClick={() => logoDarkRef.current?.click()}>
                  ⬆ Dark logo (light backgrounds)
                </button>
              )}
            </div>
            <input
              ref={logoLightRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f, 'light'); e.target.value = ''; }}
            />
            <input
              ref={logoDarkRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f, 'dark'); e.target.value = ''; }}
            />
            <p className="ms-hint">
              Replaces the built-in TFG mark on end card scenes. PNG or SVG with transparency works best.
            </p>
          </Field>
        </Section>

        {/* — Document — */}
        <Section title="Document">
          <Field label="Format">
            <Seg
              options={ASPECTS.map((a) => ({ id: a.id, label: `${a.id} ${a.label}` }))}
              value={doc.aspect}
              onChange={(v) => patchDoc({ aspect: v })}
              small
            />
            <p className="ms-hint">{aspect.w}×{aspect.h} · {aspect.hint}</p>
          </Field>
          <Field label="Film grain">
            <Seg
              options={[{ id: 'on', label: 'On' }, { id: 'off', label: 'Off' }] as const}
              value={doc.showGrain ? 'on' : 'off'}
              onChange={(v) => patchDoc({ showGrain: v === 'on' })}
              small
            />
          </Field>
          <Field label="Watermark">
            <TextInput value={doc.watermark} onChange={(v) => patchDoc({ watermark: v })} placeholder="techfuturesgroup.org" />
          </Field>
        </Section>

        {/* — Fonts — */}
        <Section title="Fonts" badge="TFG defaults">
          <datalist id="ms-font-list-tfg">
            {fontOptions.map((f) => (
              <option key={f.family} value={f.family}>{f.label}</option>
            ))}
          </datalist>
          <Field label="Heading font">
            <input
              className="ms-input"
              list="ms-font-list-tfg"
              value={doc.fontHeading}
              onChange={(e) => patchDoc({ fontHeading: e.target.value })}
            />
          </Field>
          <Field label="Body font">
            <input
              className="ms-input"
              list="ms-font-list-tfg"
              value={doc.fontBody}
              onChange={(e) => patchDoc({ fontBody: e.target.value })}
            />
          </Field>
          <Field label="Adobe Fonts (Typekit) kit">
            <div style={{ display: 'flex', gap: 6 }}>
              <TextInput value={kitInput} onChange={setKitInput} placeholder="Kit ID or use.typekit.net URL" mono />
              <button className="ms-btn" style={{ padding: '7px 12px' }} disabled={loadingKit} onClick={handleLoadKit}>
                {loadingKit ? '…' : 'Load'}
              </button>
            </div>
            <p className="ms-hint">
              TFG defaults (GT America Extended + Tobias) are self-hosted on this site.
              Paste a kit ID to pull in additional Adobe fonts.
            </p>
          </Field>
          <Field label="Upload font files">
            <button className="ms-file-btn" onClick={() => fontFileRef.current?.click()}>
              ⬆ Add .woff2 / .otf / .ttf
            </button>
            <input
              ref={fontFileRef}
              type="file"
              accept=".woff,.woff2,.otf,.ttf"
              multiple
              hidden
              onChange={(e) => { if (e.target.files?.length) handleFontFiles(e.target.files); e.target.value = ''; }}
            />
          </Field>
          {kitStatus && (
            <p className={`ms-status ${kitStatus.ok ? 'is-ok' : 'is-err'}`}>{kitStatus.msg}</p>
          )}
        </Section>

        {/* — Export — */}
        <Section title="Export" badge={`${aspect.w}×${aspect.h} · ${doc.fps}fps`}>
          {exporting && exporting !== 'png' ? (
            <>
              <div className="ms-progress">
                <div className="ms-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <p className="ms-hint">Rendering {exporting.toUpperCase()} — {Math.round(progress * 100)}%</p>
              <button className="ms-btn" style={{ marginTop: 8 }} onClick={() => abortRef.current?.abort()}>
                Cancel
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="ms-btn is-primary"
                disabled={!mp4Supported || !!exporting}
                onClick={() => handleExportVideo('mp4')}
              >
                ⬇ Export MP4
              </button>
              {mp4Supported === false && (
                <p className="ms-hint">
                  This browser doesn&apos;t support WebCodecs — use Chrome or Edge for MP4, or export WebM below.
                </p>
              )}
              <button className="ms-btn" disabled={!!exporting} onClick={() => handleExportVideo('webm')}>
                ⬇ Export WebM
              </button>
              <button className="ms-btn" disabled={!!exporting} onClick={handleExportPng}>
                ⬇ PNG of current frame
              </button>
            </div>
          )}
          {exportStatus && (
            <p className={`ms-status ${exportStatus.ok ? 'is-ok' : 'is-err'}`}>{exportStatus.msg}</p>
          )}
          <p className="ms-hint">
            MP4 renders offline frame-by-frame — output is exactly what the preview shows, at full quality.
          </p>
        </Section>
      </aside>
    </div>
  );
}
