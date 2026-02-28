/**
 * TFG Client Confirmation Email — Pentagram-minimal.
 *
 * NO score, NO classification, NO internal data.
 * #0a0a0a bg, #4eff00 accent. Confident whitespace.
 * Self-hosted GT America Extended via @font-face for Apple Mail/iOS.
 */

const CALENDLY_URL = 'https://calendly.com/gabrielsalazar/techfuturesgroup';

const LOGO_URL =
  'https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.norcalsbdc.org';

interface ClientEmailData {
  firstName: string;
  companyName: string;
}

/* Shared font stack */
const SANS = "'GT America Extended', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Roboto Mono', 'SF Mono', 'Consolas', monospace";

export function buildClientConfirmationHtml({ firstName, companyName }: ClientEmailData): string {
  const fontUrl = `${APP_ORIGIN}/fonts/GT-America-Extended-Regular.otf`;
  const fontMedUrl = `${APP_ORIGIN}/fonts/GT-America-Extended-Medium.otf`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Application Received \u2014 Tech Futures Group</title>
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
  Your application for ${esc(companyName)} has been received. Here\u2019s what happens next.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;">
<tr>
<td align="center" style="padding:64px 24px 80px;">

<table role="presentation" width="500" cellspacing="0" cellpadding="0" border="0" style="max-width:500px;width:100%;">

  <!-- Logo -->
  <tr>
    <td style="padding:0 0 48px;">
      <img src="${LOGO_URL}" alt="Tech Futures Group" height="56" style="display:block;height:56px;width:auto;" />
    </td>
  </tr>

  <!-- Headline -->
  <tr>
    <td style="padding:0 0 12px;">
      <h1 style="font-family:${SANS};font-size:32px;font-weight:500;color:#ffffff;margin:0;letter-spacing:-1px;line-height:1.15;">Application Received</h1>
    </td>
  </tr>

  <!-- Accent rule -->
  <tr>
    <td style="padding:0 0 32px;">
      <div style="width:24px;height:2px;background:#4eff00;"></div>
    </td>
  </tr>

  <!-- Body copy -->
  <tr>
    <td style="padding:0 0 40px;">
      <p style="font-family:${SANS};font-size:15px;color:#8b949e;line-height:1.75;margin:0 0 16px;">
        Thank you, ${esc(firstName)}. Your application for
        <span style="color:#e2e6eb;font-weight:500;">${esc(companyName)}</span>
        has been submitted to Tech Futures Group.
      </p>
      <p style="font-family:${SANS};font-size:15px;color:#8b949e;line-height:1.75;margin:0;">
        Our team reviews every application individually. Expect to hear from us
        within <span style="color:#e2e6eb;font-weight:500;">7\u201310 business days</span>.
      </p>
    </td>
  </tr>

  <!-- Status pill -->
  <tr>
    <td style="padding:0 0 40px;">
      <div style="display:inline-block;padding:6px 14px;border:1px solid rgba(78,255,0,0.15);background:rgba(78,255,0,0.03);">
        <span style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4eff00;">Application Received</span>
      </div>
    </td>
  </tr>

  <!-- Next step block -->
  <tr>
    <td style="padding:32px 0 0;border-top:1px solid rgba(255,255,255,0.08);">
      <span style="font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#484f58;">Next Step</span>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0 28px;">
      <p style="font-family:${SANS};font-size:15px;color:#8b949e;line-height:1.75;margin:0;">
        Get ahead of the process \u2014 schedule your intro call so we can
        learn more about your company and how we can help.
      </p>
    </td>
  </tr>

  <!-- CTA Button -->
  <tr>
    <td style="padding:0 0 48px;">
      <a href="${CALENDLY_URL}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;background:#4eff00;color:#0a0a0a;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">Schedule Intro Call</a>
    </td>
  </tr>

  <!-- Contact block -->
  <tr>
    <td style="padding:24px 0;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="font-family:${SANS};font-size:13px;color:#6e7681;margin:0 0 6px;">
        Questions? Reach out at
        <a href="mailto:gabriel@techfuturesgroup.org" style="color:#4eff00;text-decoration:none;">gabriel@techfuturesgroup.org</a>
      </p>
      <p style="font-family:${MONO};font-size:10px;color:#333;margin:0;letter-spacing:0.02em;">
        This is a confirmation of the application you submitted at tools.norcalsbdc.org.
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:24px 0 0;">
      <p style="font-family:${MONO};font-size:10px;color:#333;margin:0;letter-spacing:0.04em;">
        Tech Futures Group \u2014 A program of the NorCal SBDC
      </p>
      <p style="font-family:${MONO};font-size:10px;color:#262626;margin:4px 0 0;letter-spacing:0.02em;">
        Funded in part through a Cooperative Agreement with the U.S. SBA
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

/** Escape HTML entities */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
