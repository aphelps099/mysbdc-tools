"""
Conversation history endpoints — CRUD for saved chats.
All endpoints require a valid JWT token.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from ..routes.auth import verify_token
from ..services.conversations import (
    create_conversation,
    list_conversations,
    get_conversation,
    save_message,
    delete_conversation,
    update_title,
)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def _require_auth(request: Request):
    auth = request.headers.get("authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")


class SaveMessagePayload(BaseModel):
    role: str
    content: str
    has_compliance: bool = False


class UpdateTitlePayload(BaseModel):
    title: str


@router.get("/")
async def list_convos(request: Request, limit: int = 50):
    """List recent conversations."""
    _require_auth(request)
    return {"conversations": list_conversations(limit=limit)}


@router.post("/")
async def create_convo(request: Request):
    """Create a new conversation."""
    _require_auth(request)
    convo = create_conversation()
    return convo


@router.get("/{convo_id}")
async def get_convo(convo_id: str, request: Request):
    """Get a conversation with all messages."""
    _require_auth(request)
    convo = get_conversation(convo_id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.post("/{convo_id}/messages")
async def add_message(convo_id: str, payload: SaveMessagePayload, request: Request):
    """Save a message to a conversation."""
    _require_auth(request)
    convo = get_conversation(convo_id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msg = save_message(
        conversation_id=convo_id,
        role=payload.role,
        content=payload.content,
        has_compliance=payload.has_compliance,
    )
    return msg


@router.patch("/{convo_id}")
async def patch_convo(convo_id: str, payload: UpdateTitlePayload, request: Request):
    """Update a conversation's title."""
    _require_auth(request)
    if not update_title(convo_id, payload.title):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}


@router.delete("/{convo_id}")
async def delete_convo(convo_id: str, request: Request):
    """Delete a conversation and all its messages."""
    _require_auth(request)
    if not delete_conversation(convo_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}
