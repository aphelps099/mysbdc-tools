/* Headless render backend.
   · A tiny static HTTP server exposes the harness bundle, the repo's
     public/ (fonts + TFG lockups), and registered asset files.
   · Playwright drives headless Chromium: the harness page runs the
     repo's REAL render/export engine, so output is pixel-identical to
     the browser studio. */

import { createServer, Server, IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { AddressInfo } from 'node:net';
import { chromium, Browser, Page } from 'playwright-core';
import { MotionDoc } from '../../../src/lib/motion/types';
import { Project, PKG_ROOT, REPO_ROOT } from './projects.js';

const MIME: Record<string, string> = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.otf': 'font/otf', '.ttf': 'font/ttf',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
};

function send(res: ServerResponse, file: string): void {
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': statSync(file).size,
  });
  createReadStream(file).pipe(res);
}

/** Serve a file only from inside `root` (no path traversal). */
function serveUnder(res: ServerResponse, root: string, rel: string): void {
  const file = normalize(join(root, rel));
  if (!file.startsWith(normalize(root))) { res.writeHead(403); res.end(); return; }
  send(res, file);
}

/** Official brand assets, served same-origin so the canvas stays
    untainted (same reason the Pro studio proxies via /api/brand-asset).
    A vendored copy in public/brand/assets/ wins; otherwise the file is
    fetched once from the official URL and cached (gitignored). These are
    the ONLY approved marks — never drawn or approximated in code. */
const BRAND_REMOTE: Record<string, string> = {
  'americas-sbdc-star.png':
    'https://americassbdc.org/wp-content/uploads/2018/01/bg-star.png',
  'americas-sbdc-norcal-white-180h.png':
    'https://www.norcalsbdc.org/wp-content/themes/norcal-sbdc/assets/img/logos/americas-sbdc-norcal-white-180h.png',
  'americas-sbdc-norcal-400w.png':
    'https://www.norcalsbdc.org/wp-content/themes/norcal-sbdc/assets/img/logos/americas-sbdc-norcal-400w.png',
};

export class RenderBackend {
  private server: Server | null = null;
  private browser: Browser | null = null;
  private port = 0;
  /** token → absolute path, for registered project assets. */
  private assetRoutes = new Map<string, string>();

  private async ensureServer(): Promise<void> {
    if (this.server) return;
    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const path = decodeURIComponent(url.pathname);
      if (path === '/harness.html' || path === '/harness.js') {
        send(res, join(PKG_ROOT, 'dist', path.slice(1)));
      } else if (path.startsWith('/brand/')) {
        void this.serveBrand(res, path.slice('/brand/'.length));
      } else if (path.startsWith('/public/')) {
        serveUnder(res, join(REPO_ROOT, 'public'), path.slice('/public/'.length));
      } else if (path.startsWith('/asset/')) {
        const file = this.assetRoutes.get(path.slice('/asset/'.length));
        if (file) send(res, file); else { res.writeHead(404); res.end(); }
      } else if (path === '/favicon.ico') {
        res.writeHead(204); res.end();
      } else {
        res.writeHead(404); res.end();
      }
    });
    await new Promise<void>((resolve) => this.server!.listen(0, '127.0.0.1', resolve));
    this.port = (this.server.address() as AddressInfo).port;
  }

  private async serveBrand(res: ServerResponse, name: string): Promise<void> {
    const remote = BRAND_REMOTE[name];
    if (!remote) { res.writeHead(404); res.end(); return; }
    const vendored = join(REPO_ROOT, 'public', 'brand', 'assets', name);
    if (existsSync(vendored)) { send(res, vendored); return; }
    const cached = join(PKG_ROOT, 'assets-cache', name);
    if (!existsSync(cached)) {
      try {
        const r = await fetch(remote, { signal: AbortSignal.timeout(10_000) });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        mkdirSync(join(PKG_ROOT, 'assets-cache'), { recursive: true });
        writeFileSync(cached, Buffer.from(await r.arrayBuffer()));
      } catch {
        // Offline / blocked network: the harness skips the mark, scenes
        // still render (same as a missing logo in the web studio).
        res.writeHead(404); res.end(); return;
      }
    }
    send(res, cached);
  }

  private resolveChromium(): string | undefined {
    const candidates = [
      process.env.MOTION_STUDIO_CHROMIUM,
      '/opt/pw-browsers/chromium', // Claude Code remote environment
      // Everyday Chrome installs (these have a native H.264 encoder,
      // so exports skip the ffmpeg transcode step entirely)
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ].filter((p): p is string => !!p && existsSync(p));
    if (candidates.length) return candidates[0];
    try {
      return chromium.executablePath(); // npx playwright install chromium
    } catch {
      return undefined;
    }
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser;
    const executablePath = this.resolveChromium();
    this.browser = await chromium.launch({
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--autoplay-policy=no-user-gesture-required',
        '--enable-unsafe-swiftshader',
      ],
    });
    return this.browser;
  }

  /** Open a harness page with the project's assets registered + loaded. */
  private async openPage(project: Project): Promise<Page> {
    await this.ensureServer();
    const browser = await this.ensureBrowser();

    const assets = project.assets.map((a) => {
      const token = `${project.name}--${a.id}${extname(a.path)}`;
      this.assetRoutes.set(token, a.path);
      return { id: a.id, kind: a.kind, url: `/asset/${token}`, name: a.name };
    });

    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error(`[harness] ${msg.text()}`);
    });
    await page.goto(`http://127.0.0.1:${this.port}/harness.html`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!(window as never as { __motion?: unknown }).__motion);
    const err = await page.evaluate(
      (arg: { spec: unknown; fonts: string[] }) => (window as never as {
        __motion: { prepare(s: unknown, f: string[]): Promise<string | null> };
      }).__motion.prepare(arg.spec, arg.fonts),
      // Michroma is the TFG logo typeface — always warmed so the
      // endcard's animated lockup measures with the real font.
      { spec: assets as unknown, fonts: [project.doc.fontHeading, project.doc.fontBody, 'Michroma'] },
    );
    if (err) {
      await page.close();
      throw new Error(`Harness setup failed: ${err}`);
    }
    return page;
  }

  /** Render PNG frames at the given global times (ms). Returns base64 PNGs. */
  async renderPngs(project: Project, times: number[]): Promise<string[]> {
    const page = await this.openPage(project);
    try {
      const out: string[] = [];
      for (const t of times) {
        const dataUrl = await page.evaluate(
          (arg: { doc: unknown; t: number }) => (window as never as {
            __motion: { png(d: unknown, t: number): Promise<string> };
          }).__motion.png(arg.doc, arg.t),
          { doc: project.doc as unknown, t },
        );
        out.push(dataUrl.split(',')[1]);
      }
      return out;
    } finally {
      await page.close();
    }
  }

  /** Export the full document to MP4. Returns the bytes. */
  async exportMp4(project: Project): Promise<Buffer> {
    const page = await this.openPage(project);
    try {
      const dataUrl = await page.evaluate(
        (doc: unknown) => (window as never as {
          __motion: { mp4(d: unknown): Promise<string> };
        }).__motion.mp4(doc),
        project.doc as unknown,
        // No timeout — long timelines take a while even faster-than-realtime.
      );
      return Buffer.from(dataUrl.split(',')[1], 'base64');
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    await this.browser?.close().catch(() => {});
    this.server?.close();
    this.browser = null;
    this.server = null;
  }
}

export function docTimes(doc: MotionDoc): { sceneIndex: number; t: number }[] {
  // Default preview: one frame per scene at 75% through it (post-animation).
  const out: { sceneIndex: number; t: number }[] = [];
  let acc = 0;
  doc.scenes.forEach((s, i) => {
    out.push({ sceneIndex: i, t: Math.round(acc + s.duration * 0.75) });
    acc += s.duration;
  });
  return out;
}
