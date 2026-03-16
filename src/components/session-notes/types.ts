/** Session Notes — shared types and step definitions */

// ─── Reuse Neoserra types from milestones ───────────────────
// We import the same contact/client types used by the milestones wizard.

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

  // Step 3: Session details
  sessionDate: string;      // YYYY-MM-DD
  durationMinutes: string;  // e.g. "60"
  prepTimeMinutes: string;  // e.g. "15"
  subject: string;          // Mandatory "text" field in Neoserra

  // Step 4: Raw notes input (AI-first flow)
  rawNotes: string;         // Pasted raw text / transcript
  useManualEntry: boolean;  // Toggle for manual section entry

  // Step 5: Structured sections (AI-formatted or manually entered)
  sections: NoteSections;

  // AI formatting state
  aiFormatted: boolean;     // Whether AI has formatted the sections
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
    durationMinutes: '60',
    prepTimeMinutes: '15',
    subject: '',
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
