'use client';

import { useState } from 'react';
import type { SessionNoteData, NeoserraClientOption } from '../types';
import { lookupContact } from '../session-notes-api';

interface Props {
  data: SessionNoteData;
  onChange: (patch: Partial<SessionNoteData>) => void;
  onNext: () => void;
  onClientsResolved: (clients: NeoserraClientOption[]) => void;
}

export default function ClientLookupStep({ data, onChange, onNext, onClientsResolved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = data.email.trim().length > 0;

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await lookupContact(data.email.trim());
      if (!result.found || !result.contact || result.clients.length === 0) {
        setError(result.error || 'No client records found for this email. The contact must be an existing NeoSerra client.');
        return;
      }
      onChange({
        contactId: result.contact.id,
        contactName: `${result.contact.first} ${result.contact.last}`,
      });
      onClientsResolved(result.clients);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && valid && !loading) {
      handleLookup();
    }
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">Who is this session for?</h2>
      <p className="s641-subtitle">
        Enter the client&apos;s email address to look up their NeoSerra record.
      </p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">Client Email</label>
          <input
            className="s641-input"
            type="email"
            placeholder="client@example.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {loading && (
          <div className="ms-lookup-loading">
            <div className="s641-spinner" />
            <p className="ms-lookup-loading-text">Looking up client...</p>
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
          {loading ? 'Searching...' : 'Find Client'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
