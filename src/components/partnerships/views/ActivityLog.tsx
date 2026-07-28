'use client';

import { activityFeed, fmt } from '../logic';
import { ACT_TYPES, type Partner } from '../types';

/* ═══════════════════════════════════════════════════════
   Activity — flattened log of every partner activity,
   date desc. Rows open that partner's detail modal.
   ═══════════════════════════════════════════════════════ */

export function ActivityLog({
  partners,
  today,
  actType,
  onActType,
  onOpenPartner,
}: {
  partners: Partner[];
  today: string;
  actType: string;
  onActType: (v: string) => void;
  onOpenPartner: (id: number) => void;
}) {
  const feed = activityFeed(partners, actType);

  return (
    <div>
      <div className="pcrm-filters">
        <p className="pcrm-eyebrow">
          <span className="pcrm-eyebrow-bar" />
          Activity log
        </p>
        <select
          className="pcrm-input"
          value={actType}
          onChange={(e) => onActType(e.target.value)}
          aria-label="Filter by activity type"
        >
          <option value="">All activity types</option>
          {ACT_TYPES.map((a) => (
            <option value={a} key={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="pcrm-count">{feed.length} logged activities</span>
      </div>

      <div className="pcrm-feed">
        {feed.map((f, i) => (
          <button
            type="button"
            className="pcrm-feed-row"
            key={`${f.partner.id}-${f.date}-${i}`}
            onClick={() => onOpenPartner(f.partner.id)}
          >
            <span className="pcrm-feed-date">{fmt(f.date, today)}</span>
            <span className="pcrm-feed-type">{f.type}</span>
            <span>
              <span className="pcrm-feed-partner" style={{ display: 'block' }}>
                {f.partner.name}
              </span>
              <span className="pcrm-feed-note" style={{ display: 'block' }}>
                {f.note}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
