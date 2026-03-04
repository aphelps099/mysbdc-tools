/**
 * R4I Client Welcome Email
 *
 * Sent immediately after a Roadmap for Innovation application is submitted.
 * Clean, light design with California SBDC branding.
 */

const CALENDLY_URL = 'https://calendly.com/maggie-132/sbdc-r4i';

const R4I_LOGO =
  'https://www.roadmap4innovation.com/hs-fs/hubfs/R4I-Logo-Solid-White.png?width=550&height=122&name=R4I-Logo-Solid-White.png';

const SBDC_LOGO =
  'https://www.californiasbdc.org/wp-content/uploads/sites/34/2022/11/americas-sbdc-california-white-180h.png';

interface R4iEmailData {
  firstName: string;
  companyName: string;
}

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function titleCase(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildR4iWelcomeHtml({ firstName, companyName }: R4iEmailData): string {
  const name = titleCase(firstName);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Application Received \u2014 Roadmap for Innovation</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f5f7;">
  Your Roadmap for Innovation application has been received. Here\u2019s what happens next.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f5f7;">
<tr>
<td align="center" style="padding:48px 24px 64px;">

<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">

  <!-- Header with logos -->
  <tr>
    <td style="background:#1b3a5c;padding:32px 40px;border-radius:12px 12px 0 0;" align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-right:16px;">
            <img src="${R4I_LOGO}" alt="Roadmap 4 Innovation" height="32" style="display:block;height:32px;width:auto;" />
          </td>
          <td style="border-left:1px solid rgba(255,255,255,0.25);padding-left:16px;">
            <img src="${SBDC_LOGO}" alt="California SBDC" height="28" style="display:block;height:28px;width:auto;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Main card -->
  <tr>
    <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

      <!-- Check icon -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding:0 0 24px;">
            <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#e8f5e9;text-align:center;line-height:48px;">
              <span style="font-size:24px;color:#2e7d32;">\u2713</span>
            </div>
          </td>
        </tr>
      </table>

      <h1 style="font-family:${SANS};font-size:24px;font-weight:700;color:#1b3a5c;margin:0 0 8px;line-height:1.3;">
        Application Received
      </h1>

      <p style="font-family:${SANS};font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 24px;">
        Thank you, ${esc(name)}! Your application${companyName ? ` for <strong>${esc(companyName)}</strong>` : ''} has been
        submitted to the Roadmap for Innovation program.
      </p>

      <!-- Divider -->
      <div style="border-top:1px solid #e5e7eb;margin:0 0 24px;"></div>

      <!-- Next steps -->
      <h2 style="font-family:${SANS};font-size:16px;font-weight:600;color:#1b3a5c;margin:0 0 16px;">
        What happens next
      </h2>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="32" valign="top" style="padding:0 12px 16px 0;">
            <div style="width:24px;height:24px;border-radius:50%;background:#e3f2fd;text-align:center;line-height:24px;font-family:${SANS};font-size:12px;font-weight:700;color:#1b3a5c;">1</div>
          </td>
          <td style="padding:0 0 16px;">
            <p style="font-family:${SANS};font-size:14px;color:#4b5563;line-height:1.6;margin:0;">
              <strong style="color:#1f2937;">Schedule your intake call</strong><br/>
              If you have not already done so, pick a time that works for you so we can learn about your goals and match you with the right advisor.
            </p>
          </td>
        </tr>
        <tr>
          <td width="32" valign="top" style="padding:0 12px 16px 0;">
            <div style="width:24px;height:24px;border-radius:50%;background:#e3f2fd;text-align:center;line-height:24px;font-family:${SANS};font-size:12px;font-weight:700;color:#1b3a5c;">2</div>
          </td>
          <td style="padding:0 0 16px;">
            <p style="font-family:${SANS};font-size:14px;color:#4b5563;line-height:1.6;margin:0;">
              <strong style="color:#1f2937;">Brief interview &amp; intake</strong><br/>
              We\u2019ll connect with you to complete program intake and get you set up for advising and training.
            </p>
          </td>
        </tr>
        <tr>
          <td width="32" valign="top" style="padding:0 12px 0 0;">
            <div style="width:24px;height:24px;border-radius:50%;background:#e3f2fd;text-align:center;line-height:24px;font-family:${SANS};font-size:12px;font-weight:700;color:#1b3a5c;">3</div>
          </td>
          <td style="padding:0;">
            <p style="font-family:${SANS};font-size:14px;color:#4b5563;line-height:1.6;margin:0;">
              <strong style="color:#1f2937;">Start your program</strong><br/>
              Begin 1:1 advising sessions and enroll in group training courses \u2014 all at no fee to you.
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- CTA section -->
  <tr>
    <td style="background:#f8fafc;padding:28px 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="font-family:${SANS};font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 16px;">
        Ready to get started? If you haven\u2019t already, schedule your intake call now:
      </p>
      <a href="${CALENDLY_URL}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;padding:12px 28px;background:#1b3a5c;color:#ffffff;font-family:${SANS};font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">
        Schedule Intake Call
      </a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#ffffff;padding:24px 40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
      <p style="font-family:${SANS};font-size:13px;color:#9ca3af;margin:0 0 4px;line-height:1.6;">
        Your team at SBDC
      </p>
      <p style="font-family:${SANS};font-size:12px;color:#d1d5db;margin:0;line-height:1.6;">
        Roadmap for Innovation \u2014 A program of the California SBDC<br/>
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

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
