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

  <!-- Header -->
  <tr>
    <td style="padding:0 0 48px;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#4eff00;">TECH FUTURES GROUP</span>
    </td>
  </tr>

  <!-- Headline -->
  <tr>
    <td style="padding:0 0 24px;">
      <h1 style="font-size:48px;font-weight:700;color:#ffffff;line-height:1.0;margin:0;letter-spacing:-1.5px;">You're in.</h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:0 0 32px;">
      <p style="font-size:17px;color:#a0a8b4;line-height:1.7;margin:0 0 20px;">
        Thank you, ${esc(firstName)}. We've received your application for
        <strong style="color:#e2e6eb;">${esc(companyName)}</strong>.
      </p>
      <p style="font-size:17px;color:#a0a8b4;line-height:1.7;margin:0;">
        Our team reviews every application and you can expect to hear from us
        within <strong style="color:#e2e6eb;">7&ndash;10 business days</strong>
        regarding next steps.
      </p>
    </td>
  </tr>

  <!-- Accent divider -->
  <tr>
    <td style="padding:0 0 32px;">
      <div style="width:48px;height:3px;background:#4eff00;"></div>
    </td>
  </tr>

  <!-- What happens next -->
  <tr>
    <td style="padding:0 0 12px;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6e7681;">WHAT HAPPENS NEXT</span>
    </td>
  </tr>

  <tr>
    <td style="padding:0 0 32px;">
      <p style="font-size:16px;color:#a0a8b4;line-height:1.7;margin:0 0 24px;">
        Get ahead of the process &mdash; schedule your intro call now so we can
        learn more about your company and how we can help.
      </p>
      <!-- CTA Button -->
      <a href="${CALENDLY_URL}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:14px 28px;background:#4eff00;color:#0d0d0d;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">
        Schedule Your Interview &rarr;
      </a>
    </td>
  </tr>

  <!-- Footer box -->
  <tr>
    <td style="background:#131316;padding:32px;border-radius:8px;">
      <p style="font-size:13px;color:#6e7681;margin:0 0 8px;">
        Questions? Reply to this email or reach out at
        <a href="mailto:gabriel@techfuturesgroup.org" style="color:#4eff00;text-decoration:none;">gabriel@techfuturesgroup.org</a>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:40px 0;text-align:center;">
      <p style="font-size:13px;font-weight:600;color:#e2e6eb;margin:0 0 4px;">Tech Futures Group</p>
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#6e7681;margin:0;">
        A program of the NorCal SBDC
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
