import json
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_lawyer
from app.core.database import supabase
from app.core.config import settings
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/api/ai", tags=["AI"])

class SummarizeRequest(BaseModel):
    document_id: str

class DraftContractRequest(BaseModel):
    template_type: str
    parameters: dict
    case_id: Optional[str] = None

class CaseAssistantRequest(BaseModel):


    case_id: str

   


    question: str

class SuggestActionsRequest(BaseModel):
    case_id: str

class VoiceAssistantRequest(BaseModel):
    transcript: str
    extracted: Optional[Dict[str, Any]] = None  # Previously collected context

def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    from openai import OpenAI
    return OpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/summarize")
async def summarize_document(body: SummarizeRequest, current_user=Depends(get_lawyer)):
    doc = supabase.table("document").select("*").eq("id", body.document_id).single().execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Document not found")

    client = get_openai_client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"Summarize this legal document titled '{doc.data['file_name']}'. Extract key clauses, parties, dates, and obligations. Return a structured summary."
        }]
    )
    summary = response.choices[0].message.content

    supabase.table("ai_summary").insert({
        "document_id": body.document_id,
        "summary": summary,
        "lawyer_id": current_user["id"],
    }).execute()

    return {"summary": summary}

@router.post("/draft-contract")
async def draft_contract(body: DraftContractRequest, current_user=Depends(get_lawyer)):
    client = get_openai_client()
    params_str = "\n".join([f"- {k}: {v}" for k, v in body.parameters.items()])

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "You are an expert legal assistant. Draft professional legal contracts."
        }, {
            "role": "user",
            "content": f"Draft a {body.template_type} contract with these parameters:\n{params_str}\n\nReturn a complete, professional legal contract."
        }],
        max_tokens=3000
    )
    contract = response.choices[0].message.content

    session = supabase.table("ai_session").insert({
        "lawyer_id": current_user["id"],
        "firm_id": current_user["firm_id"],
        "case_id": body.case_id,
        "prompt": f"Draft {body.template_type} contract",
        "output": contract,
        "session_type": "CONTRACT_DRAFT",
    }).execute()

    return {"contract": contract, "session_id": session.data[0]["id"]}

@router.post("/suggest-actions")
async def suggest_actions(body: SuggestActionsRequest, current_user=Depends(get_lawyer)):
    case = supabase.table("case_file").select("*").eq("id", body.case_id).single().execute()
    if not case.data:
        raise HTTPException(status_code=404, detail="Case not found")

    c = case.data
    client = get_openai_client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "You are an expert legal advisor. Suggest the next procedural steps for cases."
        }, {
            "role": "user",
            "content": f"Case: {c['title']}\nType: {c['case_type']}\nStatus: {c['status']}\nPriority: {c['priority']}\n\nWhat are the next 5 recommended legal steps?"
        }]
    )
    suggestions = response.choices[0].message.content
    return {"suggestions": suggestions}

@router.post("/case-assistant")
async def case_assistant(body: CaseAssistantRequest, current_user=Depends(get_lawyer)):


    case = supabase.table("case_file").select("*").eq("id", body.case_id).single().execute()
    if not case.data:
        raise HTTPException(status_code=404, detail="Case not found")


    if body.case_id:
        case = supabase.table("case_file").select("*").eq("id", body.case_id).single().execute()
        if not case.data:
            raise HTTPException(status_code=404, detail="Case not found")
        c = case.data
        system_prompt = (
            f"You are an AI legal assistant for this case:\n"
            f"Title: {c['title']}\nType: {c['case_type']}\n"
            f"Status: {c['status']}\nDescription: {c.get('description', 'N/A')}"
        )
    else:
        system_prompt = (
            "You are an expert AI legal assistant. "
            "Help lawyers with legal questions, case strategy, document drafting, "
            "research, and procedural guidance. Be concise and professional."
        )

    response = openai_client.chat.completions.create(
        model="gpt-4o",

        messages=[{
            "role": "system",
            "content": f"You are an AI legal assistant for this case:\nTitle: {c['title']}\nType: {c['case_type']}\nStatus: {c['status']}\nDescription: {c.get('description', 'N/A')}"
        }, {
            "role": "user",
            "content": body.question
        }]


    )
    answer = response.choices[0].message.content
    return {"answer": answer}

@router.post("/voice-assistant")
async def voice_assistant(body: VoiceAssistantRequest, current_user=Depends(get_lawyer)):
    if not settings.MISTRAL_API_KEY:
        raise HTTPException(status_code=503, detail="Mistral AI not configured")

    from openai import OpenAI as _OAI
    mistral = _OAI(base_url="https://api.mistral.ai/v1", api_key=settings.MISTRAL_API_KEY)

    # ── Fetch active cases for this firm ──────────────────────────
    cases_res = (
        supabase.table("case_file")
        .select("id, title, case_number")
        .eq("firm_id", current_user["firm_id"])
        .neq("status", "CLOSED")
        .order("updated_at", desc=True)
        .limit(40)
        .execute()
    )
    cases = cases_res.data or []
    cases_list = "\n".join(
        f'  • "{c["title"]}" — #{c["case_number"]} (id: {c["id"]})' for c in cases
    ) or "  No active cases found."

    # ── Previously collected context ──────────────────────────────
    prev = body.extracted or {}
    prev_summary = (
        f'Title   : {prev.get("title")   or "not yet provided"}\n'
        f'Content : {prev.get("content") or "not yet provided"}\n'
        f'Case    : {prev.get("case_name") or prev.get("case_id") or "not yet selected"}'
    )

    # ── Function / Tool definition ────────────────────────────────
    tools = [
        {
            "type": "function",
            "function": {
                "name": "save_voice_note",
                "description": (
                    "Called after extracting all available note information from the voice transcript. "
                    "Always call this function — even if some fields are missing."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Title or subject of the note",
                        },
                        "content": {
                            "type": "string",
                            "description": "Main body / content of the note",
                        },
                        "case_id": {
                            "type": "string",
                            "description": "UUID of the matched case from the available cases list",
                        },
                        "case_name": {
                            "type": "string",
                            "description": "Human-readable name of the matched case (for UI display)",
                        },
                        "missing": {
                            "type": "array",
                            "items": {"type": "string", "enum": ["title", "content", "case_id"]},
                            "description": (
                                "List of fields still missing AFTER merging the new transcript "
                                "with the previously collected data."
                            ),
                        },
                    },
                    "required": ["missing"],
                },
            },
        }
    ]

    system = (
        "You are a voice assistant for a law firm. "
        "Extract structured note data from the lawyer's voice transcript.\n\n"
        f"Available cases:\n{cases_list}\n\n"
        f"Previously collected data:\n{prev_summary}\n\n"
        "Rules:\n"
        "1. Extract title, content, and linked case from the NEW transcript.\n"
        "2. Merge with previously collected data — keep previous values if the new "
        "   transcript doesn't override them.\n"
        "3. Match any mentioned case name/number to one from the list above and use its UUID as case_id.\n"
        "4. After merging, report which of [title, content, case_id] are STILL missing.\n"
        "5. Always call save_voice_note — never respond with plain text."
    )

    resp = mistral.chat.completions.create(
        model="mistral-small-latest",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": body.transcript},
        ],
        tools=tools,
        tool_choice="required",
    )

    msg = resp.choices[0].message
    if not msg.tool_calls:
        raise HTTPException(status_code=502, detail="Model did not invoke the tool")

    args = json.loads(msg.tool_calls[0].function.arguments)

    # ── Merge new extraction with previous context ────────────────
    merged: Dict[str, Any] = {
        "title":     args.get("title")     or prev.get("title"),
        "content":   args.get("content")   or prev.get("content"),
        "case_id":   args.get("case_id")   or prev.get("case_id"),
        "case_name": args.get("case_name") or prev.get("case_name"),
    }

    # Real missing check after merge
    missing = [f for f in ("title", "content", "case_id") if not merged.get(f)]

    if missing:
        label = {"title": "a title", "content": "the note content", "case_id": "the linked case"}
        parts = [label[f] for f in missing]
        if len(parts) == 1:
            question = f"Could you please provide {parts[0]}?"
        elif len(parts) == 2:
            question = f"I still need {parts[0]} and {parts[1]}. Could you say them?"
        else:
            question = (
                "I need three things: the note title, the content, and which case to link it to. "
                "Please say all three."
            )
        return {
            "status":    "missing",
            "extracted": merged,
            "missing":   missing,
            "question":  question,
        }

    # ── All data present → save the note ─────────────────────────
    note_content = f"{merged['title']}\n\n{merged['content']}"
    note_res = supabase.table("note").insert({
        "firm_id":      current_user["firm_id"],
        "case_id":      merged["case_id"],
        "lawyer_id":    current_user["id"],
        "content":      note_content,
        "is_voice_note": True,
    }).execute()

    supabase.table("case_timeline").insert({
        "case_id":      merged["case_id"],
        "firm_id":      current_user["firm_id"],
        "action":       f"Voice note added: {merged['title']}",
        "performed_by": current_user["id"],
    }).execute()

    case_display = merged.get("case_name") or merged["case_id"]
    message = f"Done! Note \"{merged['title']}\" has been saved for {case_display}."

    return {
        "status":    "complete",
        "extracted": merged,
        "message":   message,
        "note":      note_res.data[0] if note_res.data else {},
    }

@router.get("/history")
async def ai_history(current_user=Depends(get_lawyer)):
    result = supabase.table("ai_session").select("*").eq("lawyer_id", current_user["id"]).order("created_at", desc=True).limit(50).execute()
    return result.data