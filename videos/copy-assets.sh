#!/usr/bin/env bash
# Copy brand fonts + logos into videos/public/ so Remotion's staticFile()
# can reach them. Run once after cloning (or via `npm run assets`). Idempotent.

set -euo pipefail

cd "$(dirname "$0")"
mkdir -p public/fonts public/logos

# ── Fonts: GT fallback files from the main app ────────────────────────
cp ../public/brand/new-fonts/GT-America/GT-America-Expanded-Black.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Standard-Regular.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Standard-Medium.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Standard-Bold.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Mono-Regular.otf \
   ../public/brand/new-fonts/Tobias/Tobias-Medium.otf \
   public/fonts/

# ── Logos: legacy NorCal SBDC marks ───────────────────────────────────
# Preferred source: committed copies in ../public/brand/logos-legacy/
# (commit them there once and offline/cloud renders become hermetic).
# Fallback: download from norcalsbdc.org.
LOGO_BASE="https://www.norcalsbdc.org/wp-content/themes/norcal-sbdc/assets/img/logos"
MISSING=0
for f in americas-sbdc-norcal-white-180h.png americas-sbdc-norcal-400w.png; do
  if [[ -f "public/logos/$f" ]]; then
    continue
  elif [[ -f "../public/brand/logos-legacy/$f" ]]; then
    cp "../public/brand/logos-legacy/$f" "public/logos/$f"
    echo "Copied $f from public/brand/logos-legacy/"
  elif curl -fsSL --max-time 30 -o "public/logos/$f" "$LOGO_BASE/$f"; then
    echo "Downloaded $f"
  else
    rm -f "public/logos/$f"
    MISSING=1
    echo "WARNING: could not get $f — no committed copy and download failed." >&2
    echo "         Renders need it at videos/public/logos/$f" >&2
  fi
done

echo "Assets ready in videos/public/ (missing logos: $MISSING)"
