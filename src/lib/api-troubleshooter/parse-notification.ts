/**
 * Parse a pasted "New milestone submission … Step 2" notification email into
 * a structured submission, and flag values that look wrong.
 *
 * Accepts either the raw HTML source or plain text copied from the rendered
 * email. Pure functions — no I/O.
 */

import type { ParsedSubmission, ValueAnomaly } from './types';

/** Labels that appear as section headers in the notification email. */
const KNOWN_LABELS = [
  'Contact ID',
  'Contact Email',
  'Contact First Name',
  'Select Business',
  'Neoserra Client ID', // same field's label in the GF entry detail view
  'Select all that apply',
  'Initial Full-Time Staff',
  'Total Full-Time Employees',
  'Initial Part-Time Staff',
  'Total Part-Time Employees',
  'Change in Full Time Employees',
  'Change in Part Time Employees',
  'Initial Gross Sales',
  "Last Year's Gross Revenue",
  'Current Gross Sales',
  'Change in Gross Sales',
  'Business Start Verification',
  'Business Structure',
  'Funding Source',
  'Total Amount',
  'Signature',
];

const MILESTONE_TYPES = [
  'I Hired New Employees',
  'I Increased My Sales',
  'I Started a New Business',
  'I Got My Business Funded',
];

/** Strip HTML to text lines, preserving table-cell / list-item boundaries. */
function htmlToLines(input: string): string[] {
  const text = input
    .replace(/<\s*(td|tr|li|p|br|div|table)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"');
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function matchLabel(line: string): string | null {
  return KNOWN_LABELS.find((l) => line.toLowerCase() === l.toLowerCase()) || null;
}

/**
 * Parse notification email content (HTML source or copied text) into
 * label/value pairs, then into a ParsedSubmission.
 */
export function parseNotification(raw: string): ParsedSubmission {
  const lines = htmlToLines(raw);

  const fields: { label: string; value: string }[] = [];
  let current: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) fields.push({ label: current, value: buffer.join(' ').trim() });
    current = null;
    buffer = [];
  };

  for (const line of lines) {
    const label = matchLabel(line);
    if (label) {
      flush();
      current = label;
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();

  const get = (label: string): string | null => {
    const f = fields.find((x) => x.label.toLowerCase() === label.toLowerCase());
    return f && f.value ? f.value : null;
  };

  // Milestone types can land inside "Select all that apply" as run-together
  // text; match against the known list anywhere in the raw content.
  const joined = lines.join('\n');
  const milestoneTypes = MILESTONE_TYPES.filter((t) => joined.includes(t));

  const parsed: ParsedSubmission = {
    contactId: get('Contact ID'),
    contactEmail: get('Contact Email'),
    firstName: get('Contact First Name'),
    businessId: get('Select Business') ?? get('Neoserra Client ID'),
    milestoneTypes,
    fields,
    signature: get('Signature'),
    anomalies: [],
  };
  parsed.anomalies = findAnomalies(parsed);
  return parsed;
}

function num(value: string | null): number | null {
  if (value == null) return null;
  const n = parseFloat(value.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Flag values that Neoserra may silently reject or that misstate the EI. */
export function findAnomalies(p: ParsedSubmission): ValueAnomaly[] {
  const anomalies: ValueAnomaly[] = [];
  const field = (label: string) =>
    p.fields.find((f) => f.label.toLowerCase() === label.toLowerCase())?.value ?? null;

  if (!p.businessId) {
    anomalies.push({
      field: 'Select Business',
      issue: 'No business (client) ID in the submission — nothing tells Neoserra which client record this belongs to.',
    });
  }
  if (!p.contactId) {
    anomalies.push({
      field: 'Contact ID',
      issue: 'No contact ID in the submission.',
    });
  }
  if (p.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.contactEmail)) {
    anomalies.push({
      field: 'Contact Email',
      issue: `"${p.contactEmail}" is not a valid email address — Neoserra rejects records with malformed emails.`,
    });
  }

  // Employee milestones: a negative change usually means initial/current were
  // entered swapped (the form computes change = current − initial).
  for (const kind of ['Full Time', 'Part Time'] as const) {
    const change = num(field(`Change in ${kind} Employees`));
    const initial = num(field(`Initial ${kind === 'Full Time' ? 'Full-Time' : 'Part-Time'} Staff`));
    const total = num(field(`Total ${kind === 'Full Time' ? 'Full-Time' : 'Part-Time'} Employees`));
    if (change != null && change < 0) {
      anomalies.push({
        field: `Change in ${kind} Employees`,
        issue: `Computes as ${change} — the client reports LOSING ${Math.abs(change)} ${kind.toLowerCase()} employees.`,
        suggestion:
          initial != null && total != null
            ? `The starting and current numbers were likely entered in reverse (entered ${initial} → ${total}; probably meant ${total} → ${initial}, a gain of ${Math.abs(change)}). Confirm with the advisor before correcting.`
            : 'The starting and current numbers may have been entered in reverse. Confirm with the advisor.',
      });
    }
  }

  // Sales milestone: negative change is the same swapped-fields signature.
  const salesChange = num(field('Change in Gross Sales'));
  if (salesChange != null && salesChange < 0) {
    anomalies.push({
      field: 'Change in Gross Sales',
      issue: `Computes as ${salesChange.toLocaleString()} — the client reports a sales DECREASE.`,
      suggestion: 'Initial and current sales may have been entered in reverse. Confirm with the advisor.',
    });
  }

  if (p.milestoneTypes.length === 0) {
    anomalies.push({
      field: 'Select all that apply',
      issue: 'No milestone category was recognized in this submission.',
    });
  }

  return anomalies;
}

/** Quick check that pasted text looks like a Step 2 notification at all. */
export function looksLikeNotification(raw: string): boolean {
  const t = raw.toLowerCase();
  return t.includes('contact id') || t.includes('select business') || t.includes('milestone submission');
}
