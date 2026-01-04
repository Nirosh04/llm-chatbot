from datetime import datetime, timezone
import httpx
from typing import List, Dict
from fastapi import HTTPException
import logging
from settings import settings

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for interacting with Ollama API."""        
    
    async def chat(
        self, 
        messages: List[Dict[str, str]]
    ) -> Dict[str, any]:
        """
        Send a chat request to Ollama.
        Args:
            messages: List of conversation messages
        Returns:
            Dict with content, model, and token count
        """
        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA.TIMEOUT) as client:
                ollama_messages = [
                    {"role": "system", "content": settings.OLLAMA.PROMPT}
                ]
                ollama_messages.extend(messages)
                payload = {
                    "model": settings.OLLAMA.MODEL,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {
                        "temperature": settings.OLLAMA.TEMPERATURE,
                        "num_predict": settings.OLLAMA.MAX_TOKENS
                    }
                }
                response = await client.post(
                    f"{settings.OLLAMA.URL}/api/chat",
                    json=payload
                )
                if response.status_code != 200:
                    logger.error(f"Ollama error: {response.text}")
                    raise HTTPException(
                        status_code=500, 
                        detail="Ollama API error"
                    )
                result = response.json()
                return {
                    "content": result["message"]["content"],
                    "tokens": result.get("eval_count", 0)
                }
        except httpx.TimeoutException:
            logger.error("Ollama request timeout")
            raise HTTPException(
                status_code=504, 
                detail="AI model timeout"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error calling Ollama: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to get AI response: {str(e)}"
            )
        
    async def summarize(
        self, 
        messages: List[Dict[str, str]]
    ) -> Dict[str, any]:
        """
        Send a summarize request to Ollama.
        Args:
            messages: List of conversation messages
        Returns:
            Dict with summary and created_at timestamp
        """
        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA.TIMEOUT) as client:
                user_messages = [msg for msg in messages if msg['role'] == 'user']
                ollama_messages = [
                    {"role": "system", "content": settings.OLLAMA.SUMMARY_PROMPT}
                ]
                ollama_messages.extend(user_messages)
                ollama_messages.append({
                    "role": "user",
                    "content": "END OF CONVERSATION. Output the final summary JSON object as strictly instructed in the system prompt."
                })
                logger.info(f"Ollama summarize messages: {ollama_messages}")
                payload = {
                    "model": settings.OLLAMA.MODEL,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {
                        "temperature": settings.OLLAMA.SUMMARY_TEMPERATURE,
                        "num_predict": settings.OLLAMA.MAX_TOKENS
                    }
                }
                response = await client.post(
                    f"{settings.OLLAMA.URL}/api/chat",
                    json=payload
                )
                logger.info(f"Ollama summarize response status: {response}")
                if response.status_code != 200:
                    logger.error(f"Ollama summarize error: {response.text}")
                    raise HTTPException(
                        status_code=500, 
                        detail="Ollama API error"
                    )
                result = response.json()
                return {
                    "summary": result["message"]["content"],
                    "created_at": datetime.now(timezone.utc)
                }
        except httpx.TimeoutException:
            logger.error("Ollama summarize request timeout")
            raise HTTPException(
                status_code=504, 
                detail="AI model timeout"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error calling Ollama summarize: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to get AI summary: {str(e)}"
            )
        

    async def check_connection(self) -> bool:
        """Check if Ollama is accessible."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{settings.OLLAMA.URL}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama connection error: {e}")
            return False