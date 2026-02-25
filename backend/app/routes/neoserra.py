"""
Neoserra CRM API routes — the "Window" and "Door" for SBDC advisors.

Provides search, record lookup, and write operations for:
  - Contacts & Clients (search by email, get by ID, update, create)
  - Centers (list active centers)
  - Counselors (get by ID)
  - Events / Attendees / Trainers (get by ID, list attendees)
  - Counseling sessions (get, create)
  - Milestones (get, create)
  - Capital funding / investments (get, create)
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..services import neoserra_client as neo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/neoserra", tags=["neoserra"])


# ─── Request/Response Schemas ──────────────────────────────────

class NeoserraStatus(BaseModel):
    configured: bool
    base_url: str


class SearchResult(BaseModel):
    contacts: list[dict]
    clients: list[dict]


class RecordResponse(BaseModel):
    data: Optional[dict] = None
    error: Optional[str] = None


class ListResponse(BaseModel):
    data: list[dict]
    count: int


class WriteResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


# ─── Health / Status ───────────────────────────────────────────

@router.get("/status", response_model=NeoserraStatus)
async def neoserra_status():
    """Check if the Neoserra API is configured."""
    from ..config import NEOSERRA_BASE_URL
    return NeoserraStatus(
        configured=neo.is_configured(),
        base_url=NEOSERRA_BASE_URL,
    )


# ─── Search ────────────────────────────────────────────────────

@router.get("/search", response_model=SearchResult)
async def search(
    email: str = Query(..., min_length=3, description="Email address to search"),
):
    """Search contacts and clients by email. This is the primary entry point
    since the Neoserra API only supports email-based lookups."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    contacts = await neo.search_contacts(email)
    clients = await neo.search_clients(email)
    return SearchResult(contacts=contacts, clients=clients)


# ─── Centers ───────────────────────────────────────────────────

@router.get("/centers", response_model=ListResponse)
async def list_centers():
    """List all active SBDC centers (cached 24h)."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    centers = await neo.get_all_centers()
    return ListResponse(data=centers, count=len(centers))


@router.get("/centers/{center_id}", response_model=RecordResponse)
async def get_center(center_id: int):
    """Get a single center by ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_center(center_id)
    if not data:
        raise HTTPException(404, f"Center {center_id} not found")
    return RecordResponse(data=data)


# ─── Contacts ──────────────────────────────────────────────────

@router.get("/contacts/{contact_id}", response_model=RecordResponse)
async def get_contact(contact_id: str):
    """Get a contact by Neoserra reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_contact(contact_id)
    if not data:
        raise HTTPException(404, f"Contact {contact_id} not found")
    return RecordResponse(data=data)


@router.post("/contacts/{contact_id}", response_model=WriteResponse)
async def update_contact(contact_id: str, fields: dict):
    """Update a contact record."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.update_contact(contact_id, fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


@router.post("/contacts/new", response_model=WriteResponse)
async def create_contact(fields: dict):
    """Create a new contact record."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.create_contact(fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


@router.get("/contacts/{contact_id}/clients", response_model=ListResponse)
async def get_contact_clients(contact_id: str):
    """Get all clients linked to a contact."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_clients_for_contact(contact_id)
    return ListResponse(data=data, count=len(data))


# ─── Clients ──────────────────────────────────────────────────

@router.get("/clients/{client_id}", response_model=RecordResponse)
async def get_client(client_id: str):
    """Get a client by Neoserra reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_client(client_id)
    if not data:
        raise HTTPException(404, f"Client {client_id} not found")
    return RecordResponse(data=data)


@router.post("/clients/{client_id}", response_model=WriteResponse)
async def update_client(client_id: str, fields: dict):
    """Update a client record."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.update_client(client_id, fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


@router.post("/clients/new", response_model=WriteResponse)
async def create_client(fields: dict):
    """Create a new client record (can embed contact for single-call creation)."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.create_client(fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


@router.get("/clients/{client_id}/contacts", response_model=ListResponse)
async def get_client_contacts(client_id: str):
    """Get all contacts linked to a client."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_contacts_for_client(client_id)
    return ListResponse(data=data, count=len(data))


@router.get("/clients/{client_id}/profile")
async def get_client_profile(client_id: str):
    """Get an enriched client profile: client record + resolved counselor name + linked contacts.

    This powers the comprehensive "Client Profile" view in the frontend.
    """
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    import asyncio

    client = await neo.get_client(client_id)
    if not client:
        raise HTTPException(404, f"Client {client_id} not found")

    # Fetch contacts in parallel with counselor (if assigned)
    contacts_task = neo.get_contacts_for_client(client_id)
    counselor_id = client.get("counselId")
    counselor_task = neo.get_counselor(str(counselor_id)) if counselor_id else None

    if counselor_task:
        contacts, counselor = await asyncio.gather(
            contacts_task, counselor_task, return_exceptions=True
        )
    else:
        contacts = await contacts_task
        counselor = None

    if isinstance(contacts, Exception):
        contacts = []

    counselor_name = None
    if counselor and isinstance(counselor, dict):
        counselor_name = f"{counselor.get('first', '')} {counselor.get('last', '')}".strip() or None

    return {
        "client": client,
        "contacts": contacts,
        "counselorName": counselor_name,
    }


# ─── Counselors ────────────────────────────────────────────────

@router.get("/counselors/{counselor_id}", response_model=RecordResponse)
async def get_counselor(counselor_id: str):
    """Get a counselor by reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_counselor(counselor_id)
    if not data:
        raise HTTPException(404, f"Counselor {counselor_id} not found")
    return RecordResponse(data=data)


# ─── Events (Neoserra training events) ────────────────────────

@router.get("/events/{event_id}", response_model=RecordResponse)
async def get_event(event_id: str):
    """Get a Neoserra training event by reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_event(event_id)
    if not data:
        raise HTTPException(404, f"Event {event_id} not found")
    return RecordResponse(data=data)


@router.get("/events/{event_id}/attendees", response_model=ListResponse)
async def get_event_attendees(event_id: str):
    """Get all attendees registered for a training event."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_event_attendees(event_id)
    return ListResponse(data=data, count=len(data))


@router.get("/events/{event_id}/trainers", response_model=ListResponse)
async def get_event_trainers(event_id: str):
    """Get all trainers/presenters for a training event."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_event_trainers(event_id)
    return ListResponse(data=data, count=len(data))


@router.post("/events/{event_id}/attendees/{contact_id}", response_model=WriteResponse)
async def register_attendee(event_id: str, contact_id: str, fields: dict):
    """Register a contact as an attendee for a training event."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.register_attendee(event_id, contact_id, fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


# ─── Counseling ────────────────────────────────────────────────

@router.get("/counseling/{session_id}", response_model=RecordResponse)
async def get_counseling(session_id: str):
    """Get a counseling session by reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_counseling(session_id)
    if not data:
        raise HTTPException(404, f"Counseling session {session_id} not found")
    return RecordResponse(data=data)


@router.post("/counseling/new", response_model=WriteResponse)
async def create_counseling(fields: dict):
    """Create a new counseling session."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.create_counseling(fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


# ─── Milestones ────────────────────────────────────────────────

@router.get("/milestones/{milestone_id}", response_model=RecordResponse)
async def get_milestone(milestone_id: str):
    """Get a milestone by reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_milestone(milestone_id)
    if not data:
        raise HTTPException(404, f"Milestone {milestone_id} not found")
    return RecordResponse(data=data)


@router.post("/milestones/new", response_model=WriteResponse)
async def create_milestone(fields: dict):
    """Create a new milestone."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.create_milestone(fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


# ─── Capital Funding / Investments ─────────────────────────────

@router.get("/investments/{investment_id}", response_model=RecordResponse)
async def get_investment(investment_id: str):
    """Get a capital funding record by reference ID."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    data = await neo.get_investment(investment_id)
    if not data:
        raise HTTPException(404, f"Investment {investment_id} not found")
    return RecordResponse(data=data)


@router.post("/investments/new", response_model=WriteResponse)
async def create_investment(fields: dict):
    """Create a new capital funding record."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    result = await neo.create_investment(fields)
    if result and result.get("_error"):
        return WriteResponse(success=False, error=str(result))
    return WriteResponse(success=True, data=result)


# ─── Milestone History (via Google Sheets) ────────────────────

@router.get("/clients/{client_id}/milestones")
async def get_client_milestones(client_id: str):
    """Return milestone submission history for a client.

    Reads from the Google Sheet that the Gravity Forms milestone
    reporting form feeds into — a workaround for the Neoserra API
    not supporting listing milestones by client.
    """
    from ..services import google_sheets as gsheets

    if not gsheets.is_configured():
        return {
            "configured": False,
            "milestones": [],
            "count": 0,
            "message": "Google Sheets integration not configured. Set GOOGLE_SHEET_ID and GOOGLE_SHEETS_CREDENTIALS env vars.",
        }

    milestones = gsheets.get_milestones_for_client(client_id)
    return {
        "configured": True,
        "milestones": milestones,
        "count": len(milestones),
    }


# ─── Network Dashboard ────────────────────────────────────────

@router.get("/dashboard/debug")
async def debug_dashboard():
    """Test which Neoserra API queries work and inspect field names.

    Hit this endpoint to see raw results so we can fix the dashboard.
    """
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    from datetime import datetime, timedelta
    from ..services.neoserra_client import _get, _unwrap_rows

    neo.clear_all_cache()

    d90 = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    # Test queries ONE AT A TIME (to avoid rate limiting)
    queries = [
        ("clients_no_filter", "clients", None),
        ("clients_type2_AC", "clients", {"type2": "AC"}),
        ("clients_started_90d", "clients", {"started": d90}),
        ("events_no_filter", "events", None),
        ("events_confstatus_OP", "events", {"confstatus": "OP"}),
        ("events_startDate_90d", "events", {"startDate": d90}),
        ("investments_no_filter", "investments", None),
        ("investments_status_A", "investments", {"status": "A"}),
        ("counselors_no_filter", "counselors", None),
        ("counselors_status_A", "counselors", {"status": "A"}),
    ]

    results = {}
    for label, endpoint, params in queries:
        try:
            raw = await _get(endpoint, params=params)
            rows = _unwrap_rows(raw)
            sample_fields = sorted(rows[0].keys()) if rows else []
            results[label] = {
                "count": len(rows),
                "raw_type": type(raw).__name__ if raw is not None else "None",
                "has_rows_key": isinstance(raw, dict) and "rows" in raw,
                "sample_fields": sample_fields,
                "first_record": rows[0] if rows else None,
            }
        except Exception as e:
            results[label] = {"error": str(e)}

    return results


@router.get("/dashboard")
async def get_dashboard():
    """Return aggregated network dashboard data.

    Based on Neoserra API capabilities discovered via debug:
      - clients?started=DATE → returns {clientId, client, company, fkey}
      - events?confstatus=OP → returns {id, date, fkey}
      - counselors?status=A  → returns {fkey}  (count only)
      - No-filter queries return null; investments listing not supported.

    Strategy: use working queries for counts, match client ID prefixes
    to centers via clientidmask, hydrate a batch of events for details.
    """
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    import asyncio
    from datetime import datetime, timedelta

    now = datetime.now()
    d30 = (now - timedelta(days=30)).strftime("%Y-%m-%d")
    d90 = (now - timedelta(days=90)).strftime("%Y-%m-%d")
    d365 = (now - timedelta(days=365)).strftime("%Y-%m-%d")

    # ── Batch 1: centers (cached) + 30d and 90d clients ──
    centers, clients_30, clients_90 = await asyncio.gather(
        neo.get_all_centers(),
        neo.list_clients({"started": d30}),
        neo.list_clients({"started": d90}),
        return_exceptions=True,
    )

    # ── Batch 2: events + counselors ──
    open_events, counselors = await asyncio.gather(
        neo.list_events({"confstatus": "OP"}),
        neo.list_counselors({"status": "A"}),
        return_exceptions=True,
    )

    # ── Batch 3: 12mo clients (with delay to avoid rate limiting) ──
    await asyncio.sleep(1.5)
    clients_12mo = await neo.list_clients({"started": d365})

    def safe_list(val):
        if isinstance(val, Exception):
            logger.warning("Dashboard query failed: %s", val)
            return []
        return val if isinstance(val, list) else []

    centers = safe_list(centers)
    clients_30 = safe_list(clients_30)
    clients_90 = safe_list(clients_90)
    clients_12mo = safe_list(clients_12mo)  # already a list from await
    open_events = safe_list(open_events)
    counselors = safe_list(counselors)

    # ── Build center prefix map from clientidmask ──
    # e.g., clientidmask "SCV######" → prefix "SCV" → center_id 71
    prefix_to_center: dict[str, dict] = {}
    for c in centers:
        mask = c.get("clientidmask", "")
        if mask:
            # Extract letter prefix from mask like "SCV######" or "PG######"
            prefix = ""
            for ch in mask:
                if ch.isalpha():
                    prefix += ch
                else:
                    break
            if prefix:
                prefix_to_center[prefix] = c

    def get_center_for_client(client_code: str) -> dict | None:
        """Match a client code like 'SCV025859' to a center via prefix."""
        if not client_code:
            return None
        prefix = ""
        for ch in client_code:
            if ch.isalpha():
                prefix += ch
            else:
                break
        return prefix_to_center.get(prefix)

    # ── Per-center breakdown using client ID prefix matching ──
    # Use the 90-day client list (largest useful set) for center stats
    center_client_counts: dict[int, dict] = {}
    for c in centers:
        cid = c.get("id")
        center_client_counts[cid] = {
            "new_30d": 0, "new_90d": 0, "new_12mo": 0,
        }

    # Count 90d clients by center
    for cl in clients_90:
        matched = get_center_for_client(cl.get("client", ""))
        if matched:
            cid = matched["id"]
            if cid in center_client_counts:
                center_client_counts[cid]["new_90d"] += 1

    # Count 30d clients by center
    for cl in clients_30:
        matched = get_center_for_client(cl.get("client", ""))
        if matched:
            cid = matched["id"]
            if cid in center_client_counts:
                center_client_counts[cid]["new_30d"] += 1

    # Count 12mo clients by center
    for cl in clients_12mo:
        matched = get_center_for_client(cl.get("client", ""))
        if matched:
            cid = matched["id"]
            if cid in center_client_counts:
                center_client_counts[cid]["new_12mo"] += 1

    center_stats = []
    for c in centers:
        cid = c.get("id")
        counts = center_client_counts.get(cid, {})
        # Only include centers that have any activity
        n30 = counts.get("new_30d", 0)
        n90 = counts.get("new_90d", 0)
        n12 = counts.get("new_12mo", 0)
        center_stats.append({
            "id": cid,
            "name": c.get("centerName", "Unknown"),
            "new_clients_30d": n30,
            "new_clients_90d": n90,
            "new_clients_12mo": n12,
        })
    # Sort by best available metric, filter out zeros
    center_stats.sort(
        key=lambda x: (x["new_clients_12mo"], x["new_clients_90d"], x["new_clients_30d"]),
        reverse=True,
    )
    center_stats = [c for c in center_stats if c["new_clients_90d"] > 0 or c["new_clients_12mo"] > 0]

    # ── Hydrate top events for training leaderboard ──
    # The list only has {id, date, fkey} — fetch full records for details.
    # Limit to 30 events to avoid hammering the API.
    events_to_hydrate = open_events[:30]
    hydrated_events = []
    if events_to_hydrate:
        # Batch hydration in groups of 10
        for batch_start in range(0, len(events_to_hydrate), 10):
            batch = events_to_hydrate[batch_start:batch_start + 10]
            batch_results = await asyncio.gather(
                *(neo.get_event(str(ev.get("id", ""))) for ev in batch),
                return_exceptions=True,
            )
            for ev_data in batch_results:
                if isinstance(ev_data, Exception) or ev_data is None:
                    continue
                hydrated_events.append(ev_data)

    # Build training leaderboard from hydrated events
    def _int(val) -> int:
        if not val:
            return 0
        try:
            return int(val)
        except (ValueError, TypeError):
            return 0

    training_board = []
    for ev in hydrated_events:
        attended = _int(ev.get("attTot"))
        training_board.append({
            "id": ev.get("_ref", ev.get("id", "")),
            "title": ev.get("title", "Untitled"),
            "startDate": ev.get("startDate", ev.get("date", "")),
            "endDate": ev.get("endDate", ""),
            "center_id": ev.get("centerId", ""),
            "status": ev.get("confstatus", ""),
            "format": ev.get("format", ""),
            "topic": ev.get("topic", ""),
            "attended": attended,
            "max_attendees": ev.get("maxAttendees", ""),
            # Demographics
            "att_women": _int(ev.get("attWom")),
            "att_minorities": _int(ev.get("attMin")),
            "att_veterans": _int(ev.get("attVets")),
            "att_startups": _int(ev.get("attStp")),
            "att_in_business": _int(ev.get("attInbus")),
        })
    training_board.sort(key=lambda x: (x["attended"], x["startDate"]), reverse=True)

    # Build upcoming events list from hydrated data
    upcoming = []
    for ev in hydrated_events:
        upcoming.append({
            "id": ev.get("_ref", ev.get("id", "")),
            "title": ev.get("title", "Untitled"),
            "startDate": ev.get("startDate", ev.get("date", "")),
            "center_id": ev.get("centerId", ""),
            "format": ev.get("format", ""),
            "status": ev.get("confstatus", ""),
        })
    upcoming.sort(key=lambda x: x["startDate"])

    return {
        "overview": {
            "total_active_clients": len(clients_12mo),  # best proxy: all clients in last 12mo
            "new_clients_30d": len(clients_30),
            "new_clients_90d": len(clients_90),
            "new_clients_12mo": len(clients_12mo),
            "total_centers": len(centers),
            "active_counselors": len(counselors),
            "upcoming_events": len(open_events),
            "total_capital_funded": 0,  # investments listing not supported by API
            "total_investments": 0,
        },
        "center_stats": center_stats,
        "training_leaderboard": training_board[:25],
        "upcoming_events": upcoming[:15],
        "capital": {
            "total_funded": 0,
            "investment_count": 0,
            "by_type": [],
        },
    }


# ─── Cache Management ─────────────────────────────────────────

@router.post("/cache/clear")
async def clear_cache():
    """Clear the entire Neoserra cache (admin use)."""
    neo.clear_all_cache()

    # Also clear Google Sheets cache
    from ..services import google_sheets as gsheets
    gsheets.clear_cache()

    return {"status": "ok", "message": "Cache cleared"}


# ─── Debug (temporary — remove after field mapping is confirmed) ──

@router.get("/debug/search")
async def debug_search(
    email: str = Query(..., min_length=3),
):
    """Return raw, unprocessed API responses for debugging field names."""
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    from ..services.neoserra_client import _get

    # Clear cache first so we get fresh data
    neo.clear_all_cache()

    # Raw responses — no hydration, no processing
    raw_contact = await _get("contacts", params={"email": email})
    raw_client_email = await _get("clients", params={"email": email})
    raw_client_bus = await _get("clients", params={"busemail": email})

    # Also try fetching by _ref if the search returned one
    hydrated_contact = None
    if raw_contact:
        items = raw_contact if isinstance(raw_contact, list) else [raw_contact]
        if items and items[0]:
            ref = items[0].get("_ref") or items[0].get("id")
            if ref:
                hydrated_contact = await _get(f"contacts/{ref}")

    hydrated_client = None
    for raw in [raw_client_email, raw_client_bus]:
        if raw:
            items = raw if isinstance(raw, list) else [raw]
            if items and items[0]:
                ref = items[0].get("_ref") or items[0].get("id") or items[0].get("client")
                if ref:
                    hydrated_client = await _get(f"clients/{ref}")
                    break

    return {
        "raw_contact_search": raw_contact,
        "raw_client_search_email": raw_client_email,
        "raw_client_search_busemail": raw_client_bus,
        "hydrated_contact": hydrated_contact,
        "hydrated_client": hydrated_client,
    }


@router.get("/debug/probe-client-records")
async def probe_client_records(
    client_id: str = Query(..., description="Client reference ID (internal Neoserra ID)"),
    client_code: str = Query("", description="Optional visible client ID code (e.g. 'NC-12345')"),
):
    """Probe the Neoserra API to discover undocumented ways to list
    counseling sessions, milestones, and investments for a client.

    Tries every reasonable URL pattern and query parameter combination.
    Returns what worked (non-null, non-404 responses).
    """
    if not neo.is_configured():
        raise HTTPException(503, "Neoserra API not configured")

    from ..services.neoserra_client import _get
    import asyncio

    neo.clear_all_cache()

    # Build list of (label, endpoint, params) to try
    probes: list[tuple[str, str, dict | None]] = []

    # IDs to try in URL paths and params
    ids_to_try = [client_id]
    if client_code:
        ids_to_try.append(client_code)

    for cid in ids_to_try:
        id_label = f"[{cid}]"

        # ── Counseling: query-param approaches ──
        for param in ["client", "clientId", "clients", "client_id"]:
            probes.append((
                f"counseling?{param}={cid}",
                "counseling",
                {param: cid},
            ))

        # ── Counseling: URL-path approaches (maybe it acts like a linkage) ──
        probes.append((f"counseling/{cid} (as path)", f"counseling/{cid}", None))

        # ── Milestones: query-param approaches ──
        for param in ["client", "clientId", "clients", "client_id"]:
            probes.append((
                f"milestones?{param}={cid}",
                "milestones",
                {param: cid},
            ))
        probes.append((f"milestones/{cid} (as path)", f"milestones/{cid}", None))

        # ── Investments: query-param approaches ──
        for param in ["client", "clientId", "clients", "client_id"]:
            probes.append((
                f"investments?{param}={cid}",
                "investments",
                {param: cid},
            ))
        probes.append((f"investments/{cid} (as path)", f"investments/{cid}", None))

    # ── Also try linkage-style patterns (like relationships but for other types) ──
    for cid in ids_to_try:
        for linkage in ["counseling", "milestones", "investments", "sessions", "activities"]:
            probes.append((
                f"clients/{cid}/{linkage} (nested)",
                f"clients/{cid}/{linkage}",
                None,
            ))

    # Execute all probes in parallel (batches of 10 to not hammer the API)
    results = {}
    for batch_start in range(0, len(probes), 10):
        batch = probes[batch_start:batch_start + 10]
        responses = await asyncio.gather(
            *(_get(endpoint, params=params) for _, endpoint, params in batch),
            return_exceptions=True,
        )
        for (label, endpoint, params), resp in zip(batch, responses):
            if isinstance(resp, Exception):
                results[label] = {"_error": str(resp)}
            elif resp is None:
                results[label] = None  # 404 or failed
            else:
                # Got data! Mark it as a hit
                results[label] = resp

    # Separate hits from misses
    hits = {k: v for k, v in results.items() if v is not None and not (isinstance(v, dict) and v.get("_error"))}
    misses = [k for k, v in results.items() if v is None]

    return {
        "client_id": client_id,
        "client_code": client_code,
        "total_probes": len(probes),
        "hits": hits,
        "hit_count": len(hits),
        "misses": misses,
        "miss_count": len(misses),
    }
