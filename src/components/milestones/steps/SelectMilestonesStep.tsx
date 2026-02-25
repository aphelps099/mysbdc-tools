'use client';

import { useState } from 'react';
import type { MilestoneData, MilestoneCategory } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

/* ── Icon SVGs ── */

const ICONS: Record<MilestoneCategory, React.ReactNode> = {
  hired_employees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  increased_sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  started_business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  got_funded: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

const COLORS: Record<MilestoneCategory, { accent: string; bg: string; selectedBg: string }> = {
  hired_employees:  { accent: '#16a34a', bg: 'rgba(22, 163, 74, 0.04)',  selectedBg: 'rgba(22, 163, 74, 0.07)' },
  increased_sales:  { accent: '#2456e3', bg: 'rgba(36, 86, 227, 0.04)',  selectedBg: 'rgba(36, 86, 227, 0.07)' },
  started_business: { accent: '#ea580c', bg: 'rgba(234, 88, 12, 0.04)',  selectedBg: 'rgba(234, 88, 12, 0.07)' },
  got_funded:       { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.04)', selectedBg: 'rgba(124, 58, 237, 0.07)' },
};

const MILESTONE_IDS: MilestoneCategory[] = ['hired_employees', 'increased_sales', 'started_business', 'got_funded'];
const LABEL_KEYS: Record<MilestoneCategory, string> = {
  hired_employees: 'select.hired',
  increased_sales: 'select.sales',
  started_business: 'select.started',
  got_funded: 'select.funded',
};
const DESC_KEYS: Record<MilestoneCategory, string> = {
  hired_employees: 'select.hiredDesc',
  increased_sales: 'select.salesDesc',
  started_business: 'select.startedDesc',
  got_funded: 'select.fundedDesc',
};
const CHECK_KEYS: Record<MilestoneCategory, string> = {
  hired_employees: 'select.checkHired',
  increased_sales: 'select.checkSales',
  started_business: 'select.checkStarted',
  got_funded: 'select.checkFunded',
};

export default function SelectMilestonesStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const [dismissedCheckpoint, setDismissedCheckpoint] = useState(false);

  const toggle = (id: MilestoneCategory) => {
    const categories = data.categories.includes(id)
      ? data.categories.filter((c) => c !== id)
      : [...data.categories, id];
    onChange({ categories });
    setDismissedCheckpoint(false);
  };

  const showCheckpoint = data.categories.length === 1 && !dismissedCheckpoint;
  const checkpointMessage = showCheckpoint ? t(CHECK_KEYS[data.categories[0]]) : null;

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('select.title')}</h2>
      <p className="s641-subtitle">{t('select.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 12 }}>
        {MILESTONE_IDS.map((id) => {
          const isSelected = data.categories.includes(id);
          const color = COLORS[id];

          return (
            <button
              key={id}
              className={`ms-cat-card ${isSelected ? 'selected' : ''}`}
              style={{
                borderLeftColor: isSelected ? color.accent : 'transparent',
                background: isSelected ? color.selectedBg : color.bg,
              }}
              onClick={() => toggle(id)}
            >
              <div className="ms-cat-icon" style={{ color: color.accent }}>
                {ICONS[id]}
              </div>

              <div
                className="s641-card-check"
                style={isSelected ? { background: color.accent, borderColor: color.accent } : undefined}
              >
                {isSelected && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              <div className="s641-card-content">
                <div className="s641-card-title">{t(LABEL_KEYS[id])}</div>
                <div className="s641-card-desc">{t(DESC_KEYS[id])}</div>
              </div>
            </button>
          );
        })}

        {checkpointMessage && (
          <div className="ms-checkpoint">
            <button
              type="button"
              className="ms-checkpoint-close"
              onClick={() => setDismissedCheckpoint(true)}
            >
              &times;
            </button>
            <p className="ms-checkpoint-title">{t('select.checkpoint')}</p>
            <p className="ms-checkpoint-text">{checkpointMessage}</p>
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
        <button
          className="s641-btn s641-btn-primary"
          disabled={data.categories.length === 0}
          onClick={onNext}
        >
          {t('nav.continue')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
