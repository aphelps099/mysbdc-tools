"""
Conversation persistence — SQLite-backed chat history.

Stores conversations and messages so users can resume past chats.
Each conversation is identified by a UUID and auto-titled from the
first user message.
"""

import json
import sqlite3
import uuid
from datetime import datetime, timezone

from ..config import USAGE_DB_PATH

_DB = str(USAGE_DB_PATH)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL DEFAULT 'New Chat',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id                TEXT PRIMARY KEY,
    conversation_id   TEXT NOT NULL,
    role              TEXT NOT NULL,
    content           TEXT NOT NULL,
    has_compliance    INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_convo ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
"""


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(_DB)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    return c


def _ensure_tables():
    with _conn() as c:
        c.executescript(_SCHEMA)


def _migrate():
    """Add columns for workflow state and message metadata."""
    with _conn() as c:
        cols = [row[1] for row in c.execute("PRAGMA table_info(conversations)").fetchall()]
        if "workflow_id" not in cols:
            c.execute("ALTER TABLE conversations ADD COLUMN workflow_id TEXT DEFAULT NULL")
        if "workflow_state" not in cols:
            c.execute("ALTER TABLE conversations ADD COLUMN workflow_state TEXT DEFAULT NULL")

        msg_cols = [row[1] for row in c.execute("PRAGMA table_info(messages)").fetchall()]
        if "metadata" not in msg_cols:
            c.execute("ALTER TABLE messages ADD COLUMN metadata TEXT DEFAULT NULL")


_ensure_tables()
_migrate()


# ── Public API ──────────────────────────────────────────────

def create_conversation(title: str = "New Chat") -> dict:
    """Create a new conversation and return it."""
    convo_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    with _conn() as c:
        c.execute(
            "INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (convo_id, title, now, now),
        )

    return {"id": convo_id, "title": title, "created_at": now, "updated_at": now}


def list_conversations(limit: int = 50) -> list[dict]:
    """Return recent conversations ordered by last update."""
    with _conn() as c:
        rows = c.execute(
            """SELECT c.id, c.title, c.created_at, c.updated_at,
                      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
               FROM conversations c
               ORDER BY c.updated_at DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()

    return [
        {
            "id": r["id"],
            "title": r["title"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
            "message_count": r["message_count"],
        }
        for r in rows
    ]


def get_conversation(convo_id: str) -> dict | None:
    """Return a conversation with all its messages."""
    with _conn() as c:
        convo = c.execute(
            "SELECT id, title, created_at, updated_at FROM conversations WHERE id = ?",
            (convo_id,),
        ).fetchone()

        if not convo:
            return None

        msgs = c.execute(
            """SELECT id, role, content, has_compliance, created_at, metadata
               FROM messages
               WHERE conversation_id = ?
               ORDER BY created_at""",
            (convo_id,),
        ).fetchall()

    return {
        "id": convo["id"],
        "title": convo["title"],
        "created_at": convo["created_at"],
        "updated_at": convo["updated_at"],
        "messages": [
            {
                "id": m["id"],
                "role": m["role"],
                "content": m["content"],
                "has_compliance": bool(m["has_compliance"]),
                "created_at": m["created_at"],
                "metadata": json.loads(m["metadata"]) if m["metadata"] else None,
            }
            for m in msgs
        ],
    }


def save_message(
    conversation_id: str,
    role: str,
    content: str,
    has_compliance: bool = False,
    metadata: dict | None = None,
) -> dict:
    """Append a message to a conversation. Auto-titles on first user message."""
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    metadata_json = json.dumps(metadata) if metadata else None

    with _conn() as c:
        c.execute(
            """INSERT INTO messages (id, conversation_id, role, content, has_compliance, created_at, metadata)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (msg_id, conversation_id, role, content, int(has_compliance), now, metadata_json),
        )

        # Auto-title: set title from first user message
        if role == "user":
            existing_title = c.execute(
                "SELECT title FROM conversations WHERE id = ?",
                (conversation_id,),
            ).fetchone()
            if existing_title and existing_title["title"] == "New Chat":
                # Use first ~60 chars of the first user message
                title = content[:60].strip()
                if len(content) > 60:
                    title += "..."
                c.execute(
                    "UPDATE conversations SET title = ? WHERE id = ?",
                    (title, conversation_id),
                )

        # Bump updated_at
        c.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?",
            (now, conversation_id),
        )

    return {"id": msg_id, "role": role, "content": content, "created_at": now}


def delete_conversation(convo_id: str) -> bool:
    """Delete a conversation and all its messages."""
    with _conn() as c:
        c.execute("DELETE FROM messages WHERE conversation_id = ?", (convo_id,))
        deleted = c.execute("DELETE FROM conversations WHERE id = ?", (convo_id,))
        return deleted.rowcount > 0


def update_title(convo_id: str, title: str) -> bool:
    """Update a conversation's title."""
    with _conn() as c:
        result = c.execute(
            "UPDATE conversations SET title = ? WHERE id = ?",
            (title, convo_id),
        )
        return result.rowcount > 0


# ── Workflow State ─────────────────────────────────────────

def get_workflow_state(convo_id: str) -> tuple[str | None, dict | None]:
    """Return (workflow_id, state_dict) for a conversation, or (None, None)."""
    with _conn() as c:
        row = c.execute(
            "SELECT workflow_id, workflow_state FROM conversations WHERE id = ?",
            (convo_id,),
        ).fetchone()
    if not row or not row["workflow_state"]:
        return None, None
    return row["workflow_id"], json.loads(row["workflow_state"])


def save_workflow_state(convo_id: str, workflow_id: str, state: dict):
    """Persist workflow state JSON on a conversation."""
    with _conn() as c:
        c.execute(
            "UPDATE conversations SET workflow_id = ?, workflow_state = ? WHERE id = ?",
            (workflow_id, json.dumps(state), convo_id),
        )
