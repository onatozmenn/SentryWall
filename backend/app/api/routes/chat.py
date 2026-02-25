import logging
from typing import List, cast

from fastapi import APIRouter, Depends, HTTPException
from openai import AsyncAzureOpenAI
from sqlmodel import Session

from app.core.config import settings
from app.database import get_session
from app.models import AuditLog
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.pii_handler import PIIHandler

router = APIRouter(prefix="/chat", tags=["chat"])
pii_handler = PIIHandler()
logger = logging.getLogger(__name__)
SYSTEM_PROMPT = (
    "You are a helpful, security-conscious enterprise assistant. "
    "You are receiving data that has already been redacted for privacy. "
    "Answer the user's question helpfully based on the redacted context."
)
BLOCKED_RESPONSE = (
    "Request blocked: high-risk sensitive data was detected and the message was "
    "not sent to the AI model."
)
HIGH_RISK_TYPES = {"API Key", "TCKN", "Credit Card", "Payment"}
MEDIUM_RISK_TYPES = {"Email", "Phone", "IBAN", "Address"}
LOW_RISK_TYPES = {"IP Address"}


def _get_azure_client() -> AsyncAzureOpenAI:
    if (
        not settings.azure_openai_api_key
        or not settings.azure_openai_endpoint
        or not settings.azure_openai_deployment_name
    ):
        raise HTTPException(
            status_code=500, detail="Azure OpenAI is not configured."
        )

    return AsyncAzureOpenAI(
        api_key=settings.azure_openai_api_key,
        azure_endpoint=settings.azure_openai_endpoint,
        api_version=settings.azure_openai_api_version,
    )


async def _generate_ai_response(cleaned_text: str) -> str:
    client = _get_azure_client()

    try:
        completion = await client.chat.completions.create(
            model=settings.azure_openai_deployment_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": cleaned_text},
            ],
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Azure OpenAI request failed.")
        raise HTTPException(
            status_code=500, detail="Azure OpenAI request failed."
        ) from None

    message_content = ""
    if completion.choices and completion.choices[0].message:
        message_content = completion.choices[0].message.content or ""

    if not isinstance(message_content, str) or not message_content.strip():
        raise HTTPException(
            status_code=500, detail="Azure OpenAI returned an empty response."
        )

    return message_content


def _derive_audit_fields(redacted_items: List[str]) -> tuple[str, str, str]:
    if not redacted_items:
        return "None", "Low", "Allowed"

    pii_detected = ",".join(redacted_items)

    if any(item in HIGH_RISK_TYPES for item in redacted_items):
        return pii_detected, "High", "Blocked"

    if any(item in MEDIUM_RISK_TYPES for item in redacted_items):
        return pii_detected, "Medium", "Redacted"

    if any(item in LOW_RISK_TYPES for item in redacted_items):
        return pii_detected, "Low", "Redacted"

    return pii_detected, "Medium", "Redacted"


@router.post("/secure", response_model=ChatResponse)
async def secure_chat(
    request: ChatRequest, session: Session = Depends(get_session)
) -> ChatResponse:
    scrubbed_payload = pii_handler.scrub_text(request.message)
    cleaned_text = cast(str, scrubbed_payload["cleaned_text"])
    redacted_items = cast(List[str], scrubbed_payload["redacted_items"])
    pii_detected, risk_level, action = _derive_audit_fields(redacted_items)

    log_entry = AuditLog(
        user_id="anonymous",
        content_length=len(request.message),
        pii_detected=pii_detected,
        risk_level=risk_level,
        action=action,
    )

    try:
        session.add(log_entry)
        session.commit()
        session.refresh(log_entry)
    except Exception:
        session.rollback()
        logger.exception("Failed to persist audit log.")
        raise HTTPException(
            status_code=500, detail="Failed to persist audit log."
        ) from None

    if action == "Blocked":
        return ChatResponse(
            original_response=BLOCKED_RESPONSE,
            security_report={"redacted_items": redacted_items},
        )

    ai_reply = await _generate_ai_response(cleaned_text)

    return ChatResponse(
        original_response=ai_reply,
        security_report={"redacted_items": redacted_items},
    )
