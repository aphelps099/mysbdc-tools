#!/bin/bash
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

# Remote containers (Claude Code on the web) start empty every time, so
# they always install + build. Local machines keep their installs — but a
# FRESH local clone has no node_modules and no dist/ (it's gitignored),
# and the MCP servers can't start without them. So locally, run the same
# steps only when something is missing; after the first session this
# exits immediately.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ] \
  && [ -d node_modules ] \
  && [ -f mcp/motion-studio/dist/server.mjs ] \
  && [ -f mcp/sbdc-composer/dist/server.mjs ]; then
  exit 0
fi

# Root install must run first: the MCP server bundles the repo's real
# export engine (src/lib/motion/export.ts), which resolves mp4-muxer
# from the root dependencies.
npm install

# Build the motion MCP servers so their tools are ready as soon as the
# session starts (dist/ is gitignored).
cd mcp/motion-studio
npm install
npm run build

cd ../sbdc-composer
npm install
npm run build
