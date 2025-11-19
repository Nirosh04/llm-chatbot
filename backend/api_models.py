from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

# -----------------------------------------------------------------------------
# JSON STRUCTURE
# -----------------------------------------------------------------------------




class SignalResponse(BaseModel):
    prediction: int


class Message(BaseModel):
    content: str

class SessionResponse(BaseModel):
    session_id: str

class ModelReply(BaseModel):
    reply: str

class MessageResponse(BaseModel):
    id: str
    content: str
    is_ai: bool
    created_at: datetime

class SessionDetail(BaseModel):
    session_id: str
    messages: List[MessageResponse]

class SummaryResponse(BaseModel):
    summary: str
    created_at: datetime



class ResetResponse(BaseModel):
    reset: bool
    session_id: str
    message: str

