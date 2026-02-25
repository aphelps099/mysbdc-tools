"""POST /api/auth/login — Simple password-based auth with JWT token.
POST /api/auth/admin — Server-side admin password verification.
Includes in-memory rate limiting on login attempts.
"""

import hashlib
import hmac
import json
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request

from ..config import APP_PASSWORD, ADMIN_PASSWORD, JWT_SECRET, JWT_EXPIRY_HOURS
from ..models.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Rate Limiter ──────────────────────────────────────────

_login_attempts: dict[str, list[float]] = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW_SEC = 60


def _rate_check_login(ip: str) -> bool:
    """Return True if the IP is within rate limits."""
    now = time.time()
    _login_attempts[ip] = [
        t for t in _login_attempts[ip] if now - t < LOGIN_WINDOW_SEC
    ]
    if len(_login_attempts[ip]) >= MAX_LOGIN_ATTEMPTS:
        return False
    _login_attempts[ip].append(now)
    return True


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "0.0.0.0"


# ── Token Helpers ─────────────────────────────────────────

def _create_token(payload: dict) -> str:
    """Create a simple HMAC-signed JWT-like token."""
    header = urlsafe_b64encode(json.dumps({"alg": "HS256"}).encode()).decode().rstrip("=")
    body = urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(
        JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256
    ).hexdigest()[:32]
    return f"{header}.{body}.{signature}"


def verify_token(token: str) -> dict | None:
    """Verify and decode a token. Returns the payload or None."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        header, body, sig = parts

        expected_sig = hmac.new(
            JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256
        ).hexdigest()[:32]

        if not hmac.compare_digest(sig, expected_sig):
            return None

        # Pad base64 if needed
        body_padded = body + "=" * (4 - len(body) % 4)
        payload = json.loads(urlsafe_b64decode(body_padded))

        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


# ── Endpoints ─────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, req: Request):
    ip = _client_ip(req)
    if not _rate_check_login(ip):
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Try again in a minute.",
        )

    if request.password != APP_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")

    expires_at = time.time() + (JWT_EXPIRY_HOURS * 3600)
    payload = {"sub": "advisor", "exp": expires_at}
    token = _create_token(payload)

    from datetime import datetime, timezone
    expires_str = datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat()

    return LoginResponse(token=token, expires_at=expires_str)


@router.post("/admin")
async def admin_verify(request: LoginRequest, req: Request):
    """Verify admin password server-side. Requires valid JWT + admin password."""
    ip = _client_ip(req)
    if not _rate_check_login(ip):
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Try again in a minute.",
        )

    # Verify JWT
    auth = req.headers.get("authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")

    return {"ok": True}
