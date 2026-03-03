/**
 * R4I Admin Notification Email — new application alert.
 *
 * Sent to admins when a new Roadmap for Innovation application is submitted.
 * Includes applicant contact info and full application details.
 */

export const R4I_ADMIN_RECIPIENTS = [
  'phelps@norcalsbdc.org',
  'maggie@norcalsbdc.org',
];

const R4I_LOGO =
  'https://www.roadmap4innovation.com/hs-fs/hubfs/R4I-Logo-Solid-White.png?width=550&height=122&name=R4I-Logo-Solid-White.png';

const SBDC_LOGO =
  'https://www.californiasbdc.org/wp-content/uploads/sites/34/2022/11/americas-sbdc-california-white-180h.png';

interface R4iAdminEmailData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  notes: string;
}

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export function buildR4iAdminNotificationHtml(d: R4iAdminEmailData): string {
  // Format notes into HTML lines
  const notesHtml = d.notes
    ? d.notes
        .split('\n')
        .map((line) => {
          if (line.startsWith('\u2014')) {
            // Section header
            return `<tr><td style="padding:12px 0 6px;font-family:${SANS};font-size:13px;font-weight:700;color:#1b3a5c;border-bottom:1px solid #e5e7eb;">${esc(line)}</td></tr>`;
          }
          const parts = line.split(': ');
          if (parts.length >= 2) {
            const label = parts[0];
            const value = parts.slice(1).join(': ');
            return `<tr>
              <td style="padding:6px 0;font-family:${SANS};font-size:13px;color:#4b5563;line-height:1.6;">
                <strong style="color:#1f2937;">${esc(label)}:</strong> ${esc(value)}
              </td>
            </tr>`;
          }
          return `<tr><td style="padding:4px 0;font-family:${SANS};font-size:13px;color:#4b5563;line-height:1.6;">${esc(line)}</td></tr>`;
        })
        .join('')
    : `<tr><td style="padding:8px 0;font-family:${SANS};font-size:13px;color:#9ca3af;">No additional notes</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>New R4I Application: ${esc(d.companyName || `${d.firstName} ${d.lastName}`)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f5f7;">
  New R4I application from ${esc(d.firstName)} ${esc(d.lastName)} \u2014 ${esc(d.companyName)}.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f5f7;">
<tr>
<td align="center" style="padding:48px 24px 64px;">

<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">

  <!-- Header with logos -->
  <tr>
    <td style="background:#1b3a5c;padding:24px 40px;border-radius:12px 12px 0 0;" align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding-right:16px;">
            <img src="${R4I_LOGO}" alt="Roadmap 4 Innovation" height="28" style="display:block;height:28px;width:auto;" />
          </td>
          <td style="border-left:1px solid rgba(255,255,255,0.25);padding-left:16px;">
            <img src="${SBDC_LOGO}" alt="California SBDC" height="24" style="display:block;height:24px;width:auto;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Badge -->
  <tr>
    <td style="background:#ffffff;padding:28px 40px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <span style="display:inline-block;padding:4px 12px;background:#e8f5e9;border-radius:20px;font-family:${SANS};font-size:11px;font-weight:600;color:#2e7d32;letter-spacing:0.03em;text-transform:uppercase;">New Application</span>
    </td>
  </tr>

  <!-- Applicant headline -->
  <tr>
    <td style="background:#ffffff;padding:16px 40px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <h1 style="font-family:${SANS};font-size:22px;font-weight:700;color:#1b3a5c;margin:0 0 4px;line-height:1.3;">
        ${esc(d.firstName)} ${esc(d.lastName)}
      </h1>
      ${d.companyName ? `<p style="font-family:${SANS};font-size:15px;color:#6b7280;margin:0;line-height:1.5;">${esc(d.companyName)}</p>` : ''}
    </td>
  </tr>

  <!-- Contact info -->
  <tr>
    <td style="background:#ffffff;padding:20px 40px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border-radius:8px;">
        <tr>
          <td style="padding:14px 18px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding:2px 0;font-family:${SANS};font-size:13px;color:#4b5563;">
                  <strong style="color:#1f2937;">Email:</strong>
                  ${d.email ? `<a href="mailto:${esc(d.email)}" style="color:#1b3a5c;text-decoration:none;">${esc(d.email)}</a>` : '\u2014'}
                </td>
              </tr>
              <tr>
                <td style="padding:2px 0;font-family:${SANS};font-size:13px;color:#4b5563;">
                  <strong style="color:#1f2937;">Phone:</strong> ${esc(d.phone) || '\u2014'}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Application Notes -->
  <tr>
    <td style="background:#ffffff;padding:24px 40px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <h2 style="font-family:${SANS};font-size:14px;font-weight:600;color:#1b3a5c;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.03em;">
        Application Details
      </h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${notesHtml}
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8fafc;padding:20px 40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
      <p style="font-family:${SANS};font-size:12px;color:#9ca3af;margin:0;line-height:1.6;">
        Roadmap for Innovation \u2014 A program of the California SBDC<br/>
        This is an automated notification. Do not reply to this email.
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
