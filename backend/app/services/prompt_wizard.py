"""
SBDC Prompt Wizard — Prompt library loading, placeholder extraction, population.
Refactored from Streamlit version — import paths updated for FastAPI backend.
"""

import json
import re
from pathlib import Path

from .. import config


# ─────────────────────────────────────────────────────────────
# Prompt Library Loading
# ─────────────────────────────────────────────────────────────

def load_prompt_library() -> list[dict]:
    """Load the full prompt library from prompt_library.json."""
    if not config.LIBRARY_PATH.exists():
        return []
    try:
        data = json.loads(config.LIBRARY_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError):
        return []


def get_categories(prompts: list[dict]) -> list[dict]:
    """Extract unique categories from the prompt library."""
    seen = {}
    for p in prompts:
        cat_id = p.get("category", "other")
        cat_label = p.get("categoryLabel", cat_id.title())
        if cat_id not in seen:
            seen[cat_id] = cat_label

    priority = {"advising": 0, "admin": 1, "training": 2, "marketing": 3, "workshop": 4}
    return sorted(
        [{"id": k, "label": v} for k, v in seen.items()],
        key=lambda c: (priority.get(c["id"], 99), c["label"]),
    )


def get_prompts_by_category(prompts: list[dict], category_id: str) -> list[dict]:
    """Filter prompts to a single category."""
    return [p for p in prompts if p.get("category") == category_id]


# ─────────────────────────────────────────────────────────────
# Placeholder Extraction & Population
# ─────────────────────────────────────────────────────────────

_PLACEHOLDER_RE = re.compile(r"\[([A-Z][A-Z0-9 /&,.'\"_\-—]+(?:\s*-\s*[A-Za-z0-9 .,'\"-]+)*)\]")


def extract_placeholders(prompt_text: str) -> list[dict]:
    """Extract all [BRACKETED PLACEHOLDERS] from a prompt string."""
    matches = _PLACEHOLDER_RE.findall(prompt_text)
    if not matches:
        return []

    seen = set()
    placeholders = []

    for match in matches:
        raw = f"[{match}]"
        key = re.sub(r"[^A-Z0-9]", "_", match.upper()).strip("_")
        key = re.sub(r"_+", "_", key)

        if key in seen:
            continue
        seen.add(key)

        label = match.strip()
        if label == label.upper():
            label = label.title()

        hint = _extract_hint(prompt_text, raw)

        placeholders.append({
            "raw": raw,
            "key": key,
            "label": label,
            "hint": hint,
        })

    return placeholders


def _extract_hint(prompt_text: str, raw_placeholder: str) -> str:
    """Try to extract a contextual hint for a placeholder."""
    inner = raw_placeholder[1:-1]
    if " - e.g." in inner or " - " in inner.lower():
        parts = inner.split(" - ", 1)
        if len(parts) == 2:
            return parts[1].strip().strip('"').strip("'")

    prefix_pattern = re.escape(raw_placeholder)
    prefix_match = re.search(
        r"([A-Za-z][A-Za-z /&]+):\s*" + prefix_pattern,
        prompt_text,
    )
    if prefix_match:
        return prefix_match.group(1).strip()

    return ""


def populate_prompt(prompt_text: str, values: dict[str, str]) -> str:
    """Replace all [PLACEHOLDERS] with user-provided values."""
    result = prompt_text
    placeholders = extract_placeholders(prompt_text)

    for ph in placeholders:
        value = values.get(ph["key"], "").strip()
        if value:
            result = result.replace(ph["raw"], value)

    return result


def search_prompts(prompts: list[dict], query: str) -> list[dict]:
    """Filter prompts by a search query (case-insensitive)."""
    if not query or not query.strip():
        return prompts

    words = query.strip().lower().split()
    if not words:
        return prompts

    results = []
    for p in prompts:
        searchable = " ".join([
            p.get("title", ""),
            p.get("description", ""),
            p.get("categoryLabel", ""),
            " ".join(p.get("tags", [])),
        ]).lower()
        if all(w in searchable for w in words):
            results.append(p)
    return results
