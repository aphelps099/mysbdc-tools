"""
Milestone notification emails — sends notifications on milestone form submission.

Four notification types:
  1. Client confirmation (thank-you email)
  2. Counselor notification (records created for their client)
  3. Admin notification (full submission summary)
  4. Error notification (API failures during submission)

Uses Resend for HTTP-based email delivery. Emails are fire-and-forget:
failures are logged but never block the milestone submission response.
"""

import asyncio
import logging

from ..config import RESEND_API_KEY, EMAIL_FROM, MILESTONE_ADMIN_EMAIL, NEOSERRA_BASE_URL
from ..services import neoserra_client as neo

logger = logging.getLogger(__name__)

# ── Category labels for display ──
CATEGORY_LABELS = {
    "hired_employees": "Hired Employees",
    "increased_sales": "Increased Sales",
    "started_business": "Started a New Business",
    "got_funded": "Secured Funding",
}


def is_configured() -> bool:
    return bool(RESEND_API_KEY)


def _send_email(to: str, subject: str, html_body: str) -> bool:
    """Send a single email via Resend. Returns True on success."""
    if not is_configured():
        logger.info("Resend not configured — skipping email to %s", to)
        return False

    try:
        import resend

        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html_body,
        })
        logger.info("Milestone email sent to %s: %s", to, subject)
        return True
    except Exception as exc:
        logger.error("Failed to send milestone email to %s: %s", to, exc)
        return False


def _base_template(content: str) -> str:
    """Wrap content in the branded NorCal SBDC email template."""
    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #e7e2da;margin-bottom:24px;">
    <strong style="font-size:16px;color:#1a1a1a;letter-spacing:0.02em;">NorCal SBDC</strong>
  </div>
  {content}
  <div style="border-top:1px solid #e7e2da;margin-top:32px;padding-top:16px;font-size:11px;color:#a8a29e;text-align:center;">
    NorCal Small Business Development Center Network<br>
    Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.
  </div>
</div>
</body>
</html>"""


def _build_summary_rows(data) -> str:
    """Build an HTML table of what was submitted."""
    rows = []
    bg = False

    def _row(label: str, value: str):
        nonlocal bg
        style = 'background:#faf8f4;' if bg else ''
        rows.append(
            f'<tr style="{style}"><td style="padding:6px 12px;color:#57534e;font-size:13px;">{label}</td>'
            f'<td style="padding:6px 12px;font-weight:600;font-size:13px;text-align:right;">{value}</td></tr>'
        )
        bg = not bg

    cats = ", ".join(CATEGORY_LABELS.get(c, c) for c in data.categories)
    _row("Categories", cats)

    if "hired_employees" in data.categories:
        if data.totalFtEmployees:
            _row("Full-Time Employees", f"{data.totalFtEmployees} (was {data.initialFtEmps})")
        if data.totalPtEmployees:
            _row("Part-Time Employees", f"{data.totalPtEmployees} (was {data.initialPtEmps})")

    if "increased_sales" in data.categories and data.grossRevenue:
        _row("Gross Revenue", f"${float(data.grossRevenue):,.0f} (was ${data.initialGrossSales:,.0f})")

    if "started_business" in data.categories:
        _row("Business Started", data.businessStartDate or "Date not specified")
        if data.businessStructure:
            _row("Structure", data.businessStructure)

    if "got_funded" in data.categories:
        if data.investedOwnMoney == "yes" and data.ownInvestment:
            try:
                _row("Owner Investment", f"${float(data.ownInvestment):,.0f}")
            except ValueError:
                pass
        for row in data.additionalFunding:
            if row.amount.strip():
                label = row.source.strip() or "Other"
                try:
                    _row(f"Funding: {label}", f"${float(row.amount):,.0f}")
                except ValueError:
                    pass

    if data.testimonial:
        _row("Testimonial", data.testimonial[:200])

    _row("Signature", data.signature)

    return (
        '<table style="width:100%;border-collapse:collapse;background:#fff;'
        'border:1px solid #e7e2da;border-radius:10px;overflow:hidden;">'
        + "".join(rows)
        + "</table>"
    )


# ─── 1. Client Thank-You Email ──────────────────────────────────

async def send_client_confirmation(data) -> str:
    """Send a thank-you email to the client who submitted milestones.
    Returns status string: 'sent', 'skipped', or 'failed'.
    """
    email = data.contactEmail or data.email
    if not email:
        return "skipped"

    first = data.firstName or ""

    content = f"""\
  <h1 style="font-size:22px;font-weight:300;color:#1a1a1a;margin:0 0 16px;">
    Thank you, {first}
  </h1>
  <p style="font-size:15px;color:#57534e;line-height:1.6;margin:0 0 20px;">
    <strong>Thank you for taking the time to share your business milestones with us.</strong>
    Your input is invaluable in helping us demonstrate the impact of our services
    and continue to support small businesses like yours.
  </p>
  <p style="font-size:14px;color:#57534e;line-height:1.6;margin:0 0 20px;">
    We sincerely appreciate you providing details about your progress and achievements.
    If you have any further updates or need additional assistance, please do not hesitate
    to <a href="https://norcalsbdc.org/find-your-sbdc" style="color:#2456e3;text-decoration:underline;">reach out to us</a>.
  </p>
  <p style="font-size:14px;color:#57534e;line-height:1.6;margin:0;">
    Your success is our priority, and we look forward to continuing to support your business journey.
  </p>
  <p style="font-size:14px;color:#57534e;line-height:1.6;margin:20px 0 0;">
    Best regards,<br>
    <strong>Your team at NorCal SBDC</strong>
  </p>"""

    ok = await asyncio.to_thread(
        _send_email,
        email,
        "Thank You for Sharing Your Success with NorCal SBDC",
        _base_template(content),
    )
    return "sent" if ok else "failed"


# ─── 2. Counselor Notification ──────────────────────────────────

async def send_counselor_notification(data, records_created: int) -> str:
    """Send notification to the assigned counselor.
    Returns status string: 'sent', 'skipped', or 'failed'.
    """
    if not data.counselorId:
        return "skipped"

    # Look up counselor email from Neoserra
    try:
        counselor = await neo.get_counselor(data.counselorId)
        if not counselor:
            logger.warning("Counselor %s not found — skipping notification", data.counselorId)
            return "skipped"
        counselor_email = counselor.get("email", "")
        if not counselor_email:
            logger.warning("Counselor %s has no email — skipping notification", data.counselorId)
            return "skipped"
    except Exception as exc:
        logger.error("Failed to fetch counselor %s for notification: %s", data.counselorId, exc)
        return "failed"

    summary = _build_summary_rows(data)

    content = f"""\
  <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;margin:0 0 4px;">
    New Milestone Submission
  </p>
  <h1 style="font-size:22px;font-weight:300;color:#1a1a1a;margin:0 0 4px;">
    {data.firstName} {data.lastName}
  </h1>
  <p style="font-size:14px;color:#57534e;margin:0 0 8px;">
    {data.contactEmail} &middot; Neoserra Client ID: {data.clientPublicId}
  </p>
  <p style="font-size:14px;color:#57534e;margin:0 0 20px;">
    {data.clientName} &middot; {records_created} record(s) created
  </p>
  {summary}
  <p style="font-size:13px;color:#57534e;margin:20px 0 0;">
    Signature: <strong>{data.signature}</strong>
  </p>"""

    ok = await asyncio.to_thread(
        _send_email,
        counselor_email,
        f"New Milestone Submitted — {data.contactEmail} {data.signature} — {data.clientPublicId}",
        _base_template(content),
    )
    return "sent" if ok else "failed"


# ─── 3. Admin Notification ──────────────────────────────────────

async def send_admin_notification(data, records_created: int):
    """Send full submission summary to admin."""
    admin_email = MILESTONE_ADMIN_EMAIL
    if not admin_email:
        return

    summary = _build_summary_rows(data)

    status_color = "#16a34a" if records_created > 0 else "#dc2626"
    status_label = f"{records_created} record(s) created" if records_created > 0 else "No records created"

    # ── Neoserra client link ──
    neo_base = NEOSERRA_BASE_URL.replace("/api/v1", "").rstrip("/")
    client_link = f"{neo_base}/clients/{data.clientId}"

    # ── Look up counselor details ──
    counselor_html = ""
    if data.counselorId:
        try:
            counselor = await neo.get_counselor(data.counselorId)
            if counselor:
                c_name = f"{counselor.get('first', '')} {counselor.get('last', '')}".strip()
                c_email = counselor.get("email", "")
                c_title = counselor.get("counselorTitle", "")
                parts = []
                if c_name:
                    parts.append(f"<strong>{c_name}</strong>")
                if c_title:
                    parts.append(c_title)
                if c_email:
                    parts.append(f'<a href="mailto:{c_email}" style="color:#2456e3;">{c_email}</a>')
                if parts:
                    counselor_html = (
                        '<div style="margin-bottom:6px;">'
                        '<span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#a8a29e;">Counselor</span><br>'
                        f'<span style="font-size:13px;color:#1a1a1a;">{" &middot; ".join(parts)}</span>'
                        '</div>'
                    )
        except Exception as exc:
            logger.warning("Admin email: failed to look up counselor %s: %s", data.counselorId, exc)

    # ── Look up center & director details ──
    center_html = ""
    if data.clientCenterId:
        try:
            center = await neo.get_center(int(data.clientCenterId))
            if center:
                center_name = center.get("centerName", "")
                dir_name = center.get("dirname", "")
                dir_email = center.get("diremail", "")
                parts = []
                if center_name:
                    parts.append(f"<strong>{center_name}</strong>")
                if dir_name:
                    parts.append(f"Director: {dir_name}")
                if dir_email:
                    parts.append(f'<a href="mailto:{dir_email}" style="color:#2456e3;">{dir_email}</a>')
                if parts:
                    center_html = (
                        '<div style="margin-bottom:6px;">'
                        '<span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#a8a29e;">Center</span><br>'
                        f'<span style="font-size:13px;color:#1a1a1a;">{" &middot; ".join(parts)}</span>'
                        '</div>'
                    )
        except Exception as exc:
            logger.warning("Admin email: failed to look up center %s: %s", data.clientCenterId, exc)

    # ── Build team info block ──
    team_block = ""
    if counselor_html or center_html:
        team_block = (
            '<div style="background:#faf8f4;border:1px solid #e7e2da;border-radius:10px;padding:14px 16px;margin:12px 0 16px;">'
            f'{counselor_html}{center_html}'
            '</div>'
        )

    content = f"""\
  <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;margin:0 0 4px;">
    New Milestone Submission
  </p>
  <h1 style="font-size:22px;font-weight:300;color:#1a1a1a;margin:0 0 4px;">
    {data.firstName} {data.lastName}
  </h1>
  <p style="font-size:14px;color:#57534e;margin:0 0 8px;">
    {data.contactEmail} &middot;
    <a href="{client_link}" style="color:#2456e3;text-decoration:underline;">Neoserra Client: {data.clientPublicId}</a>
  </p>
  <p style="font-size:14px;color:#57534e;margin:0 0 4px;">
    {data.clientName} &middot; Program: {data.program or 'N/A'}
  </p>

  <div style="display:inline-block;padding:6px 16px;border-radius:100px;font-size:12px;font-weight:700;color:{status_color};background:rgba(0,0,0,0.04);margin:8px 0 16px;">
    {status_label}
  </div>

  {team_block}

  {summary}
  <p style="font-size:13px;color:#57534e;margin:20px 0 0;">
    Signature: <strong>{data.signature}</strong>
  </p>"""

    ok = await asyncio.to_thread(
        _send_email,
        admin_email,
        f"New milestone submission from NorCal SBDC — {data.contactEmail} {data.signature} — {data.clientPublicId}",
        _base_template(content),
    )
    return "sent" if ok else "failed"


# ─── 4. Error Notification ──────────────────────────────────────

async def send_error_notification(data, errors: list[str]) -> str:
    """Send error notification to admin when API calls fail.
    Returns status string: 'sent', 'skipped', or 'failed'.
    """
    admin_email = MILESTONE_ADMIN_EMAIL
    if not admin_email or not errors:
        return "skipped"

    error_items = "".join(
        f'<li style="margin-bottom:6px;font-size:13px;color:#dc2626;">{e}</li>'
        for e in errors
    )

    content = f"""\
  <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#dc2626;margin:0 0 4px;">
    Neoserra API Error
  </p>
  <h1 style="font-size:22px;font-weight:300;color:#1a1a1a;margin:0 0 4px;">
    Milestone Submission Errors
  </h1>
  <p style="font-size:14px;color:#57534e;margin:0 0 8px;">
    Client: {data.firstName} {data.lastName} &middot; {data.contactEmail}
  </p>
  <p style="font-size:14px;color:#57534e;margin:0 0 16px;">
    Neoserra Client ID: {data.clientPublicId} &middot; {data.clientName}
  </p>

  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:16px;">
    <p style="font-weight:600;font-size:13px;color:#991b1b;margin:0 0 8px;">Errors:</p>
    <ul style="margin:0;padding-left:20px;">
      {error_items}
    </ul>
  </div>

  <p style="font-size:13px;color:#57534e;margin:0;">
    Categories: {', '.join(CATEGORY_LABELS.get(c, c) for c in data.categories)}<br>
    Signature: <strong>{data.signature}</strong>
  </p>"""

    ok = await asyncio.to_thread(
        _send_email,
        admin_email,
        f"Neoserra API Error — {data.clientPublicId} {data.firstName} {data.lastName}",
        _base_template(content),
    )
    return "sent" if ok else "failed"


# ─── Fire All Notifications ─────────────────────────────────────

async def send_milestone_notifications(
    data,
    records_created: int,
    errors: list[str],
) -> dict[str, str]:
    """Fire all milestone notifications and return status dict.

    Returns a dict like {"client": "sent", "counselor": "skipped", "admin": "sent"}.
    """
    labels = ["client", "counselor", "admin"]
    tasks = [
        send_client_confirmation(data),
        send_counselor_notification(data, records_created),
        send_admin_notification(data, records_created),
    ]

    # Only send error notification if there were errors
    if errors:
        labels.append("error")
        tasks.append(send_error_notification(data, errors))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    statuses: dict[str, str] = {}
    for label, r in zip(labels, results):
        if isinstance(r, Exception):
            logger.error("Milestone notification error (%s): %s", label, r)
            statuses[label] = "failed"
        else:
            statuses[label] = r if isinstance(r, str) else "unknown"

    return statuses
