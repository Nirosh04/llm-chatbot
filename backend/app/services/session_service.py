import uuid
import logging
from typing import Dict
from fastapi import HTTPException
from services.states.sampler_state import SamplerState
from services.agent_graph_service import app as agent_app
from services.states.frontend_sampler import convert_mid_to_frontend_sampler, FrontendSampler

logger = logging.getLogger(__name__)

class SessionService:
    """
    DB-free session service.
    LangGraph memory (thread_id) is the single source of truth.
    """

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        logger.info(f"Created new session: {session_id}")
        return session_id

    async def process_message(
        self,
        session_id: str,
        message_content: str
    ) -> Dict:
        """
        Process ONE user turn.
        Exactly one assistant message is returned.
        """
        try:
            input_state = {
                "messages": [{"role": "user", "content": message_content}],
                "has_extracted_this_turn": False,
            }

            config = {
                "configurable": {
                    "thread_id": session_id  # LangGraph memory key
                }
            }

            ai_result = await agent_app.ainvoke(input_state, config=config)
            logger.info("AI result: %s", ai_result)

            response = {}

            type = ai_result.get("message_type", "medical")
            if type == "navigation":
                response['reply'] = ai_result.get("navigation_message", "Here is some navigation info.")
                response['navigation'] = True
            elif type == "offtopic":
                response['reply'] = ai_result.get("offtopic_message", "Let's talk about something else.")
            else: 
                messages = ai_result.get("messages", [])
                assistant_msgs = [
                    m for m in messages if m.get("role") == "assistant"
                ]

                if not assistant_msgs:
                    raise RuntimeError("No assistant message produced")

                # Exactly one assistant message per turn (invariant)
                response['reply'] = assistant_msgs[-1]["content"]
            return response
        except Exception as e:
            logger.exception("Error processing message")
            raise HTTPException(
                status_code=500,
                detail=str(e),
            )
    
    async def fetch_user_sampler(self, session_id: str) -> FrontendSampler:
        """
        Fetch the current user's SamplerState data directly from memory 
        without triggering the agents.
        """
        logger.info(f"Fetching sampler data for session: {session_id}")

        try:
            config = {
                "configurable": {
                    "thread_id": session_id
                }
            }

            state_snapshot = await agent_app.aget_state(config)
            
            logger.info(f"State snapshot: {state_snapshot}")

            current_values = state_snapshot.values if state_snapshot else {}
            
            sampler_data = current_values.get("sampler_data", {})
                
            converted_data = convert_mid_to_frontend_sampler(sampler_data)
                
            return converted_data

        except Exception as e:
            logger.exception("Error fetching sampler data")
            raise HTTPException(
                status_code=500,
                detail=str(e),
            )

    async def reset_session(self, session_id: str) -> Dict:
        """
        Reset = forget the thread.
        MemorySaver clears automatically when thread_id changes.
        """
        logger.info(f"Reset session: {session_id}")
        return {
            "reset": True,
            "session_id": session_id,
        }
