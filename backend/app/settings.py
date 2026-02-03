import os
from pydantic import BaseModel
from prompts import Prompts


class Settings(BaseModel):
    """
    Centralized application settings with well-defined subsections.
    """

    # ------------------------------------------------------------
    # API Metadata
    # ------------------------------------------------------------
    class Api(BaseModel):
        TITLE: str = "Hospital Assistant API"
        DESCRIPTION: str = "API for managing patient sessions and AI-assisted anamnesis with Ollama."
        VERSION: str = "2.0.0"

    # ------------------------------------------------------------
    # Deployment
    # ------------------------------------------------------------
    class Deployment(BaseModel):
        HOSTNAME: str = "0.0.0.0"
        PORT: int = 5000

    # ------------------------------------------------------------
    # Database
    # ------------------------------------------------------------
    class Database(BaseModel):
        URL: str = os.getenv("DATABASE_URL","postgresql://postgres:password@localhost:5432/aicompanion")

    # ------------------------------------------------------------
    # Ollama
    # ------------------------------------------------------------
    class Ollama(BaseModel):
        URL: str = os.getenv("OLLAMA_HOST","http://localhost:11434")
        MODEL: str = os.getenv("OLLAMA_MODEL","llama3.2")
        PROMPT: str = Prompts.SYSTEM_PROMPT_3
        TEMPERATURE: float = float(os.getenv("OLLAMA_TEMPERATURE", "0.7"))

        # NOTE: Die bisherigen Defaults (100000 Tokens / 3600s) führen oft zu "hängt ewig".
        # Diese Defaults sind bewusst konservativer und können über ENV überschrieben werden.
        MAX_TOKENS: int = int(os.getenv("OLLAMA_MAX_TOKENS", "1024"))
        TIMEOUT: float = float(os.getenv("OLLAMA_TIMEOUT", "120"))

        SUMMARY_PROMPT: str = Prompts.SUMMARY_PROMPT_1
        SUMMARY_TEMPERATURE: float = float(os.getenv("OLLAMA_SUMMARY_TEMPERATURE", "0.5"))

    # ------------------------------------------------------------
    # SSH Tunnel
    # ------------------------------------------------------------
    class Ssh(BaseModel):
        USE_SSH: bool = os.getenv("USE_SSH", "false").lower() == "true"
        HOST: str = os.getenv("SSH_HOST", "")
        PORT: int = int(os.getenv("SSH_PORT", "22"))
        USER: str = os.getenv("SSH_USER", "")
        PASSWORD: str = os.getenv("SSH_PASSWORD", "")
        # Where Ollama listens on the remote server (usually localhost if not exposed publicly)
        REMOTE_BIND_ADDRESS: str = os.getenv("REMOTE_BIND_ADDRESS", "127.0.0.1")
        REMOTE_BIND_PORT: int = int(os.getenv("REMOTE_BIND_PORT", "11434"))

    # ------------------------------------------------------------
    # Conversation
    # ------------------------------------------------------------
    class Conversation(BaseModel):
        MAX_HISTORY: int = 20

    # Instantiate subsections
    DEPLOYMENT: Deployment = Deployment()
    DATABASE: Database = Database()
    API: Api = Api()
    OLLAMA: Ollama = Ollama()
    CONVERSATION: Conversation = Conversation()
    SSH: Ssh = Ssh()

settings = Settings()
