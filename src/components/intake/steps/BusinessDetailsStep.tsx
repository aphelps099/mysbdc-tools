'use client';

import type { IntakeData } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  onChange: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const POSITIONS_KEYS = [
  { value: '', key: 'details.posSelect' },
  { value: 'CEO', key: 'details.posCEO' },
  { value: 'EMP', key: 'details.posEmployee' },
  { value: 'PTR', key: 'details.posPartner' },
  { value: 'PR', key: 'details.posPresident' },
  { value: 'SP', key: 'details.posSole' },
  { value: 'VPR', key: 'details.posVP' },
  { value: 'GM', key: 'details.posGM' },
  { value: 'OWN', key: 'details.posOwner' },
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','DC','WV','WI','WY',
];

export default function BusinessDetailsStep({ data, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const isInBusiness = data.businessStatus === 'B';

  const valid = isInBusiness
    ? data.companyName.trim() && data.businessDescription.trim() && data.businessAddress.trim() && data.businessCity.trim() && data.businessZip.trim()
    : data.businessIdea.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">
        {isInBusiness ? t('details.titleBiz') : t('details.titleIdea')}
      </h2>
      <p className="s641-subtitle">
        {isInBusiness ? t('details.subtitleBiz') : t('details.subtitleIdea')}
      </p>

      <div className="s641-fields">
        {isInBusiness ? (
          <>
            <div className="s641-row">
              <div className="s641-field">
                <label className="s641-label">{t('details.bizName')}</label>
                <input
                  className="s641-input"
                  placeholder="Sunrise Bakery LLC"
                  value={data.companyName}
                  onChange={(e) => onChange({ companyName: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="s641-field">
                <label className="s641-label">{t('details.dateEst')}</label>
                <input
                  className="s641-input"
                  type="date"
                  value={data.dateEstablished}
                  onChange={(e) => onChange({ dateEstablished: e.target.value })}
                />
              </div>
            </div>

            <div className="s641-field">
              <label className="s641-label">{t('details.bizAddress')}</label>
              <input
                className="s641-input"
                placeholder="456 Commerce Way"
                value={data.businessAddress}
                onChange={(e) => onChange({ businessAddress: e.target.value })}
              />
            </div>

            <div className="s641-row s641-row-3">
              <div className="s641-field">
                <label className="s641-label">{t('details.city')}</label>
                <input
                  className="s641-input"
                  placeholder="Sacramento"
                  value={data.businessCity}
                  onChange={(e) => onChange({ businessCity: e.target.value })}
                />
              </div>
              <div className="s641-field">
                <label className="s641-label">{t('details.state')}</label>
                <select
                  className="s641-select"
                  value={data.businessState}
                  onChange={(e) => onChange({ businessState: e.target.value })}
                >
                  <option value="">--</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="s641-field">
                <label className="s641-label">{t('details.zip')}</label>
                <input
                  className="s641-input"
                  placeholder="95814"
                  value={data.businessZip}
                  onChange={(e) => onChange({ businessZip: e.target.value })}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="s641-field">
              <label className="s641-label">{t('details.products')}</label>
              <textarea
                className="s641-input s641-textarea"
                rows={3}
                placeholder="Describe what your business does..."
                value={data.businessDescription}
                onChange={(e) => onChange({ businessDescription: e.target.value })}
              />
            </div>

            <div className="s641-row">
              <div className="s641-field">
                <label className="s641-label">{t('details.position')}</label>
                <select
                  className="s641-select"
                  value={data.position}
                  onChange={(e) => onChange({ position: e.target.value })}
                >
                  {POSITIONS_KEYS.map((p) => (
                    <option key={p.value} value={p.value}>{t(p.key)}</option>
                  ))}
                </select>
              </div>
              <div className="s641-field">
                <label className="s641-label">{t('details.website')} <span className="s641-optional">{t('details.optional')}</span></label>
                <input
                  className="s641-input"
                  type="url"
                  placeholder="https://yourbusiness.com"
                  value={data.website}
                  onChange={(e) => onChange({ website: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="s641-field">
              <textarea
                className="s641-input s641-textarea"
                rows={5}
                placeholder="I want to start a business that..."
                value={data.businessIdea}
                onChange={(e) => onChange({ businessIdea: e.target.value })}
                autoFocus
              />
            </div>

            <div className="s641-field">
              <label className="s641-label">{t('details.website')} <span className="s641-optional">{t('details.optional')}</span></label>
              <input
                className="s641-input"
                type="url"
                placeholder="https://yourbusiness.com"
                value={data.website}
                onChange={(e) => onChange({ website: e.target.value })}
              />
            </div>
          </>
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
