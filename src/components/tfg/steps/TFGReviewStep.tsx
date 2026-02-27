'use client';

import type { TFGApplicationData } from '../types';
import { calculateReadinessScore } from '../types';

interface Props {
  data: TFGApplicationData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const REVENUE_LABELS: Record<string, string> = {
  '0-0': 'Pre-Revenue',
  '1-1': 'Pilot Revenue',
  '2-2': '< $500K',
  'under1mm': '< $1MM',
  'over1mm': '> $1MM',
};

function SummaryRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  if (!value) return null;
  return (
    <div className="s641-summary-row">
      <span className="s641-summary-label">{label}</span>
      <span className="s641-summary-value" style={italic ? { fontStyle: 'italic' } : undefined}>
        {value}
      </span>
    </div>
  );
}

export default function TFGReviewStep({ data, onBack, onSubmit, submitting }: Props) {
  const score = calculateReadinessScore(data);
  const scoreLabel = score <= 2 ? 'Catalyst' : score <= 5 ? 'Needs Assessment' : 'Investor-Ready';

  if (submitting) {
    return (
      <div className="s641-submitting">
        <div className="s641-spinner" />
        <p className="s641-submitting-text">Submitting your application...</p>
      </div>
    );
  }

  return (
    <div className="s641-step">
      <h2 className="s641-question">Review Your Application</h2>
      <p className="s641-subtitle">Please review your information before submitting.</p>

      <div className="s641-fields" style={{ gap: 20 }}>
        {/* Company & Contact */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Company &amp; Contact</div>
          <SummaryRow label="Company" value={data.companyName} />
          <SummaryRow label="Website" value={data.website} />
          <SummaryRow label="Name" value={`${data.firstName} ${data.lastName}`} />
          <SummaryRow label="Email" value={data.email} />
          <SummaryRow label="Phone" value={data.phone} />
          <SummaryRow label="LinkedIn" value={data.linkedin} />
          <SummaryRow label="Address" value={`${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}`} />
          <SummaryRow label="State of Inc." value={data.stateOfIncorporation} />
        </div>

        {/* Industry */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Industry</div>
          <SummaryRow label="Sectors" value={data.industrySectors.join(', ')} />
          <SummaryRow label="Other" value={data.otherIndustry} />
        </div>

        {/* Vision & Product */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Vision &amp; Product</div>
          <SummaryRow label="Vision" value={data.vision} />
          <SummaryRow label="Problem" value={data.problem} />
          <SummaryRow label="Solution" value={data.solution} />
        </div>

        {/* Market & Validation */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Market &amp; Validation</div>
          <SummaryRow label="Market Opportunity" value={data.marketOpportunity} />
          <SummaryRow label="I-Corps" value={data.icorpsStatus} />
          <SummaryRow label="I-Corps Details" value={data.icorpsDetails} />
          <SummaryRow label="Interviews" value={data.interviewStatus} />
          <SummaryRow label="Interview Count" value={data.interviewCount} />
          <SummaryRow label="ICP" value={data.idealCustomerProfile} />
        </div>

        {/* Traction & Revenue */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Traction &amp; Revenue</div>
          <SummaryRow label="Product Stage" value={data.productStage} />
          <SummaryRow label="In-Market" value={data.inMarketStatus} />
          <SummaryRow label="Revenue" value={REVENUE_LABELS[data.revenueStage] || data.revenueStage} />
          <SummaryRow label="SBIR/STTR" value={data.sbirStatus} />
          <SummaryRow label="Achievements" value={data.recentAchievements} />
        </div>

        {/* Financing */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Financing &amp; Runway</div>
          <SummaryRow label="Total Funding" value={data.totalFunding} />
          <SummaryRow label="Last Round" value={data.lastRound.join(', ')} />
          <SummaryRow label="Raising Capital" value={data.raisingCapital === 'true' ? 'Yes' : 'No'} />
          <SummaryRow label="Raise Details" value={data.raiseDetails} />
          <SummaryRow label="Runway" value={data.runwayMonths ? `${data.runwayMonths} months` : ''} />
        </div>

        {/* Team */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Team</div>
          <SummaryRow
            label="Members"
            value={data.teamMembers.filter((m) => m.name.trim()).map((m) => m.name).join(', ')}
          />
          <SummaryRow label="Team Fit" value={data.teamFit} />
          <SummaryRow label="Time Working" value={data.timeWorking} />
        </div>

        {/* Support & Referral */}
        <div className="s641-summary">
          <div className="tfg-section-label" style={{ margin: '0 0 12px' }}>Support &amp; Referral</div>
          <SummaryRow label="Support Needs" value={data.supportNeeds.join(', ')} />
          <SummaryRow label="Other Support" value={data.otherSupport} />
          <SummaryRow label="Heard About TFG" value={data.referralSource} />
          <SummaryRow label="Referrer" value={data.referrerName} />
          <SummaryRow label="Pitch Deck" value={data.pitchDeckFileName} />
          <SummaryRow label="Signature" value={data.signature} italic />
        </div>

        {/* Readiness Score */}
        <div className="s641-summary" style={{ textAlign: 'center' }}>
          <div className="tfg-section-label" style={{ margin: '0 0 8px', textAlign: 'center', borderBottom: 'none' }}>
            Readiness Score
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--tfg-accent)' }}>{score}</div>
          <div style={{ fontSize: 13, color: 'var(--tfg-muted)', marginTop: 4 }}>{scoreLabel}</div>
        </div>
      </div>

      <div className="s641-nav" style={{ paddingTop: 32 }}>
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button
          className="s641-btn s641-btn-primary s641-btn-submit"
          onClick={onSubmit}
        >
          Submit Application
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
