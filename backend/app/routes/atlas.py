"""
ATLAS — Aggregate Tracking & Layered Analytics System.

Public-facing impact dashboard API. No auth required — this data
is designed to be shared with stakeholders, funders, and the public.
"""

import logging

from fastapi import APIRouter, Query

from ..services import atlas as atlas_service
from ..services import neoserra_client as neo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/atlas", tags=["atlas"])


@router.get("/impact")
async def get_impact(
    period: str = Query(default="ytd", regex="^(this_month|quarter|ytd|all_time)$"),
):
    """Return aggregate impact data for the ATLAS dashboard.

    Combines locally-tracked milestone impacts with center metadata.
    """
    # Get aggregate totals from the local impacts database
    data = atlas_service.get_aggregate(period)

    # Enrich with center names if Neoserra is available
    if neo.is_configured() and data["by_center"]:
        try:
            centers = await neo.get_all_centers()
            center_map = {str(c["id"]): c["centerName"] for c in centers}
            for entry in data["by_center"]:
                cid = entry.get("center_id")
                entry["center_name"] = center_map.get(str(cid), f"Center {cid}")
        except Exception as exc:
            logger.warning("Failed to enrich center names: %s", exc)

    return data


@router.get("/centers")
async def get_centers_geo():
    """Return center list with geographic coordinates for map rendering.

    Coordinates are hardcoded for the 14 NorCal SBDC centers since
    the Neoserra API doesn't include geographic data.
    """
    # NorCal SBDC center coordinates (approximate)
    # Keyed by center ID from Neoserra
    center_coords = {
        "3": {"name": "Northeastern California SBDC", "lat": 40.5865, "lng": -122.3917, "city": "Redding"},
        "4": {"name": "Sierra College SBDC", "lat": 38.7446, "lng": -121.1628, "city": "Rocklin"},
        "5": {"name": "Sacramento Valley SBDC", "lat": 38.5816, "lng": -121.4944, "city": "Sacramento"},
        "23": {"name": "Solano County SBDC", "lat": 38.2494, "lng": -122.0400, "city": "Fairfield"},
        "25": {"name": "Contra Costa SBDC", "lat": 37.9577, "lng": -122.0570, "city": "Pleasant Hill"},
        "55": {"name": "Napa-Sonoma SBDC", "lat": 38.2975, "lng": -122.2869, "city": "Napa"},
        "57": {"name": "North Coast SBDC", "lat": 40.8021, "lng": -124.1637, "city": "Eureka"},
        "71": {"name": "Silicon Valley SBDC", "lat": 37.3382, "lng": -121.8863, "city": "San Jose"},
        "72": {"name": "San Francisco SBDC", "lat": 37.7749, "lng": -122.4194, "city": "San Francisco"},
        "89": {"name": "Butte College SBDC", "lat": 39.7285, "lng": -121.8375, "city": "Chico"},
        "94": {"name": "East Bay SBDC", "lat": 37.8044, "lng": -122.2712, "city": "Oakland"},
        "130": {"name": "Central Sierra SBDC", "lat": 38.8960, "lng": -119.9773, "city": "South Lake Tahoe"},
        "131": {"name": "San Joaquin Delta SBDC", "lat": 37.9577, "lng": -121.2908, "city": "Stockton"},
        "136": {"name": "Yolo County SBDC", "lat": 38.5449, "lng": -121.7405, "city": "Davis"},
    }

    # Merge with Neoserra data if available
    if neo.is_configured():
        try:
            api_centers = await neo.get_all_centers()
            for c in api_centers:
                cid = str(c["id"])
                if cid in center_coords:
                    center_coords[cid]["name"] = c.get("centerName", center_coords[cid]["name"])
                    center_coords[cid]["id"] = cid
                    center_coords[cid]["clientidmask"] = c.get("clientidmask", "")
        except Exception:
            pass

    # Ensure all entries have an id
    result = []
    for cid, info in center_coords.items():
        info["id"] = cid
        result.append(info)

    return {"centers": result}
