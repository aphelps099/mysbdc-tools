'use client';

/**
 * API Troubleshooter — tools.norcalsbdc.org/api-troubleshooter
 *
 * Observe-only diagnostic for the milestone (EI) submission pipeline.
 * Reads Neoserra (GET only) and parses pasted notification emails; writes
 * nothing, and has zero code in the live submission path.
 *
 * Deep links: ?email=..., ?business=..., ?contact=...
 */

import { useCallback, useEffect, useState } from 'react';

/* ── Colors (match milestone-log dashboard) ── */
const c = {
  bg: '#0c1929',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  white: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  rule: 'rgba(255,255,255,0.08)',
  royal: '#1D5AA7',
  pool: '#8FC5D9',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
  purple: '#a78bfa',
};

/* ── Types (mirror server) ── */
interface ValueAnomaly { field: string; issue: string; suggestion?: string }
interface ParsedSubmission {
  contactId: string | null;
  contactEmail: string | null;
  firstName: string | null;
  businessId: string | null;
  milestoneTypes: string[];
  fields: { label: string; value: string }[];
  signature: string | null;
  anomalies: ValueAnomaly[];
}
interface ProbeAttempt { path: string; status: number | string; note: string }
interface ProbeResult { found: boolean; data: unknown; attempts: ProbeAttempt[] }
interface Diagnosis {
  status: string;
  headline: string;
  whatHappened: string;
  likelyIssue: string;
  fix: string;
  emailDraft: { subject: string; body: string };
}
interface InvestigateResponse {
  parsed: ParsedSubmission | null;
  neoserra: { configured: boolean; contact: ProbeResult | null; client: ProbeResult | null; milestones: ProbeResult | null };
  diagnosis: Diagnosis;
}
interface Health {
  neoserraConfigured: boolean;
  backendLog: { available: boolean; days: number; submissions: number; withErrors: number; lastSubmission: string | null };
}

const STATUS_STYLE: Record<string, { color: string; icon: string }> = {
  delivered: { color: c.green, icon: '✅' },
  'lookup-ok': { color: c.green, icon: '✅' },
  missing: { color: c.red, icon: '❌' },
  'lookup-failed': { color: c.red, icon: '❌' },
  unverifiable: { color: c.amber, icon: '🔎' },
  'value-anomaly': { color: c.amber, icon: '🚩' },
  'not-configured': { color: c.textMuted, icon: '⚙️' },
};

export default function ApiTroubleshooterPage() {
  const [mode, setMode] = useState<'lookup' | 'paste'>('lookup');
  const [query, setQuery] = useState('');
  const [pasted, setPasted] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvestigateResponse | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/api-troubleshooter/health')
      .then((r) => (r.ok ? r.json() : null))
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const runInvestigation = useCallback(async (body: Record<string, string>) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch('/api/api-troubleshooter/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
      } else {
        setResult(data as InvestigateResponse);
      }
    } catch {
      setError('Could not reach the troubleshooter API.');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Classify a lookup query string into email / business ID / contact ID. */
  const classifyQuery = (q: string): Record<string, string> => {
    const t = q.trim();
    if (t.includes('@')) return { email: t };
    if (/^\d+$/.test(t)) return { businessId: t };
    return { email: t };
  };

  const submitLookup = () => {
    if (!query.trim()) return;
    const params = classifyQuery(query);
    const url = new URL(window.location.href);
    url.search = params.email ? `?email=${encodeURIComponent(params.email)}` : `?business=${encodeURIComponent(params.businessId ?? '')}`;
    window.history.replaceState(null, '', url.toString());
    runInvestigation(params);
  };

  const submitPaste = () => {
    if (!pasted.trim()) return;
    runInvestigation({ notificationText: pasted });
  };

  // Deep links: ?email= / ?business= / ?contact=
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const email = sp.get('email');
    const business = sp.get('business');
    const contact = sp.get('contact');
    if (email) {
      setQuery(email);
      runInvestigation({ email });
    } else if (business) {
      setQuery(business);
      runInvestigation({ businessId: business });
    } else if (contact) {
      setQuery(contact);
      runInvestigation({ contactId: contact });
    }
  }, [runInvestigation]);

  const copyEmail = async () => {
    if (!result) return;
    const { subject, body } = result.diagnosis.emailDraft;
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Clipboard access was blocked — select and copy the email text manually.');
    }
  };

  const st = result ? STATUS_STYLE[result.diagnosis.status] ?? STATUS_STYLE['unverifiable'] : null;

  const input: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${c.cardBorder}`,
    borderRadius: 8,
    color: c.white,
    padding: '12px 14px',
    fontSize: 15,
    outline: 'none',
  };
  const button: React.CSSProperties = {
    background: c.royal,
    color: c.white,
    border: 'none',
    borderRadius: 8,
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  };
  const card: React.CSSProperties = {
    background: c.card,
    border: `1px solid ${c.cardBorder}`,
    borderRadius: 12,
    padding: 20,
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.white, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>API Troubleshooter</h1>
          <p style={{ color: c.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
            Traces milestone (EI) submissions across the pipeline — website form → Neoserra → notifications —
            and explains failures in plain English with a ready-to-send email.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 13,
              color: c.green,
              marginTop: 6,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.green }} />
            Observe-only — reads Neoserra (GET), writes nothing, zero code in the live form
          </div>
        </div>

        {/* Health strip */}
        {health && (
          <div style={{ ...card, display: 'flex', gap: 28, flexWrap: 'wrap', margin: '20px 0', padding: '14px 20px', fontSize: 13 }}>
            <span style={{ color: health.neoserraConfigured ? c.green : c.amber }}>
              {health.neoserraConfigured ? '● Neoserra connected (read-only)' : '○ Neoserra not configured — parser-only mode'}
            </span>
            <span style={{ color: health.backendLog.available ? c.textSecondary : c.textMuted }}>
              {health.backendLog.available
                ? `Wizard path: ${health.backendLog.submissions} submissions / last ${health.backendLog.days}d${health.backendLog.withErrors ? ` (${health.backendLog.withErrors} with errors)` : ''}`
                : 'Wizard-path log unavailable'}
            </span>
            <span style={{ color: c.textMuted }}>
              WordPress-path submissions: paste the notification email below to trace one
            </span>
          </div>
        )}

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, margin: '20px 0 14px' }}>
          {(
            [
              ['lookup', 'Look up a client'],
              ['paste', 'Paste a notification email'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...button,
                background: mode === m ? c.royal : 'rgba(255,255,255,0.06)',
                color: mode === m ? c.white : c.textSecondary,
                padding: '10px 18px',
                fontSize: 14,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        {mode === 'lookup' ? (
          <div style={{ ...card }}>
            <label style={{ fontSize: 13, color: c.textSecondary }}>
              Client email, business (client) ID, or contact ID
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <input
                style={input}
                value={query}
                placeholder="e.g. bart@woodysbrewing.com or 419762"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitLookup()}
              />
              <button style={button} onClick={submitLookup} disabled={loading}>
                {loading ? 'Checking…' : 'Check'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: c.textMuted, marginTop: 10, marginBottom: 0 }}>
              Runs the same lookup the milestone form uses, live against Neoserra, and explains what it finds.
            </p>
          </div>
        ) : (
          <div style={{ ...card }}>
            <label style={{ fontSize: 13, color: c.textSecondary }}>
              Paste the full body of a &ldquo;New milestone submission — Step 2&rdquo; notification email
              (copied text or HTML source)
            </label>
            <textarea
              style={{ ...input, minHeight: 160, marginTop: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
              value={pasted}
              placeholder={'Contact ID\n536464\nContact Email\nbart@woodysbrewing.com\nSelect Business\n419762\n…'}
              onChange={(e) => setPasted(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button style={button} onClick={submitPaste} disabled={loading}>
                {loading ? 'Tracing…' : 'Trace this submission'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ ...card, borderColor: 'rgba(248,113,113,0.4)', color: c.red, marginTop: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && st && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Verdict */}
            <div style={{ ...card, borderColor: st.color + '55' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{st.icon}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: st.color }}>{result.diagnosis.headline}</span>
              </div>
              <DiagRow label="What happened" text={result.diagnosis.whatHappened} />
              <DiagRow label="Likely issue" text={result.diagnosis.likelyIssue} />
              <DiagRow label="The fix" text={result.diagnosis.fix} />
            </div>

            {/* Anomalies */}
            {result.parsed && result.parsed.anomalies.length > 0 && (
              <div style={{ ...card, borderColor: 'rgba(251,191,36,0.35)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.amber, marginBottom: 10 }}>
                  🚩 Values worth double-checking
                </div>
                {result.parsed.anomalies.map((a, i) => (
                  <div key={i} style={{ fontSize: 14, color: c.textSecondary, marginBottom: 8, lineHeight: 1.5 }}>
                    <strong style={{ color: c.white }}>{a.field}:</strong> {a.issue}
                    {a.suggestion && <span style={{ color: c.pool }}> {a.suggestion}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Copy-ready email */}
            <div style={{ ...card }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>✉️ Ready-to-send email</div>
                <button style={{ ...button, background: copied ? c.green : c.royal, padding: '8px 16px', fontSize: 13 }} onClick={copyEmail}>
                  {copied ? 'Copied!' : 'Copy email'}
                </button>
              </div>
              <div
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${c.rule}`,
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: c.textSecondary,
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                <div style={{ color: c.white, marginBottom: 10 }}>Subject: {result.diagnosis.emailDraft.subject}</div>
                {result.diagnosis.emailDraft.body}
              </div>
            </div>

            {/* Parsed submission */}
            {result.parsed && (
              <div style={{ ...card }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Parsed submission</div>
                <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
                  <tbody>
                    {result.parsed.fields.map((f, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${c.rule}` }}>
                        <td style={{ padding: '7px 10px 7px 0', color: c.textMuted, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{f.label}</td>
                        <td style={{ padding: '7px 0', color: c.textSecondary }}>{f.value || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Technical details */}
            <div>
              <button
                onClick={() => setShowTech(!showTech)}
                style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', padding: 0 }}
              >
                {showTech ? '▾ Hide technical details' : '▸ Show technical details (Neoserra read attempts)'}
              </button>
              {showTech && (
                <div style={{ ...card, marginTop: 10, fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>
                  {!result.neoserra.configured && (
                    <div style={{ color: c.amber, marginBottom: 8 }}>Neoserra credentials not configured on this deployment.</div>
                  )}
                  {(
                    [
                      ['Contact', result.neoserra.contact],
                      ['Client', result.neoserra.client],
                      ['Milestones', result.neoserra.milestones],
                    ] as const
                  ).map(([label, probe]) =>
                    probe ? (
                      <div key={label} style={{ marginBottom: 10 }}>
                        <div style={{ color: c.white, marginBottom: 4 }}>
                          {label}: {probe.found ? 'records found' : 'no records'}
                        </div>
                        {probe.attempts.map((a, i) => (
                          <div key={i} style={{ color: c.textMuted }}>
                            GET {a.path} → {a.status} ({a.note})
                          </div>
                        ))}
                      </div>
                    ) : null,
                  )}
                  <div style={{ color: c.textMuted, marginTop: 6 }}>
                    All requests are GET (read-only). Ground truth for writes: Neoserra → System Administration → API Audit Trail.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DiagRow({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{text}</div>
    </div>
  );
}
