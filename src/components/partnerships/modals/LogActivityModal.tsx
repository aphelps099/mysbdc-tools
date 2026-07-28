'use client';

import { ACT_TYPES } from '../types';
import { Btn, CloseButton, ModalScrim } from '../ui';

/* ═══════════════════════════════════════════════════════
   Log activity modal (max-width 580). Eyebrow = partner
   name; type defaults to Meeting, date to today.
   ═══════════════════════════════════════════════════════ */

export type LogActivityValues = {
  type: string;
  date: string;
  note: string;
  nextFollowUp: string;
};

export function LogActivityModal({
  partnerName,
  today,
  onSubmit,
  onClose,
}: {
  partnerName: string;
  today: string;
  onSubmit: (values: LogActivityValues) => void;
  onClose: () => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    onSubmit({
      type: get('type'),
      date: get('date'),
      note: get('note'),
      nextFollowUp: get('nextFollowUp'),
    });
  };

  return (
    <ModalScrim label={`Log activity for ${partnerName}`} widthClass="pcrm-modal--log" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pcrm-modal-head">
          <div className="pcrm-modal-head-main">
            <p className="pcrm-modal-eyebrow">{partnerName}</p>
            <h2 className="pcrm-modal-title">Log activity</h2>
          </div>
          <CloseButton onClose={onClose} />
        </div>
        <div className="pcrm-formgrid">
          <label className="pcrm-form-field">
            <span className="pcrm-label">Type</span>
            <select name="type" defaultValue="Meeting" className="pcrm-input pcrm-input--full">
              {ACT_TYPES.map((a) => (
                <option value={a} key={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Date</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field pcrm-form-field--full">
            <span className="pcrm-label">What happened</span>
            <textarea
              name="note"
              required
              placeholder="Summary of the conversation"
              className="pcrm-input pcrm-input--full pcrm-textarea"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Next follow-up</span>
            <input name="nextFollowUp" type="date" className="pcrm-input pcrm-input--full" />
          </label>
        </div>
        <div className="pcrm-modal-foot">
          <Btn variant="secondary" small onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" small type="submit">
            Save activity
          </Btn>
        </div>
      </form>
    </ModalScrim>
  );
}
