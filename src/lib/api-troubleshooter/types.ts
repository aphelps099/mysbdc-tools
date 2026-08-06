/**
 * API Troubleshooter — shared types.
 *
 * OBSERVE-ONLY TOOL. Nothing in this module tree may write to Neoserra,
 * WordPress, Gravity Forms, or any shared store. See
 * docs/milestone-delivery-watchdog-design.md §0 for the hard constraints.
 */

/** A value that looks wrong in a submission payload. */
export interface ValueAnomaly {
  field: string;
  /** Plain-English description of what looks wrong. */
  issue: string;
  /** Plain-English suggestion, when we can infer one. */
  suggestion?: string;
}

/** A milestone submission parsed from a pasted notification email. */
export interface ParsedSubmission {
  contactId: string | null;
  contactEmail: string | null;
  firstName: string | null;
  businessId: string | null;
  /** e.g. "I Hired New Employees", "I Increased My Sales" */
  milestoneTypes: string[];
  /** Every label/value pair found in the notification, in order. */
  fields: { label: string; value: string }[];
  signature: string | null;
  anomalies: ValueAnomaly[];
}

/** One read-only request we attempted against Neoserra. */
export interface ProbeAttempt {
  path: string;
  status: number | 'timeout' | 'network-error';
  note: string;
}

/** Result of a read-only Neoserra probe (possibly across several paths). */
export interface ProbeResult<T = unknown> {
  found: boolean;
  data: T | null;
  attempts: ProbeAttempt[];
}

export interface NeoserraFindings {
  configured: boolean;
  contact: ProbeResult | null;
  client: ProbeResult | null;
  milestones: ProbeResult | null;
  /** Client IDs discovered on the contact record (email-lookup chaining). */
  linkedClientIds?: string[];
}

export type VerdictStatus =
  | 'delivered'         // matching milestone record found in Neoserra
  | 'missing'           // submission exists, Neoserra readably has no record
  | 'unverifiable'      // we could not read milestones from Neoserra (API limits)
  | 'value-anomaly'     // record status unknown/ok but values look wrong
  | 'lookup-ok'         // client-lookup mode: contact + client found
  | 'lookup-failed'     // client-lookup mode: no contact for that email
  | 'not-configured';   // Neoserra credentials absent on this deployment

export interface EmailDraft {
  subject: string;
  body: string;
}

/** The plain-English diagnosis shown on the page and in the email draft. */
export interface Diagnosis {
  status: VerdictStatus;
  /** One-line status chip text, e.g. "Not found in Neoserra". */
  headline: string;
  whatHappened: string;
  likelyIssue: string;
  fix: string;
  emailDraft: EmailDraft;
}

export interface InvestigateResponse {
  parsed: ParsedSubmission | null;
  neoserra: NeoserraFindings;
  /** Gravity Forms entries ledger (read-only) — null when not configured. */
  wordpress?: import('./gravity-forms').GfFindings | null;
  diagnosis: Diagnosis;
}
