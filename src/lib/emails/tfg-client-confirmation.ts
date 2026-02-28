/**
 * TFG Client Confirmation Email — branded dark-theme welcome.
 *
 * NO score, NO classification, NO internal data.
 * Design: Pentagram NYC aesthetic (#0d0d0d bg, #4eff00 accent).
 */

const CALENDLY_URL = 'https://calendly.com/gabrielsalazar/techfuturesgroup';

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
<title>Application Received — Tech Futures Group</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<!-- Preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0d0d0d;">
  Your application for ${esc(companyName)} has been received. Here's what happens next.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0d0d0d;">
<tr>
<td align="center" style="padding:40px 16px;">

<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">

  <!-- Logo -->
  <tr>
    <td style="padding:0 0 40px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding-right:10px;vertical-align:middle;">
          <div style="width:28px;height:28px;border-radius:6px;background:#4eff00;text-align:center;line-height:28px;font-size:16px;">&#9889;</div>
        </td>
        <td style="vertical-align:middle;">
          <span style="font-size:16px;font-weight:700;color:#e2e6eb;letter-spacing:-0.01em;">Tech Futures Group</span>
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- Success check -->
  <tr>
    <td align="center" style="padding:0 0 32px;">
      <div style="width:72px;height:72px;border:2px solid #4eff00;border-radius:50%;text-align:center;line-height:72px;">
        <span style="font-size:32px;color:#4eff00;">&#10003;</span>
      </div>
    </td>
  </tr>

  <!-- Headline -->
  <tr>
    <td align="center" style="padding:0 0 16px;">
      <h1 style="font-size:36px;font-weight:700;color:#ffffff;line-height:1.1;margin:0;letter-spacing:-1px;">You're in.</h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td align="center" style="padding:0 0 36px;">
      <p style="font-size:17px;color:#a0a8b4;line-height:1.7;margin:0 0 16px;max-width:460px;">
        Thank you, ${esc(firstName)}. Your application for
        <strong style="color:#e2e6eb;">${esc(companyName)}</strong>
        has been submitted to Tech Futures Group.
      </p>
      <p style="font-size:17px;color:#a0a8b4;line-height:1.7;margin:0;max-width:460px;">
        Our team reviews every application and you can expect to hear from us
        within <strong style="color:#e2e6eb;">7&ndash;10 business days</strong>.
      </p>
    </td>
  </tr>

  <!-- Status badge -->
  <tr>
    <td align="center" style="padding:0 0 40px;">
      <div style="display:inline-block;padding:8px 20px;border:1px solid rgba(78,255,0,0.25);border-radius:20px;background:rgba(78,255,0,0.06);">
        <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4eff00;">&#10003; Application Received</span>
      </div>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 0 32px;">
      <div style="height:1px;background:linear-gradient(to right, transparent, #2d333b, transparent);"></div>
    </td>
  </tr>

  <!-- What happens next -->
  <tr>
    <td style="padding:0 0 12px;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6e7681;">NEXT STEP</span>
    </td>
  </tr>

  <tr>
    <td style="padding:0 0 24px;">
      <p style="font-size:16px;color:#a0a8b4;line-height:1.7;margin:0;">
        Get ahead of the process &mdash; schedule your intro call now so we can
        learn more about your company and how we can help.
      </p>
    </td>
  </tr>

  <!-- CTA Button -->
  <tr>
    <td style="padding:0 0 40px;">
      <a href="${CALENDLY_URL}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 32px;background:#4eff00;color:#0d0d0d;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">
        Schedule Your Intro Call &rarr;
      </a>
    </td>
  </tr>

  <!-- Footer box -->
  <tr>
    <td style="background:#131316;padding:28px 32px;border-radius:8px;border:1px solid #2d333b;">
      <p style="font-size:13px;color:#6e7681;margin:0 0 8px;">
        Questions? Reply to this email or reach out at
        <a href="mailto:gabriel@techfuturesgroup.org" style="color:#4eff00;text-decoration:none;">gabriel@techfuturesgroup.org</a>
      </p>
      <p style="font-size:12px;color:#484f58;margin:0;">
        This is a confirmation of the application you submitted at tools.norcalsbdc.org.
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:40px 0;text-align:center;">
      <p style="font-size:13px;font-weight:600;color:#e2e6eb;margin:0 0 4px;">Tech Futures Group</p>
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#484f58;margin:0;">
        A program of the NorCal SBDC &bull; Funded in part through a Cooperative Agreement with the U.S. SBA
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
