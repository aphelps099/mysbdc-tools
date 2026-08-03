'use client';

import { buildFollowUpMailto } from '../followup';
import { daysAgo, fmt, isOverdue } from '../logic';
import { track } from '../track';
import { OWNERS, STAGES, TYPES, type Partner } from '../types';
import { Btn, CloseButton, ModalScrim } from '../ui';

/* ═══════════════════════════════════════════════════════
   Partner detail modal (max-width 720). Field grid, then
   editable Stage/Owner drafts (committed on "Save
   changes"), notes, and activity history.
   ═══════════════════════════════════════════════════════ */

export function PartnerDetailModal({
  partner,
  today,
  dStage,
  dOwner,
  onDStage,
  onDOwner,
  onSave,
  onLogActivity,
  onClose,
}: {
  partner: Partner;
  today: string;
  dStage: string;
  dOwner: string;
  onDStage: (v: string) => void;
  onDOwner: (v: string) => void;
  onSave: () => void;
  onLogActivity: () => void;
  onClose: () => void;
}) {
  const overdue = isOverdue(partner, today);
  const history = partner.activities
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const fields: { label: string; value: React.ReactNode; hint: React.ReactNode; valueClass?: string }[] = [
    { label: 'Primary contact', value: partner.contact, hint: partner.contactTitle },
    {
      label: 'Reach',
      value: <a href={`mailto:${partner.email}`}>{partner.email}</a>,
      hint: (
        <>
          {partner.phone}
          {partner.linkedin && (
            <>
              {partner.phone ? ' · ' : ''}
              <a href={partner.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </>
          )}
        </>
      ),
      valueClass: 'pcrm-field-value--reach',
    },
    {
      label: 'Referrals YTD',
      value: String(partner.referrals || 0),
      hint: 'Clients sent to SBDC',
      valueClass: 'pcrm-field-value--stat',
    },
    {
      label: 'Last contact',
      value: fmt(partner.lastContact, today),
      hint: `${daysAgo(partner.lastContact, today)} days ago`,
    },
    {
      label: 'Next follow-up',
      value: fmt(partner.nextFollowUp, today),
      hint: overdue ? 'Overdue' : 'On schedule',
      valueClass: overdue ? 'pcrm-field-value--overdue' : undefined,
    },
    { label: 'Service center', value: partner.center, hint: partner.city },
  ];

  return (
    <ModalScrim label={partner.name} onClose={onClose}>
      <div className="pcrm-modal-head">
        <div className="pcrm-modal-head-main">
          <p className="pcrm-modal-eyebrow">{TYPES[partner.type].label}</p>
          <h2 className="pcrm-modal-title">{partner.name}</h2>
          <p className="pcrm-modal-sub">
            {partner.subtype} · {partner.city} · {partner.center}
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </div>

      <div className="pcrm-detail-body">
        <div className="pcrm-fieldgrid">
          {fields.map((f) => (
            <div className="pcrm-field" key={f.label}>
              <div className="pcrm-field-label">{f.label}</div>
              <div className={`pcrm-field-value ${f.valueClass ?? ''}`.trim()}>{f.value}</div>
              <div className="pcrm-field-hint">{f.hint}</div>
            </div>
          ))}
        </div>

        <div className="pcrm-detail-selects">
          <label className="pcrm-form-field">
            <span className="pcrm-label">Stage</span>
            <select
              className="pcrm-input pcrm-input--full"
              value={dStage}
              onChange={(e) => onDStage(e.target.value)}
            >
              {STAGES.map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Owner</span>
            <select
              className="pcrm-input pcrm-input--full"
              value={dOwner}
              onChange={(e) => onDOwner(e.target.value)}
            >
              {OWNERS.map((o) => (
                <option value={o} key={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="pcrm-detail-notes">
          <div className="pcrm-field-label">Notes</div>
          <p>{partner.notes}</p>
        </div>

        <div className="pcrm-history">
          <div className="pcrm-history-label">Activity history ({partner.activities.length})</div>
          {history.map((a, i) => (
            <div className="pcrm-history-row" key={`${a.date}-${i}`}>
              <div className="pcrm-history-date">{fmt(a.date, today)}</div>
              <div className="pcrm-history-note">
                <span className="pcrm-history-type">{a.type}</span>
                {a.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pcrm-modal-foot pcrm-modal-foot--sticky">
        {partner.email && (
          <a
            className="pcrm-btn pcrm-btn--secondary pcrm-btn--sm"
            href={buildFollowUpMailto(partner, today)}
            onClick={() => track('followup_draft', { id: partner.id, name: partner.name })}
          >
            Draft follow-up
          </a>
        )}
        <Btn variant="secondary" small onClick={onLogActivity}>
          Log activity
        </Btn>
        <Btn variant="primary" small onClick={onSave}>
          Save changes
        </Btn>
      </div>
    </ModalScrim>
  );
}
