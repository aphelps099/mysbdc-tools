"""
SBDC LLM Client — Async abstraction layer for FastAPI.

Refactored from the Streamlit version to support:
- Async streaming for SSE endpoints
- Same sync interface for non-streaming calls
- OpenAI / Ollama provider switching
- Compliance footer auto-append
- SQLite token usage logging (never logs content)
"""

import os
import sqlite3
import time
from collections.abc import AsyncGenerator, Generator
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from openai import (
    AsyncOpenAI,
    OpenAI,
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    NotFoundError,
    RateLimitError,
)

from ..config import (
    LLM_PROVIDER,
    MODEL_NAME,
    OLLAMA_BASE_URL,
    SYSTEM_PROMPT_PATH,
    USAGE_DB_PATH,
)


# ─────────────────────────────────────────────────────────────
# Exceptions
# ─────────────────────────────────────────────────────────────

class LLMError(Exception):
    """Raised when the LLM call fails."""

    def __init__(self, message: str, error_type: str = "unknown"):
        super().__init__(message)
        self.error_type = error_type


# ─────────────────────────────────────────────────────────────
# Client Singletons (sync + async)
# ─────────────────────────────────────────────────────────────

_client: OpenAI | None = None
_async_client: AsyncOpenAI | None = None


def _get_api_key() -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise LLMError(
            "OPENAI_API_KEY environment variable is not set.",
            error_type="auth",
        )
    return api_key


def get_client() -> OpenAI:
    """Return a cached sync OpenAI client."""
    global _client
    if _client is not None:
        return _client

    if LLM_PROVIDER == "openai":
        _client = OpenAI(api_key=_get_api_key())
    elif LLM_PROVIDER == "ollama":
        _client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")
    else:
        raise LLMError(f"Unknown LLM provider: '{LLM_PROVIDER}'", error_type="config")

    return _client


def get_async_client() -> AsyncOpenAI:
    """Return a cached async OpenAI client for streaming SSE."""
    global _async_client
    if _async_client is not None:
        return _async_client

    if LLM_PROVIDER == "openai":
        _async_client = AsyncOpenAI(
            api_key=_get_api_key(),
            timeout=60.0,
        )
    elif LLM_PROVIDER == "ollama":
        _async_client = AsyncOpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")
    else:
        raise LLMError(f"Unknown LLM provider: '{LLM_PROVIDER}'", error_type="config")

    return _async_client


# ─────────────────────────────────────────────────────────────
# System Prompt
# ─────────────────────────────────────────────────────────────

_system_prompt_cache: str | None = None


def get_system_prompt() -> str:
    """Load and cache the system prompt from sbdc_system_prompt.txt."""
    global _system_prompt_cache
    if _system_prompt_cache is not None:
        return _system_prompt_cache
    try:
        _system_prompt_cache = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        _system_prompt_cache = "You are a helpful assistant for SBDC advisors."
    return _system_prompt_cache


# ─────────────────────────────────────────────────────────────
# Compliance Footer
# ─────────────────────────────────────────────────────────────

COMPLIANCE_FOOTER = (
    "\n\n> **Compliance Note:** This output is AI-generated and should be "
    "carefully reviewed before sharing in advising. SBDC advisors must "
    "verify all information before sharing with clients. Client PII must never "
    "be entered into AI tools outside the approved SBDC secure environment. "
    "Questions? Contact phelps@norcalsbdc.org or AI Pillar leads."
)

_COMPLIANCE_TRIGGERS = [
    "client", "loan", "sba", "financial", "capital", "funding",
    "tax", "legal", "compliance", "pii", "grant", "credit",
    "revenue", "profit", "cash flow", "projections", "balance sheet",
    "income", "audit", "regulation", "contract", "liability",
    "advising session", "session notes", "neoserra",
]


def needs_compliance_footer(messages: list[dict], response_text: str) -> bool:
    """Check if the conversation touches client data, financials, or legal matters."""
    text_to_check = response_text.lower()
    if messages:
        for msg in reversed(messages):
            if msg["role"] == "user":
                text_to_check += " " + msg["content"].lower()
                break

    return any(trigger in text_to_check for trigger in _COMPLIANCE_TRIGGERS)


# ─────────────────────────────────────────────────────────────
# Token Usage Logging (SQLite)
# ─────────────────────────────────────────────────────────────

def _ensure_usage_table():
    conn = sqlite3.connect(str(USAGE_DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS token_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            model TEXT NOT NULL,
            provider TEXT NOT NULL,
            input_tokens INTEGER NOT NULL,
            output_tokens INTEGER NOT NULL,
            total_tokens INTEGER NOT NULL,
            duration_ms INTEGER NOT NULL,
            has_workflow INTEGER NOT NULL DEFAULT 0,
            workflow_id TEXT DEFAULT NULL
        )
    """)
    conn.commit()
    conn.close()


def log_usage(
    model: str,
    provider: str,
    input_tokens: int,
    output_tokens: int,
    duration_ms: int,
    workflow_id: str | None = None,
):
    """Log token usage to SQLite. Never logs prompt or response content."""
    try:
        _ensure_usage_table()
        conn = sqlite3.connect(str(USAGE_DB_PATH))
        conn.execute(
            """INSERT INTO token_usage
               (timestamp, model, provider, input_tokens, output_tokens,
                total_tokens, duration_ms, has_workflow, workflow_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                datetime.now(timezone.utc).isoformat(),
                model,
                provider,
                input_tokens,
                output_tokens,
                input_tokens + output_tokens,
                duration_ms,
                1 if workflow_id else 0,
                workflow_id,
            ),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Usage logging error: {e}")


def get_usage_summary(days: int = 30) -> dict:
    """Return a summary of token usage over the last N days."""
    try:
        _ensure_usage_table()
        conn = sqlite3.connect(str(USAGE_DB_PATH))
        cursor = conn.execute(
            """SELECT
                COUNT(*) as requests,
                COALESCE(SUM(input_tokens), 0),
                COALESCE(SUM(output_tokens), 0),
                COALESCE(SUM(total_tokens), 0),
                COALESCE(AVG(duration_ms), 0)
               FROM token_usage
               WHERE timestamp >= datetime('now', ?)""",
            (f"-{days} days",),
        )
        row = cursor.fetchone()
        conn.close()
        return {
            "requests": row[0],
            "input_tokens": row[1],
            "output_tokens": row[2],
            "total_tokens": row[3],
            "avg_duration_ms": round(row[4]),
        }
    except Exception:
        return {
            "requests": 0, "input_tokens": 0, "output_tokens": 0,
            "total_tokens": 0, "avg_duration_ms": 0,
        }


# ─────────────────────────────────────────────────────────────
# Async Streaming Chat (for SSE endpoints)
# ─────────────────────────────────────────────────────────────

async def stream_chat_async(
    messages: list[dict],
    system_prompt: str | None = None,
    model: str | None = None,
    workflow_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Async streaming chat completion for FastAPI SSE.

    Yields text chunks as they arrive. After all chunks,
    logs usage to SQLite.
    """
    active_model = model or MODEL_NAME
    provider = LLM_PROVIDER

    effective_system = system_prompt if system_prompt else get_system_prompt()
    api_messages = [{"role": "system", "content": effective_system}]
    api_messages.extend(messages)

    start_time = time.monotonic()
    input_tokens = 0
    output_tokens = 0

    try:
        client = get_async_client()
        stream = await client.chat.completions.create(
            model=active_model,
            messages=api_messages,
            stream=True,
            stream_options={"include_usage": True} if provider == "openai" else {},
        )
    except AuthenticationError as e:
        raise LLMError(
            "OpenAI API key is invalid or expired. Check your OPENAI_API_KEY "
            "environment variable. If you recently created the key, wait a "
            "minute and try again.",
            error_type="auth",
        ) from e
    except RateLimitError as e:
        raise LLMError(
            "OpenAI rate limit reached or billing quota exceeded. Check your "
            "OpenAI account billing at https://platform.openai.com/account/billing",
            error_type="rate_limit",
        ) from e
    except APIConnectionError as e:
        raise LLMError(
            "Cannot connect to OpenAI API. Check your internet connection and "
            "ensure api.openai.com is reachable.",
            error_type="connection",
        ) from e
    except APITimeoutError as e:
        raise LLMError(
            "OpenAI API request timed out. Try again in a moment.",
            error_type="timeout",
        ) from e
    except NotFoundError as e:
        raise LLMError(
            f"Model '{active_model}' not found. Check MODEL_NAME in your "
            f"environment configuration.",
            error_type="model",
        ) from e
    except BadRequestError as e:
        raise LLMError(
            f"Bad request to OpenAI API: {e.message}",
            error_type="bad_request",
        ) from e
    except Exception as e:
        raise LLMError(f"LLM error: {e}", error_type="unknown") from e

    full_response_parts: list[str] = []
    try:
        async for chunk in stream:
            if hasattr(chunk, "usage") and chunk.usage is not None:
                input_tokens = chunk.usage.prompt_tokens or 0
                output_tokens = chunk.usage.completion_tokens or 0

            if chunk.choices and chunk.choices[0].delta.content is not None:
                text = chunk.choices[0].delta.content
                full_response_parts.append(text)
                yield text
    except Exception as e:
        raise LLMError(f"Stream error: {e}", error_type="stream") from e

    full_response = "".join(full_response_parts)

    # Log usage (estimate if provider doesn't report)
    duration_ms = int((time.monotonic() - start_time) * 1000)
    if input_tokens == 0:
        total_input_chars = sum(len(m["content"]) for m in api_messages)
        input_tokens = total_input_chars // 4
    if output_tokens == 0:
        output_tokens = len(full_response) // 4

    log_usage(
        model=active_model,
        provider=provider,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        duration_ms=duration_ms,
        workflow_id=workflow_id,
    )


# ─────────────────────────────────────────────────────────────
# Sync Chat (for non-streaming calls)
# ─────────────────────────────────────────────────────────────

def chat(
    messages: list[dict],
    system_prompt: str | None = None,
    model: str | None = None,
    workflow_id: str | None = None,
) -> str:
    """Non-streaming chat completion. Returns the full response as a string."""
    active_model = model or MODEL_NAME
    provider = LLM_PROVIDER

    effective_system = system_prompt if system_prompt else get_system_prompt()
    api_messages = [{"role": "system", "content": effective_system}]
    api_messages.extend(messages)

    start_time = time.monotonic()

    try:
        client = get_client()
        response = client.chat.completions.create(
            model=active_model,
            messages=api_messages,
            stream=False,
        )
    except AuthenticationError as e:
        raise LLMError(
            "OpenAI API key is invalid or expired. Check your OPENAI_API_KEY.",
            error_type="auth",
        ) from e
    except RateLimitError as e:
        raise LLMError(
            "OpenAI rate limit or billing quota exceeded. Check your OpenAI billing.",
            error_type="rate_limit",
        ) from e
    except APIConnectionError as e:
        raise LLMError(
            "Cannot connect to OpenAI API. Check your internet connection.",
            error_type="connection",
        ) from e
    except NotFoundError as e:
        raise LLMError(
            f"Model '{active_model}' not found. Check MODEL_NAME.",
            error_type="model",
        ) from e
    except Exception as e:
        raise LLMError(f"LLM error: {e}", error_type="unknown") from e

    result = response.choices[0].message.content or ""

    input_tokens = response.usage.prompt_tokens if response.usage else 0
    output_tokens = response.usage.completion_tokens if response.usage else 0

    if needs_compliance_footer(messages, result):
        result += COMPLIANCE_FOOTER

    duration_ms = int((time.monotonic() - start_time) * 1000)
    if input_tokens == 0:
        total_input_chars = sum(len(m["content"]) for m in api_messages)
        input_tokens = total_input_chars // 4
    if output_tokens == 0:
        output_tokens = len(result) // 4

    log_usage(
        model=active_model,
        provider=provider,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        duration_ms=duration_ms,
        workflow_id=workflow_id,
    )

    return result
