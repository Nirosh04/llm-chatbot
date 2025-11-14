from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from typing import List
import uuid
from datetime import datetime, timezone
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn
import sys
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.abspath('../3_backend')) # to import llm service
import llm_service
llm_svc = llm_service.LLMService() 



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


logger.info(llm_service.test())



# Create the FastAPI app
app = FastAPI(
    title="Hospital Assistant API",
    description="API for managing patient sessions and AI-assisted anamnesis.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_session_id(simplified_db_modality = True):
    '''
    Returns a fixed session ID if simplified mode is enabled,
    otherwise generates a unique UUID-based session ID.
    '''
    if simplified_db_modality:
        return "11111111"
    else:
        return str(uuid.uuid4())


# -----------------------------------------------------------------------------
# SETTINGS
# -----------------------------------------------------------------------------

# Flag for simplified mode
simplified_db_mode = True




# -----------------------------------------------------------------------------
# DATABASE HANDLING
# -----------------------------------------------------------------------------
def get_db_connection():
    database_url = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/aicompanion"
    )
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    return conn

# Simple in-memory "database" when simplified mode is active
if simplified_db_mode:
    simple_db = {
        "sessions": {},  # session_id -> {"created_at": ..., "updated_at": ..., "messages": []}
    }

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


# -----------------------------------------------------------------------------
# ROUTES
# -----------------------------------------------------------------------------

# check signal 

@app.api_route("/check_signal", methods=["POST", "OPTIONS"], response_model=SignalResponse)
async def check_signal():
    # Return a single number in a JSON response
    return SignalResponse(prediction=1)







@app.api_route("/api/sessions", methods=["POST", "OPTIONS"], response_model=SessionResponse)
async def create_session():
    """Create a new patient session."""
    if simplified_db_mode:
        session_id = get_session_id(simplified_db_mode)
        simple_db["sessions"][session_id] = {
            #"created_at": datetime.now(timezone.utc),
            #"updated_at": datetime.now(timezone.utc),
            "messages": [],
        }
        logger.info(f"[Memory] Created new session: {session_id}")
        return {"session_id": session_id}

    # Normal DB mode
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            session_id = get_session_id(simplified_db_mode)
            cur.execute("INSERT INTO sessions (id) VALUES (%s) RETURNING id", (session_id,))
            conn.commit()
            logger.info(f"Created new session: {session_id}")
            return {"session_id": session_id}
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")
    finally:
        conn.close()


@app.api_route("/api/sessions/{session_id}/get-llm-response", methods=["POST", "OPTIONS"], response_model=ModelReply)
async def send_message(session_id: str, message: Message):
    """Send patient message and receive AI reply."""
    if simplified_db_mode:
        session = simple_db["sessions"].get(session_id)
        if not session:
            print('debug info - in if-clause')
            raise HTTPException(status_code=404, detail="Session not found")

        # Add patient message
        msg_id = get_session_id(simplified_db_mode)
        session["messages"].append({
            "id": msg_id,
            "content": message.content,
            "is_ai": False,
            "created_at": datetime.now(timezone.utc),
        })

        # Simulate AI response
        #ai_response = f"AI response to: {message.content} (this is a simulated response)"
        ai_response = llm_svc.generate(message.content)


        ai_msg_id = get_session_id(simplified_db_mode)
        session["messages"].append({
            "id": ai_msg_id,
            "content": ai_response,
            "is_ai": True,
            "created_at": datetime.now(timezone.utc),
        })

        session["updated_at"] = datetime.now(timezone.utc),

        logger.info(f"[Memory] Processed message for session: {session_id}")
        return {"reply": ai_response}

    # Normal DB mode
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")

            cur.execute(
                "INSERT INTO messages (session_id, content, is_ai) VALUES (%s, %s, %s)",
                (session_id, message.content, False)
            )
            ai_response = f"AI response to: {message.content} (this is a simulated response)"
            cur.execute(
                "INSERT INTO messages (session_id, content, is_ai) VALUES (%s, %s, %s)",
                (session_id, ai_response, True)
            )
            cur.execute("UPDATE sessions SET updated_at = NOW() WHERE id = %s", (session_id,))
            conn.commit()
            logger.info(f"Processed message for session: {session_id}")
            return {"reply": ai_response}
    except Exception as e:
        conn.rollback()
        logger.error(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message")
    finally:
        conn.close()


@app.api_route("/api/sessions/{session_id}", methods=["GET", "OPTIONS"], response_model=SessionDetail)
async def get_session(session_id: str):
    """Get session details and messages."""
    if simplified_db_mode:
        session = simple_db["sessions"].get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return {
            "session_id": session_id,
            "messages": session["messages"]
        }

    # Normal DB mode
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
            session = cur.fetchone()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")

            cur.execute("""
                SELECT id, content, is_ai, created_at 
                FROM messages 
                WHERE session_id = %s 
                ORDER BY created_at
            """, (session_id,))
            messages = cur.fetchall()
            return {
                "session_id": session_id,
                "messages": [
                    {
                        "id": str(msg["id"]),
                        "content": msg["content"],
                        "is_ai": msg["is_ai"],
                        "created_at": msg["created_at"]
                    } for msg in messages
                ]
            }
    except Exception as e:
        logger.error(f"Error retrieving session: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session")
    finally:
        conn.close()


@app.api_route("/api/sessions/{session_id}", methods=["DELETE", "OPTIONS"])
async def delete_session(session_id: str):
    """Delete session and associated data."""
    if simplified_db_mode:
        if session_id not in simple_db["sessions"]:
            raise HTTPException(status_code=404, detail="Session not found")
        del simple_db["sessions"][session_id]
        logger.info(f"[Memory] Deleted session: {session_id}")
        return {"deleted": True, "session_id": session_id}

    # Normal DB mode
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM sessions WHERE id = %s", (session_id,))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Session not found")
            conn.commit()
            logger.info(f"Deleted session: {session_id}")
            return {"deleted": True, "session_id": session_id}
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete session")
    finally:
        conn.close()


@app.api_route("/health", methods=["GET", "OPTIONS"])
async def health_check():
    """Health check endpoint to verify database connection."""
    if simplified_db_mode:
        return {"status": "healthy", "database": "in-memory"}
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {e}")


