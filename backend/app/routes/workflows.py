"""Workflow API routes."""

from fastapi import APIRouter

from ..services.workflow_engine import discover_workflows
from ..models.schemas import WorkflowListResponse, WorkflowMeta

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("/", response_model=WorkflowListResponse)
async def list_workflows():
    workflows = discover_workflows()
    return WorkflowListResponse(
        workflows=[WorkflowMeta(**w) for w in workflows]
    )
