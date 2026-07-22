/* Build the standalone Promo Studio:
   dist/promo-studio.html — ONE self-contained file (engine + UI inlined)
   dist/promo-studio.zip  — the HTML + README, ready to email */
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'dist'), { recursive: true });

const result = await build({
  entryPoints: [join(here, 'src/app.ts')],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  target: 'chrome110',
  minify: true,
});
const js = result.outputFiles[0].text;

const html = readFileSync(join(here, 'src/index.html'), 'utf8')
  .replace('<!--APP_JS-->', () => `<script>\n${js}\n</script>`);
writeFileSync(join(here, 'dist/promo-studio.html'), html);
copyFileSync(join(here, 'README.md'), join(here, 'dist/README.md'));
copyFileSync(join(here, 'EVENT-PROMO-SYSTEM.md'), join(here, 'dist/EVENT-PROMO-SYSTEM.md'));

// Headless card-renderer harness (render-cards.mjs drives it).
const cards = await build({
  entryPoints: [join(here, 'src/render-cards.ts')],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  target: 'chrome110',
  minify: true,
});
writeFileSync(
  join(here, 'dist/render-harness.html'),
  `<!DOCTYPE html><meta charset="utf-8"><title>card renderer</title><script>\n${cards.outputFiles[0].text}\n</script>`,
);

try {
  execSync('zip -j -q dist/promo-studio.zip dist/promo-studio.html dist/README.md dist/EVENT-PROMO-SYSTEM.md', { cwd: here });
  console.log('build ok: dist/promo-studio.html + dist/render-harness.html + dist/promo-studio.zip');
} catch {
  console.log('build ok: dist/promo-studio.html (zip tool not found — zip skipped)');
}
