/**
 * TFG Admin Notification Email — new application alert.
 *
 * Dark-theme, Pentagram-minimal design.
 * TFG lightning logo, GT America Extended headings, Roboto Mono labels.
 */

export const TFG_ADMIN_RECIPIENTS = [
  'matthew@techfuturesgroup.org',
  'phelps@norcalsbdc.org',
  'jpsmittee@msn.com',
  'jeff@techfuturesgroup.org',
];

const LOGO_URL =
  'https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png';

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
  const scoreLabel =
    d.readinessScore >= 6
      ? 'Investor-Ready'
      : d.readinessScore >= 3
        ? 'Needs Assessment'
        : 'Catalyst';

  const scoreColor =
    d.readinessScore >= 6
      ? '#4eff00'
      : d.readinessScore >= 3
        ? '#f59e0b'
        : '#6e7681';

  const sectors =
    d.industrySectors.length > 0 ? d.industrySectors.join(', ') : '\u2014';

  // Only render CTA buttons when URLs are present
  const onePagerBtn = d.onePagerUrl
    ? `<a href="${esc(d.onePagerUrl)}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;background:#4eff00;color:#0d0d0d;font-family:'GT America Extended','Roboto Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:0;">View One-Pager</a>`
    : '';

  const pitchDeckBtn = d.pitchDeckUrl
    ? `<a href="${esc(d.pitchDeckUrl)}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;border:1px solid rgba(255,255,255,0.15);color:#e2e6eb;font-family:'GT America Extended','Roboto Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:0;margin-left:12px;">Pitch Deck</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>New TFG Application: ${esc(d.companyName)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0d0d0d;">
  New application from ${esc(d.firstName)} ${esc(d.lastName)} \u2014 ${esc(d.companyName)}. Score: ${d.readinessScore} (${esc(scoreLabel)}).
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0d0d0d;">
<tr>
<td align="center" style="padding:48px 20px 64px;">

<table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;width:100%;">

  <!-- Logo -->
  <tr>
    <td style="padding:0 0 48px;">
      <img src="${LOGO_URL}" alt="TFG" height="36" style="display:block;height:36px;width:auto;" />
    </td>
  </tr>

  <!-- Label -->
  <tr>
    <td style="padding:0 0 16px;">
      <span style="font-family:'Roboto Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#6e7681;">New Application</span>
    </td>
  </tr>

  <!-- Company name -->
  <tr>
    <td style="padding:0 0 12px;">
      <h1 style="font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:28px;font-weight:700;color:#ffffff;margin:0;letter-spacing:-0.5px;line-height:1.15;">${esc(d.companyName)}</h1>
    </td>
  </tr>

  <!-- Score badge -->
  <tr>
    <td style="padding:0 0 40px;">
      <span style="font-family:'Roboto Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.06em;color:${scoreColor};">${d.readinessScore} \u2014 ${esc(scoreLabel)}</span>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 0 32px;">
      <div style="width:32px;height:2px;background:#4eff00;"></div>
    </td>
  </tr>

  <!-- Data rows -->
  <tr>
    <td style="padding:0 0 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
        ${row('Applicant', `${esc(d.firstName)} ${esc(d.lastName)}`)}
        ${row('Email', d.email ? `<a href="mailto:${esc(d.email)}" style="color:#4eff00;text-decoration:none;">${esc(d.email)}</a>` : '\u2014')}
        ${row('Phone', esc(d.phone) || '\u2014')}
        ${row('Website', d.website ? `<a href="${esc(d.website)}" style="color:#4eff00;text-decoration:none;">${esc(d.website)}</a>` : '\u2014')}
        ${row('Sectors', esc(sectors))}
        ${row('Product', esc(d.productStage) || '\u2014')}
        ${row('Revenue', esc(d.revenueStage) || '\u2014')}
      </table>
    </td>
  </tr>

  <!-- CTA Buttons -->
  ${onePagerBtn || pitchDeckBtn ? `
  <tr>
    <td style="padding:0 0 48px;">
      ${onePagerBtn}${pitchDeckBtn}
    </td>
  </tr>
  ` : ''}

  <!-- Footer divider -->
  <tr>
    <td style="padding:0 0 24px;">
      <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td>
      <p style="font-family:'Roboto Mono',monospace;font-size:10px;color:#484f58;margin:0;letter-spacing:0.04em;">
        Tech Futures Group \u2014 A program of the NorCal SBDC
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
    <td style="padding:8px 0;font-family:'Roboto Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#6e7681;width:100px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#e2e6eb;font-weight:500;">${value}</td>
  </tr>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
