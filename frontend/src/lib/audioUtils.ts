/**
 * Cross-platform audio recorder.
 *
 * Desktop: MediaRecorder → WebM/Opus or MP4/AAC
 * iOS:     Dual capture (MediaRecorder + PCM) with audio session fixes
 *
 * iOS has THREE compounding issues:
 * 1. AudioContext must be created in the user-gesture call stack
 * 2. A continuous oscillator must keep the playAndRecord session alive
 * 3. Mic→speaker routing via ScriptProcessor triggers echo cancellation
 *    that zeros out the mic signal — must route through gain(0)
 */

export interface PcmRecorder {
  stop: () => Promise<Blob>;
}

// ─── Platform detection ──────────────────────────────────────────────

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return false;
}

// ─── MediaRecorder MIME ──────────────────────────────────────────────

const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const t of PREFERRED_TYPES) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch { /* */ }
  }
  return '';
}

// ─── Public API ──────────────────────────────────────────────────────

export async function startPcmRecording(): Promise<PcmRecorder> {
  if (isIOS()) {
    console.log('[audio] iOS detected — using dual capture');
    return startIOSCapture();
  }

  const mimeType = pickMimeType();
  if (mimeType !== null) {
    console.log('[audio] Using MediaRecorder, mime:', mimeType || '(default)');
    return startMediaRecorderCapture(mimeType);
  }

  console.log('[audio] Fallback to iOS capture path');
  return startIOSCapture();
}

// ─── Strategy 1: MediaRecorder (desktop) ─────────────────────────────

async function startMediaRecorderCapture(requestedMime: string): Promise<PcmRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const options: MediaRecorderOptions = {};
  if (requestedMime) options.mimeType = requestedMime;

  const recorder = new MediaRecorder(stream, options);
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  return {
    stop: () =>
      new Promise<Blob>((resolve, reject) => {
        const timeout = setTimeout(() => {
          stream.getTracks().forEach((t) => t.stop());
          chunks.length > 0
            ? resolve(new Blob(chunks, { type: recorder.mimeType || requestedMime || 'application/octet-stream' }))
            : reject(new Error('Recording produced no audio data'));
        }, 5000);

        recorder.onstop = () => {
          clearTimeout(timeout);
          stream.getTracks().forEach((t) => t.stop());
          const mime = recorder.mimeType || requestedMime || 'application/octet-stream';
          resolve(new Blob(chunks, { type: mime }));
        };

        try { recorder.requestData(); } catch { /* OK */ }
        recorder.stop();
      }),
  };
}

// ─── Strategy 2: iOS dual capture ────────────────────────────────────
//
// Runs MediaRecorder AND ScriptProcessor simultaneously.
// On stop: if MediaRecorder produced real audio, use it (smaller/better).
// Otherwise fall back to PCM → WAV.
//
// Key fixes for iOS zero-audio:
// A) Continuous silent oscillator keeps playAndRecord audio session alive
// B) ScriptProcessor output goes through gain(0) to prevent mic→speaker
//    routing that triggers echo cancellation zeroing out the input
// C) 200ms delay after oscillator start lets iOS audio session stabilize

async function startIOSCapture(): Promise<PcmRecorder> {
  // 1. Create AudioContext in the user-gesture call stack
  const ACtor = window.AudioContext
    || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new ACtor();

  if (ctx.state !== 'running') {
    await ctx.resume();
  }
  console.log('[audio] ctx state:', ctx.state, 'sampleRate:', ctx.sampleRate);

  // 2. Start a CONTINUOUS silent oscillator. This forces iOS into the
  //    playAndRecord audio session category. It must keep running for
  //    the entire recording — if it stops, iOS may revert to playback-only
  //    and createMediaStreamSource will deliver silence.
  const keepAliveOsc = ctx.createOscillator();
  const keepAliveGain = ctx.createGain();
  keepAliveGain.gain.value = 0; // completely silent output
  keepAliveOsc.connect(keepAliveGain);
  keepAliveGain.connect(ctx.destination);
  keepAliveOsc.start();
  console.log('[audio] Keep-alive oscillator started');

  // 3. Wait for iOS audio session to fully stabilize
  await new Promise((r) => setTimeout(r, 250));

  // 4. Get microphone
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  // Diagnostic: track state
  const track = stream.getAudioTracks()[0];
  if (track) {
    console.log('[audio] Track:', track.readyState, 'muted:', track.muted,
      'enabled:', track.enabled, 'label:', track.label);
    try {
      console.log('[audio] Track settings:', JSON.stringify(track.getSettings()));
    } catch { /* OK */ }
  }

  // ── Path A: MediaRecorder on CLONED stream ──
  // Clone so it doesn't conflict with AudioContext reading the original
  let mrChunks: Blob[] = [];
  let mrRecorder: MediaRecorder | null = null;
  let mrStream: MediaStream | null = null;
  try {
    mrStream = stream.clone();
    mrRecorder = new MediaRecorder(mrStream);
    mrRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) mrChunks.push(e.data);
    };
    mrRecorder.start(1000); // request data every second
    console.log('[audio] MediaRecorder started (mime:', mrRecorder.mimeType, ')');
  } catch (e) {
    console.log('[audio] MediaRecorder unavailable:', e);
    mrRecorder = null;
    mrStream = null;
  }

  // ── Path B: ScriptProcessor → PCM ──
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const pcmChunks: Float32Array[] = [];
  let hasNonSilentPCM = false;
  let pcmChunkCount = 0;

  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    pcmChunks.push(new Float32Array(input));
    pcmChunkCount++;

    // Check first 20 chunks for any non-zero samples
    if (!hasNonSilentPCM && pcmChunkCount <= 20) {
      for (let i = 0; i < input.length; i += 32) {
        if (Math.abs(input[i]) > 0.0001) {
          hasNonSilentPCM = true;
          console.log('[audio] Non-silent audio detected at chunk', pcmChunkCount,
            'sample', i, 'value', input[i]);
          break;
        }
      }
      if (pcmChunkCount === 20 && !hasNonSilentPCM) {
        // Log actual sample values for diagnosis
        const samples = Array.from(input.slice(0, 10)).map(v => v.toFixed(6));
        console.warn('[audio] 20 chunks all silent. Sample values:', samples.join(', '));
      }
    }
  };

  source.connect(processor);

  // CRITICAL: Route processor output through gain(0) → destination.
  // This keeps the ScriptProcessor firing (it needs a destination connection)
  // but prevents mic audio from reaching the speaker. Without this, iOS
  // echo cancellation detects mic→speaker feedback and zeros out the input.
  const muteGain = ctx.createGain();
  muteGain.gain.value = 0;
  processor.connect(muteGain);
  muteGain.connect(ctx.destination);
  console.log('[audio] ScriptProcessor connected (with muted output)');

  const sampleRate = ctx.sampleRate;

  return {
    stop: async () => {
      // Stop MediaRecorder first
      let mrBlob: Blob | null = null;
      if (mrRecorder && mrRecorder.state !== 'inactive') {
        mrBlob = await new Promise<Blob>((resolve) => {
          const timeout = setTimeout(() => {
            const mime = mrRecorder!.mimeType || 'audio/mp4';
            resolve(new Blob(mrChunks, { type: mime }));
          }, 3000);

          mrRecorder!.onstop = () => {
            clearTimeout(timeout);
            const mime = mrRecorder!.mimeType || 'audio/mp4';
            resolve(new Blob(mrChunks, { type: mime }));
          };

          try { mrRecorder!.requestData(); } catch { /* OK */ }
          mrRecorder!.stop();
        });
      }

      // Stop PCM capture & release all mic streams
      processor.disconnect();
      source.disconnect();
      keepAliveOsc.stop();
      stream.getTracks().forEach((t) => t.stop());
      mrStream?.getTracks().forEach((t) => t.stop());

      await new Promise((r) => setTimeout(r, 100));
      await ctx.close();

      const pcmTotalSamples = pcmChunks.reduce((s, c) => s + c.length, 0);
      console.log('[audio] Results:',
        'MR blob:', mrBlob?.size ?? 0, 'bytes,',
        'PCM:', pcmChunks.length, 'chunks,', pcmTotalSamples, 'samples,',
        'hasAudio:', hasNonSilentPCM);

      // Decision: prefer MediaRecorder if it produced substantial output
      // (> 5KB suggests actual audio, not just container headers)
      if (mrBlob && mrBlob.size > 5000) {
        console.log('[audio] → Using MediaRecorder output');
        return mrBlob;
      }

      // Fall back to PCM WAV
      if (hasNonSilentPCM) {
        console.log('[audio] → Using PCM WAV (has audio)');
      } else {
        console.warn('[audio] → Using PCM WAV (SILENT — transcription will likely fail)');
      }
      return encodeWav(pcmChunks, sampleRate);
    },
  };
}

// ─── WAV Encoder ─────────────────────────────────────────────────────

function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  let totalSamples = 0;
  for (const c of chunks) totalSamples += c.length;

  const bps = 2;
  const dataLen = totalSamples * bps;
  const buf = new ArrayBuffer(44 + dataLen);
  const v = new DataView(buf);

  ws(v, 0, 'RIFF');
  v.setUint32(4, 36 + dataLen, true);
  ws(v, 8, 'WAVE');
  ws(v, 12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * bps, true);
  v.setUint16(32, bps, true);
  v.setUint16(34, 16, true);
  ws(v, 36, 'data');
  v.setUint32(40, dataLen, true);

  let off = 44;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      const s = Math.max(-1, Math.min(1, chunk[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }

  return new Blob([buf], { type: 'audio/wav' });
}

function ws(v: DataView, o: number, s: string) {
  for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
}
