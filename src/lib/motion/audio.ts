/* ═══════════════════════════════════════════════════════
   Motion Studio — audio engine
   · Decode uploaded music files (and the audio track of
     uploaded video clips) to PCM for export mixing.
   · Mix the full soundtrack offline: background music with
     fade-in/out under everything, plus each video scene's
     own audio placed at its position on the timeline.
   · musicGainAt() is the single fade curve — the preview
     volume and the offline mix both use it, so what you
     hear is what exports.
   ═══════════════════════════════════════════════════════ */

import { MotionDoc, AudioMap, VideoMap, AudioAsset, docDuration } from './types';

const MIX_SAMPLE_RATE = 48000;
const MIX_CHANNELS = 2;

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext({ sampleRate: MIX_SAMPLE_RATE });
  return sharedCtx;
}

/** Decode any audio-bearing file (mp3/wav/m4a — or an mp4 video's audio track). */
export async function decodeAudio(buf: ArrayBuffer): Promise<AudioBuffer> {
  return getAudioContext().decodeAudioData(buf);
}

/** Decode a video file's audio track; null when silent or undecodable. */
export async function tryDecodeVideoAudio(buf: ArrayBuffer): Promise<AudioBuffer | null> {
  try {
    return await decodeAudio(buf);
  } catch {
    return null;
  }
}

/** Build an AudioAsset (decoded PCM + preview element) from an uploaded file. */
export async function loadAudioAsset(file: File): Promise<AudioAsset> {
  const arrayBuf = await file.arrayBuffer();
  const buffer = await decodeAudio(arrayBuf);
  const url = URL.createObjectURL(file);
  const element = new Audio(url);
  element.preload = 'auto';
  element.loop = true;
  return {
    id: `aud-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    name: file.name,
    url,
    buffer,
    element,
  };
}

/**
 * Music gain at global time t — linear fade-in from 0, hold at
 * doc.audioVolume, linear fade-out to 0 at the end. Fades are clamped
 * so they never overlap on very short documents.
 */
export function musicGainAt(doc: MotionDoc, tMs: number, totalMs: number): number {
  const vol = Math.max(0, Math.min(1, doc.audioVolume));
  if (totalMs <= 0) return 0;
  const fadeIn = Math.max(0, Math.min(doc.audioFadeIn, totalMs / 2));
  const fadeOut = Math.max(0, Math.min(doc.audioFadeOut, totalMs / 2));
  let g = 1;
  if (fadeIn > 0 && tMs < fadeIn) g = Math.min(g, tMs / fadeIn);
  if (fadeOut > 0 && tMs > totalMs - fadeOut) g = Math.min(g, (totalMs - tMs) / fadeOut);
  return Math.max(0, Math.min(1, g)) * vol;
}

/**
 * Render the document's full soundtrack to a PCM buffer:
 * looped background music with the fade envelope, plus every video
 * scene's own audio at its timeline position. Returns null when the
 * document has no audible sources (export then skips the audio track).
 */
export async function renderMixdown(
  doc: MotionDoc,
  audio: AudioMap,
  videos: VideoMap,
): Promise<AudioBuffer | null> {
  const totalMs = docDuration(doc);
  if (!Number.isFinite(totalMs) || totalMs <= 0) return null;

  const music = doc.audioId ? audio[doc.audioId] : null;
  const musicAudible = !!music && doc.audioVolume > 0;

  interface ClipSource { buffer: AudioBuffer; startS: number; offsetS: number; durS: number; gain: number }
  const clips: ClipSource[] = [];
  let acc = 0;
  for (const scene of doc.scenes) {
    if (scene.template === 'video' && scene.videoId) {
      const v = videos[scene.videoId];
      if (v?.audioBuffer && !scene.videoMuted && scene.videoVolume > 0) {
        const offsetS = Math.min(scene.videoTrimStart / 1000, Math.max(0, v.audioBuffer.duration - 0.01));
        const durS = Math.min(scene.duration / 1000, v.audioBuffer.duration - offsetS);
        if (durS > 0) {
          clips.push({ buffer: v.audioBuffer, startS: acc / 1000, offsetS, durS, gain: scene.videoVolume });
        }
      }
    }
    acc += scene.duration;
  }

  if (!musicAudible && clips.length === 0) return null;

  const totalS = totalMs / 1000;
  const octx = new OfflineAudioContext(
    MIX_CHANNELS,
    Math.max(1, Math.ceil(totalS * MIX_SAMPLE_RATE)),
    MIX_SAMPLE_RATE,
  );

  if (musicAudible && music) {
    const src = octx.createBufferSource();
    src.buffer = music.buffer;
    src.loop = true;
    const gain = octx.createGain();
    // Piecewise-linear envelope matching musicGainAt()
    const fadeIn = Math.max(0, Math.min(doc.audioFadeIn, totalMs / 2)) / 1000;
    const fadeOut = Math.max(0, Math.min(doc.audioFadeOut, totalMs / 2)) / 1000;
    const vol = Math.max(0, Math.min(1, doc.audioVolume));
    gain.gain.setValueAtTime(fadeIn > 0 ? 0 : vol, 0);
    if (fadeIn > 0) gain.gain.linearRampToValueAtTime(vol, fadeIn);
    if (fadeOut > 0) {
      gain.gain.setValueAtTime(vol, Math.max(fadeIn, totalS - fadeOut));
      gain.gain.linearRampToValueAtTime(0, totalS);
    }
    src.connect(gain).connect(octx.destination);
    src.start(0);
    src.stop(totalS);
  }

  for (const clip of clips) {
    const src = octx.createBufferSource();
    src.buffer = clip.buffer;
    const gain = octx.createGain();
    gain.gain.value = clip.gain;
    src.connect(gain).connect(octx.destination);
    src.start(clip.startS, clip.offsetS, clip.durS);
  }

  return octx.startRendering();
}

/* ═══════════════════════════════════════════════════════
   Pro studio additions — voiceover + ducked music bed
   The Pro editor keeps its VO/music as standalone tracks
   (not doc assets) and ducks the music while the VO
   speaks. duckGainAt() is a pure function of time, so the
   preview volume and renderProMixdown() use the exact
   same curve.
   ═══════════════════════════════════════════════════════ */

export interface AudioTrack {
  name: string;
  url: string;          // object URL, for preview <audio> elements
  buffer: AudioBuffer;  // decoded, for mixdown + duck timing
}

export interface AudioSettings {
  /** Music bed volume 0–1. */
  musicVolume: number;
  /** Music gain multiplier while the VO is speaking, 0–1. */
  duckLevel: number;
}

export const DUCK_RAMP_MS = 300;

export async function decodeAudioFile(file: File): Promise<AudioTrack> {
  const arrayBuf = await file.arrayBuffer();
  const buffer = await decodeAudio(arrayBuf);
  return { name: file.name, url: URL.createObjectURL(file), buffer };
}

/**
 * Music gain at time t (ms). Ducks to musicVolume*duckLevel while the
 * VO plays, with linear DUCK_RAMP_MS ramps in and out.
 */
export function duckGainAt(
  t: number,
  voDurationMs: number | null,
  settings: AudioSettings,
): number {
  const base = settings.musicVolume;
  if (!voDurationMs || voDurationMs <= 0) return base;
  const ducked = base * settings.duckLevel;

  if (t < 0) return base;
  if (t < DUCK_RAMP_MS) {
    const p = t / DUCK_RAMP_MS;
    return base + (ducked - base) * p;
  }
  if (t < voDurationMs) return ducked;
  if (t < voDurationMs + DUCK_RAMP_MS) {
    const p = (t - voDurationMs) / DUCK_RAMP_MS;
    return ducked + (base - ducked) * p;
  }
  return base;
}

/**
 * Offline-render the Pro studio soundtrack: music looped to fit
 * (ducked under the VO) + VO at unity gain. Returns null when there
 * is nothing to mix. Feed the result to exportMp4's opts.audioBuffer.
 */
export async function renderProMixdown(
  durationMs: number,
  vo: AudioTrack | null,
  music: AudioTrack | null,
  settings: AudioSettings,
): Promise<AudioBuffer | null> {
  if (!vo && !music) return null;
  const lengthFrames = Math.max(1, Math.ceil((durationMs / 1000) * MIX_SAMPLE_RATE));
  const ctx = new OfflineAudioContext(MIX_CHANNELS, lengthFrames, MIX_SAMPLE_RATE);
  const durationSec = durationMs / 1000;
  const voDurMs = vo ? vo.buffer.duration * 1000 : null;

  if (music) {
    const src = ctx.createBufferSource();
    src.buffer = music.buffer;
    src.loop = true;
    const gain = ctx.createGain();

    // Schedule the exact duck curve (piecewise linear)
    const g0 = duckGainAt(0, voDurMs, settings);
    gain.gain.setValueAtTime(g0, 0);
    if (voDurMs && voDurMs > 0) {
      const ducked = settings.musicVolume * settings.duckLevel;
      gain.gain.linearRampToValueAtTime(ducked, Math.min(DUCK_RAMP_MS / 1000, durationSec));
      if (voDurMs / 1000 < durationSec) {
        gain.gain.setValueAtTime(ducked, voDurMs / 1000);
        gain.gain.linearRampToValueAtTime(
          settings.musicVolume,
          Math.min((voDurMs + DUCK_RAMP_MS) / 1000, durationSec),
        );
      }
    } else {
      gain.gain.setValueAtTime(settings.musicVolume, 0);
    }

    // Gentle fade-out over the last 600ms so loops don't end abruptly
    const fadeStart = Math.max(0, durationSec - 0.6);
    const endGain = duckGainAt(fadeStart * 1000, voDurMs, settings);
    gain.gain.setValueAtTime(endGain, fadeStart);
    gain.gain.linearRampToValueAtTime(0, durationSec);

    src.connect(gain).connect(ctx.destination);
    src.start(0);
    src.stop(durationSec);
  }

  if (vo) {
    const src = ctx.createBufferSource();
    src.buffer = vo.buffer;
    src.connect(ctx.destination);
    src.start(0);
    src.stop(Math.min(vo.buffer.duration, durationSec));
  }

  return ctx.startRendering();
}
