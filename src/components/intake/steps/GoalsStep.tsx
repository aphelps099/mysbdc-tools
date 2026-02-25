'use client';

import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GOALS = [
  { id: 'access_capital', key: 'goals.accessCapital' },
  { id: 'start_business', key: 'goals.startBusiness' },
  { id: 'grow_revenue', key: 'goals.growRevenue' },
  { id: 'gov_contracting', key: 'goals.govContracting' },
  { id: 'buy_business', key: 'goals.buyBusiness' },
  { id: 'export', key: 'goals.export' },
  { id: 'technology', key: 'goals.technology' },
  { id: 'other', key: 'goals.other' },
];

export default function GoalsStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();

  const toggleGoal = (id: string) => {
    const goals = data.goals.includes(id)
      ? data.goals.filter((g) => g !== id)
      : [...data.goals, id];
    onChange({ goals });
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('goals.title')}</h2>
      <p className="s641-subtitle">{t('goals.subtitle')}</p>

      <div className="s641-pills">
        {GOALS.map((goal) => (
          <button
            key={goal.id}
            className={`s641-pill ${data.goals.includes(goal.id) ? 'selected' : ''}`}
            onClick={() => toggleGoal(goal.id)}
          >
            <span className="s641-pill-check">
              {data.goals.includes(goal.id) && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            {t(goal.key)}
          </button>
        ))}
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('nav.back')}
        </button>
        <button className="s641-btn s641-btn-primary" disabled={data.goals.length === 0} onClick={onNext}>
          {t('nav.continue')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
