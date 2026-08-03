'use client';

import { OWNERS, STAGES, TYPES, type PartnerType } from '../types';
import { Btn, CloseButton, ModalScrim } from '../ui';

/* ═══════════════════════════════════════════════════════
   Add partner modal (max-width 680). Uncontrolled 2-col
   form; submit defaults per handoff (subtype
   "Organization", city "—", center "Lead Center", …).
   ═══════════════════════════════════════════════════════ */

export type AddPartnerValues = {
  name: string;
  type: string;
  subtype: string;
  city: string;
  center: string;
  stage: string;
  owner: string;
  contact: string;
  contactTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  nextFollowUp: string;
  notes: string;
};

export function AddPartnerModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (values: AddPartnerValues) => void;
  onClose: () => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    onSubmit({
      name: get('name'),
      type: get('type'),
      subtype: get('subtype'),
      city: get('city'),
      center: get('center'),
      stage: get('stage'),
      owner: get('owner'),
      contact: get('contact'),
      contactTitle: get('contactTitle'),
      email: get('email'),
      phone: get('phone'),
      linkedin: get('linkedin'),
      nextFollowUp: get('nextFollowUp'),
      notes: get('notes'),
    });
  };

  return (
    <ModalScrim label="Add partner" widthClass="pcrm-modal--add" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pcrm-modal-head">
          <div className="pcrm-modal-head-main">
            <p className="pcrm-modal-eyebrow">New partnership</p>
            <h2 className="pcrm-modal-title">Add partner</h2>
          </div>
          <CloseButton onClose={onClose} />
        </div>
        <div className="pcrm-formgrid">
          <label className="pcrm-form-field pcrm-form-field--full">
            <span className="pcrm-label">Organization name</span>
            <input
              required
              name="name"
              placeholder="e.g., Redwood Coast Community Bank"
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Type</span>
            <select name="type" className="pcrm-input pcrm-input--full">
              {(Object.keys(TYPES) as PartnerType[]).map((t) => (
                <option value={t} key={t}>
                  {TYPES[t].label}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Category</span>
            <input name="subtype" placeholder="Bank, Chamber, EDC" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">City</span>
            <input name="city" placeholder="Eureka" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Service center</span>
            <input name="center" placeholder="North Coast SBDC" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Stage</span>
            <select name="stage" className="pcrm-input pcrm-input--full">
              {STAGES.map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Owner</span>
            <select name="owner" className="pcrm-input pcrm-input--full">
              {OWNERS.map((o) => (
                <option value={o} key={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Contact name</span>
            <input name="contact" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Contact title</span>
            <input name="contactTitle" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Email</span>
            <input name="email" type="email" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Phone</span>
            <input name="phone" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">LinkedIn</span>
            <input name="linkedin" placeholder="linkedin.com/company/…" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Next follow-up</span>
            <input name="nextFollowUp" type="date" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field pcrm-form-field--full">
            <span className="pcrm-label">Notes</span>
            <textarea name="notes" className="pcrm-input pcrm-input--full pcrm-textarea" />
          </label>
        </div>
        <div className="pcrm-modal-foot">
          <Btn variant="secondary" small onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" small type="submit">
            Add partner
          </Btn>
        </div>
      </form>
    </ModalScrim>
  );
}
