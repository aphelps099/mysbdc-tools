'use client';

import { useState } from 'react';
import type { MilestoneData, NeoserraClientOption } from '../types';
import { lookupContact } from '../milestones-api';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onClientsResolved: (clients: NeoserraClientOption[]) => void;
}

export default function ContactLookupStep({ data, onChange, onNext, onClientsResolved }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);

  const valid =
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.email.trim() &&
    data.phone.trim();

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await lookupContact(data.email.trim());
      if (!result.found || !result.contact || result.clients.length === 0) {
        setError(result.error || t('contact.notFound'));
        return;
      }
      onChange({
        contactId: result.contact.id,
        contactEmail: result.contact.email,
        firstName: data.firstName || result.contact.first,
        lastName: data.lastName || result.contact.last,
      });
      onClientsResolved(result.clients);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('contact.title')}</h2>
      <p className="s641-subtitle">
        {t('contact.subtitle')}{' '}
        <button
          type="button"
          className="ms-learn-more"
          onClick={() => setShowWhy(true)}
        >
          {t('contact.whyLink')}
        </button>
      </p>

      <div className="s641-fields">
        <div className="s641-row">
          <div className="s641-field">
            <label className="s641-label">{t('contact.firstName')}</label>
            <input
              className="s641-input"
              placeholder="Jane"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              autoFocus
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('contact.lastName')}</label>
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
            <label className="s641-label">{t('contact.email')}</label>
            <input
              className="s641-input"
              type="email"
              placeholder="jane@example.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>
          <div className="s641-field">
            <label className="s641-label">{t('contact.phone')}</label>
            <input
              className="s641-input"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>
        </div>

        {loading && (
          <div className="ms-lookup-loading">
            <div className="s641-spinner" />
            <p className="ms-lookup-loading-text">{t('contact.loading')}</p>
          </div>
        )}

        {error && (
          <div className="ms-not-found">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.5" fill="#dc2626" />
            </svg>
            <p className="ms-not-found-text">{error}</p>
          </div>
        )}
      </div>

      <div className="s641-nav">
        <div />
        <button
          className="s641-btn s641-btn-primary"
          disabled={!valid || loading}
          onClick={handleLookup}
        >
          {loading ? t('nav.searching') : t('nav.continue')}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* "Why Milestones Matter" modal */}
      {showWhy && (
        <div className="ms-modal-backdrop" onClick={() => setShowWhy(false)}>
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ms-modal-close" onClick={() => setShowWhy(false)}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <h3 className="ms-modal-title">{t('why.title')}</h3>

            <div className="ms-modal-body">
              <p>{t('why.intro')}</p>

              <p className="ms-modal-subhead">{t('why.howHeader')}</p>

              <ol className="ms-modal-list">
                <li>
                  <strong>{t('why.impact')}</strong> &mdash; {t('why.impactDesc')}
                </li>
                <li>
                  <strong>{t('why.resources')}</strong> &mdash; {t('why.resourcesDesc')}
                </li>
                <li>
                  <strong>{t('why.inspiring')}</strong> &mdash; {t('why.inspiringDesc')}
                </li>
                <li>
                  <strong>{t('why.shaping')}</strong> &mdash; {t('why.shapingDesc')}
                </li>
              </ol>

              <p className="ms-modal-closing">{t('why.closing')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
