'use client';

import type { MilestoneData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function DeltaBadge({ current, initial, label }: { current: string; initial: number; label: string }) {
  const num = parseInt(current, 10);
  if (isNaN(num)) return null;
  const delta = num - initial;
  const cls = delta > 0 ? 'ms-delta-positive' : delta < 0 ? 'ms-delta-negative' : 'ms-delta-zero';
  const sign = delta > 0 ? '+' : '';
  return (
    <span className={`ms-delta ${cls}`}>
      {sign}{delta} {label}
    </span>
  );
}

export default function EmployeesStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const valid = data.totalFtEmployees.trim() !== '' && data.totalPtEmployees.trim() !== '';

  return (
    <div className="s641-step">
      <div className="ms-section-header" style={{ '--ms-accent': '#16a34a', background: 'rgba(22, 163, 74, 0.05)' } as React.CSSProperties}>
        <h3>{t('emp.title')}</h3>
        <p>{t('emp.desc')}</p>
        <p>{t('emp.trackingNote')}</p>
        <div className="ms-section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
      </div>

      <div className="s641-fields">
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">{t('emp.ftLabel')}</label>
            {data.initialFtEmps > 0 && (
              <div className="ms-initial-badge">
                {t('emp.prevReported')} <strong>{data.initialFtEmps}</strong>
              </div>
            )}
            <input
              className="s641-input"
              type="number"
              min="0"
              placeholder="0"
              value={data.totalFtEmployees}
              onChange={(e) => onChange({ totalFtEmployees: e.target.value })}
              autoFocus
            />
            <p className="s641-hint" style={{ marginTop: 4, fontSize: 12 }}>
              {t('emp.ftHint')}
            </p>
            <DeltaBadge current={data.totalFtEmployees} initial={data.initialFtEmps} label={t('emp.ftDelta')} />
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('emp.ptLabel')}</label>
            {data.initialPtEmps > 0 && (
              <div className="ms-initial-badge">
                {t('emp.prevReported')} <strong>{data.initialPtEmps}</strong>
              </div>
            )}
            <input
              className="s641-input"
              type="number"
              min="0"
              placeholder="0"
              value={data.totalPtEmployees}
              onChange={(e) => onChange({ totalPtEmployees: e.target.value })}
            />
            <p className="s641-hint" style={{ marginTop: 4, fontSize: 12 }}>
              {t('emp.ptHint')}
            </p>
            <DeltaBadge current={data.totalPtEmployees} initial={data.initialPtEmps} label={t('emp.ptDelta')} />
          </div>
        </div>
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
