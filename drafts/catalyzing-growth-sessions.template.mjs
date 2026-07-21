/* Five per-session LinkedIn promos (4:5) for the Catalyzing Growth series. */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] || 'preview'; // preview | export
const only = process.argv[3] ? Number(process.argv[3]) : null; // optional 1-based session filter

const SESSIONS = [
  {
    slug: 's1-customer-discovery', n: 1, date: 'SEP 2',
    title: 'Customer Discovery & Validation',
    speaker: 'Steve Plume', speakerKicker: 'YOUR EXPERT',
    hook: 'Most startups build things nobody wants.',
    takeaways: 'Find your real customers\nAsk questions that matter\nValidate before you build',
  },
  {
    slug: 's2-product-positioning', n: 2, date: 'SEP 9',
    title: 'Product Development & Positioning',
    speaker: 'Steve Plume', speakerKicker: 'YOUR EXPERT',
    hook: 'The right MVP is smaller than you think.',
    takeaways: 'Scope the MVP that matters\nPosition against the market\nShip, learn, iterate',
  },
  {
    slug: 's3-go-to-market', n: 3, date: 'SEP 16',
    title: 'Go-To-Market Strategy & Execution',
    speaker: 'Steve Plume', speakerKicker: 'YOUR EXPERT',
    hook: "A great product doesn't sell itself.",
    takeaways: 'Pick your beachhead market\nBuild a repeatable sales motion\nTurn traction into momentum',
  },
  {
    slug: 's4-saas-fundraising', n: 4, date: 'SEP 23',
    title: 'SaaS Fundraising & Investor Readiness',
    speaker: 'Paul Bozzo & Steve Plume', speakerKicker: 'YOUR EXPERTS',
    hook: 'Investors fund momentum, not ideas.',
    takeaways: 'Know your SaaS metrics\nBuild an investor-ready story\nRun a tight raise',
  },
  {
    slug: 's5-sbir-sttr-grants', n: 5, date: 'SEP 30',
    title: 'Navigating SBIR/STTR R&D Grants',
    speaker: 'Charles Eason', speakerKicker: 'YOUR EXPERT',
    hook: 'Fund your R&D without giving up equity.',
    takeaways: 'Find the right SBIR/STTR fit\nWrite a competitive proposal\nAvoid the common mistakes',
  },
];

const scenesFor = (s) => [
  { template: 'statement', tfgScheme: 'dark', title: s.hook, serifTitle: true, anim: 'mask-reveal', transition: 'cut', duration: 2800 },
  { template: 'title', tfgScheme: 'dark', backdrop: 'hero', kicker: `CATALYZING GROWTH · SESSION ${s.n} OF 5`, title: s.title, subtitle: `Wednesday ${s.date} · 12:00–1:00 PM PT\nVirtual · Free`, anim: 'rise', transition: 'fade', textScale: 0.9, duration: 4000 },
  { template: 'list', tfgScheme: 'charcoal', backdrop: 'grid', weird: true, kicker: 'WHAT YOU WILL WALK AWAY WITH', body: s.takeaways, align: 'lower-left', anim: 'rise', transition: 'fade', duration: 4400 },
  { template: 'title', tfgScheme: 'dark', backdrop: 'star', kicker: s.speakerKicker, title: s.speaker, subtitle: 'Tech Futures Group', anim: 'word-stagger', transition: 'fade', duration: 3000 },
  { template: 'endcard', tfgScheme: 'dark', kicker: 'REGISTER FREE', title: 'techfuturesgroup.org', subtitle: `Catalyzing Growth · ${s.date} · 12 PM PT`, transition: 'fade', duration: 3600 },
];

const client = new Client({ name: 'cg-sessions', version: '0.0.0' });
await client.connect(new StdioClientTransport({
  command: process.execPath,
  args: [join(root, 'dist/server.mjs')],
  stderr: 'inherit',
}));
const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) throw new Error(`${name} failed: ${JSON.stringify(r.content).slice(0, 1500)}`);
  return r;
};

for (const s of SESSIONS) {
  if (only && s.n !== only) continue;
  const name = `catalyzing-growth-${s.slug}`;
  const scenes = scenesFor(s);
  try { await call('motion_create_project', { name, aspect: '4:5', scenes }); }
  catch { await call('motion_set_scenes', { name, scenes }); }
  if (mode === 'preview') {
    const r = await call('motion_preview', { name });
    const info = JSON.parse(r.content.filter((c) => c.type === 'text').map((c) => c.text).join(''));
    console.log(name, '→', info.frames?.length ?? '?', 'frames', info.warnings?.length ? info.warnings : '');
  } else {
    const r = await call('motion_export', { name });
    const info = JSON.parse(r.content.filter((c) => c.type === 'text').map((c) => c.text).join(''));
    console.log(name, '→', info.file, `${info.videoDurationMs}ms`, info.warnings?.length ? info.warnings : '');
  }
}
await client.close();
