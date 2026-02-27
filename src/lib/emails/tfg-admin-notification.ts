/**
 * TFG Admin Notification Email — new application alert.
 *
 * Sent to the TFG review team with a quick snapshot of the applicant
 * and links to the one-pager summary and pitch deck.
 */

export const TFG_ADMIN_RECIPIENTS = [
  'matthew@techfuturesgroup.org',
  'phelps@norcalsbdc.org',
  'jpsmittee@msn.com',
  'jeff@techfuturesgroup.org',
];

interface AdminEmailData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  industrySectors: string[];
  productStage: string;
  revenueStage: string;
  readinessScore: number;
  onePagerUrl: string;
  pitchDeckUrl: string | null;
}

export function buildAdminNotificationHtml(d: AdminEmailData): string {
  const scoreLabel = d.readinessScore >= 6
    ? 'Investor-Ready'
    : d.readinessScore >= 3
      ? 'Needs Assessment'
      : 'Catalyst';

  const scoreColor = d.readinessScore >= 6
    ? '#4eff00'
    : d.readinessScore >= 3
      ? '#f59e0b'
      : '#6e7681';

  const sectors = d.industrySectors.length > 0
    ? d.industrySectors.join(', ')
    : '—';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New TFG Application: ${esc(d.companyName)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f5;">
<tr>
<td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

  <!-- Header bar -->
  <tr>
    <td style="background:#0d0d0d;padding:20px 28px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td>
          <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#4eff00;">TFG</span>
          <span style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#6e7681;letter-spacing:0.05em;"> &mdash; New Application</span>
        </td>
        <td align="right">
          <span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:${scoreColor};font-weight:700;letter-spacing:0.05em;">${esc(scoreLabel)} (${d.readinessScore})</span>
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- Company name -->
  <tr>
    <td style="padding:28px 28px 8px;">
      <h1 style="font-size:24px;font-weight:700;color:#111;margin:0;letter-spacing:-0.5px;">${esc(d.companyName)}</h1>
    </td>
  </tr>

  <!-- Quick facts -->
  <tr>
    <td style="padding:0 28px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
        ${row('Applicant', `${esc(d.firstName)} ${esc(d.lastName)}`)}
        ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#2456e3;text-decoration:none;">${esc(d.email)}</a>`)}
        ${row('Phone', esc(d.phone) || '—')}
        ${row('Website', d.website ? `<a href="${esc(d.website)}" style="color:#2456e3;text-decoration:none;">${esc(d.website)}</a>` : '—')}
        ${row('Sectors', esc(sectors))}
        ${row('Product Stage', esc(d.productStage) || '—')}
        ${row('Revenue Stage', esc(d.revenueStage) || '—')}
      </table>
    </td>
  </tr>

  <!-- CTA Buttons -->
  <tr>
    <td style="padding:0 28px 28px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="${esc(d.onePagerUrl)}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:12px 24px;background:#4eff00;color:#0d0d0d;font-size:13px;font-weight:700;text-decoration:none;border-radius:6px;">
            View One-Pager &rarr;
          </a>
        </td>
        ${d.pitchDeckUrl ? `
        <td>
          <a href="${esc(d.pitchDeckUrl)}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:12px 24px;background:#e5e7eb;color:#111;font-size:13px;font-weight:600;text-decoration:none;border-radius:6px;">
            Pitch Deck &rarr;
          </a>
        </td>
        ` : ''}
      </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#9ca3af;margin:0;">
        Tech Futures Group &mdash; Automated notification from the TFG application system.
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}

function row(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:6px 0;font-size:13px;color:#9ca3af;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:#111;font-weight:500;">${value}</td>
  </tr>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
