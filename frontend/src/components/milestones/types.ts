/** Milestone Collection — shared types
 *
 * Two-form flow from Gravity Forms (38 + 39) consolidated
 * into a single multi-step wizard with Neoserra integration.
 */

// ─── Resolved Neoserra data ──────────────────────────────────

export interface NeoserraContact {
  id: string;
  first: string;
  last: string;
  email: string;
}

export interface NeoserraClientOption {
  id: string;       // Neoserra reference ID
  clientId: string; // Public client ID (e.g. "NC-12345")
  company: string;
  ftEmps: number;
  ptEmps: number;
  grossSales: number;
  centerId?: string;
  counselorId?: string;
}

export interface LookupResult {
  found: boolean;
  contact: NeoserraContact | null;
  clients: NeoserraClientOption[];
  error?: string;
}

// ─── Milestone form data ─────────────────────────────────────

export type MilestoneCategory =
  | 'hired_employees'
  | 'increased_sales'
  | 'started_business'
  | 'got_funded';

export interface FundingRow {
  source: string;
  amount: string;
  typeCode?: string;  // Neoserra investment type code (e.g. "L" for SBA Loan)
}

export interface MilestoneData {
  // Step 1: Contact lookup
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Resolved from Neoserra (after lookup)
  contactId: string;
  contactEmail: string;

  // Step 2: Selected business
  clientId: string;         // Neoserra reference ID
  clientPublicId: string;   // Public client ID
  clientName: string;

  // Client baseline data (from Neoserra client record)
  initialFtEmps: number;
  initialPtEmps: number;
  initialGrossSales: number;
  clientCenterId: string;
  counselorId: string;

  // Step 3: Milestone categories
  categories: MilestoneCategory[];

  // Step 4: Employees
  totalFtEmployees: string;
  totalPtEmployees: string;

  // Step 5: Sales
  grossRevenue: string;

  // Step 6: New Business
  businessStartVerified: 'yes' | 'no' | '';
  businessStructure: string;
  businessStartDate: string;

  // Step 7: Funding
  investedOwnMoney: 'yes' | 'no' | '';
  ownInvestment: string;
  hasOtherFunding: 'yes' | 'no' | '';
  additionalFunding: FundingRow[];

  // Step 8: Testimonial + Signature
  testimonial: string;
  signature: string;

  // Hidden
  program: string;
}

// ─── Submission result ───────────────────────────────────────

export interface MilestoneResult {
  success: boolean;
  recordsCreated: number;
  details: Record<string, unknown>[];
  error?: string;
}

// ─── Steps ───────────────────────────────────────────────────

export type StepId =
  | 'contact_lookup'
  | 'select_business'
  | 'select_milestones'
  | 'employees'
  | 'sales'
  | 'new_business'
  | 'funding'
  | 'testimonial'
  | 'review';

const STEP_ORDER: StepId[] = [
  'contact_lookup',
  'select_business',
  'select_milestones',
  'employees',
  'sales',
  'new_business',
  'funding',
  'testimonial',
];

export function getVisibleSteps(data: MilestoneData): StepId[] {
  return STEP_ORDER.filter((id) => {
    if (id === 'employees') return data.categories.includes('hired_employees');
    if (id === 'sales') return data.categories.includes('increased_sales');
    if (id === 'new_business') return data.categories.includes('started_business');
    if (id === 'funding') return data.categories.includes('got_funded');
    return true;
  });
}

export function createEmptyMilestone(): MilestoneData {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contactId: '',
    contactEmail: '',
    clientId: '',
    clientPublicId: '',
    clientName: '',
    initialFtEmps: 0,
    initialPtEmps: 0,
    initialGrossSales: 0,
    clientCenterId: '',
    counselorId: '',
    categories: [],
    totalFtEmployees: '',
    totalPtEmployees: '',
    grossRevenue: '',
    businessStartVerified: '',
    businessStructure: '',
    businessStartDate: '',
    investedOwnMoney: '',
    ownInvestment: '',
    hasOtherFunding: '',
    additionalFunding: [],
    testimonial: '',
    signature: '',
    program: '',
  };
}
