'use client';

import type { TFGApplicationData, TeamMember } from '../types';

interface Props {
  data: TFGApplicationData;
  onChange: (patch: Partial<TFGApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function CharCount({ current, max }: { current: number; max: number }) {
  const cls = current > max ? 'tfg-char-count tfg-char-over'
    : current > max * 0.9 ? 'tfg-char-count tfg-char-warning'
    : 'tfg-char-count';
  return <div className={cls}>{current}/{max}</div>;
}

export default function TeamStep({ data, onChange, onNext, onBack }: Props) {
  const addMember = () => {
    onChange({
      teamMembers: [...data.teamMembers, { name: '', linkedinUrl: '' }],
    });
  };

  const updateMember = (index: number, patch: Partial<TeamMember>) => {
    const members = data.teamMembers.map((m, i) =>
      i === index ? { ...m, ...patch } : m
    );
    onChange({ teamMembers: members });
  };

  const removeMember = (index: number) => {
    const members = data.teamMembers.filter((_, i) => i !== index);
    onChange({ teamMembers: members.length > 0 ? members : [{ name: '', linkedinUrl: '' }] });
  };

  const valid =
    data.teamMembers.length > 0 &&
    data.teamMembers[0].name.trim() !== '' &&
    data.teamFit.trim() &&
    data.timeWorking.trim() &&
    data.teamFit.length <= 500;

  return (
    <div className="s641-step">
      <h2 className="s641-question">Team</h2>
      <p className="s641-subtitle">Tell us about the people building this company.</p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">Cofounders &amp; Team *</label>
          <p className="s641-hint">Add each team member&rsquo;s name and LinkedIn URL.</p>

          <div style={{ marginTop: 4 }}>
            {data.teamMembers.map((member, i) => (
              <div key={i} className="tfg-team-row">
                <div className="s641-field">
                  {i === 0 && <label className="s641-label" style={{ fontSize: 10 }}>Name</label>}
                  <input
                    className="s641-input"
                    placeholder="Jane Smith"
                    value={member.name}
                    onChange={(e) => updateMember(i, { name: e.target.value })}
                  />
                </div>
                <div className="s641-field">
                  {i === 0 && <label className="s641-label" style={{ fontSize: 10 }}>LinkedIn URL</label>}
                  <input
                    className="s641-input"
                    placeholder="https://linkedin.com/in/..."
                    value={member.linkedinUrl}
                    onChange={(e) => updateMember(i, { linkedinUrl: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="tfg-remove-row"
                  onClick={() => removeMember(i)}
                  title="Remove"
                  style={i === 0 ? { marginTop: 18 } : undefined}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {data.teamMembers.length < 10 && (
            <button type="button" className="tfg-add-row" onClick={addMember}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add team member
            </button>
          )}
        </div>

        <div className="s641-field">
          <label className="s641-label">Why is your team uniquely suited to build this company? *</label>
          <textarea
            className="s641-input s641-textarea"
            maxLength={500}
            rows={4}
            placeholder="What makes your team the right one for this?"
            value={data.teamFit}
            onChange={(e) => onChange({ teamFit: e.target.value })}
          />
          <CharCount current={data.teamFit.length} max={500} />
        </div>

        <div className="s641-field">
          <label className="s641-label">How long have you been working on this? *</label>
          <input
            className="s641-input"
            placeholder="e.g. 18 months, 2 years..."
            value={data.timeWorking}
            onChange={(e) => onChange({ timeWorking: e.target.value })}
          />
        </div>
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="s641-btn s641-btn-primary" disabled={!valid} onClick={onNext}>
          Continue
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
