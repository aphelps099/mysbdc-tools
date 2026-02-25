"""
Smart 641 Intake endpoint — creates Contact + Client in Neoserra.

Calculates readiness score, maps to Neoserra fields, creates record,
logs submission details, and sends email notifications.
"""

import json
import logging
from collections import deque
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..services import neoserra_client as neo
from ..services.intake_email import send_intake_notifications, is_configured as smtp_configured

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/intake", tags=["intake"])


# ─── Submission Log (in-memory ring buffer — last 50 submissions) ──

_submission_log: deque[dict] = deque(maxlen=50)


def _log_submission(data: dict, score: int, track: str, payload: dict,
                    result: dict | None, success: bool, error: str | None):
    """Append to the in-memory submission log for debugging."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "name": f"{data.get('firstName', '')} {data.get('lastName', '')}",
        "email": data.get("email", ""),
        "zipCode": data.get("zipCode", ""),
        "score": score,
        "track": track,
        "centerId": payload.get("centerId"),
        "specialPrograms": data.get("specialPrograms", []),
        "success": success,
        "error": error,
        "neoserraResponse": _sanitize(result) if result else None,
        "payloadSent": {k: v for k, v in payload.items() if k != "contact"},
    }
    _submission_log.appendleft(entry)
    logger.info(
        "INTAKE LOG | %s | %s %s | email=%s | score=%d | track=%s | center=%s | success=%s%s",
        entry["timestamp"],
        data.get("firstName", ""),
        data.get("lastName", ""),
        data.get("email", ""),
        score,
        track,
        payload.get("centerId"),
        success,
        f" | error={error}" if error else "",
    )


def _sanitize(obj: dict) -> dict:
    """Remove sensitive fields from Neoserra response for the log."""
    return {k: v for k, v in obj.items() if k not in ("_token", "password")}


# ─── Request / Response Schemas ───────────────────────────────

class IntakeData(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    streetAddress: str = ""
    city: str
    state: str = "CA"
    zipCode: str

    businessStatus: str  # "B" | "P"

    companyName: str = ""
    dateEstablished: str = ""
    businessAddress: str = ""
    businessCity: str = ""
    businessState: str = ""
    businessZip: str = ""
    businessDescription: str = ""
    position: str = ""

    businessIdea: str = ""

    goals: list[str] = []

    capitalTimeline: Optional[str] = None
    capitalAmount: Optional[str] = None
    docsReady: Optional[str] = None
    creditAwareness: Optional[str] = None

    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    hispanic: Optional[str] = None
    veteran: Optional[str] = None
    education: Optional[str] = None
    language: Optional[str] = None

    website: str = ""
    specialPrograms: list[str] = []

    referral: str = ""
    referralOther: str = ""
    newsletter: str = ""
    signature: str = ""
    privacyRelease: str = "No"

    centerId: Optional[int] = 107
    programSignup: str = ""  # existing-client program enrollment → overrides centerId


class IntakeResult(BaseModel):
    success: bool
    score: int
    track: str
    trackLabel: str
    neoserraResult: Optional[dict] = None
    error: Optional[str] = None


# ─── Readiness Scoring ────────────────────────────────────────

def calculate_readiness_score(data: IntakeData) -> tuple[int, str]:
    """Calculate 0-100 readiness score. Weights: biz 25, docs 25, timeline 15, credit 15, goals 20."""
    score = 0

    status_scores = {"B": 25, "P": 8}
    score += status_scores.get(data.businessStatus, 0)

    has_capital = "access_capital" in data.goals
    if has_capital and data.docsReady:
        score += {"all_ready": 25, "some_ready": 15, "not_started": 5}.get(data.docsReady, 0)
    elif not has_capital:
        score += 12

    if data.capitalTimeline:
        score += {"urgent_30": 15, "near_90": 12, "within_year": 8, "exploring": 4}.get(data.capitalTimeline, 0)
    elif not has_capital:
        score += 7

    if data.creditAwareness:
        score += {"excellent": 15, "good": 12, "fair": 8, "unsure": 3}.get(data.creditAwareness, 0)
    elif not has_capital:
        score += 7

    gc = len(data.goals)
    score += 20 if gc >= 3 else 15 if gc == 2 else 10 if gc == 1 else 0

    if data.capitalTimeline == "urgent_30":
        score = 100

    score = max(0, min(100, score))

    if score == 100 and data.capitalTimeline == "urgent_30":
        track = "urgent_capital"
    elif score >= 60:
        track = "advising"
    else:
        track = "training"

    return score, track


# ─── Neoserra Field Mapping ───────────────────────────────────

PROGRAM_NEOSERRA_MAP = {
    "probiz": "PROBIZ",
    "health": "HEALTH",
    "eats": "EATS",
    "manufacturing": "113",
    "tfg": "TFG",
}

# Special programs that have their own Neoserra center (for existing-client signup)
PROGRAM_CENTER_MAP = {
    "probiz": 106,
    "health": 96,
    "eats": 63,
    "tfg": 34,
}


def map_to_neoserra(data: IntakeData, score: int, track: str) -> dict:
    """Map wizard data to Neoserra client + embedded contact format."""
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    goal_labels = {
        "access_capital": "Access Capital", "start_business": "Start a Business",
        "grow_revenue": "Grow Revenue", "gov_contracting": "Government Contracting",
        "buy_business": "Buy a Business", "export": "International Trade / Export",
        "technology": "Technology / Innovation", "other": "Other",
    }
    track_labels = {"advising": "Advising-Ready", "training": "Training-First", "urgent_capital": "URGENT Capital Lane"}
    goals_text = ", ".join(goal_labels.get(g, g) for g in data.goals) or "None specified"

    # Build intake memo for advisor context
    memo_lines = [
        f"Smart 641 Intake — {now_str}",
        f"Readiness Score: {score}/100",
        f"Routing: {track_labels.get(track, track)}",
        f"Goals: {goals_text}",
    ]
    prog_labels = {"probiz": "ProBiz", "health": "SBDC Health", "eats": "SBDC Eats", "manufacturing": "Roadmap 4 Innovation", "tfg": "Tech Futures"}
    if data.programSignup:
        memo_lines.append(f"⚑ Existing-client program signup: {prog_labels.get(data.programSignup, data.programSignup)}")
    if data.specialPrograms:
        memo_lines.append(f"Programs: {', '.join(prog_labels.get(p, p) for p in data.specialPrograms)}")
    if data.capitalTimeline:
        tl = {"urgent_30": "Urgent (<30 days)", "near_90": "1-3 months", "within_year": "Within 12 months", "exploring": "Exploring"}
        memo_lines.append(f"Capital Timeline: {tl.get(data.capitalTimeline, data.capitalTimeline)}")
    if data.capitalAmount:
        memo_lines.append(f"Capital Amount: {data.capitalAmount}")
    if data.docsReady:
        dl = {"all_ready": "All ready", "some_ready": "Some ready", "not_started": "Not started"}
        memo_lines.append(f"Docs: {dl.get(data.docsReady, data.docsReady)}")
    if data.website:
        memo_lines.append(f"Website: {data.website}")

    intake_memo = "\n".join(memo_lines)

    # ── Contact ──
    contact: dict = {
        "first": data.firstName,
        "last": data.lastName,
        "email": data.email,
        "phone": data.phone,
    }
    if data.streetAddress:
        contact["mailaddr"] = data.streetAddress
    if data.city:
        contact["mailcity"] = data.city
    if data.state:
        contact["mailst"] = data.state
    if data.zipCode:
        contact["mailzip"] = data.zipCode
    if data.position:
        contact["position"] = data.position

    for field, neo_field in [("gender", "gender"), ("ethnicity", "ethnic"),
                              ("hispanic", "hispanic"), ("veteran", "veteran"),
                              ("education", "education"), ("language", "language")]:
        val = getattr(data, field, None)
        if val:
            contact[neo_field] = val

    # ── Client payload ──
    is_biz = data.businessStatus == "B"
    phys_addr = data.businessAddress if is_biz and data.businessAddress else data.streetAddress or "."
    phys_city = data.businessCity if is_biz and data.businessCity else data.city
    phys_state = data.businessState if is_biz and data.businessState else data.state
    phys_zip = data.businessZip if is_biz and data.businessZip else data.zipCode

    payload: dict = {
        "company": data.companyName if is_biz else f"{data.firstName} {data.lastName}",
        "physaddr": phys_addr,
        "physcity": phys_city,
        "physst": phys_state,
        "physzip": phys_zip,
        "statusInit": data.businessStatus,
        "busemail": data.email,
        "busphone": data.phone,
        "product": data.businessDescription if is_biz else "",
        "reffrom": data.referral,
        "signature": data.signature,
        "ecenterEntry": datetime.now().strftime("%m/%d/%Y"),
        "intakeMemo": intake_memo,
        "contact": contact,
    }

    if data.website:
        payload["url"] = data.website

    # Special programs → Neoserra specialpgm field
    all_programs = list(data.specialPrograms)
    if data.programSignup and data.programSignup not in all_programs:
        all_programs.insert(0, data.programSignup)
    if all_programs:
        payload["specialpgm"] = ",".join(
            PROGRAM_NEOSERRA_MAP.get(p, p.upper()) for p in all_programs
        )

    # Center ID — program signup overrides geographic center
    from ..services.zip_center_map import resolve_center_from_zip, DEFAULT_CENTER_ID
    if data.programSignup and data.programSignup in PROGRAM_CENTER_MAP:
        center_id = PROGRAM_CENTER_MAP[data.programSignup]
        logger.info("Program signup override: %s → center %d", data.programSignup, center_id)
    elif data.centerId and data.centerId != DEFAULT_CENTER_ID:
        center_id = data.centerId
    else:
        center_id, _ = resolve_center_from_zip(data.zipCode)
    payload["centerId"] = center_id
    contact["centerId"] = center_id

    if is_biz and data.dateEstablished:
        # HTML date input sends YYYY-MM-DD; Neoserra expects MM/DD/YYYY
        try:
            dt = datetime.strptime(data.dateEstablished, "%Y-%m-%d")
            payload["estab"] = dt.strftime("%m/%d/%Y")
        except ValueError:
            payload["estab"] = data.dateEstablished
    if not is_biz and data.businessIdea:
        payload["product_alt"] = data.businessIdea
    if data.referral == "O" and data.referralOther:
        payload["reffromDesc"] = data.referralOther

    return payload


# ─── Endpoints ────────────────────────────────────────────────

@router.post("/submit", response_model=IntakeResult)
async def submit_intake(data: IntakeData):
    """Process a Smart 641 intake submission."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    score, track = calculate_readiness_score(data)
    payload = map_to_neoserra(data, score, track)

    # Log the outgoing payload for debugging
    logger.info(
        "INTAKE SUBMIT | Sending to Neoserra: %s",
        json.dumps({k: v for k, v in payload.items() if k != "contact"}, default=str)[:1000],
    )

    try:
        result = await neo.create_client(payload)

        if result and result.get("_error"):
            error_msg = f"CRM write failed ({result.get('_status', '?')}): {json.dumps(result)[:300]}"
            logger.warning("INTAKE FAIL | %s", error_msg)
            _log_submission(data.model_dump(), score, track, payload, result, False, error_msg)
            return IntakeResult(
                success=False, score=score, track=track,
                trackLabel=_track_label(track), error=error_msg,
            )

        logger.info(
            "INTAKE OK | %s %s → score=%d, track=%s, neoserraId=%s",
            data.firstName, data.lastName, score, track,
            result.get("id", "?") if result else "?",
        )
        _log_submission(data.model_dump(), score, track, payload, result, True, None)

        # Fire-and-forget email notifications
        try:
            await send_intake_notifications(data.model_dump(), score, track)
        except Exception as email_err:
            logger.error("Email notification error (non-blocking): %s", email_err)

        return IntakeResult(
            success=True, score=score, track=track,
            trackLabel=_track_label(track), neoserraResult=result,
        )

    except Exception as exc:
        error_msg = str(exc)
        logger.error("INTAKE ERROR | %s", error_msg)
        _log_submission(data.model_dump(), score, track, payload, None, False, error_msg)
        return IntakeResult(
            success=False, score=score, track=track,
            trackLabel=_track_label(track), error=error_msg,
        )


def _track_label(track: str) -> str:
    return {"advising": "Advising-Ready", "training": "Advising-Ready", "urgent_capital": "Urgent Capital Lane"}.get(track, track)


@router.get("/log")
async def get_submission_log():
    """Return recent intake submissions for debugging. Requires admin awareness."""
    return {
        "count": len(_submission_log),
        "smtp_configured": smtp_configured(),
        "submissions": list(_submission_log),
    }


@router.get("/centers")
async def get_intake_centers():
    if not neo.is_configured():
        return {"centers": [], "configured": False}
    try:
        centers = await neo.get_all_centers()
        return {
            "configured": True,
            "centers": [
                {"id": c.get("id"), "name": c.get("centerName", "")}
                for c in centers if c.get("centerName")
            ],
        }
    except Exception:
        return {"centers": [], "configured": False}


@router.get("/resolve-center")
async def resolve_center(zip: str = Query("", min_length=3, description="ZIP code")):
    from ..services.zip_center_map import resolve_center_from_zip, CENTER_INFO
    center_id, center_name = resolve_center_from_zip(zip)
    info = CENTER_INFO.get(center_id, {})
    return {"centerId": center_id, "centerName": center_name, "counties": info.get("counties", "")}


@router.get("/check-email")
async def check_email(email: str = Query(..., min_length=5, description="Email address to check")):
    """Check whether a contact or client with this email already exists in Neoserra.

    Returns a simple boolean + message — no PII is exposed."""
    if not neo.is_configured():
        return {"exists": False, "message": ""}

    if "@" not in email or "." not in email.split("@")[-1]:
        return {"exists": False, "message": ""}

    try:
        contacts = await neo.search_contacts(email)
        clients = await neo.search_clients(email)
        exists = bool(contacts or clients)
        message = (
            "A record with this email already exists in our system. "
            "If you\u2019ve worked with an SBDC before, you may want to "
            "contact your advisor instead of submitting a new intake."
        ) if exists else ""
        return {"exists": exists, "message": message}
    except Exception:
        logger.exception("check-email lookup failed for %s", email)
        return {"exists": False, "message": ""}
