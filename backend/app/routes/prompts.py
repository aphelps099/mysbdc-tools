"""GET /api/prompts — Serve the prompt library as structured API response."""

from fastapi import APIRouter

from ..services.prompt_wizard import load_prompt_library, get_categories
from ..models.schemas import PromptLibraryResponse, PromptCategory

router = APIRouter(prefix="/api", tags=["prompts"])


@router.get("/prompts", response_model=PromptLibraryResponse)
async def get_prompts():
    prompts = load_prompt_library()
    categories = get_categories(prompts)

    # Add counts to categories
    cat_counts = {}
    for p in prompts:
        cat_id = p.get("category", "other")
        cat_counts[cat_id] = cat_counts.get(cat_id, 0) + 1

    category_list = [
        PromptCategory(
            id=c["id"],
            label=c["label"],
            count=cat_counts.get(c["id"], 0),
        )
        for c in categories
    ]

    return PromptLibraryResponse(prompts=prompts, categories=category_list)
