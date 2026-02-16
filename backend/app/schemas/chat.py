from typing import Dict, List

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    original_response: str
    security_report: Dict[str, List[str]]
