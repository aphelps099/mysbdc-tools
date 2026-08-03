import type { Partner } from './types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — SAMPLE_DATA fixture.
   One example record so the CRM demonstrates itself before
   real partners are entered. Fictional (*.example.com,
   555-01xx). The original 14-record design-handoff dataset
   lives on as a test fixture in tests/fixtures/partners.ts.
   ═══════════════════════════════════════════════════════ */

export const SEED_PARTNERS: Partner[] = [
  { id: 1, name: 'Redwood Coast Community Bank', type: 'Referral', subtype: 'Community bank', city: 'Eureka', center: 'North Coast SBDC',
    contact: 'Dana Whitfield', contactTitle: 'VP, Small Business Lending', email: 'dwhitfield@rccb.example.com', phone: '(707) 555-0142',
    linkedin: 'https://www.linkedin.com/company/redwood-coast-community-bank',
    stage: 'Active', owner: 'Aaron', referrals: 14, lastContact: '2026-07-21', nextFollowUp: '2026-08-18',
    notes: 'Strongest bank referral source on the coast. Refers declined loan applicants for packaging help. Quarterly lunch-and-learn cadence.',
    activities: [
      { date: '2026-07-21', type: 'Meeting', note: 'Quarterly check-in with lending team. Two new loan officers onboarded to referral process.' },
      { date: '2026-06-10', type: 'Referral', note: 'Referred 3 declined applicants for loan packaging assistance.' },
      { date: '2026-04-02', type: 'Event', note: "Co-hosted 'Access to Capital' workshop in Eureka — 41 attendees." } ] },
];
