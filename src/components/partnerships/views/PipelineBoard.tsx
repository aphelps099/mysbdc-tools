'use client';

import { useState } from 'react';
import { fmt, initials, isOverdue } from '../logic';
import { OWNERS, STAGES, TYPES, type Partner, type PartnerType, type Stage } from '../types';
import { Btn, CloseButton, ModalScrim } from '../ui';

/* ═══════════════════════════════════════════════════════
   Pipeline — six-column stage board. Cards carry a 3px
   type-color left border; footer shows next follow-up
   (berry when overdue) and the owner's initials avatar.

   Cards are draggable between columns (native HTML5 DnD,
   no library); dropping on another stage asks for
   confirmation before committing. Click still opens the
   detail modal, which stays the keyboard/touch path for
   changing stage.
   ═══════════════════════════════════════════════════════ */

export function PipelineBoard({
  partners,
  today,
  pipeType,
  pipeOwner,
  onPipeType,
  onPipeOwner,
  onOpenPartner,
  onMoveStage,
}: {
  partners: Partner[];
  today: string;
  pipeType: string;
  pipeOwner: string;
  onPipeType: (v: string) => void;
  onPipeOwner: (v: string) => void;
  onOpenPartner: (id: number) => void;
  onMoveStage: (id: number, stage: Stage) => void;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [dropStage, setDropStage] = useState<Stage | null>(null);
  const [pending, setPending] = useState<{ partner: Partner; to: Stage } | null>(null);

  const rows = partners.filter(
    (p) => (!pipeType || p.type === pipeType) && (!pipeOwner || p.owner === pipeOwner),
  );

  const endDrag = () => {
    setDragId(null);
    setDropStage(null);
  };

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
            <div
              className={`pcrm-col${dropStage === stage && dragId !== null ? ' is-dropover' : ''}`}
              key={stage}
              onDragOver={(e) => {
                if (dragId === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dropStage !== stage) setDropStage(stage);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData('text/plain')) || dragId;
                endDrag();
                const partner = partners.find((p) => p.id === id);
                if (partner && partner.stage !== stage) setPending({ partner, to: stage });
              }}
            >
              <div className="pcrm-col-head">
                <span className="pcrm-col-name">{stage}</span>
                <span className="pcrm-col-count">{cards.length}</span>
              </div>
              <div className="pcrm-col-cards">
                {cards.map((p) => (
                  <button
                    type="button"
                    className={`pcrm-card${dragId === p.id ? ' is-dragging' : ''}`}
                    key={p.id}
                    style={{ borderLeft: `3px solid ${TYPES[p.type].color}` }}
                    onClick={() => onOpenPartner(p.id)}
                    draggable
                    onDragStart={(e) => {
                      setDragId(p.id);
                      e.dataTransfer.setData('text/plain', String(p.id));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={endDrag}
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

      {pending && (
        <ModalScrim
          label={`Move ${pending.partner.name} to ${pending.to}`}
          widthClass="pcrm-modal--confirm"
          onClose={() => setPending(null)}
        >
          <div className="pcrm-modal-head">
            <div className="pcrm-modal-head-main">
              <p className="pcrm-modal-eyebrow">{pending.partner.name}</p>
              <h2 className="pcrm-modal-title">Move to {pending.to}?</h2>
              <p className="pcrm-modal-sub">
                {pending.partner.stage} → {pending.to}
              </p>
            </div>
            <CloseButton onClose={() => setPending(null)} />
          </div>
          <div className="pcrm-modal-foot">
            <Btn variant="secondary" small onClick={() => setPending(null)}>
              Cancel
            </Btn>
            <Btn
              variant="primary"
              small
              onClick={() => {
                onMoveStage(pending.partner.id, pending.to);
                setPending(null);
              }}
            >
              Move partner
            </Btn>
          </div>
        </ModalScrim>
      )}
    </div>
  );
}
