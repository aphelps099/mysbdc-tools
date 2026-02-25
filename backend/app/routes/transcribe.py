"""
Voice transcription endpoint using OpenAI Whisper.

Accepts audio from the frontend (MediaRecorder or PCM WAV) and returns
transcribed text.
"""

import io
import logging
import os
import subprocess
import tempfile

from fastapi import APIRouter, HTTPException, UploadFile, File

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["transcribe"])

_ALLOWED_TYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/webm", "video/webm",
    "audio/ogg", "audio/mpeg",
    "audio/mp4", "audio/m4a", "audio/x-m4a",
    "audio/aac", "audio/x-caf",
    "application/octet-stream",
}

# Formats that Whisper accepts directly
_WHISPER_FORMATS = {"flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm"}


def _parse_content_type(raw: str) -> str:
    """Strip codec params: 'audio/webm;codecs=opus' -> 'audio/webm'."""
    return raw.split(";")[0].strip().lower()


def _detect_ext_from_magic(data: bytes) -> str:
    """Detect audio format from file header magic bytes.

    Returns a Whisper-supported extension. For unsupported container
    formats (like CAF from iOS), maps to the closest equivalent.
    """
    if len(data) < 12:
        return "wav"

    # WAV: starts with RIFF....WAVE
    if data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        return "wav"

    # WebM/Matroska: starts with 0x1A45DFA3
    if data[:4] == b"\x1a\x45\xdf\xa3":
        return "webm"

    # Ogg: starts with OggS
    if data[:4] == b"OggS":
        return "ogg"

    # MP3: starts with ID3 tag or sync word 0xFFEx / 0xFFFx
    if data[:3] == b"ID3":
        return "mp3"
    if len(data) >= 2 and data[0] == 0xFF and (data[1] & 0xE0) == 0xE0:
        return "mp3"

    # MP4/M4A: has 'ftyp' at offset 4
    if data[4:8] == b"ftyp":
        return "mp4"

    # FLAC: starts with fLaC
    if data[:4] == b"fLaC":
        return "flac"

    # CAF (Core Audio Format — iOS Safari): starts with 'caff'
    # Whisper doesn't accept .caf, but ffmpeg (used by Whisper internally)
    # CAN decode CAF. Map to m4a — close enough for ffmpeg to handle.
    if data[:4] == b"caff":
        return "m4a"

    # Unknown format — default to mp4 (best guess for mobile browsers)
    return "mp4"


def _convert_to_wav_ffmpeg(audio_bytes: bytes, input_ext: str) -> bytes | None:
    """Try converting audio to WAV using ffmpeg. Returns None if ffmpeg
    is unavailable or conversion fails."""
    try:
        with tempfile.NamedTemporaryFile(suffix=f".{input_ext}", delete=False) as inf:
            inf.write(audio_bytes)
            in_path = inf.name

        out_path = in_path + ".wav"

        result = subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", in_path,
                "-ar", "16000",     # 16kHz — optimal for Whisper
                "-ac", "1",         # mono
                "-sample_fmt", "s16",
                out_path,
            ],
            capture_output=True,
            timeout=30,
        )

        if result.returncode == 0:
            with open(out_path, "rb") as f:
                return f.read()

        logger.warning("ffmpeg conversion failed (rc=%d): %s", result.returncode, result.stderr[:500])
        return None

    except FileNotFoundError:
        logger.info("ffmpeg not available, skipping conversion")
        return None
    except Exception as exc:
        logger.warning("ffmpeg conversion error: %s", exc)
        return None
    finally:
        # Clean up temp files
        for p in (in_path, out_path):
            try:
                os.unlink(p)
            except OSError:
                pass


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe an audio file using OpenAI Whisper.

    Accepts: wav, webm, ogg, mp3, m4a, mp4, caf (auto-converted)
    Returns: { "text": "transcribed text" }
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(500, "OpenAI API key not configured")

    raw_type = file.content_type or "application/octet-stream"
    content_type = _parse_content_type(raw_type)
    if content_type not in _ALLOWED_TYPES:
        logger.warning("Rejected audio upload with type: %s (raw: %s)", content_type, raw_type)
        raise HTTPException(400, f"Unsupported audio format: {content_type}")

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        audio_bytes = await file.read()
        if len(audio_bytes) < 100:
            raise HTTPException(400, "Audio file too small — recording may have failed")

        # Detect actual format from magic bytes (don't trust browser MIME)
        ext = _detect_ext_from_magic(audio_bytes)
        header_hex = audio_bytes[:16].hex()
        logger.info(
            "Transcribing %d bytes (claimed=%s, detected=%s, header=%s)",
            len(audio_bytes), content_type, ext, header_hex,
        )

        # If detected format isn't natively supported by Whisper,
        # try converting to WAV via ffmpeg first
        if ext not in _WHISPER_FORMATS:
            logger.info("Detected format '%s' not in Whisper supported list, converting via ffmpeg", ext)
            wav_bytes = _convert_to_wav_ffmpeg(audio_bytes, ext)
            if wav_bytes:
                audio_bytes = wav_bytes
                ext = "wav"
                logger.info("Converted to WAV: %d bytes", len(audio_bytes))

        buf = io.BytesIO(audio_bytes)
        buf.name = f"recording.{ext}"

        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=buf,
            response_format="json",
            language="en",
        )

        text = result.text.strip() if result.text else ""
        logger.info("Transcription result: %d chars", len(text))

        return {"text": text}

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Transcription failed")
        raise HTTPException(500, f"Transcription failed: {str(exc)}")
