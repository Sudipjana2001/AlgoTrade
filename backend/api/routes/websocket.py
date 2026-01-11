"""
WebSocket API Routes
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.websocket_manager import manager
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.
    Connect to ws://localhost:8000/ws
    """
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from the client (optional, for subscription logic later)
            data = await websocket.receive_text()
            
            # Simple ping-pong or command handling
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await manager.send_personal_message({"type": "pong"}, websocket)
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
