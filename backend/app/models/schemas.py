"""Pydantic models for all API request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Auth ───

class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str
    expires_at: str


# ─── Chat ───

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    use_rag: bool = True
    model: Optional[str] = None
    workflow_id: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0


# ─── Prompts ───

class PromptItem(BaseModel):
    id: int
    title: str
    category: str
    categoryLabel: str
    description: str
    tags: list[str] = []
    prompt: str = ""
    isWorkflow: bool = False
    workflowId: Optional[str] = None
    body: Optional[list[dict]] = None


class PromptCategory(BaseModel):
    id: str
    label: str
    count: int


class PromptLibraryResponse(BaseModel):
    prompts: list[PromptItem]
    categories: list[PromptCategory]


# ─── Workflows ───

class WorkflowMeta(BaseModel):
    id: str
    name: str
    description: str
    icon: str = ""


class WorkflowListResponse(BaseModel):
    workflows: list[WorkflowMeta]


# ─── Documents ───

class DocumentInfo(BaseModel):
    filename: str
    chunk_count: int


class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]
    total_chunks: int


class UploadResponse(BaseModel):
    filename: str
    chunks_created: int
    total_chunks: int
    ingestion_error: Optional[str] = None


# ─── Events ───

class EventItem(BaseModel):
    title: str
    center: str = ""
    date: str = ""
    time: str = ""
    summary: str = ""
    cost: str = ""
    event_url: str = ""
    registration_url: str = ""
    image_url: str = ""


class EventsResponse(BaseModel):
    events: list[EventItem]
    total: int = 0
    page: int = 1
    total_pages: int = 1


# ─── Health ───

class HealthResponse(BaseModel):
    status: str
    model: str
    provider: str
    documents_indexed: int
