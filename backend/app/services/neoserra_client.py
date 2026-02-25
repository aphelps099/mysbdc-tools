"""
Neoserra CRM API client with TTL-based in-memory caching.

The Neoserra API (norcal.neoserra.com/api/v1/) is record-level — there are
no bulk list endpoints with pagination.  Lookups are by:
  - Reference ID (internal Neoserra ID)
  - Email search (?email=...)
  - Linkage enumeration (attendees for an event, contacts for a client, etc.)

This client wraps all supported operations and caches GET responses in memory
with configurable TTLs per entity type.  Write operations invalidate the
relevant cache entries.
"""

import asyncio
import logging
import time
from typing import Any, Optional

import httpx

from ..config import NEOSERRA_BASE_URL, NEOSERRA_API_TOKEN

logger = logging.getLogger(__name__)

# ─── Cache Configuration ────────────────────────────────────────

TTL_CENTERS = 86400       # 24 hours — read-only, rarely changes
TTL_COUNSELORS = 3600     # 1 hour
TTL_CONTACTS = 900        # 15 minutes
TTL_CLIENTS = 900         # 15 minutes
TTL_EVENTS = 1800         # 30 minutes
TTL_SEARCH = 300          # 5 minutes for search results
TTL_LINKAGES = 600        # 10 minutes for relationships/attendees

_cache: dict[str, tuple[float, Any]] = {}


def _cache_get(key: str, ttl: int) -> Optional[Any]:
    if key in _cache:
        cached_at, data = _cache[key]
        if time.time() - cached_at < ttl:
            return data
        del _cache[key]
    return None


def _cache_set(key: str, data: Any):
    _cache[key] = (time.time(), data)


def _cache_invalidate(prefix: str):
    keys_to_remove = [k for k in _cache if k.startswith(prefix)]
    for k in keys_to_remove:
        del _cache[k]


# ─── HTTP Client ────────────────────────────────────────────────

def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {NEOSERRA_API_TOKEN}",
        "Accept": "application/json",
        "User-Agent": "SBDC-Advisor/1.0",
    }


async def _get(endpoint: str, params: Optional[dict] = None) -> Optional[dict | list]:
    """Make a GET request to the Neoserra API."""
    url = f"{NEOSERRA_BASE_URL}/{endpoint}"
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(url, headers=_headers(), params=params)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 404:
                logger.info("Neoserra 404: %s", endpoint)
                return None
            logger.warning("Neoserra GET %s → %s: %s", endpoint, resp.status_code, resp.text[:300])
            return None
    except Exception as exc:
        logger.error("Neoserra GET %s error: %s", endpoint, exc)
        return None


def _unwrap_rows(data: Optional[dict | list]) -> list[dict]:
    """Unwrap the Neoserra {rows: [...], rowCount: N} envelope into a flat list.

    The Neoserra API wraps search/list results in:
      {"rows": [{...}, ...], "rowCount": "N"}
    Single-record GETs return a flat dict.  This helper normalises both.
    """
    if data is None:
        return []
    if isinstance(data, list):
        return data
    # Envelope with rows key
    if "rows" in data and isinstance(data["rows"], list):
        return data["rows"]
    # Single record dict
    return [data]


async def _post(endpoint: str, data: dict) -> Optional[dict]:
    """Make a POST request to the Neoserra API."""
    url = f"{NEOSERRA_BASE_URL}/{endpoint}"
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.post(
                url,
                headers={**_headers(), "Content-Type": "application/json"},
                json=data,
            )
            result = resp.json()
            if resp.status_code == 200:
                return result
            logger.warning("Neoserra POST %s → %s: %s", endpoint, resp.status_code, resp.text[:500])
            return {"_error": True, "_status": resp.status_code, **result}
    except Exception as exc:
        logger.error("Neoserra POST %s error: %s", endpoint, exc)
        return {"_error": True, "_message": str(exc)}


# ─── Centers (read-only) ───────────────────────────────────────

# Scan IDs 1-200 to discover all centers (404s are cheap and cached).
_CENTER_SCAN_MAX = 200


async def get_center(center_id: int) -> Optional[dict]:
    """Get a center by ID (cached 24h)."""
    key = f"center:{center_id}"
    cached = _cache_get(key, TTL_CENTERS)
    if cached is not None:
        return cached
    data = await _get(f"centers/{center_id}")
    if data:
        _cache_set(key, data)
    return data


async def get_all_centers() -> list[dict]:
    """Fetch all centers (scan 1-200 in parallel), returning only active ones."""
    key = "centers:all"
    cached = _cache_get(key, TTL_CENTERS)
    if cached is not None:
        return cached

    # Fetch all IDs in parallel (batches of 20 to avoid overwhelming the API)
    centers = []
    for batch_start in range(1, _CENTER_SCAN_MAX + 1, 20):
        batch_ids = range(batch_start, min(batch_start + 20, _CENTER_SCAN_MAX + 1))
        batch_results = await asyncio.gather(
            *(get_center(cid) for cid in batch_ids)
        )
        for cid, c in zip(batch_ids, batch_results):
            if c and c.get("visibility") in ("Y", "P"):
                centers.append({
                    "id": cid,
                    "centerName": c.get("centerName", ""),
                    "visibility": c.get("visibility", ""),
                    "centerType": c.get("centerType", ""),
                    "clientidmask": c.get("clientidmask", ""),
                    "email": c.get("email", ""),
                    "phone": c.get("phone", ""),
                    "dirname": c.get("dirname", ""),
                    "diremail": c.get("diremail", ""),
                    "url": c.get("url", ""),
                })
    _cache_set(key, centers)
    return centers


# ─── Contacts ──────────────────────────────────────────────────

async def search_contacts(email: str) -> list[dict]:
    """Search contacts by email address.

    Neoserra returns: {"rows": [{"indivId":..., "first":..., "last":...}], "rowCount":"N"}
    We unwrap the rows envelope and normalise the ID field.
    """
    key = f"search:contact:{email.lower()}"
    cached = _cache_get(key, TTL_SEARCH)
    if cached is not None:
        return cached
    data = await _get("contacts", params={"email": email})
    logger.info("search_contacts(%s) raw response: %s", email, str(data)[:500])
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def get_contact(contact_id: str) -> Optional[dict]:
    """Get a single contact by reference ID."""
    key = f"contact:{contact_id}"
    cached = _cache_get(key, TTL_CONTACTS)
    if cached is not None:
        return cached
    data = await _get(f"contacts/{contact_id}")
    if data:
        _cache_set(key, data)
    return data


async def update_contact(contact_id: str, fields: dict) -> Optional[dict]:
    """Update a contact record."""
    result = await _post(f"contacts/{contact_id}", fields)
    _cache_invalidate(f"contact:{contact_id}")
    _cache_invalidate("search:contact:")
    return result


async def create_contact(fields: dict) -> Optional[dict]:
    """Create a new contact record."""
    result = await _post("contacts/new", fields)
    _cache_invalidate("search:contact:")
    return result


# ─── Clients ───────────────────────────────────────────────────

async def search_clients(email: str) -> list[dict]:
    """Search clients by email address.

    Neoserra returns: {"rows": [{"clientId":..., "company":...}], "rowCount":"N"}
    The ?email= param works for client search (not ?busemail=).
    """
    key = f"search:client:{email.lower()}"
    cached = _cache_get(key, TTL_SEARCH)
    if cached is not None:
        return cached
    data = await _get("clients", params={"email": email})
    logger.info("search_clients(%s) raw response: %s", email, str(data)[:500])
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def get_client(client_id: str) -> Optional[dict]:
    """Get a single client by reference ID."""
    key = f"client:{client_id}"
    cached = _cache_get(key, TTL_CLIENTS)
    if cached is not None:
        return cached
    data = await _get(f"clients/{client_id}")
    if data:
        _cache_set(key, data)
    return data


async def update_client(client_id: str, fields: dict) -> Optional[dict]:
    """Update a client record."""
    result = await _post(f"clients/{client_id}", fields)
    _cache_invalidate(f"client:{client_id}")
    _cache_invalidate("search:client:")
    return result


async def create_client(fields: dict) -> Optional[dict]:
    """Create a new client record (can include embedded contact)."""
    result = await _post("clients/new", fields)
    _cache_invalidate("search:client:")
    _cache_invalidate("search:contact:")
    return result


# ─── Relationships (Client ↔ Contact) ─────────────────────────

async def get_contacts_for_client(client_id: str) -> list[dict]:
    """Get all contacts linked to a client."""
    key = f"rel:client:{client_id}"
    cached = _cache_get(key, TTL_LINKAGES)
    if cached is not None:
        return cached
    data = await _get(f"relationships/{client_id}")
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def get_clients_for_contact(contact_id: str) -> list[dict]:
    """Get all clients linked to a contact (reverse lookup)."""
    key = f"rel:contact:{contact_id}"
    cached = _cache_get(key, TTL_LINKAGES)
    if cached is not None:
        return cached
    data = await _get(f"relationships/{contact_id}", params={"reverse": "1"})
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


# ─── Counselors ────────────────────────────────────────────────

async def get_counselor(counselor_id: str) -> Optional[dict]:
    """Get a counselor by reference ID."""
    key = f"counselor:{counselor_id}"
    cached = _cache_get(key, TTL_COUNSELORS)
    if cached is not None:
        return cached
    data = await _get(f"counselors/{counselor_id}")
    if data:
        _cache_set(key, data)
    return data


# ─── Events (Neoserra training events) ────────────────────────

async def get_event(event_id: str) -> Optional[dict]:
    """Get a training event by reference ID."""
    key = f"event:{event_id}"
    cached = _cache_get(key, TTL_EVENTS)
    if cached is not None:
        return cached
    data = await _get(f"events/{event_id}")
    if data:
        _cache_set(key, data)
    return data


async def get_event_attendees(event_id: str) -> list[dict]:
    """Get all attendees for a training event."""
    key = f"attendees:{event_id}"
    cached = _cache_get(key, TTL_LINKAGES)
    if cached is not None:
        return cached
    data = await _get(f"attendees/{event_id}")
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def get_event_trainers(event_id: str) -> list[dict]:
    """Get all trainers/presenters for a training event."""
    key = f"trainers:{event_id}"
    cached = _cache_get(key, TTL_LINKAGES)
    if cached is not None:
        return cached
    data = await _get(f"trainers/{event_id}")
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def register_attendee(event_id: str, contact_id: str, fields: dict) -> Optional[dict]:
    """Register a contact as an attendee for an event."""
    result = await _post(f"attendees/{event_id}/{contact_id}", fields)
    _cache_invalidate(f"attendees:{event_id}")
    return result


# ─── Counseling Sessions ──────────────────────────────────────

async def get_counseling(session_id: str) -> Optional[dict]:
    """Get a counseling session by reference ID."""
    key = f"counseling:{session_id}"
    cached = _cache_get(key, TTL_CONTACTS)
    if cached is not None:
        return cached
    data = await _get(f"counseling/{session_id}")
    if data:
        _cache_set(key, data)
    return data


async def create_counseling(fields: dict) -> Optional[dict]:
    """Create a new counseling session."""
    return await _post("counseling/new", fields)


# ─── Milestones ───────────────────────────────────────────────

async def get_milestone(milestone_id: str) -> Optional[dict]:
    """Get a milestone by reference ID."""
    key = f"milestone:{milestone_id}"
    cached = _cache_get(key, TTL_CONTACTS)
    if cached is not None:
        return cached
    data = await _get(f"milestones/{milestone_id}")
    if data:
        _cache_set(key, data)
    return data


async def create_milestone(fields: dict) -> Optional[dict]:
    """Create a new milestone."""
    return await _post("milestones/new", fields)


# ─── Capital Funding (Investments) ────────────────────────────

async def get_investment(investment_id: str) -> Optional[dict]:
    """Get a capital funding record by reference ID."""
    key = f"investment:{investment_id}"
    cached = _cache_get(key, TTL_CONTACTS)
    if cached is not None:
        return cached
    data = await _get(f"investments/{investment_id}")
    if data:
        _cache_set(key, data)
    return data


async def create_investment(fields: dict) -> Optional[dict]:
    """Create a new capital funding record."""
    return await _post("investments/new", fields)


# ─── Bulk Queries (list with filters) ─────────────────────────
#
# The Neoserra API supports query-parameter filtering on list endpoints.
# Results come back as {"rows": [...], "rowCount": "N"}.


async def list_clients(params: Optional[dict] = None) -> list[dict]:
    """List/search clients with optional filters.

    Useful params: type2=AC (active), started=YYYY-MM-DD, centerId=N, email=...
    """
    key = f"list:clients:{str(sorted(params.items()) if params else '')}"
    cached = _cache_get(key, TTL_SEARCH)
    if cached is not None:
        return cached
    data = await _get("clients", params=params)
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def list_events(params: Optional[dict] = None) -> list[dict]:
    """List/search training events with optional filters.

    Useful params: centerId=N, startDate=YYYY-MM-DD, confstatus=OP, topic=...
    """
    key = f"list:events:{str(sorted(params.items()) if params else '')}"
    cached = _cache_get(key, TTL_EVENTS)
    if cached is not None:
        return cached
    data = await _get("events", params=params)
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def list_investments(params: Optional[dict] = None) -> list[dict]:
    """List capital funding records with optional filters.

    Useful params: centerId=N, status=A (approved), type=..., date=YYYY-MM-DD
    """
    key = f"list:investments:{str(sorted(params.items()) if params else '')}"
    cached = _cache_get(key, TTL_SEARCH)
    if cached is not None:
        return cached
    data = await _get("investments", params=params)
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def list_milestones(params: Optional[dict] = None) -> list[dict]:
    """List milestones with optional filters.

    Useful params: centerId=N, type=..., date=YYYY-MM-DD
    """
    key = f"list:milestones:{str(sorted(params.items()) if params else '')}"
    cached = _cache_get(key, TTL_SEARCH)
    if cached is not None:
        return cached
    data = await _get("milestones", params=params)
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def list_counselors(params: Optional[dict] = None) -> list[dict]:
    """List counselors with optional filters.

    Useful params: centerId=N, status=A (active), resource=...
    """
    key = f"list:counselors:{str(sorted(params.items()) if params else '')}"
    cached = _cache_get(key, TTL_COUNSELORS)
    if cached is not None:
        return cached
    data = await _get("counselors", params=params)
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


async def list_counseling(params: Optional[dict] = None) -> list[dict]:
    """List counseling sessions with optional filters.

    Useful params: centerId=N, date=YYYY-MM-DD, type=...
    """
    key = f"list:counseling:{str(sorted(params.items()) if params else '')}"
    cached = _cache_get(key, TTL_SEARCH)
    if cached is not None:
        return cached
    data = await _get("counseling", params=params)
    results = _unwrap_rows(data)
    _cache_set(key, results)
    return results


# ─── Utility ──────────────────────────────────────────────────

def clear_all_cache():
    """Clear the entire in-memory cache."""
    _cache.clear()


def is_configured() -> bool:
    """Check if the Neoserra API is configured."""
    return bool(NEOSERRA_API_TOKEN)
