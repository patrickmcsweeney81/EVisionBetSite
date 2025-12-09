"""
WebSocket API endpoints for real-time updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from ..websocket import ConnectionManager, get_ws_manager
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/live")
async def websocket_live_updates(
    websocket: WebSocket,
    manager: ConnectionManager = Depends(get_ws_manager)
):
    """
    WebSocket endpoint for live updates.
    
    Connect to: ws://localhost:8000/ws/live
    
    Message format (from server):
    {
        "type": "ev_hit" | "odds_update" | "ping",
        "data": {...},
        "timestamp": "ISO datetime"
    }
    
    Client can send:
    {
        "action": "subscribe",
        "topics": ["ev", "odds", "nba"]
    }
    """
    topic = "general"
    await manager.connect(websocket, topic)
    
    try:
        # Send welcome message
        await manager.send_personal_message(
            '{"type": "connected", "message": "Welcome to EVisionBet live updates"}',
            websocket
        )
        
        # Listen for client messages
        while True:
            data = await websocket.receive_text()
            # Echo back for now (can parse client subscriptions later)
            await manager.send_personal_message(
                f'{{"type": "echo", "data": {data}}}',
                websocket
            )
    
    except WebSocketDisconnect:
        await manager.disconnect(websocket, topic)
        logger.info(f"Client disconnected from {topic}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket, topic)


@router.get("/connections")
async def get_ws_stats(manager: ConnectionManager = Depends(get_ws_manager)):
    """Get WebSocket connection statistics"""
    return {
        "total_connections": manager.get_connection_count(),
        "topics": {
            topic: manager.get_connection_count(topic)
            for topic in manager.get_topics()
        }
    }
