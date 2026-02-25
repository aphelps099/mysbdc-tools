'use client';

import { useState, useEffect, useRef } from 'react';
import type { IntakeData } from '../types';
import { resolveCenter, checkEmail, type ResolvedCenter } from '../smart641-api';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
}

const PROGRAM_OPTIONS = [
  { id: 'health', label: 'SBDC Health' },
  { id: 'eats', label: 'SBDC Eats' },
  { id: 'probiz', label: 'ProBiz' },
  { id: 'tfg', label: 'Tech Futures' },
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','DC','WV','WI','WY',
];

export default function WelcomeStep({ data, onChange, onNext }: Props) {
  const { t } = useLanguage();
  const [detectedCenter, setDetectedCenter] = useState<ResolvedCenter | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ZIP → center resolution */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (data.zipCode.length >= 5) {
      debounceRef.current = setTimeout(async () => {
        const result = await resolveCenter(data.zipCode);
        if (result) {
          setDetectedCenter(result);
          onChange({ centerId: result.centerId });
        }
      }, 300);
    } else {
      setDetectedCenter(null);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [data.zipCode]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Email → duplicate check */
  useEffect(() => {
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    const email = data.email.trim();
    if (email.includes('@') && email.includes('.')) {
      emailDebounceRef.current = setTimeout(async () => {
        const result = await checkEmail(email);
        if (result?.exists) {
          setDuplicateWarning(result.message);
        } else {
          setDuplicateWarning(null);
          onChange({ programSignup: '' });
        }
      }, 500);
    } else {
      setDuplicateWarning(null);
      onChange({ programSignup: '' });
    }
    return () => { if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current); };
  }, [data.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const valid =
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.email.trim() &&
    data.phone.trim() &&
    data.streetAddress.trim() &&
    data.city.trim() &&
    data.state &&
    data.zipCode.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('welcome.title')}</h2>
      <p className="s641-subtitle">{t('welcome.subtitle')}</p>

      <div className="s641-fields">
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">{t('welcome.firstName')}</label>
            <input
              className="s641-input"
              placeholder="Jane"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              autoFocus
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('welcome.lastName')}</label>
            <input
              className="s641-input"
              placeholder="Smith"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">{t('welcome.email')}</label>
            <input
              className="s641-input"
              type="email"
              placeholder="jane@example.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('welcome.phone')}</label>
            <input
              className="s641-input"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>
        </div>

        {duplicateWarning && (
          <div className="s641-duplicate-warning">
            <div className="s641-duplicate-warning-header">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 14H1L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
              </svg>
              <span>{duplicateWarning}</span>
            </div>
            <div className="s641-program-signup">
              <p className="s641-program-signup-label">
                Already a client? Enroll in a special program:
              </p>
              <div className="s641-program-signup-options">
                {PROGRAM_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`s641-program-chip${data.programSignup === p.id ? ' s641-program-chip-active' : ''}`}
                    onClick={() => onChange({ programSignup: data.programSignup === p.id ? '' : p.id })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="s641-field">
          <label className="s641-label">{t('welcome.address')}</label>
          <input
            className="s641-input"
            placeholder="123 Main Street"
            value={data.streetAddress}
            onChange={(e) => onChange({ streetAddress: e.target.value })}
          />
        </div>

        <div className="s641-row s641-row-3">
          <div className="s641-field">
            <label className="s641-label">{t('welcome.city')}</label>
            <input
              className="s641-input"
              placeholder="Sacramento"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('welcome.state')}</label>
            <select
              className="s641-select"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
            >
              <option value="">--</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('welcome.zip')}</label>
            <input
              className="s641-input"
              placeholder="95814"
              value={data.zipCode}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              maxLength={10}
            />
          </div>
        </div>

        {detectedCenter && (
          <div className="s641-center-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>
              {t('welcome.yourSbdc')} <strong>{detectedCenter.centerName}</strong>
              {detectedCenter.counties && (
                <span className="s641-center-counties">
                  {' '}({detectedCenter.counties})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="s641-nav">
        <div />
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
