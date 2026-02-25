'use client';

import type { MilestoneData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function SalesStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const valid = data.grossRevenue.trim() !== '';

  const revenue = parseFloat(data.grossRevenue);
  const showDelta = !isNaN(revenue) && data.initialGrossSales > 0;
  const delta = showDelta ? revenue - data.initialGrossSales : 0;
  const deltaClass = delta > 0 ? 'ms-delta-positive' : delta < 0 ? 'ms-delta-negative' : 'ms-delta-zero';
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div className="s641-step">
      <div className="ms-section-header" style={{ '--ms-accent': '#2456e3', background: 'rgba(36, 86, 227, 0.05)' } as React.CSSProperties}>
        <h3>{t('sales.title')}</h3>
        <p>{t('sales.desc')}</p>
        <div className="ms-section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
      </div>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">{t('sales.label')}</label>
          {data.initialGrossSales > 0 && (
            <div className="ms-initial-badge">
              {t('emp.prevReported')} <strong>{formatCurrency(data.initialGrossSales)}</strong>
            </div>
          )}
          <div className="ms-currency-wrap">
            <span className="ms-currency-prefix">$</span>
            <input
              className="s641-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={data.grossRevenue}
              onChange={(e) => onChange({ grossRevenue: e.target.value })}
              autoFocus
            />
          </div>
          <p className="s641-hint" style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5 }}>
            {t('sales.hint')}
          </p>
          {showDelta && (
            <span className={`ms-delta ${deltaClass}`}>
              {deltaSign}{formatCurrency(delta)} {t('sales.delta')}
            </span>
          )}
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
