/* ═══════════════════════════════════════════════════════
   Motion Studio — video export
   · MP4: offline frame-by-frame render → WebCodecs H.264
     → mp4-muxer. Deterministic, faster than realtime,
     no dropped frames.
   · WebM fallback: realtime canvas.captureStream +
     MediaRecorder for browsers without WebCodecs.
   · PNG: single-frame snapshot.
   ═══════════════════════════════════════════════════════ */

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { MotionDoc, AssetMap, getAspect, docDuration } from './types';
import { renderFrame } from './render';
import { pickAudioCodec, encodeAudioIntoMuxer } from './audio';

export interface ExportProgress {
  frame: number;
  totalFrames: number;
  /** 0–1 */
  ratio: number;
}

export type ProgressFn = (p: ExportProgress) => void;

export function supportsMp4Export(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window;
}

type MuxVideoCodec = 'avc' | 'vp9' | 'av1';

/**
 * Pick a supported encoder for MP4 output. Prefers H.264 (plays
 * everywhere); falls back to VP9/AV1 in an MP4 container on
 * browsers without an H.264 encoder.
 */
async function pickCodec(
  width: number, height: number, fps: number, bitrate: number,
): Promise<{ codec: string; mux: MuxVideoCodec }> {
  const candidates: { codec: string; mux: MuxVideoCodec }[] = [
    // High → Main → Baseline, level 4.2 covers 1080p60
    { codec: 'avc1.64002a', mux: 'avc' },
    { codec: 'avc1.4d402a', mux: 'avc' },
    { codec: 'avc1.42002a', mux: 'avc' },
    { codec: 'avc1.640028', mux: 'avc' },
    { codec: 'avc1.4d0028', mux: 'avc' },
    { codec: 'vp09.00.41.08', mux: 'vp9' },
    { codec: 'vp09.00.10.08', mux: 'vp9' },
    { codec: 'av01.0.08M.08', mux: 'av1' },
  ];
  for (const c of candidates) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec: c.codec, width, height, framerate: fps, bitrate,
      });
      if (supported) return c;
    } catch {
      // try next
    }
  }
  throw new Error('No supported video encoder found in this browser');
}

/**
 * Render the full document to an MP4 blob.
 * Renders every frame offline at full resolution — output is exactly
 * what the preview shows, regardless of machine speed. When `soundtrack`
 * is provided (the mixdown from renderMixdown), it's encoded as the
 * MP4's audio track (AAC when available, else Opus).
 */
export async function exportMp4(
  doc: MotionDoc,
  assets: AssetMap,
  onProgress: ProgressFn,
  signal?: AbortSignal,
  soundtrack?: AudioBuffer | null,
): Promise<Blob> {
  const { w: width, h: height } = getAspect(doc.aspect);
  const fps = doc.fps;
  const durationMs = docDuration(doc);
  const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));
  const bitrate = Math.round(width * height * fps * 0.14); // ~9 Mbps at 1080p30

  const { codec, mux } = await pickCodec(width, height, fps, bitrate);
  const audioCodec = soundtrack ? await pickAudioCodec() : null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: mux, width, height },
    ...(soundtrack && audioCodec
      ? { audio: { codec: audioCodec.mux, sampleRate: soundtrack.sampleRate, numberOfChannels: 2 } }
      : {}),
    fastStart: 'in-memory',
  });

  let encodeError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { encodeError = e instanceof Error ? e : new Error(String(e)); },
  });
  encoder.configure({ codec, width, height, framerate: fps, bitrate });

  const microTick = () => new Promise((r) => setTimeout(r, 0));

  try {
    for (let i = 0; i < totalFrames; i++) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
      if (encodeError) throw encodeError;

      const t = (i / fps) * 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      renderFrame(ctx, doc, t, assets);

      const frame = new VideoFrame(canvas, {
        timestamp: Math.round((i * 1e6) / fps),
        duration: Math.round(1e6 / fps),
      });
      encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
      frame.close();

      // Keep the encoder queue bounded and the UI responsive
      if (encoder.encodeQueueSize > 8) {
        while (encoder.encodeQueueSize > 2) await microTick();
      }
      if (i % 3 === 0) {
        onProgress({ frame: i + 1, totalFrames, ratio: (i + 1) / totalFrames });
        await microTick();
      }
    }

    await encoder.flush();
    if (encodeError) throw encodeError;

    if (soundtrack && audioCodec) {
      await encodeAudioIntoMuxer(
        soundtrack,
        audioCodec.codec,
        (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        signal,
      );
    }

    muxer.finalize();
    onProgress({ frame: totalFrames, totalFrames, ratio: 1 });
    return new Blob([target.buffer], { type: 'video/mp4' });
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}

/**
 * Realtime WebM fallback for browsers without WebCodecs.
 * Plays the timeline once into a MediaRecorder.
 */
export async function exportWebm(
  doc: MotionDoc,
  assets: AssetMap,
  onProgress: ProgressFn,
  signal?: AbortSignal,
): Promise<Blob> {
  const { w: width, h: height } = getAspect(doc.aspect);
  const fps = doc.fps;
  const durationMs = docDuration(doc);
  const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

  const stream = canvas.captureStream(fps);
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: Math.round(width * height * fps * 0.12),
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    recorder.onerror = () => reject(new Error('MediaRecorder failed'));
    recorder.start(250);

    const t0 = performance.now();
    const tick = () => {
      if (signal?.aborted) {
        recorder.stop();
        reject(new DOMException('Export cancelled', 'AbortError'));
        return;
      }
      const elapsed = performance.now() - t0;
      const t = Math.min(elapsed, durationMs);
      renderFrame(ctx, doc, t, assets);
      onProgress({
        frame: Math.min(totalFrames, Math.round((t / 1000) * fps)),
        totalFrames,
        ratio: t / durationMs,
      });
      if (elapsed >= durationMs + 120) {
        recorder.stop();
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
}

/** Snapshot the frame at time t as a PNG blob. */
export async function exportPng(doc: MotionDoc, assets: AssetMap, t: number): Promise<Blob> {
  const { w: width, h: height } = getAspect(doc.aspect);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
  renderFrame(ctx, doc, t, assets);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
