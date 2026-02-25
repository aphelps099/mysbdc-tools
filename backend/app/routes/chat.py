"""POST /api/chat — Streaming chat via Server-Sent Events (SSE)."""

import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..models.schemas import ChatRequest
from ..config import MODEL_NAME
from ..services.llm_client import (
    stream_chat_async,
    needs_compliance_footer,
    get_system_prompt,
    LLMError,
)
from ..services.rag import build_augmented_prompt
from ..services.workflow_engine import (
    load_workflow,
    build_workflow_system_prompt,
    init_workflow_state,
    detect_command,
    advance_step,
    cancel_workflow,
    get_current_step,
    collect_exchange,
    build_step_actions,
    build_completion_actions,
)
from ..services.conversations import (
    save_message,
    get_workflow_state,
    save_workflow_state,
)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Stream a chat completion as Server-Sent Events.

    SSE event types:
    - {"type": "keepalive"} — connection is alive (sent immediately)
    - {"type": "token", "content": "..."} — text chunk
    - {"type": "done", "usage": {...}} — completion
    - {"type": "compliance", "required": true} — compliance footer needed
    - {"type": "error", "message": "..."} — error
    """

    convo_id = request.conversation_id

    async def generate():
        # Send keepalive immediately so Railway's proxy flushes headers
        # and the client knows the connection is alive
        yield f"data: {json.dumps({'type': 'keepalive'})}\n\n"

        try:
            # Build messages from conversation history
            messages = [
                {"role": m.role, "content": m.content}
                for m in request.conversation_history
            ]

            # If RAG is enabled, augment the user's message with document context
            user_message = request.message
            if request.use_rag:
                augmented, _sources = build_augmented_prompt(user_message)
                user_message = augmented

            messages.append({"role": "user", "content": user_message})

            # Save user message to conversation (use original message, not RAG-augmented)
            if convo_id:
                try:
                    save_message(convo_id, "user", request.message)
                except Exception:
                    pass  # Don't fail chat if persistence fails

            # Build system prompt (with workflow overlay if active)
            system_prompt = get_system_prompt()
            workflow = None
            wf_state = None

            # Load existing workflow state from conversation
            if convo_id:
                stored_wf_id, stored_state = get_workflow_state(convo_id)
                if stored_wf_id and stored_state and stored_state.get("active"):
                    workflow = load_workflow(stored_wf_id)
                    wf_state = stored_state

            # Start a new workflow if requested and none is active
            if request.workflow_id and not wf_state:
                workflow = load_workflow(request.workflow_id)
                if workflow:
                    wf_state = init_workflow_state(workflow)
                    wf_state["started"] = True
                    first_step_id = workflow["steps"][0]["id"]
                    wf_state["step_data"][first_step_id]["status"] = "active"

            # Detect workflow commands before sending to LLM
            if workflow and wf_state and wf_state.get("active"):
                command = detect_command(request.message, wf_state)
                if command == "advance":
                    wf_state = advance_step(wf_state, workflow)
                elif command == "cancel":
                    wf_state = cancel_workflow(wf_state)
                elif command == "skip":
                    current = get_current_step(wf_state, workflow)
                    if current and current.get("allow_skip"):
                        wf_state = advance_step(wf_state, workflow)

                system_prompt = build_workflow_system_prompt(
                    system_prompt, workflow, wf_state
                )

            # Stream from LLM
            full_response_parts: list[str] = []
            async for chunk in stream_chat_async(
                messages=messages,
                system_prompt=system_prompt,
                model=request.model,
                workflow_id=request.workflow_id,
            ):
                full_response_parts.append(chunk)
                event = json.dumps({"type": "token", "content": chunk})
                yield f"data: {event}\n\n"

            full_response = "".join(full_response_parts)

            # Check compliance
            compliance_needed = needs_compliance_footer(messages, full_response)
            if compliance_needed:
                event = json.dumps({"type": "compliance", "required": True})
                yield f"data: {event}\n\n"

            # Build workflow actions and persist state
            actions = None
            if workflow and wf_state:
                if wf_state.get("active") and not wf_state.get("completed"):
                    current_step = get_current_step(wf_state, workflow)
                    if current_step:
                        actions = build_step_actions(current_step, wf_state)
                        collect_exchange(wf_state, current_step["id"], request.message, full_response)
                elif wf_state.get("completed"):
                    actions = build_completion_actions(workflow)

                # Persist workflow state
                if convo_id:
                    try:
                        save_workflow_state(convo_id, workflow["id"], wf_state)
                    except Exception:
                        pass

            # Send actions SSE event
            if actions:
                event = json.dumps({"type": "actions", "actions": actions})
                yield f"data: {event}\n\n"

            # Save assistant response to conversation
            metadata = {"actions": actions} if actions else None
            if convo_id:
                try:
                    save_message(convo_id, "assistant", full_response,
                                 has_compliance=compliance_needed, metadata=metadata)
                except Exception:
                    pass

            # Done — include active model so frontend can confirm
            active_model = request.model or MODEL_NAME
            event = json.dumps({"type": "done", "usage": {"input_tokens": 0, "output_tokens": 0}, "model": active_model})
            yield f"data: {event}\n\n"

        except LLMError as e:
            event = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {event}\n\n"
        except Exception as e:
            event = json.dumps({"type": "error", "message": f"Unexpected error: {e}"})
            yield f"data: {event}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
