'use client';

import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BusinessStatusStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();

  const options = [
    { value: 'B', titleKey: 'status.yesTitle', descKey: 'status.yesDesc' },
    { value: 'P', titleKey: 'status.noTitle', descKey: 'status.noDesc' },
  ] as const;

  const handleSelect = (value: string) => {
    onChange({ businessStatus: value as IntakeData['businessStatus'] });
    setTimeout(onNext, 300);
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('status.title')}</h2>
      <p className="s641-subtitle">{t('status.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 12 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`s641-card ${data.businessStatus === opt.value ? 'selected' : ''}`}
            onClick={() => handleSelect(opt.value)}
          >
            <div className="s641-card-content">
              <div className="s641-card-title">{t(opt.titleKey)}</div>
              <div className="s641-card-desc">{t(opt.descKey)}</div>
            </div>
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
        <div />
      </div>
    </div>
  );
}
