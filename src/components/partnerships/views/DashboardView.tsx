'use client';

import {
  attentionItems,
  computeMetrics,
  referralBars,
  stageBars,
  typeBars,
  type BarDatum,
} from '../logic';
import type { Partner } from '../types';
import { Btn } from '../ui';

/* ═══════════════════════════════════════════════════════
   Dashboard — hero, metric strip, 2×2 panel block
   (Needs attention · Pipeline stages · Top referral
   sources · Partners by type).
   ═══════════════════════════════════════════════════════ */

function BarRow({
  d,
  modifier,
  onOpen,
}: {
  d: BarDatum;
  modifier?: 'ref' | 'type';
  onOpen?: () => void;
}) {
  const cls = `pcrm-barrow${modifier ? ` pcrm-barrow--${modifier}` : ''}`;
  const inner = (
    <>
      <span className="pcrm-barrow-label">{d.label}</span>
      <span className="pcrm-bartrack">
        <span className="pcrm-barfill" style={{ width: `${d.pct}%`, background: d.color }} />
      </span>
      <span className="pcrm-barrow-n">{d.n}</span>
    </>
  );
  if (onOpen) {
    return (
      <button type="button" className={cls} onClick={onOpen}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function DashboardView({
  partners,
  today,
  onOpenPartner,
  onAdd,
  onGoPipeline,
}: {
  partners: Partner[];
  today: string;
  onOpenPartner: (id: number) => void;
  onAdd: () => void;
  onGoPipeline: () => void;
}) {
  const m = computeMetrics(partners, today);
  const attention = attentionItems(partners, today);

  const metrics = [
    {
      label: 'Active partnerships',
      value: String(m.active),
      sub: '▲ 2 vs. last quarter',
      subColor: 'var(--evergreen)',
    },
    {
      label: 'In pipeline',
      value: String(m.inPipeline),
      sub: `${m.atAgreement} at agreement stage`,
      subColor: 'var(--slate-light)',
    },
    {
      label: 'Client referrals YTD',
      value: String(m.referralsYTD),
      sub: '▲ 18% vs. same period 2025',
      subColor: 'var(--evergreen)',
    },
    {
      label: 'Overdue follow-ups',
      value: String(m.overdue),
      sub: m.overdue ? 'Needs attention' : 'All caught up',
      subColor: m.overdue ? 'var(--berry)' : 'var(--slate-light)',
    },
  ];

  return (
    <div>
      <div className="pcrm-hero">
        <h1 className="pcrm-hero-title">Partners CRM</h1>
        <div className="pcrm-hero-actions">
          <button
            type="button"
            className="pcrm-plus-btn"
            onClick={onAdd}
            aria-label="Add partner"
            title="Add partner"
          >
            +
          </button>
          <Btn variant="secondary" arrow onClick={onGoPipeline}>
            View pipeline
          </Btn>
        </div>
      </div>

      <div className="pcrm-metrics">
        {metrics.map((metric) => (
          <div className="pcrm-metric" key={metric.label}>
            <div className="pcrm-metric-label">{metric.label}</div>
            <div className="pcrm-metric-value">{metric.value}</div>
            <div className="pcrm-metric-sub" style={{ color: metric.subColor }}>
              {metric.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="pcrm-panels">
        <div className="pcrm-panel">
          <div className="pcrm-panel-head">
            <div className="pcrm-panel-label">Needs attention</div>
            <div className="pcrm-panel-note">Overdue and stalling</div>
          </div>
          <div>
            {attention.length === 0 && (
              <p className="pcrm-empty-note">All caught up — nothing needs attention.</p>
            )}
            {attention.map((a) => (
              <button
                type="button"
                className="pcrm-attn-row"
                key={a.partner.id}
                onClick={() => onOpenPartner(a.partner.id)}
              >
                <span className={`pcrm-dot pcrm-dot--${a.kind}`} />
                <span className="pcrm-attn-main">
                  <span className="pcrm-attn-name">{a.partner.name}</span>
                  <span className="pcrm-attn-detail" style={{ display: 'block' }}>
                    {a.detail} · {a.partner.owner}
                  </span>
                </span>
                <span className={`pcrm-attn-tag pcrm-attn-tag--${a.kind}`}>
                  {a.kind === 'overdue' ? 'Overdue' : 'Going stale'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pcrm-panel">
          <div className="pcrm-panel-head">
            <div className="pcrm-panel-label">Pipeline stages</div>
            <div className="pcrm-panel-note">All partners</div>
          </div>
          <div className="pcrm-panel-body">
            {stageBars(partners).map((d) => (
              <BarRow d={d} key={d.label} />
            ))}
          </div>
        </div>

        <div className="pcrm-panel">
          <div className="pcrm-panel-head">
            <div className="pcrm-panel-label">Top referral sources</div>
            <div className="pcrm-panel-note">Jan–Jul 2026</div>
          </div>
          <div className="pcrm-panel-body">
            {referralBars(partners).map((d) => (
              <BarRow
                d={d}
                modifier="ref"
                key={d.label}
                onOpen={d.id === undefined ? undefined : () => onOpenPartner(d.id!)}
              />
            ))}
          </div>
        </div>

        <div className="pcrm-panel">
          <div className="pcrm-panel-head">
            <div className="pcrm-panel-label">Partners by type</div>
            <div className="pcrm-panel-note">Excludes dormant</div>
          </div>
          <div className="pcrm-panel-body">
            {typeBars(partners).map((d) => (
              <BarRow d={d} modifier="type" key={d.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
