import uuid
import logging
from fastapi import HTTPException
from typing import Dict
from database import DatabaseService
from services.ollama_service import OllamaService
from settings import settings

logger = logging.getLogger(__name__)

class SessionService:
    """Service for managing patient sessions."""
    
    def __init__(self):
        self.db = DatabaseService()
        self.model = OllamaService()
    
    def create_session(self) -> str:
        """Create a new patient session."""
        try:
            session_id = str(uuid.uuid4())
            self.db.create_session(session_id)
            logger.info(f"Created new session: {session_id}")
            return session_id
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to create session"
            )
    
    async def process_message(
        self, 
        session_id: str, 
        message_content: str
    ) -> Dict:
        """
        Process a user message and get AI response.
        Args:
            session_id: The session ID
            message_content: User's message content
        Returns:
            Dict with reply, model, and tokens_used
        """
        try:
            # Validate session exists
            if not self.db.session_exists(session_id):
                raise HTTPException(
                    status_code=404, 
                    detail="Session not found"
                )
            self.db.save_message(session_id, message_content, is_ai=False)
            history = self.db.get_conversation_history(
                session_id, 
                limit=settings.CONVERSATION.MAX_HISTORY
            )
            ai_result = await self.model.chat(history)
            ai_response = ai_result["content"]
            self.db.save_message(session_id, ai_response, is_ai=True)
            self.db.update_session_timestamp(session_id)
            logger.info(
                f"Processed message for session: {session_id} "
            )
            return {
                "reply": ai_response,
                "tokens_used": ai_result.get("tokens")
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to process message"
            )
    
    def get_session_details(self, session_id: str) -> Dict:
        """Get session details with all messages."""
        try:
            session_data = self.db.get_session_details(session_id)
            if not session_data:
                raise HTTPException(
                    status_code=404, 
                    detail="Session not found"
                )
            return {
                "session_id": session_data["session_id"],
                "messages": [
                    {
                        "id": str(msg["id"]),
                        "content": msg["content"],
                        "is_ai": msg["is_ai"],
                        "created_at": msg["created_at"]
                    }
                    for msg in session_data["messages"]
                ]
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving session: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to retrieve session"
            )
    
    def delete_session(self, session_id: str) -> Dict:
        """Delete a session."""
        try:
            affected_rows = self.db.delete_session(session_id)
            if affected_rows == 0:
                raise HTTPException(
                    status_code=404, 
                    detail="Session not found"
                )
            logger.info(f"Deleted session: {session_id}")
            return {"deleted": True, "session_id": session_id}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to delete session"
            )
    
    async def reset_session(self, session_id: str) -> Dict:
        """Reset conversation history for a session."""
        try:
            if not self.db.session_exists(session_id):
                raise HTTPException(
                    status_code=404, 
                    detail="Session not found"
                )
            self.db.clear_messages(session_id)
            logger.info(f"Reset session: {session_id}")
            return {
                "reset": True,
                "session_id": session_id,
                "message": "Conversation history has been reset."
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error resetting session: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to reset session"
            )
        
    async def generate_summary(self, session_id: str) -> Dict:
        """Generate a summary of the patient's anamnesis."""
        try:
            if not self.db.session_exists(session_id):
                raise HTTPException(
                    status_code=404, 
                    detail="Session not found"
                )
            messages = self.db.get_conversation_history(
                session_id,
                limit=settings.CONVERSATION.MAX_HISTORY
            )
            summary_result = await self.model.summarize(messages)
            logger.info(f"Generated summary for session: {session_id}")
            return {
                "summary": summary_result["summary"],
                "created_at": summary_result["created_at"]
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate summary"
            )