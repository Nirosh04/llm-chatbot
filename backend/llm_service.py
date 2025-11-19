from __future__ import annotations
import yaml
import logging
import utils
from lumee_prompt import LUMEE_SYSTEM_PROMPT_SHORT
from dataclasses import dataclass, field
from typing import Dict, List, Iterable, Optional
import json
import httpx


def test():
    return 'test'


# Load config and create logger when imported
config = utils.load_config()
logger = utils.setup_logger()


logger.info('logger (info) test 1')
logger.debug('logger (debug) test 1')


'''
---------- On LLM OUTPUT ----------

llm_svc = llm_service.LLMService() 





---------- On MESSAGES ----------

messages is a list of dictionaries, where each dict represents one chat message:
- "role": who sent the message ("system", "user", or "assistant")
- "content": the text of the message

Example:
[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi there! How can I help?"}
]
'''




@dataclass
class Conversation:
    system_prompt: str = LUMEE_SYSTEM_PROMPT_SHORT
    history: List[Dict[str, str]] = field(default_factory=list)

    def reset(self) -> None:
        self.history.clear()

    def add(self, role: str, content: str) -> None:
        self.history.append({"role": role, "content": content})

    def build_messages(self, user_text: str) -> List[Dict[str, str]]:
        max_hist = int(config.get("max_conversation_history", 10))
        msgs: List[Dict[str, str]] = [{"role": "system", "content": self.system_prompt}]
        # keep last N pairs (user+assistant → *2)
        for turn in self.history[-max_hist * 2 :]:
            role, content = turn.get("role"), turn.get("content", "")
            if role in ("user", "assistant") and content:
                msgs.append({"role": role, "content": content})
        msgs.append({"role": "user", "content": user_text.strip()})
        return msgs



def _ollama_stream(
    model_name: str,
    messages: List[Dict[str, str]],
    options: Optional[Dict] = None,
) -> Iterable[str]:
    

    """Yield *accumulated* text from Ollama /api/chat stream."""
    url = "http://localhost:11434/api/chat"
    headers = {"Content-Type": "application/json"}
    payload = {"model": model_name, "messages": messages, "stream": True}
    if options:
        payload["options"] = options

    rt = float(config.get("request_timeout", 60))
    timeout = httpx.Timeout(connect=5.0, read=rt, write=rt, pool=rt)

    accumulated = ""
    with httpx.stream("POST", url, headers=headers, json=payload, timeout=timeout) as resp:
        # If server replies with an error
        if resp.status_code >= 400:
            try:
                body = resp.read().decode("utf-8", errors="ignore")
            except Exception:
                body = ""
            raise RuntimeError(f"Ollama error {resp.status_code}: {body[:500]}")

        # Stream NDJSON lines
        for line in resp.iter_lines():
            if not line:
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                # Skip partial or malformed chunks
                continue
            # Ollama may send error field within stream
            if "error" in data and data["error"]:
                raise RuntimeError(str(data["error"]))
            delta = data.get("message", {}).get("content", "")
            if delta:
                accumulated += delta
                yield accumulated

def _ollama_options() -> Dict:
    opts: Dict = {}
    temp = config.get("llm_temperature")
    if isinstance(temp, (int, float)):
        opts["temperature"] = float(temp)
    max_tokens = config.get("max_token_nr")
    if isinstance(max_tokens, int) and max_tokens > 0:
        opts["num_predict"] = max_tokens
    return opts

class LLMService:
    def __init__(self, conversation: Conversation | None = None):
        self.conversation = conversation or Conversation()
        self.model = config.get("llm_model_name") or "llama3"
        self.options = _ollama_options()

    def stream(self, user_text: str) -> Iterable[str]:
        msgs = self.conversation.build_messages(user_text)
        accumulated = ""
        try:
            for acc in _ollama_stream(self.model, msgs, self.options or None):
                accumulated = acc
                yield accumulated
        except Exception as e:
            logger.exception("LLM stream failed")
            hint = (
                "I'm having trouble connecting to the model service right now. "
            )
            detail = f" Details: {e}" if str(e) else ""
            accumulated = hint + detail
            yield accumulated
        finally:
            if accumulated:
                self.conversation.add("user", user_text.strip())
                self.conversation.add("assistant", accumulated)

    def generate(self, user_text: str) -> str:
        last = ""
        for last in self.stream(user_text):
            pass
        return last.strip() if last else "Sorry, I couldn't generate a response right now."


    def get_transcript(self) -> str:
        """
        Return the full conversation as a readable transcript using
        Patient (user) and Lumee (assistant) as fixed role names.
        """
        role_map = {
            "user": "Patient",
            "assistant": "Lumee",
            "system": "System"
        }

        lines = []

        for msg in self.conversation.history:
            role = msg.get("role", "user")
            role = role_map.get(role, role)
            lines.append(f"{role}: {msg.get('content', '')}")

        return "\n".join(lines)

    def reset(self) -> None:
        self.conversation.reset()

