from fastapi import APIRouter, Depends, HTTPException
from services.states.sampler_state import SamplerState
from models import (
    Message,
    ResetResponse, 
    SessionResponse, 
    ModelReply, 
    SessionDetail, 
    SummaryResponse
)
from services.session_service import SessionService
from services.ollama_service import OllamaService
from database import DatabaseService
import logging

logger = logging.getLogger(__name__)

# Create routers
session_router = APIRouter(prefix="/api/sessions", tags=["Sessions"])
health_router = APIRouter(tags=["Health"])

# Initialize services
session_service = SessionService()
ollama_service = OllamaService()
db_service = DatabaseService()

# Routes
# POST ".../api/sessions/"
@session_router.post("", response_model=SessionResponse)
async def create_session():
    """Create a new patient session."""
    session_id = session_service.create_session()
    return {"session_id": session_id}

# JSON default (non-streaming)
@session_router.post("/{session_id}/get-llm-response", response_model=ModelReply)
async def send_message(session_id: str, message: Message):
    """Send patient message and receive AI reply as JSON."""
    result = await session_service.process_message(session_id, message.content)
    return result

# GET ".../api/sessions/{session_id}"
@session_router.get("/{session_id}", response_model=SessionDetail)
async def get_session(session_id: str):
    """Get session details and messages."""
    return session_service.get_session_details(session_id)

# DELETE ".../api/sessions/{session_id}"
@session_router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete session and associated data."""
    return session_service.delete_session(session_id)

# POST ".../api/sessions/{session_id}/reset"
@session_router.post("/{session_id}/reset", response_model=ResetResponse)
async def reset_conversation(session_id: str):
    """Reset conversation history for a session."""
    return await session_service.reset_session(session_id)

# GET ".../api/sessions/{session_id}/summary"
@session_router.get("/{session_id}/summary", response_model=SamplerState)
async def generate_summary(session_id: str):
    """Generate a summary of the patient's anamnesis."""
    return await session_service.fetch_user_sampler(session_id)

# GET ".../health"
@health_router.get("/health")
async def health_check():
    """Health check endpoint to verify database and Ollama connection."""
    health_status = {"status": "healthy", "services": {}}
    # Check database
    if db_service.check_connection():
        health_status["services"]["database"] = "connected"
    else:
        health_status["status"] = "degraded"
        health_status["services"]["database"] = "error"
    # Check Ollama
    if await ollama_service.check_connection():
        health_status["services"]["ollama"] = "connected"
    else:
        health_status["status"] = "degraded"
        health_status["services"]["ollama"] = "error"
    
    if health_status["status"] != "healthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status