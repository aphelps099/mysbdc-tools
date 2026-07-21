/* Browser-side harness bundled by esbuild and loaded in headless
   Chromium. It imports the repo's REAL motion engine (src/lib/motion/*)
   so previews and exports are pixel-identical to the web studio.
   The Node side drives it through window.__motion. */

import {
  MotionDoc, AssetMap, VideoMap, AudioMap, ImageAsset,
} from '../../../../src/lib/motion/types';
import { exportMp4, exportPng } from '../../../../src/lib/motion/export';
import { renderMixdown, decodeAudio, tryDecodeVideoAudio } from '../../../../src/lib/motion/audio';
import { ensureFontsReady } from '../../../../src/lib/motion/fonts';

interface AssetSpec {
  id: string;
  kind: 'image' | 'video' | 'music';
  url: string;
  name: string;
}

/** The end-card renderer looks these ids up (see TFGMotionStudio.tsx). */
const TFG_LOGOS: [string, string][] = [
  ['__logo-white', '/public/tfg-lockup-light.png'], // full lockup, dark backgrounds
  ['__logo-blue', '/public/tfg-lockup-dark.png'],   // full lockup, light neutral backgrounds
  ['__logo-black', '/public/tfg-lockup-black.png'], // all-black lockup, bright green background
];

const state = {
  assets: {} as AssetMap,
  videos: {} as VideoMap,
  audio: {} as AudioMap,
};

function loadImage(id: string, url: string, name: string): Promise<ImageAsset> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ id, name, url, img });
    img.onerror = () => reject(new Error(`Failed to load image "${name}" (${url})`));
    img.src = url;
  });
}

function loadVideoElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video (${url})`));
    video.src = url;
  });
}

async function prepare(specs: AssetSpec[], fonts: string[]): Promise<string | null> {
  try {
    state.assets = {};
    state.videos = {};
    state.audio = {};

    // Built-in TFG end-card lockups (missing files just skip the logo,
    // matching the web studio's behavior).
    for (const [id, url] of TFG_LOGOS) {
      try {
        state.assets[id] = await loadImage(id, url, id);
      } catch { /* end card renders without a logo */ }
    }

    for (const a of specs) {
      if (a.kind === 'image') {
        state.assets[a.id] = await loadImage(a.id, a.url, a.name);
      } else if (a.kind === 'video') {
        const video = await loadVideoElement(a.url);
        const buf = await (await fetch(a.url)).arrayBuffer();
        state.videos[a.id] = {
          id: a.id,
          name: a.name,
          url: a.url,
          video,
          duration: (video.duration || 0) * 1000,
          width: video.videoWidth,
          height: video.videoHeight,
          audioBuffer: await tryDecodeVideoAudio(buf),
        };
      } else {
        const buf = await (await fetch(a.url)).arrayBuffer();
        state.audio[a.id] = {
          id: a.id,
          name: a.name,
          url: a.url,
          buffer: await decodeAudio(buf),
          element: new Audio(a.url),
        };
      }
    }

    await ensureFontsReady(fonts);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Failed to read blob'));
    r.readAsDataURL(blob);
  });
}

async function png(doc: MotionDoc, t: number): Promise<string> {
  const blob = await exportPng(doc, state.assets, t, { videos: state.videos });
  return blobToDataUrl(blob);
}

async function mp4(doc: MotionDoc): Promise<string> {
  const audioBuffer = await renderMixdown(doc, state.audio, state.videos);
  const blob = await exportMp4(doc, state.assets, () => {}, undefined, {
    videos: state.videos,
    audioBuffer,
  });
  return blobToDataUrl(blob);
}

(window as never as { __motion: unknown }).__motion = { prepare, png, mp4 };
