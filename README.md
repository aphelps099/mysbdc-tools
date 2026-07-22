# mysbdc-tools

Internal tools behind `tools.norcalsbdc.org` — browser studios plus MCP
services that drive the same engines from Claude Code.

## Motion MCP servers

One deterministic canvas engine (`src/lib/motion/`) renders every brand;
each server is a brand layer on top of it, driven headlessly so exports
are pixel-identical to the browser studios:

| Server | Package | Brand |
|---|---|---|
| `tfg-motion-studio` | `mcp/motion-studio/` | Tech Futures Group (`/motion/tfg`) |
| `sbdc-motion-composer` | `mcp/sbdc-composer/` | NorCal SBDC (`/motion/pro`), with the `sbdc.events` Rebrandly shortlink layer |

Both are registered in `.mcp.json` and built automatically by
`.claude/hooks/session-start.sh` in Claude Code on the web. See each
package's README for setup and the `motion_guide` tool for authoring.
