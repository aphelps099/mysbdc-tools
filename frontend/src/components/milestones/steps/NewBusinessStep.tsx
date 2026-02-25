'use client';

import type { MilestoneData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const STRUCTURE_KEYS = [
  { key: 'newbiz.selectOpt', value: '' },
  { key: 'newbiz.bCorp', value: 'BC' },
  { key: 'newbiz.cCorp', value: 'CC' },
  { key: 'newbiz.corp', value: 'CO' },
  { key: 'newbiz.llc', value: 'L' },
  { key: 'newbiz.nonprofit', value: 'NP' },
  { key: 'newbiz.partnership', value: 'P' },
  { key: 'newbiz.sole', value: 'I' },
  { key: 'newbiz.sCorp', value: 'S' },
];

const CRITERIA_KEYS = ['newbiz.c1', 'newbiz.c2', 'newbiz.c3', 'newbiz.c4'];

export default function NewBusinessStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const showDetails = data.businessStartVerified === 'yes';
  const showSupport = data.businessStartVerified === 'no';

  const valid =
    data.businessStartVerified === 'no' ||
    (data.businessStartVerified === 'yes' && data.businessStructure !== '' && data.businessStartDate !== '');

  return (
    <div className="s641-step">
      <div className="ms-section-header" style={{ '--ms-accent': '#ea580c', background: 'rgba(234, 88, 12, 0.05)' } as React.CSSProperties}>
        <h3>{t('newbiz.title')}</h3>
        <p>{t('newbiz.desc')}</p>
        <ul className="ms-criteria-list">
          {CRITERIA_KEYS.map((k, i) => (
            <li key={k} className="ms-criteria-item" style={{ animationDelay: `${i * 60}ms` }}>{t(k)}</li>
          ))}
        </ul>
        <div className="ms-section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
      </div>

      <div className="s641-fields" style={{ gap: 12 }}>
        <button
          className={`s641-card s641-card-compact ${data.businessStartVerified === 'yes' ? 'selected' : ''}`}
          onClick={() => onChange({ businessStartVerified: 'yes' })}
        >
          <div className="s641-card-check">
            {data.businessStartVerified === 'yes' && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="s641-card-content">
            <div className="s641-card-title">{t('newbiz.yes')}</div>
          </div>
        </button>

        <button
          className={`s641-card s641-card-compact ${data.businessStartVerified === 'no' ? 'selected' : ''}`}
          onClick={() => onChange({ businessStartVerified: 'no' })}
        >
          <div className="s641-card-check">
            {data.businessStartVerified === 'no' && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="s641-card-content">
            <div className="s641-card-title">{t('newbiz.no')}</div>
          </div>
        </button>

        {showSupport && (
          <div className="ms-support-message">
            <p>{t('newbiz.supportP1')}</p>
            <p>
              {t('newbiz.supportP2')}{' '}
              <a href="https://www.norcalsbdc.org/find-your-sbdc/" target="_blank" rel="noopener noreferrer">
                {t('newbiz.findSbdc')}
              </a>.
            </p>
            <p>{t('newbiz.supportP3')}</p>
          </div>
        )}

        {showDetails && (
          <div className="s641-row" style={{ marginTop: 8 }}>
            <div className="s641-field">
              <label className="s641-label">{t('newbiz.structureLabel')}</label>
              <select
                className="s641-select"
                value={data.businessStructure}
                onChange={(e) => onChange({ businessStructure: e.target.value })}
              >
                {STRUCTURE_KEYS.map((s) => (
                  <option key={s.value} value={s.value}>{t(s.key)}</option>
                ))}
              </select>
            </div>
            <div className="s641-field">
              <label className="s641-label">{t('newbiz.dateLabel')}</label>
              <input
                className="s641-input"
                type="date"
                value={data.businessStartDate}
                onChange={(e) => onChange({ businessStartDate: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('nav.back')}
        </button>
        <button className="s641-btn s641-btn-primary" disabled={!valid} onClick={onNext}>
          {t('nav.continue')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
