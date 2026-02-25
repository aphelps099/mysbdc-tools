'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   ATLAS — NorCal SBDC Impact Dashboard
   ══════════════════════════════════════════════════════════════ */

/* ── Types ── */
interface ImpactData {
  period: string;
  since: string;
  capital_accessed: number;
  jobs_created: number;
  jobs_ft: number;
  jobs_pt: number;
  businesses_started: number;
  revenue_growth: number;
  by_center: CenterImpact[];
  recent: RecentEvent[];
  total_submissions: number;
}

interface CenterImpact {
  center_id: string;
  center_name?: string;
  capital: number;
  jobs: number;
  businesses: number;
  revenue: number;
  clients: number;
}

interface RecentEvent {
  timestamp: string;
  client_name: string;
  center_id: string;
  category: string;
  delta: number;
  submitter_name: string;
  client_public_id: string;
}

interface CenterGeo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
}

type Period = 'this_month' | 'quarter' | 'ytd' | 'all_time';

const periods: { key: Period; label: string }[] = [
  { key: 'this_month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'ytd', label: 'Year to Date' },
  { key: 'all_time', label: 'All Time' },
];

/* ── Format helpers ── */
function fmtDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${n.toLocaleString()}`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function relTime(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60_000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch { return ''; }
}

/* ── Animated counter ── */
function useCounter(target: number, dur = 1000): number {
  const [val, setVal] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, dur]);

  return val;
}

/* ── Category meta ── */
const catLabel: Record<string, string> = {
  capital: 'Capital',
  jobs_ft: 'Full-time jobs',
  jobs_pt: 'Part-time jobs',
  revenue: 'Revenue',
  business_start: 'New business',
};

const catFmt: Record<string, (n: number) => string> = {
  capital: fmtDollar,
  jobs_ft: (n) => `+${n} FT`,
  jobs_pt: (n) => `+${n} PT`,
  revenue: fmtDollar,
  business_start: () => 'Started',
};

/* ── Font stacks ── */
const mono = '"SF Mono", "Fira Code", Menlo, Consolas, monospace';
const sans = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

/* ══════════════════════════════════════════════════════════════ */

export default function AtlasPage() {
  const [period, setPeriod] = useState<Period>('ytd');
  const [data, setData] = useState<ImpactData | null>(null);
  const [centers, setCenters] = useState<CenterGeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/atlas/impact?period=${period}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [period]);

  const fetchCenters = useCallback(async () => {
    try {
      const res = await fetch('/api/atlas/centers');
      if (res.ok) {
        const json = await res.json();
        setCenters(json.centers || []);
      }
    } catch { /* optional */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchCenters(); }, [fetchCenters]);
  useEffect(() => {
    const iv = setInterval(fetchData, 60_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  /* Animated KPIs */
  const capital = useCounter(data?.capital_accessed ?? 0);
  const jobs = useCounter(data?.jobs_created ?? 0);
  const biz = useCounter(data?.businesses_started ?? 0);
  const rev = useCounter(data?.revenue_growth ?? 0);

  /* Center name lookup */
  const centerNameMap = new Map(centers.map(ct => [ct.id, ct.name]));
  const centerCityMap = new Map(centers.map(ct => [ct.id, ct.city]));

  /* Sort centers by total impact */
  const rankedCenters = [...(data?.by_center ?? [])].sort(
    (a, b) => (b.capital + b.revenue) - (a.capital + a.revenue)
  );

  return (
    <>
      <style>{`
        @keyframes atlasIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
        ::selection { background: #1D5AA7; color: #fff; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#fafaf9',
        fontFamily: sans,
        color: '#333',
        animation: 'atlasIn 0.4s ease both',
      }}>

        {/* ─── Header ─── */}
        <header style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '48px 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <p style={{
              fontSize: 11,
              fontFamily: mono,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#aaa',
              marginBottom: 6,
            }}>
              NorCal SBDC
            </p>
            <h1 style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: '#111',
            }}>
              ATLAS
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: period === p.key ? 600 : 400,
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: period === p.key ? '#111' : 'transparent',
                  color: period === p.key ? '#fff' : '#999',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </header>

        <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

          {/* Loading */}
          {loading && !data && (
            <div style={{ padding: '120px 0', textAlign: 'center', color: '#ccc', fontSize: 14 }}>
              Loading...
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 32,
              padding: '16px 20px',
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: 4,
              fontSize: 14,
              color: '#b91c1c',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>{error}</span>
              <button
                onClick={fetchData}
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  padding: '4px 12px',
                  border: '1px solid #fecaca',
                  borderRadius: 3,
                  background: 'transparent',
                  color: '#b91c1c',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {data && (
            <>
              {/* ═══════════ KPIs ═══════════ */}
              <section style={{
                marginTop: 56,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderTop: '2px solid #111',
                borderBottom: '1px solid #e5e5e5',
              }}>
                <KPI
                  label="Capital Accessed"
                  value={fmtDollar(capital)}
                  detail={data.capital_accessed > 0 ? `${fmtDollar(data.capital_accessed)} total` : undefined}
                  last={false}
                />
                <KPI
                  label="Jobs Created"
                  value={fmtNum(jobs)}
                  detail={data.jobs_ft > 0 || data.jobs_pt > 0 ? `${data.jobs_ft} full-time, ${data.jobs_pt} part-time` : undefined}
                  last={false}
                />
                <KPI
                  label="Businesses Started"
                  value={fmtNum(biz)}
                  last={false}
                />
                <KPI
                  label="Revenue Growth"
                  value={fmtDollar(rev)}
                  last={true}
                />
              </section>


              {/* ═══════════ By Center ═══════════ */}
              {rankedCenters.length > 0 && (
                <section style={{ marginTop: 64 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 16,
                  }}>
                    <h2 style={{
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: '#111',
                    }}>
                      By Center
                    </h2>
                    <span style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: '#aaa',
                    }}>
                      {rankedCenters.length} of {centers.length} reporting
                    </span>
                  </div>

                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #111' }}>
                        <th style={thStyle}>Center</th>
                        <th style={{ ...thStyle, ...thRight }}>Capital</th>
                        <th style={{ ...thStyle, ...thRight }}>Jobs</th>
                        <th style={{ ...thStyle, ...thRight }}>Businesses</th>
                        <th style={{ ...thStyle, ...thRight }}>Revenue</th>
                        <th style={{ ...thStyle, ...thRight }}>Clients</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedCenters.map((row) => {
                        const name = row.center_name || centerNameMap.get(row.center_id) || `Center ${row.center_id}`;
                        const city = centerCityMap.get(row.center_id);
                        return (
                          <tr key={row.center_id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                            <td style={{ padding: '12px 0' }}>
                              <span style={{ fontWeight: 500, color: '#111' }}>{name}</span>
                              {city && (
                                <span style={{
                                  display: 'block',
                                  fontSize: 11,
                                  color: '#aaa',
                                  marginTop: 1,
                                }}>{city}</span>
                              )}
                            </td>
                            <td style={tdRight}>{row.capital > 0 ? fmtDollar(row.capital) : '\u2014'}</td>
                            <td style={tdRight}>{row.jobs > 0 ? fmtNum(row.jobs) : '\u2014'}</td>
                            <td style={tdRight}>{row.businesses > 0 ? fmtNum(row.businesses) : '\u2014'}</td>
                            <td style={tdRight}>{row.revenue > 0 ? fmtDollar(row.revenue) : '\u2014'}</td>
                            <td style={tdRight}>{row.clients > 0 ? fmtNum(row.clients) : '\u2014'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              )}


              {/* ═══════════ Recent Activity ═══════════ */}
              <section style={{ marginTop: 64 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 16,
                }}>
                  <h2 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    color: '#111',
                  }}>
                    Recent Activity
                  </h2>
                  <span style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: '#aaa',
                  }}>
                    {data.total_submissions} total
                  </span>
                </div>

                {data.recent.length === 0 ? (
                  <div style={{
                    padding: '48px 0',
                    textAlign: 'center',
                    color: '#ccc',
                    fontSize: 14,
                    borderTop: '1px solid #e5e5e5',
                  }}>
                    No submissions for this period yet.
                  </div>
                ) : (
                  <div style={{ borderTop: '2px solid #111' }}>
                    {data.recent.map((ev, i) => {
                      const fmt = catFmt[ev.category];
                      const label = catLabel[ev.category] || ev.category;
                      const cName = centerNameMap.get(ev.center_id);
                      return (
                        <div
                          key={i}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '48px 140px 1fr auto',
                            gap: 16,
                            padding: '12px 0',
                            borderBottom: '1px solid #e5e5e5',
                            alignItems: 'baseline',
                            fontSize: 13,
                          }}
                        >
                          <span style={{
                            fontFamily: mono,
                            fontSize: 11,
                            color: '#bbb',
                          }}>
                            {relTime(ev.timestamp)}
                          </span>
                          <span style={{ color: '#111', fontWeight: 500 }}>
                            {fmt ? fmt(ev.delta) : label}
                            <span style={{ fontWeight: 400, color: '#999', marginLeft: 6, fontSize: 12 }}>
                              {label}
                            </span>
                          </span>
                          <span style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.client_name}
                          </span>
                          {cName && (
                            <span style={{
                              fontFamily: mono,
                              fontSize: 11,
                              color: '#ccc',
                              textAlign: 'right',
                            }}>
                              {cName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        {/* ─── Footer ─── */}
        <footer style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '64px 24px 32px',
        }}>
          <div style={{
            borderTop: '1px solid #e5e5e5',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 11,
            color: '#bbb',
          }}>
            <span>Aggregate Tracking & Layered Analytics System</span>
            <span>Funded in part through a cooperative agreement with the U.S. Small Business Administration</span>
          </div>
          <div style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: '#ccc',
          }}>
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#34d399',
            }} />
            <span>Live &middot; refreshes every 60s</span>
          </div>
        </footer>
      </div>
    </>
  );
}


/* ── KPI Block ── */
function KPI({ label, value, detail, last }: { label: string; value: string; detail?: string; last: boolean }) {
  return (
    <div style={{
      padding: '28px 20px 24px 0',
      borderRight: last ? 'none' : '1px solid #e5e5e5',
    }}>
      <p style={{
        fontFamily: mono,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#888',
        marginBottom: 8,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 38,
        fontWeight: 300,
        letterSpacing: '-0.03em',
        color: '#111',
        lineHeight: 1,
      }}>
        {value}
      </p>
      {detail && (
        <p style={{
          fontFamily: mono,
          fontSize: 11,
          color: '#aaa',
          marginTop: 8,
        }}>
          {detail}
        </p>
      )}
    </div>
  );
}


/* ── Table styles ── */
const thStyle: React.CSSProperties = {
  padding: '10px 0',
  fontWeight: 600,
  fontSize: 11,
  fontFamily: mono,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#111',
  textAlign: 'left',
};

const thRight: React.CSSProperties = {
  textAlign: 'right',
  paddingLeft: 16,
};

const tdRight: React.CSSProperties = {
  textAlign: 'right',
  padding: '12px 0 12px 16px',
  fontFamily: mono,
  fontSize: 13,
  color: '#333',
};
