
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import llm_service
llm_svc = llm_service.LLMService() 

import utils
config = utils.load_config()
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
    allow_origins=["*"], # this needs to be changed for security purposes (okay for development though) --> only whitelist frontend domain
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
simplified_db_mode = config['activate_simplified_dict_database']




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

class SummaryResponse(BaseModel):
    summary: str
    created_at: datetime



class ResetResponse(BaseModel):
    reset: bool
    session_id: str
    message: str



# -----------------------------------------------------------------------------
# ROUTES
# -----------------------------------------------------------------------------

# ========== CHECK SIGNAL ==========

@app.api_route("/check_signal", methods=["POST", "OPTIONS"], response_model=SignalResponse)
async def check_signal():
    # Return a single number in a JSON response
    return SignalResponse(prediction=1)




# ========== CREATE SESSIONS ==========

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



# ========== GET LLM RESPONSE ==========

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




# ========== GET SESSION DETAILS ==========

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



# ========== DELETE SESSION ID ==========

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



# ========== RESET CONVERSATION ==========

@app.api_route("/api/sessions/{session_id}/reset", methods=["POST", "OPTIONS"], response_model=ResetResponse)
async def reset_conversation(session_id: str):
    """
    Reset conversation history while keeping the session active.
    
    Useful for:
    - Starting a new topic within the same session
    - Testing the companion without creating new sessions
    - Clearing sensitive information while maintaining session context
    """
    if simplified_db_mode:
        session = simple_db["sessions"].get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Clear messages
        message_count = len(session["messages"])
        session["messages"] = []
        session["updated_at"] = datetime.now(timezone.utc)
        
        # Reset LLM service conversation history
        llm_svc.reset()
        
        logger.info(f"[Memory] Reset conversation for session: {session_id} ({message_count} messages cleared)")
        return {
            "reset": True,
            "session_id": session_id,
            "message": f"Conversation reset. Cleared {message_count} messages."
        }
    
    # Normal DB mode
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")
            
            # Count messages before deletion
            cur.execute("SELECT COUNT(*) FROM messages WHERE session_id = %s", (session_id,))
            message_count = cur.fetchone()['count']
            
            # Delete all messages for this session
            cur.execute("DELETE FROM messages WHERE session_id = %s", (session_id,))
            cur.execute("UPDATE sessions SET updated_at = NOW() WHERE id = %s", (session_id,))
            conn.commit()
            
            # Reset LLM service
            llm_svc.reset()
            
            logger.info(f"Reset conversation for session: {session_id} ({message_count} messages cleared)")
            return {
                "reset": True,
                "session_id": session_id,
                "message": f"Conversation reset. Cleared {message_count} messages."
            }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error resetting conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset conversation")
    finally:
        conn.close()


# ========== HEALTH SUMMARY ==========


# is missing a real function to get demographic data of patient
@app.api_route("/api/sessions/{session_id}/summary", methods=["GET", "OPTIONS"], response_model=SummaryResponse)
async def generate_summary(session_id: str):
    """
    Generate medical summary from conversation for ER staff.
    
    This endpoint extracts key medical information from the patient conversation
    and formats it for medical staff. 
    this should include: main complaint, key symptoms, relevant history, and red flags.
    """
    if simplified_db_mode:
        session = simple_db["sessions"].get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if not session["messages"]:
            raise HTTPException(status_code=400, detail="No messages in session to summarize")

        # Ask LLM to generate structured medical summary
        summary_prompt = f"""Based on this conversation between a patient and Lumee (ER companion), create a brief medical summary for the healthcare team.
        Demographic data:
        {'Sarah - 23 years old - From Hannover.'}
        Conversation:
        {llm_svc.get_transcript()}
        Format the summary in this json structure:
        {utils.get_health_summary_json_structure(as_str = True)}
        Be concise and medically relevant. No text outside of the json structure. Must be parseable by Flutter/dart's json.decode()."""
        
        
        summary = llm_svc.generate(summary_prompt)
        
        logger.info(f"[Memory] Generated summary for session: {session_id}")
        return {
            "summary": summary,
            "created_at": datetime.now(timezone.utc)
        }
    
    # Normal DB mode
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")
            
            cur.execute("""
                SELECT content, is_ai 
                FROM messages 
                WHERE session_id = %s 
                ORDER BY created_at
            """, (session_id,))
            messages = cur.fetchall()
            
            if not messages:
                raise HTTPException(status_code=400, detail="No messages in session to summarize")

            
            summary_prompt = f"""Based on this conversation between a patient and Lumee (ER companion), create a brief medical summary for the healthcare team.
            Demographic data:
            {'Sarah - 23 years old - From Hannover.'}
            Conversation:
            {llm_svc.get_transcript()}
            Format the summary in this json structure:
            {utils.get_health_summary_json_structure(as_str = True)}
            Be concise and medically relevant. No text outside of the json structure. Must be parseable by Flutter/dart's json.decode()."""
            
            summary = llm_svc.generate(summary_prompt)
            
            logger.info(f"Generated summary for session: {session_id}")
            return {
                "summary": summary,
                "created_at": datetime.now(timezone.utc)
            }
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")
    finally:
        conn.close()


# ========== GET HEALTH?? ==========

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


