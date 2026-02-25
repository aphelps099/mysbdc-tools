'use client';

import type { IntakeData, CenterOption } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: IntakeData;
  centers: CenterOption[];
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const PROGRAM_LABELS: Record<string, string> = {
  probiz: 'programs.probiz',
  health: 'programs.health',
  eats: 'programs.eats',
  manufacturing: 'programs.manufacturing',
  tfg: 'programs.tfg',
};

const GOAL_LABELS: Record<string, string> = {
  access_capital: 'goals.accessCapital',
  start_business: 'goals.startBusiness',
  grow_revenue: 'goals.growRevenue',
  gov_contracting: 'goals.govContracting',
  buy_business: 'goals.buyBusiness',
  export: 'goals.export',
  technology: 'goals.technology',
  other: 'goals.other',
};

export default function ReviewStep({ data, centers, onBack, onSubmit, submitting }: Props) {
  const { t } = useLanguage();
  const centerName = centers.find((c) => c.id === data.centerId)?.name || 'NorCal SBDC';

  if (submitting) {
    return (
      <div className="s641-submitting">
        <div className="s641-spinner" />
        <p className="s641-submitting-text">{t('review.submitting')}</p>
      </div>
    );
  }

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('review.title')}</h2>
      <p className="s641-subtitle">{t('review.subtitle')}</p>

      <div className="s641-summary">
        <SummaryRow label={t('review.name')} value={`${data.firstName} ${data.lastName}`} />
        <SummaryRow label={t('review.email')} value={data.email} />
        <SummaryRow label={t('review.phone')} value={data.phone} />
        <SummaryRow label={t('review.location')} value={`${data.city}, ${data.state} ${data.zipCode}`} />
        <SummaryRow label={t('review.status')} value={data.businessStatus === 'B' ? t('review.inBusiness') : t('review.preVenture')} />
        {data.companyName && <SummaryRow label={t('review.business')} value={data.companyName} />}
        {data.website && <SummaryRow label={t('review.website')} value={data.website} />}
        {data.goals.length > 0 && (
          <SummaryRow
            label={t('review.goals')}
            value={data.goals.map((g) => t(GOAL_LABELS[g] || g)).join(', ')}
          />
        )}
        {data.programSignup && (
          <SummaryRow
            label="Program Enrollment"
            value={t(PROGRAM_LABELS[data.programSignup] || data.programSignup)}
          />
        )}
        {data.specialPrograms.length > 0 && (
          <SummaryRow
            label={t('review.programs')}
            value={data.specialPrograms.map((p) => t(PROGRAM_LABELS[p] || p)).join(', ')}
          />
        )}
        <SummaryRow label={t('review.center')} value={centerName} />
        <SummaryRow label={t('review.signed')} value={data.signature} italic />
      </div>

      <div className="s641-nav" style={{ paddingTop: 32 }}>
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('nav.back')}
        </button>
        <button
          className="s641-btn s641-btn-primary s641-btn-submit"
          onClick={onSubmit}
        >
          {t('review.submit')}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="s641-summary-row">
      <span className="s641-summary-label">{label}</span>
      <span className="s641-summary-value" style={italic ? { fontStyle: 'italic' } : undefined}>
        {value}
      </span>
    </div>
  );
}
