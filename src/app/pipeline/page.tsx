'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   /pipeline — Marketing Engine control panel
   Manual "Scan now" (and click refresh) for logged-in
   users; cron hits the same routes with the service token.
   ═══════════════════════════════════════════════════════ */

const label: React.CSSProperties = {
  fontFamily: "'proxima-nova', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#8a8a8a',
};

export default function PipelinePage() {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const run = async (path: string, name: string) => {
    setRunning(name);
    setResult('');
    try {
      const res = await fetch(path, { method: 'POST' });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setRunning(null);
    }
  };

  const btn: React.CSSProperties = {
    fontFamily: "'proxima-nova', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#1D5AA7',
    color: '#fff',
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#f0efeb', padding: '32px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <a href="/" style={{ ...label, textDecoration: 'none' }}>← Back</a>
        <h1 style={{ fontFamily: "'proxima-nova', sans-serif", fontWeight: 300, fontSize: 32, color: '#0f1c2e', margin: '12px 0 4px' }}>
          Marketing Engine
        </h1>
        <p style={{ fontFamily: "'proxima-nova', sans-serif", fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
          Event pipeline: norcalsbdc.org/events → shortlink → promo copy → Google Sheet → Motion Pro.
          The Sheet is the system of record; nothing publishes without a human flipping <code>status</code>.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <button style={btn} disabled={!!running} onClick={() => run('/api/pipeline/scan-events', 'scan')}>
            {running === 'scan' ? 'Scanning…' : '▶ Scan now'}
          </button>
          <button
            style={{ ...btn, background: '#fff', color: '#1D5AA7', border: '1px solid rgba(29,90,167,0.4)' }}
            disabled={!!running}
            onClick={() => run('/api/pipeline/scan-events?dryRun=1', 'dry')}
          >
            {running === 'dry' ? 'Parsing…' : 'Dry run (parse only)'}
          </button>
          <button
            style={{ ...btn, background: '#fff', color: '#1D5AA7', border: '1px solid rgba(29,90,167,0.4)' }}
            disabled={!!running}
            onClick={() => run('/api/pipeline/refresh-clicks', 'clicks')}
          >
            {running === 'clicks' ? 'Refreshing…' : 'Refresh click counts'}
          </button>
        </div>

        {result && (
          <pre style={{
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: 1.5,
            background: '#0f1c2e',
            color: '#e2e6eb',
            borderRadius: 10,
            padding: 16,
            overflowX: 'auto',
            maxHeight: 480,
            overflowY: 'auto',
          }}>{result}</pre>
        )}

        <p style={{ fontFamily: "'proxima-nova', sans-serif", fontSize: 11, color: '#8a8a8a', marginTop: 20, lineHeight: 1.6 }}>
          Dry run parses the live events page without writing anything — use it to validate the scraper
          after any website theme change. Setup requirements are documented in{' '}
          <code>docs/marketing-engine.md</code>.
        </p>
      </div>
    </div>
  );
}
