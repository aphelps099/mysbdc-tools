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
  easeInOutCubic, hashRandom,
} from './easings';

const TRANS_MS = 600;   // transition into a scene
const EXIT_MS = 450;    // content exit before a hard cut / loop end

// ── Font helpers ──────────────────────────────────────

function fontStr(weight: number, px: number, family: string, italic = false): string {
  return `${italic ? 'italic ' : ''}${weight} ${px}px "${family}", sans-serif`;
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
}

/** Measure block height without drawing. */
function measureBlock(
  ctx: CanvasRenderingContext2D,
  o: Pick<TextBlockOpts, 'text' | 'font' | 'px' | 'lineHeight' | 'maxWidth'>,
): { lines: Line[]; height: number } {
  const lines = layoutLines(ctx, o.text, o.font, o.maxWidth);
  return { lines, height: lines.length * o.px * o.lineHeight };
}

/**
 * Draw a text block with the scene's animation preset.
 * Returns the block height. All animations resolve to the same
 * fully-visible layout once complete, so presets are hot-swappable.
 */
function drawTextBlock(ctx: CanvasRenderingContext2D, o: TextBlockOpts): number {
  const { lines, height } = measureBlock(ctx, o);
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

/** Weird-mode auto-pick pool: patterns strong enough to carry a scene. */
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
    ctx.strokeStyle = withAlpha(scheme.accent, A(0.1));
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
    if (backdrop === 'star' || backdrop === 'hero') {
      // 24 hairline rays, green fading to transparent, gentle spin
      const cx = W / 2;
      const cy = backdrop === 'hero' ? H * 0.38 : H / 2;
      const len = Math.min(W, H) * (backdrop === 'hero' ? 0.34 : 0.42);
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
        // CSS conic stops → [deg, r, g, b, alpha], from 210° (0° = up)
        const stops: Array<[number, number, number, number, number]> = [
          [0, 50, 70, 65, 0], [10, 50, 70, 65, 0.2], [35, 55, 80, 72, 0.5],
          [60, 60, 90, 80, 0.7], [85, 65, 95, 85, 0.8], [110, 60, 90, 80, 0.6],
          [140, 50, 75, 68, 0.4], [170, 50, 75, 68, 0],
        ];
        const startRad = ((210 - 90) * Math.PI) / 180;
        const g = (ctx as CanvasRenderingContext2D & {
          createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
        }).createConicGradient(startRad, cx, cy);
        for (const [deg, r, gr, b, al] of stops) {
          g.addColorStop(deg / 360, `rgba(${r},${gr},${b},${A(al)})`);
        }
        g.addColorStop(1, 'rgba(50,75,68,0)');
        // Load-in: a pie-wedge clip grows from 0° to the full 170° sweep.
        const lp = seg(t, 0, 1600, easeOutQuint);
        if (lp > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R * 1.25, startRad, startRad + (170 * lp * Math.PI) / 180);
          ctx.closePath();
          ctx.clip();
          ctx.beginPath();
          ctx.arc(cx, cy, mid + band / 2, 0, Math.PI * 2);
          ctx.arc(cx, cy, mid - band / 2, 0, Math.PI * 2, true);
          ctx.fillStyle = g;
          ctx.fill('evenodd');
          ctx.restore();
        }
      }
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

  // Background
  ctx.fillStyle = scheme.bg;
  ctx.fillRect(0, 0, W, H);
  if (isVideo) {
    drawVideoCover(ctx, videos[scene.videoId as string].video, W, H);
    drawOverlay(ctx, W, H, scene, scheme);
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

  // Media scenes get white text (over footage/photo); image template
  // keeps its original fixed accent for back-compat.
  const fg = (isImage || isVideo) ? '#ffffff' : scheme.fg;
  const muted = (isImage || isVideo) ? 'rgba(255,255,255,0.72)' : scheme.muted;
  const accent = isImage && scene.template === 'image' ? '#8FC5D9' : scheme.accent;
  const frame = contentFrame(tsc);
  const anchorX = scene.align === 'lower-left' ? frame.x
    : scene.align === 'lower-right' ? frame.x + frame.w
    : W / 2;
  const align: 'left' | 'center' | 'right' = scene.align === 'lower-left' ? 'left'
    : scene.align === 'lower-right' ? 'right'
    : 'center';

  switch (scene.template) {
    case 'title':
    case 'image':
    case 'video':
      drawTitleScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
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
      drawListScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'quote':
      drawQuoteScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
    case 'endcard':
      drawEndcardScene(ctx, tsc, scene, t, { fg, muted, accent, anchorX, align, frame });
      break;
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

  const logoH = logo ? 96 * u : 0;
  const kickerPx = 22 * u;
  const titlePx = 64 * u;
  const subPx = 22 * u;
  const hasKicker = !!scene.kicker.trim();
  const hasSub = !!scene.subtitle.trim();

  const parts = [
    logo ? logoH + 56 * u : 0,
    hasKicker ? kickerPx + 30 * u : 0,
    titlePx * 1.1,
    hasSub ? subPx * 1.5 + 40 * u : 0,
  ];
  const totalH = parts.reduce((a, b) => a + b, 0);
  let y = (sc.H - totalH) / 2;

  // Logo
  if (logo) {
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
