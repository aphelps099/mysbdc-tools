/* End-to-end smoke test: talks to the built server over real stdio MCP,
   authors a small SBDC promo, exercises the shortlink layer against a
   local MOCK Rebrandly API (never the network), renders previews, and
   exports an MP4. Run: node test/smoke.mjs */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createServer } from 'node:http';
import { rmSync, writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const NAME = 'smoke-test';
rmSync(join(root, 'projects', `${NAME}.json`), { force: true });

// ── Mock Rebrandly API (asserts slashtag, returns canned link ids) ──
let linkCount = 0;
const mock = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    if (req.method === 'POST' && req.url === '/links') {
      const { slashtag, destination } = JSON.parse(body);
      linkCount += 1;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: `mock-${linkCount}`, slashtag, destination, clicks: 0 }));
    } else if (req.method === 'GET' && req.url?.startsWith('/links/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ clicks: 12 }));
    } else {
      res.writeHead(404); res.end();
    }
  });
});
await new Promise((r) => mock.listen(0, '127.0.0.1', r));
const mockUrl = `http://127.0.0.1:${mock.address().port}`;

// Synthesize a 5s stereo 440Hz WAV to exercise the music-mix path.
function makeWav(path) {
  const sr = 48000, secs = 5, ch = 2;
  const n = sr * secs;
  const data = Buffer.alloc(n * ch * 2);
  for (let i = 0; i < n; i++) {
    const v = Math.round(Math.sin((2 * Math.PI * 440 * i) / sr) * 0.2 * 32767);
    data.writeInt16LE(v, i * ch * 2);
    data.writeInt16LE(v, i * ch * 2 + 2);
  }
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVEfmt ', 8);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(ch, 22);
  hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * ch * 2, 28);
  hdr.writeUInt16LE(ch * 2, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([hdr, data]));
}
const wav = join(mkdtempSync(join(tmpdir(), 'smoke-')), 'bed.wav');
makeWav(wav);

const client = new Client({ name: 'smoke', version: '0.0.0' });
await client.connect(new StdioClientTransport({
  command: process.execPath,
  args: [join(root, 'dist/server.mjs')],
  stderr: 'inherit',
  env: {
    ...process.env,
    REBRANDLY_API_KEY: 'smoke-test-key',
    REBRANDLY_API_URL: mockUrl,
  },
}));

const tools = await client.listTools();
console.log('tools:', tools.tools.map((t) => t.name).join(', '));

const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) throw new Error(`${name} failed: ${JSON.stringify(r.content)}`);
  return r;
};

const LONG_URL = 'https://norcalsbdc.zoom.us/webinar/register/WN_abc123XYZsomething-very-long';

await call('motion_create_project', {
  name: NAME,
  aspect: '9:16',
  scenes: [
    { template: 'statement', title: 'Your business plan starts here.', serifTitle: true, anim: 'mask-reveal', duration: 2600, cornerMark: true },
    { template: 'title', sbdcScheme: 'paper', kicker: 'STOCKTON · JUL 7', title: 'Marketing bootcamp', subtitle: `Register at ${LONG_URL}`, duration: 3400, backdrop: 'dot-grid' },
    { template: 'stat', sbdcScheme: 'cobalt', statPrefix: '$', statValue: 474, statSuffix: 'M', attribution: 'in capital accessed by NorCal small businesses', duration: 3200 },
    { template: 'endcard', duration: 3000, backdrop: 'dot-grid' },
  ],
});
console.log('project created');

// ── Shortlink layer against the mock ──
const map = await call('shortlink_map', { name: NAME });
const report = JSON.parse(map.content[0].text);
console.log('shortlink_map:', JSON.stringify(report.rewrites));
if (report.rewrites.length !== 1) throw new Error('expected exactly one rewrite');
const rw = report.rewrites[0];
if (!/^sbdc\.events\//.test(rw.after)) throw new Error(`display form wrong: ${rw.after}`);
if (rw.before !== LONG_URL) throw new Error('rewrote the wrong URL');

// Idempotent: second run finds nothing new and mints no new links.
const map2 = await call('shortlink_map', { name: NAME });
const report2 = JSON.parse(map2.content[0].text);
if (report2.rewrites.length !== 0) throw new Error('second map should rewrite nothing');
if (linkCount !== 1) throw new Error(`expected 1 link minted, got ${linkCount}`);

// Cache hit through shortlink_create for the same URL.
const created = await call('shortlink_create', { name: NAME, url: LONG_URL, title: 'Marketing bootcamp' });
const link = JSON.parse(created.content[0].text);
if (!link.cached) throw new Error('expected cached=true for an already-mapped URL');
if (linkCount !== 1) throw new Error('shortlink_create minted a duplicate');

// Scene text actually rewritten.
const proj = JSON.parse((await call('motion_get_project', { name: NAME })).content[0].text);
const sub = proj.doc.scenes[1].subtitle;
if (sub.includes('zoom.us')) throw new Error(`scene text still has the long URL: ${sub}`);
if (!sub.includes('sbdc.events/')) throw new Error(`scene text missing the shortlink: ${sub}`);
console.log('shortlink cache + rewrite OK:', sub);

await call('motion_add_asset', { name: NAME, id: 'bed', kind: 'music', path: wav });
console.log('music registered');

const preview = await call('motion_preview', { name: NAME });
const imgs = preview.content.filter((c) => c.type === 'image');
console.log('preview frames:', imgs.length, '| first PNG bytes ~', Math.round((imgs[0]?.data.length ?? 0) * 0.75));

const exp = await call('motion_export', { name: NAME });
console.log('export:', exp.content[0].text);

const { file, codec } = JSON.parse(exp.content[0].text);
const bytes = readFileSync(file);
const hasAudio = bytes.includes(Buffer.from('mp4a')) || bytes.includes(Buffer.from('Opus'));
console.log('codec:', codec, '| audio track:', hasAudio ? 'YES' : 'NO');
if (codec !== 'h264') throw new Error('expected h264 output');
if (!hasAudio) throw new Error('expected an audio track (music bed was registered)');

await client.close();
mock.close();
console.log('SMOKE OK');
