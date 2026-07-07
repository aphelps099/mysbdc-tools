/* ═══════════════════════════════════════════════════════
   Motion Studio — audio engine
   · Decode uploaded voiceover / music files
   · Ducking curve: music dips while the VO plays, with
     300ms ramps. duckGainAt() is a pure function of time,
     so the SAME curve drives preview volume and the
     export mixdown.
   · renderMixdown(): OfflineAudioContext render of
     music (looped, ducked) + VO → one stereo buffer the
     exporter encodes into the MP4.
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
const MIX_SAMPLE_RATE = 48000;

export async function decodeAudioFile(file: File): Promise<AudioTrack> {
  const arrayBuf = await file.arrayBuffer();
  type AC = typeof AudioContext;
  const Ctor: AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: AC }).webkitAudioContext;
  const ctx = new Ctor();
  try {
    const buffer = await ctx.decodeAudioData(arrayBuf);
    return { name: file.name, url: URL.createObjectURL(file), buffer };
  } finally {
    ctx.close();
  }
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
    // ramp down at VO start (t=0)
    const p = t / DUCK_RAMP_MS;
    return base + (ducked - base) * p;
  }
  if (t < voDurationMs) return ducked;
  if (t < voDurationMs + DUCK_RAMP_MS) {
    // ramp back up after VO ends
    const p = (t - voDurationMs) / DUCK_RAMP_MS;
    return ducked + (base - ducked) * p;
  }
  return base;
}

/**
 * Offline-render the full soundtrack for the document:
 * music looped to fit (ducked under the VO) + VO at unity gain.
 * Returns null when there is nothing to mix.
 */
export async function renderMixdown(
  durationMs: number,
  vo: AudioTrack | null,
  music: AudioTrack | null,
  settings: AudioSettings,
): Promise<AudioBuffer | null> {
  if (!vo && !music) return null;
  const lengthFrames = Math.max(1, Math.ceil((durationMs / 1000) * MIX_SAMPLE_RATE));
  const ctx = new OfflineAudioContext(2, lengthFrames, MIX_SAMPLE_RATE);
  const durationSec = durationMs / 1000;
  const voDurMs = vo ? vo.buffer.duration * 1000 : null;

  if (music) {
    const src = ctx.createBufferSource();
    src.buffer = music.buffer;
    src.loop = true;
    const gain = ctx.createGain();

    // Schedule the exact duck curve (piecewise linear, 4 breakpoints)
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

/**
 * Encode a mixdown buffer into the muxer's audio track via WebCodecs.
 * Tries AAC (plays everywhere) then Opus. Returns the codec used.
 * The muxer must have been created with a matching audio config —
 * call pickAudioCodec() first and pass its result to the muxer.
 */
export async function pickAudioCodec(): Promise<{ codec: string; mux: 'aac' | 'opus' } | null> {
  if (typeof window === 'undefined' || !('AudioEncoder' in window)) return null;
  const candidates: { codec: string; mux: 'aac' | 'opus' }[] = [
    { codec: 'mp4a.40.2', mux: 'aac' },
    { codec: 'opus', mux: 'opus' },
  ];
  for (const c of candidates) {
    try {
      const { supported } = await AudioEncoder.isConfigSupported({
        codec: c.codec,
        sampleRate: MIX_SAMPLE_RATE,
        numberOfChannels: 2,
        bitrate: 128_000,
      });
      if (supported) return c;
    } catch {
      // try next
    }
  }
  return null;
}

export async function encodeAudioIntoMuxer(
  buffer: AudioBuffer,
  codec: string,
  addChunk: (chunk: EncodedAudioChunk, meta?: EncodedAudioChunkMetadata) => void,
  signal?: AbortSignal,
): Promise<void> {
  let encodeError: Error | null = null;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => addChunk(chunk, meta),
    error: (e) => { encodeError = e instanceof Error ? e : new Error(String(e)); },
  });
  encoder.configure({
    codec,
    sampleRate: buffer.sampleRate,
    numberOfChannels: 2,
    bitrate: 128_000,
  });

  const chunkFrames = 4800; // 100ms at 48k
  const ch0 = buffer.getChannelData(0);
  const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;

  try {
    for (let offset = 0; offset < buffer.length; offset += chunkFrames) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
      if (encodeError) throw encodeError;
      const frames = Math.min(chunkFrames, buffer.length - offset);
      const data = new Float32Array(frames * 2);
      data.set(ch0.subarray(offset, offset + frames), 0);
      data.set(ch1.subarray(offset, offset + frames), frames);
      const audioData = new AudioData({
        format: 'f32-planar',
        sampleRate: buffer.sampleRate,
        numberOfFrames: frames,
        numberOfChannels: 2,
        timestamp: Math.round((offset / buffer.sampleRate) * 1e6),
        data,
      });
      encoder.encode(audioData);
      audioData.close();
    }
    await encoder.flush();
    if (encodeError) throw encodeError;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}
