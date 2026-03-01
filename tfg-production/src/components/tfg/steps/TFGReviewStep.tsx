'use client';

import type { TFGApplicationData } from '../types';

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

function ReviewRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  if (!value) return null;
  return (
    <div className="tfg-review-row">
      <span className="tfg-review-row-label">{label}</span>
      <span className="tfg-review-row-value" style={italic ? { fontStyle: 'italic' } : undefined}>
        {value}
      </span>
    </div>
  );
}

export default function TFGReviewStep({ data, onBack, onSubmit, submitting }: Props) {
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

      <div className="s641-fields">
        {/* Company & Contact */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Company &amp; Contact</div>
          <ReviewRow label="Company" value={data.companyName} />
          <ReviewRow label="Website" value={data.website} />
          <ReviewRow label="Name" value={`${data.firstName} ${data.lastName}`} />
          <ReviewRow label="Email" value={data.email} />
          <ReviewRow label="Phone" value={data.phone} />
          <ReviewRow label="LinkedIn" value={data.linkedin} />
          <ReviewRow label="Address" value={`${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}`} />
          <ReviewRow label="State of Inc." value={data.stateOfIncorporation} />
        </div>

        {/* Industry */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Industry</div>
          <ReviewRow label="Sectors" value={data.industrySectors.join(', ')} />
          <ReviewRow label="Other" value={data.otherIndustry} />
        </div>

        {/* Vision & Product */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Vision &amp; Product</div>
          <ReviewRow label="Vision" value={data.vision} />
          <ReviewRow label="Problem" value={data.problem} />
          <ReviewRow label="Solution" value={data.solution} />
        </div>

        {/* Market & Validation */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Market &amp; Validation</div>
          <ReviewRow label="Market Opportunity" value={data.marketOpportunity} />
          <ReviewRow label="I-Corps" value={data.icorpsStatus} />
          <ReviewRow label="I-Corps Details" value={data.icorpsDetails} />
          <ReviewRow label="Interviews" value={data.interviewStatus} />
          <ReviewRow label="Interview Count" value={data.interviewCount} />
          <ReviewRow label="ICP" value={data.idealCustomerProfile} />
        </div>

        {/* Traction & Revenue */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Traction &amp; Revenue</div>
          <ReviewRow label="Product Stage" value={data.productStage} />
          <ReviewRow label="In-Market" value={data.inMarketStatus} />
          <ReviewRow label="Revenue" value={REVENUE_LABELS[data.revenueStage] || data.revenueStage} />
          <ReviewRow label="SBIR/STTR" value={data.sbirStatus} />
          <ReviewRow label="Achievements" value={data.recentAchievements} />
        </div>

        {/* Financing */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Financing &amp; Runway</div>
          <ReviewRow label="Total Funding" value={data.totalFunding} />
          <ReviewRow label="Last Round" value={data.lastRound.join(', ')} />
          <ReviewRow label="Raising Capital" value={data.raisingCapital === 'true' ? 'Yes' : 'No'} />
          <ReviewRow label="Raise Details" value={data.raiseDetails} />
          <ReviewRow label="Runway" value={data.runwayMonths ? `${data.runwayMonths} months` : ''} />
        </div>

        {/* Team */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Team</div>
          <ReviewRow
            label="Members"
            value={data.teamMembers.filter((m) => m.name.trim()).map((m) => m.name).join(', ')}
          />
          <ReviewRow label="Team Fit" value={data.teamFit} />
          <ReviewRow label="Time Working" value={data.timeWorking} />
        </div>

        {/* Support & Referral */}
        <div className="tfg-review-section">
          <div className="tfg-review-label">Support &amp; Referral</div>
          <ReviewRow label="Support Needs" value={data.supportNeeds.join(', ')} />
          <ReviewRow label="Other Support" value={data.otherSupport} />
          <ReviewRow label="Heard About TFG" value={data.referralSource} />
          <ReviewRow label="Referrer" value={data.referrerName} />
          <ReviewRow label="Pitch Deck" value={data.pitchDeckFileName} />
          <ReviewRow label="Signature" value={data.signature} italic />
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
