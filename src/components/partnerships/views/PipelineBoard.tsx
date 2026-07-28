'use client';

import { fmt, initials, isOverdue } from '../logic';
import { OWNERS, STAGES, TYPES, type Partner, type PartnerType } from '../types';

/* ═══════════════════════════════════════════════════════
   Pipeline — six-column stage board. Cards carry a 3px
   type-color left border; footer shows next follow-up
   (berry when overdue) and the owner's initials avatar.
   ═══════════════════════════════════════════════════════ */

export function PipelineBoard({
  partners,
  today,
  pipeType,
  pipeOwner,
  onPipeType,
  onPipeOwner,
  onOpenPartner,
}: {
  partners: Partner[];
  today: string;
  pipeType: string;
  pipeOwner: string;
  onPipeType: (v: string) => void;
  onPipeOwner: (v: string) => void;
  onOpenPartner: (id: number) => void;
}) {
  const rows = partners.filter(
    (p) => (!pipeType || p.type === pipeType) && (!pipeOwner || p.owner === pipeOwner),
  );

  return (
    <div>
      <div className="pcrm-filters">
        <p className="pcrm-eyebrow">
          <span className="pcrm-eyebrow-bar" />
          Pipeline
        </p>
        <select
          className="pcrm-input"
          value={pipeType}
          onChange={(e) => onPipeType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {(Object.keys(TYPES) as PartnerType[]).map((t) => (
            <option value={t} key={t}>
              {TYPES[t].label}
            </option>
          ))}
        </select>
        <select
          className="pcrm-input"
          value={pipeOwner}
          onChange={(e) => onPipeOwner(e.target.value)}
          aria-label="Filter by owner"
        >
          <option value="">All owners</option>
          {OWNERS.map((o) => (
            <option value={o} key={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pcrm-count">
          {rows.length} of {partners.length} partners
        </span>
      </div>

      <div className="pcrm-board">
        {STAGES.map((stage) => {
          const cards = rows.filter((p) => p.stage === stage);
          return (
            <div className="pcrm-col" key={stage}>
              <div className="pcrm-col-head">
                <span className="pcrm-col-name">{stage}</span>
                <span className="pcrm-col-count">{cards.length}</span>
              </div>
              <div className="pcrm-col-cards">
                {cards.map((p) => (
                  <button
                    type="button"
                    className="pcrm-card"
                    key={p.id}
                    style={{ borderLeft: `3px solid ${TYPES[p.type].color}` }}
                    onClick={() => onOpenPartner(p.id)}
                  >
                    <div className="pcrm-card-name">{p.name}</div>
                    <div className="pcrm-card-meta">
                      {p.subtype} · {p.city}
                    </div>
                    <div className="pcrm-card-foot">
                      <span
                        className={`pcrm-card-due${isOverdue(p, today) ? ' pcrm-card-due--overdue' : ''}`}
                      >
                        {p.nextFollowUp ? fmt(p.nextFollowUp, today) : '—'}
                      </span>
                      <span className="pcrm-avatar" title={p.owner}>
                        {initials(p.owner)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
