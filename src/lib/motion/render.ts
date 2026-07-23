/* ═══════════════════════════════════════════════════════
   Motion Studio — deterministic canvas renderer
   renderFrame(ctx, doc, t) draws the exact frame for any
   global time t (ms). The live preview and the MP4
   exporter both call this, so what you see is what
   exports — pixel for pixel.

   All layout is done in "design units": the canvas is
   W×H from the aspect preset and sizes scale with
   u = min(W,H)/1080.
   ═══════════════════════════════════════════════════════ */

import {
  MotionDoc, Scene, AssetMap, VideoMap, resolveScheme, getAspect, sceneAt, ResolvedScheme,
} from './types';
import {
  clamp01, seg, easeOutQuint, easeOutExpo, easeOutBack, easeInCubic,
  easeInOutCubic, easeSettle, hashRandom,
} from './easings';

const TRANS_MS = 600;   // transition into a scene
const EXIT_MS = 450;    // content exit before a hard cut / loop end

// ── Font helpers ──────────────────────────────────────

function fontStr(weight: number, px: number, family: string, italic = false): string {
  return `${italic ? 'italic ' : ''}${weight} ${px}px "${family}", sans-serif`;
}

/** Set canvas letter-spacing (px). Chromium-only API, present everywhere
    the engine runs; measureText respects it, so wrapping stays correct. */
function setTracking(ctx: CanvasRenderingContext2D, px: number): void {
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
}

// ── Word/line layout ──────────────────────────────────

interface Word { text: string; width: number }
interface Line { words: Word[]; width: number }

function layoutLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
): Line[] {
  ctx.font = font;
  const spaceW = ctx.measureText(' ').width;
  const lines: Line[] = [];
  // Explicit \n forces a line break; each segment wraps independently.
  for (const segment of text.split('\n')) {
    const words = segment.split(/\s+/).filter(Boolean).map((w) => ({
      text: w,
      width: ctx.measureText(w).width,
    }));
    let cur: Word[] = [];
    let curW = 0;
    for (const w of words) {
      const next = curW === 0 ? w.width : curW + spaceW + w.width;
      if (next > maxWidth && cur.length > 0) {
        lines.push({ words: cur, width: curW });
        cur = [w];
        curW = w.width;
      } else {
        cur = [...cur, w];
        curW = next;
      }
    }
    if (cur.length) lines.push({ words: cur, width: curW });
  }
  return lines;
}

// ── Animated text block ───────────────────────────────

interface TextBlockOpts {
  text: string;
  font: string;
  px: number;
  lineHeight: number;       // multiplier
  color: string;
  maxWidth: number;
  x: number;                // anchor x
  y: number;                // top of block
  align: 'left' | 'center' | 'right';
  anim: Scene['anim'];
  t: number;                // scene-local time
  tStart: number;           // when this block starts animating
  accent: string;           // accent color (typewriter caret, wipe edge)
  /** Unit stagger override (ms). */
  stagger?: number;
  /** Letter-spacing in px (display serif tracks -0.05em). */
  tracking?: number;
}

/** Measure block height without drawing. */
function measureBlock(
  ctx: CanvasRenderingContext2D,
  o: Pick<TextBlockOpts, 'text' | 'font' | 'px' | 'lineHeight' | 'maxWidth' | 'tracking'>,
): { lines: Line[]; height: number } {
  if (o.tracking) setTracking(ctx, o.tracking);
  const lines = layoutLines(ctx, o.text, o.font, o.maxWidth);
  if (o.tracking) setTracking(ctx, 0);
  return { lines, height: lines.length * o.px * o.lineHeight };
}

/**
 * Draw a text block with the scene's animation preset.
 * Returns the block height. All animations resolve to the same
 * fully-visible layout once complete, so presets are hot-swappable.
 */
function drawTextBlock(ctx: CanvasRenderingContext2D, o: TextBlockOpts): number {
  // Tracking stays active through layout AND drawing so wrap points and
  // glyph positions agree; reset before returning.
  if (o.tracking) setTracking(ctx, o.tracking);
  const { lines, height } = measureBlock(ctx, { ...o, tracking: undefined });
  ctx.font = o.font;
  ctx.textBaseline = 'alphabetic';
  const spaceW = ctx.measureText(' ').width;
  const lh = o.px * o.lineHeight;
  const stagger = o.stagger ?? (o.anim === 'letter-cascade' ? 26 : o.anim === 'typewriter' ? 34 : 110);
  const unitDur = 620;

  // Flatten to units depending on preset
  const perLetter = o.anim === 'letter-cascade' || o.anim === 'typewriter';
  const perWord = o.anim === 'word-stagger';

  let unitIndex = 0;
  let lastCaret: { x: number; y: number } | null = null;
  let animating = false;

  lines.forEach((line, li) => {
    const baseY = o.y + li * lh + o.px * 0.82; // approx baseline
    let cx = o.align === 'center' ? o.x - line.width / 2 : o.align === 'right' ? o.x - line.width : o.x;

    // Whole-line presets: rise, blur-in, scale-in, wipe, mask-reveal
    if (!perLetter && !perWord) {
      const p = seg(o.t, o.tStart + li * 140, unitDur + 120, easeOutQuint);
      if (p < 1) animating = true;
      if (p <= 0) { unitIndex += line.words.length; return; }

      ctx.save();
      const lineX = o.align === 'center' ? o.x - line.width / 2 : o.align === 'right' ? o.x - line.width : o.x;

      if (o.anim === 'rise') {
        ctx.globalAlpha *= p;
        ctx.translate(0, (1 - p) * o.px * 0.45);
      } else if (o.anim === 'blur-in') {
        ctx.globalAlpha *= p;
        const blur = (1 - p) * o.px * 0.18;
        if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
      } else if (o.anim === 'scale-in') {
        const ps = seg(o.t, o.tStart + li * 140, unitDur + 160, easeOutBack);
        ctx.globalAlpha *= p;
        const cxx = o.align === 'center' ? o.x : lineX + line.width / 2;
        ctx.translate(cxx, baseY - o.px * 0.35);
        ctx.scale(0.9 + 0.1 * ps, 0.9 + 0.1 * ps);
        ctx.translate(-cxx, -(baseY - o.px * 0.35));
      } else if (o.anim === 'wipe') {
        ctx.beginPath();
        ctx.rect(lineX - o.px * 0.1, baseY - o.px, (line.width + o.px * 0.25) * p, o.px * 1.5);
        ctx.clip();
        if (p < 1) {
          // wipe edge
          ctx.fillStyle = o.accent;
          ctx.globalAlpha *= 0.9;
          ctx.fillRect(lineX + (line.width + o.px * 0.2) * p - o.px * 0.06, baseY - o.px * 0.9, o.px * 0.05, o.px * 1.15);
          ctx.globalAlpha /= 0.9;
        }
      } else if (o.anim === 'mask-reveal') {
        ctx.beginPath();
        ctx.rect(lineX - o.px * 0.2, baseY - o.px * 1.05, line.width + o.px * 0.4, lh * 1.24);
        ctx.clip();
        ctx.translate(0, (1 - p) * o.px * 1.15);
      }

      ctx.fillStyle = o.color;
      ctx.font = o.font;
      let wx = lineX;
      for (const w of line.words) {
        ctx.fillText(w.text, wx, baseY);
        wx += w.width + spaceW;
      }
      ctx.restore();
      unitIndex += line.words.length;
      return;
    }

    // Per-word / per-letter presets
    for (const w of line.words) {
      if (perWord) {
        const p = seg(o.t, o.tStart + unitIndex * stagger, unitDur, easeOutQuint);
        if (p < 1) animating = true;
        if (p > 0) {
          ctx.save();
          ctx.globalAlpha *= p;
          ctx.translate(0, (1 - p) * o.px * 0.5);
          ctx.fillStyle = o.color;
          ctx.font = o.font;
          ctx.fillText(w.text, cx, baseY);
          ctx.restore();
        }
        cx += w.width + spaceW;
        unitIndex += 1;
      } else {
        // per-letter
        let lx = cx;
        for (const ch of w.text) {
          const chW = ctx.measureText(ch).width;
          if (o.anim === 'typewriter') {
            const on = o.t >= o.tStart + unitIndex * stagger;
            if (!on) animating = true;
            if (on) {
              ctx.fillStyle = o.color;
              ctx.fillText(ch, lx, baseY);
              lastCaret = { x: lx + chW, y: baseY };
            }
          } else {
            const p = seg(o.t, o.tStart + unitIndex * stagger, 380, easeOutQuint);
            if (p < 1) animating = true;
            if (p > 0) {
              ctx.save();
              ctx.globalAlpha *= p;
              ctx.translate(0, (1 - p) * o.px * 0.35);
              ctx.fillStyle = o.color;
              ctx.fillText(ch, lx, baseY);
              ctx.restore();
            }
          }
          lx += chW;
          unitIndex += 1;
        }
        cx += w.width + spaceW;
      }
    }
  });

  // Typewriter caret — blinks while typing, then disappears
  if (o.anim === 'typewriter' && lastCaret !== null && animating) {
    const caret = lastCaret as { x: number; y: number };
    const blink = Math.floor(o.t / 350) % 2 === 0;
    if (blink) {
      ctx.fillStyle = o.accent;
      ctx.fillRect(caret.x + o.px * 0.08, caret.y - o.px * 0.78, o.px * 0.07, o.px * 0.92);
    }
  }

  if (o.tracking) setTracking(ctx, 0);
  return height;
}

// ── Small primitives ──────────────────────────────────

function drawKickerLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, color: string,
  t: number, tStart: number,
) {
  const p = seg(t, tStart, 500, easeOutQuint);
  if (p <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * p, Math.max(2, w * 0.06));
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string, font: string, color: string,
  x: number, y: number, spacing: number,
  align: 'left' | 'center' | 'right',
  alpha: number,
) {
  ctx.font = font;
  const chars = [...text.toUpperCase()];
  let total = 0;
  const widths = chars.map((c) => {
    const w = ctx.measureText(c).width;
    total += w + spacing;
    return w;
  });
  total -= spacing;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
  ctx.restore();
  return total;
}

// ── Image drawing (cover fit + Ken Burns) ─────────────

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number, H: number,
  progress: number,
  kenBurns: Scene['kenBurns'],
) {
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const cover = Math.max(W / iw, H / ih);

  let zoom = 1;
  let panX = 0;
  const p = easeInOutCubic(clamp01(progress));
  if (kenBurns === 'zoom-in') zoom = 1 + 0.09 * p;
  else if (kenBurns === 'zoom-out') zoom = 1.09 - 0.09 * p;
  else if (kenBurns === 'pan-left') { zoom = 1.12; panX = (0.5 - p) * 0.07 * W; }
  else if (kenBurns === 'pan-right') { zoom = 1.12; panX = (p - 0.5) * 0.07 * W; }

  const s = cover * zoom;
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, (W - dw) / 2 - panX, (H - dh) / 2, dw, dh);
}

/**
 * The 'card' image layout: an inset portrait frame in the upper-left of
 * the content area (roughly the top 55% of the frame), photo cover-fit
 * inside with a gentle Ken Burns, rising in on scene start. Text renders
 * below it via the normal template path in scheme colors.
 */
function drawFramedImage(
  ctx: CanvasRenderingContext2D,
  sc: SceneCtx,
  scene: Scene,
  t: number,
) {
  const a = scene.imageId ? sc.assets[scene.imageId] : undefined;
  if (!a) return;
  const { W, H, u } = sc;
  const frame = contentFrame(sc);
  const fh = H * 0.55;
  const fw = Math.min(fh * 0.8, frame.w * 0.85);
  const fx = frame.x;
  const fy = H * 0.14;
  const p = seg(t, 100, 700, easeOutQuint);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate(0, (1 - p) * 26 * u);
  ctx.beginPath();
  ctx.rect(fx, fy, fw, fh);
  ctx.clip();
  const img = a.img;
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const kb = easeInOutCubic(clamp01(t / Math.max(scene.duration, 1)));
  const zoom = scene.kenBurns === 'none' ? 1 : 1.03 + 0.06 * kb;
  const s = Math.max(fw / iw, fh / ih) * zoom;
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, fx + (fw - dw) / 2, fy + (fh - dh) / 2, dw, dh);
  ctx.restore();
}

/**
 * Cover-fit the current frame of an uploaded clip. The caller (preview
 * sync loop or the exporter's frame-exact seeker) is responsible for the
 * element showing the right frame for time t.
 */
function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  W: number, H: number,
) {
  const iw = video.videoWidth || 1;
  const ih = video.videoHeight || 1;
  const s = Math.max(W / iw, H / ih);
  const dw = iw * s;
  const dh = ih * s;
  try {
    ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } catch {
    // Frame not decodable yet — background fill already covers the canvas
  }
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  scene: Scene,
  scheme: ResolvedScheme,
) {
  const op = scene.overlayOpacity;
  if (scene.overlay === 'none' || op <= 0) return;
  ctx.save();
  if (scene.overlay === 'scrim') {
    ctx.globalAlpha = op;
    ctx.fillStyle = '#0a1220';
    ctx.fillRect(0, 0, W, H);
  } else if (scene.overlay === 'gradient-bottom') {
    const g = ctx.createLinearGradient(0, H * 0.28, 0, H);
    g.addColorStop(0, 'rgba(8,14,24,0)');
    g.addColorStop(1, `rgba(8,14,24,${op})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else if (scene.overlay === 'gradient-left') {
    const g = ctx.createLinearGradient(0, 0, W * 0.85, 0);
    g.addColorStop(0, `rgba(8,14,24,${op})`);
    g.addColorStop(1, 'rgba(8,14,24,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else if (scene.overlay === 'gradient-right') {
    const g = ctx.createLinearGradient(W * 0.15, 0, W, 0);
    g.addColorStop(0, 'rgba(8,14,24,0)');
    g.addColorStop(1, `rgba(8,14,24,${op})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else if (scene.overlay === 'brand') {
    ctx.globalAlpha = op;
    ctx.fillStyle = scheme.bg;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

// ── Scene backdrop graphics ───────────────────────────

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(255,255,255,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Weird-mode auto-pick pool: patterns strong enough to carry a scene.
    Kept frozen — appending would re-key the stable per-scene picks in
    existing projects. */
const WEIRD_POOL = [
  'spirograph', 'escher', 'dot-wave', 'wave-field', 'rounds', 'tfg-type',
] as const;

/**
 * Optional brand graphic drawn between the background fill and the text
 * layer, in the scene's scheme colors. The first four are the original
 * house backdrops; the rest are ported from the TFG brand Pattern
 * Studio. Deterministic in t like everything else here.
 *
 * `scene.weird` boosts opacity + motion, adds a slow wobble, and — when
 * the scene has no backdrop set — auto-picks a pattern from WEIRD_POOL
 * (stable per scene, keyed off the scene id).
 */
function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  sc: SceneCtx,
  scene: Scene,
  scheme: ResolvedScheme,
  t: number,
) {
  const weird = !!scene.weird;
  let backdrop: string = scene.backdrop ?? 'none';
  if (backdrop === 'none') {
    if (!weird) return;
    let h = 0;
    for (let i = 0; i < scene.id.length; i++) h = (h * 31 + scene.id.charCodeAt(i)) >>> 0;
    backdrop = WEIRD_POOL[h % WEIRD_POOL.length];
  }
  const { W, H, u } = sc;
  const fadeIn = seg(t, 0, 900);
  if (fadeIn <= 0) return;
  /** Opacity curve — weird mode roughly doubles every pattern alpha. */
  const A = (a: number) => Math.min(0.85, a * (weird ? 2.2 : 1));
  /** Animation speed multiplier. */
  const spd = weird ? 3 : 1;
  ctx.save();
  ctx.globalAlpha = fadeIn;
  if (weird) {
    // Slow drunken wobble around center; slight overscale hides corners.
    ctx.translate(W / 2, H / 2);
    ctx.rotate(Math.sin(t * 0.0004) * 0.03);
    ctx.scale(1.08, 1.08);
    ctx.translate(-W / 2, -H / 2);
  }

  if (backdrop === 'grid') {
    const step = 84 * u;
    // Kept quiet on purpose — even in weird mode the grid should read
    // as paper texture, not a feature.
    ctx.strokeStyle = withAlpha(scheme.accent, A(0.055));
    ctx.lineWidth = Math.max(1, u);
    ctx.beginPath();
    for (let x = (W % step) / 2; x <= W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = (H % step) / 2; y <= H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  } else if (backdrop === 'starburst') {
    // radial rays with a slow drift (the hero-stat starburst)
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.hypot(W, H) * 0.62;
    const rays = 24;
    const rot = t * 0.000025 * spd * Math.PI * 2; // ~1.5%/s — gentle drift
    for (let i = 0; i < rays; i++) {
      const a = rot + (i / rays) * Math.PI * 2;
      const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      g.addColorStop(0, withAlpha(scheme.accent, A(0.1 + (i % 3) * 0.05)));
      g.addColorStop(1, withAlpha(scheme.accent, 0));
      ctx.strokeStyle = g;
      ctx.lineWidth = (i % 4 === 0 ? 2.4 : 1.2) * u;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 26 * u, cy + Math.sin(a) * 26 * u);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }
  } else if (backdrop === 'ring') {
    // arc swoops — two big ring outlines settling in from the lower left
    const p = seg(t, 0, 1400);
    const cx = W * 0.12;
    const cy = H * 1.06;
    const grow = 0.92 + 0.08 * p;
    ctx.strokeStyle = withAlpha(scheme.accent, A(0.28));
    ctx.lineWidth = 5 * u;
    ctx.beginPath();
    ctx.arc(cx, cy, H * 0.78 * grow, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = withAlpha(scheme.accent, A(0.12));
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.arc(cx, cy, H * 1.02 * grow, 0, Math.PI * 2);
    ctx.stroke();
  } else if (backdrop === 'arc' && 'createConicGradient' in ctx) {
    // soft conic gradient band masked to a ring, low in the frame
    const cx = W * 0.46;
    const cy = H * 1.4;
    const outer = H * 1.05;
    const inner = H * 0.65;
    const g = (ctx as CanvasRenderingContext2D & {
      createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
    }).createConicGradient(Math.PI, cx, cy);
    g.addColorStop(0, withAlpha(scheme.accent, 0));
    g.addColorStop(0.05, withAlpha(scheme.accent, 0.03));
    g.addColorStop(0.12, withAlpha(scheme.accent, 0.07));
    g.addColorStop(0.2, withAlpha(scheme.accent, 0.11));
    g.addColorStop(0.27, withAlpha(scheme.accent, 0.13));
    g.addColorStop(0.34, withAlpha(scheme.accent, 0.09));
    g.addColorStop(0.42, withAlpha(scheme.accent, 0.04));
    g.addColorStop(0.5, withAlpha(scheme.accent, 0));
    g.addColorStop(1, withAlpha(scheme.accent, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
  } else if (backdrop === 'hero-ring' || backdrop === 'star' || backdrop === 'hero') {
    // ── Ported from the techfuturesgroup.org hero ──
    // "hero-ring": the thick sage conic-gradient ring band, sweeping in
    // on scene start the way the site loads. "star": the fine 24-line
    // starburst, slowly rotating (the site rotates it on scroll).
    // "hero": faint site grid + star + ring — the full hero treatment.
    if (backdrop === 'hero') {
      // 60px site grid at whisper opacity
      const step = 60 * u;
      ctx.strokeStyle = withAlpha(scheme.accent, A(0.03));
      ctx.lineWidth = Math.max(1, u * 0.8);
      ctx.beginPath();
      for (let x = (W % step) / 2; x <= W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = (H % step) / 2; y <= H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
    }
    // 'hero' used to layer the star too — star + ring together read as
    // too busy, so the composite is grid + ring only for now.
    if (backdrop === 'star') {
      // 24 hairline rays, green fading to transparent, gentle spin
      const cx = W / 2;
      const cy = H / 2;
      const len = Math.min(W, H) * 0.42;
      const rot = t * 0.00006 * spd * Math.PI * 2;
      ctx.lineWidth = Math.max(1, 1.1 * u);
      for (let i = 0; i < 24; i++) {
        const a = rot + (i / 24) * Math.PI * 2;
        const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        g.addColorStop(0, withAlpha(scheme.accent, A(0.3)));
        g.addColorStop(1, withAlpha(scheme.accent, 0));
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        ctx.stroke();
      }
    }
    if (backdrop === 'hero-ring' || backdrop === 'hero') {
      // Conic sage band, CSS: from 210deg, visible 10°–170°, masked to a
      // thick ring low in the frame. Sweep extent grows in over ~1.6s.
      const m = Math.max(W, H);
      const R = m * 0.425;
      const cx = W * 0.45;
      const cy = H - R * 0.08;
      const mid = R * 0.79;
      const band = R * 0.42;
      if ('createConicGradient' in ctx) {
        // Conic stops → [deg, r, g, b, alpha], from 210° (0° = up).
        // Palette matched to the live techfuturesgroup.org hero: black
        // through slate blue into a soft lavender-purple, grained below.
        const stops: Array<[number, number, number, number, number]> = [
          [0, 30, 36, 56, 0], [22, 40, 50, 78, 0.35], [55, 78, 88, 118, 0.6],
          [92, 150, 143, 165, 0.82], [125, 118, 100, 132, 0.55],
          [155, 66, 54, 82, 0.28], [178, 40, 34, 56, 0],
        ];
        const startRad = ((210 - 90) * Math.PI) / 180;
        const g = (ctx as CanvasRenderingContext2D & {
          createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
        }).createConicGradient(startRad, cx, cy);
        for (const [deg, r, gr, b, al] of stops) {
          g.addColorStop(deg / 360, `rgba(${r},${gr},${b},${A(al)})`);
        }
        g.addColorStop(1, 'rgba(30,36,56,0)');
        // Load-in: a pie-wedge clip grows from 0° to the full sweep.
        const lp = seg(t, 0, 1600, easeOutQuint);
        if (lp > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R * 1.25, startRad, startRad + (178 * lp * Math.PI) / 180);
          ctx.closePath();
          ctx.clip();
          ctx.beginPath();
          ctx.arc(cx, cy, mid + band / 2, 0, Math.PI * 2);
          ctx.arc(cx, cy, mid - band / 2, 0, Math.PI * 2, true);
          ctx.fillStyle = g;
          ctx.fill('evenodd');
          // Heavy grain inside the band, like the site hero.
          const pat = ctx.createPattern(getGrainTile() as CanvasImageSource, 'repeat');
          if (pat) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, mid + band / 2, 0, Math.PI * 2);
            ctx.arc(cx, cy, mid - band / 2, 0, Math.PI * 2, true);
            ctx.clip('evenodd');
            ctx.globalAlpha *= 0.09;
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
          }
          ctx.restore();
        }
      }
    }
  } else if (backdrop === 'split-left' || backdrop === 'split-right' || backdrop === 'split-bottom') {
    // Split composition (brand graphic element): a hard accent-color
    // block wipes in over ~700ms and holds half the frame. Pair with
    // align lower-left/lower-right so text sits on the base half.
    // Weird mode slashes the dividing edge into a diagonal.
    const wp = seg(t, 0, 700, easeOutQuint);
    if (wp > 0) {
      const skew = weird ? 0.11 : 0;
      ctx.fillStyle = scheme.accent;
      ctx.beginPath();
      if (backdrop === 'split-left') {
        const bw = W * 0.45 * wp;
        ctx.moveTo(0, 0);
        ctx.lineTo(bw + skew * H * 0.5, 0);
        ctx.lineTo(bw - skew * H * 0.5, H);
        ctx.lineTo(0, H);
      } else if (backdrop === 'split-right') {
        const bw = W * 0.45 * wp;
        ctx.moveTo(W, 0);
        ctx.lineTo(W - bw - skew * H * 0.5, 0);
        ctx.lineTo(W - bw + skew * H * 0.5, H);
        ctx.lineTo(W, H);
      } else {
        const bh = H * 0.42 * wp;
        ctx.moveTo(0, H);
        ctx.lineTo(0, H - bh + skew * W * 0.4);
        ctx.lineTo(W, H - bh - skew * W * 0.4);
        ctx.lineTo(W, H);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (backdrop === 'spirograph') {
    // Offset rings orbiting the center (Pattern Studio: spirograph)
    const cx = W / 2;
    const cy = H / 2;
    const m = Math.min(W, H);
    const rings = 12;
    ctx.lineWidth = Math.max(1, u);
    for (let i = 0; i < rings; i++) {
      const a = (i / rings) * Math.PI * 2 + t * 0.0001 * spd;
      const ox = cx + Math.cos(a) * m * 0.2;
      const oy = cy + Math.sin(a) * m * 0.2;
      ctx.strokeStyle = withAlpha(scheme.accent, A(0.1));
      ctx.beginPath(); ctx.arc(ox, oy, m * 0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = withAlpha(scheme.accent, A(0.06));
      ctx.beginPath(); ctx.arc(ox, oy, m * 0.225, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = withAlpha(scheme.accent, A(0.24));
    ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.arc(cx, cy, m * 0.15, 0, Math.PI * 2); ctx.stroke();
  } else if (backdrop === 'escher') {
    // Rotating triangle lattice (Pattern Studio: escher-impossible)
    const tri = 92 * u;
    const step = tri * 1.7;
    ctx.lineWidth = 1.5 * u;
    ctx.strokeStyle = scheme.accent;
    for (let x = step / 2; x < W + step; x += step) {
      for (let y = step / 2; y < H + step; y += step) {
        ctx.save();
        ctx.globalAlpha *= A(0.09 + 0.05 * Math.sin((x + y) * 0.004 / u));
        ctx.translate(x, y);
        ctx.rotate(t * 0.0001 * spd + x * 0.001 / u);
        ctx.beginPath();
        for (let i = 0; i <= 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(a) * tri * 0.5;
          const py = Math.sin(a) * tri * 0.5;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a1 = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2;
          ctx.moveTo(Math.cos(a1) * tri * 0.5, Math.sin(a1) * tri * 0.5);
          ctx.lineTo(Math.cos(a2) * tri * 0.3, Math.sin(a2) * tri * 0.3);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  } else if (backdrop === 'dot-wave') {
    // Breathing dot field (Pattern Studio: dot-wave)
    const spacing = 62 * u;
    const dot = 3.4 * u;
    ctx.fillStyle = scheme.accent;
    for (let x = spacing / 2; x < W; x += spacing) {
      for (let y = spacing / 2; y < H; y += spacing) {
        const w = Math.sin((x * 0.011) / u + t * 0.001 * spd) * Math.cos((y * 0.011) / u);
        ctx.globalAlpha = fadeIn * A(0.05 + Math.abs(w) * 0.2);
        ctx.beginPath();
        ctx.arc(x, y, dot * (1 + w * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = fadeIn;
  } else if (backdrop === 'wave-field') {
    // Stacked drifting sine lines (Pattern Studio: wave-field)
    const waves = 11;
    ctx.strokeStyle = scheme.accent;
    for (let w = 0; w < waves; w++) {
      ctx.lineWidth = (1 + (w % 3)) * u;
      ctx.globalAlpha = fadeIn * A(0.05 + (w / waves) * 0.14);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6 * u) {
        const y = H / 2
          + Math.sin((x * 0.02) / u + w * 0.5 + t * 0.001 * spd) * (44 - w * 3) * u
          + (w - (waves - 1) / 2) * 42 * u;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = fadeIn;
  } else if (backdrop === 'growth-bars') {
    // Up-and-to-the-right bar chart (Pattern Studio: growth-bars)
    const count = 14;
    const bw = (W * 0.84) / count;
    const sx = W * 0.08;
    const baseY = H * 0.96;
    ctx.strokeStyle = withAlpha(scheme.accent, A(0.05));
    ctx.lineWidth = Math.max(1, u);
    for (let i = 0; i <= 5; i++) {
      const y = baseY - (i / 5) * H * 0.6;
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(W * 0.92, y); ctx.stroke();
    }
    for (let i = 0; i < count; i++) {
      const p = i / (count - 1);
      const h = Math.pow(p, 1.5) * H * 0.52 + Math.sin(t * 0.001 * spd + i * 0.3) * 9 * u + 14 * u;
      const x = sx + i * bw;
      ctx.fillStyle = withAlpha(scheme.accent, A(0.08 + p * 0.2));
      ctx.fillRect(x + bw * 0.2, baseY - h, bw * 0.6, h);
      ctx.fillStyle = withAlpha(scheme.accent, A(0.45));
      ctx.fillRect(x + bw * 0.2, baseY - h - 2 * u, bw * 0.6, 2 * u);
    }
  } else if (backdrop === 'rounds') {
    // Concentric funding-round ripples (Pattern Studio: funding-rounds)
    const cx = W / 2;
    const cy = H / 2;
    const m = Math.min(W, H);
    const rounds = 7;
    ctx.lineWidth = 2 * u;
    for (let i = 0; i < rounds; i++) {
      const r = (i + 1) * m * 0.13 + Math.sin(t * 0.001 * spd + i) * 6 * u;
      ctx.strokeStyle = withAlpha(scheme.accent, A(0.2 * (1 - i / rounds)));
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (backdrop === 'tfg-type') {
    // Drifting rows of repeated TFG wordmark (Pattern Studio: text-cascade)
    const rows = 8;
    const rowH = H / rows;
    ctx.fillStyle = scheme.accent;
    for (let r = 0; r < rows; r++) {
      const px = (26 + r * 14) * u;
      ctx.font = `700 ${px}px ${sc.doc.fontBody}, sans-serif`;
      const word = 'TFG ';
      const tw = Math.max(1, ctx.measureText(word).width);
      const drift = ((t * 0.03 * spd * (r % 2 === 0 ? 1 : -1)) % tw + tw) % tw;
      ctx.globalAlpha = fadeIn * A(0.045 + r * 0.012);
      const y = rowH * r + rowH * 0.68;
      for (let x = -drift - tw; x < W + tw; x += tw) ctx.fillText(word, x, y);
    }
    ctx.globalAlpha = fadeIn;
  } else if (backdrop === 'dot-grid') {
    // The SBDC website's halftone motif, verbatim from the event-card
    // handoff: radial-gradient(accent@30% 5px, transparent 5px) on a
    // 44px grid offset 22px, as a static 520×520 patch in the top-right
    // corner. Never behind text.
    const step = 44 * u;
    const dotR = 5 * u;
    const span = 520 * u;
    ctx.fillStyle = withAlpha(scheme.accent, 0.3);
    ctx.globalAlpha = fadeIn;
    for (let x = W - span + 22 * u; x < W + dotR; x += step) {
      for (let y = 22 * u; y < span; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// ── Film grain ────────────────────────────────────────

let grainTile: HTMLCanvasElement | OffscreenCanvas | null = null;

function getGrainTile(): HTMLCanvasElement | OffscreenCanvas {
  if (grainTile) return grainTile;
  const size = 192;
  const c: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(size, size)
      : Object.assign(document.createElement('canvas'), { width: size, height: size });
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const data = g.createImageData(size, size);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(hashRandom(i) * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  grainTile = c;
  return c;
}

function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const tile = getGrainTile();
  const frame = Math.floor(t / 83); // ~12fps flicker
  const ox = Math.floor(hashRandom(frame * 2 + 1) * 192);
  const oy = Math.floor(hashRandom(frame * 2 + 2) * 192);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  for (let y = -oy; y < H; y += 192) {
    for (let x = -ox; x < W; x += 192) {
      ctx.drawImage(tile as CanvasImageSource, x, y);
    }
  }
  ctx.restore();
}

// ── Scene renderer ────────────────────────────────────

interface SceneCtx {
  W: number;
  H: number;
  u: number; // unit scale = min(W,H)/1080
  doc: MotionDoc;
  assets: AssetMap;
  videos: VideoMap;
}

function contentFrame(sc: SceneCtx) {
  const pad = 110 * sc.u;
  return { x: pad, y: pad, w: sc.W - pad * 2, h: sc.H - pad * 2 };
}

/** Exit factor: 0 = fully visible, 1 = fully exited. */
function exitP(scene: Scene, t: number, exitEnabled: boolean): number {
  if (!exitEnabled) return 0;
  return seg(t, scene.duration - EXIT_MS, EXIT_MS, easeInCubic);
}

/**
 * Draws one scene at local time t. Assumes the canvas transform is identity.
 */
function drawScene(
  ctx: CanvasRenderingContext2D,
  sc: SceneCtx,
  scene: Scene,
  t: number,
  exitEnabled: boolean,
) {
  const { W, H, u, doc, assets, videos } = sc;
  const scheme = resolveScheme(scene);
  // Any scene can carry a media background; the video wins if both are set.
  const isVideo = !!(scene.videoId && videos[scene.videoId]);
  const isImage = !isVideo && !!(scene.imageId && assets[scene.imageId]);

  const isCardImage = isImage && scene.imageLayout === 'card';

  // Background
  ctx.fillStyle = scheme.bg;
  ctx.fillRect(0, 0, W, H);
  if (isVideo) {
    drawVideoCover(ctx, videos[scene.videoId as string].video, W, H);
    drawOverlay(ctx, W, H, scene, scheme);
  } else if (isCardImage) {
    // Editorial card: scheme bg (+ backdrop) with an inset portrait frame.
    drawBackdrop(ctx, sc, scene, scheme, t);
    drawFramedImage(ctx, sc, scene, t);
  } else if (isImage) {
    drawImageCover(ctx, assets[scene.imageId as string].img, W, H, t / scene.duration, scene.kenBurns);
    drawOverlay(ctx, W, H, scene, scheme);
  } else {
    drawBackdrop(ctx, sc, scene, scheme, t);
  }

  // Foreground (text) — wrapped in exit fade
  const xp = exitP(scene, t, exitEnabled);
  ctx.save();
  ctx.globalAlpha = 1 - xp;
  ctx.translate(0, -xp * 26 * u);

  // Per-scene text scale (long URLs at 50% etc.) — scales type + text
  // layout only; backgrounds, overlays, and the watermark stay put.
  const ts = scene.textScale > 0 ? scene.textScale : 1;
  const tsc: SceneCtx = ts !== 1 ? { ...sc, u: sc.u * ts } : sc;

  // Full-bleed media scenes get white text (over footage/photo); card
  // image scenes keep scheme colors since text sits on the background.
  const overMedia = isVideo || (isImage && !isCardImage);
  const fg = overMedia ? '#ffffff' : scheme.fg;
  const muted = overMedia ? 'rgba(255,255,255,0.72)' : scheme.muted;
  // Legacy fixed accent only for scheme-less image scenes (old SBDC
  // projects); branded scenes keep their own accent over photos.
  const accent = overMedia && scene.template === 'image' && !scene.customScheme ? '#8FC5D9' : scheme.accent;
  const frame = contentFrame(tsc);
  const anchorX = scene.align === 'lower-left' ? frame.x
    : scene.align === 'lower-right' ? frame.x + frame.w
    : W / 2;
  const align: 'left' | 'center' | 'right' = scene.align === 'lower-left' ? 'left'
    : scene.align === 'lower-right' ? 'right'
    : 'center';

  // Editorial event-card designs replace title/agenda/calendar/endcard
  // when the doc opts in; media-backed scenes keep the classic path.
  const editorial = doc.sceneStyle === 'editorial' && !isVideo && !isImage;

  switch (scene.template) {
    case 'title':
    case 'image':
    case 'video':
      if (editorial && scene.template === 'title') drawEdTitle(ctx, tsc, scene, t);
      else drawTitleScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'disclaimer':
      drawDisclaimerScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'statement':
      drawStatementScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'stat':
      drawStatScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'list':
      if (editorial) drawEdAgenda(ctx, tsc, scene, t);
      else drawListScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'quote':
      drawQuoteScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'calendar':
      if (editorial) drawEdCalendar(ctx, tsc, scene, t);
      else drawCalendarScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'endcard':
      if (editorial) drawEdEndcard(ctx, tsc, scene, t);
      else drawEndcardScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
  }

  // Corner sign-off mark: an OFFICIAL raster brand mark registered as a
  // __corner-mark-* asset, drawn small and static in the upper-right of
  // the content frame. Light asset on dark/media backgrounds, dark on
  // light; skipped entirely when no matching asset is registered.
  if (scene.cornerMark) {
    const mark = (overMedia || isDark(scheme.bg)
      ? assets['__corner-mark-light']
      : assets['__corner-mark-dark']) ?? assets['__corner-mark'];
    if (mark) {
      const mp = seg(t, 150, 500, easeOutQuint);
      if (mp > 0) {
        const mh = 46 * u;
        const iw = mark.img.naturalWidth || 1;
        const ih = mark.img.naturalHeight || 1;
        const mw = (mh / ih) * iw;
        const mFrame = contentFrame(sc);
        ctx.save();
        ctx.globalAlpha *= mp * 0.9;
        ctx.drawImage(mark.img, mFrame.x + mFrame.w - mw, mFrame.y, mw, mh);
        ctx.restore();
      }
    }
  }

  // Watermark (constant, subtle)
  const wm = doc.watermark.trim();
  if (wm) {
    ctx.save();
    ctx.globalAlpha *= 0.4;
    ctx.font = fontStr(500, 16 * u, doc.fontBody);
    ctx.fillStyle = fg;
    ctx.textBaseline = 'alphabetic';
    const wmFrame = contentFrame(sc);
    const tw = ctx.measureText(wm.toUpperCase()).width + wm.length * 1.4 * u;
    drawSpacedText(ctx, wm, fontStr(500, 16 * u, doc.fontBody), fg, W - wmFrame.x - tw, H - 42 * u, 1.4 * u, 'left', 1);
    ctx.restore();
  }

  ctx.restore();

  if (doc.showGrain) drawGrain(ctx, W, H, t);
}

interface Palette {
  fg: string; muted: string; accent: string;
  anchorX: number; align: 'left' | 'center' | 'right';
  frame: { x: number; y: number; w: number; h: number };
}

/** Vertical anchor: returns top y for a stack of totalH. */
function stackTop(sc: SceneCtx, scene: Scene, totalH: number): number {
  const frame = contentFrame(sc);
  if (scene.align === 'center') return (sc.H - totalH) / 2;
  return frame.y + frame.h - totalH; // lower-*
}

function headingFamily(sc: SceneCtx, scene: Scene): string {
  return scene.serifTitle ? sc.doc.fontHeading : sc.doc.fontBody;
}

// — Title / Image-overlay scene —
function drawTitleScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc } = sc;
  const isVertical = sc.H > sc.W;
  const titlePx = (isVertical ? 76 : 88) * u;
  const subPx = 32 * u;
  const kickerPx = 24 * u;
  const family = headingFamily(sc, scene);
  const titleFont = fontStr(scene.serifTitle ? 400 : 300, titlePx, family);
  const maxW = p.frame.w * (p.align === 'center' ? 0.9 : 0.82);

  // Measure stack
  const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: titlePx, lineHeight: 1.14, maxWidth: maxW });
  const hasKicker = !!scene.kicker.trim();
  const hasSub = !!scene.subtitle.trim();
  const kickerH = hasKicker ? kickerPx + 26 * u : 0;
  const dividerH = hasSub ? 34 * u : 0;
  const subH = hasSub
    ? measureBlock(ctx, { text: scene.subtitle, font: fontStr(400, subPx, doc.fontBody), px: subPx, lineHeight: 1.45, maxWidth: maxW * 0.78 }).height + 6 * u
    : 0;
  const totalH = kickerH + titleH + dividerH + subH;
  let y = stackTop(sc, scene, totalH);

  // Kicker
  if (hasKicker) {
    const kp = seg(t, 60, 480, easeOutQuint);
    const lineW = 46 * u;
    const ky = y + kickerPx * 0.8;
    if (p.align === 'left') {
      drawKickerLine(ctx, p.anchorX, ky - kickerPx * 0.36, lineW, p.accent, t, 0);
      if (kp > 0) {
        ctx.save();
        ctx.globalAlpha *= kp;
        ctx.translate((1 - kp) * -14 * u, 0);
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX + lineW + 20 * u, ky, kickerPx * 0.17, 'left', 1);
        ctx.restore();
      }
    } else if (p.align === 'right') {
      drawKickerLine(ctx, p.anchorX - lineW, ky - kickerPx * 0.36, lineW, p.accent, t, 0);
      if (kp > 0) {
        ctx.save();
        ctx.globalAlpha *= kp;
        ctx.translate((1 - kp) * 14 * u, 0);
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX - lineW - 20 * u, ky, kickerPx * 0.17, 'right', 1);
        ctx.restore();
      }
    } else if (kp > 0) {
      ctx.save();
      ctx.globalAlpha *= kp;
      ctx.translate(0, (1 - kp) * 10 * u);
      drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX, ky, kickerPx * 0.17, 'center', 1);
      ctx.restore();
    }
    y += kickerH;
  }

  // Title
  drawTextBlock(ctx, {
    text: scene.title, font: titleFont, px: titlePx, lineHeight: 1.14,
    color: p.fg, maxWidth: maxW, x: p.anchorX, y,
    align: p.align, anim: scene.anim, t, tStart: hasKicker ? 260 : 80,
    accent: p.accent,
  });
  y += titleH;

  // Divider + subtitle
  if (hasSub) {
    const dp = seg(t, 900, 500, easeOutQuint);
    const dy = y + 16 * u;
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha *= dp;
      ctx.fillStyle = p.muted;
      const dw = 52 * u * dp;
      const dx = p.align === 'center' ? p.anchorX - dw / 2 : p.align === 'right' ? p.anchorX - dw : p.anchorX;
      ctx.fillRect(dx, dy, dw, Math.max(1.5, 2 * u));
      ctx.restore();
    }
    y += dividerH;
    drawTextBlock(ctx, {
      text: scene.subtitle, font: fontStr(400, subPx, doc.fontBody), px: subPx, lineHeight: 1.45,
      color: p.muted, maxWidth: maxW * 0.78, x: p.anchorX, y,
      align: p.align, anim: 'rise', t, tStart: 1050, accent: p.accent,
    });
  }
}

// — Statement scene: one big line —
function drawStatementScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u } = sc;
  const px = (sc.H > sc.W ? 88 : 108) * u;
  const family = headingFamily(sc, scene);
  const font = fontStr(scene.serifTitle ? 400 : 300, px, family);
  const maxW = p.frame.w * 0.92;
  const { height } = measureBlock(ctx, { text: scene.title, font, px, lineHeight: 1.12, maxWidth: maxW });
  const y = stackTop(sc, scene, height);
  drawTextBlock(ctx, {
    text: scene.title, font, px, lineHeight: 1.12, color: p.fg,
    maxWidth: maxW, x: p.anchorX, y, align: p.align,
    anim: scene.anim, t, tStart: 120, accent: p.accent,
  });
}

// — Stat scene: eased counter + label —
function drawStatScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc } = sc;
  const numPx = (sc.H > sc.W ? 200 : 230) * u;
  const labelPx = 34 * u;
  const family = headingFamily(sc, scene);
  const numFont = fontStr(scene.serifTitle ? 400 : 300, numPx, family);
  const labelFont = fontStr(400, labelPx, doc.fontBody);

  const countP = seg(t, 200, 1400, easeOutExpo);
  const value = Math.round(scene.statValue * countP);
  const text = `${scene.statPrefix}${value.toLocaleString('en-US')}${scene.statSuffix}`;

  const labelH = scene.attribution.trim()
    ? measureBlock(ctx, { text: scene.attribution, font: labelFont, px: labelPx, lineHeight: 1.45, maxWidth: p.frame.w * 0.66 }).height
    : 0;
  const numH = numPx * 1.02;
  const gap = 30 * u;
  const totalH = numH + (labelH ? gap + labelH : 0);
  let y = stackTop(sc, scene, totalH);

  const fadeP = seg(t, 100, 500, easeOutQuint);
  ctx.save();
  ctx.globalAlpha *= fadeP;
  ctx.translate(0, (1 - fadeP) * 30 * u);
  ctx.font = numFont;
  ctx.fillStyle = p.fg;
  ctx.textBaseline = 'alphabetic';
  const numW = ctx.measureText(text).width;
  const numX = p.align === 'center' ? p.anchorX - numW / 2 : p.align === 'right' ? p.anchorX - numW : p.anchorX;
  ctx.fillText(text, numX, y + numPx * 0.84);
  ctx.restore();
  y += numH;

  if (labelH) {
    y += gap;
    // accent divider
    const dp = seg(t, 1000, 450, easeOutQuint);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha *= dp;
      ctx.fillStyle = p.accent;
      const dw = 56 * u * dp;
      const ddx = p.align === 'center' ? p.anchorX - dw / 2 : p.align === 'right' ? p.anchorX - dw : p.anchorX;
      ctx.fillRect(ddx, y - gap / 2, dw, Math.max(2, 2.4 * u));
      ctx.restore();
    }
    drawTextBlock(ctx, {
      text: scene.attribution, font: labelFont, px: labelPx, lineHeight: 1.45,
      color: p.muted, maxWidth: p.frame.w * 0.66, x: p.anchorX, y,
      align: p.align, anim: 'rise', t, tStart: 1100, accent: p.accent,
    });
  }
}

// — List / agenda scene —
function drawListScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc } = sc;
  const items = scene.body.split('\n').map((s) => s.trim()).filter(Boolean);
  const kickerPx = 24 * u;
  const itemPx = (sc.H > sc.W ? 44 : 50) * u;
  const family = headingFamily(sc, scene);
  const itemFont = fontStr(scene.serifTitle ? 400 : 300, itemPx, family);
  const rowH = itemPx * 1.9;
  const hasKicker = !!scene.kicker.trim();
  const kickerH = hasKicker ? kickerPx + 44 * u : 0;
  const totalH = kickerH + items.length * rowH - (items.length ? itemPx * 0.55 : 0);
  let y = stackTop(sc, scene, totalH);

  if (hasKicker) {
    const kp = seg(t, 60, 480, easeOutQuint);
    const ky = y + kickerPx * 0.8;
    const lineW = 46 * u;
    if (kp > 0) {
      if (p.align === 'left') {
        drawKickerLine(ctx, p.anchorX, ky - kickerPx * 0.36, lineW, p.accent, t, 0);
        ctx.save();
        ctx.globalAlpha *= kp;
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX + lineW + 20 * u, ky, kickerPx * 0.17, 'left', 1);
        ctx.restore();
      } else if (p.align === 'right') {
        drawKickerLine(ctx, p.anchorX - lineW, ky - kickerPx * 0.36, lineW, p.accent, t, 0);
        ctx.save();
        ctx.globalAlpha *= kp;
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX - lineW - 20 * u, ky, kickerPx * 0.17, 'right', 1);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha *= kp;
        ctx.translate(0, (1 - kp) * 10 * u);
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX, ky, kickerPx * 0.17, 'center', 1);
        ctx.restore();
      }
    }
    y += kickerH;
  }

  items.forEach((item, i) => {
    const tStart = 350 + i * 320;
    const ip = seg(t, tStart, 620, easeOutQuint);
    const rowY = y + i * rowH;
    if (ip <= 0) return;

    ctx.save();
    ctx.globalAlpha *= ip;
    ctx.translate(0, (1 - ip) * 22 * u);
    ctx.font = itemFont;
    ctx.fillStyle = p.fg;
    if (p.align === 'left') {
      ctx.fillText(item, p.anchorX, rowY + itemPx * 0.78);
    } else {
      const itemW = ctx.measureText(item).width;
      const startX = p.align === 'right' ? p.anchorX - itemW : p.anchorX - itemW / 2;
      ctx.fillText(item, startX, rowY + itemPx * 0.78);
    }
    ctx.restore();
  });
}

// — Quote scene —
function drawQuoteScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc } = sc;
  const quotePx = (sc.H > sc.W ? 60 : 68) * u;
  const attrPx = 26 * u;
  const family = headingFamily(sc, scene);
  const quoteFont = fontStr(scene.serifTitle ? 400 : 300, quotePx, family, scene.serifTitle);
  const maxW = p.frame.w * 0.84;
  const text = `“${scene.title}”`;

  const { height: qH } = measureBlock(ctx, { text, font: quoteFont, px: quotePx, lineHeight: 1.28, maxWidth: maxW });
  const hasAttr = !!scene.attribution.trim();
  const attrH = hasAttr ? attrPx + 46 * u : 0;
  const totalH = qH + attrH;
  let y = stackTop(sc, scene, totalH);

  drawTextBlock(ctx, {
    text, font: quoteFont, px: quotePx, lineHeight: 1.28, color: p.fg,
    maxWidth: maxW, x: p.anchorX, y, align: p.align,
    anim: scene.anim, t, tStart: 120, accent: p.accent,
  });
  y += qH;

  if (hasAttr) {
    const ap = seg(t, 1100, 550, easeOutQuint);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= ap;
      ctx.translate(0, (1 - ap) * 12 * u);
      const ay = y + 46 * u;
      ctx.font = fontStr(600, attrPx, doc.fontBody);
      ctx.fillStyle = p.accent;
      const dash = '— ';
      const full = dash + scene.attribution;
      const w = ctx.measureText(full).width;
      const ax = p.align === 'center' ? p.anchorX - w / 2 : p.align === 'right' ? p.anchorX - w : p.anchorX;
      ctx.fillText(full, ax, ay);
      ctx.restore();
    }
  }
}

// — Disclaimer scene: kicker + fine-print paragraph —
function drawDisclaimerScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc } = sc;
  const kickerPx = 24 * u;
  const bodyPx = (sc.H > sc.W ? 26 : 28) * u;
  const bodyFont = fontStr(400, bodyPx, doc.fontBody);
  const maxW = p.frame.w * (p.align === 'center' ? 0.72 : 0.66);
  const hasKicker = !!scene.kicker.trim();
  const kickerH = hasKicker ? kickerPx + 40 * u : 0;
  const { height: bodyH } = measureBlock(ctx, {
    text: scene.body, font: bodyFont, px: bodyPx, lineHeight: 1.62, maxWidth: maxW,
  });
  const totalH = kickerH + bodyH;
  let y = stackTop(sc, scene, totalH);

  if (hasKicker) {
    const kp = seg(t, 60, 480, easeOutQuint);
    const ky = y + kickerPx * 0.8;
    const lineW = 46 * u;
    if (kp > 0) {
      ctx.save();
      ctx.globalAlpha *= kp;
      ctx.translate(0, (1 - kp) * 10 * u);
      if (p.align === 'left') {
        drawKickerLine(ctx, p.anchorX, ky - kickerPx * 0.36, lineW, p.accent, t, 0);
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX + lineW + 20 * u, ky, kickerPx * 0.17, 'left', 1);
      } else if (p.align === 'right') {
        drawKickerLine(ctx, p.anchorX - lineW, ky - kickerPx * 0.36, lineW, p.accent, t, 0);
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX - lineW - 20 * u, ky, kickerPx * 0.17, 'right', 1);
      } else {
        drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, p.anchorX, ky, kickerPx * 0.17, 'center', 1);
      }
      ctx.restore();
    }
    y += kickerH;
  }

  drawTextBlock(ctx, {
    text: scene.body, font: bodyFont, px: bodyPx, lineHeight: 1.62,
    color: p.muted, maxWidth: maxW, x: p.anchorX, y,
    align: p.align, anim: scene.anim, t, tStart: hasKicker ? 380 : 100,
    accent: p.accent,
  });
}

// — Calendar / save-the-date scene —
// A flat date tile (near-square corners, short month label over a big
// day-of-month number) beside the event title and time; a short thick
// rule sits under the title. Field mapping: statValue = day number,
// statSuffix = month label, kicker = small caps label, title = event
// title, subtitle = time line, attribution = optional link/location
// line. The rule color comes from scene.accentRule (SBDC berry) and
// falls back to the scheme accent.
function drawCalendarScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc } = sc;
  const scheme = resolveScheme(scene);
  const isVertical = sc.H > sc.W;
  const frame = p.frame;

  // Date tile
  const tileW = (isVertical ? 320 : 290) * u;
  const tileH = (isVertical ? 330 : 310) * u;
  const radius = 6 * u; // near-square corners per the design system
  const monthPx = 26 * u;
  const dayPx = 158 * u;

  // Text column (beside the tile; below it on vertical canvases)
  const kickerPx = 22 * u;
  const titlePx = (isVertical ? 56 : 64) * u;
  const subPx = 30 * u;
  const family = headingFamily(sc, scene);
  const titleFont = fontStr(scene.serifTitle ? 400 : 300, titlePx, family);
  const gap = 70 * u;
  const textX = isVertical ? frame.x : frame.x + tileW + gap;
  const maxW = isVertical ? frame.w : frame.w - tileW - gap;

  const hasKicker = !!scene.kicker.trim();
  const hasSub = !!scene.subtitle.trim();
  const hasAttr = !!scene.attribution.trim();
  const kickerH = hasKicker ? kickerPx + 30 * u : 0;
  const { height: titleH } = measureBlock(ctx, {
    text: scene.title, font: titleFont, px: titlePx, lineHeight: 1.14, maxWidth: maxW,
  });
  const ruleH = 46 * u;
  const subH = hasSub ? subPx * 1.55 : 0;
  const attrH = hasAttr ? subPx * 1.5 : 0;
  const textH = kickerH + titleH + ruleH + subH + attrH;

  const stackGap = 60 * u;
  const totalH = isVertical ? tileH + stackGap + textH : Math.max(tileH, textH);
  const topY = stackTop(sc, scene, totalH);

  // Tile
  const tp = seg(t, 60, 600, easeOutQuint);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha *= tp;
    ctx.translate(0, (1 - tp) * 24 * u);
    const tx = frame.x;
    const ty = topY;
    ctx.beginPath();
    // roundRect is everywhere the engine runs (Chrome 99+, the export
    // harness targets chrome110).
    ctx.roundRect(tx, ty, tileW, tileH, radius);
    // Flat panel: a soft fg lift with a hairline edge — no shadows.
    ctx.fillStyle = withAlpha(scheme.fg, 0.055);
    ctx.fill();
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = Math.max(1, u);
    ctx.stroke();

    // Month label, small caps in accent
    const month = scene.statSuffix.trim().toUpperCase();
    if (month) {
      drawSpacedText(
        ctx, month, fontStr(700, monthPx, doc.fontBody), p.accent,
        tx + tileW / 2, ty + 66 * u, monthPx * 0.2, 'center', 1,
      );
    }
    // Big day number
    const day = String(Math.round(scene.statValue));
    ctx.font = fontStr(300, dayPx, doc.fontBody);
    ctx.fillStyle = p.fg;
    ctx.textBaseline = 'alphabetic';
    const dw = ctx.measureText(day).width;
    ctx.fillText(day, tx + (tileW - dw) / 2, ty + tileH * 0.58 + dayPx * 0.36);
    ctx.restore();
  }

  // Text column — vertically centered against the tile in row layout
  let y = isVertical
    ? topY + tileH + stackGap
    : topY + Math.max(0, (tileH - textH) / 2);

  if (hasKicker) {
    const kp = seg(t, 350, 480, easeOutQuint);
    if (kp > 0) {
      ctx.save();
      ctx.globalAlpha *= kp;
      ctx.translate(0, (1 - kp) * 10 * u);
      drawSpacedText(
        ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent,
        textX, y + kickerPx * 0.8, kickerPx * 0.17, 'left', 1,
      );
      ctx.restore();
    }
    y += kickerH;
  }

  drawTextBlock(ctx, {
    text: scene.title, font: titleFont, px: titlePx, lineHeight: 1.14,
    color: p.fg, maxWidth: maxW, x: textX, y,
    align: 'left', anim: scene.anim, t, tStart: 480, accent: p.accent,
  });
  y += titleH;

  // Short thick rule under the title (design system: 4–5px, ~56–72px)
  const rp = seg(t, 820, 450, easeOutQuint);
  if (rp > 0) {
    ctx.fillStyle = scene.accentRule?.trim() || p.accent;
    ctx.fillRect(textX, y + 18 * u, 64 * u * rp, Math.max(4, 4.5 * u));
  }
  y += ruleH;

  if (hasSub) {
    drawTextBlock(ctx, {
      text: scene.subtitle, font: fontStr(600, subPx, doc.fontBody), px: subPx,
      lineHeight: 1.4, color: p.fg, maxWidth: maxW, x: textX, y,
      align: 'left', anim: 'rise', t, tStart: 950, accent: p.accent,
    });
    y += subH;
  }

  if (hasAttr) {
    drawTextBlock(ctx, {
      text: scene.attribution, font: fontStr(400, subPx * 0.86, doc.fontBody), px: subPx * 0.86,
      lineHeight: 1.4, color: p.muted, maxWidth: maxW, x: textX, y,
      align: 'left', anim: 'rise', t, tStart: 1100, accent: p.accent,
    });
  }
}

/* ═══ Editorial event cards (doc.sceneStyle === 'editorial') ═══════
   Pixel-exact port of the NorCal SBDC event-card handoff (canvas-HTML
   reference at 1080×1080). All dimensions are reference-px × u, copied
   verbatim — do not round or "improve". The palette is the design
   system's own; the scene's scheme + layout controls pick the VARIANT:
   · calendar: navy → 1a day sheet · navy + lower-left/right → 1d
     editorial columns · paper → 1b paper day sheet · cream → 1c split
   · title: navy → 2a editorial · navy + dot-grid → 2c · light → 2b
   · list (agenda): navy → 3a list · cream → 3b numbered · paper → 3c
     navy header + sheet with pool-pale date tiles
   · endcard: navy → 4a centered · cobalt → 4b · light → 4c tagline
   Kickers may carry a right-hand label after "|" ("THIS MONTH | FREE
   TRAININGS"). Agenda body lines: "12 AUG | Title | Tue · 10:00 AM ·
   Online". Media-backed scenes always use the classic renderers. */

const ED = {
  navy: '#0f1c2d', cobalt: '#1b5faf', pool: '#8fc5d9', poolPale: '#dcecf2',
  paper: '#fdfdfd', cream: '#f5f1e8', slate: '#2c3240', slateLight: '#687080',
  berry: '#c23c3c',
  hairDark: 'rgba(255,255,255,0.18)',   // #ffffff2e
  hairLight: 'rgba(15,28,45,0.16)',     // #0f1c2d29
};

/** Brand-aware editorial tones. SBDC preset scenes keep the exact ED
    constants; scenes with a customScheme derive the same roles from
    their own colors so NorCal navy/pool never leak into another
    brand's cards (standalone Promo Studio explorations). */
function edTones(scene: Scene, scheme: ReturnType<typeof resolveScheme>) {
  if (!scene.customScheme) {
    return {
      ink: ED.navy, inkMuted: ED.slateLight, inkSoft: ED.slate,
      accent: ED.pool, accentInk: ED.cobalt,
      band: ED.navy, bandFg: ED.paper, bandMuted: ED.pool,
      tile: ED.poolPale, lightOnDark: ED.paper,
    };
  }
  return {
    ink: scheme.fg, inkMuted: withAlpha(scheme.fg, 0.55), inkSoft: withAlpha(scheme.fg, 0.8),
    accent: scheme.accent, accentInk: scheme.accent,
    band: scheme.fg, bandFg: scheme.bg, bandMuted: withAlpha(scheme.bg, 0.72),
    tile: withAlpha(scheme.fg, 0.08), lightOnDark: scheme.fg,
  };
}

const MONTH_FULL: Record<string, string> = {
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April', MAY: 'May',
  JUN: 'June', JUL: 'July', AUG: 'August', SEP: 'September', SEPT: 'September',
  OCT: 'October', NOV: 'November', DEC: 'December',
};

/** Cream vs paper: the warm tint picks the cream variants. */
function isWarmLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) - (n & 255) > 6;
}

/** Cobalt vs navy among dark backgrounds. */
function isBlueVivid(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  return (n & 255) - ((n >> 16) & 255) > 80;
}

function edRuleColor(scene: Scene): string {
  return scene.accentRule?.trim() || ED.berry;
}

function weekdayOf(text: string): string | null {
  const m = text.trim().match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i);
  return m ? m[1] : null;
}

/** Time line without its leading weekday ("Tuesday · 10:00 …" → "10:00 …"). */
function stripWeekday(text: string): string {
  return text.replace(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s*·\s*/i, '');
}

/** Kicker with slide-up settle. Style: nova 800, caps, .13em tracking. */
function edKicker(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, text: string, px: number,
  color: string, x: number, y: number, align: 'left' | 'center' | 'right',
  t: number, tStart: number,
) {
  if (!text) return;
  const p = seg(t, tStart, 600, easeSettle);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate(0, (1 - p) * 16 * sc.u);
  drawSpacedText(ctx, text, fontStr(800, px, sc.doc.fontBody), color, x, y, px * 0.13, align, 1);
  ctx.restore();
}

/** One line of display serif (weight 400, -.05em). Returns width drawn. */
function edSera(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, text: string, px: number,
  color: string, x: number, baselineY: number, align: 'left' | 'center' | 'right' = 'left',
): number {
  ctx.font = fontStr(400, px, sc.doc.fontHeading);
  setTracking(ctx, -0.05 * px);
  const w = ctx.measureText(text).width;
  const dx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, dx, baselineY);
  setTracking(ctx, 0);
  return w;
}

function edSeraWidth(ctx: CanvasRenderingContext2D, sc: SceneCtx, text: string, px: number): number {
  ctx.font = fontStr(400, px, sc.doc.fontHeading);
  setTracking(ctx, -0.05 * px);
  const w = ctx.measureText(text).width;
  setTracking(ctx, 0);
  return w;
}

/** The big day number: settle-in with the allowed 1.04→1.0 scale. */
function edDay(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, day: string, px: number,
  color: string, x: number, baselineY: number, t: number, tStart: number,
  align: 'left' | 'center' | 'right' = 'left',
) {
  const p = seg(t, tStart, 700, easeSettle);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p;
  const s = 1.04 - 0.04 * p;
  ctx.translate(x, baselineY);
  ctx.scale(s, s);
  edSera(ctx, sc, day, px, color, 0, 0, align);
  ctx.restore();
}

/** The berry rule: 120×8, grows in. */
function edRule(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene,
  x: number, y: number, t: number, tStart: number, align: 'left' | 'center' = 'left',
) {
  const p = seg(t, tStart, 500, easeSettle);
  if (p <= 0) return;
  const w = 120 * sc.u * p;
  ctx.fillStyle = edRuleColor(scene);
  ctx.fillRect(align === 'center' ? x - w / 2 : x, y, w, 8 * sc.u);
}

/** Nova text line. Returns width. */
function edNova(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, text: string, weight: number,
  px: number, color: string, x: number, baselineY: number,
  align: 'left' | 'center' | 'right' = 'left',
): number {
  ctx.font = fontStr(weight, px, sc.doc.fontBody);
  const w = ctx.measureText(text).width;
  const dx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, dx, baselineY);
  return w;
}

function edLogoAsset(sc: SceneCtx, dark: boolean) {
  return dark
    ? sc.assets['__logo-brand-light'] ?? sc.assets['__logo-white']
    : sc.assets['__logo-brand-dark'] ?? sc.assets['__logo-blue'];
}

function edDrawLogo(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, dark: boolean,
  x: number, y: number, h: number, align: 'left' | 'center' = 'left',
): void {
  const logo = edLogoAsset(sc, dark);
  if (!logo) return;
  const iw = logo.img.naturalWidth || 1;
  const ih = logo.img.naturalHeight || 1;
  const w = (h / ih) * iw;
  ctx.drawImage(logo.img, align === 'center' ? x - w / 2 : x, y, w, h);
}

/** Footer: hairline, logo left, url right. Returns the hairline y. */
function edFooter(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, o: {
    top: number; left: number; right: number; dark: boolean;
    url: string; logoH: number; t: number; tStart: number;
    hairColor?: string; hairH?: number; padTop?: number;
    urlPx?: number; urlColor?: string;
  },
) {
  const { u } = sc;
  const p = seg(o.t, o.tStart, 600, easeSettle);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.fillStyle = o.hairColor ?? (o.dark ? ED.hairDark : ED.hairLight);
  ctx.fillRect(o.left, o.top, o.right - o.left, o.hairH ?? Math.max(1, u));
  const pad = o.padTop ?? 40 * u;
  const cy = o.top + pad + o.logoH / 2;
  edDrawLogo(ctx, sc, o.dark, o.left, cy - o.logoH / 2, o.logoH);
  if (o.url) {
    edNova(ctx, sc, o.url, 700, (o.urlPx ?? 26) * u,
      o.urlColor ?? (o.dark ? ED.paper : ED.navy), o.right, cy + 9 * u, 'right');
  }
  ctx.restore();
}

/** Rise+settle wrapper for a block draw. */
function edEnter(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, t: number, tStart: number,
  draw: () => void,
) {
  const p = seg(t, tStart, 600, easeSettle);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate(0, (1 - p) * 22 * sc.u);
  draw();
  ctx.restore();
}

// — SAVE THE DATE (calendar template, editorial) —
function drawEdCalendar(ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number) {
  const { W, H, u } = sc;
  const scheme = resolveScheme(scene);
  const dark = isDark(scheme.bg);
  const L = 90 * u, R = W - 90 * u, T = 90 * u, B = H - 90 * u;
  const tones = edTones(scene, scheme);
  const day = String(Math.round(scene.statValue));
  const mon = scene.statSuffix.trim().toUpperCase();
  const [kl, kr] = scene.kicker.split('|').map((s) => s.trim());
  const wd = weekdayOf(scene.subtitle);

  if (dark && (scene.align === 'lower-left' || scene.align === 'lower-right')) {
    // ── 1d EDITORIAL COLUMNS — NAVY ──
    edKicker(ctx, sc, scene.kicker.replace('|', ' · '), 22 * u, scheme.accent, L, T + 18 * u, 'left', t, 60);
    const footTop = B - (Math.max(1, u) + 40 * u + 64 * u);
    const colTop = T + 22 * u + 70 * u;
    const colBottom = footTop - 64 * u;
    const dayPx = 340 * u;
    const colW = Math.max(edSeraWidth(ctx, sc, day, dayPx), 150 * u);
    edEnter(ctx, sc, t, 150, () => {
      drawSpacedText(ctx, mon, fontStr(800, 22 * u, sc.doc.fontBody), scheme.fg, L, colTop + 18 * u, 22 * u * 0.13, 'left', 1);
      edDay(ctx, sc, day, dayPx, scheme.fg, L, colTop + 18 * u + 28 * u + dayPx * 0.82, t, 150);
    });
    // column hairline
    const hx = L + colW + 70 * u;
    ctx.fillStyle = ED.hairDark;
    ctx.fillRect(hx, colTop, Math.max(1, u), colBottom - colTop);
    // right column, bottom-aligned
    const tx = hx + 70 * u;
    const maxW = R - tx;
    const titleFont = fontStr(400, 88 * u, sc.doc.fontHeading);
    const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 88 * u, lineHeight: 0.94, maxWidth: maxW, tracking: -0.05 * 88 * u });
    const { height: metaH } = measureBlock(ctx, { text: scene.subtitle, font: fontStr(650, 30 * u, sc.doc.fontBody), px: 30 * u, lineHeight: 1.35, maxWidth: maxW });
    const blockH = 8 * u + 40 * u + titleH + 30 * u + metaH;
    let y = colBottom - 12 * u - blockH;
    edRule(ctx, sc, scene, tx, y, t, 350);
    y += 8 * u + 40 * u;
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 88 * u, lineHeight: 0.94, color: scheme.fg,
      maxWidth: maxW, x: tx, y, align: 'left', anim: 'rise', t, tStart: 420,
      accent: scheme.accent, tracking: -0.05 * 88 * u,
    });
    y += titleH + 30 * u;
    drawTextBlock(ctx, {
      text: scene.subtitle, font: fontStr(650, 30 * u, sc.doc.fontBody), px: 30 * u, lineHeight: 1.35,
      color: tones.accent, maxWidth: maxW, x: tx, y, align: 'left', anim: 'rise', t, tStart: 620, accent: scheme.accent,
    });
    edFooter(ctx, sc, { top: footTop, left: L, right: R, dark: true, url: scene.attribution.trim(), logoH: 64 * u, t, tStart: 750, urlColor: tones.lightOnDark });
  } else if (dark) {
    // ── 1a DAY SHEET — NAVY ──
    edKicker(ctx, sc, kl ?? scene.kicker, 22 * u, scheme.accent, L, T + 18 * u, 'left', t, 60);
    const right = kr || (wd ? `${mon} · ${wd.slice(0, 3)}` : mon);
    edKicker(ctx, sc, right, 22 * u, withAlpha(scheme.fg, 0.4), R, T + 18 * u, 'right', t, 60);
    const dayPx = 560 * u;
    const dayTop = T + 22 * u + 64 * u;
    edDay(ctx, sc, day, dayPx, scheme.fg, L, dayTop + dayPx * 0.8, t, 150);
    edRule(ctx, sc, scene, L, dayTop + dayPx * 0.82 + 56 * u, t, 400);
    // bottom block
    const meta = stripWeekday(scene.subtitle);
    const titleFont = fontStr(400, 76 * u, sc.doc.fontHeading);
    const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 76 * u, lineHeight: 0.96, maxWidth: R - L, tracking: -0.05 * 76 * u });
    let y = B - (titleH + 26 * u + 30 * u * 1.2);
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 76 * u, lineHeight: 0.96, color: scheme.fg,
      maxWidth: R - L, x: L, y, align: 'left', anim: 'rise', t, tStart: 500,
      accent: scheme.accent, tracking: -0.05 * 76 * u,
    });
    y += titleH + 26 * u;
    edEnter(ctx, sc, t, 680, () => edNova(ctx, sc, meta, 650, 30 * u, scheme.accent, L, y + 30 * u * 0.8));
  } else if (isWarmLight(scheme.bg)) {
    // ── 1c SPLIT — CREAM + NAVY BAND ──
    const bandH = 64 * u + 70 * u * 0.96 + 22 * u + 34 * u + 80 * u;
    const bandTop = H - bandH;
    edKicker(ctx, sc, kl ?? scene.kicker, 22 * u, scheme.accent, L, T + 18 * u, 'left', t, 60);
    const dayPx = 470 * u;
    const rowTop = T + 22 * u + 40 * u;
    const baseline = rowTop + dayPx * 0.82;
    edDay(ctx, sc, day, dayPx, tones.ink, L, baseline, t, 150);
    const dayW = edSeraWidth(ctx, sc, day, dayPx);
    const monTc = mon.charAt(0) + mon.slice(1).toLowerCase();
    edEnter(ctx, sc, t, 300, () => { edSera(ctx, sc, monTc, 84 * u, tones.ink, L + dayW + 40 * u, baseline); });
    edRule(ctx, sc, scene, L, bandTop - 90 * u - 8 * u, t, 450);
    // navy band
    edEnter(ctx, sc, t, 500, () => {
      ctx.fillStyle = tones.band;
      ctx.fillRect(0, bandTop, W, bandH + 30 * u);
      let y = bandTop + 64 * u + 70 * u * 0.8;
      edSera(ctx, sc, scene.title, 70 * u, tones.bandFg, L, y);
      y += 22 * u + 28 * u;
      edNova(ctx, sc, scene.subtitle, 650, 28 * u, tones.bandMuted, L, y);
    });
  } else {
    // ── 1b DAY SHEET — PAPER ──
    const bandH = 110 * u;
    edEnter(ctx, sc, t, 40, () => {
      ctx.fillStyle = tones.band;
      ctx.fillRect(0, -30 * u, W, bandH + 30 * u);
      const by = 44 * u + 22 * u * 0.8;
      drawSpacedText(ctx, MONTH_FULL[mon] ?? mon, fontStr(800, 22 * u, sc.doc.fontBody), tones.bandFg, L, by, 22 * u * 0.13, 'left', 1);
      if (wd) drawSpacedText(ctx, wd, fontStr(800, 22 * u, sc.doc.fontBody), tones.bandMuted, R, by, 22 * u * 0.13, 'right', 1);
    });
    const meta = stripWeekday(scene.subtitle);
    const titleH = 72 * u * 0.96 + 24 * u + 28 * u * 1.2;
    const bottomTop = B - titleH;
    // centered day + rule between band and bottom block
    const dayPx = 600 * u;
    const groupH = dayPx * 0.8 + 48 * u + 8 * u;
    const groupTop = bandH + (bottomTop - bandH - groupH) / 2;
    edDay(ctx, sc, day, dayPx, tones.ink, W / 2, groupTop + dayPx * 0.78, t, 150, 'center');
    edRule(ctx, sc, scene, W / 2, groupTop + dayPx * 0.8 + 48 * u, t, 450, 'center');
    edEnter(ctx, sc, t, 550, () => {
      let y = bottomTop + 72 * u * 0.8;
      edSera(ctx, sc, scene.title, 72 * u, tones.ink, W / 2, y, 'center');
      y += 24 * u + 28 * u;
      edNova(ctx, sc, meta, 650, 28 * u, tones.inkMuted, W / 2, y, 'center');
    });
  }
}

// — TITLE (editorial) —
function drawEdTitle(ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number) {
  const { W, H, u } = sc;
  const scheme = resolveScheme(scene);
  const dark = isDark(scheme.bg);
  const [kl, kr] = scene.kicker.split('|').map((s) => s.trim());

  const tones = edTones(scene, scheme);
  if (dark && scene.backdrop === 'dot-grid') {
    // ── 2c TITLE — DOT GRID CORNER ── (dot patch drawn by the backdrop)
    const L = 90 * u, R = W - 90 * u, B = H - 90 * u;
    edKicker(ctx, sc, scene.kicker.replace('|', ' · '), 22 * u, scheme.accent, L, 90 * u + 18 * u, 'left', t, 60);
    const titleFont = fontStr(400, 150 * u, sc.doc.fontHeading);
    const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 150 * u, lineHeight: 0.9, maxWidth: R - L, tracking: -0.05 * 150 * u });
    const rowH = Math.max(8 * u, 32 * u * 1.1);
    let y = B - (titleH + 52 * u + rowH);
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 150 * u, lineHeight: 0.9, color: scheme.fg,
      maxWidth: R - L, x: L, y, align: 'left', anim: 'rise', t, tStart: 260,
      accent: scheme.accent, tracking: -0.05 * 150 * u,
    });
    y += titleH + 52 * u;
    edRule(ctx, sc, scene, L, y + rowH / 2 - 4 * u, t, 620);
    edEnter(ctx, sc, t, 700, () => edNova(ctx, sc, scene.subtitle, 650, 32 * u, scheme.accent, L + 120 * u + 36 * u, y + rowH / 2 + 11 * u));
  } else if (dark) {
    // ── 2a TITLE — NAVY EDITORIAL ──
    const L = 90 * u, R = W - 90 * u, T = 90 * u, B = H - 90 * u;
    edKicker(ctx, sc, kl ?? scene.kicker, 22 * u, scheme.accent, L, T + 18 * u, 'left', t, 60);
    if (kr) edKicker(ctx, sc, kr, 22 * u, withAlpha(scheme.fg, 0.4), R, T + 18 * u, 'right', t, 60);
    const footTop = B - (Math.max(1, u) + 40 * u + 60 * u);
    const titleFont = fontStr(400, 130 * u, sc.doc.fontHeading);
    const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 130 * u, lineHeight: 0.93, maxWidth: R - L, tracking: -0.05 * 130 * u });
    const hasSub = !!scene.subtitle.trim();
    const subH = hasSub ? 36 * u + 34 * u * 1.2 : 0;
    let y = footTop - 72 * u - (8 * u + 48 * u + titleH + subH);
    edRule(ctx, sc, scene, L, y, t, 200);
    y += 8 * u + 48 * u;
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 130 * u, lineHeight: 0.93, color: scheme.fg,
      maxWidth: R - L, x: L, y, align: 'left', anim: 'rise', t, tStart: 320,
      accent: scheme.accent, tracking: -0.05 * 130 * u,
    });
    y += titleH + 36 * u;
    if (hasSub) edEnter(ctx, sc, t, 620, () => edNova(ctx, sc, scene.subtitle, 650, 34 * u, scheme.accent, L, y + 34 * u * 0.8));
    edFooter(ctx, sc, { top: footTop, left: L, right: R, dark: true, url: scene.attribution.trim(), logoH: 60 * u, t, tStart: 750, urlColor: tones.lightOnDark });
  } else {
    // ── 2b TITLE — CREAM CENTERED ──
    const T = 100 * u, B = H - 100 * u;
    edEnter(ctx, sc, t, 40, () => edDrawLogo(ctx, sc, false, W / 2, T, 74 * u, 'center'));
    if (scene.attribution.trim()) {
      edKicker(ctx, sc, scene.attribution, 22 * u, withAlpha(tones.ink, 0.5), W / 2, B - 4 * u, 'center', t, 900);
    }
    const maxW = Math.min(820 * u, W - 200 * u);
    const titleFont = fontStr(400, 120 * u, sc.doc.fontHeading);
    const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 120 * u, lineHeight: 0.93, maxWidth: maxW, tracking: -0.05 * 120 * u });
    const hasSub = !!scene.subtitle.trim();
    const groupH = 22 * u + 44 * u + titleH + 48 * u + 8 * u + (hasSub ? 40 * u + 32 * u : 0);
    const areaTop = T + 74 * u;
    let y = areaTop + (B - 40 * u - areaTop - groupH) / 2;
    edKicker(ctx, sc, scene.kicker.replace('|', ' · '), 22 * u, scheme.accent, W / 2, y + 18 * u, 'center', t, 150);
    y += 22 * u + 44 * u;
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 120 * u, lineHeight: 0.93, color: tones.ink,
      maxWidth: maxW, x: W / 2, y, align: 'center', anim: 'rise', t, tStart: 300,
      accent: scheme.accent, tracking: -0.05 * 120 * u,
    });
    y += titleH + 48 * u;
    edRule(ctx, sc, scene, W / 2, y, t, 620, 'center');
    y += 8 * u + 40 * u;
    if (hasSub) edEnter(ctx, sc, t, 700, () => edNova(ctx, sc, scene.subtitle, 650, 32 * u, tones.inkMuted, W / 2, y + 32 * u * 0.8, 'center'));
  }
}

// — AGENDA (list template, editorial) —
interface AgendaRow { day?: string; mon?: string; time?: string; ampm?: string; title: string; meta?: string }

function parseAgendaRows(body: string): AgendaRow[] {
  return body.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 5).map((line) => {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length >= 2) {
      const m = parts[0].match(/^(\d{1,2})\s+([A-Za-z]+)$/);
      if (m) return { day: m[1], mon: m[2].toUpperCase(), title: parts[1], meta: parts[2] };
      // "9:00 AM | Registration" — a single-event day agenda row
      const tm = parts[0].match(/^(\d{1,2}(?::\d{2})?)\s*(AM|PM)$/i);
      if (tm) return { time: tm[1], ampm: tm[2].toUpperCase(), title: parts[1], meta: parts[2] };
      return { title: parts[0], meta: parts[1] };
    }
    return { title: line };
  });
}

function drawEdAgenda(ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number) {
  const { W, H, u } = sc;
  const scheme = resolveScheme(scene);
  const dark = isDark(scheme.bg);
  const tones = edTones(scene, scheme);
  const rows = parseAgendaRows(scene.body);
  if (rows.length === 0) return;
  const n = rows.length;
  const f = Math.min(1, 3.2 / n) * Math.min(1, (H / W) * 1.35); // fit 4–5 rows / squat aspects
  const [kl, kr] = scene.kicker.split('|').map((s) => s.trim());
  const L = 90 * u, R = W - 90 * u, T = 90 * u, B = H - 90 * u;

  if (dark) {
    // ── 3a AGENDA — NAVY LIST ──
    edKicker(ctx, sc, kl ?? scene.kicker, 22 * u, scheme.accent, L, T + 18 * u, 'left', t, 60);
    if (kr) edKicker(ctx, sc, kr, 22 * u, withAlpha(scheme.fg, 0.4), R, T + 18 * u, 'right', t, 60);
    edRule(ctx, sc, scene, L, T + 22 * u + 36 * u, t, 200);
    const footTop = B - (Math.max(1, u) + 38 * u + 56 * u);
    const areaTop = T + 22 * u + 36 * u + 8 * u + 10 * u;
    const areaBottom = footTop - 44 * u;
    const slot = (areaBottom - areaTop) / n;
    // Day-agenda rows ("9:00 AM | …") set a shared two-column grid: the
    // widest time cluster fixes the description column for every row.
    let timeCol = 0;
    for (const r of rows) {
      if (!r.time) continue;
      const w = edSeraWidth(ctx, sc, r.time, 76 * f * u) + 12 * f * u
        + edSeraWidth(ctx, sc, r.ampm ?? '', 30 * f * u);
      timeCol = Math.max(timeCol, L + w + 64 * f * u);
    }
    rows.forEach((row, i) => {
      const base = areaTop + slot * i + slot / 2 + 96 * f * u * 0.3;
      edEnter(ctx, sc, t, 350 + i * 120, () => {
        let tx = L;
        if (row.day) {
          edSera(ctx, sc, row.day, 96 * f * u, scheme.fg, L, base);
          const dw = edSeraWidth(ctx, sc, row.day, 96 * f * u);
          edSera(ctx, sc, (row.mon ?? '').charAt(0) + (row.mon ?? '').slice(1).toLowerCase(), 34 * f * u, tones.accent, L + dw + 14 * f * u, base);
          tx = L + Math.max(170 * f * u, dw + 80 * f * u) + 56 * f * u - 56 * f * u + 56 * f * u;
          tx = L + 170 * f * u + 56 * f * u;
        }
        if (row.time) {
          // Big serif time left, AM/PM small in accent — the description
          // sits in its own right column, vertically centered.
          edSera(ctx, sc, row.time, 76 * f * u, scheme.fg, L, base);
          const tw = edSeraWidth(ctx, sc, row.time, 76 * f * u);
          edSera(ctx, sc, row.ampm ?? '', 30 * f * u, tones.accent, L + tw + 12 * f * u, base);
          tx = timeCol;
          edSera(ctx, sc, row.title, 44 * f * u, scheme.fg, tx, base - (row.meta ? 18 * f * u : 0));
          if (row.meta) edNova(ctx, sc, row.meta, 650, 26 * f * u, scheme.accent, tx, base + 26 * f * u);
          return;
        }
        edSera(ctx, sc, row.title, 52 * f * u, scheme.fg, tx, base - (row.meta ? 20 * f * u : 0));
        if (row.meta) edNova(ctx, sc, row.meta, 650, 26 * f * u, scheme.accent, tx, base + 26 * f * u);
      });
      if (i < n - 1) {
        ctx.fillStyle = ED.hairDark;
        ctx.fillRect(L, areaTop + slot * (i + 1), R - L, Math.max(1, u));
      }
    });
    edFooter(ctx, sc, { top: footTop, left: L, right: R, dark: true, url: scene.attribution.trim(), logoH: 56 * u, t, tStart: 600 + n * 120, padTop: 38 * u, urlColor: tones.lightOnDark });
  } else if (isWarmLight(scheme.bg)) {
    // ── 3b AGENDA — CREAM NUMBERED ──
    const titleFont = fontStr(400, 96 * u, sc.doc.fontHeading);
    const { height: headH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 96 * u, lineHeight: 0.93, maxWidth: R - L, tracking: -0.05 * 96 * u });
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 96 * u, lineHeight: 0.93, color: tones.ink,
      maxWidth: R - L, x: L, y: T, align: 'left', anim: 'rise', t, tStart: 80,
      accent: scheme.accent, tracking: -0.05 * 96 * u,
    });
    edRule(ctx, sc, scene, L, T + headH + 40 * u, t, 300);
    const footTop = B - (Math.max(1, u) + 36 * u + 28 * u * 1.1);
    const areaTop = T + headH + 40 * u + 8 * u + 16 * u;
    const slot = (footTop - areaTop) / n;
    rows.forEach((row, i) => {
      edEnter(ctx, sc, t, 420 + i * 120, () => {
        const top = areaTop + slot * i + slot / 2 - (22 * f * u + 14 * f * u + 56 * f * u) / 2;
        const kLine = [
          row.mon && row.day ? `${row.mon} ${row.day}` : row.time ? `${row.time} ${row.ampm}` : '',
          row.meta ?? '',
        ].filter(Boolean).join(' · ');
        if (kLine) drawSpacedText(ctx, kLine, fontStr(800, 22 * f * u, sc.doc.fontBody), tones.accentInk, L, top + 18 * f * u, 22 * f * u * 0.13, 'left', 1);
        edSera(ctx, sc, row.title, 56 * f * u, tones.ink, L, top + 22 * f * u + 14 * f * u + 56 * f * u * 0.82);
      });
    });
    // footer line: left note + right url
    ctx.fillStyle = ED.hairLight;
    ctx.fillRect(L, footTop, R - L, Math.max(1, u));
    edEnter(ctx, sc, t, 500 + n * 120, () => {
      const by = footTop + 36 * u + 28 * u * 0.8;
      if (scene.subtitle.trim()) edNova(ctx, sc, scene.subtitle, 650, 28 * u, tones.inkMuted, L, by);
      if (scene.attribution.trim()) edNova(ctx, sc, scene.attribution, 700, 28 * u, tones.ink, R, by, 'right');
    });
  } else {
    // ── 3c AGENDA — NAVY HEADER + SHEET ──
    const headH = 70 * u + 22 * u + 26 * u + 88 * u * 0.93 + 70 * u;
    edEnter(ctx, sc, t, 40, () => {
      ctx.fillStyle = tones.band;
      ctx.fillRect(0, -30 * u, W, headH + 30 * u);
      drawSpacedText(ctx, (kl ?? scene.kicker), fontStr(800, 22 * u, sc.doc.fontBody), tones.bandMuted, L, 70 * u + 18 * u, 22 * u * 0.13, 'left', 1);
      edSera(ctx, sc, scene.title, 88 * u, tones.bandFg, L, 70 * u + 22 * u + 26 * u + 88 * u * 0.8);
    });
    const footH = 4 * u + 34 * u + 56 * u + 46 * u;
    const footTop = H - footH;
    const areaTop = headH + 20 * u;
    const slot = (footTop - 20 * u - areaTop) / n;
    const tile = 150 * f * u;
    rows.forEach((row, i) => {
      edEnter(ctx, sc, t, 380 + i * 120, () => {
        const cy = areaTop + slot * i + slot / 2;
        ctx.beginPath();
        ctx.roundRect(L, cy - tile / 2, tile, tile, 5 * u);
        ctx.fillStyle = tones.tile;
        ctx.fill();
        if (row.mon) drawSpacedText(ctx, row.mon, fontStr(800, 18 * f * u, sc.doc.fontBody), tones.accentInk, L + tile / 2, cy - tile / 2 + 34 * f * u, 18 * f * u * 0.13, 'center', 1);
        if (row.day) edSera(ctx, sc, row.day, 76 * f * u, tones.ink, L + tile / 2, cy + tile / 2 - 26 * f * u, 'center');
        // Day-agenda tile: AM/PM label up top, the time as the big figure.
        if (row.ampm) drawSpacedText(ctx, row.ampm, fontStr(800, 18 * f * u, sc.doc.fontBody), tones.accentInk, L + tile / 2, cy - tile / 2 + 34 * f * u, 18 * f * u * 0.13, 'center', 1);
        if (row.time) edSera(ctx, sc, row.time, 54 * f * u, tones.ink, L + tile / 2, cy + tile / 2 - 34 * f * u, 'center');
        const tx = L + tile + 48 * f * u;
        edSera(ctx, sc, row.title, 50 * f * u, tones.ink, tx, cy + (row.meta ? -4 * f * u : 16 * f * u));
        if (row.meta) edNova(ctx, sc, row.meta, 650, 26 * f * u, tones.inkMuted, tx, cy + 12 * f * u + 26 * f * u);
      });
    });
    // berry footer rule + logo + url
    edEnter(ctx, sc, t, 550 + n * 120, () => {
      ctx.fillStyle = edRuleColor(scene);
      ctx.fillRect(0, footTop, W, 4 * u);
      const cy = footTop + 4 * u + 34 * u + 28 * u;
      edDrawLogo(ctx, sc, false, L, cy - 28 * u, 56 * u);
      if (scene.attribution.trim()) edNova(ctx, sc, scene.attribution, 700, 28 * u, tones.ink, R, cy + 10 * u, 'right');
    });
  }
}

// — END CARD (editorial) —
function drawEdEndcard(ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number) {
  const { W, H, u } = sc;
  const scheme = resolveScheme(scene);
  const dark = isDark(scheme.bg);

  const tones = edTones(scene, scheme);
  if (dark && isBlueVivid(scheme.bg)) {
    // ── 4b END CARD — COBALT ──
    const L = 90 * u, R = W - 90 * u, T = 90 * u, B = H - 90 * u;
    edKicker(ctx, sc, scene.kicker, 22 * u, scheme.accent, L, T + 18 * u, 'left', t, 60);
    const footTop = B - (Math.max(1, u) + 38 * u + 58 * u);
    const titleFont = fontStr(400, 150 * u, sc.doc.fontHeading);
    const { height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 150 * u, lineHeight: 0.9, maxWidth: R - L, tracking: -0.05 * 150 * u });
    const urlH = scene.attribution.trim() ? 48 * u + 40 * u * 1.2 + 8 * u + 4 * u : 0;
    let y = footTop - 70 * u - (titleH + urlH);
    drawTextBlock(ctx, {
      text: scene.title, font: titleFont, px: 150 * u, lineHeight: 0.9, color: tones.lightOnDark,
      maxWidth: R - L, x: L, y, align: 'left', anim: 'rise', t, tStart: 200,
      accent: scheme.accent, tracking: -0.05 * 150 * u,
    });
    y += titleH + 48 * u;
    if (scene.attribution.trim()) {
      edEnter(ctx, sc, t, 550, () => {
        const w = edNova(ctx, sc, scene.attribution, 700, 40 * u, tones.lightOnDark, L, y + 40 * u * 0.8);
        ctx.fillStyle = tones.accent;
        ctx.fillRect(L, y + 40 * u * 0.8 + 16 * u, w, 4 * u);
      });
    }
    edFooter(ctx, sc, {
      top: footTop, left: L, right: R, dark: true, url: '', logoH: 58 * u, t, tStart: 700,
      hairColor: 'rgba(255,255,255,0.25)', padTop: 38 * u,
    });
    edEnter(ctx, sc, t, 700, () => edNova(ctx, sc, scene.subtitle, 500, 19 * u, 'rgba(255,255,255,0.7)', R, footTop + 38 * u + 34 * u, 'right'));
  } else if (dark) {
    // ── 4a END CARD — NAVY CENTERED ──
    const T = 100 * u, B = H - 100 * u;
    edEnter(ctx, sc, t, 40, () => edDrawLogo(ctx, sc, true, W / 2, T, 76 * u, 'center'));
    edEnter(ctx, sc, t, 900, () => edNova(ctx, sc, scene.subtitle, 500, 20 * u, withAlpha(scheme.fg, 0.5), W / 2, B - 2 * u, 'center'));
    // centered group: kicker · big url · rule · tagline
    let px = 118 * u;
    const wUrl = edSeraWidth(ctx, sc, scene.title, px);
    if (wUrl > W - 200 * u) px *= (W - 200 * u) / wUrl;
    const tagline = scene.attribution.trim();
    const groupH = 22 * u + 40 * u + px * 0.93 + 52 * u + 8 * u + (tagline ? 40 * u + 30 * u : 0);
    let y = T + 76 * u + (B - 30 * u - (T + 76 * u) - groupH) / 2;
    edKicker(ctx, sc, scene.kicker, 22 * u, scheme.accent, W / 2, y + 18 * u, 'center', t, 150);
    y += 22 * u + 40 * u;
    edEnter(ctx, sc, t, 300, () => edSera(ctx, sc, scene.title, px, scheme.fg, W / 2, y + px * 0.8, 'center'));
    y += px * 0.93 + 52 * u;
    edRule(ctx, sc, scene, W / 2, y, t, 600, 'center');
    y += 8 * u + 40 * u;
    if (tagline) edEnter(ctx, sc, t, 700, () => edNova(ctx, sc, tagline, 650, 30 * u, scheme.accent, W / 2, y + 30 * u * 0.8, 'center'));
  } else {
    // ── 4c END CARD — CREAM TAGLINE ──
    const L = 100 * u, R = W - 100 * u, T = 100 * u, B = H - 100 * u;
    edEnter(ctx, sc, t, 40, () => edDrawLogo(ctx, sc, false, L, T, 70 * u));
    edEnter(ctx, sc, t, 900, () => edNova(ctx, sc, scene.subtitle, 500, 20 * u, tones.inkMuted, L, B - 2 * u));
    const titleFont = fontStr(400, 140 * u, sc.doc.fontHeading);
    const { lines, height: titleH } = measureBlock(ctx, { text: scene.title, font: titleFont, px: 140 * u, lineHeight: 0.93, maxWidth: R - L, tracking: -0.05 * 140 * u });
    const tagline = scene.attribution.trim();
    const groupH = titleH + 56 * u + 8 * u + (tagline ? 44 * u + 32 * u : 0);
    const areaTop = T + 70 * u;
    let y = areaTop + (B - 30 * u - areaTop - groupH) / 2;
    // Title with the final word in cobalt (the "better." treatment)
    edEnter(ctx, sc, t, 250, () => {
      ctx.font = titleFont;
      setTracking(ctx, -0.05 * 140 * u);
      const spaceW = ctx.measureText(' ').width;
      ctx.textBaseline = 'alphabetic';
      lines.forEach((line, li) => {
        let x = L;
        const baseY = y + li * 140 * u * 0.93 + 140 * u * 0.82;
        line.words.forEach((wd, wi) => {
          const isLast = li === lines.length - 1 && wi === line.words.length - 1;
          ctx.fillStyle = isLast ? tones.accentInk : tones.ink;
          ctx.fillText(wd.text, x, baseY);
          x += wd.width + spaceW;
        });
      });
      setTracking(ctx, 0);
    });
    y += titleH + 56 * u;
    edRule(ctx, sc, scene, L, y, t, 600);
    y += 8 * u + 44 * u;
    if (tagline) edEnter(ctx, sc, t, 700, () => edNova(ctx, sc, tagline, 650, 32 * u, tones.inkSoft, L, y + 32 * u * 0.8));
  }
}

// — End card scene —
function drawEndcardScene(
  ctx: CanvasRenderingContext2D, sc: SceneCtx, scene: Scene, t: number, p: Palette,
) {
  const { u, doc, assets } = sc;
  const scheme = resolveScheme(scene);
  const darkBg = isDark(scheme.bg);
  // Saturated light backgrounds (e.g. TFG electric green) need the
  // all-black mark — a colored ring would vanish into them.
  const vividBg = !darkBg && isVivid(scheme.bg);
  // Program logos (Pro studio) win over the built-in marks;
  // '-light' is the light-colored mark for dark backgrounds.
  const logo =
    (darkBg
      ? assets['__logo-brand-light'] ?? assets['__logo-brand-dark']
      : assets['__logo-brand-dark'] ?? assets['__logo-brand-light']) ??
    (darkBg
      ? assets['__logo-white']
      : (vividBg ? assets['__logo-black'] ?? assets['__logo-blue'] : assets['__logo-blue']));

  const logoText = (scene.logoText ?? '').trim();
  const hasLogo = !!logo || !!logoText;
  const logoH = hasLogo ? 96 * u : 0;
  const kickerPx = 22 * u;
  const titlePx = 64 * u;
  const subPx = 22 * u;
  const hasKicker = !!scene.kicker.trim();
  const hasSub = !!scene.subtitle.trim();

  const parts = [
    hasLogo ? logoH + 56 * u : 0,
    hasKicker ? kickerPx + 30 * u : 0,
    titlePx * 1.1,
    hasSub ? subPx * 1.5 + 40 * u : 0,
  ];
  const totalH = parts.reduce((a, b) => a + b, 0);
  let y = (sc.H - totalH) / 2;

  // Animated vector lockup — accent ring draws itself closed (stroke
  // proportions from the brand SVG: width ≈ 24.5% of radius), then the
  // words rise in as stacked spaced-caps lines.
  if (logoText) {
    const ringR = logoH / 2;
    const strokeW = logoH * 0.16;
    const midR = ringR - strokeW / 2;
    const gap = 26 * u;
    const words = logoText.split(/\s+/).filter(Boolean);
    const lineH = logoH / Math.max(words.length, 1);
    const wordPx = lineH * 0.48;
    // Michroma is the actual TFG logo typeface (single 400 weight, wide);
    // the real lockup tracks the caps wide and airy.
    const wordFont = fontStr(400, wordPx, 'Michroma');
    const spacing = wordPx * 0.32;
    ctx.font = wordFont;
    const spacedW = (s: string) => {
      let tot = 0;
      for (const c of [...s.toUpperCase()]) tot += ctx.measureText(c).width + spacing;
      return tot - spacing;
    };
    const textW = Math.max(...words.map(spacedW));
    const startX = sc.W / 2 - (logoH + gap + textW) / 2;
    const cy = y + ringR;

    const rp = seg(t, 80, 1100, easeOutQuint);
    if (rp > 0) {
      ctx.save();
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = strokeW;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(startX + ringR, cy, midR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rp);
      ctx.stroke();
      ctx.restore();
    }
    words.forEach((wd, i) => {
      const wp = seg(t, 650 + i * 150, 500, easeOutQuint);
      if (wp <= 0) return;
      ctx.save();
      ctx.globalAlpha *= wp;
      ctx.translate(0, (1 - wp) * 8 * u);
      const ly = cy + (i - (words.length - 1) / 2) * lineH + wordPx * 0.35;
      drawSpacedText(ctx, wd, wordFont, p.fg, startX + logoH + gap, ly, spacing, 'left', 1);
      ctx.restore();
    });
    y += parts[0];
  } else if (logo) {
    const lp = seg(t, 80, 700, easeOutQuint);
    if (lp > 0) {
      const iw = logo.img.naturalWidth || 1;
      const ih = logo.img.naturalHeight || 1;
      const w = (logoH / ih) * iw;
      ctx.save();
      ctx.globalAlpha *= lp;
      ctx.translate(0, (1 - lp) * 18 * u);
      ctx.drawImage(logo.img, sc.W / 2 - w / 2, y, w, logoH);
      ctx.restore();
    }
    y += parts[0];
  }

  // Kicker
  if (hasKicker) {
    const kp = seg(t, 500, 500, easeOutQuint);
    if (kp > 0) {
      ctx.save();
      ctx.globalAlpha *= kp;
      drawSpacedText(ctx, scene.kicker, fontStr(700, kickerPx, doc.fontBody), p.accent, sc.W / 2, y + kickerPx * 0.8, kickerPx * 0.2, 'center', 1);
      ctx.restore();
    }
    y += parts[1];
  }

  // Main line (URL / CTA)
  drawTextBlock(ctx, {
    text: scene.title,
    font: fontStr(scene.serifTitle ? 400 : 300, titlePx, headingFamily(sc, scene)),
    px: titlePx, lineHeight: 1.1, color: p.fg,
    maxWidth: p.frame.w * 0.9, x: sc.W / 2, y,
    align: 'center', anim: scene.anim, t, tStart: 700, accent: p.accent,
  });
  y += parts[2];

  // Fine print
  if (hasSub) {
    const sp = seg(t, 1300, 600, easeOutQuint);
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha *= sp * 0.7;
      ctx.font = fontStr(400, subPx, doc.fontBody);
      ctx.fillStyle = p.muted;
      const w = ctx.measureText(scene.subtitle).width;
      ctx.fillText(scene.subtitle, sc.W / 2 - w / 2, y + 40 * u + subPx);
      ctx.restore();
    }
  }
}

function isDark(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

/** Strongly saturated color (channel spread), vs. near-neutral whites/grays. */
function isVivid(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return Math.max(r, g, b) - Math.min(r, g, b) > 100;
}

// ── Top-level frame renderer ──────────────────────────

let transBuffer: HTMLCanvasElement | null = null;

function getTransBuffer(W: number, H: number): HTMLCanvasElement {
  if (!transBuffer || transBuffer.width !== W || transBuffer.height !== H) {
    transBuffer = document.createElement('canvas');
    transBuffer.width = W;
    transBuffer.height = H;
  }
  return transBuffer;
}

/** Whether a scene runs its exit animation (only before hard cuts / at the end). */
function exitEnabled(doc: MotionDoc, index: number): boolean {
  const next = doc.scenes[index + 1];
  if (!next) return true; // last scene: exit clean for looping
  return next.transition === 'cut';
}

/**
 * Render the frame at global time t (ms) into ctx.
 * The ctx may be pre-scaled (preview) — drawing happens in design units.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  doc: MotionDoc,
  t: number,
  assets: AssetMap,
  videos: VideoMap = {},
): void {
  const { w: W, h: H } = getAspect(doc.aspect);
  const sc: SceneCtx = { W, H, u: Math.min(W, H) / 1080, doc, assets, videos };

  if (doc.scenes.length === 0) {
    ctx.fillStyle = '#0f1c2e';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  const { index, local } = sceneAt(doc, t);
  const scene = doc.scenes[index];
  const prev = index > 0 ? doc.scenes[index - 1] : null;
  const inTransition = prev !== null && scene.transition !== 'cut' && local < TRANS_MS;

  if (!inTransition) {
    drawScene(ctx, sc, scene, local, exitEnabled(doc, index));
    return;
  }

  // Transition: draw previous scene's final frame, then composite current on top
  const p = easeInOutCubic(local / TRANS_MS);
  drawScene(ctx, sc, prev as Scene, (prev as Scene).duration, false);

  const buf = getTransBuffer(W, H);
  const bctx = buf.getContext('2d') as CanvasRenderingContext2D;
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, W, H);
  drawScene(bctx, sc, scene, local, exitEnabled(doc, index));

  ctx.save();
  if (scene.transition === 'fade') {
    ctx.globalAlpha = p;
    ctx.drawImage(buf, 0, 0);
  } else if (scene.transition === 'wipe') {
    ctx.beginPath();
    ctx.rect(0, 0, W * p, H);
    ctx.clip();
    ctx.drawImage(buf, 0, 0);
    ctx.restore();
    ctx.save();
    if (p < 1) {
      ctx.fillStyle = resolveScheme(scene).accent;
      ctx.globalAlpha = 0.9 * (1 - Math.abs(p * 2 - 1));
      ctx.fillRect(W * p - 3, 0, 6, H);
    }
  } else if (scene.transition === 'slide') {
    ctx.drawImage(buf, (1 - p) * W, 0);
  }
  ctx.restore();
}

export { TRANS_MS, EXIT_MS };
