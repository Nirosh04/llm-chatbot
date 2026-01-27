from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from settings import settings
from routes import session_router, health_router
from services.ssh_manager import SSHManager
#for lifespan instead of on_event
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instance for the SSH Manager
ssh_manager = SSHManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    #put code here that should run on startup
    logger.info(f"APP HAS STARTED")

    """Log startup information."""
    logger.info(f"Starting {settings.API.TITLE} v{settings.API.VERSION}")

    # Initialize SSH Tunnel if configured
    if settings.SSH.USE_SSH:
        try:
            ssh_manager.start()
            tunnel_url = ssh_manager.get_base_url()
            if tunnel_url:
                settings.OLLAMA.URL = tunnel_url
                logger.info(f"Ollama URL updated to SSH tunnel: {settings.OLLAMA.URL}")
        except Exception as e:
            logger.error(f"Failed to start SSH tunnel: {e}")
            # Depending on requirements, we might want to exit here
            # For now, we log and proceed, but Ollama calls will likely fail
    
    logger.info(f"Ollama URL: {settings.OLLAMA.URL}")
    logger.info(f"Default model: {settings.OLLAMA.MODEL}")

    yield
    #run when app is closed

    """Log shutdown information."""
    logger.info("Shutting down application")
    
    # Clean up SSH Tunnel
    if settings.SSH.USE_SSH:
        ssh_manager.stop()

# Create the FastAPI app
app = FastAPI(
    title=settings.API.TITLE,
    description=settings.API.DESCRIPTION,
    version=settings.API.VERSION,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(session_router)
app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.DEPLOYMENT.HOSTNAME, port=settings.DEPLOYMENT.PORT)
