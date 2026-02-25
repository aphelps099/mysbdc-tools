"""
LLM usage analytics — SQLite-backed.

This module tracks LLM token usage and cost estimation.
"""

import logging
import sqlite3

from ..config import USAGE_DB_PATH

logger = logging.getLogger(__name__)

_DB = str(USAGE_DB_PATH)


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(_DB)
    c.row_factory = sqlite3.Row
    return c


# ── Cost estimation (GPT-4o-mini defaults) ──────────────────────

_INPUT_COST_PER_M = 0.15    # $0.15 / 1M input tokens
_OUTPUT_COST_PER_M = 0.60   # $0.60 / 1M output tokens


def _estimate_cost(input_tokens: int, output_tokens: int) -> float:
    return round(
        (input_tokens * _INPUT_COST_PER_M / 1_000_000)
        + (output_tokens * _OUTPUT_COST_PER_M / 1_000_000),
        4,
    )


# ── Dashboard ────────────────────────────────────────────────────

def get_llm_dashboard(days: int = 30) -> dict:
    """Return LLM usage summary for the last N days."""
    cutoff = f"-{days} days"

    try:
        with _conn() as c:
            # Check if table exists
            tbl = c.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='token_usage'"
            ).fetchone()
            if not tbl:
                return {"period_days": days, "llm_usage": _empty_llm_usage()}

            row = c.execute(
                """SELECT
                    COUNT(*) as requests,
                    COALESCE(SUM(input_tokens), 0) as inp,
                    COALESCE(SUM(output_tokens), 0) as outp,
                    COALESCE(SUM(total_tokens), 0) as tot,
                    COALESCE(AVG(duration_ms), 0) as avg_ms
                   FROM token_usage
                   WHERE timestamp >= datetime('now', ?)""",
                (cutoff,),
            ).fetchone()

            input_tokens = row["inp"]
            output_tokens = row["outp"]

            llm_usage = {
                "total_chats": row["requests"],
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": row["tot"],
                "avg_duration_ms": round(row["avg_ms"]),
                "estimated_cost": _estimate_cost(input_tokens, output_tokens),
            }
    except Exception as e:
        logger.warning("Failed to query LLM usage: %s", e)
        llm_usage = _empty_llm_usage()

    return {"period_days": days, "llm_usage": llm_usage}


def _empty_llm_usage() -> dict:
    return {
        "total_chats": 0,
        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,
        "avg_duration_ms": 0,
        "estimated_cost": 0.0,
    }
