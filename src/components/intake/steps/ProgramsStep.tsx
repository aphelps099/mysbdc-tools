'use client';

import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROGRAMS = [
  { id: 'probiz', nameKey: 'programs.probiz', descKey: 'programs.probizDesc' },
  { id: 'health', nameKey: 'programs.health', descKey: 'programs.healthDesc' },
  { id: 'eats', nameKey: 'programs.eats', descKey: 'programs.eatsDesc' },
  { id: 'manufacturing', nameKey: 'programs.manufacturing', descKey: 'programs.manufacturingDesc' },
  { id: 'tfg', nameKey: 'programs.tfg', descKey: 'programs.tfgDesc' },
];

export default function ProgramsStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();

  const toggle = (id: string) => {
    const programs = data.specialPrograms.includes(id)
      ? data.specialPrograms.filter((p) => p !== id)
      : [...data.specialPrograms, id];
    onChange({ specialPrograms: programs });
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('programs.title')}</h2>
      <p className="s641-subtitle">{t('programs.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 10 }}>
        {PROGRAMS.map((prog) => (
          <button
            key={prog.id}
            className={`s641-card ${data.specialPrograms.includes(prog.id) ? 'selected' : ''}`}
            onClick={() => toggle(prog.id)}
          >
            <div className="s641-card-check">
              {data.specialPrograms.includes(prog.id) && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="s641-card-content">
              <div className="s641-card-title">{t(prog.nameKey)}</div>
              <div className="s641-card-desc">{t(prog.descKey)}</div>
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
        <button className="s641-btn s641-btn-primary" onClick={onNext}>
          {data.specialPrograms.length === 0 ? t('nav.skip') : t('nav.continue')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
