"""
Central configuration for the SBDC Advisor AI Backend.
Refactored from the Streamlit app — all paths are relative to this backend dir.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Project root = backend/
BASE_DIR = Path(__file__).parent.parent

# Data directory (inside app/)
DATA_DIR = Path(__file__).parent / "data"

# ── LLM Provider Selection ──
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")

# ── OpenAI settings ──
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")
MODEL_NAME_COMPLEX = os.getenv("MODEL_NAME_COMPLEX", "gpt-4o")

# ── Ollama settings ──
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")

# ── Display ──
_PROVIDER_LABELS = {
    "openai": f"OpenAI · {MODEL_NAME}",
    "ollama": f"Ollama · {MODEL_NAME}",
}
MODEL_DISPLAY = _PROVIDER_LABELS.get(LLM_PROVIDER, MODEL_NAME)

# App settings
APP_TITLE = "SBDC Advisor AI"
APP_PASSWORD = os.getenv("APP_PASSWORD", "sbdc2026")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Bingbang!789")

# System prompt
SYSTEM_PROMPT_PATH = DATA_DIR / "sbdc_system_prompt.txt"

# RAG settings
DOCUMENTS_DIR = BASE_DIR / "documents"
CHROMA_DB_DIR = BASE_DIR / "chroma_db"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K_RESULTS = 4

# Workflow settings
WORKFLOWS_DIR = DATA_DIR / "workflows"

# Prompt Library settings
PROMPTS_DIR = DATA_DIR
LIBRARY_PATH = DATA_DIR / "prompt_library.json"

# Token usage logging
USAGE_DB_PATH = BASE_DIR / "usage_log.db"

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "sbdc-dev-secret-change-in-production")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

# Neoserra API
NEOSERRA_BASE_URL = os.getenv("NEOSERRA_BASE_URL", "https://norcal.neoserra.com/api/v1")
NEOSERRA_API_TOKEN = os.getenv("NEOSERRA_API_TOKEN", "")

# Google Sheets (milestone history)
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")
GOOGLE_SHEETS_CREDENTIALS = os.getenv("GOOGLE_SHEETS_CREDENTIALS", "")

# Email (Resend API)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "NorCal SBDC <noreply@norcalsbdc.org>")
INTAKE_ADMIN_EMAIL = os.getenv("INTAKE_ADMIN_EMAIL", "marketing@norcalsbdc.org")
MILESTONE_ADMIN_EMAIL = os.getenv("MILESTONE_ADMIN_EMAIL", "marketing@norcalsbdc.org")

# CORS
_cors_env = os.getenv("CORS_ORIGINS", "")
if _cors_env.strip():
    CORS_ORIGINS: list[str] = [
        origin.strip().rstrip("/")
        for origin in _cors_env.split(",")
        if origin.strip()
    ]
    CORS_ORIGIN_REGEX: str | None = None
else:
    # Default: allow localhost dev server + any Railway app domain
    CORS_ORIGINS = ["http://localhost:3000"]
    CORS_ORIGIN_REGEX = r"https://.*\.up\.railway\.app"
