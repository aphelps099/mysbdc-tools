"""
Intake notification emails — sends confirmation to user and admin alert.

Uses Resend for HTTP-based email delivery. Emails are fire-and-forget:
failures are logged but never block the intake submission response.
"""

import asyncio
import logging

from ..config import RESEND_API_KEY, EMAIL_FROM, INTAKE_ADMIN_EMAIL

logger = logging.getLogger(__name__)

PROGRAM_LABELS = {
    "probiz": "ProBiz (Government Contracting)",
    "health": "SBDC Health (Healthcare)",
    "eats": "SBDC Eats (Food & Hospitality)",
    "manufacturing": "Roadmap 4 Innovation",
    "tfg": "Tech Futures (Technology)",
}

GOAL_LABELS = {
    "access_capital": "Access Capital",
    "start_business": "Start a Business",
    "grow_revenue": "Grow Revenue",
    "gov_contracting": "Government Contracting",
    "buy_business": "Buy a Business",
    "export": "International Trade",
    "technology": "Technology & Innovation",
    "other": "Other / General Advising",
}


def is_configured() -> bool:
    """Check if Resend is configured."""
    return bool(RESEND_API_KEY)


def _send_email(to: str, subject: str, html_body: str):
    """Send a single email via Resend. Silently fails on error."""
    if not is_configured():
        logger.info("Resend not configured — skipping email to %s", to)
        return

    try:
        import resend

        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html_body,
        })
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)


def _base_template(content: str) -> str:
    """Wrap content in a clean branded email template."""
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


async def send_user_confirmation(data: dict):
    """Send confirmation email to the client who submitted the intake form."""
    first = data.get("firstName", "")
    email = data.get("email", "")
    if not email:
        return

    goals = data.get("goals", [])
    goals_text = ", ".join(GOAL_LABELS.get(g, g) for g in goals) if goals else "General advising"

    programs = data.get("specialPrograms", [])
    programs_html = ""
    if programs:
        prog_list = ", ".join(PROGRAM_LABELS.get(p, p) for p in programs)
        programs_html = f'<p style="margin:0 0 8px;font-size:14px;color:#57534e;">Programs of interest: <strong>{prog_list}</strong></p>'

    content = f"""\
  <h1 style="font-size:24px;font-weight:300;color:#1a1a1a;margin:0 0 12px;">Welcome, {first}</h1>
  <p style="font-size:15px;color:#57534e;line-height:1.6;margin:0 0 20px;">
    Your intake form has been received. An SBDC advisor will review your profile
    and reach out within 1&ndash;2 business days.
  </p>
  <div style="background:#fff;border:1px solid #e7e2da;border-radius:10px;padding:20px;margin-bottom:20px;">
    <p style="margin:0 0 8px;font-size:14px;color:#57534e;">Goals: <strong>{goals_text}</strong></p>
    {programs_html}
  </div>
  <p style="font-size:14px;color:#57534e;line-height:1.6;">
    If you haven&rsquo;t already, <a href="https://calendly.com/veronica-291/norcalsbdc-intake-interview"
    style="color:#2456e3;text-decoration:underline;">schedule your intake interview</a>
    to get started sooner.
  </p>"""

    subject = f"Welcome to NorCal SBDC, {first}"
    await asyncio.to_thread(_send_email, email, subject, _base_template(content))


async def send_admin_notification(data: dict, score: int, track: str):
    """Send notification to admin when a new intake is submitted."""
    admin_email = INTAKE_ADMIN_EMAIL
    if not admin_email:
        return

    first = data.get("firstName", "")
    last = data.get("lastName", "")
    email = data.get("email", "")
    phone = data.get("phone", "")
    city = data.get("city", "")
    state = data.get("state", "")
    zip_code = data.get("zipCode", "")
    status = "In Business" if data.get("businessStatus") == "B" else "Pre-venture"
    company = data.get("companyName", "") or data.get("businessIdea", "")[:80] or "N/A"
    website = data.get("website", "")

    goals = data.get("goals", [])
    goals_text = ", ".join(GOAL_LABELS.get(g, g) for g in goals) if goals else "None"

    programs = data.get("specialPrograms", [])
    programs_text = ", ".join(PROGRAM_LABELS.get(p, p) for p in programs) if programs else "None"

    track_labels = {
        "advising": "Advising-Ready",
        "training": "Training-First",
        "urgent_capital": "URGENT Capital Lane",
    }

    track_color = "#16a34a" if track == "advising" else "#dc2626" if track == "urgent_capital" else "#2456e3"
    track_label = track_labels.get(track, track)

    website_row = f'<tr><td style="padding:6px 0;color:#57534e;font-size:13px;">Website</td><td style="padding:6px 0;font-weight:600;font-size:13px;text-align:right;"><a href="{website}" style="color:#2456e3;">{website}</a></td></tr>' if website else ""

    content = f"""\
  <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;margin:0 0 4px;">New Smart 641 Intake</p>
  <h1 style="font-size:22px;font-weight:300;color:#1a1a1a;margin:0 0 4px;">{first} {last}</h1>
  <p style="font-size:14px;color:#57534e;margin:0 0 20px;">{email} &middot; {phone}</p>

  <div style="display:inline-block;padding:6px 16px;border-radius:100px;font-size:12px;font-weight:700;color:{track_color};background:rgba(0,0,0,0.04);margin-bottom:16px;">
    Score: {score}/100 &middot; {track_label}
  </div>

  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e7e2da;border-radius:10px;overflow:hidden;">
    <tr><td style="padding:6px 12px;color:#57534e;font-size:13px;">Status</td><td style="padding:6px 12px;font-weight:600;font-size:13px;text-align:right;">{status}</td></tr>
    <tr style="background:#faf8f4;"><td style="padding:6px 12px;color:#57534e;font-size:13px;">Business</td><td style="padding:6px 12px;font-weight:600;font-size:13px;text-align:right;">{company}</td></tr>
    <tr><td style="padding:6px 12px;color:#57534e;font-size:13px;">Location</td><td style="padding:6px 12px;font-weight:600;font-size:13px;text-align:right;">{city}, {state} {zip_code}</td></tr>
    <tr style="background:#faf8f4;"><td style="padding:6px 12px;color:#57534e;font-size:13px;">Goals</td><td style="padding:6px 12px;font-weight:600;font-size:13px;text-align:right;">{goals_text}</td></tr>
    <tr><td style="padding:6px 12px;color:#57534e;font-size:13px;">Programs</td><td style="padding:6px 12px;font-weight:600;font-size:13px;text-align:right;">{programs_text}</td></tr>
    {website_row}
  </table>"""

    subject = f"New 641 Intake: {first} {last} ({track_label})"
    await asyncio.to_thread(_send_email, admin_email, subject, _base_template(content))


async def send_intake_notifications(data: dict, score: int, track: str):
    """Fire both user confirmation and admin notification (non-blocking)."""
    tasks = [
        send_user_confirmation(data),
        send_admin_notification(data, score, track),
    ]
    # Run both in parallel, don't let failures propagate
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results:
        if isinstance(r, Exception):
            logger.error("Email notification error: %s", r)
