"""
Analytics endpoint — LLM usage dashboard.
"""

import logging

from fastapi import APIRouter, Request, HTTPException

from ..routes.auth import verify_token
from ..services.analytics import get_llm_dashboard

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
async def dashboard(request: Request, days: int = 30):
    """Return LLM usage summary. Requires auth."""
    auth = request.headers.get("authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Clamp days to a reasonable range
    days = max(1, min(days, 365))

    try:
        return get_llm_dashboard(days=days)
    except Exception as e:
        logger.exception("Dashboard query failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to load analytics data. Please try again.",
        )
