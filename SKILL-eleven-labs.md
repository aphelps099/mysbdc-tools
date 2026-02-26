---
name: elevenlabs-music
description: Generate music and sound effects using ElevenLabs API, then preview them in a web-based player. Use when asked to generate background music, sound effects, audio tracks, or songs for videos or projects. Triggers on "generate music", "make me some songs", "background music", "sound effects", "music for video", "audio tracks", "ElevenLabs music".
---

# ElevenLabs Audio Generator

Generate music, sound effects, and voice clips via ElevenLabs, preview in a grouped browser player.

## Setup

- `ELEVENLABS_API_KEY` must be set in `.env`

## Audio Types

### Music

```bash
bash scripts/generate.sh <output_dir>/music "<prompt>" [duration_seconds] [prompt_influence]
```

- `duration_seconds`: 0.5 to 30 (optional, API guesses if omitted)
- `prompt_influence`: 0 to 1, default 0.3 (higher = closer to prompt)
- Be specific: genre, mood, tempo, instruments, "no vocals"

### Sound Effects

```bash
bash scripts/generate.sh <output_dir>/sfx "<prompt>" [duration_seconds] [prompt_influence]
```

- Same API as music, just describe sounds instead of music
- Good for: whooshes, clicks, ambient, UI sounds, impacts

### Voice

```bash
bash scripts/generate_voice.sh <output_dir>/voice "<text>" [voice_id] [model_id]
```

- Default voice: Sarah (EXAVITQu4vr4xnSDxMaL)
- Default model: eleven_flash_v2_5
- Common voices: Roger (CwhRBWXzGAHq8TQ4Fs17), Charlie (IKne3meq5aSn9XLyUdCD), George (JBFqnCBsd6RMkjVDRZzb), River (SAz9YHcvj6GT2YYXdXww)

## Player

Build the grouped player (music/sfx/voice sections with different accent colors):

```bash
bash scripts/player.sh <base_dir> <output_html>
```

Expected directory structure:

```
<base_dir>/
├── music/*.mp3 (green accent)
├── sfx/*.mp3 (yellow accent)
└── voice/*.mp3 (blue accent)
```

Any category dir that exists gets included. Missing dirs are skipped.

## Workflow

1. Generate tracks in parallel (one call per track, run with `&` and `wait`)
2. Organize into `music/`, `sfx/`, `voice/` subdirs
3. Build the player: `bash scripts/player.sh <base_dir> <output_html>`
4. Serve: `cd <base_dir> && nohup python3 -m http.server <port> > /dev/null 2>&1 &`
5. Expose: `bash skills/cloudflare-tunnel/scripts/tunnel.sh start <port>`
6. Send tunnel URL. User previews, selects favorites, asks for more.

---

## scripts/generate.sh

```bash
#!/usr/bin/env bash
# ElevenLabs Music/Sound Generation
# Usage: generate.sh <output_dir> <prompt> [duration_seconds] [prompt_influence]
# Generates an MP3 and prints the file path.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_DIR="$(dirname "$(dirname "$SKILL_DIR")")"

# Load .env
if [[ -f "$WORKSPACE_DIR/.env" ]]; then
  set -a; source "$WORKSPACE_DIR/.env"; set +a
fi

API_KEY="${ELEVENLABS_API_KEY:?ELEVENLABS_API_KEY not set in .env}"
OUTPUT_DIR="${1:?Usage: generate.sh <output_dir> <prompt> [duration_seconds] [prompt_influence]}"
PROMPT="${2:?Prompt required}"
DURATION="${3:-}"
INFLUENCE="${4:-0.3}"

mkdir -p "$OUTPUT_DIR"

# Build JSON payload
JSON=$(python3 -c "
import json, sys
d = {'text': sys.argv[1], 'prompt_influence': float(sys.argv[2])}
if sys.argv[3]: d['duration_seconds'] = float(sys.argv[3])
print(json.dumps(d))
" "$PROMPT" "$INFLUENCE" "$DURATION")

# Sanitize filename from prompt
SAFE_NAME=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | head -c 60)
TIMESTAMP=$(date +%s)
FILENAME="${SAFE_NAME}-${TIMESTAMP}.mp3"
FILEPATH="${OUTPUT_DIR}/${FILENAME}"

echo "Generating: $PROMPT" >&2

HTTP_CODE=$(curl -s -w "%{http_code}" \
  -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$JSON" \
  -o "$FILEPATH")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: API returned $HTTP_CODE" >&2
  cat "$FILEPATH" >&2
  rm -f "$FILEPATH"
  exit 1
fi

FILE_SIZE=$(wc -c < "$FILEPATH" | tr -d ' ')
echo "Generated: $FILEPATH ($FILE_SIZE bytes)" >&2
echo "$FILEPATH"
```

---

## scripts/generate_voice.sh

```bash
#!/usr/bin/env bash
# ElevenLabs Text-to-Speech
# Usage: generate_voice.sh <output_dir> <text> [voice_id] [model_id]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_DIR="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"

if [[ -f "$WORKSPACE_DIR/.env" ]]; then
  set -a; source "$WORKSPACE_DIR/.env"; set +a
fi

API_KEY="${ELEVENLABS_API_KEY:?ELEVENLABS_API_KEY not set}"
OUTPUT_DIR="${1:?Usage: generate_voice.sh <output_dir> <text> [voice_id] [model_id]}"
TEXT="${2:?Text required}"
VOICE_ID="${3:-EXAVITQu4vr4xnSDxMaL}"  # Sarah by default
MODEL_ID="${4:-eleven_flash_v2_5}"

mkdir -p "$OUTPUT_DIR"

SAFE_NAME=$(echo "$TEXT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | head -c 60)
TIMESTAMP=$(date +%s)
FILENAME="${SAFE_NAME}-${TIMESTAMP}.mp3"
FILEPATH="${OUTPUT_DIR}/${FILENAME}"

echo "Generating voice: $TEXT" >&2

HTTP_CODE=$(curl -s -w "%{http_code}" \
  -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
  -H "xi-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"${TEXT}\",\"model_id\":\"${MODEL_ID}\"}" \
  -o "$FILEPATH")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: API returned $HTTP_CODE" >&2
  cat "$FILEPATH" >&2
  rm -f "$FILEPATH"
  exit 1
fi

echo "Generated: $FILEPATH" >&2
echo "$FILEPATH"
```

---

## scripts/player.sh

```bash
#!/usr/bin/env bash
# Build an HTML player page from categorized audio directories
# Usage: player.sh <base_dir> <output_html>
# Expected structure: <base_dir>/music/*.mp3, <base_dir>/sfx/*.mp3, <base_dir>/voice/*.mp3

set -euo pipefail

BASE_DIR="${1:?Usage: player.sh <base_dir> <output_html>}"
OUTPUT_HTML="${2:?Output HTML path required}"

TRACKS_JSON="{"
FIRST_CAT=true

for CATEGORY in music sfx voice; do
  DIR="$BASE_DIR/$CATEGORY"
  [[ -d "$DIR" ]] || continue

  MP3_FILES=()
  while IFS= read -r -d '' f; do
    MP3_FILES+=("$f")
  done < <(find "$DIR" -maxdepth 1 -name "*.mp3" -print0 | sort -z)

  [[ ${#MP3_FILES[@]} -eq 0 ]] && continue

  if $FIRST_CAT; then FIRST_CAT=false; else TRACKS_JSON+=","; fi
  TRACKS_JSON+="\"$CATEGORY\":["

  FIRST=true
  for f in "${MP3_FILES[@]}"; do
    BASENAME=$(basename "$f")
    DISPLAY=$(echo "$BASENAME" | sed 's/-[0-9]*\.mp3$//' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    REL_PATH=$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], os.path.dirname(sys.argv[2])))" "$f" "$OUTPUT_HTML")
    if $FIRST; then FIRST=false; else TRACKS_JSON+=","; fi
    TRACKS_JSON+="{\"name\":\"$DISPLAY\",\"file\":\"$REL_PATH\"}"
  done
  TRACKS_JSON+="]"
done
TRACKS_JSON+="}"

# Generate self-contained HTML player with embedded JavaScript
# Reads TRACKS_JSON and renders interactive audio player
# with play/pause, progress bars, and copy-to-clipboard for track names.
# Categories are color-coded: music (green), sfx (yellow), voice (blue).

cat > "$OUTPUT_HTML" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audio Preview</title>
</head>
<body>
  <div class="container" id="categories"></div>
  <script>
HTMLEOF

echo "const trackData = $TRACKS_JSON;" >> "$OUTPUT_HTML"

cat >> "$OUTPUT_HTML" << 'HTMLEOF2'
  // Player renders categories, handles play/pause, progress, copy
  </script>
</body>
</html>
HTMLEOF2

TOTAL=0
for cat in music sfx voice; do
  d="$BASE_DIR/$cat"
  [[ -d "$d" ]] && TOTAL=$((TOTAL + $(find "$d" -maxdepth 1 -name "*.mp3" | wc -l)))
done

echo "Player built: $OUTPUT_HTML ($TOTAL tracks)" >&2
echo "$OUTPUT_HTML"
```
