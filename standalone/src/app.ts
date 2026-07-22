/* Promo Studio — standalone event-video editor.
   Bundled with the repo's REAL motion engine (src/lib/motion/*), so the
   preview and the exported MP4 are the same pixels the hosted studios
   produce. Runs entirely in the browser from a single HTML file. */

import {
  MotionDoc, Scene, AssetMap, AudioMap, ImageAsset, TemplateId,
  ASPECTS, SCHEMES, AspectId,
  makeScene, docDuration, getAspect,
} from '../../src/lib/motion/types';
import { renderFrame } from '../../src/lib/motion/render';
import { exportMp4, exportPng } from '../../src/lib/motion/export';
import { renderMixdown, decodeAudio } from '../../src/lib/motion/audio';
import { ensureFontsReady } from '../../src/lib/motion/fonts';

// ── Curated Google Fonts (loaded on demand from fonts.googleapis.com) ──
const HEADING_FONTS = [
  'Lora', 'Playfair Display', 'DM Serif Display', 'Libre Baskerville',
  'Merriweather', 'Source Serif 4', 'Archivo Black', 'Bebas Neue',
  'Oswald', 'Montserrat', 'Poppins',
];
const BODY_FONTS = [
  'Inter', 'Source Sans 3', 'Open Sans', 'Work Sans', 'Lato',
  'Roboto', 'Nunito Sans', 'IBM Plex Sans', 'Montserrat', 'Poppins',
];

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

// ── State ──
const doc: MotionDoc = {
  aspect: '1:1',
  fps: 30,
  sceneStyle: 'editorial',
  scenes: [],
  fontHeading: 'Lora',
  fontBody: 'Inter',
  watermark: '',
  showGrain: true,
  audioId: null,
  audioVolume: 0.8,
  audioFadeIn: 1500,
  audioFadeOut: 1500,
  duckLevel: 0.3,
};
const assets: AssetMap = {};
const audioMap: AudioMap = {};
const brand = { bg: '#0f1c2e', fg: '#ffffff', accent: '#8fc5d9' };
let selected = 0;
let playing = false;
let tNow = 0;
let lastTick = 0;

// Scenes whose colors follow the Brand panel (vs a fixed preset).
const brandScenes = new Set<string>();

// ── Google Fonts loader ──
const loadedFamilies = new Set<string>();
async function loadGoogleFont(family: string): Promise<void> {
  if (!family.trim() || loadedFamilies.has(family)) return;
  loadedFamilies.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=' +
    encodeURIComponent(family).replace(/%20/g, '+') +
    ':ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap';
  document.head.appendChild(link);
  await new Promise((r) => { link.onload = r; link.onerror = r; setTimeout(r, 3000); });
  await ensureFontsReady([family]);
}

// ── Default copy per template, so new slides aren't blank ──
function starterScene(template: TemplateId): Scene {
  const s = makeScene(template, {
    scheme: 'navy',
    customScheme: { ...brand },
    anim: 'rise',
    duration: template === 'list' ? 5000 : template === 'statement' ? 2800 : 3500,
  });
  brandScenes.add(s.id);
  const eventUrl = ($('#eventUrl') as HTMLInputElement).value.trim();
  switch (template) {
    case 'statement':
      s.title = 'One line that earns the next five seconds';
      s.serifTitle = true; s.anim = 'mask-reveal';
      break;
    case 'title':
      s.kicker = 'YOUR CENTER | FREE TRAINING';
      s.title = 'Workshop title goes here';
      s.subtitle = 'One line on what attendees get';
      s.attribution = eventUrl;
      break;
    case 'calendar':
      s.kicker = 'YOUR CENTER · FREE TRAINING';
      s.title = 'Workshop title goes here';
      s.subtitle = 'Tuesday · 10:00 AM–12:00 PM · Online';
      s.statValue = 12; s.statSuffix = 'AUG';
      s.align = 'lower-left';
      s.attribution = eventUrl;
      break;
    case 'list':
      s.kicker = 'THIS MONTH | FREE TRAININGS';
      s.title = 'On the agenda';
      s.body = 'First session topic | 10:00 AM\nSecond session topic | 11:00 AM\nThird session topic | 1:00 PM';
      s.subtitle = 'Free · Register early';
      s.attribution = eventUrl;
      s.align = 'lower-left';
      break;
    case 'quote':
      s.title = 'A short client quote that sells the outcome';
      s.attribution = 'Name — Business';
      s.serifTitle = true; s.duration = 4500;
      break;
    case 'stat':
      s.statPrefix = ''; s.statValue = 500; s.statSuffix = '+';
      s.attribution = 'businesses served last year';
      break;
    case 'image':
      s.kicker = 'YOUR CENTER'; s.title = 'Add a background image';
      s.subtitle = 'Upload a photo in the slide panel';
      break;
    case 'disclaimer':
      s.kicker = 'FINE PRINT';
      s.body = 'Funded in part through a cooperative agreement with the U.S. Small Business Administration.';
      break;
    case 'endcard':
      s.kicker = 'REGISTER TODAY';
      s.title = eventUrl || 'yoursite.org/events';
      s.attribution = 'Confidential business advising. No fee.';
      break;
  }
  return s;
}

// ── Image / audio loading (upload never taints; URLs try CORS) ──
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error('Could not read file'));
    r.readAsDataURL(file);
  });
}
function loadImageAsset(id: string, url: string, name: string): Promise<ImageAsset> {
  return new Promise((res, rej) => {
    const img = new Image();
    if (/^https?:/i.test(url)) img.crossOrigin = 'anonymous';
    img.onload = () => res({ id, name, url, img });
    img.onerror = () =>
      rej(new Error('That image would not load. If it is a website URL, the site may block it — download the file and use upload instead.'));
    img.src = url;
  });
}

// ── Rendering ──
const canvas = $('#preview') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

function sizeCanvas(): void {
  const { w, h } = getAspect(doc.aspect);
  canvas.width = w; canvas.height = h;
  canvas.style.aspectRatio = `${w} / ${h}`;
}
function draw(): void {
  renderFrame(ctx, doc, tNow, assets, {});
  const dur = Math.max(1, docDuration(doc));
  ($('#scrub') as HTMLInputElement).value = String(Math.round((tNow / dur) * 1000));
  $('#timecode').textContent = `${(tNow / 1000).toFixed(1)}s / ${(dur / 1000).toFixed(1)}s`;
}
function tick(ts: number): void {
  if (playing) {
    if (lastTick) tNow = (tNow + (ts - lastTick)) % Math.max(1, docDuration(doc));
    lastTick = ts;
    draw();
  }
  requestAnimationFrame(tick);
}

// ── Scene list UI ──
function sceneLabel(s: Scene): string {
  return s.title || s.kicker || s.body.split('\n')[0] || '(empty)';
}
function renderSceneList(): void {
  const wrap = $('#sceneList');
  wrap.innerHTML = '';
  doc.scenes.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'scene-item' + (i === selected ? ' active' : '');
    div.innerHTML =
      `<div class="t">${i + 1}. ${escapeHtml(sceneLabel(s)).slice(0, 40)}<small>${s.template} · ${(s.duration / 1000).toFixed(1)}s</small></div>` +
      '<button class="mini" data-a="up" title="Move up">▲</button>' +
      '<button class="mini" data-a="down" title="Move down">▼</button>' +
      '<button class="mini" data-a="del" title="Delete">✕</button>';
    div.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).dataset.a;
      if (a === 'del') {
        doc.scenes.splice(i, 1);
        brandScenes.delete(s.id);
        selected = Math.min(selected, doc.scenes.length - 1);
      } else if (a === 'up' && i > 0) {
        [doc.scenes[i - 1], doc.scenes[i]] = [doc.scenes[i], doc.scenes[i - 1]];
        if (selected === i) selected = i - 1;
      } else if (a === 'down' && i < doc.scenes.length - 1) {
        [doc.scenes[i + 1], doc.scenes[i]] = [doc.scenes[i], doc.scenes[i + 1]];
        if (selected === i) selected = i + 1;
      } else {
        selected = i;
        tNow = sceneStart(i) + doc.scenes[i].duration * 0.75;
      }
      refresh();
    });
    wrap.appendChild(div);
  });
}
function sceneStart(index: number): number {
  let acc = 0;
  for (let i = 0; i < index; i++) acc += doc.scenes[i].duration;
  return acc;
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

// ── Scene edit form ──
interface FieldDef {
  key: keyof Scene; label: string;
  kind: 'text' | 'textarea' | 'number' | 'check' | 'range' | 'select';
  options?: string[]; min?: number; max?: number; step?: number;
  show?: (s: Scene) => boolean;
}
const TEXT_TEMPLATES: TemplateId[] = ['title', 'statement', 'quote', 'image', 'video', 'calendar', 'endcard'];
const FIELDS: FieldDef[] = [
  { key: 'kicker', label: 'Kicker (small caps label)', kind: 'text', show: (s) => s.template !== 'statement' && s.template !== 'quote' && s.template !== 'stat' },
  { key: 'title', label: 'Title', kind: 'textarea', show: (s) => TEXT_TEMPLATES.includes(s.template) || s.template === 'list' },
  { key: 'subtitle', label: 'Subtitle', kind: 'text', show: (s) => ['title', 'calendar', 'image', 'video', 'list', 'endcard'].includes(s.template) },
  { key: 'body', label: 'Lines (one per row; use "text | time")', kind: 'textarea', show: (s) => ['list', 'disclaimer'].includes(s.template) },
  { key: 'attribution', label: 'Link / attribution (footer)', kind: 'text', show: (s) => ['calendar', 'list', 'quote', 'stat', 'title', 'endcard'].includes(s.template) },
  { key: 'statValue', label: 'Day of month / number', kind: 'number', show: (s) => ['calendar', 'stat'].includes(s.template) },
  { key: 'statSuffix', label: 'Month label / suffix', kind: 'text', show: (s) => ['calendar', 'stat'].includes(s.template) },
  { key: 'statPrefix', label: 'Number prefix ($)', kind: 'text', show: (s) => s.template === 'stat' },
  { key: 'duration', label: 'Duration (seconds)', kind: 'range', min: 1.5, max: 10, step: 0.5 },
  { key: 'align', label: 'Alignment', kind: 'select', options: ['center', 'lower-left', 'lower-center', 'lower-right'] },
  { key: 'anim', label: 'Text animation', kind: 'select', options: ['rise', 'mask-reveal', 'word-stagger', 'wipe', 'blur-in', 'scale-in', 'letter-cascade', 'typewriter'] },
  { key: 'transition', label: 'Transition in', kind: 'select', options: ['fade', 'cut', 'wipe', 'slide'] },
  { key: 'backdrop', label: 'Backdrop', kind: 'select', options: ['none', 'dot-grid', 'grid', 'ring', 'arc'] },
  { key: 'serifTitle', label: 'Serif headline', kind: 'check' },
  { key: 'textScale', label: 'Text size (shrink long titles)', kind: 'range', min: 0.5, max: 1, step: 0.05 },
  { key: 'imageLayout', label: 'Image layout', kind: 'select', options: ['full', 'card'], show: (s) => s.template === 'image' },
  { key: 'kenBurns', label: 'Photo motion', kind: 'select', options: ['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'none'], show: (s) => s.template === 'image' },
  { key: 'overlay', label: 'Photo overlay', kind: 'select', options: ['scrim', 'gradient-bottom', 'gradient-left', 'gradient-right', 'brand', 'none'], show: (s) => s.template === 'image' },
  { key: 'overlayOpacity', label: 'Overlay strength', kind: 'range', min: 0, max: 1, step: 0.05, show: (s) => s.template === 'image' },
];

function renderForm(): void {
  const wrap = $('#sceneForm');
  const s = doc.scenes[selected];
  wrap.innerHTML = '';
  if (!s) { wrap.innerHTML = '<p class="hint">Add a slide to get started.</p>'; return; }

  // Scheme picker
  const schemeLabel = document.createElement('label');
  schemeLabel.textContent = 'Colors';
  const schemeSel = document.createElement('select');
  schemeSel.innerHTML =
    '<option value="__brand">Brand colors</option>' +
    SCHEMES.map((sc) => `<option value="${sc.id}">${sc.label} preset</option>`).join('');
  schemeSel.value = brandScenes.has(s.id) ? '__brand' : s.scheme;
  schemeSel.addEventListener('change', () => {
    if (schemeSel.value === '__brand') {
      brandScenes.add(s.id);
      s.customScheme = { ...brand };
    } else {
      brandScenes.delete(s.id);
      s.scheme = schemeSel.value as Scene['scheme'];
      s.customScheme = null;
    }
    refresh();
  });
  wrap.appendChild(schemeLabel);
  wrap.appendChild(schemeSel);

  // Image slide: photo upload
  if (s.template === 'image') {
    const lab = document.createElement('label');
    lab.className = 'filebtn';
    lab.textContent = 'Upload background image';
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.addEventListener('change', async () => {
      const f = inp.files?.[0];
      if (!f) return;
      const id = `img-${s.id}`;
      assets[id] = await loadImageAsset(id, await fileToDataUrl(f), f.name);
      s.imageId = id;
      refresh();
    });
    lab.appendChild(inp);
    wrap.appendChild(lab);
  }

  for (const f of FIELDS) {
    if (f.show && !f.show(s)) continue;
    const label = document.createElement('label');
    label.textContent = f.label;
    wrap.appendChild(label);
    let el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.kind === 'textarea') {
      el = document.createElement('textarea');
      el.value = String(s[f.key] ?? '');
    } else if (f.kind === 'select') {
      el = document.createElement('select');
      el.innerHTML = (f.options ?? []).map((o) => `<option>${o}</option>`).join('');
      el.value = String(s[f.key]);
    } else {
      el = document.createElement('input');
      const input = el as HTMLInputElement;
      if (f.kind === 'check') {
        input.type = 'checkbox';
        input.checked = Boolean(s[f.key]);
      } else if (f.kind === 'range') {
        input.type = 'range';
        input.min = String(f.min); input.max = String(f.max); input.step = String(f.step);
        input.value = f.key === 'duration' ? String(s.duration / 1000) : String(s[f.key]);
      } else {
        input.type = f.kind === 'number' ? 'number' : 'text';
        input.value = String(s[f.key] ?? '');
      }
    }
    el.addEventListener('input', () => {
      const scene = doc.scenes[selected];
      if (!scene) return;
      if (f.kind === 'check') {
        (scene[f.key] as unknown) = (el as HTMLInputElement).checked;
      } else if (f.key === 'duration') {
        scene.duration = Math.round(parseFloat((el as HTMLInputElement).value) * 1000);
      } else if (f.kind === 'number' || f.kind === 'range') {
        (scene[f.key] as unknown) = parseFloat((el as HTMLInputElement).value) || 0;
      } else {
        (scene[f.key] as unknown) = (el as HTMLInputElement).value;
      }
      if (!playing) { tNow = sceneStart(selected) + scene.duration * 0.75; draw(); }
      renderSceneList();
    });
    wrap.appendChild(el);
  }
}

function refresh(): void {
  sizeCanvas();
  renderSceneList();
  renderForm();
  if (!playing) draw();
}

// ── Brand panel wiring ──
function applyBrandToScenes(): void {
  for (const s of doc.scenes) {
    if (brandScenes.has(s.id)) s.customScheme = { ...brand };
  }
}
for (const [id, key] of [['#brandBg', 'bg'], ['#brandFg', 'fg'], ['#brandAccent', 'accent']] as const) {
  $(id).addEventListener('input', (e) => {
    brand[key] = (e.target as HTMLInputElement).value;
    applyBrandToScenes();
    if (!playing) draw();
  });
}
$('#applyBrand').addEventListener('click', () => {
  for (const s of doc.scenes) { brandScenes.add(s.id); s.customScheme = { ...brand }; }
  refresh();
});

function fontSelect(sel: HTMLSelectElement, families: string[], current: string, apply: (f: string) => void): void {
  sel.innerHTML = families.map((f) => `<option${f === current ? ' selected' : ''}>${f}</option>`).join('');
  sel.addEventListener('change', async () => {
    await loadGoogleFont(sel.value);
    apply(sel.value);
    if (!playing) draw();
  });
}
fontSelect($('#fontHeading') as HTMLSelectElement, HEADING_FONTS, doc.fontHeading, (f) => { doc.fontHeading = f; });
fontSelect($('#fontBody') as HTMLSelectElement, BODY_FONTS, doc.fontBody, (f) => { doc.fontBody = f; });

// Logo slots → engine asset ids (custom marks win over built-ins).
function wireLogoSlot(slotId: string, assetId: '__logo-brand-light' | '__logo-brand-dark'): void {
  const slot = $(slotId);
  const img = slot.querySelector('img') as HTMLImageElement;
  const url = slot.querySelector('input[type="url"]') as HTMLInputElement;
  const loadBtn = slot.querySelector('button') as HTMLButtonElement;
  const file = slot.querySelector('input[type="file"]') as HTMLInputElement;
  const set = async (src: string, name: string) => {
    try {
      assets[assetId] = await loadImageAsset(assetId, src, name);
      img.src = assets[assetId].img.src;
      // Mirror into the other slot when it's empty, so every scene has a mark.
      const other = assetId === '__logo-brand-light' ? '__logo-brand-dark' : '__logo-brand-light';
      if (!assets[other]) assets[other] = { ...assets[assetId], id: other };
      if (!playing) draw();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  loadBtn.addEventListener('click', () => { if (url.value.trim()) void set(url.value.trim(), 'logo'); });
  file.addEventListener('change', async () => {
    const f = file.files?.[0];
    if (f) void set(await fileToDataUrl(f), f.name);
  });
}
wireLogoSlot('#slotLight', '__logo-brand-light');
wireLogoSlot('#slotDark', '__logo-brand-dark');

$('#applyUrl').addEventListener('click', () => {
  const u = ($('#eventUrl') as HTMLInputElement).value.trim();
  if (!u) return;
  for (const s of doc.scenes) {
    if (s.template === 'calendar' || s.template === 'list' || s.template === 'title') s.attribution = u;
    if (s.template === 'endcard') s.title = u;
  }
  refresh();
});

($('#musicFile') as HTMLInputElement).addEventListener('change', async function () {
  const f = this.files?.[0];
  if (!f) return;
  const buf = await f.arrayBuffer();
  audioMap['music'] = {
    id: 'music', name: f.name, url: '',
    buffer: await decodeAudio(buf), element: new Audio(),
  };
  doc.audioId = 'music';
  $('#musicName').textContent = `♪ ${f.name}`;
});

// ── Header wiring ──
const aspectSel = $('#aspect') as HTMLSelectElement;
aspectSel.innerHTML = ASPECTS.map((a) => `<option value="${a.id}">${a.label} ${a.id} — ${a.hint}</option>`).join('');
aspectSel.value = doc.aspect;
aspectSel.addEventListener('change', () => { doc.aspect = aspectSel.value as AspectId; refresh(); });

const addSel = $('#addTemplate') as HTMLSelectElement;
const ADDABLE: [TemplateId, string][] = [
  ['statement', 'Statement (hook)'], ['title', 'Title card'], ['calendar', 'Save the date'],
  ['list', 'Agenda list'], ['quote', 'Quote'], ['stat', 'Big number'],
  ['image', 'Photo / background image'], ['disclaimer', 'Fine print'], ['endcard', 'End card'],
];
addSel.innerHTML = ADDABLE.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
$('#addScene').addEventListener('click', () => {
  doc.scenes.push(starterScene(addSel.value as TemplateId));
  selected = doc.scenes.length - 1;
  tNow = sceneStart(selected) + doc.scenes[selected].duration * 0.75;
  refresh();
});

$('#playBtn').addEventListener('click', () => {
  playing = !playing;
  lastTick = 0;
  $('#playBtn').textContent = playing ? '❚❚' : '▶';
});
($('#scrub') as HTMLInputElement).addEventListener('input', function () {
  playing = false;
  $('#playBtn').textContent = '▶';
  tNow = (parseInt(this.value, 10) / 1000) * Math.max(1, docDuration(doc));
  draw();
});

// ── Export ──
function download(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
}
function progress(show: boolean, label = '', frac = 0): void {
  ($('#progressWrap') as HTMLElement).style.display = show ? 'flex' : 'none';
  $('#status').textContent = label;
  ($('#progressFill') as HTMLElement).style.width = `${Math.round(frac * 100)}%`;
}

$('#savePng').addEventListener('click', async () => {
  if (!doc.scenes.length) return;
  const blob = await exportPng(doc, assets, tNow, {});
  download(blob, 'promo-frame.png');
});

$('#exportMp4').addEventListener('click', async () => {
  if (!doc.scenes.length) return;
  if (typeof (window as { VideoEncoder?: unknown }).VideoEncoder === 'undefined') {
    alert('MP4 export needs Chrome or Edge on a computer — this browser does not support WebCodecs video encoding. (The PNG button still works.)');
    return;
  }
  const btn = $('#exportMp4') as HTMLButtonElement;
  btn.disabled = true;
  playing = false; $('#playBtn').textContent = '▶';
  try {
    await ensureFontsReady([doc.fontHeading, doc.fontBody]);
    const audioBuffer = doc.audioId ? await renderMixdown(doc, audioMap, {}) : null;
    const blob = await exportMp4(
      doc, assets,
      (f) => progress(true, 'Exporting…', f),
      undefined,
      { videos: {}, audioBuffer },
    );
    download(blob, 'promo.mp4');
    progress(true, 'Done', 1);
    setTimeout(() => progress(false), 2500);
  } catch (e) {
    progress(false);
    alert('Export failed: ' + (e as Error).message);
  } finally {
    btn.disabled = false;
  }
});

// ── Boot: load default fonts, seed a starter storyboard ──
void (async () => {
  await Promise.all([loadGoogleFont('Lora'), loadGoogleFont('Inter')]);
  doc.scenes.push(starterScene('statement'), starterScene('calendar'), starterScene('endcard'));
  selected = 1;
  tNow = sceneStart(1) + doc.scenes[1].duration * 0.75;
  refresh();
  requestAnimationFrame(tick);
})();
