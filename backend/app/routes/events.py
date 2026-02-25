"""
NorCal SBDC Events feed — fetches upcoming events from the WordPress
REST API using Application Password authentication.

The NorCal SBDC network runs WordPress multisite with the custom
"Crown Events" plugin (by Jordan Crown).  Crown Events registers a
custom post type ``event`` (with ``show_in_rest => true``) and stores
scheduling data in post-meta:

    event_start_timestamp       "2026-02-18 09:00:00"  (local)
    event_end_timestamp         "2026-02-18 10:00:00"  (local)
    event_timezone              "America/Los_Angeles"
    event_start_timestamp_utc   "2026-02-18 17:00:00"  (UTC)
    event_end_timestamp_utc     "2026-02-18 18:00:00"  (UTC)

Syndicated (cross-site) events use post type ``event_s``.

Authentication uses WordPress Application Passwords (Basic Auth).
Set WP_APP_USER and WP_APP_PASSWORD environment variables.

Results are cached in-memory for 15 minutes.

NOTE — Crown Events does NOT call register_post_meta() so the event
meta fields won't appear in the REST response by default.  To expose
them, drop this mu-plugin into wp-content/mu-plugins/:

    <?php
    // File: wp-content/mu-plugins/expose-event-meta.php
    add_action('init', function () {
        $meta_keys = [
            'event_start_timestamp',
            'event_end_timestamp',
            'event_timezone',
            'event_start_timestamp_utc',
            'event_end_timestamp_utc',
        ];
        foreach (['event', 'event_s'] as $post_type) {
            foreach ($meta_keys as $key) {
                register_post_meta($post_type, $key, [
                    'show_in_rest' => true,
                    'single'       => true,
                    'type'         => 'string',
                ]);
            }
        }
    });

Without the mu-plugin the code still works — it falls back to parsing
dates from the rendered content and the WP post date.
"""

import base64
import html as html_mod
import logging
import os
import re
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Query

from ..models.schemas import EventItem, EventsResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/events", tags=["events"])

# ─── Configuration ───────────────────────────────────────────────

WP_BASE_URL = os.getenv("WP_BASE_URL", "https://www.norcalsbdc.org")
WP_APP_USER = os.getenv("WP_APP_USER", "AI-events")
WP_APP_PASSWORD = os.getenv("WP_APP_PASSWORD", "")

# WP REST API endpoints (Crown Events registers post type 'event'
# with show_in_rest=true; default rest_base = post type name)
_EVENTS_ENDPOINT = f"{WP_BASE_URL}/wp-json/wp/v2/event"
_SYNDICATED_ENDPOINT = f"{WP_BASE_URL}/wp-json/wp/v2/event_s"
_POST_CENTER_ENDPOINT = f"{WP_BASE_URL}/wp-json/wp/v2/post_center"

# ─── Cache ───────────────────────────────────────────────────────

_cache: dict[str, tuple[float, EventsResponse]] = {}
CACHE_TTL = 900  # 15 minutes

# Center taxonomy lookup {term_id: name}
_center_cache: dict[int, str] = {}
_center_cache_ts: float = 0


def _cache_key(page: int, per_page: int, include_syndicated: bool) -> str:
    return f"{page}:{per_page}:{include_syndicated}"


# ─── Auth headers ────────────────────────────────────────────────

def _auth_headers() -> dict[str, str]:
    """Build HTTP headers with Basic Auth from Application Password."""
    headers: dict[str, str] = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }
    user = WP_APP_USER
    password = WP_APP_PASSWORD
    if user and password:
        token = base64.b64encode(f"{user}:{password}".encode()).decode()
        headers["Authorization"] = f"Basic {token}"
    return headers


# ─── Helpers ─────────────────────────────────────────────────────

def _strip_html(text: str) -> str:
    """Remove HTML tags and decode entities."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_mod.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _truncate(text: str, length: int = 200) -> str:
    if len(text) <= length:
        return text
    return text[:length].rsplit(" ", 1)[0] + "..."


def _clean_event_content(html_content: str) -> str:
    """Strip Crown Events header chrome, nav, social sharing, disclaimers,
    and registration buttons from rendered content before extracting summary."""
    # Remove the entire event-header block (title, date badge, social, nav)
    html_content = re.sub(
        r'<div[^>]*class="[^"]*wp-block-crown-blocks-event-header[^"]*"[^>]*>.*?</div>\s*</div>\s*</div>\s*</div>',
        '', html_content, flags=re.DOTALL,
    )
    # Remove social-sharing-links blocks
    html_content = re.sub(
        r'<div[^>]*class="[^"]*social-sharing-links[^"]*"[^>]*>.*?</div>\s*</div>',
        '', html_content, flags=re.DOTALL,
    )
    # Remove expandable disclaimer blocks
    html_content = re.sub(
        r'<div[^>]*class="[^"]*expandable-content[^"]*"[^>]*>.*?</div>\s*</div>\s*</div>\s*</div>',
        '', html_content, flags=re.DOTALL,
    )
    # Remove register/button blocks
    html_content = re.sub(
        r'<p[^>]*class="[^"]*wp-block-crown-blocks-button[^"]*"[^>]*>.*?</p>',
        '', html_content, flags=re.DOTALL,
    )
    # Remove image blocks
    html_content = re.sub(
        r'<(?:div|figure)[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>.*?</(?:div|figure)>',
        '', html_content, flags=re.DOTALL,
    )
    return html_content


def _extract_registration_url(html_content: str) -> str:
    """Extract the registration URL from event content (Eventbrite, eCenter, etc.)."""
    # Look for links with "Register" button text
    m = re.search(
        r'<a[^>]+href="([^"]+)"[^>]*>.*?Register.*?</a>',
        html_content, flags=re.DOTALL | re.IGNORECASE,
    )
    if m:
        return html_mod.unescape(m.group(1))
    # Fallback: look for known registration domains
    m = re.search(
        r'href="(https?://(?:www\.)?(?:eventbrite\.com|ecenterdirect\.com|zoom\.us|bit\.ly)[^"]*)"',
        html_content, flags=re.IGNORECASE,
    )
    if m:
        return html_mod.unescape(m.group(1))
    return ""


def _format_event_date(timestamp_str: str) -> str:
    """'2026-02-18 09:00:00' → 'February 18, 2026'."""
    if not timestamp_str:
        return ""
    try:
        dt = datetime.strptime(timestamp_str[:10], "%Y-%m-%d")
        return dt.strftime("%B %d, %Y").replace(" 0", " ")
    except ValueError:
        return timestamp_str[:10]


def _format_event_time(start_str: str, end_str: str, tz_str: str = "") -> str:
    """'2026-02-18 09:00:00' + '2026-02-18 10:00:00' → '9:00 AM - 10:00 AM PT'."""
    def _t(s: str) -> str:
        if not s:
            return ""
        try:
            dt = datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
            return dt.strftime("%-I:%M %p")
        except ValueError:
            return ""

    start_t = _t(start_str)
    end_t = _t(end_str)

    # Derive a short timezone label
    tz_label = ""
    if tz_str:
        try:
            from zoneinfo import ZoneInfo
            tz = ZoneInfo(tz_str)
            tz_label = datetime.now(tz).strftime(" %Z")
        except Exception:
            pass

    if start_t and end_t:
        return f"{start_t} - {end_t}{tz_label}"
    return f"{start_t or end_t}{tz_label}"


# ─── WP REST API fetching ───────────────────────────────────────

async def _fetch_wp_events(
    endpoint: str,
    per_page: int = 100,
) -> list[dict]:
    """Fetch all published events from a WP REST endpoint."""
    headers = _auth_headers()
    all_posts: list[dict] = []
    page = 1

    try:
        async with httpx.AsyncClient(
            timeout=20, follow_redirects=True,
        ) as client:
            while True:
                resp = await client.get(
                    endpoint,
                    params={
                        "per_page": min(per_page, 100),
                        "page": page,
                        "status": "publish",
                        "_fields": "id,title,content,excerpt,link,slug,meta,date,post_center",
                    },
                    headers=headers,
                )
                if resp.status_code == 400:
                    # "rest_post_invalid_page_number" — we've gone past last page
                    break
                if resp.status_code != 200:
                    logger.warning(
                        "WP REST %s returned %s: %s",
                        endpoint, resp.status_code, resp.text[:300],
                    )
                    break

                posts = resp.json()
                if not posts:
                    break
                all_posts.extend(posts)

                # Check if there are more pages
                total_pages = int(resp.headers.get("X-WP-TotalPages", "1"))
                if page >= total_pages:
                    break
                page += 1

    except Exception as exc:
        logger.error("WP REST API error (%s): %s", endpoint, exc)

    return all_posts


async def _fetch_center_lookup() -> dict[int, str]:
    """Fetch the post_center taxonomy terms and return {id: name} mapping."""
    global _center_cache, _center_cache_ts
    now = time.time()
    if _center_cache and now - _center_cache_ts < CACHE_TTL:
        return _center_cache

    headers = _auth_headers()
    lookup: dict[int, str] = {}
    try:
        async with httpx.AsyncClient(
            timeout=15, follow_redirects=True,
        ) as client:
            resp = await client.get(
                _POST_CENTER_ENDPOINT,
                params={"per_page": 100, "_fields": "id,name"},
                headers=headers,
            )
            if resp.status_code == 200:
                for term in resp.json():
                    tid = term.get("id")
                    name = _strip_html(term.get("name", ""))
                    if tid and name:
                        lookup[tid] = name
    except Exception as exc:
        logger.error("Failed to fetch post_center taxonomy: %s", exc)

    if lookup:
        _center_cache = lookup
        _center_cache_ts = now
    return _center_cache or lookup


def _extract_date_from_text(text: str) -> str:
    """Fallback: extract a date string from rendered HTML/text content."""
    # "February 18, 2026" or "Feb 18, 2026"
    m = re.search(
        r"((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
        r"Dec(?:ember)?)\s+\d{1,2},?\s*\d{4})",
        text,
    )
    if m:
        return m.group(1)
    # ISO-ish "2026-02-18"
    m = re.search(r"(\d{4}-\d{2}-\d{2})", text)
    if m:
        try:
            dt = datetime.strptime(m.group(1), "%Y-%m-%d")
            return dt.strftime("%B %d, %Y").replace(" 0", " ")
        except ValueError:
            return m.group(1)
    return ""


def _extract_time_from_text(text: str) -> str:
    """Fallback: extract a time range from rendered HTML/text content."""
    m = re.search(
        r"(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM))\s*(?:[-–—]|to)\s*(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM))",
        text,
    )
    if m:
        return f"{m.group(1).strip()} - {m.group(2).strip()}"
    m = re.search(r"(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM))", text)
    if m:
        return m.group(1).strip()
    return ""


def _resolve_center(post: dict, center_lookup: dict[int, str]) -> str:
    """Resolve center name from post_center taxonomy term IDs."""
    term_ids = post.get("post_center", [])
    if isinstance(term_ids, list):
        for tid in term_ids:
            name = center_lookup.get(tid)
            if name:
                return name
    return "NorCal SBDC"


def _wp_post_to_event(post: dict, center_lookup: dict[int, str]) -> Optional[EventItem]:
    """Convert a WP REST API event post into our EventItem schema."""
    title_raw = post.get("title", {})
    title = title_raw.get("rendered", "") if isinstance(title_raw, dict) else str(title_raw)
    title = _strip_html(title)
    if not title:
        return None

    # Meta fields (Crown Events stores these as post meta)
    meta = post.get("meta", {}) or {}

    start_ts = ""
    end_ts = ""
    tz = ""

    if isinstance(meta, dict):
        start_ts = meta.get("event_start_timestamp", "") or ""
        end_ts = meta.get("event_end_timestamp", "") or ""
        tz = meta.get("event_timezone", "") or ""

        # If the local timestamps aren't exposed, try UTC ones
        if not start_ts:
            start_ts = meta.get("event_start_timestamp_utc", "") or ""
        if not end_ts:
            end_ts = meta.get("event_end_timestamp_utc", "") or ""

    # Description from excerpt or content
    excerpt_raw = post.get("excerpt", {})
    excerpt = excerpt_raw.get("rendered", "") if isinstance(excerpt_raw, dict) else ""
    content_raw = post.get("content", {})
    content = content_raw.get("rendered", "") if isinstance(content_raw, dict) else ""

    # Clean content: strip Crown Events chrome before extracting summary
    cleaned_content = _clean_event_content(content)
    summary_source = excerpt or cleaned_content
    summary = _truncate(_strip_html(summary_source))

    # Format date and time from meta
    date_str = _format_event_date(start_ts)
    time_str = _format_event_time(start_ts, end_ts, tz)

    # Fallback: if meta didn't give us dates, parse from content
    if not date_str:
        full_text = _strip_html(content)
        date_str = _extract_date_from_text(full_text)
        if not time_str:
            time_str = _extract_time_from_text(full_text)

    # Last resort: use the WP post date
    if not date_str:
        post_date = post.get("date", "")
        if post_date:
            date_str = _format_event_date(post_date[:10])

    # Detect cost from content
    cost = ""
    full_text_lower = _strip_html(content).lower()
    if "free" in full_text_lower:
        cost = "Free"
    elif "no cost" in full_text_lower or "no-cost" in full_text_lower:
        cost = "Free"

    event_url = post.get("link", "")

    # Extract real registration URL from content; fall back to event page
    registration_url = _extract_registration_url(content) or event_url

    # Resolve center name from taxonomy
    center = _resolve_center(post, center_lookup)

    return EventItem(
        title=title,
        center=center,
        date=date_str,
        time=time_str,
        summary=summary,
        cost=cost,
        event_url=event_url,
        registration_url=registration_url,
        image_url="",
    )


def _is_future_event(post: dict) -> bool:
    """Check if an event hasn't ended yet (based on UTC end timestamp)."""
    meta = post.get("meta", {}) or {}
    if not isinstance(meta, dict):
        return True  # Can't determine; include it

    end_utc = meta.get("event_end_timestamp_utc", "") or ""
    if not end_utc:
        # Fall back to post date
        post_date = post.get("date", "")
        if post_date:
            try:
                dt = datetime.fromisoformat(post_date.replace("Z", "+00:00"))
                return dt.replace(tzinfo=None) >= datetime.utcnow()
            except ValueError:
                pass
        return True

    try:
        end_dt = datetime.strptime(end_utc, "%Y-%m-%d %H:%M:%S")
        return end_dt >= datetime.utcnow()
    except ValueError:
        return True


def _event_sort_key(post: dict) -> str:
    """Sort key for ordering events by start time."""
    meta = post.get("meta", {}) or {}
    if isinstance(meta, dict):
        utc = meta.get("event_start_timestamp_utc", "") or ""
        if utc:
            return utc
        local = meta.get("event_start_timestamp", "") or ""
        if local:
            return local
    return post.get("date", "9999")


# ─── Endpoints ──────────────────────────────────────────────────

@router.get("/debug")
async def debug_events():
    """Debug endpoint — shows raw WP API response for troubleshooting."""
    headers = _auth_headers()
    results: dict = {
        "wp_base_url": WP_BASE_URL,
        "wp_user": WP_APP_USER,
        "has_password": bool(WP_APP_PASSWORD),
        "endpoints_tried": {},
    }

    async with httpx.AsyncClient(
        timeout=20, follow_redirects=True, http2=True,
    ) as client:
        for label, url in [
            ("event", _EVENTS_ENDPOINT),
            ("event_s", _SYNDICATED_ENDPOINT),
            ("types", f"{WP_BASE_URL}/wp-json/wp/v2/types"),
        ]:
            try:
                resp = await client.get(
                    url,
                    params={"per_page": 2, "status": "publish"} if label != "types" else {},
                    headers=headers,
                )
                body = None
                try:
                    body = resp.json()
                except Exception:
                    body = resp.text[:500]
                results["endpoints_tried"][label] = {
                    "url": url,
                    "status": resp.status_code,
                    "body_preview": body if resp.status_code != 200 else (
                        body[:2] if isinstance(body, list) else body
                    ),
                }
            except Exception as exc:
                results["endpoints_tried"][label] = {
                    "url": url,
                    "error": str(exc),
                }

    return results


@router.get("", response_model=EventsResponse)
async def list_events(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(5, ge=1, le=200, description="Events per page"),
    include_syndicated: bool = Query(True, description="Include syndicated events"),
):
    """Fetch upcoming NorCal SBDC events via WP REST API (cached 15 min)."""
    key = _cache_key(page, per_page, include_syndicated)
    now = time.time()

    if key in _cache:
        cached_at, cached_data = _cache[key]
        if now - cached_at < CACHE_TTL:
            return cached_data

    # Fetch center taxonomy lookup and events in parallel-ish fashion
    center_lookup = await _fetch_center_lookup()

    # Fetch events from WP REST API
    raw_posts = await _fetch_wp_events(_EVENTS_ENDPOINT)

    if include_syndicated:
        syndicated = await _fetch_wp_events(_SYNDICATED_ENDPOINT)
        raw_posts.extend(syndicated)

    # Filter to future events and sort by start time
    future_posts = [p for p in raw_posts if _is_future_event(p)]
    future_posts.sort(key=_event_sort_key)

    # Deduplicate by title (syndicated events may duplicate originals)
    seen_titles: set[str] = set()
    unique_posts: list[dict] = []
    for p in future_posts:
        t_raw = p.get("title", {})
        t = (t_raw.get("rendered", "") if isinstance(t_raw, dict) else str(t_raw)).strip().lower()
        if t and t not in seen_titles:
            seen_titles.add(t)
            unique_posts.append(p)

    # Convert to EventItem
    all_events = []
    for post in unique_posts:
        item = _wp_post_to_event(post, center_lookup)
        if item:
            all_events.append(item)

    # Paginate
    total = len(all_events)
    total_pages = max(1, (total + per_page - 1) // per_page)
    start_idx = (page - 1) * per_page
    page_events = all_events[start_idx : start_idx + per_page]

    result = EventsResponse(
        events=page_events,
        total=total,
        page=page,
        total_pages=total_pages,
    )
    _cache[key] = (now, result)
    return result
