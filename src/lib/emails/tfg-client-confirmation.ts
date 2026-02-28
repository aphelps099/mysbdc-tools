/**
 * TFG Client Confirmation Email — branded dark-theme welcome.
 *
 * NO score, NO classification, NO internal data.
 * Pentagram-minimal: #0d0d0d bg, #4eff00 accent.
 * GT America Extended headings, Roboto Mono labels.
 */

const CALENDLY_URL = 'https://calendly.com/gabrielsalazar/techfuturesgroup';

const LOGO_URL =
  'https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png';

interface ClientEmailData {
  firstName: string;
  companyName: string;
}

export function buildClientConfirmationHtml({ firstName, companyName }: ClientEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Application Received \u2014 Tech Futures Group</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0d0d0d;">
  Your application for ${esc(companyName)} has been received. Here\u2019s what happens next.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0d0d0d;">
<tr>
<td align="center" style="padding:48px 20px 64px;">

<table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;width:100%;">

  <!-- Logo -->
  <tr>
    <td style="padding:0 0 56px;">
      <img src="${LOGO_URL}" alt="Tech Futures Group" width="36" height="36" style="display:block;width:36px;height:36px;" />
    </td>
  </tr>

  <!-- Headline -->
  <tr>
    <td style="padding:0 0 24px;">
      <h1 style="font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:36px;font-weight:700;color:#ffffff;margin:0;letter-spacing:-1px;line-height:1.1;">You\u2019re in.</h1>
    </td>
  </tr>

  <!-- Body copy -->
  <tr>
    <td style="padding:0 0 40px;">
      <p style="font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;color:#a0a8b4;line-height:1.7;margin:0 0 16px;">
        Thank you, ${esc(firstName)}. Your application for
        <span style="color:#e2e6eb;font-weight:600;">${esc(companyName)}</span>
        has been submitted to Tech Futures Group.
      </p>
      <p style="font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;color:#a0a8b4;line-height:1.7;margin:0;">
        Our team reviews every application. Expect to hear from us
        within <span style="color:#e2e6eb;font-weight:600;">7\u201310 business days</span>.
      </p>
    </td>
  </tr>

  <!-- Status pill -->
  <tr>
    <td style="padding:0 0 48px;">
      <div style="display:inline-block;padding:8px 16px;border:1px solid rgba(78,255,0,0.2);background:rgba(78,255,0,0.04);">
        <span style="font-family:'Roboto Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4eff00;">Application Received</span>
      </div>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 0 40px;">
      <div style="width:32px;height:2px;background:#4eff00;"></div>
    </td>
  </tr>

  <!-- Next step label -->
  <tr>
    <td style="padding:0 0 12px;">
      <span style="font-family:'Roboto Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#6e7681;">Next Step</span>
    </td>
  </tr>

  <!-- Next step copy -->
  <tr>
    <td style="padding:0 0 28px;">
      <p style="font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;color:#a0a8b4;line-height:1.7;margin:0;">
        Get ahead of the process \u2014 schedule your intro call now so we can
        learn more about your company and how we can help.
      </p>
    </td>
  </tr>

  <!-- CTA Button -->
  <tr>
    <td style="padding:0 0 56px;">
      <a href="${CALENDLY_URL}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;background:#4eff00;color:#0d0d0d;font-family:'GT America Extended','Roboto Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:0;">Schedule Intro Call</a>
    </td>
  </tr>

  <!-- Contact block -->
  <tr>
    <td style="padding:24px;border:1px solid rgba(255,255,255,0.06);">
      <p style="font-family:'GT America Extended',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#6e7681;margin:0 0 6px;">
        Questions? Reach out at
        <a href="mailto:gabriel@techfuturesgroup.org" style="color:#4eff00;text-decoration:none;">gabriel@techfuturesgroup.org</a>
      </p>
      <p style="font-family:'Roboto Mono',monospace;font-size:10px;color:#484f58;margin:0;letter-spacing:0.02em;">
        This is a confirmation of the application you submitted at tools.norcalsbdc.org.
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:40px 0 0;text-align:left;">
      <p style="font-family:'Roboto Mono',monospace;font-size:10px;color:#484f58;margin:0;letter-spacing:0.04em;">
        Tech Futures Group \u2014 A program of the NorCal SBDC
      </p>
      <p style="font-family:'Roboto Mono',monospace;font-size:10px;color:#333;margin:4px 0 0;letter-spacing:0.02em;">
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
