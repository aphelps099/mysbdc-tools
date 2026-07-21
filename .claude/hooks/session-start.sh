#!/bin/bash
set -euo pipefail

# Only needed in Claude Code on the web — fresh containers start without
# node_modules. Local machines keep their installs; skip there.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

# Root install must run first: the MCP server bundles the repo's real
# export engine (src/lib/motion/export.ts), which resolves mp4-muxer
# from the root dependencies.
npm install

# Build the TFG Motion Studio MCP server so its tools are ready as soon
# as the session starts (dist/ is gitignored).
cd mcp/motion-studio
npm install
npm run build
