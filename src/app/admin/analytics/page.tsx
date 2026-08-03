'use client';

import { useEffect, useState } from 'react';
import type { AnalyticsSummary } from '@/lib/analytics-store';

/* ═══════════════════════════════════════════════════════
   /admin/analytics — usage analytics dashboard.
   Logins and click-around events across the tools (today
   the Partnership CRM reports events; logins cover every
   scope). Admin sessions only: tool-scoped sessions are
   blocked from /admin/* and /api/analytics/summary by
   middleware.
   ═══════════════════════════════════════════════════════ */

const SERA = "'proxima-sera', Georgia, 'Times New Roman', serif";
const NOVA = "'proxima-nova', Arial, Helvetica, sans-serif";

const NAVY = '#0f1c2d';
const SLATE = '#2c3240';
const SLATE_LIGHT = '#687080';
const LINE = '#0f1c2d29';
const BERRY = '#c23c3c';
const POOL_PALE = '#dcecf2';

const EVENT_LABELS: Record<string, string> = {
  login: 'Logins',
  app_open: 'CRM opens',
  view: 'View switches',
  partner_open: 'Partner opens',
  partner_add: 'Partners added',
  partner_save: 'Partners saved',
  partner_edit: 'Partners edited',
  partner_archive: 'Archives/restores',
  partner_delete: 'Partners deleted',
  stage_move: 'Pipeline moves',
  activity_log: 'Activities logged',
  followup_draft: 'Follow-up drafts',
  calendar_add: 'Calendar adds',
  csv_export: 'CSV exports',
  digest_sent: 'Digests sent',
};

const label = (event: string) => EVENT_LABELS[event] || event;

const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  color: SLATE_LIGHT,
  padding: '12px 14px',
  borderBottom: `2px solid ${NAVY}`,
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: 13.5,
  borderBottom: `1px solid ${LINE}`,
  verticalAlign: 'top',
};
const tdNum: React.CSSProperties = { ...td, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
const panelLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  paddingBottom: 14,
  borderBottom: `1px solid ${LINE}`,
};

function fmtTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function metaText(meta?: Record<string, string | number>): string {
  if (!meta) return '';
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics/summary')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(setSummary)
      .catch(() => setError('Couldn’t load analytics.'));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fdfdfd',
        color: NAVY,
        fontFamily: NOVA,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 34px 90px' }}>
        <div style={{ padding: '52px 0 26px', borderBottom: `3px solid ${NAVY}` }}>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '0 0 18px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.17em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 33, height: 3, background: BERRY }} />
            NorCal SBDC Tools
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: SERA,
              fontWeight: 400,
              fontSize: 'clamp(40px,4.2vw,56px)',
              letterSpacing: '-.05em',
              lineHeight: 0.95,
            }}
          >
            Usage analytics
          </h1>
          <p style={{ margin: '14px 0 0', fontSize: 15, color: SLATE }}>
            Logins and click-around events, most recent first.
          </p>
        </div>

        {error && (
          <p style={{ marginTop: 30, fontSize: 14, fontWeight: 700, color: BERRY }}>{error}</p>
        )}
        {!summary && !error && (
          <p style={{ marginTop: 30, fontSize: 14, color: SLATE_LIGHT }}>Loading…</p>
        )}

        {summary && (
          <>
            {/* totals by event type */}
            <div
              style={{
                marginTop: 34,
                border: `1px solid ${LINE}`,
                borderTop: `5px solid ${BERRY}`,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 1,
                background: LINE,
              }}
            >
              {Object.entries(EVENT_LABELS)
                .filter(([event]) => summary.totalsByEvent[event])
                .map(([event, name]) => (
                  <div key={event} style={{ background: '#fdfdfd', padding: '22px 22px 24px' }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '.13em',
                        textTransform: 'uppercase',
                        color: SLATE_LIGHT,
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontFamily: SERA,
                        fontSize: 44,
                        lineHeight: 0.9,
                        letterSpacing: '-.05em',
                      }}
                    >
                      {summary.totalsByEvent[event]}
                    </div>
                  </div>
                ))}
              {summary.totalEvents === 0 && (
                <div style={{ background: '#fdfdfd', padding: 30, fontSize: 13, color: SLATE_LIGHT }}>
                  No events yet — they start recording as soon as someone logs in or opens the CRM.
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 26,
                border: `1px solid ${LINE}`,
                display: 'grid',
                gridTemplateColumns: '1fr 1.6fr',
                gap: 1,
                background: LINE,
              }}
            >
              {/* by day */}
              <div style={{ background: '#fdfdfd', padding: '24px 26px 28px' }}>
                <div style={panelLabel}>Last 30 days</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 2 }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={{ ...th, textAlign: 'right' }}>Logins</th>
                      <th style={{ ...th, textAlign: 'right' }}>Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.days.map((d) => (
                      <tr key={d.date}>
                        <td style={tdNum}>{d.date}</td>
                        <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{d.logins}</td>
                        <td style={{ ...tdNum, textAlign: 'right' }}>{d.events}</td>
                      </tr>
                    ))}
                    {summary.days.length === 0 && (
                      <tr>
                        <td style={{ ...td, color: SLATE_LIGHT }} colSpan={3}>
                          Nothing yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* recent events */}
              <div style={{ background: '#fdfdfd', padding: '24px 26px 28px' }}>
                <div style={panelLabel}>Recent events</div>
                <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 2 }}>
                    <thead>
                      <tr>
                        <th style={th}>When</th>
                        <th style={th}>Who</th>
                        <th style={th}>Event</th>
                        <th style={th}>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recent.map((e, i) => (
                        <tr key={`${e.ts}-${i}`}>
                          <td style={tdNum}>{fmtTime(e.ts)}</td>
                          <td style={td}>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: 10.5,
                                fontWeight: 800,
                                letterSpacing: '.1em',
                                textTransform: 'uppercase',
                                color: NAVY,
                                background: POOL_PALE,
                                borderRadius: 3,
                                padding: '3px 8px',
                              }}
                            >
                              {e.scope}
                            </span>
                          </td>
                          <td style={{ ...td, whiteSpace: 'nowrap' }}>{label(e.event)}</td>
                          <td style={{ ...td, color: SLATE_LIGHT, fontSize: 12.5 }}>
                            {metaText(e.meta)}
                          </td>
                        </tr>
                      ))}
                      {summary.recent.length === 0 && (
                        <tr>
                          <td style={{ ...td, color: SLATE_LIGHT }} colSpan={4}>
                            Nothing yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
