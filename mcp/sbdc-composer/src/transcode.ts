/* H.264 normalization.
   Chromium builds without a proprietary H.264 encoder (e.g. the
   Playwright Linux build) make the engine fall back to VP9-in-MP4,
   which iPhones/Instagram won't play. When that happens — and a
   bundled ffmpeg is available — transcode to H.264 + AAC so exports
   play everywhere. */

import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export interface NormalizeResult {
  bytes: Buffer;
  codec: 'h264' | 'vp9-in-mp4' | 'av1-in-mp4';
  transcoded: boolean;
  warning?: string;
}

function sourceCodec(bytes: Buffer): NormalizeResult['codec'] {
  if (bytes.includes(Buffer.from('avc1'))) return 'h264';
  if (bytes.includes(Buffer.from('av01'))) return 'av1-in-mp4';
  return 'vp9-in-mp4';
}

async function ffmpegPath(): Promise<string | null> {
  try {
    const mod = await import('@ffmpeg-installer/ffmpeg');
    return (mod.default ?? mod).path as string;
  } catch {
    return null;
  }
}

export async function normalizeToH264(bytes: Buffer): Promise<NormalizeResult> {
  const codec = sourceCodec(bytes);
  if (codec === 'h264') return { bytes, codec, transcoded: false };

  const ffmpeg = await ffmpegPath();
  if (!ffmpeg) {
    return {
      bytes, codec, transcoded: false,
      warning: `Export is ${codec} — the headless Chromium here has no H.264 encoder and the bundled ffmpeg is unavailable. Plays in Chrome/VLC but not on iOS/Instagram. Install @ffmpeg-installer/ffmpeg to get automatic H.264 output.`,
    };
  }

  const dir = mkdtempSync(join(tmpdir(), 'tfg-motion-'));
  const src = join(dir, 'in.mp4');
  const dst = join(dir, 'out.mp4');
  try {
    writeFileSync(src, bytes);
    const r = spawnSync(ffmpeg, [
      '-y', '-i', src,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart',
      dst,
    ], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 10 * 60 * 1000 });
    if (r.status !== 0) {
      return {
        bytes, codec, transcoded: false,
        warning: `H.264 transcode failed (kept ${codec}): ${r.stderr?.toString().split('\n').filter(Boolean).pop() ?? 'unknown ffmpeg error'}`,
      };
    }
    return { bytes: readFileSync(dst), codec: 'h264', transcoded: true };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
