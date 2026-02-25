'use client';

import { useState } from 'react';
import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const REFERRALS = [
  { value: '', label: 'Select...' },
  { value: 'BU', label: 'Business Owner' },
  { value: 'B', label: 'Lender' },
  { value: 'V', label: 'Advertising / Marketing' },
  { value: 'LG', label: 'Local Government Agency' },
  { value: 'SG', label: 'State Government Agency' },
  { value: 'N', label: 'SBA' },
  { value: 'FU', label: 'Fundica' },
  { value: 'IE', label: 'Internet: Email' },
  { value: 'SM', label: 'Internet: Social Media' },
  { value: 'IW', label: 'Internet: Website' },
  { value: 'ZZ', label: 'Partners: PTAC, SCORE, WBC, VBOC' },
  { value: 'AW', label: 'AWS' },
  { value: 'TA', label: 'Trade Associations' },
  { value: 'BB', label: 'Better Business Bureau' },
  { value: 'WK', label: 'Working Solutions' },
  { value: 'O', label: 'Other' },
];

export default function WrapupStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const [tosExpanded, setTosExpanded] = useState(false);

  const valid = data.referral && data.signature.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('wrapup.title')}</h2>
      <p className="s641-subtitle">{t('wrapup.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 24 }}>
        {/* Referral */}
        <div className="s641-field">
          <label className="s641-label">{t('wrapup.referralLabel')}</label>
          <select
            className="s641-select"
            value={data.referral}
            onChange={(e) => onChange({ referral: e.target.value })}
          >
            {REFERRALS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {data.referral === 'O' && (
            <input
              className="s641-input"
              placeholder={t('wrapup.refOtherPlaceholder')}
              value={data.referralOther}
              onChange={(e) => onChange({ referralOther: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        {/* Newsletter */}
        <div className="s641-field">
          <label className="s641-label">{t('wrapup.newsletter')}</label>
          <p className="s641-hint">{t('wrapup.newsletterHint')}</p>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {['Yes', 'No'].map((val) => (
              <button
                key={val}
                className={`s641-pill ${data.newsletter === val ? 'selected' : ''}`}
                onClick={() => onChange({ newsletter: val })}
              >
                {val === 'Yes' ? t('wrapup.subscribe') : t('wrapup.noThanks')}
              </button>
            ))}
          </div>
        </div>

        {/* Terms of Service */}
        <div className="s641-tos">
          <div className="s641-tos-header">{t('wrapup.tosHeader')}</div>
          <div className={`s641-tos-body ${tosExpanded ? 's641-tos-expanded' : ''}`}>
            <p>{t('wrapup.tosP1')}</p>
            <p>{t('wrapup.tosP2')}</p>
            <p>{t('wrapup.tosP3')}</p>
            <div className="s641-tos-highlight">{t('wrapup.tosHighlight')}</div>
          </div>
          <button
            type="button"
            className="s641-tos-toggle"
            onClick={() => setTosExpanded(!tosExpanded)}
          >
            {tosExpanded ? t('wrapup.showLess') : t('wrapup.readFull')}
          </button>
        </div>

        {/* Signature */}
        <div className="s641-field">
          <label className="s641-label">{t('wrapup.signatureLabel')}</label>
          <p className="s641-hint">{t('wrapup.signatureHint')}</p>
          <input
            className="s641-input s641-input-signature"
            placeholder="Jane A. Smith"
            value={data.signature}
            onChange={(e) => onChange({ signature: e.target.value })}
          />
        </div>

        {/* Privacy Release */}
        <div className="s641-field">
          <label className="s641-label">{t('wrapup.privacyLabel')} <span className="s641-optional">{t('details.optional')}</span></label>
          <p className="s641-hint">{t('wrapup.privacyHint')}</p>
          <div className="s641-pills" style={{ marginTop: 8 }}>
            {['Yes', 'No'].map((val) => (
              <button
                key={val}
                className={`s641-pill ${data.privacyRelease === val ? 'selected' : ''}`}
                onClick={() => onChange({ privacyRelease: val })}
              >
                {val === 'Yes' ? t('demo.yes') : t('wrapup.noThanks')}
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
          {t('nav.reviewSubmit')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
