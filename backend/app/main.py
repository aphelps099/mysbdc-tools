"""
SBDC Advisor AI — FastAPI Backend
Main application entry point with CORS, routes, and health check.
"""

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, CORS_ORIGIN_REGEX, MODEL_DISPLAY, LLM_PROVIDER, MODEL_NAME, NEOSERRA_API_TOKEN
from .routes import analytics, atlas, auth, chat, conversations, prompts, workflows, documents, events, neoserra, transcribe, intake, milestones
from .services.rag import get_document_count

logger = logging.getLogger(__name__)

app = FastAPI(
    title="SBDC Advisor AI API",
    version="1.0.0",
    description="Backend API for the NorCal SBDC Advisor AI application",
)

@app.on_event("startup")
async def _startup_checks():
    """Log warnings for common configuration issues."""
    if LLM_PROVIDER == "openai" and not os.getenv("OPENAI_API_KEY"):
        logger.warning(
            "⚠ OPENAI_API_KEY is not set! The chat endpoint will fail. "
            "Set it in backend/.env or as an environment variable."
        )
    else:
        logger.info(
            "LLM config OK: provider=%s, model=%s", LLM_PROVIDER, MODEL_NAME
        )
    logger.info(
        "CORS origins=%s, regex=%s", CORS_ORIGINS, CORS_ORIGIN_REGEX
    )
    if NEOSERRA_API_TOKEN:
        logger.info("Neoserra API configured")
    else:
        logger.warning("NEOSERRA_API_TOKEN not set — CRM dashboard disabled")


# CORS — allow explicit origins + Railway wildcard regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(conversations.router)
app.include_router(prompts.router)
app.include_router(workflows.router)
app.include_router(documents.router)
app.include_router(events.router)
app.include_router(neoserra.router)
app.include_router(transcribe.router)
app.include_router(intake.router)
app.include_router(milestones.router)
app.include_router(atlas.router)


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    doc_count = 0
    try:
        doc_count = get_document_count()
    except Exception:
        pass

    return {
        "status": "ok",
        "model": MODEL_NAME,
        "provider": LLM_PROVIDER,
        "model_display": MODEL_DISPLAY,
        "documents_indexed": doc_count,
    }


@app.get("/api/test-llm")
async def test_llm():
    """Quick diagnostic: verify the LLM API key works with a tiny request."""
    import os
    from .services.llm_client import LLMError

    api_key = os.getenv("OPENAI_API_KEY", "")
    diagnostics: dict = {
        "provider": LLM_PROVIDER,
        "model": MODEL_NAME,
        "key_set": bool(api_key),
        "key_length": len(api_key) if api_key else 0,
    }

    if not api_key:
        return {
            "status": "error",
            "message": (
                "OPENAI_API_KEY is not set. Create a backend/.env file with: "
                "OPENAI_API_KEY=sk-your-key-here  (copy from "
                "https://platform.openai.com/api-keys)"
            ),
            "error_type": "auth",
            **diagnostics,
        }

    try:
        from .services.llm_client import get_async_client
        client = get_async_client()
        resp = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": "Say hi"}],
            max_tokens=5,
        )
        return {
            "status": "ok",
            "response": resp.choices[0].message.content,
            **diagnostics,
        }
    except LLMError as e:
        return {
            "status": "error",
            "message": str(e),
            "error_type": e.error_type,
            **diagnostics,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "error_type": type(e).__name__,
            **diagnostics,
        }
