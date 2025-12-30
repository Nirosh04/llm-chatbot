from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Message(BaseModel):
    content: str

class SessionResponse(BaseModel):
    session_id: str

class ModelReply(BaseModel):
    reply: str
    tokens_used: Optional[int] = None

class MessageResponse(BaseModel):
    id: str
    content: str
    is_ai: bool
    created_at: datetime

class SessionDetail(BaseModel):
    session_id: str
    messages: List[MessageResponse]

class HealthStatus(BaseModel):
    status: str
    services: dict

class ResetResponse(BaseModel):
    reset: bool
    session_id: str
    message: str

class SummaryResponse(BaseModel):
    summary: str
    created_at: datetime
