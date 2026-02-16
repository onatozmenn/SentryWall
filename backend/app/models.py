from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    user_id: str = Field(default="anonymous", index=True)
    content_length: int
    pii_detected: str
    risk_level: str
    action: str
