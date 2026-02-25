"""
ATLAS — Aggregate Tracking & Layered Analytics System.

Persistent SQLite store for milestone impact data.
Unlike the 14-day rolling milestone_log, this table retains all records
permanently for long-term aggregation (monthly, quarterly, YTD, all-time).
"""

import json
import logging
import sqlite3
from datetime import datetime, timezone
from typing import Optional

from ..config import BASE_DIR

logger = logging.getLogger(__name__)

_ATLAS_DB = str(BASE_DIR / "atlas.db")


# ── Schema ─────────────────────────────────────────────────────

def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(_ATLAS_DB)
    c.row_factory = sqlite3.Row
    return c


def ensure_tables():
    """Create the impacts table if it doesn't exist."""
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS impacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                client_id TEXT NOT NULL,
                client_public_id TEXT NOT NULL,
                client_name TEXT NOT NULL,
                center_id TEXT,
                category TEXT NOT NULL,
                amount REAL NOT NULL DEFAULT 0,
                delta REAL NOT NULL DEFAULT 0,
                submitter_name TEXT,
                submitter_email TEXT
            )
        """)
        c.execute("""
            CREATE INDEX IF NOT EXISTS idx_impacts_timestamp
            ON impacts(timestamp)
        """)
        c.execute("""
            CREATE INDEX IF NOT EXISTS idx_impacts_category
            ON impacts(category)
        """)
        c.execute("""
            CREATE INDEX IF NOT EXISTS idx_impacts_center
            ON impacts(center_id)
        """)
        c.commit()


# ── Record Impacts ─────────────────────────────────────────────

def record_impact(
    *,
    client_id: str,
    client_public_id: str,
    client_name: str,
    center_id: Optional[str],
    category: str,
    amount: float,
    delta: float,
    submitter_name: str = "",
    submitter_email: str = "",
    timestamp: Optional[str] = None,
):
    """Insert a single impact record."""
    ensure_tables()
    ts = timestamp or datetime.now(timezone.utc).isoformat()
    try:
        with _conn() as c:
            c.execute(
                """INSERT INTO impacts
                   (timestamp, client_id, client_public_id, client_name,
                    center_id, category, amount, delta,
                    submitter_name, submitter_email)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (ts, client_id, client_public_id, client_name,
                 center_id, category, amount, delta,
                 submitter_name, submitter_email),
            )
            c.commit()
    except Exception as exc:
        logger.error("ATLAS impact write error: %s", exc)


def record_impacts_from_submission(data) -> int:
    """Extract and record all impact metrics from a milestone submission.

    Called after a successful milestone submit. Returns the number of
    impact records created.
    """
    ensure_tables()
    ts = datetime.now(timezone.utc).isoformat()
    count = 0

    common = dict(
        client_id=data.clientId,
        client_public_id=data.clientPublicId,
        client_name=data.clientName,
        center_id=data.clientCenterId or None,
        submitter_name=f"{data.firstName} {data.lastName}",
        submitter_email=data.contactEmail,
        timestamp=ts,
    )

    # Jobs (Full-Time)
    if "hired_employees" in data.categories and data.totalFtEmployees:
        try:
            ft = int(data.totalFtEmployees)
            delta_ft = ft - data.initialFtEmps
            if delta_ft != 0:
                record_impact(category="jobs_ft", amount=float(ft), delta=float(delta_ft), **common)
                count += 1
        except (ValueError, TypeError):
            pass

    # Jobs (Part-Time)
    if "hired_employees" in data.categories and data.totalPtEmployees:
        try:
            pt = int(data.totalPtEmployees)
            delta_pt = pt - data.initialPtEmps
            if delta_pt != 0:
                record_impact(category="jobs_pt", amount=float(pt), delta=float(delta_pt), **common)
                count += 1
        except (ValueError, TypeError):
            pass

    # Revenue / Sales
    if "increased_sales" in data.categories and data.grossRevenue:
        try:
            rev = float(data.grossRevenue)
            delta_rev = rev - data.initialGrossSales
            if delta_rev != 0:
                record_impact(category="revenue", amount=rev, delta=delta_rev, **common)
                count += 1
        except (ValueError, TypeError):
            pass

    # Business Started
    if "started_business" in data.categories and data.businessStartVerified == "yes":
        record_impact(category="business_start", amount=1, delta=1, **common)
        count += 1

    # Capital — Owner Investment
    if "got_funded" in data.categories and data.ownInvestment:
        try:
            own = float(data.ownInvestment)
            if own > 0:
                record_impact(category="capital", amount=own, delta=own, **common)
                count += 1
        except (ValueError, TypeError):
            pass

    # Capital — Additional Funding
    if "got_funded" in data.categories:
        for row in data.additionalFunding:
            if not row.amount.strip():
                continue
            try:
                amt = float(row.amount)
                if amt > 0:
                    record_impact(category="capital", amount=amt, delta=amt, **common)
                    count += 1
            except (ValueError, TypeError):
                pass

    if count:
        logger.info("ATLAS: recorded %d impact(s) for client %s", count, data.clientPublicId)

    return count


# ── Aggregation ────────────────────────────────────────────────

def _date_filter(period: str) -> str:
    """Return a SQL datetime cutoff string for the given period."""
    now = datetime.now()
    if period == "this_month":
        return now.replace(day=1).strftime("%Y-%m-%dT00:00:00")
    elif period == "quarter":
        q_month = ((now.month - 1) // 3) * 3 + 1
        return now.replace(month=q_month, day=1).strftime("%Y-%m-%dT00:00:00")
    elif period == "ytd":
        return now.replace(month=1, day=1).strftime("%Y-%m-%dT00:00:00")
    elif period == "all_time":
        return "2000-01-01T00:00:00"
    else:
        return now.replace(month=1, day=1).strftime("%Y-%m-%dT00:00:00")


def get_aggregate(period: str = "ytd") -> dict:
    """Return aggregate impact totals for the given period.

    Returns:
        {
            period, since,
            capital_accessed, jobs_created, businesses_started, revenue_growth,
            by_center: [{center_id, capital, jobs, businesses, revenue}],
            recent: [{timestamp, client_name, center_id, category, delta}],
            total_submissions,
        }
    """
    ensure_tables()
    since = _date_filter(period)

    try:
        with _conn() as c:
            # Aggregate totals
            capital = c.execute(
                "SELECT COALESCE(SUM(delta), 0) FROM impacts WHERE category='capital' AND timestamp >= ?",
                (since,),
            ).fetchone()[0]

            jobs_ft = c.execute(
                "SELECT COALESCE(SUM(delta), 0) FROM impacts WHERE category='jobs_ft' AND timestamp >= ?",
                (since,),
            ).fetchone()[0]

            jobs_pt = c.execute(
                "SELECT COALESCE(SUM(delta), 0) FROM impacts WHERE category='jobs_pt' AND timestamp >= ?",
                (since,),
            ).fetchone()[0]

            businesses = c.execute(
                "SELECT COALESCE(SUM(delta), 0) FROM impacts WHERE category='business_start' AND timestamp >= ?",
                (since,),
            ).fetchone()[0]

            revenue = c.execute(
                "SELECT COALESCE(SUM(delta), 0) FROM impacts WHERE category='revenue' AND timestamp >= ?",
                (since,),
            ).fetchone()[0]

            # By center
            center_rows = c.execute("""
                SELECT
                    center_id,
                    SUM(CASE WHEN category='capital' THEN delta ELSE 0 END) as capital,
                    SUM(CASE WHEN category IN ('jobs_ft','jobs_pt') THEN delta ELSE 0 END) as jobs,
                    SUM(CASE WHEN category='business_start' THEN delta ELSE 0 END) as businesses,
                    SUM(CASE WHEN category='revenue' THEN delta ELSE 0 END) as revenue,
                    COUNT(DISTINCT client_public_id) as clients
                FROM impacts
                WHERE timestamp >= ?
                GROUP BY center_id
                ORDER BY capital DESC
            """, (since,)).fetchall()

            by_center = [
                {
                    "center_id": r["center_id"],
                    "capital": r["capital"],
                    "jobs": int(r["jobs"]),
                    "businesses": int(r["businesses"]),
                    "revenue": r["revenue"],
                    "clients": r["clients"],
                }
                for r in center_rows
            ]

            # Recent activity (last 20)
            recent_rows = c.execute("""
                SELECT timestamp, client_name, center_id, category, delta,
                       submitter_name, client_public_id
                FROM impacts
                WHERE timestamp >= ?
                ORDER BY timestamp DESC
                LIMIT 20
            """, (since,)).fetchall()

            recent = [
                {
                    "timestamp": r["timestamp"],
                    "client_name": r["client_name"],
                    "center_id": r["center_id"],
                    "category": r["category"],
                    "delta": r["delta"],
                    "submitter_name": r["submitter_name"],
                    "client_public_id": r["client_public_id"],
                }
                for r in recent_rows
            ]

            # Total submission count (unique client+timestamp combos)
            total = c.execute(
                "SELECT COUNT(DISTINCT client_public_id || timestamp) FROM impacts WHERE timestamp >= ?",
                (since,),
            ).fetchone()[0]

            return {
                "period": period,
                "since": since,
                "capital_accessed": round(capital, 2),
                "jobs_created": int(jobs_ft + jobs_pt),
                "jobs_ft": int(jobs_ft),
                "jobs_pt": int(jobs_pt),
                "businesses_started": int(businesses),
                "revenue_growth": round(revenue, 2),
                "by_center": by_center,
                "recent": recent,
                "total_submissions": total,
            }

    except Exception as exc:
        logger.error("ATLAS aggregation error: %s", exc)
        return {
            "period": period,
            "since": since,
            "capital_accessed": 0,
            "jobs_created": 0,
            "jobs_ft": 0,
            "jobs_pt": 0,
            "businesses_started": 0,
            "revenue_growth": 0,
            "by_center": [],
            "recent": [],
            "total_submissions": 0,
        }
