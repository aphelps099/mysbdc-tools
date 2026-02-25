'use client';

import type { MilestoneData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function TestimonialStep({ data, onChange, onBack, onSubmit, submitting }: Props) {
  const { t } = useLanguage();
  const valid = data.signature.trim().length > 0;

  if (submitting) {
    return (
      <div className="s641-submitting">
        <div className="s641-spinner" />
        <p className="s641-submitting-text">{t('test.submitting')}</p>
      </div>
    );
  }

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('test.title')}</h2>
      <p className="s641-subtitle">{t('test.subtitle')}</p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">
            {t('test.feedbackLabel')}
            <span className="s641-optional"> {t('test.optional')}</span>
          </label>
          <textarea
            className="s641-input s641-textarea"
            rows={4}
            placeholder={t('test.placeholder')}
            value={data.testimonial}
            onChange={(e) => onChange({ testimonial: e.target.value })}
          />
        </div>

        <div className="ms-terms">
          <svg className="ms-terms-icon" width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>
            <strong>{t('test.pleaseNote')}</strong> {t('test.terms')}
          </p>
        </div>

        <div className="s641-field">
          <label className="s641-label">{t('test.sigLabel')}</label>
          <p className="s641-hint">{t('test.sigHint')}</p>
          <input
            className="s641-input s641-input-signature"
            placeholder={t('test.sigPlaceholder')}
            value={data.signature}
            onChange={(e) => onChange({ signature: e.target.value })}
          />
        </div>
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('nav.back')}
        </button>
        <button
          className="s641-btn s641-btn-primary s641-btn-submit"
          disabled={!valid || submitting}
          onClick={onSubmit}
        >
          {t('nav.submit')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
