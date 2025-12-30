import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from settings import settings
import logging

logger = logging.getLogger(__name__)

@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = psycopg2.connect(settings.DATABASE.URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

class DatabaseService:
    """Service for database operations."""
    
    @staticmethod
    def create_session(session_id: str):
        """Create a new session in the database."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO sessions (id) VALUES (%s) RETURNING id",
                    (session_id,)
                )
                conn.commit()
                return session_id
    
    @staticmethod
    def session_exists(session_id: str) -> bool:
        """Check if a session exists."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
                return cur.fetchone() is not None
    
    @staticmethod
    def save_message(session_id: str, content: str, is_ai: bool):
        """Save a message to the database."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO messages (session_id, content, is_ai) VALUES (%s, %s, %s)",
                    (session_id, content, is_ai)
                )
                conn.commit()
    
    @staticmethod
    def update_session_timestamp(session_id: str):
        """Update the session's last updated timestamp."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE sessions SET updated_at = NOW() WHERE id = %s",
                    (session_id,)
                )
                conn.commit()
    
    @staticmethod
    def get_conversation_history(session_id: str, limit: int = 20) -> list:
        """Retrieve conversation history for a session."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT content, is_ai 
                    FROM messages 
                    WHERE session_id = %s 
                    ORDER BY created_at
                    LIMIT %s
                """, (session_id, limit))
                messages = cur.fetchall()
                
                return [
                    {
                        "role": "assistant" if msg["is_ai"] else "user",
                        "content": msg["content"]
                    }
                    for msg in messages
                ]
    
    @staticmethod
    def get_session_details(session_id: str):
        """Get session with all messages."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Get session
                cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
                session = cur.fetchone()
                if not session:
                    return None
                
                # Get messages
                cur.execute("""
                    SELECT id, content, is_ai, created_at 
                    FROM messages 
                    WHERE session_id = %s 
                    ORDER BY created_at
                """, (session_id,))
                messages = cur.fetchall()
                
                return {
                    "session_id": session_id,
                    "messages": messages
                }
    
    @staticmethod
    def delete_session(session_id: str) -> int:
        """Delete a session and return number of rows affected."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM sessions WHERE id = %s", (session_id,))
                affected_rows = cur.rowcount
                conn.commit()
                return affected_rows
            
    @staticmethod
    def clear_messages(session_id: str):
        """Clear all messages for a session."""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM messages WHERE session_id = %s", (session_id,))
                conn.commit()
    
    @staticmethod
    def check_connection() -> bool:
        """Check database connection."""
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            return False