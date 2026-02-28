/**
 * TFG Admin Notification Email — new application alert.
 *
 * Pentagram-minimal. Confident spacing. Typography-driven hierarchy.
 * Self-hosted GT America Extended via @font-face for Apple Mail/iOS.
 */

export const TFG_ADMIN_RECIPIENTS = [
  'matthew@techfuturesgroup.org',
  'phelps@norcalsbdc.org',
  'jpsmittee@msn.com',
  'jeff@techfuturesgroup.org',
];

const LOGO_URL =
  'https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.norcalsbdc.org';

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

/* Shared font stacks */
const SANS = "'GT America Extended', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Roboto Mono', 'SF Mono', 'Consolas', monospace";

export function buildAdminNotificationHtml(d: AdminEmailData): string {
  const fontUrl = `${APP_ORIGIN}/fonts/GT-America-Extended-Regular.otf`;
  const fontMedUrl = `${APP_ORIGIN}/fonts/GT-America-Extended-Medium.otf`;

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

  const onePagerBtn = d.onePagerUrl
    ? `<a href="${esc(d.onePagerUrl)}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;background:#4eff00;color:#0a0a0a;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">View One-Pager</a>`
    : '';

  const pitchDeckBtn = d.pitchDeckUrl
    ? `<a href="${esc(d.pitchDeckUrl)}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;border:1px solid rgba(255,255,255,0.12);color:#e2e6eb;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin-left:12px;">Pitch Deck</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>New TFG Application: ${esc(d.companyName)}</title>
<style>
  @font-face {
    font-family: 'GT America Extended';
    src: url('${fontUrl}') format('opentype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'GT America Extended';
    src: url('${fontMedUrl}') format('opentype');
    font-weight: 500;
    font-style: normal;
  }
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0a0a0a;">
  New application from ${esc(d.firstName)} ${esc(d.lastName)} \u2014 ${esc(d.companyName)}. Score: ${d.readinessScore} (${esc(scoreLabel)}).
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;">
<tr>
<td align="center" style="padding:64px 24px 80px;">

<table role="presentation" width="500" cellspacing="0" cellpadding="0" border="0" style="max-width:500px;width:100%;">

  <!-- Logo -->
  <tr>
    <td style="padding:0 0 56px;">
      <img src="${LOGO_URL}" alt="Tech Futures Group" height="56" style="display:block;height:56px;width:auto;" />
    </td>
  </tr>

  <!-- Type label -->
  <tr>
    <td style="padding:0 0 12px;">
      <span style="font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#4eff00;">New Application</span>
    </td>
  </tr>

  <!-- Company name -->
  <tr>
    <td style="padding:0 0 16px;">
      <h1 style="font-family:${SANS};font-size:30px;font-weight:500;color:#ffffff;margin:0;letter-spacing:-0.5px;line-height:1.15;">${esc(d.companyName)}</h1>
    </td>
  </tr>

  <!-- Score -->
  <tr>
    <td style="padding:0 0 40px;">
      <span style="font-family:${MONO};font-size:12px;color:#6e7681;letter-spacing:0.04em;">Readiness <span style="font-weight:700;font-size:13px;color:${scoreColor};">${d.readinessScore}/10</span> &mdash; ${esc(scoreLabel)}</span>
    </td>
  </tr>

  <!-- Data rows -->
  <tr>
    <td style="padding:32px 0 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid rgba(255,255,255,0.10);">
        ${row('Applicant', `${esc(d.firstName)} ${esc(d.lastName)}`)}
        ${row('Email', d.email ? `<a href="mailto:${esc(d.email)}" style="color:#4eff00;text-decoration:none;">${esc(d.email)}</a>` : '\u2014')}
        ${row('Phone', esc(d.phone) || '\u2014')}
        ${row('Website', d.website ? `<a href="${esc(d.website)}" style="color:#4eff00;text-decoration:none;">${esc(d.website)}</a>` : '\u2014')}
        ${row('Sectors', esc(sectors))}
        ${row('Product', esc(d.productStage) || '\u2014')}
        ${rowLast('Revenue', esc(d.revenueStage) || '\u2014')}
      </table>
    </td>
  </tr>

  <!-- CTA Buttons -->
  ${onePagerBtn || pitchDeckBtn ? `
  <tr>
    <td style="padding:28px 0 48px;">
      ${onePagerBtn}${pitchDeckBtn}
    </td>
  </tr>
  ` : ''}

  <!-- Footer -->
  <tr>
    <td style="padding:24px 0 0;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="font-family:${MONO};font-size:10px;color:#333;margin:0;letter-spacing:0.04em;">
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
    <td style="padding:10px 14px;font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#484f58;width:90px;vertical-align:top;border-bottom:1px solid rgba(255,255,255,0.06);">${label}</td>
    <td style="padding:10px 14px;font-family:${SANS};font-size:14px;color:#e2e6eb;font-weight:400;border-bottom:1px solid rgba(255,255,255,0.06);">${value}</td>
  </tr>`;
}

function rowLast(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 14px;font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#484f58;width:90px;vertical-align:top;">${label}</td>
    <td style="padding:10px 14px;font-family:${SANS};font-size:14px;color:#e2e6eb;font-weight:400;">${value}</td>
  </tr>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
