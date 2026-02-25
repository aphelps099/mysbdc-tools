'use client';

import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DemographicsStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();

  const GENDERS = [
    { value: 'F', key: 'demo.female' },
    { value: 'M', key: 'demo.male' },
    { value: 'R', key: 'demo.preferNot' },
  ];

  const ETHNICITIES = [
    { value: '5', key: 'demo.white' },
    { value: '3', key: 'demo.black' },
    { value: '2', key: 'demo.asian' },
    { value: '1', key: 'demo.native' },
    { value: '4', key: 'demo.pacific' },
    { value: '12', key: 'demo.middleEastern' },
    { value: 'NR', key: 'demo.preferNot' },
  ];

  const HISPANIC = [
    { value: 'Y', key: 'demo.yes' },
    { value: 'N', key: 'demo.no' },
    { value: 'R', key: 'demo.preferNot' },
  ];

  const VETERAN = [
    { value: 'VE', key: 'demo.vet' },
    { value: 'DS', key: 'demo.disabledVet' },
    { value: 'NA', key: 'demo.nonVet' },
    { value: 'NR', key: 'demo.preferNot' },
  ];

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('demo.title')}</h2>
      <p className="s641-subtitle">{t('demo.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 24 }}>
        <div className="s641-field">
          <label className="s641-label">{t('demo.gender')}</label>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {GENDERS.map((g) => (
              <button
                key={g.value}
                className={`s641-pill ${data.gender === g.value ? 'selected' : ''}`}
                onClick={() => onChange({ gender: g.value })}
              >
                {t(g.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('demo.ethnicity')}</label>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {ETHNICITIES.map((e) => (
              <button
                key={e.value}
                className={`s641-pill ${data.ethnicity === e.value ? 'selected' : ''}`}
                onClick={() => onChange({ ethnicity: e.value })}
              >
                {t(e.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('demo.hispanic')}</label>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {HISPANIC.map((h) => (
              <button
                key={h.value}
                className={`s641-pill ${data.hispanic === h.value ? 'selected' : ''}`}
                onClick={() => onChange({ hispanic: h.value })}
              >
                {t(h.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('demo.veteran')}</label>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {VETERAN.map((v) => (
              <button
                key={v.value}
                className={`s641-pill ${data.veteran === v.value ? 'selected' : ''}`}
                onClick={() => onChange({ veteran: v.value })}
              >
                {t(v.key)}
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
        <button className="s641-btn s641-btn-primary" onClick={onNext}>
          {t('nav.continue')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
