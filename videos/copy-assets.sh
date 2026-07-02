#!/usr/bin/env bash
# Copy brand fonts + logo from the main app's public/ into videos/public/
# so Remotion's staticFile() can reach them. Run once after cloning
# (or via `npm run assets`). Idempotent.

set -euo pipefail

cd "$(dirname "$0")"
mkdir -p public/fonts

cp ../public/brand/new-fonts/GT-America/GT-America-Expanded-Black.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Standard-Regular.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Standard-Medium.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Standard-Bold.otf \
   ../public/brand/new-fonts/GT-America/GT-America-Mono-Regular.otf \
   ../public/brand/new-fonts/Tobias/Tobias-Medium.otf \
   public/fonts/

cp ../public/sbdc-white-2026.png public/

echo "Assets copied into videos/public/"
