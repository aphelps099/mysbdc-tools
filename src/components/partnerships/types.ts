/* ═══════════════════════════════════════════════════════
   Partnership CRM — data model + design-system constants.
   Source of truth: README (design handoff) + reference/
   Partnership CRM.dc.html.
   ═══════════════════════════════════════════════════════ */

export type PartnerType = 'Referral' | 'Funding' | 'Community';

export type Stage =
  | 'Prospect'
  | 'Outreach'
  | 'In Discussion'
  | 'MOU / Agreement'
  | 'Active'
  | 'Dormant';

export type ActivityType =
  | 'Meeting'
  | 'Call'
  | 'Email'
  | 'Event'
  | 'Referral'
  | 'Agreement';

export type Activity = {
  date: string; // YYYY-MM-DD
  type: ActivityType;
  note: string;
};

export type Partner = {
  id: number;
  name: string;
  type: PartnerType;
  subtype: string;
  city: string;
  center: string;
  contact: string;
  contactTitle: string;
  email: string;
  phone: string;
  linkedin?: string; // profile/company URL, optional
  stage: Stage;
  owner: string;
  referrals: number; // client referrals YTD
  lastContact: string; // YYYY-MM-DD
  nextFollowUp: string; // YYYY-MM-DD | ''
  notes: string;
  activities: Activity[];
};

export const TYPES: Record<PartnerType, { label: string; short: string; color: string }> = {
  Referral: { label: 'Referral partner', short: 'Referral', color: '#1b5faf' },
  Funding: { label: 'Funding & host', short: 'Funding', color: '#00675c' },
  Community: { label: 'Community & events', short: 'Community', color: '#253247' },
};

export const STAGES: Stage[] = [
  'Prospect',
  'Outreach',
  'In Discussion',
  'MOU / Agreement',
  'Active',
  'Dormant',
];

/* Stage bar ramp, in stage order */
export const STAGE_COLORS = ['#dcecf2', '#b9d9e6', '#8fc5d9', '#4f8fc4', '#1b5faf', '#d8d8d8'];

export const OWNERS = ['Aaron', 'Gustavo', 'Scott', 'Preet', 'Eric'];

export const ACT_TYPES: ActivityType[] = [
  'Meeting',
  'Call',
  'Email',
  'Event',
  'Referral',
  'Agreement',
];

export type SortKey =
  | 'name'
  | 'type'
  | 'stage'
  | 'contact'
  | 'owner'
  | 'referrals'
  | 'lastContact'
  | 'nextFollowUp';

export const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Organization' },
  { key: 'type', label: 'Type' },
  { key: 'stage', label: 'Stage' },
  { key: 'contact', label: 'Primary contact' },
  { key: 'owner', label: 'Owner' },
  { key: 'referrals', label: 'Referrals YTD' },
  { key: 'lastContact', label: 'Last contact' },
  { key: 'nextFollowUp', label: 'Next follow-up' },
];

export type ViewId = 'dashboard' | 'pipeline' | 'partners' | 'activity';

export const TABS: { id: ViewId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'partners', label: 'Partners' },
  { id: 'activity', label: 'Activity' },
];

export type ModalId = null | 'detail' | 'add' | 'log';
