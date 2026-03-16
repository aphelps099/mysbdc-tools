/** Session Notes — shared types and step definitions */

// ─── Reuse Neoserra types from milestones ───────────────────

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

// ─── Structured session note sections ───────────────────────

export interface NoteSections {
  description: string;  // What occurred in the session
  analysis: string;     // The problem to be solved
  actionsTaken: string; // Steps taken to solve the problem
  followUp: string;     // Actions before next session
}

// ─── NeoSerra coded value options ───────────────────────────

export const SESSION_TYPES = [
  { code: 'F', label: 'Follow-up' },
  { code: 'I', label: 'Initial / New' },
  { code: 'A', label: 'Administrative' },
] as const;

export const CONTACT_TYPES = [
  { code: 'VC', label: 'Video-conferencing' },
  { code: 'PH', label: 'Phone' },
  { code: 'ON', label: 'Center Site (in-person)' },
  { code: 'AT', label: 'Client Site (in-person)' },
  { code: 'EM', label: 'Online (email or chat)' },
] as const;

export const SBA_AREAS = [
  { code: '1', label: 'Start-up Assistance' },
  { code: '3', label: 'Marketing / Sales' },
  { code: '7', label: 'Managing a Business' },
  { code: '2', label: 'Financing / Capital' },
  { code: 'BP', label: 'Business Plan' },
  { code: 'LS', label: 'Legal Structure / Licensure' },
  { code: 'FM', label: 'Financial Management' },
  { code: '5', label: 'Business Accounting / Budget' },
  { code: 'EC', label: 'eCommerce' },
  { code: 'SM', label: 'Social Media' },
  { code: '9', label: 'HR / Managing Employees' },
  { code: '6', label: 'Cash Flow Management' },
  { code: 'ES', label: 'Expansion / Scaling' },
  { code: '4', label: 'Government Contracting' },
  { code: 'HC', label: 'Government Certifications' },
  { code: 'I1', label: 'Investment Funding' },
  { code: 'T1', label: 'Technology Commercialization' },
  { code: 'AP-GIP', label: 'SBIR/STTR/Innovation Programs' },
  { code: 'BK', label: 'Bookkeeping' },
  { code: '10', label: 'Technology / Computers' },
  { code: 'AI', label: 'Artificial Intelligence (AI)' },
  { code: 'CR', label: 'Customer Relations' },
  { code: '8', label: 'Engineering R&D' },
  { code: '20', label: 'Intellectual Property' },
  { code: '11', label: 'International Trade' },
  { code: '12', label: 'Buy/Sell Business' },
  { code: 'DP', label: 'Disaster Planning / Recovery' },
  { code: 'IAA', label: 'Intake Assessment' },
  { code: 'OT', label: 'Other' },
] as const;

export const FUNDING_SOURCES = [
  { code: 'S', label: 'SBA' },
  { code: 'Local', label: 'Local' },
  { code: '3', label: 'State (CIP)' },
  { code: '+', label: 'SSBCI' },
  { code: 'O', label: 'Other' },
  { code: 'E', label: 'Alameda County' },
  { code: 'C', label: 'CDBG' },
  { code: 'CTP', label: 'City of Sacramento cTAP' },
  { code: 'DOR', label: 'Department of Rehab' },
  { code: ']', label: 'Program Income' },
  { code: 'SJC', label: 'San Joaquin County' },
  { code: 'CZI', label: 'Chan Zuckerberg Initiative' },
  { code: 'IT', label: 'APY' },
  { code: 'P2', label: 'z_TAP PRIME (FY25)' },
  { code: '!', label: 'z_USDA (FY23-26)' },
  { code: '2', label: 'z_WBC EP (FY23-25)' },
  { code: 'P1', label: 'z_West PRIME (FY25-26)' },
  { code: 'CCRPT', label: 'zz_CCRP TAP (WBC FY26)' },
] as const;

// ─── Session note form data ─────────────────────────────────

export interface SessionNoteData {
  // Step 1: Contact lookup
  email: string;

  // Resolved from Neoserra
  contactId: string;
  contactName: string;

  // Step 2: Selected client/business
  clientId: string;         // Neoserra reference ID
  clientPublicId: string;   // Public client ID
  clientName: string;
  clientCenterId: string;
  counselorId: string;

  // Step 3: Session details — mandatory NeoSerra fields
  sessionDate: string;        // YYYY-MM-DD (mandatory)
  contactDuration: string;    // minutes as string (mandatory: contactDuration)
  prepTimeMinutes: string;    // minutes as string (optional)
  subject: string;            // mandatory: text
  sessionType: string;        // mandatory: type — 'I' | 'F' | 'A'
  contactType: string;        // mandatory: contactType — 'ON' | 'AT' | 'EM' | 'PH' | 'VC'
  counselingArea: string;     // mandatory: sbaArea
  fundingSource: string;      // mandatory: fundarea
  language: string;           // optional: language (default 'EN')
  nbrPeople: string;          // mandatory: nbrpeople (default '1')

  // Step 4: Raw notes input (AI-first flow)
  rawNotes: string;
  useManualEntry: boolean;

  // Step 5: Structured sections (AI-formatted or manually entered)
  sections: NoteSections;

  // AI formatting state
  aiFormatted: boolean;
}

// ─── Submission result ──────────────────────────────────────

export interface SessionNoteResult {
  success: boolean;
  counselingId?: string;
  error?: string;
}

// ─── Steps ──────────────────────────────────────────────────

export type StepId =
  | 'client_lookup'
  | 'select_client'
  | 'session_details'
  | 'ai_format'
  | 'review_edit';

export const STEP_ORDER: StepId[] = [
  'client_lookup',
  'select_client',
  'session_details',
  'ai_format',
  'review_edit',
];

export function createEmptySessionNote(): SessionNoteData {
  const today = new Date().toISOString().split('T')[0];
  return {
    email: '',
    contactId: '',
    contactName: '',
    clientId: '',
    clientPublicId: '',
    clientName: '',
    clientCenterId: '',
    counselorId: '',
    sessionDate: today,
    contactDuration: '60',
    prepTimeMinutes: '15',
    subject: '',
    sessionType: 'F',
    contactType: 'VC',
    counselingArea: '',
    fundingSource: '',
    language: 'EN',
    nbrPeople: '1',
    rawNotes: '',
    useManualEntry: false,
    sections: {
      description: '',
      analysis: '',
      actionsTaken: '',
      followUp: '',
    },
    aiFormatted: false,
  };
}
