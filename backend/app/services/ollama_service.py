from datetime import datetime, timezone
import httpx
from typing import List, Dict, AsyncIterator
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import logging
import json
from settings import settings

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for interacting with Ollama API."""

    async def _stream_chat_request(self, payload: Dict) -> AsyncIterator[str]:
        """Internal: streams Ollama /api/chat JSON-lines as SSE token events."""
        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA.TIMEOUT) as client:
                async with client.stream(
                    "POST",
                    f"{settings.OLLAMA.URL}/api/chat",
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        body = await response.aread()
                        logger.error("Ollama stream error: %s", body.decode("utf-8", "ignore"))
                        raise HTTPException(status_code=500, detail="Ollama API error")

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            ev = json.loads(line)
                        except Exception:
                            continue

                        token = (ev.get("message") or {}).get("content")
                        if token:
                            yield f"data: {token}\n\n"

                        if ev.get("done") is True:
                            break
        except httpx.TimeoutException:
            logger.error("Ollama stream timeout")
            raise HTTPException(status_code=504, detail="AI model timeout")

    def stream_invoke(self, message: str, format: dict = None) -> StreamingResponse:
        """Public: stream a single user message via SSE."""
        payload = {
            "model": settings.OLLAMA.MODEL,
            "messages": [{"role": "user", "content": message}],
            "stream": True,
            "options": {
                "temperature": settings.OLLAMA.TEMPERATURE,
                "num_predict": settings.OLLAMA.MAX_TOKENS,
            },
        }
        if format is not None:
            payload["format"] = format

        return StreamingResponse(
            self._stream_chat_request(payload),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    async def chat(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
    ):
        """
        Send a chat request to Ollama.

        If stream=True, returns a StreamingResponse (SSE).
        """
        if stream:
            payload = {
                "model": settings.OLLAMA.MODEL,
                "messages": [{"role": "system", "content": settings.OLLAMA.PROMPT}, *messages],
                "stream": True,
                "options": {
                    "temperature": settings.OLLAMA.TEMPERATURE,
                    "num_predict": settings.OLLAMA.MAX_TOKENS,
                },
            }
            return StreamingResponse(
                self._stream_chat_request(payload),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

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
    
    async def invoke(
        self,
        prompt: str,
        message: str,
        format: dict = None,
        stream: bool = False,
    ):
        """
        Send a single chat request to Ollama.

        If stream=True, returns a StreamingResponse (SSE).
        """
        if stream:
            return self.stream_invoke(message, format=format)

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA.TIMEOUT) as client:
                ollama_messages = [
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ]
                payload = {
                    "model": settings.OLLAMA.MODEL,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {
                        "temperature": settings.OLLAMA.TEMPERATURE,
                        "num_predict": settings.OLLAMA.MAX_TOKENS
                    }
                }

                if format is not None:
                    payload["format"] = format

                logger.info(f"\n\nOllama invoke payload: {payload}")

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
                logger.info(f"Ollama actual response: {result}\n\n")
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
                        "num_predict": min(settings.OLLAMA.MAX_TOKENS, 2048)
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