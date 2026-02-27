/** TFG Application — shared types
 *
 * Fields align with Gravity Forms (form ID 16) and the Neoserra
 * "TFG Application 2026" custom form (submitted via static PIN).
 */

export interface TeamMember {
  name: string;
  linkedinUrl: string;
}

export interface TFGApplicationData {
  // Company Info
  companyName: string;        // GF field 2
  website: string;            // GF field 3

  // Primary Contact
  firstName: string;          // GF field 5
  lastName: string;           // GF field 57
  email: string;              // GF field 56
  phone: string;              // GF field 58
  linkedin: string;           // GF field 7
  streetAddress: string;      // GF field 8.1
  city: string;               // GF field 8.3
  state: string;              // GF field 8.4
  zipCode: string;            // GF field 8.5
  stateOfIncorporation: string; // GF field 9

  // Industry
  industrySectors: string[];  // GF field 10 (checkbox)
  otherIndustry: string;      // GF field 11 (conditional on "Other")

  // Vision & Product
  vision: string;             // GF field 14 (500 chars)
  problem: string;            // GF field 15 (500 chars)
  solution: string;           // GF field 16 (500 chars)

  // Market & Validation
  marketOpportunity: string;  // GF field 19 (500 chars)
  icorpsStatus: string;       // GF field 20 — 'Yes' | 'No' | 'Planning to Apply'
  icorpsDetails: string;      // GF field 21 (conditional)
  interviewStatus: string;    // GF field 22 — 'Yes' | 'No' | 'In Progress'
  interviewCount: string;     // GF field 23 (conditional, number)
  interviewLearnings: string; // GF field 24 (conditional, 500 chars)
  idealCustomerProfile: string; // GF field 25 (500 chars)

  // Traction & Revenue
  productStage: string;       // GF field 28
  inMarketStatus: string;     // GF field 29 (500 chars)
  revenueStage: string;       // GF field 30
  sbirStatus: string;         // GF field 31 (300 chars, optional)
  recentAchievements: string; // GF field 32 (500 chars)

  // Financing & Runway
  totalFunding: string;       // GF field 35
  lastRound: string[];        // GF field 36 (checkbox)
  raisingCapital: string;     // GF field 37 — 'true' | 'false'
  raiseDetails: string;       // GF field 38 (conditional, 300 chars)
  runwayMonths: string;       // GF field 39 (number)

  // Team
  teamMembers: TeamMember[];  // GF field 42
  teamFit: string;            // GF field 43 (500 chars)
  timeWorking: string;        // GF field 44

  // Support & Referral
  supportNeeds: string[];     // GF field 47 (checkbox)
  otherSupport: string;       // GF field 48 (conditional)
  referralSource: string;     // GF field 50
  referrerName: string;       // GF field 51
  pitchDeckFile: File | null; // GF field 52 (file upload)
  pitchDeckFileName: string;  // display name after upload
  signature: string;          // GF field 53

  // Calculated
  readinessScore: number;     // GF field 55 (auto-calculated)
}

export interface TFGSubmitResult {
  success: boolean;
  neoserraResult?: Record<string, unknown>;
  pinResult?: Record<string, unknown> | null;
  applicationId?: string;
  error?: string;
}

export type TFGStepId =
  | 'company_contact'
  | 'industry'
  | 'vision_product'
  | 'market_validation'
  | 'traction_revenue'
  | 'financing_runway'
  | 'team'
  | 'support_referral'
  | 'review';

export const TFG_STEP_ORDER: TFGStepId[] = [
  'company_contact',
  'industry',
  'vision_product',
  'market_validation',
  'traction_revenue',
  'financing_runway',
  'team',
  'support_referral',
  'review',
];

export function getVisibleSteps(): TFGStepId[] {
  return [...TFG_STEP_ORDER];
}

/** Readiness score: 0-2 = Catalyst, 3-5 = Needs Assessment, 6+ = Investor-Ready */
export function calculateReadinessScore(data: TFGApplicationData): number {
  let score = 0;

  // I-Corps participation (GF field 20)
  if (data.icorpsStatus === 'Yes') score += 1;

  // Customer discovery (GF field 22)
  if (data.interviewStatus === 'Yes') score += 1;

  // Product stage (GF field 28) — mapped to numeric values
  const stageScores: Record<string, number> = {
    'Idea': 0,
    'Prototype or Lab Benchmark': 1,
    'Proof of Concept': 2,
    'MVP': 3,
    'Product Deployment': 4,
  };
  score += stageScores[data.productStage] ?? 0;

  // Revenue stage (GF field 30) — choice values
  const revenueScores: Record<string, number> = {
    '0': 0,  // Pre-Revenue
    '1': 1,  // Pilot Revenue
    '2': 2,  // <500K, <1MM, >1MM all map to 2
  };
  score += revenueScores[data.revenueStage] ?? 0;

  return score;
}

export function createEmptyTFGApplication(): TFGApplicationData {
  return {
    companyName: '',
    website: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    streetAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    stateOfIncorporation: '',
    industrySectors: [],
    otherIndustry: '',
    vision: '',
    problem: '',
    solution: '',
    marketOpportunity: '',
    icorpsStatus: '',
    icorpsDetails: '',
    interviewStatus: '',
    interviewCount: '',
    interviewLearnings: '',
    idealCustomerProfile: '',
    productStage: '',
    inMarketStatus: '',
    revenueStage: '',
    sbirStatus: '',
    recentAchievements: '',
    totalFunding: '',
    lastRound: [],
    raisingCapital: '',
    raiseDetails: '',
    runwayMonths: '',
    teamMembers: [{ name: '', linkedinUrl: '' }],
    teamFit: '',
    timeWorking: '',
    supportNeeds: [],
    otherSupport: '',
    referralSource: '',
    referrerName: '',
    pitchDeckFile: null,
    pitchDeckFileName: '',
    signature: '',
    readinessScore: 0,
  };
}
