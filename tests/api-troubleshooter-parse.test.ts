import { describe, it, expect } from 'vitest';
import { parseNotification, looksLikeNotification } from '../src/lib/api-troubleshooter/parse-notification';
import { extractClientIds } from '../src/lib/api-troubleshooter/neoserra-read';

/** Plain-text shape a user gets copying the rendered Gmail body. */
const PASTED_TEXT = `Contact ID
536464
Contact Email
bart@woodysbrewing.com
Contact First Name
Bart
Select Business
419762
Select all that apply
I Hired New Employees
Initial Full-Time Staff
15
Total Full-Time Employees
6
Initial Part-Time Staff
10
Total Part-Time Employees
4
Change in Full Time Employees
-9
Change in Part Time Employees
-6
Signature
Bart Hauptman`;

/** Minimal cut of the real notification HTML source. */
const PASTED_HTML = `<table><tr bgcolor="#EAF2FA"><td colspan="2"><font><strong>Contact ID</strong></font></td></tr>
<tr bgcolor="#FFFFFF"><td width="20">&nbsp;</td><td><font>536464</font></td></tr>
<tr><td><strong>Contact Email</strong></td></tr><tr><td>&nbsp;</td><td>bart@woodysbrewing.com</td></tr>
<tr><td><strong>Select Business</strong></td></tr><tr><td>&nbsp;</td><td>419762</td></tr>
<tr><td><strong>Select all that apply</strong></td></tr><tr><td>&nbsp;</td><td><ul class='bulleted'><li>I Hired New Employees</li></ul></td></tr>
<tr><td><strong>Change in Full Time Employees</strong></td></tr><tr><td>&nbsp;</td><td>-9</td></tr>
<tr><td><strong>Signature</strong></td></tr><tr><td>&nbsp;</td><td>Bart Hauptman</td></tr></table>`;

describe('parseNotification', () => {
  it('parses pasted plain text into structured fields', () => {
    const p = parseNotification(PASTED_TEXT);
    expect(p.contactId).toBe('536464');
    expect(p.contactEmail).toBe('bart@woodysbrewing.com');
    expect(p.firstName).toBe('Bart');
    expect(p.businessId).toBe('419762');
    expect(p.milestoneTypes).toEqual(['I Hired New Employees']);
    expect(p.signature).toBe('Bart Hauptman');
  });

  it('parses raw HTML source the same way', () => {
    const p = parseNotification(PASTED_HTML);
    expect(p.contactId).toBe('536464');
    expect(p.businessId).toBe('419762');
    expect(p.milestoneTypes).toEqual(['I Hired New Employees']);
    expect(p.signature).toBe('Bart Hauptman');
  });

  it('flags negative employee changes as likely swapped fields', () => {
    const p = parseNotification(PASTED_TEXT);
    const ftAnomaly = p.anomalies.find((a) => a.field === 'Change in Full Time Employees');
    expect(ftAnomaly).toBeDefined();
    expect(ftAnomaly!.issue).toContain('-9');
    expect(ftAnomaly!.suggestion).toContain('reverse');
    // Part-time is also negative (10 → 4)
    expect(p.anomalies.some((a) => a.field === 'Change in Part Time Employees')).toBe(true);
  });

  it('flags a missing business ID', () => {
    const p = parseNotification('Contact ID\n1234\nContact Email\nx@y.com');
    expect(p.anomalies.some((a) => a.field === 'Select Business')).toBe(true);
  });

  it('rejects text that is not a notification', () => {
    expect(looksLikeNotification('hello world, unrelated text')).toBe(false);
    expect(looksLikeNotification(PASTED_TEXT)).toBe(true);
  });
});

describe('extractClientIds', () => {
  it('finds IDs under client-ish keys across plausible response shapes', () => {
    expect(extractClientIds({ id: 536464, clients: ['419762', '402390'] })).toEqual(['419762', '402390']);
    expect(extractClientIds({ data: [{ contactId: 1, clientId: 419762 }] })).toEqual(['419762']);
    expect(extractClientIds({ clients: [{ id: 419762, name: 'Woody’s' }] })).toEqual(['419762']);
  });

  it('ignores non-ID client fields and unrelated numbers', () => {
    expect(extractClientIds({ clientEmail: 'x@y.com', clientCount: 2, zip: 96001 })).toEqual([]);
    expect(extractClientIds(null)).toEqual([]);
  });
});
