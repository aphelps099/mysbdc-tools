/** Smart 641 Intake — shared types
 *
 * Field names align with the Gravity Forms → Neoserra Records Add-on feed
 * used in production (form ID 9). Default center_id=107 for testing.
 */

export interface IntakeData {
  // Step 1: Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;

  // Step 2: Business Status — "B" (in business) or "P" (not yet)
  businessStatus: 'B' | 'P' | '';

  // Step 3: Business Details (shown when status == "B")
  companyName: string;
  dateEstablished: string;      // MM/DD/YYYY
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  businessDescription: string;  // Core products/services
  position: string;             // CEO, OWN, SP, etc.

  // Step 3 alt: Pre-venture (shown when status == "P")
  businessIdea: string;

  // Step 4: Goals (Smart 641 net-new)
  goals: string[];

  // Step 5: Capital Readiness (conditional)
  capitalTimeline: string;
  capitalAmount: string;
  docsReady: string;
  creditAwareness: string;

  // Step 6: Demographics
  gender: string;
  ethnicity: string;
  hispanic: string;
  veteran: string;
  education: string;
  language: string;

  // Additional info
  website: string;
  specialPrograms: string[];
  programSignup: string;  // existing-client program enrollment → overrides center

  // Wrap-up
  referral: string;
  referralOther: string;
  newsletter: string;
  signature: string;
  privacyRelease: string;

  // Center (default 107 = Aaron Phelps Test Center)
  centerId: number | null;
}

export interface IntakeResult {
  success: boolean;
  score: number;
  track: 'advising' | 'training' | 'urgent_capital';
  trackLabel: string;
  neoserraResult?: Record<string, unknown>;
  error?: string;
}

export interface CenterOption {
  id: number;
  name: string;
}

export type StepId =
  | 'welcome'
  | 'business_status'
  | 'business_details'
  | 'goals'
  | 'programs'
  | 'capital_readiness'
  | 'demographics'
  | 'wrapup'
  | 'review';

export const STEP_ORDER: StepId[] = [
  'welcome',
  'business_status',
  'business_details',
  'goals',
  'programs',
  'capital_readiness',
  'demographics',
  'wrapup',
  'review',
];

export function getVisibleSteps(data: IntakeData): StepId[] {
  return STEP_ORDER.filter((id) => {
    if (id === 'capital_readiness') return data.goals.includes('access_capital');
    return true;
  });
}

export function createEmptyIntake(): IntakeData {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    businessStatus: '',
    companyName: '',
    dateEstablished: '',
    businessAddress: '',
    businessCity: '',
    businessState: 'CA',
    businessZip: '',
    businessDescription: '',
    position: '',
    businessIdea: '',
    goals: [],
    capitalTimeline: '',
    capitalAmount: '',
    docsReady: '',
    creditAwareness: '',
    gender: '',
    ethnicity: '',
    hispanic: '',
    veteran: '',
    education: '',
    language: '',
    website: '',
    specialPrograms: [],
    programSignup: '',
    referral: '',
    referralOther: '',
    newsletter: '',
    signature: '',
    privacyRelease: 'No',
    centerId: 107,
  };
}
