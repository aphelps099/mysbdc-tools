'use client';

import { useRef, useState } from 'react';
import type { TFGApplicationData } from '../types';

interface Props {
  data: TFGApplicationData;
  onChange: (patch: Partial<TFGApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUPPORT_OPTIONS = [
  { id: 'Go-to-Market', label: 'Go-to-Market' },
  { id: 'Positioning / Marketing', label: 'Positioning / Marketing' },
  { id: 'Investment Readiness', label: 'Investment Readiness' },
  { id: 'Product Development', label: 'Product Development' },
  { id: 'Business Development', label: 'Business Development' },
  { id: 'Federal SBIR/STTR Funding', label: 'Federal SBIR/STTR' },
  { id: 'Other Federal Grants', label: 'Other Federal Grants' },
  { id: 'State Grants', label: 'State Grants' },
  { id: 'Other', label: 'Other' },
];

const REFERRAL_OPTIONS = [
  { value: 'Accelerator', label: 'Accelerator' },
  { value: 'Referral', label: 'Referral' },
  { value: 'SBDC', label: 'SBDC' },
  { value: 'Event', label: 'Event' },
  { value: 'Investor', label: 'Investor' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Other', label: 'Other' },
];

const ACCEPTED_EXTENSIONS = '.pdf,.ppt,.pptx,.doc,.docx';

export default function SupportReferralStep({ data, onChange, onNext, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const toggleSupport = (id: string) => {
    const needs = data.supportNeeds.includes(id)
      ? data.supportNeeds.filter((s) => s !== id)
      : [...data.supportNeeds, id];
    onChange({ supportNeeds: needs });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(false);
      onChange({ pitchDeckFile: file, pitchDeckFileName: file.name });
    }
  };

  const removeFile = () => {
    onChange({ pitchDeckFile: null, pitchDeckFileName: '' });
    if (fileRef.current) fileRef.current.value = '';
  };

  const valid =
    data.supportNeeds.length > 0 &&
    (!data.supportNeeds.includes('Other') || data.otherSupport.trim()) &&
    data.referralSource &&
    data.pitchDeckFile !== null &&
    data.signature.trim();

  return (
    <div className="s641-step">
      <h2 className="s641-question">Support &amp; Referral</h2>
      <p className="s641-subtitle">
        Let us know what kind of support you need and how you found us.
      </p>

      <div className="s641-fields">
        <div className="s641-field">
          <label className="s641-label">What support do you need? *</label>
          <p className="s641-hint">Check all that apply</p>
          <div className="s641-pills" style={{ marginTop: 4 }}>
            {SUPPORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`s641-pill ${data.supportNeeds.includes(opt.id) ? 'selected' : ''}`}
                onClick={() => toggleSupport(opt.id)}
              >
                <span className="s641-pill-check">
                  {data.supportNeeds.includes(opt.id) && (
                    <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {data.supportNeeds.includes('Other') && (
          <div className="s641-field tfg-fade-in">
            <label className="s641-label">Other support needs (please specify) *</label>
            <input
              className="s641-input"
              placeholder="Describe your needs..."
              value={data.otherSupport}
              onChange={(e) => onChange({ otherSupport: e.target.value })}
            />
          </div>
        )}

        <div className="tfg-section-label">Referral</div>

        <div className="s641-field">
          <label className="s641-label">How did you hear about TFG? *</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {REFERRAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`s641-pill ${data.referralSource === opt.value ? 'selected' : ''}`}
                onClick={() => onChange({ referralSource: data.referralSource === opt.value ? '' : opt.value })}
              >
                <span className="s641-pill-check">
                  {data.referralSource === opt.value && (
                    <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="s641-field">
          <label className="s641-label">Referrer or Event Name</label>
          <input
            className="s641-input"
            placeholder="Who referred you or which event?"
            value={data.referrerName}
            onChange={(e) => onChange({ referrerName: e.target.value })}
          />
        </div>

        <div className="tfg-section-label">Upload &amp; Signature</div>

        <div className="s641-field">
          <label className="s641-label">Upload Pitch Deck / Executive Summary *</label>
          <p className="s641-hint">PDF preferred. Max file size: 50MB</p>

          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {data.pitchDeckFileName ? (
            <div className="tfg-file-upload tfg-file-selected">
              <div className="tfg-file-selected-name">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {data.pitchDeckFileName}
                <button type="button" className="tfg-file-remove" onClick={removeFile}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="tfg-file-upload"
              onClick={() => fileRef.current?.click()}
            >
              <svg className="tfg-file-upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              <div className="tfg-file-upload-formats">PDF, PPT, PPTX, DOC, DOCX</div>
            </button>
          )}
        </div>

        <div className="s641-field">
          <label className="s641-label">Digital Signature *</label>
          <p className="s641-hint">
            By entering your full name below, you acknowledge that TFG&rsquo;s services are
            provided at no cost but require active engagement, and you agree to the Terms of Service.
          </p>
          <input
            className="s641-input s641-input-signature"
            placeholder="Enter your full legal name"
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
          Back
        </button>
        <button className="s641-btn s641-btn-primary" disabled={!valid} onClick={onNext}>
          Review &amp; Submit
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
