/** Roadmap for Innovation — California SBDC
 *
 * Application form for the statewide small manufacturer
 * advising & training program. Basic intake only.
 */

export interface RoadmapApplicationData {
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;             // Position

  // Company
  companyName: string;
  website: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  yearsInOperation: string;  // Range selector
  productDescription: string; // What they manufacture

  // Interests — advising areas + group training courses
  coachingInterests: string[];
  groupCourses: string[];
  biggestChallenge: string;  // Free text — what's your #1 challenge?

  // Wrap-up
  referralSource: string;
  referralOther: string;
  signature: string;
  privacyRelease: string;
}

export interface RoadmapSubmitResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

export type RoadmapStepId =
  | 'contact'
  | 'company'
  | 'interests'
  | 'wrapup'
  | 'review';

export const ROADMAP_STEP_ORDER: RoadmapStepId[] = [
  'contact',
  'company',
  'interests',
  'wrapup',
  'review',
];

export function getVisibleSteps(): RoadmapStepId[] {
  return [...ROADMAP_STEP_ORDER];
}

export function createEmptyRoadmapApplication(): RoadmapApplicationData {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    companyName: '',
    website: '',
    streetAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    yearsInOperation: '',
    productDescription: '',
    coachingInterests: [],
    groupCourses: [],
    biggestChallenge: '',
    referralSource: '',
    referralOther: '',
    signature: '',
    privacyRelease: '',
  };
}

export const COACHING_OPTIONS = [
  { id: 'lean', label: 'Lean Operations', desc: 'Waste reduction, flow improvement, continuous improvement' },
  { id: 'quality', label: 'Quality Systems', desc: 'ISO/AS certification, audit prep, quality practices' },
  { id: 'cybersecurity', label: 'Cybersecurity', desc: 'DFARS, NIST 800-171, CMMC Level 2 readiness' },
  { id: 'hr', label: 'Human Resources', desc: 'Workforce practices for small manufacturing teams' },
  { id: 'food', label: 'Food Market Development', desc: 'Food & beverage market channels, sales growth' },
  { id: 'financial', label: 'Financial Advising', desc: 'Costs, pricing, and profitability guidance' },
  { id: 'strategy', label: 'Strategy & Leadership', desc: 'Decision-making, leadership, day-to-day management' },
];

export const GROUP_COURSE_OPTIONS = [
  { id: 'strategic_planning', label: 'Strategic Planning for Manufacturers', desc: '6 sessions over 12 weeks \u2014 Wednesdays, 9\u201310:30 AM' },
  { id: 'supply_chain', label: 'Supply Chain Procurement Training', desc: '5-week course with Barbara Weg' },
];

export const YEARS_RANGES = [
  { value: 'pre', label: 'Not yet started' },
  { value: '<1', label: 'Less than 1 year' },
  { value: '1-3', label: '1–3 years' },
  { value: '4-10', label: '4–10 years' },
  { value: '10+', label: '10+ years' },
];

export const REFERRAL_SOURCES = [
  { value: '', label: 'Select...' },
  { value: 'sbdc', label: 'SBDC' },
  { value: 'sba', label: 'SBA' },
  { value: 'calosba', label: 'CalOSBA' },
  { value: 'mep', label: 'MEP Center' },
  { value: 'industry', label: 'Industry Association' },
  { value: 'peer', label: 'Peer / Business Owner' },
  { value: 'web', label: 'Website / Online Search' },
  { value: 'social', label: 'Social Media' },
  { value: 'event', label: 'Event or Workshop' },
  { value: 'other', label: 'Other' },
];
