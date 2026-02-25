'use client';

import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CapitalReadinessStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const valid = data.capitalTimeline && data.capitalAmount;

  const TIMELINES = [
    { value: 'urgent_30', key: 'capital.urgent30' },
    { value: 'near_90', key: 'capital.near90' },
    { value: 'within_year', key: 'capital.withinYear' },
    { value: 'exploring', key: 'capital.exploring' },
  ];

  const AMOUNTS = [
    { value: 'under_10k', key: 'capital.under10k' },
    { value: '10k_50k', key: 'capital.10k50k' },
    { value: '50k_250k', key: 'capital.50k250k' },
    { value: '250k_plus', key: 'capital.250kPlus' },
  ];

  const DOCS = [
    { value: 'all_ready', titleKey: 'capital.docsAllReady', descKey: 'capital.docsAllDesc' },
    { value: 'some_ready', titleKey: 'capital.docsSomeReady', descKey: 'capital.docsSomeDesc' },
    { value: 'not_started', titleKey: 'capital.docsNotStarted', descKey: 'capital.docsNotDesc' },
  ];

  const CREDIT = [
    { value: 'excellent', key: 'capital.excellent' },
    { value: 'good', key: 'capital.good' },
    { value: 'fair', key: 'capital.fair' },
    { value: 'unsure', key: 'capital.unsure' },
  ];

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('capital.title')}</h2>
      <p className="s641-subtitle">{t('capital.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 28 }}>
        <div className="s641-field">
          <label className="s641-label">{t('capital.whenLabel')}</label>
          <div className="s641-fields" style={{ gap: 8, marginTop: 8 }}>
            {TIMELINES.map((tl) => (
              <button
                key={tl.value}
                className={`s641-card s641-card-compact ${data.capitalTimeline === tl.value ? 'selected' : ''}`}
                onClick={() => onChange({ capitalTimeline: tl.value })}
              >
                {t(tl.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('capital.amountLabel')}</label>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {AMOUNTS.map((a) => (
              <button
                key={a.value}
                className={`s641-pill ${data.capitalAmount === a.value ? 'selected' : ''}`}
                onClick={() => onChange({ capitalAmount: a.value })}
              >
                {t(a.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('capital.docsLabel')}</label>
          <div className="s641-fields" style={{ gap: 8, marginTop: 8 }}>
            {DOCS.map((d) => (
              <button
                key={d.value}
                className={`s641-card ${data.docsReady === d.value ? 'selected' : ''}`}
                onClick={() => onChange({ docsReady: d.value })}
              >
                <div className="s641-card-content">
                  <div className="s641-card-title">{t(d.titleKey)}</div>
                  <div className="s641-card-desc">{t(d.descKey)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('capital.creditLabel')}</label>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {CREDIT.map((c) => (
              <button
                key={c.value}
                className={`s641-pill ${data.creditAwareness === c.value ? 'selected' : ''}`}
                onClick={() => onChange({ creditAwareness: c.value })}
              >
                {t(c.key)}
              </button>
            ))}
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
