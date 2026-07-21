/* End-to-end smoke test: talks to the built server over real stdio MCP,
   authors a small TFG ad, renders previews, and exports an MP4.
   Run: node test/smoke.mjs */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { rmSync, writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const NAME = 'smoke-test';
rmSync(join(root, 'projects', `${NAME}.json`), { force: true });

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
}));

const tools = await client.listTools();
console.log('tools:', tools.tools.map((t) => t.name).join(', '));

const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) throw new Error(`${name} failed: ${JSON.stringify(r.content)}`);
  return r;
};

await call('motion_create_project', {
  name: NAME,
  aspect: '9:16',
  scenes: [
    { template: 'statement', title: 'Deep tech deserves deep support.', serifTitle: true, anim: 'mask-reveal', duration: 2600 },
    { template: 'title', tfgScheme: 'charcoal', kicker: 'TFG OFFICE HOURS', title: 'Scale Your Tech Startup', subtitle: 'No-cost advising from Tech Futures Group', duration: 3400 },
    { template: 'stat', tfgScheme: 'green', backdrop: 'starburst', statPrefix: '$', statValue: 70, statSuffix: 'M+', attribution: 'in SBIR/STTR and grant funding secured by TFG clients', duration: 3200 },
    { template: 'endcard', duration: 3000 },
  ],
});
console.log('project created');

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
console.log('SMOKE OK');
