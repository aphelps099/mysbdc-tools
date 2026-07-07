'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MotionDoc, Scene, TemplateId, AssetMap, ImageAsset, CustomScheme, TextAnimId, SchemeId, AlignId, TransitionId, BackdropId,
  ASPECTS, SCHEMES, TEMPLATES, TEXT_ANIMS, TRANSITIONS, KEN_BURNS, OVERLAYS, ALIGNMENTS, BACKDROPS,
  defaultDoc, makeScene, getAspect, resolveScheme, docDuration, sceneAt,
} from '@/lib/motion/types';
import { renderFrame } from '@/lib/motion/render';
import {
  exportMp4, exportWebm, exportPng, downloadBlob, supportsMp4Export,
} from '@/lib/motion/export';
import {
  FontOption, builtinFonts, loadTypekitKit, registerFontFile, ensureFontsReady, DEFAULT_KIT_ID,
} from '@/lib/motion/fonts';
import {
  AudioTrack, decodeAudioFile, duckGainAt, renderProMixdown,
} from '@/lib/motion/audio';
import {
  ProjectFile, serializeProject, parseProject, saveAutosave, loadAutosave, clearAutosave,
} from '@/lib/motion/project';
import { Field, TextInput, TextArea, Seg, Slider, Section } from './controls';
import './motion-studio.css';

/* ═══════════════════════════════════════════════════════
   ProMotionStudio — program-brandable copy of the
   Motion Studio editor. Adds on top of the original:
   · Custom color schemes (any program's palette)
   · Custom logo upload for end cards
   · Script → scenes: AI storyboarding from a pasted
     script or timestamped transcript
   The render/export engine is shared with /motion, so
   output is identical.
   ═══════════════════════════════════════════════════════ */

const SERIF_OPTS = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
] as const;

const DEFAULT_BRAND: CustomScheme = { bg: '#0f1c2e', fg: '#ffffff', accent: '#8FC5D9' };

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
  backdrop?: string;
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

export default function ProMotionStudio() {
  // ── Document & selection ──
  const [doc, setDoc] = useState<MotionDoc>(defaultDoc);
  const [selectedId, setSelectedId] = useState<string | null>(doc.scenes[0]?.id ?? null);
  const docRef = useRef(doc);
  docRef.current = doc;

  // ── Undo / redo ──
  // Rapid edits (slider drags, typing) within 400ms coalesce into one step.
  const historyRef = useRef<{ past: MotionDoc[]; future: MotionDoc[]; lastPush: number }>(
    { past: [], future: [], lastPush: 0 },
  );
  const [, setHistoryTick] = useState(0);

  const applyDoc = useCallback((updater: (d: MotionDoc) => MotionDoc, coalesce = true) => {
    setDoc((d) => {
      const nd = updater(d);
      if (nd === d) return d;
      const h = historyRef.current;
      const now = Date.now();
      if (!coalesce || now - h.lastPush > 400) {
        h.past.push(d);
        if (h.past.length > 100) h.past.shift();
      }
      h.lastPush = now;
      h.future = [];
      return nd;
    });
    setHistoryTick((t) => t + 1);
  }, []);

  const undo = useCallback(() => {
    const h = historyRef.current;
    setDoc((d) => {
      const prev = h.past.pop();
      if (!prev) return d;
      h.future.push(d);
      return prev;
    });
    h.lastPush = 0;
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    const h = historyRef.current;
    setDoc((d) => {
      const next = h.future.pop();
      if (!next) return d;
      h.past.push(d);
      return next;
    });
    h.lastPush = 0;
    setHistoryTick((t) => t + 1);
  }, []);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  const selected = doc.scenes.find((s) => s.id === selectedId) ?? null;
  const selectedIndex = selected ? doc.scenes.indexOf(selected) : -1;
  const totalMs = docDuration(doc);
  const aspect = getAspect(doc.aspect);

  // ── Assets ──
  const assetsRef = useRef<AssetMap>({});
  const [images, setImages] = useState<ImageAsset[]>([]);

  useEffect(() => {
    // Built-in logos as fallback for end cards (brand logos win when uploaded)
    let alive = true;
    (async () => {
      for (const [id, url] of [
        ['__logo-white', '/sbdc-white-2026.png'],
        ['__logo-blue', '/sbdc-blue-2026.png'],
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
  const [brandName, setBrandName] = useState('');
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

  const clearCustomColors = () => {
    applyDoc((d) => ({ ...d, scenes: d.scenes.map((s) => ({ ...s, customScheme: null })) }), false);
  };

  // ── Audio tracks (voiceover + music bed) ──
  const [voTrack, setVoTrack] = useState<AudioTrack | null>(null);
  const [musicTrack, setMusicTrack] = useState<AudioTrack | null>(null);
  const voTrackRef = useRef<AudioTrack | null>(null);
  voTrackRef.current = voTrack;
  const musicTrackRef = useRef<AudioTrack | null>(null);
  musicTrackRef.current = musicTrack;
  const voElRef = useRef<HTMLAudioElement | null>(null);
  const musicElRef = useRef<HTMLAudioElement | null>(null);
  const voFileRef = useRef<HTMLInputElement>(null);
  const musicFileRef = useRef<HTMLInputElement>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const handleAudioFile = async (file: File, kind: 'vo' | 'music') => {
    setAudioError(null);
    try {
      const track = await decodeAudioFile(file);
      if (kind === 'vo') {
        voElRef.current?.pause();
        if (voTrackRef.current) URL.revokeObjectURL(voTrackRef.current.url);
        const el = new Audio(track.url);
        el.preload = 'auto';
        voElRef.current = el;
        setVoTrack(track);
      } else {
        musicElRef.current?.pause();
        if (musicTrackRef.current) URL.revokeObjectURL(musicTrackRef.current.url);
        const el = new Audio(track.url);
        el.preload = 'auto';
        el.loop = true;
        musicElRef.current = el;
        setMusicTrack(track);
      }
    } catch {
      setAudioError(`Couldn't decode ${file.name} — try MP3, WAV, or M4A.`);
    }
  };

  const removeAudio = (kind: 'vo' | 'music') => {
    if (kind === 'vo') {
      voElRef.current?.pause();
      voElRef.current = null;
      if (voTrackRef.current) URL.revokeObjectURL(voTrackRef.current.url);
      setVoTrack(null);
    } else {
      musicElRef.current?.pause();
      musicElRef.current = null;
      if (musicTrackRef.current) URL.revokeObjectURL(musicTrackRef.current.url);
      setMusicTrack(null);
    }
  };

  /** Keep preview <audio> elements in lockstep with the playhead + duck curve. */
  const syncPreviewAudio = useCallback((t: number, isPlaying: boolean) => {
    const d = docRef.current;
    const vo = voElRef.current;
    const voDurMs = voTrackRef.current ? voTrackRef.current.buffer.duration * 1000 : null;
    const music = musicElRef.current;

    if (music && musicTrackRef.current) {
      music.volume = Math.min(1, Math.max(0, duckGainAt(t, voDurMs, {
        musicVolume: d.audioVolume, duckLevel: d.duckLevel,
      })));
      const musDur = musicTrackRef.current.buffer.duration;
      const target = (t / 1000) % musDur;
      if (Math.abs(music.currentTime - target) > 0.3) music.currentTime = target;
      if (isPlaying && music.paused) music.play().catch(() => {});
      else if (!isPlaying && !music.paused) music.pause();
    }

    if (vo && voDurMs !== null) {
      const inVo = t < voDurMs;
      if (inVo) {
        const target = t / 1000;
        if (Math.abs(vo.currentTime - target) > 0.3) vo.currentTime = target;
        if (isPlaying && vo.paused) vo.play().catch(() => {});
        else if (!isPlaying && !vo.paused) vo.pause();
      } else if (!vo.paused) {
        vo.pause();
      }
    }
  }, []);

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

      // Preview soundtrack follows the playhead (same duck curve as export)
      syncPreviewAudio(playheadRef.current, playingRef.current);

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
  }, [syncPreviewAudio]);

  // ── Keyboard editing ──
  // space play/pause · S split · ⌘Z/⇧⌘Z/⌘Y undo/redo · ←/→ nudge frame
  // (⇧ = 1s) · Home/End · Delete removes selected scene
  const keyDepsRef = useRef({ undo, redo, splitAtPlayhead: null as null | (() => void), removeScene: null as null | ((id: string) => void), selectedId });
  keyDepsRef.current.undo = undo;
  keyDepsRef.current.redo = redo;
  keyDepsRef.current.selectedId = selectedId;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const deps = keyDepsRef.current;
      const frameMs = 1000 / (docRef.current.fps || 30);
      const total = docDuration(docRef.current);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) deps.redo(); else deps.undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        deps.redo();
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        deps.splitAtPlayhead?.();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const step = (e.shiftKey ? 1000 : frameMs) * (e.key === 'ArrowLeft' ? -1 : 1);
        playheadRef.current = Math.min(Math.max(0, playheadRef.current + step), Math.max(0, total - 1));
        setPlaying(false);
      } else if (e.key === 'Home') {
        e.preventDefault();
        playheadRef.current = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        playheadRef.current = Math.max(0, total - 1);
        setPlaying(false);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && deps.selectedId) {
        e.preventDefault();
        deps.removeScene?.(deps.selectedId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Doc/scene mutation helpers ──
  const patchDoc = useCallback((p: Partial<MotionDoc>) => {
    applyDoc((d) => ({ ...d, ...p }));
  }, [applyDoc]);

  const patchScene = useCallback((id: string, p: Partial<Scene>) => {
    applyDoc((d) => ({ ...d, scenes: d.scenes.map((s) => (s.id === id ? { ...s, ...p } : s)) }));
  }, [applyDoc]);

  const sceneStart = useCallback((index: number) => {
    return docRef.current.scenes.slice(0, index).reduce((a, s) => a + s.duration, 0);
  }, []);

  const seekToScene = useCallback((index: number) => {
    playheadRef.current = sceneStart(index) + 1;
  }, [sceneStart]);

  const addScene = (template: TemplateId) => {
    const scene = makeScene(template);
    applyDoc((d) => {
      const i = selectedIndex >= 0 ? selectedIndex + 1 : d.scenes.length;
      const scenes = [...d.scenes];
      scenes.splice(i, 0, scene);
      return { ...d, scenes };
    }, false);
    setSelectedId(scene.id);
  };

  const duplicateScene = (id: string) => {
    applyDoc((d) => {
      const i = d.scenes.findIndex((s) => s.id === id);
      if (i < 0) return d;
      const copy = { ...d.scenes[i], id: `${d.scenes[i].id}-copy-${Math.floor(Math.random() * 1e6)}` };
      const scenes = [...d.scenes];
      scenes.splice(i + 1, 0, copy);
      setSelectedId(copy.id);
      return { ...d, scenes };
    }, false);
  };

  const removeScene = useCallback((id: string) => {
    applyDoc((d) => {
      if (d.scenes.length <= 1) return d;
      const i = d.scenes.findIndex((s) => s.id === id);
      const scenes = d.scenes.filter((s) => s.id !== id);
      setSelectedId((sel) => (sel === id ? scenes[Math.max(0, i - 1)]?.id ?? null : sel));
      return { ...d, scenes };
    }, false);
  }, [applyDoc]);

  const moveScene = (id: string, dir: -1 | 1) => {
    applyDoc((d) => {
      const i = d.scenes.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.scenes.length) return d;
      const scenes = [...d.scenes];
      [scenes[i], scenes[j]] = [scenes[j], scenes[i]];
      return { ...d, scenes };
    }, false);
  };

  const reorderScene = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    applyDoc((d) => {
      const from = d.scenes.findIndex((s) => s.id === fromId);
      const to = d.scenes.findIndex((s) => s.id === toId);
      if (from < 0 || to < 0) return d;
      const scenes = [...d.scenes];
      const [moved] = scenes.splice(from, 1);
      scenes.splice(to, 0, moved);
      return { ...d, scenes };
    }, false);
  };

  // ── Split at playhead ──
  const splitAtPlayhead = useCallback(() => {
    const d = docRef.current;
    const t = playheadRef.current;
    const { index, local } = sceneAt(d, t);
    const s = d.scenes[index];
    // Refuse hairline slivers near scene edges
    if (!s || local < 400 || s.duration - local < 400) return;
    const a = { ...s, duration: Math.round(local) };
    const b = {
      ...s,
      id: `${s.id}-b${Date.now().toString(36)}`,
      duration: Math.round(s.duration - local),
      transition: 'cut' as TransitionId,
    };
    applyDoc((dd) => {
      const i = dd.scenes.findIndex((x) => x.id === s.id);
      if (i < 0) return dd;
      const scenes = [...dd.scenes];
      scenes.splice(i, 1, a, b);
      return { ...dd, scenes };
    }, false);
    setSelectedId(b.id);
  }, [applyDoc]);

  // Late-bind the handlers the keyboard effect uses (defined above it)
  keyDepsRef.current.splitAtPlayhead = splitAtPlayhead;
  keyDepsRef.current.removeScene = removeScene;

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

  // Drag a timeline block's right edge to set that scene's duration
  const onDurationHandleDown = (e: React.PointerEvent, sceneId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startTotal = docDuration(docRef.current);
    const startDur = docRef.current.scenes.find((s) => s.id === sceneId)?.duration ?? 0;
    const move = (ev: PointerEvent) => {
      const deltaMs = ((ev.clientX - startX) / rect.width) * startTotal;
      const next = Math.round(Math.min(15000, Math.max(1000, startDur + deltaMs)) / 50) * 50;
      applyDoc((d) => ({
        ...d,
        scenes: d.scenes.map((s) => (s.id === sceneId ? { ...s, duration: next } : s)),
      }));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // ── Scene-card drag reorder ──
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ── Safe-area guides (preview only) ──
  const [safeGuides, setSafeGuides] = useState(false);

  // ── Scene card thumbnails — re-render (debounced) when the doc changes ──
  const thumbRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  useEffect(() => {
    const id = setTimeout(() => {
      const d = docRef.current;
      const { w: W, h: H } = getAspect(d.aspect);
      let acc = 0;
      for (const s of d.scenes) {
        const midT = acc + s.duration * 0.65;
        acc += s.duration;
        const c = thumbRefs.current[s.id];
        if (!c) continue;
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        ctx.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
        renderFrame(ctx, d, midT, assetsRef.current);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [doc, images]);

  // ── Image upload ──
  const imageInputRef = useRef<HTMLInputElement>(null);
  /** Filenames a loaded project referenced but whose binaries are missing: name → original asset id. */
  const pendingImagesRef = useRef<Map<string, string>>(new Map());

  const handleImageFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      // Re-uploading a file a saved project referenced relinks it to every
      // scene that used it (media is saved by filename, not embedded).
      const relinkId = pendingImagesRef.current.get(file.name);
      if (relinkId) pendingImagesRef.current.delete(file.name);
      const asset: ImageAsset = {
        id: relinkId ?? `img-${Date.now().toString(36)}`,
        name: file.name, url, img,
      };
      assetsRef.current[asset.id] = asset;
      setImages((list) => [...list.filter((i) => i.id !== asset.id), asset]);
      if (!relinkId && selected) patchScene(selected.id, { imageId: asset.id });
    } catch {
      URL.revokeObjectURL(url);
    }
  };

  // ── Project save / load / autosave ──
  const projectFileRef = useRef<HTMLInputElement>(null);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const brandNameRef = useRef(brandName);
  brandNameRef.current = brandName;
  const brandColorsRef = useRef(brandColors);
  brandColorsRef.current = brandColors;

  const buildProject = useCallback((): ProjectFile => {
    return serializeProject({
      doc: docRef.current,
      brandName: brandNameRef.current,
      brandColors: brandColorsRef.current,
      media: {
        images: Object.values(assetsRef.current)
          .filter((a) => a.id.startsWith('img-'))
          .map((a) => ({ id: a.id, name: a.name })),
        logoLight: assetsRef.current['__logo-brand-light']?.name ?? null,
        logoDark: assetsRef.current['__logo-brand-dark']?.name ?? null,
        voiceover: voTrackRef.current?.name ?? null,
        music: musicTrackRef.current?.name ?? null,
      },
    });
  }, []);

  const applyProject = useCallback((p: ProjectFile) => {
    historyRef.current = { past: [], future: [], lastPush: 0 };
    setDoc(p.doc);
    setBrandName(p.brandName ?? '');
    if (p.brandColors) setBrandColors(p.brandColors);
    setSelectedId(p.doc.scenes[0]?.id ?? null);
    playheadRef.current = 0;
    pendingImagesRef.current = new Map(
      p.media.images
        .filter((m) => !assetsRef.current[m.id])
        .map((m) => [m.name, m.id]),
    );
    const missing = [
      ...p.media.images.filter((m) => !assetsRef.current[m.id]).map((m) => m.name),
      ...(p.media.logoLight && !assetsRef.current['__logo-brand-light'] ? [p.media.logoLight] : []),
      ...(p.media.logoDark && !assetsRef.current['__logo-brand-dark'] ? [p.media.logoDark] : []),
      ...(p.media.voiceover && !voTrackRef.current ? [p.media.voiceover] : []),
      ...(p.media.music && !musicTrackRef.current ? [p.media.music] : []),
    ];
    setProjectStatus(missing.length
      ? `Project loaded. Re-upload to relink: ${missing.join(', ')}`
      : 'Project loaded.');
  }, []);

  // Restore the autosaved project once on mount
  useEffect(() => {
    const saved = loadAutosave();
    if (saved && saved.doc.scenes.length) {
      applyProject(saved);
      setProjectStatus((s) => (s ? s.replace('Project loaded', 'Restored autosave') : 'Restored autosave.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounced) whenever the document or brand changes
  useEffect(() => {
    const id = setTimeout(() => saveAutosave(buildProject()), 800);
    return () => clearTimeout(id);
  }, [doc, brandName, brandColors, images, logoLight, logoDark, voTrack, musicTrack, buildProject]);

  const handleSaveProject = () => {
    const p = buildProject();
    const base = (brandNameRef.current || 'motion-project').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadBlob(
      new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }),
      `${base}.motion.json`,
    );
    setProjectStatus('Project saved as JSON (media referenced by filename, not embedded).');
  };

  const handleLoadProject = async (file: File) => {
    try {
      applyProject(parseProject(await file.text()));
    } catch (e) {
      setProjectStatus(e instanceof Error ? e.message : 'Could not read that project file.');
    }
  };

  const handleNewProject = () => {
    clearAutosave();
    historyRef.current = { past: [], future: [], lastPush: 0 };
    const fresh = defaultDoc();
    setDoc(fresh);
    setSelectedId(fresh.scenes[0]?.id ?? null);
    playheadRef.current = 0;
    pendingImagesRef.current = new Map();
    setProjectStatus('New project.');
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

  // ── Script / URL → scenes ──
  const [aiSource, setAiSource] = useState<'script' | 'url'>('script');
  const [aiUrl, setAiUrl] = useState('');
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
    if (g.scheme) overrides.scheme = g.scheme as SchemeId;
    if (g.backdrop) overrides.backdrop = g.backdrop as BackdropId;
    if (g.serifTitle !== undefined) overrides.serifTitle = g.serifTitle;
    if (g.durationMs) overrides.duration = g.durationMs;
    if (useBrandOnGenerated === 'on') overrides.customScheme = { ...brandColors };
    return makeScene(g.template, overrides);
  };

  const handleGenerateScenes = async () => {
    const fromUrl = aiSource === 'url';
    if (generating || (fromUrl ? !aiUrl.trim() : !script.trim())) return;
    setGenerating(true);
    setScriptStatus(null);
    try {
      const res = await fetch('/api/ai/motion-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(fromUrl ? { url: aiUrl.trim() } : { script }),
          notes: scriptNotes || undefined,
          aspect: doc.aspect,
          brandName: brandName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      const generated: GeneratedScene[] = data.scenes ?? [];
      if (!generated.length) throw new Error('No scenes came back — try a clearer script.');
      const mapped = generated.map(mapGenerated);
      applyDoc((d) => ({
        ...d,
        scenes: scriptMode === 'replace' ? mapped : [...d.scenes, ...mapped],
      }), false);
      setSelectedId(mapped[0].id);
      playheadRef.current = scriptMode === 'replace' ? 0 : docDuration(docRef.current);
      setPlaying(true);
      const from = data.pageTitle ? ` from “${data.pageTitle}”` : '';
      setScriptStatus({ ok: true, msg: `${mapped.length} scenes ${scriptMode === 'replace' ? 'created' : 'added'}${from} — review and tweak each one.` });
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
      // MP4 gets the soundtrack (VO + ducked music) mixed in; WebM stays silent.
      const soundtrack = kind === 'mp4'
        ? await renderProMixdown(docDuration(doc), voTrack, musicTrack, {
            musicVolume: doc.audioVolume, duckLevel: doc.duckLevel,
          })
        : null;
      const blob = kind === 'mp4'
        ? await exportMp4(doc, assetsRef.current, onP, abortRef.current.signal, { audioBuffer: soundtrack })
        : await exportWebm(doc, assetsRef.current, onP, abortRef.current.signal);
      const base = brandName ? brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'sbdc-motion';
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
      downloadBlob(blob, `sbdc-frame-${doc.aspect.replace(':', 'x')}.png`);
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

  return (
    <div className="ms-root">

      {/* ══ Scene strip ══ */}
      <aside className="ms-scenes">
        <p className="ms-scenes-title">Scenes · {fmtTime(totalMs)}</p>

        {doc.scenes.map((s, i) => {
          const scheme = resolveScheme(s);
          const active = s.id === selectedId;
          const thumbW = 188;
          const thumbH = Math.round(thumbW * (aspect.h / aspect.w));
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              className={`ms-scene-card ${active ? 'is-active' : ''} ${dragId === s.id ? 'is-dragging' : ''} ${dragOverId === s.id && dragId !== s.id ? 'is-dragover' : ''}`}
              draggable
              onDragStart={(e) => { setDragId(s.id); e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(s.id); }}
              onDragLeave={() => setDragOverId((v) => (v === s.id ? null : v))}
              onDrop={(e) => { e.preventDefault(); if (dragId) reorderScene(dragId, s.id); setDragId(null); setDragOverId(null); }}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              onClick={() => { setSelectedId(s.id); seekToScene(i); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedId(s.id); seekToScene(i); } }}
            >
              <div className="ms-scene-card-top">
                <span className="ms-scene-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ms-scene-kind">{TEMPLATES.find((t) => t.id === s.template)?.label}</span>
                <span className="ms-scene-dot" style={{ background: scheme.bg }} />
              </div>
              <canvas
                className="ms-scene-thumb"
                width={thumbW}
                height={Math.min(thumbH, 334)}
                ref={(el) => { thumbRefs.current[s.id] = el; }}
              />
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
          {TEMPLATES.filter((t) => t.id !== 'video' && t.id !== 'disclaimer').map((t) => (
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
            {safeGuides && (
              <svg className="ms-safe-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* action safe 90% / title safe 80% — preview only, never exported */}
                <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.22" strokeDasharray="1.4 1" />
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="rgba(143,197,217,0.65)" strokeWidth="0.22" />
                <line x1="50" y1="46" x2="50" y2="54" stroke="rgba(255,255,255,0.45)" strokeWidth="0.22" />
                <line x1="47" y1="50" x2="53" y2="50" stroke="rgba(255,255,255,0.45)" strokeWidth="0.22" />
              </svg>
            )}
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
          <button className="ms-btn" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">↶</button>
          <button className="ms-btn" onClick={redo} disabled={!canRedo} title="Redo (⇧⌘Z / ⌘Y)">↷</button>
          <button className="ms-btn" onClick={splitAtPlayhead} title="Split scene at playhead (S)">✂ Split</button>
          <button
            className={`ms-btn ${safeGuides ? 'is-toggled' : ''}`}
            onClick={() => setSafeGuides((g) => !g)}
            title="Safe-area guides (preview only)"
          >
            ⊞ Safe
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
              <div
                className="ms-tl-handle"
                title="Drag to set duration"
                onPointerDown={(e) => onDurationHandleDown(e, s.id)}
              />
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
                <TextInput value={selected.kicker} onChange={(v) => patchScene(selected.id, { kicker: v })} placeholder="UPCOMING WORKSHOP" />
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
                <TextInput value={selected.attribution} onChange={(v) => patchScene(selected.id, { attribution: v })} placeholder="Name — Business" />
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
                {SCHEMES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    title={s.label}
                    className={`ms-swatch ${!selected.customScheme && selected.scheme === s.id ? 'is-active' : ''}`}
                    style={{ background: s.bg, borderColor: s.accent }}
                    onClick={() => patchScene(selected.id, { scheme: s.id, customScheme: null })}
                  />
                ))}
                <button
                  type="button"
                  title="Custom colors"
                  className={`ms-swatch ms-swatch-custom ${selected.customScheme ? 'is-active' : ''}`}
                  onClick={() => patchScene(selected.id, { customScheme: selected.customScheme ?? { ...brandColors } })}
                />
              </div>
              {selected.customScheme && (
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

            {selected.template !== 'image' && (
              <Field label="Backdrop">
                <Seg options={BACKDROPS} value={selected.backdrop} onChange={(v) => patchScene(selected.id, { backdrop: v })} small />
              </Field>
            )}

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

        {/* — Storyboard AI: script or URL → scenes — */}
        <Section title="Storyboard AI" badge="Script or URL → scenes">
          <Field label="Source">
            <Seg
              options={[{ id: 'script', label: 'Script / transcript' }, { id: 'url', label: 'Webpage URL' }] as const}
              value={aiSource}
              onChange={setAiSource}
              small
            />
          </Field>
          {aiSource === 'url' ? (
            <Field label="Training / event page URL">
              <TextInput
                value={aiUrl}
                onChange={setAiUrl}
                placeholder="https://norcalsbdc.org/events/…"
                mono
              />
              <p className="ms-hint">
                The page is fetched and distilled into a social promo: hook, what it is,
                what you&apos;ll learn, then a register end card. Works best on SBDC training
                and event pages.
              </p>
            </Field>
          ) : (
            <Field label="Script or transcript">
              <TextArea
                value={script}
                onChange={setScript}
                rows={5}
                placeholder={'Paste your video script or an SRT transcript with timestamps…\n\nThe AI storyboards it into scenes: key lines become statements, numbers become animated stats, steps become agendas.'}
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
          )}
          <Field label="Creative direction (optional)">
            <TextInput
              value={scriptNotes}
              onChange={setScriptNotes}
              placeholder="e.g. punchy and energetic, YouTube B-roll pacing"
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
          <Field label="Apply brand colors to result">
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
            disabled={generating || (aiSource === 'url' ? !aiUrl.trim() : !script.trim())}
            onClick={handleGenerateScenes}
          >
            {generating ? (aiSource === 'url' ? 'Reading page…' : 'Storyboarding…') : '✦ Generate scenes'}
          </button>
          {scriptStatus && (
            <p className={`ms-status ${scriptStatus.ok ? 'is-ok' : 'is-err'}`}>{scriptStatus.msg}</p>
          )}
          <p className="ms-hint">
            Timestamped transcripts (SRT) pace scenes to the voiceover beats. On-screen words stay
            minimal — the AI distills, it doesn&apos;t transcribe.
          </p>
        </Section>

        {/* — Audio: voiceover + music bed with ducking — */}
        <Section title="Audio" badge="Mixed into MP4">
          <Field label="Voiceover">
            {voTrack ? (
              <div className="ms-audio-row">
                <span className="ms-audio-name">🎙 {voTrack.name}</span>
                <span className="ms-audio-dur">{voTrack.buffer.duration.toFixed(1)}s</span>
                <button className="ms-icon-btn is-danger" style={{ flex: 'none', padding: '4px 10px' }} onClick={() => removeAudio('vo')}>✕</button>
              </div>
            ) : (
              <button className="ms-file-btn" onClick={() => voFileRef.current?.click()}>
                ⬆ Upload voiceover (MP3 / WAV / M4A)
              </button>
            )}
            <input
              ref={voFileRef} type="file" accept="audio/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f, 'vo'); e.target.value = ''; }}
            />
          </Field>
          <Field label="Music bed">
            {musicTrack ? (
              <div className="ms-audio-row">
                <span className="ms-audio-name">♫ {musicTrack.name}</span>
                <span className="ms-audio-dur">{musicTrack.buffer.duration.toFixed(1)}s · loops</span>
                <button className="ms-icon-btn is-danger" style={{ flex: 'none', padding: '4px 10px' }} onClick={() => removeAudio('music')}>✕</button>
              </div>
            ) : (
              <button className="ms-file-btn" onClick={() => musicFileRef.current?.click()}>
                ⬆ Upload music track
              </button>
            )}
            <input
              ref={musicFileRef} type="file" accept="audio/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f, 'music'); e.target.value = ''; }}
            />
          </Field>
          {musicTrack && (
            <Field label="Music volume">
              <Slider
                value={doc.audioVolume}
                onChange={(v) => patchDoc({ audioVolume: v })}
                min={0} max={1} step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
              />
            </Field>
          )}
          {musicTrack && voTrack && (
            <Field label="Duck under voiceover">
              <Slider
                value={doc.duckLevel}
                onChange={(v) => patchDoc({ duckLevel: v })}
                min={0} max={1} step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
              />
              <p className="ms-hint">
                Music dips to this level while the VO plays, with 300ms ramps. The same
                curve drives preview volume and the export mixdown.
              </p>
            </Field>
          )}
          {audioError && <p className="ms-status is-err">{audioError}</p>}
          {!voTrack && !musicTrack && (
            <p className="ms-hint">
              Add a voiceover and/or a music bed — they play in the preview and get
              encoded into the exported MP4. Music loops to fit and fades out at the end.
            </p>
          )}
        </Section>

        {/* — Brand — */}
        <Section title="Brand" badge="Per-program">
          <Field label="Program name">
            <TextInput value={brandName} onChange={setBrandName} placeholder="e.g. Tech Futures Group" />
          </Field>
          <Field label="Brand colors">
            <ColorRow label="Background" value={brandColors.bg} onChange={(v) => setBrandColors((c) => ({ ...c, bg: v }))} />
            <ColorRow label="Text" value={brandColors.fg} onChange={(v) => setBrandColors((c) => ({ ...c, fg: v }))} />
            <ColorRow label="Accent" value={brandColors.accent} onChange={(v) => setBrandColors((c) => ({ ...c, accent: v }))} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="ms-btn" style={{ flex: 1, padding: '7px 8px' }} onClick={applyBrandToAll}>
                Apply to all scenes
              </button>
              <button className="ms-btn" style={{ flex: 1, padding: '7px 8px' }} onClick={clearCustomColors}>
                Reset to presets
              </button>
            </div>
            <p className="ms-hint">
              Each scene keeps its own copy of custom colors — tweak per scene via the rainbow swatch.
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
              Replaces the NorCal SBDC mark on end card scenes. PNG with transparency works best.
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
            <TextInput value={doc.watermark} onChange={(v) => patchDoc({ watermark: v })} placeholder={brandName || 'norcalsbdc.org'} />
          </Field>
        </Section>

        {/* — Project — */}
        <Section title="Project" badge="Autosaves locally">
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ms-btn" style={{ flex: 1, padding: '8px 6px' }} onClick={handleSaveProject}>
              ⬇ Save JSON
            </button>
            <button className="ms-btn" style={{ flex: 1, padding: '8px 6px' }} onClick={() => projectFileRef.current?.click()}>
              ⬆ Load
            </button>
            <button className="ms-btn" style={{ flex: 1, padding: '8px 6px' }} onClick={handleNewProject}>
              ✦ New
            </button>
          </div>
          <input
            ref={projectFileRef} type="file" accept=".json,application/json" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLoadProject(f); e.target.value = ''; }}
          />
          {projectStatus && <p className="ms-status is-ok">{projectStatus}</p>}
          <p className="ms-hint">
            The document autosaves to this browser as you edit and restores on reload.
            Media binaries aren&apos;t embedded — projects reference them by filename, and
            re-uploading a file with the same name relinks it everywhere it was used.
          </p>
        </Section>

        {/* — Fonts — */}
        <Section title="Fonts" badge="Typekit ready">
          <datalist id="ms-font-list-pro">
            {fontOptions.map((f) => (
              <option key={f.family} value={f.family}>{f.label}</option>
            ))}
          </datalist>
          <Field label="Heading font">
            <input
              className="ms-input"
              list="ms-font-list-pro"
              value={doc.fontHeading}
              onChange={(e) => patchDoc({ fontHeading: e.target.value })}
            />
          </Field>
          <Field label="Body font">
            <input
              className="ms-input"
              list="ms-font-list-pro"
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
              The site kit <code>{DEFAULT_KIT_ID}</code> (Proxima Nova + Proxima Sera) is already loaded.
              Paste another kit ID to pull in a program&apos;s own Adobe fonts.
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
                ⬇ Export MP4{voTrack || musicTrack ? ' (with audio)' : ''}
              </button>
              {mp4Supported === false && (
                <p className="ms-hint">
                  This browser doesn&apos;t support WebCodecs — use Chrome or Edge for MP4, or export WebM below.
                </p>
              )}
              <button className="ms-btn" disabled={!!exporting} onClick={() => handleExportVideo('webm')}>
                ⬇ Export WebM{voTrack || musicTrack ? ' (silent fallback)' : ''}
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
