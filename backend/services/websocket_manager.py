"""
WebSocket Connection Manager
Handles active connections and broadcasting messages to connected clients.
"""
from fastapi import WebSocket
from typing import List, Dict, Any
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Singleton manager for WebSocket connections.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message to client: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcast a message to all connected clients.
        """
        # Create a copy to avoid modification during iteration if disconnect happens
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to client, disconnecting: {e}")
                self.disconnect(connection)

# Global instance
manager = ConnectionManager()
