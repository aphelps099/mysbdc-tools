"""
SBDC Workflow Engine — Guided multi-step conversations.
Refactored from Streamlit version — removed st.session_state dependency.
State is now passed in/out of functions explicitly (managed by the route layer).
"""

import json
from datetime import datetime
from pathlib import Path

from .. import config


# ─────────────────────────────────────────────────────────────
# Workflow Loading & Registry
# ─────────────────────────────────────────────────────────────

def discover_workflows() -> list[dict]:
    """Scan the workflows/ directory for .json files."""
    workflows_dir = config.WORKFLOWS_DIR
    if not workflows_dir.exists():
        return []

    results = []
    for file_path in sorted(workflows_dir.glob("*.json")):
        try:
            data = json.loads(file_path.read_text(encoding="utf-8"))
            results.append({
                "id": data.get("id", file_path.stem),
                "name": data.get("name", file_path.stem),
                "description": data.get("description", ""),
                "icon": data.get("icon", ""),
            })
        except (json.JSONDecodeError, KeyError):
            continue

    return results


def load_workflow(workflow_id: str) -> dict | None:
    """Load a complete workflow definition from its JSON file."""
    workflows_dir = config.WORKFLOWS_DIR
    file_path = workflows_dir / f"{workflow_id}.json"

    if not file_path.exists():
        for fp in workflows_dir.glob("*.json"):
            try:
                data = json.loads(fp.read_text(encoding="utf-8"))
                if data.get("id") == workflow_id:
                    return data
            except (json.JSONDecodeError, KeyError):
                continue
        return None

    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
        errors = validate_workflow(data)
        if errors:
            print(f"Workflow validation errors in {file_path.name}: {errors}")
            return None
        return data
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error loading workflow {file_path.name}: {e}")
        return None


def validate_workflow(data: dict) -> list[str]:
    """Validate a workflow definition dict."""
    errors = []

    for key in ("id", "name", "steps", "completion"):
        if key not in data:
            errors.append(f"Missing required key: {key}")

    if "steps" in data:
        if not isinstance(data["steps"], list) or len(data["steps"]) == 0:
            errors.append("'steps' must be a non-empty list")
        else:
            step_ids = set()
            for i, step in enumerate(data["steps"]):
                for req in ("id", "title", "objective"):
                    if req not in step:
                        errors.append(f"Step {i}: missing '{req}'")
                if step.get("id") in step_ids:
                    errors.append(f"Step {i}: duplicate id '{step['id']}'")
                step_ids.add(step.get("id"))

    return errors


# ─────────────────────────────────────────────────────────────
# Workflow State Management
# ─────────────────────────────────────────────────────────────

def init_workflow_state(workflow: dict) -> dict:
    """Create the initial state dict for an active workflow."""
    step_data = {}
    for step in workflow["steps"]:
        step_data[step["id"]] = {
            "status": "pending",
            "collected": [],
        }

    return {
        "workflow_id": workflow["id"],
        "workflow_name": workflow["name"],
        "active": True,
        "current_step_index": 0,
        "started": False,
        "completed": False,
        "step_data": step_data,
        "started_at": datetime.now().isoformat(),
        "trigger": workflow.get("trigger", "start"),
        "advance_command": workflow.get("advance_command", "next"),
        "cancel_command": workflow.get("cancel_command", "quit"),
    }


def get_current_step(state: dict, workflow: dict) -> dict | None:
    """Return the full step definition for the current step index."""
    idx = state["current_step_index"]
    steps = workflow["steps"]
    if idx >= len(steps):
        return None
    return steps[idx]


def advance_step(state: dict, workflow: dict) -> dict:
    """Mark current step as done, advance to next step."""
    steps = workflow["steps"]
    idx = state["current_step_index"]

    if idx < len(steps):
        step_id = steps[idx]["id"]
        state["step_data"][step_id]["status"] = "done"

    state["current_step_index"] = idx + 1

    if state["current_step_index"] >= len(steps):
        state["completed"] = True
    else:
        new_step_id = steps[state["current_step_index"]]["id"]
        state["step_data"][new_step_id]["status"] = "active"

    return state


def cancel_workflow(state: dict) -> dict:
    """Abandon the workflow."""
    state["active"] = False
    return state


def collect_exchange(state: dict, step_id: str, user_msg: str, assistant_msg: str):
    """Append a user/assistant exchange to the step's collected data."""
    if step_id in state["step_data"]:
        state["step_data"][step_id]["collected"].append({
            "user": user_msg,
            "assistant": assistant_msg,
        })


# ─────────────────────────────────────────────────────────────
# System Prompt Construction
# ─────────────────────────────────────────────────────────────

def build_workflow_system_prompt(
    base_system_prompt: str,
    workflow: dict,
    state: dict,
) -> str:
    """Construct the full system prompt for the current workflow + step."""
    parts = [base_system_prompt]

    parts.append(
        "\n\n" + "=" * 50 + "\n"
        f"ACTIVE WORKFLOW: {workflow['name']}\n"
        + "=" * 50
    )

    persona = workflow.get("persona", "")
    if persona:
        parts.append(f"\n{persona}")

    adv = state["advance_command"]
    cancel = state["cancel_command"]
    parts.append(
        f"\n\nIMPORTANT WORKFLOW RULES:\n"
        f'- The user types "{adv}" to move to the next section.\n'
        f'- The user types "{cancel}" to exit the workflow entirely.\n'
        f"- Stay focused on the current section.\n"
        f'- When the user types "{adv}", summarize what you captured, '
        f"then introduce the next section.\n"
        f"- Ask questions 2-3 at a time, not all at once.\n"
        f"- Acknowledge each answer before asking more."
    )

    progress = get_progress(state, workflow)
    parts.append(
        f"\n\nPROGRESS: Step {progress['current_step']} of {progress['total_steps']}"
        f" — {progress['current_title']}"
    )

    collected_summary = build_collected_data_summary(state, workflow)
    if collected_summary:
        parts.append(collected_summary)

    current_step = get_current_step(state, workflow)
    if current_step:
        parts.append(_build_step_prompt_section(current_step))

    return "\n".join(parts)


def _build_step_prompt_section(step: dict) -> str:
    """Format a single step's instructions into the prompt block."""
    parts = []

    section_num = step.get("section_number", "")
    title = step["title"]
    header = f"{section_num}: {title}" if section_num else title

    parts.append(f"\n\n--- CURRENT SECTION: {header} ---")
    parts.append(f"\nObjective: {step['objective']}")

    if step.get("description"):
        parts.append(f"\nDescription: {step['description']}")
    if step.get("what_is_needed"):
        parts.append(f"\nWhat is needed: {step['what_is_needed']}")
    if step.get("instructions"):
        parts.append(f"\nInstructions: {step['instructions']}")
    if step.get("questions"):
        parts.append("\nQuestions to cover:")
        for i, q in enumerate(step["questions"], 1):
            parts.append(f"  {i}. {q}")
    if step.get("examples"):
        parts.append(f"\nExample: {step['examples']}")

    parts.append("\n--- END CURRENT SECTION ---")
    return "\n".join(parts)


def build_collected_data_summary(state: dict, workflow: dict) -> str:
    """Summarize what has been collected from all completed steps."""
    summaries = []

    for step in workflow["steps"]:
        step_id = step["id"]
        step_state = state["step_data"].get(step_id, {})

        if step_state.get("status") not in ("done", "active"):
            continue

        collected = step_state.get("collected", [])
        if not collected:
            continue

        section_label = step.get("section_number", "")
        title = step["title"]
        header = f"{section_label}: {title}" if section_label else title

        user_answers = []
        for exchange in collected:
            user_text = exchange.get("user", "").strip()
            if user_text and user_text.lower() not in ("next", "start", "quit", "skip"):
                user_answers.append(user_text)

        if user_answers:
            combined = "\n".join(f"  - {a}" for a in user_answers)
            summaries.append(f"[{header}]\n{combined}")

    if not summaries:
        return ""

    return (
        "\n\n=== PREVIOUSLY COLLECTED INFORMATION ===\n\n"
        + "\n\n".join(summaries)
        + "\n\n=== END PREVIOUSLY COLLECTED INFORMATION ==="
    )


def build_step_actions(step: dict, state: dict) -> list[dict]:
    """Build deterministic action buttons from a workflow step's questions."""
    actions = []
    for q in step.get("questions", []):
        label = q if len(q) <= 60 else q[:57] + "..."
        actions.append({"label": label, "action": "send", "value": q})
    actions.append({"label": "Next section \u2192", "action": "command", "value": "next"})
    if step.get("allow_skip"):
        actions.append({"label": "Skip", "action": "command", "value": "skip"})
    actions.append({"label": "Exit module", "action": "command", "value": "quit"})
    return actions


def build_completion_actions(workflow: dict) -> list[dict]:
    """Build action buttons for a completed workflow."""
    return [
        {"label": "Start another module", "action": "command", "value": "quit"},
    ]


def detect_command(user_input: str, state: dict) -> str | None:
    """Check if user input is a workflow command."""
    cleaned = user_input.strip().lower()

    if cleaned == state["trigger"].lower():
        return "trigger"
    if cleaned == state["advance_command"].lower():
        return "advance"
    if cleaned == state["cancel_command"].lower():
        return "cancel"
    if cleaned == "skip":
        return "skip"

    return None


def get_progress(state: dict, workflow: dict) -> dict:
    """Return progress info."""
    steps = workflow["steps"]
    total = len(steps)
    current_idx = state["current_step_index"]

    if state["completed"]:
        current_step_num = total
        current_title = "Complete!"
        percent = 100
    else:
        current_step_num = current_idx + 1
        current_title = steps[current_idx]["title"] if current_idx < total else "Complete!"
        percent = int((current_idx / total) * 100)

    step_list = []
    for i, step in enumerate(steps):
        step_id = step["id"]
        step_state = state["step_data"].get(step_id, {})
        status = step_state.get("status", "pending")

        if i == current_idx and not state["completed"]:
            status = "active"

        step_list.append({
            "title": step["title"],
            "section_number": step.get("section_number", ""),
            "status": status,
        })

    return {
        "current_step": current_step_num,
        "total_steps": total,
        "percent": percent,
        "current_title": current_title,
        "steps": step_list,
    }
