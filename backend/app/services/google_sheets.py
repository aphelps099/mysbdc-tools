"""
Google Sheets client for reading milestone submission history.

The SBDC milestone reporting form (Gravity Forms on norcalsbdc.org)
feeds submissions into a Google Sheet.  This module reads that sheet
to provide milestone history per Neoserra client ID — a workaround
for the Neoserra API not supporting listing milestones by client.

Required env vars:
  GOOGLE_SHEETS_CREDENTIALS  – JSON string of a service-account key
  GOOGLE_SHEET_ID            – the spreadsheet ID
"""

import json
import logging
import os
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ─── Configuration ──────────────────────────────────────────────

GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")
_CREDS_JSON = os.getenv("GOOGLE_SHEETS_CREDENTIALS", "")

# Sheet column mapping (0-indexed, based on Gravity Forms → Sheets feed config)
# These match the column_mapping in the GF Google Sheets add-on config.
COL = {
    "contact_id": 0,         # A – Contact ID
    "contact_email": 1,      # B – Contact Email
    "client_id": 2,          # C – Neoserra Client ID
    "init_ft": 3,            # D – Initial Full-Time Staff
    "total_ft": 4,           # E – Total Full-Time Employees
    "delta_ft": 5,           # F – Change in Full-Time Employees
    "init_pt": 6,            # G – Initial Part-Time Staff
    "total_pt": 7,           # H – Total Part-Time Employees
    "delta_pt": 8,           # I – Change in Part-Time Employees
    "emp_notes": 9,          # J – Change in Employees Notes
    "emp_sig": 10,           # K – Change in Employees Signature
    "init_sales": 11,        # L – Initial Gross Sales
    "gross_revenue": 12,     # M – Gross Revenue
    "delta_revenue": 13,     # N – Change in Gross Revenue
    "sales_notes": 14,       # O – Change in Sales Notes
    "sales_sig": 15,         # P – Change in Sales Signature
    "biz_start_verified": 16, # Q – Business Start Verification
    "legal_structure": 17,   # R – Legal Business Structure
    "biz_start_date": 18,    # S – Business Start Date
    "biz_notes": 19,         # T – Business Start Notes
    "biz_sig": 20,           # U – Business Start Signature
    "funding_type": 21,      # V – Funding Type
    "institution": 22,       # W – Institution
    "amount_approved": 23,   # X – Amount Approved
    "funding_date": 24,      # Y – Date Completed
    "funding_notes": 25,     # Z – Capital Funding Notes
    "funding_sig": 26,       # AA – Capital Funding Signature
    "entry_id": 27,          # AB – Entry ID
    "entry_date": 28,        # AC – Entry Date
    "created_by": 29,        # AD – Created By
}

# ─── In-memory cache ────────────────────────────────────────────

_cache: dict[str, Any] = {}
_cache_ts: float = 0.0
CACHE_TTL = 300  # 5 minutes


def _is_configured() -> bool:
    return bool(GOOGLE_SHEET_ID and _CREDS_JSON)


def _build_service():
    """Build a Google Sheets API service using service-account credentials."""
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        logger.error(
            "google-api-python-client or google-auth not installed. "
            "Run: pip install google-api-python-client google-auth"
        )
        return None

    try:
        info = json.loads(_CREDS_JSON)
        creds = Credentials.from_service_account_info(
            info,
            scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
        )
        return build("sheets", "v4", credentials=creds, cache_discovery=False)
    except Exception:
        logger.exception("Failed to build Google Sheets service")
        return None


def _fetch_all_rows() -> list[list[str]]:
    """Fetch all rows from the first sheet tab. Cached for CACHE_TTL seconds."""
    global _cache, _cache_ts

    now = time.time()
    if _cache.get("rows") is not None and (now - _cache_ts) < CACHE_TTL:
        return _cache["rows"]

    service = _build_service()
    if not service:
        return []

    try:
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=GOOGLE_SHEET_ID, range="Sheet1")
            .execute()
        )
        rows = result.get("values", [])
        # Skip header row
        data_rows = rows[1:] if len(rows) > 1 else []
        _cache["rows"] = data_rows
        _cache_ts = now
        logger.info("Fetched %d milestone rows from Google Sheet", len(data_rows))
        return data_rows
    except Exception:
        logger.exception("Failed to fetch Google Sheet data")
        return []


def _safe_get(row: list[str], col_idx: int) -> str:
    """Safely get a column value from a row, returning '' if missing."""
    if col_idx < len(row):
        return row[col_idx].strip()
    return ""


def _parse_milestone(row: list[str]) -> dict[str, Any]:
    """Parse a sheet row into a structured milestone dict."""
    milestone: dict[str, Any] = {
        "contact_id": _safe_get(row, COL["contact_id"]),
        "contact_email": _safe_get(row, COL["contact_email"]),
        "client_id": _safe_get(row, COL["client_id"]),
        "entry_id": _safe_get(row, COL["entry_id"]),
        "entry_date": _safe_get(row, COL["entry_date"]),
        "categories": [],
    }

    # ── Employees
    delta_ft = _safe_get(row, COL["delta_ft"])
    delta_pt = _safe_get(row, COL["delta_pt"])
    if delta_ft or delta_pt or _safe_get(row, COL["total_ft"]):
        milestone["employees"] = {
            "initial_ft": _safe_get(row, COL["init_ft"]),
            "total_ft": _safe_get(row, COL["total_ft"]),
            "delta_ft": delta_ft,
            "initial_pt": _safe_get(row, COL["init_pt"]),
            "total_pt": _safe_get(row, COL["total_pt"]),
            "delta_pt": delta_pt,
        }
        milestone["categories"].append("New Employees")

    # ── Sales
    gross_rev = _safe_get(row, COL["gross_revenue"])
    delta_rev = _safe_get(row, COL["delta_revenue"])
    if gross_rev or delta_rev:
        milestone["sales"] = {
            "initial_sales": _safe_get(row, COL["init_sales"]),
            "gross_revenue": gross_rev,
            "delta_revenue": delta_rev,
        }
        milestone["categories"].append("Increased Sales")

    # ── New Business
    biz_verified = _safe_get(row, COL["biz_start_verified"])
    if biz_verified:
        milestone["new_business"] = {
            "verified": biz_verified,
            "legal_structure": _safe_get(row, COL["legal_structure"]),
            "start_date": _safe_get(row, COL["biz_start_date"]),
        }
        milestone["categories"].append("Started a Business")

    # ── Capital Funding
    amount = _safe_get(row, COL["amount_approved"])
    funding_type = _safe_get(row, COL["funding_type"])
    if amount or funding_type:
        milestone["funding"] = {
            "type": funding_type,
            "institution": _safe_get(row, COL["institution"]),
            "amount": amount,
            "date": _safe_get(row, COL["funding_date"]),
        }
        milestone["categories"].append("Business Funded")

    # ── Testimonial (in notes fields)
    notes = (
        _safe_get(row, COL["funding_notes"])
        or _safe_get(row, COL["sales_notes"])
        or _safe_get(row, COL["biz_notes"])
        or _safe_get(row, COL["emp_notes"])
    )
    if notes:
        milestone["testimonial"] = notes

    # Signature
    sig = (
        _safe_get(row, COL["funding_sig"])
        or _safe_get(row, COL["sales_sig"])
        or _safe_get(row, COL["biz_sig"])
        or _safe_get(row, COL["emp_sig"])
    )
    if sig:
        milestone["signature"] = sig

    return milestone


# ─── Public API ─────────────────────────────────────────────────

def get_milestones_for_client(client_id: str) -> list[dict[str, Any]]:
    """Return all milestone submissions for a given Neoserra client ID.

    The client_id should match the value in column C of the Google Sheet
    (the Neoserra Client ID selected in the Gravity Form).
    """
    if not _is_configured():
        return []

    rows = _fetch_all_rows()
    client_id_clean = client_id.strip()

    results = []
    for row in rows:
        row_client_id = _safe_get(row, COL["client_id"])
        if row_client_id == client_id_clean:
            results.append(_parse_milestone(row))

    # Sort by entry date descending (newest first)
    results.sort(key=lambda m: m.get("entry_date", ""), reverse=True)
    return results


def is_configured() -> bool:
    """Check if Google Sheets integration is configured."""
    return _is_configured()


def clear_cache():
    """Clear the in-memory cache."""
    global _cache, _cache_ts
    _cache = {}
    _cache_ts = 0.0
