import logging
from sshtunnel import SSHTunnelForwarder
from settings import settings

logger = logging.getLogger(__name__)

class SSHManager:
    """
    Manages the SSH tunnel for connecting to remote services securely.
    """
    def __init__(self):
        self.tunnel = None

    def start(self):
        """
        Starts the SSH tunnel if USE_SSH is set to True.
        """
        if not settings.SSH.USE_SSH:
            logger.info("SSH tunneling is disabled.")
            return

        logger.info(f"Initializing SSH tunnel to {settings.SSH.USER}@{settings.SSH.HOST}:{settings.SSH.PORT}...")
        try:
            self.tunnel = SSHTunnelForwarder(
                (settings.SSH.HOST, settings.SSH.PORT),
                ssh_username=settings.SSH.USER,
                ssh_password=settings.SSH.PASSWORD,
                remote_bind_address=(settings.SSH.REMOTE_BIND_ADDRESS, settings.SSH.REMOTE_BIND_PORT),
                # Allow access from localhost (inside the container)
                local_bind_address=('127.0.0.1', 0)
            )
            self.tunnel.start()
            logger.info(f"SSH tunnel established successfully. Forwarding 127.0.0.1:{self.tunnel.local_bind_port} -> {settings.SSH.REMOTE_BIND_ADDRESS}:{settings.SSH.REMOTE_BIND_PORT}")
        except Exception as e:
            logger.error(f"Failed to establish SSH tunnel: {e}")
            # We raise the exception because if SSH is required but fails, the app shouldn't start (or at least we should know)
            raise e

    def stop(self):
        """
        Stops the SSH tunnel if it is active.
        """
        if self.tunnel:
            logger.info("Stopping SSH tunnel...")
            self.tunnel.stop()
            self.tunnel = None
            logger.info("SSH tunnel stopped.")

    def get_base_url(self) -> str:
        """
        Returns the local base URL for the tunneled service (e.g., http://127.0.0.1:12345).
        Returns None if tunnel is not active.
        """
        if self.tunnel and self.tunnel.is_active:
            return f"http://127.0.0.1:{self.tunnel.local_bind_port}"
        return None