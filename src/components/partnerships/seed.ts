import type { Partner } from './types';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — SAMPLE_DATA fixture.
   14 records copied verbatim from the design handoff
   (reference/Partnership CRM.dc.html, `seed = [`).
   All fictional: *.example.* addresses, 555-01xx phones.
   ═══════════════════════════════════════════════════════ */

export const SEED_PARTNERS: Partner[] = [
  { id: 1, name: 'Redwood Coast Community Bank', type: 'Referral', subtype: 'Community bank', city: 'Eureka', center: 'North Coast SBDC',
    contact: 'Dana Whitfield', contactTitle: 'VP, Small Business Lending', email: 'dwhitfield@rccb.example.com', phone: '(707) 555-0142',
    stage: 'Active', owner: 'Aaron', referrals: 14, lastContact: '2026-07-21', nextFollowUp: '2026-08-18',
    notes: 'Strongest bank referral source on the coast. Refers declined loan applicants for packaging help. Quarterly lunch-and-learn cadence.',
    activities: [
      { date: '2026-07-21', type: 'Meeting', note: 'Quarterly check-in with lending team. Two new loan officers onboarded to referral process.' },
      { date: '2026-06-10', type: 'Referral', note: 'Referred 3 declined applicants for loan packaging assistance.' },
      { date: '2026-04-02', type: 'Event', note: "Co-hosted 'Access to Capital' workshop in Eureka — 41 attendees." } ] },
  { id: 2, name: 'Six Rivers Federal Credit Union', type: 'Referral', subtype: 'Credit union', city: 'Arcata', center: 'North Coast SBDC',
    contact: 'Marcus Bell', contactTitle: 'Business Services Manager', email: 'mbell@sixriversfcu.example.com', phone: '(707) 555-0179',
    stage: 'Active', owner: 'Aaron', referrals: 9, lastContact: '2026-07-08', nextFollowUp: '2026-08-05',
    notes: 'Referral agreement in place since 2024. Sends microloan candidates; we send deposit-ready graduates back.',
    activities: [
      { date: '2026-07-08', type: 'Call', note: 'Discussed co-branding a fall microloan readiness series.' },
      { date: '2026-05-27', type: 'Referral', note: '2 microloan candidates referred for business plan review.' } ] },
  { id: 3, name: 'Shasta Cascade Economic Development District', type: 'Referral', subtype: 'EDC', city: 'Redding', center: 'Shasta-Cascade SBDC',
    contact: 'Lena Ortiz', contactTitle: 'Program Director', email: 'lortiz@scedd.example.org', phone: '(530) 555-0113',
    stage: 'Active', owner: 'Scott', referrals: 11, lastContact: '2026-07-15', nextFollowUp: '2026-07-24',
    notes: 'Cross-referral MOU. They route CDBG business-assistance inquiries to us; we flag infrastructure-scale projects to them.',
    activities: [
      { date: '2026-07-15', type: 'Meeting', note: 'Joint review of rural manufacturing pipeline. Follow-up owed on shared intake form.' },
      { date: '2026-06-03', type: 'Referral', note: '4 CDBG inquiries routed to Shasta-Cascade advisors.' } ] },
  { id: 4, name: 'Golden Valley Community Loan Fund', type: 'Referral', subtype: 'CDFI', city: 'Chico', center: 'Butte College SBDC',
    contact: 'Sam Nakagawa', contactTitle: 'Lending Director', email: 'snakagawa@gvclf.example.org', phone: '(530) 555-0167',
    stage: 'In Discussion', owner: 'Gustavo', referrals: 3, lastContact: '2026-07-02', nextFollowUp: '2026-07-22',
    notes: 'Negotiating formal referral agreement. They want a warm-handoff SLA (48h response). Draft shared 6/20.',
    activities: [
      { date: '2026-07-02', type: 'Email', note: 'Sent revised referral agreement draft with 48-hour response commitment.' },
      { date: '2026-06-20', type: 'Meeting', note: 'Reviewed handoff workflow; they asked for named advisor per referral.' } ] },
  { id: 5, name: 'Chico Chamber of Commerce', type: 'Community', subtype: 'Chamber', city: 'Chico', center: 'Butte College SBDC',
    contact: 'Rita Alvarez', contactTitle: 'Membership Director', email: 'ralvarez@chicochamber.example.com', phone: '(530) 555-0121',
    stage: 'Active', owner: 'Gustavo', referrals: 6, lastContact: '2026-07-17', nextFollowUp: '2026-09-01',
    notes: "Monthly 'Office Hours' table at chamber mixers. Chamber promotes our workshops to ~900 members.",
    activities: [
      { date: '2026-07-17', type: 'Event', note: 'Office-hours table at July mixer — 12 conversations, 4 intake forms.' },
      { date: '2026-06-19', type: 'Event', note: 'June mixer table — 9 conversations.' } ] },
  { id: 8, name: 'Humboldt Makers Alliance', type: 'Community', subtype: 'Trade association', city: 'Eureka', center: 'North Coast SBDC',
    contact: 'Theo Marsh', contactTitle: 'President', email: 'tmarsh@humboldtmakers.example.org', phone: '(707) 555-0135',
    stage: 'Active', owner: 'Aaron', referrals: 5, lastContact: '2026-07-19', nextFollowUp: '2026-08-14',
    notes: "Co-host quarterly 'Maker to Market' workshop series. Alliance handles venue + promotion; we provide curriculum.",
    activities: [
      { date: '2026-07-19', type: 'Event', note: 'Maker to Market Q3 session — pricing & wholesale. 28 attendees, 6 new clients.' },
      { date: '2026-05-14', type: 'Meeting', note: 'Planned Q3–Q4 workshop calendar.' } ] },
  { id: 9, name: 'SBA Sacramento District Office', type: 'Funding', subtype: 'Federal partner', city: 'Sacramento', center: 'Lead Center',
    contact: 'Janelle Brooks', contactTitle: 'Economic Development Specialist', email: 'jbrooks@sba.example.gov', phone: '(916) 555-0102',
    stage: 'Active', owner: 'Eric', referrals: 8, lastContact: '2026-07-14', nextFollowUp: '2026-08-03',
    notes: 'Core program funder. Monthly milestone reporting; co-marketing on lender match events. FY27 option year paperwork due September.',
    activities: [
      { date: '2026-07-14', type: 'Meeting', note: 'Monthly program review. Flagged Q3 capital-infusion milestone tracking ahead of goal.' },
      { date: '2026-06-16', type: 'Email', note: 'Submitted June performance report.' },
      { date: '2026-05-08', type: 'Event', note: 'Joint lender match event in Sacramento — 60+ small businesses.' } ] },
  { id: 10, name: 'CA GO-Biz — Small Business Unit', type: 'Funding', subtype: 'State partner', city: 'Sacramento', center: 'Lead Center',
    contact: 'Victor Han', contactTitle: 'Program Analyst', email: 'vhan@gobiz.example.gov', phone: '(916) 555-0148',
    stage: 'Active', owner: 'Preet', referrals: 4, lastContact: '2026-06-30', nextFollowUp: '2026-07-25',
    notes: 'State match funding + technical assistance grant. Quarterly invoicing; site visit expected in Q4.',
    activities: [
      { date: '2026-06-30', type: 'Email', note: 'Q2 invoice and narrative submitted.' },
      { date: '2026-04-22', type: 'Meeting', note: 'Mid-year check-in; discussed expanding rural outreach deliverable.' } ] },
  { id: 11, name: 'Butte College Foundation', type: 'Funding', subtype: 'Host institution', city: 'Oroville', center: 'Butte College SBDC',
    contact: 'Elaine Foster', contactTitle: 'Grants Officer', email: 'efoster@buttefdn.example.edu', phone: '(530) 555-0173',
    stage: 'MOU / Agreement', owner: 'Gustavo', referrals: 0, lastContact: '2026-07-11', nextFollowUp: '2026-07-30',
    notes: 'Renewing host agreement + in-kind space commitment for FY27. Legal review on indemnification clause in progress.',
    activities: [
      { date: '2026-07-11', type: 'Agreement', note: 'FY27 host MOU draft returned from their counsel with one redline.' },
      { date: '2026-06-05', type: 'Meeting', note: 'Agreed on in-kind valuation methodology for match reporting.' } ] },
  { id: 14, name: 'Valley Oak Bank', type: 'Referral', subtype: 'Community bank', city: 'Woodland', center: 'Capital Region SBDC',
    contact: 'Sofia Reyes', contactTitle: 'SBA Lending Officer', email: 'sreyes@valleyoak.example.com', phone: '(530) 555-0151',
    stage: 'MOU / Agreement', owner: 'Preet', referrals: 2, lastContact: '2026-07-16', nextFollowUp: '2026-08-01',
    notes: 'Referral agreement at signature stage. They project 15–20 referrals/yr once loan officers are trained.',
    activities: [
      { date: '2026-07-16', type: 'Agreement', note: 'Final referral agreement sent for signature.' },
      { date: '2026-06-25', type: 'Meeting', note: 'Walked their lending team through our intake and reporting loop.' } ] },
  { id: 15, name: 'Redding Startup Week', type: 'Community', subtype: 'Event partner', city: 'Redding', center: 'Shasta-Cascade SBDC',
    contact: 'Jess Kimura', contactTitle: 'Lead Organizer', email: 'jkimura@reddingstartupweek.example.com', phone: '(530) 555-0198',
    stage: 'Active', owner: 'Scott', referrals: 7, lastContact: '2026-07-09', nextFollowUp: '2026-08-20',
    notes: 'Anchor programming partner for October Startup Week. We run the pitch clinic track; strong client acquisition channel.',
    activities: [
      { date: '2026-07-09', type: 'Meeting', note: 'Confirmed 3 SBDC sessions for October + pitch clinic mentor slots.' },
      { date: '2026-05-30', type: 'Email', note: 'Sponsorship-in-kind letter delivered for their program guide.' } ] },
  { id: 16, name: 'Pacific Gateway Ports Alliance', type: 'Community', subtype: 'Trade group', city: 'Crescent City', center: 'North Coast SBDC',
    contact: 'Owen Tate', contactTitle: 'Coordinator', email: 'otate@pgpalliance.example.org', phone: '(707) 555-0163',
    stage: 'Dormant', owner: 'Aaron', referrals: 0, lastContact: '2026-02-12', nextFollowUp: '2026-09-15',
    notes: 'Partnership paused after their coordinator transition. Revisit in September when new staff lands.',
    activities: [
      { date: '2026-02-12', type: 'Email', note: 'Outgoing coordinator confirmed pause; new hire expected late summer.' } ] },
  { id: 17, name: 'Mendocino Wine & Ag Collective', type: 'Community', subtype: 'Industry association', city: 'Ukiah', center: 'Mendocino-Lake SBDC',
    contact: 'Camille Fournier', contactTitle: 'Director of Member Services', email: 'cfournier@mendowineag.example.org', phone: '(707) 555-0117',
    stage: 'In Discussion', owner: 'Preet', referrals: 1, lastContact: '2026-07-13', nextFollowUp: '2026-08-06',
    notes: 'Designing a tasting-room profitability cohort (6 sessions). They bring members; we bring advisors + curriculum.',
    activities: [
      { date: '2026-07-13', type: 'Meeting', note: 'Cohort outline approved by their board committee. Pricing model TBD.' } ] },
  { id: 18, name: 'Northern Rivers Tribal Business Fund', type: 'Funding', subtype: 'CDFI / grantor', city: 'Hoopa', center: 'North Coast SBDC',
    contact: 'Lisa Redhawk', contactTitle: 'Fund Administrator', email: 'lredhawk@nrtbf.example.org', phone: '(530) 555-0140',
    stage: 'Prospect', owner: 'Eric', referrals: 0, lastContact: '2026-07-01', nextFollowUp: '2026-07-29',
    notes: 'Exploring co-funded advising for tribal member-owned businesses. They may fund a dedicated advisor day monthly.',
    activities: [
      { date: '2026-07-01', type: 'Call', note: 'Intro call. Requested proposal for monthly advising day + reporting template.' } ] },
];
