/* Render a brand's sample card set through the real engine.
   Usage: node render-cards.mjs brands/<name>.json [outDir]
   Writes <outDir>/<card-id>.png (default ds-out/<brand-name>/).
   Requires `node build.mjs` first (dist/render-harness.html). */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
// playwright-core lives in the MCP packages' node_modules — reuse it.
const require = createRequire(join(here, '..', 'mcp', 'sbdc-composer', 'package.json'));
const { chromium } = require('playwright-core');

const brandPath = process.argv[2];
if (!brandPath) {
  console.error('usage: node render-cards.mjs brands/<name>.json [outDir]');
  process.exit(2);
}
const brand = JSON.parse(readFileSync(resolve(here, brandPath), 'utf8'));
const outDir = resolve(here, process.argv[3] ?? join('ds-out', brand.name));
mkdirSync(outDir, { recursive: true });

const harness = join(here, 'dist', 'render-harness.html');
if (!existsSync(harness)) {
  console.error('dist/render-harness.html missing — run `node build.mjs` first');
  process.exit(2);
}

const executablePath = process.env.MOTION_STUDIO_CHROMIUM
  ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath,
  proxy: proxyServer ? { server: proxyServer, bypass: '127.0.0.1,localhost' } : undefined,
  args: [
    '--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader',
    ...(proxyServer ? ['--ssl-version-max=tls1.2'] : []),
  ],
});
const page = await browser.newPage();
await page.goto('file://' + harness);
await page.waitForFunction(() => !!window.__cards);
const frames = await page.evaluate((b) => window.__cards.render(b), brand);
for (const f of frames) {
  writeFileSync(join(outDir, `${f.id}.png`), Buffer.from(f.dataUrl.split(',')[1], 'base64'));
}
await browser.close();
console.log(`rendered ${frames.length} cards → ${outDir}`);
