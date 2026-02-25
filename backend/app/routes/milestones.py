"""
Milestone collection API routes.

Provides contact lookup and milestone submission for the
public-facing /milestones wizard. Creates Neoserra milestone
and investment records based on form submissions.
"""

import json
import logging
import sqlite3
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..config import BASE_DIR
from ..services import neoserra_client as neo
from ..services.milestone_email import send_milestone_notifications, is_configured as smtp_configured

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/milestones", tags=["milestones"])


# ─── Submission Log (SQLite — 14-day rolling history) ─────────────

_MILESTONE_LOG_DB = str(BASE_DIR / "milestone_log.db")
_MILESTONE_LOG_RETENTION_DAYS = 14


def _ensure_milestone_log_table():
    conn = sqlite3.connect(_MILESTONE_LOG_DB)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS milestone_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            client_id TEXT NOT NULL,
            client_public_id TEXT NOT NULL,
            client_name TEXT NOT NULL,
            center_id TEXT,
            counselor_id TEXT,
            program TEXT,
            categories TEXT NOT NULL,
            records_created INTEGER NOT NULL,
            errors TEXT,
            details TEXT,
            signature TEXT NOT NULL,
            email_notifications TEXT
        )
    """)
    conn.commit()
    conn.close()


def _log_milestone_submission(
    data,
    records_created: int,
    errors: list[str],
    details: list[dict],
    emails_sent: dict,
):
    """Write milestone submission to SQLite log and prune old entries."""
    try:
        _ensure_milestone_log_table()
        conn = sqlite3.connect(_MILESTONE_LOG_DB)
        conn.execute(
            """INSERT INTO milestone_submissions
               (timestamp, name, email, client_id, client_public_id, client_name,
                center_id, counselor_id, program, categories, records_created,
                errors, details, signature, email_notifications)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                datetime.now(timezone.utc).isoformat(),
                f"{data.firstName} {data.lastName}",
                data.contactEmail,
                data.clientId,
                data.clientPublicId,
                data.clientName,
                data.clientCenterId,
                data.counselorId,
                data.program,
                json.dumps(data.categories),
                records_created,
                json.dumps(errors) if errors else None,
                json.dumps([{"type": d.get("type"), "status": d.get("status")} for d in details]),
                data.signature,
                json.dumps(emails_sent),
            ),
        )
        # Prune entries older than retention period
        conn.execute(
            "DELETE FROM milestone_submissions WHERE timestamp < datetime('now', ?)",
            (f"-{_MILESTONE_LOG_RETENTION_DAYS} days",),
        )
        conn.commit()
        conn.close()
    except Exception as exc:
        logger.error("Milestone log write error: %s", exc)

    logger.info(
        "MILESTONE LOG | %s %s | email=%s | client=%s (%s) | records=%d | errors=%d | emails=%s",
        data.firstName,
        data.lastName,
        data.contactEmail,
        data.clientPublicId,
        data.clientId,
        records_created,
        len(errors),
        ", ".join(f"{k}={v}" for k, v in emails_sent.items()),
    )


# ─── Request / Response Schemas ───────────────────────────────

class LookupRequest(BaseModel):
    email: str


class LookupByIdRequest(BaseModel):
    contactId: str


class ClientInfo(BaseModel):
    id: str
    clientId: str
    company: str
    ftEmps: int
    ptEmps: int
    grossSales: float
    centerId: Optional[str] = None
    counselorId: Optional[str] = None


class ContactInfo(BaseModel):
    id: str
    first: str
    last: str
    email: str


class LookupResponse(BaseModel):
    found: bool
    contact: Optional[ContactInfo] = None
    clients: list[ClientInfo] = []
    error: Optional[str] = None


class FundingRow(BaseModel):
    source: str
    amount: str
    typeCode: Optional[str] = None  # Neoserra investment type code


class MilestoneSubmission(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    contactId: str
    contactEmail: str
    clientId: str
    clientPublicId: str
    clientName: str
    initialFtEmps: int
    initialPtEmps: int
    initialGrossSales: float
    clientCenterId: str
    counselorId: Optional[str] = None
    categories: list[str]
    totalFtEmployees: str
    totalPtEmployees: str
    grossRevenue: str
    businessStartVerified: str
    businessStructure: str
    businessStartDate: str
    investedOwnMoney: Optional[str] = ''
    ownInvestment: str
    hasOtherFunding: Optional[str] = ''
    additionalFunding: list[FundingRow]
    testimonial: str
    signature: str
    program: str


class SubmitResponse(BaseModel):
    success: bool
    recordsCreated: int
    details: list[dict]
    error: Optional[str] = None


# ─── Helpers ──────────────────────────────────────────────────

def _neo_str(val, default: str = "") -> str:
    """Extract a scalar string from a Neoserra field that may come back as a list."""
    if isinstance(val, list):
        return str(val[0]) if val else default
    return str(val) if val else default


def _safe_int(val, default: int = 0) -> int:
    """Convert a value to int safely, handling floats-as-strings and bad data."""
    try:
        return int(float(val)) if val else default
    except (ValueError, TypeError):
        return default


def _safe_float(val, default: float = 0.0) -> float:
    """Convert a value to float safely, handling bad data."""
    try:
        return float(val) if val else default
    except (ValueError, TypeError):
        return default


async def _resolve_clients_for_contact(contact_id: str) -> list[ClientInfo]:
    """Get all client records linked to a contact with full details."""
    relationships = await neo.get_clients_for_contact(contact_id)
    clients: list[ClientInfo] = []

    for rel in relationships:
        try:
            # Relationship records contain a reference to the client
            client_ref = _neo_str(rel.get("_ref") or rel.get("clientId") or rel.get("client"))
            if not client_ref:
                continue

            client_data = await neo.get_client(client_ref)
            if not client_data:
                continue

            clients.append(ClientInfo(
                id=_neo_str(client_data.get("_ref")) or client_ref,
                clientId=_neo_str(client_data.get("client")),
                company=str(client_data.get("company", "Unknown Business")),
                ftEmps=_safe_int(client_data.get("ftEmps")),
                ptEmps=_safe_int(client_data.get("ptEmps")),
                grossSales=_safe_float(client_data.get("grossSales")),
                centerId=_neo_str(client_data.get("centerId")) or None,
                counselorId=_neo_str(client_data.get("counselId")) or None,
            ))
        except Exception as exc:
            logger.warning("Skipping client from relationship %s: %s", rel, exc)
            continue

    return clients


# ─── Endpoints ────────────────────────────────────────────────

@router.post("/lookup", response_model=LookupResponse)
async def lookup_contact(req: LookupRequest):
    """Look up a contact by email and return their linked client records."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    try:
        email = req.email.strip()
        if not email or "@" not in email:
            return LookupResponse(found=False, error="Please provide a valid email address.")

        # Search for contacts by email
        contacts = await neo.search_contacts(email)
        if not contacts:
            return LookupResponse(
                found=False,
                error="No contact records found in our system with the email address provided.",
            )

        # Try ALL matching contacts — duplicates are common in Neoserra.
        # Use the first contact that has linked client records.
        best_contact: ContactInfo | None = None
        all_clients: dict[str, ClientInfo] = {}  # keyed by id to deduplicate

        for contact_raw in contacts:
            contact_id = _neo_str(
                contact_raw.get("_ref")
                or contact_raw.get("indivId")
                or contact_raw.get("id", "")
            )
            if not contact_id:
                continue

            clients = await _resolve_clients_for_contact(contact_id)

            if clients and best_contact is None:
                best_contact = ContactInfo(
                    id=contact_id,
                    first=str(contact_raw.get("first", "")),
                    last=str(contact_raw.get("last", "")),
                    email=str(contact_raw.get("email", email)),
                )

            for c in clients:
                if c.id not in all_clients:
                    all_clients[c.id] = c

        if len(contacts) > 1:
            logger.warning(
                "Duplicate contacts found for email %s: %d contacts, %d unique clients",
                email, len(contacts), len(all_clients),
            )

        # Fallback: if no contact had clients, use first contact for the error
        if best_contact is None:
            fallback = contacts[0]
            best_contact = ContactInfo(
                id=_neo_str(fallback.get("_ref") or fallback.get("indivId") or fallback.get("id", "")),
                first=str(fallback.get("first", "")),
                last=str(fallback.get("last", "")),
                email=str(fallback.get("email", email)),
            )

        merged = list(all_clients.values())
        if not merged:
            return LookupResponse(
                found=False,
                contact=best_contact,
                error="Your contact was found but no business records are linked. Please contact your SBDC.",
            )

        return LookupResponse(found=True, contact=best_contact, clients=merged)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in contact lookup: %s", exc)
        return LookupResponse(
            found=False,
            error="An unexpected error occurred during lookup. Please try again or contact your SBDC.",
        )


@router.post("/lookup-by-id", response_model=LookupResponse)
async def lookup_contact_by_id(req: LookupByIdRequest):
    """Look up a contact by ID (for deep-link flow)."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    try:
        contact_id = req.contactId.strip()
        if not contact_id:
            return LookupResponse(found=False, error="No contact ID provided.")

        # Get contact record
        contact_raw = await neo.get_contact(contact_id)
        if not contact_raw:
            return LookupResponse(found=False, error="Contact not found.")

        contact = ContactInfo(
            id=contact_id,
            first=str(contact_raw.get("first", "")),
            last=str(contact_raw.get("last", "")),
            email=str(contact_raw.get("email", "")),
        )

        # Get linked clients
        clients = await _resolve_clients_for_contact(contact_id)
        if not clients:
            return LookupResponse(
                found=False,
                contact=contact,
                error="Contact found but no business records are linked.",
            )

        return LookupResponse(found=True, contact=contact, clients=clients)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in contact lookup by ID: %s", exc)
        return LookupResponse(
            found=False,
            error="An unexpected error occurred during lookup. Please try again or contact your SBDC.",
        )


@router.post("/submit", response_model=SubmitResponse)
async def submit_milestones(data: MilestoneSubmission):
    """Submit milestone data and create Neoserra records."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    today = date.today().strftime("%Y-%m-%d")
    records_created = 0
    details: list[dict] = []
    errors: list[str] = []

    # Base fields for all records
    base = {
        "clientId": data.clientId,
        "date": today,
        "attribStatement": data.testimonial or "",
        "affirmation": data.signature,
    }

    if data.clientCenterId:
        base["centerId"] = data.clientCenterId

    if data.counselorId:
        base["counselors"] = data.counselorId

    # ── Hired Employees (Full-Time) ──
    if "hired_employees" in data.categories and data.totalFtEmployees:
        try:
            ft_amount = int(data.totalFtEmployees)
            result = await neo.create_milestone({
                **base,
                "type": "NS",
                "amount": str(ft_amount),
                "initialAmount": str(data.initialFtEmps),
                "surveyId": "3039",
                "memo": f"Milestone submission: {ft_amount} full-time employees (was {data.initialFtEmps})",
            })
            if result and not result.get("_error"):
                records_created += 1
                details.append({"type": "NS", "status": "created", "data": result})
            else:
                errors.append(f"Failed to create FT employees milestone: {result}")
        except Exception as e:
            errors.append(f"FT employees error: {str(e)}")

    # ── Hired Employees (Part-Time) ──
    if "hired_employees" in data.categories and data.totalPtEmployees:
        try:
            pt_amount = int(data.totalPtEmployees)
            result = await neo.create_milestone({
                **base,
                "type": "NSPT",
                "amount": str(pt_amount),
                "initialAmount": str(data.initialPtEmps),
                "memo": f"Milestone submission: {pt_amount} part-time employees (was {data.initialPtEmps})",
            })
            if result and not result.get("_error"):
                records_created += 1
                details.append({"type": "NSPT", "status": "created", "data": result})
            else:
                errors.append(f"Failed to create PT employees milestone: {result}")
        except Exception as e:
            errors.append(f"PT employees error: {str(e)}")

    # ── Increased Sales ──
    if "increased_sales" in data.categories and data.grossRevenue:
        try:
            revenue = float(data.grossRevenue)
            result = await neo.create_milestone({
                **base,
                "type": "IS",
                "amount": str(revenue),
                "initialAmount": str(data.initialGrossSales),
                "surveyId": "3037",
                "memo": f"Milestone submission: ${revenue:,.0f} gross revenue (was ${data.initialGrossSales:,.0f})",
            })
            if result and not result.get("_error"):
                records_created += 1
                details.append({"type": "IS", "status": "created", "data": result})
            else:
                errors.append(f"Failed to create sales milestone: {result}")
        except Exception as e:
            errors.append(f"Sales error: {str(e)}")

    # ── Started New Business ──
    if "started_business" in data.categories and data.businessStartVerified == "yes":
        try:
            start_date = data.businessStartDate or today
            result = await neo.create_milestone({
                **base,
                "type": "ST",
                "date": start_date,
                "surveyId": "3038",
                "memo": f"Business started. Structure: {data.businessStructure}. Date: {start_date}",
            })
            if result and not result.get("_error"):
                records_created += 1
                details.append({"type": "ST", "status": "created", "data": result})
            else:
                errors.append(f"Failed to create business start milestone: {result}")
        except Exception as e:
            errors.append(f"Business start error: {str(e)}")

    # ── Got Funded: Owner Investment ──
    if "got_funded" in data.categories and data.ownInvestment:
        try:
            own_amount = float(data.ownInvestment)
            if own_amount > 0:
                result = await neo.create_investment({
                    **base,
                    "type": "W",  # Owner Investment
                    "amountApproved": str(own_amount),
                    "status": "A",  # Approved
                    "dateCompleted": today,
                    "surveyId": "3040",
                    "memo": f"Owner investment: ${own_amount:,.0f}",
                })
                if result and not result.get("_error"):
                    records_created += 1
                    details.append({"type": "investment_owner", "status": "created", "data": result})
                else:
                    errors.append(f"Failed to create owner investment: {result}")
        except Exception as e:
            errors.append(f"Owner investment error: {str(e)}")

    # ── Got Funded: Additional Sources ──
    if "got_funded" in data.categories:
        for i, row in enumerate(data.additionalFunding):
            if not row.amount.strip():
                continue
            # Need either a known type code or a custom source name
            inv_type = row.typeCode or "?"
            source_label = row.source.strip() or inv_type
            if inv_type == "?" and not row.source.strip():
                continue
            # Neoserra rejects "?" — map Other to "0" (Private Non-Institution)
            if inv_type == "?":
                inv_type = "0"
            try:
                amount = float(row.amount)
                if amount > 0:
                    inv_data = {
                        **base,
                        "type": inv_type,
                        "amountApproved": str(amount),
                        "status": "A",
                        "dateCompleted": today,
                        "surveyId": "3040",
                        "memo": f"Additional funding ({source_label}): ${amount:,.0f}",
                    }
                    # Set institution for custom "Other" sources
                    if inv_type == "0" and row.source.strip():
                        inv_data["institution"] = row.source.strip()
                    result = await neo.create_investment(inv_data)
                    if result and not result.get("_error"):
                        records_created += 1
                        details.append({
                            "type": f"investment_additional_{i}",
                            "status": "created",
                            "data": result,
                        })
                    else:
                        errors.append(f"Failed to create investment #{i + 1}: {result}")
            except Exception as e:
                errors.append(f"Additional funding #{i + 1} error: {str(e)}")

    # Log summary
    logger.info(
        "Milestone submission for client %s: %d records created, %d errors",
        data.clientId,
        records_created,
        len(errors),
    )

    if errors:
        logger.warning("Milestone submission errors: %s", errors)

    # Fire email notifications and capture status
    emails_sent: dict[str, str] = {}
    try:
        emails_sent = await send_milestone_notifications(data, records_created, errors)
    except Exception as exc:
        logger.error("Milestone notification dispatch error: %s", exc)
        emails_sent = {"error": str(exc)}

    # Write to submission log
    _log_milestone_submission(data, records_created, errors, details, emails_sent)

    # Record impacts for ATLAS aggregation (long-term, no retention limit)
    try:
        from ..services.atlas import record_impacts_from_submission
        record_impacts_from_submission(data)
    except Exception as exc:
        logger.error("ATLAS impact recording error: %s", exc)

    return SubmitResponse(
        success=records_created > 0 or len(errors) == 0,
        recordsCreated=records_created,
        details=details,
        error="; ".join(errors) if errors else None,
    )


@router.get("/log")
async def get_milestone_log(days: int = Query(default=14, ge=1, le=90)):
    """Return milestone submissions from the last N days (default 14)."""
    try:
        _ensure_milestone_log_table()
        conn = sqlite3.connect(_MILESTONE_LOG_DB)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """SELECT * FROM milestone_submissions
               WHERE timestamp >= datetime('now', ?)
               ORDER BY timestamp DESC""",
            (f"-{days} days",),
        ).fetchall()
        conn.close()

        submissions = []
        for row in rows:
            submissions.append({
                "id": row["id"],
                "timestamp": row["timestamp"],
                "name": row["name"],
                "email": row["email"],
                "clientId": row["client_id"],
                "clientPublicId": row["client_public_id"],
                "clientName": row["client_name"],
                "centerId": row["center_id"],
                "counselorId": row["counselor_id"],
                "program": row["program"],
                "categories": json.loads(row["categories"]) if row["categories"] else [],
                "recordsCreated": row["records_created"],
                "errors": json.loads(row["errors"]) if row["errors"] else [],
                "details": json.loads(row["details"]) if row["details"] else [],
                "signature": row["signature"],
                "emailNotifications": json.loads(row["email_notifications"]) if row["email_notifications"] else {},
            })

        return {
            "count": len(submissions),
            "days": days,
            "smtp_configured": smtp_configured(),
            "submissions": submissions,
        }
    except Exception as exc:
        logger.error("Milestone log read error: %s", exc)
        return {"count": 0, "days": days, "smtp_configured": smtp_configured(), "submissions": [], "error": str(exc)}
