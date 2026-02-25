'use client';

import type { MilestoneData, FundingRow } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FUNDING_SOURCE_KEYS = [
  { key: 'fund.selectType', code: '' },
  { key: 'fund.sbaLoan', code: 'L' },
  { key: 'fund.bankLoan', code: 'C' },
  { key: 'fund.microLoan', code: 'M' },
  { key: 'fund.loc', code: 'R' },
  { key: 'fund.vc', code: 'V' },
  { key: 'fund.equity', code: '(' },
  { key: 'fund.grants', code: '3' },
  { key: 'fund.crowd', code: ')' },
  { key: 'fund.equipment', code: '+' },
  { key: 'fund.ssbci', code: '<' },
  { key: 'fund.other', code: '?' },
];

const EXAMPLE_KEYS = [
  'fund.sbaLoan', 'fund.bankLoan', 'fund.microLoan', 'fund.loc',
  'fund.grants', 'fund.vc', 'fund.crowd', 'fund.equipment',
];

export default function FundingStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();

  const addRow = () => {
    onChange({
      additionalFunding: [...data.additionalFunding, { source: '', amount: '', typeCode: '' }],
    });
  };

  const updateRow = (index: number, patch: Partial<FundingRow>) => {
    const rows = data.additionalFunding.map((r, i) =>
      i === index ? { ...r, ...patch } : r
    );
    onChange({ additionalFunding: rows });
  };

  const removeRow = (index: number) => {
    onChange({
      additionalFunding: data.additionalFunding.filter((_, i) => i !== index),
    });
  };

  const handleSourceChange = (index: number, code: string) => {
    const match = FUNDING_SOURCE_KEYS.find((s) => s.code === code);
    if (code === '?') {
      updateRow(index, { typeCode: '?', source: '' });
    } else {
      updateRow(index, { typeCode: code, source: match ? t(match.key) : '' });
    }
  };

  const setOwnMoney = (val: 'yes' | 'no') => {
    if (val === 'no') {
      onChange({ investedOwnMoney: 'no', ownInvestment: '0' });
    } else {
      onChange({ investedOwnMoney: 'yes', ownInvestment: data.ownInvestment === '0' ? '' : data.ownInvestment });
    }
  };

  const setOtherFunding = (val: 'yes' | 'no') => {
    if (val === 'no') {
      onChange({ hasOtherFunding: 'no', additionalFunding: [] });
    } else {
      onChange({
        hasOtherFunding: 'yes',
        additionalFunding: data.additionalFunding.length > 0
          ? data.additionalFunding
          : [{ source: '', amount: '', typeCode: '' }],
      });
    }
  };

  const ownMoneyAnswered = data.investedOwnMoney === 'no' ||
    (data.investedOwnMoney === 'yes' && data.ownInvestment.trim() !== '' && data.ownInvestment !== '0');
  const otherFundingAnswered = data.hasOtherFunding !== '';
  const valid = ownMoneyAnswered && otherFundingAnswered;

  return (
    <div className="s641-step">
      <div className="ms-section-header" style={{ '--ms-accent': '#7c3aed', background: 'rgba(124, 58, 237, 0.05)' } as React.CSSProperties}>
        <h3>{t('fund.title')}</h3>
        <p>{t('fund.desc')}</p>
        <div className="ms-section-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      </div>

      <div className="s641-fields">
        {/* ── Question 1: Own money ── */}
        <div className="s641-field">
          <label className="s641-label">{t('fund.ownQ')}</label>
          <div className="s641-cards" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className={`s641-card s641-card-compact ${data.investedOwnMoney === 'yes' ? 'selected' : ''}`}
              onClick={() => setOwnMoney('yes')}
              style={{ flex: 1 }}
            >
              <div className="s641-card-check">
                {data.investedOwnMoney === 'yes' && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="s641-card-content">
                <div className="s641-card-title">{t('nav.yes')}</div>
              </div>
            </button>
            <button
              type="button"
              className={`s641-card s641-card-compact ${data.investedOwnMoney === 'no' ? 'selected' : ''}`}
              onClick={() => setOwnMoney('no')}
              style={{ flex: 1 }}
            >
              <div className="s641-card-check">
                {data.investedOwnMoney === 'no' && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="s641-card-content">
                <div className="s641-card-title">{t('nav.no')}</div>
              </div>
            </button>
          </div>
        </div>

        {/* ── Amount input ── */}
        {data.investedOwnMoney === 'yes' && (
          <div className="s641-field ms-fade-in">
            <label className="s641-label">{t('fund.howMuch')}</label>
            <div className="ms-currency-wrap">
              <span className="ms-currency-prefix">$</span>
              <input
                className="s641-input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={data.ownInvestment === '0' ? '' : data.ownInvestment}
                onChange={(e) => onChange({ ownInvestment: e.target.value })}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* ── Question 2: Other investments ── */}
        {data.investedOwnMoney !== '' && (
          <div className="s641-field ms-fade-in" style={{ marginTop: 8 }}>
            <label className="s641-label">{t('fund.otherQ')}</label>
            <div className="ms-example-types">
              {EXAMPLE_KEYS.map((k) => (
                <span key={k} className="ms-example-chip">{t(k)}</span>
              ))}
            </div>
            <div className="s641-cards" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className={`s641-card s641-card-compact ${data.hasOtherFunding === 'yes' ? 'selected' : ''}`}
                onClick={() => setOtherFunding('yes')}
                style={{ flex: 1 }}
              >
                <div className="s641-card-check">
                  {data.hasOtherFunding === 'yes' && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="s641-card-content">
                  <div className="s641-card-title">{t('nav.yes')}</div>
                </div>
              </button>
              <button
                type="button"
                className={`s641-card s641-card-compact ${data.hasOtherFunding === 'no' ? 'selected' : ''}`}
                onClick={() => setOtherFunding('no')}
                style={{ flex: 1 }}
              >
                <div className="s641-card-check">
                  {data.hasOtherFunding === 'no' && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="s641-card-content">
                  <div className="s641-card-title">{t('nav.no')}</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Additional funding rows ── */}
        {data.hasOtherFunding === 'yes' && (
          <div className="s641-field ms-fade-in" style={{ marginTop: 4 }}>
            <label className="s641-label">{t('fund.addSources')}</label>

            <div className="ms-funding-rows">
              {data.additionalFunding.map((row, i) => (
                <div key={i} className="ms-funding-row">
                  <div className="s641-field">
                    {i === 0 && <label className="s641-label" style={{ fontSize: 10 }}>{t('fund.typeLabel')}</label>}
                    <select
                      className="s641-select"
                      value={row.typeCode || ''}
                      onChange={(e) => handleSourceChange(i, e.target.value)}
                    >
                      {FUNDING_SOURCE_KEYS.map((s) => (
                        <option key={s.code} value={s.code}>{t(s.key)}</option>
                      ))}
                    </select>
                    {row.typeCode === '?' && (
                      <input
                        className="s641-input"
                        placeholder={t('fund.descPlaceholder')}
                        value={row.source}
                        onChange={(e) => updateRow(i, { source: e.target.value })}
                        style={{ marginTop: 6 }}
                      />
                    )}
                  </div>
                  <div className="s641-field">
                    {i === 0 && <label className="s641-label" style={{ fontSize: 10 }}>{t('fund.amountLabel')}</label>}
                    <div className="ms-currency-wrap">
                      <span className="ms-currency-prefix">$</span>
                      <input
                        className="s641-input"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={row.amount}
                        onChange={(e) => updateRow(i, { amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ms-funding-remove"
                    onClick={() => removeRow(i)}
                    title={t('nav.back')}
                    style={i === 0 ? { marginTop: 18 } : undefined}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="ms-add-row" onClick={addRow}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {t('fund.addAnother')}
            </button>
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
