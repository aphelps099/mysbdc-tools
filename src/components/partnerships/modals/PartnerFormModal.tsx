'use client';

import { OWNERS, STAGES, TYPES, type Partner, type PartnerType } from '../types';
import { Btn, CloseButton, ModalScrim } from '../ui';

/* ═══════════════════════════════════════════════════════
   Partner form modal (max-width 680) — one form for both
   "Add partner" and "Edit partner" (pass `partner` to
   prefill). Uncontrolled 2-col form; the app applies
   add-mode defaults on submit (subtype "Organization",
   city "—", center "Lead Center", …).
   ═══════════════════════════════════════════════════════ */

export type PartnerFormValues = {
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
  contact2: string;
  contact2Title: string;
  email2: string;
  phone2: string;
  nextFollowUp: string;
  notes: string;
};

export function PartnerFormModal({
  partner,
  onSubmit,
  onClose,
}: {
  partner?: Partner; // present = edit mode
  onSubmit: (values: PartnerFormValues) => void;
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
      contact2: get('contact2'),
      contact2Title: get('contact2Title'),
      email2: get('email2'),
      phone2: get('phone2'),
      nextFollowUp: get('nextFollowUp'),
      notes: get('notes'),
    });
  };

  const editing = Boolean(partner);

  return (
    <ModalScrim
      label={editing ? `Edit ${partner!.name}` : 'Add partner'}
      widthClass="pcrm-modal--add"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="pcrm-modal-head">
          <div className="pcrm-modal-head-main">
            <p className="pcrm-modal-eyebrow">{editing ? partner!.name : 'New partnership'}</p>
            <h2 className="pcrm-modal-title">{editing ? 'Edit partner' : 'Add partner'}</h2>
          </div>
          <CloseButton onClose={onClose} />
        </div>
        <div className="pcrm-formgrid">
          <label className="pcrm-form-field pcrm-form-field--full">
            <span className="pcrm-label">Organization name</span>
            <input
              required
              name="name"
              defaultValue={partner?.name}
              placeholder="e.g., Redwood Coast Community Bank"
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Type</span>
            <select name="type" defaultValue={partner?.type} className="pcrm-input pcrm-input--full">
              {(Object.keys(TYPES) as PartnerType[]).map((t) => (
                <option value={t} key={t}>
                  {TYPES[t].label}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Category</span>
            <input
              name="subtype"
              defaultValue={partner?.subtype}
              placeholder="Bank, Chamber, EDC"
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">City</span>
            <input name="city" defaultValue={partner?.city} placeholder="Eureka" className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Service center</span>
            <input
              name="center"
              defaultValue={partner?.center}
              placeholder="North Coast SBDC"
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Stage</span>
            <select name="stage" defaultValue={partner?.stage} className="pcrm-input pcrm-input--full">
              {STAGES.map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Owner</span>
            <select name="owner" defaultValue={partner?.owner} className="pcrm-input pcrm-input--full">
              {OWNERS.map((o) => (
                <option value={o} key={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Contact name</span>
            <input name="contact" defaultValue={partner?.contact} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Contact title</span>
            <input name="contactTitle" defaultValue={partner?.contactTitle} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Email</span>
            <input name="email" type="email" defaultValue={partner?.email} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Phone</span>
            <input name="phone" defaultValue={partner?.phone} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">LinkedIn</span>
            <input
              name="linkedin"
              defaultValue={partner?.linkedin}
              placeholder="linkedin.com/company/…"
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Next follow-up</span>
            <input
              name="nextFollowUp"
              type="date"
              defaultValue={partner?.nextFollowUp}
              className="pcrm-input pcrm-input--full"
            />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Secondary contact</span>
            <input name="contact2" defaultValue={partner?.contact2} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Secondary title</span>
            <input name="contact2Title" defaultValue={partner?.contact2Title} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Secondary email</span>
            <input name="email2" type="email" defaultValue={partner?.email2} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field">
            <span className="pcrm-label">Secondary phone</span>
            <input name="phone2" defaultValue={partner?.phone2} className="pcrm-input pcrm-input--full" />
          </label>
          <label className="pcrm-form-field pcrm-form-field--full">
            <span className="pcrm-label">Notes</span>
            <textarea
              name="notes"
              defaultValue={partner?.notes}
              className="pcrm-input pcrm-input--full pcrm-textarea"
            />
          </label>
        </div>
        <div className="pcrm-modal-foot">
          <Btn variant="secondary" small onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" small type="submit">
            {editing ? 'Save changes' : 'Add partner'}
          </Btn>
        </div>
      </form>
    </ModalScrim>
  );
}
