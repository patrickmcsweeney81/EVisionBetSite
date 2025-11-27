"""
WebSocket manager for real-time updates
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
import json
import asyncio
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections and broadcasts"""
    
    def __init__(self):
        # Active connections by topic
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, topic: str = "general"):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        async with self._lock:
            if topic not in self.active_connections:
                self.active_connections[topic] = set()
            self.active_connections[topic].add(websocket)
        logger.info(f"Client connected to topic '{topic}'. Total: {len(self.active_connections.get(topic, []))}")
    
    async def disconnect(self, websocket: WebSocket, topic: str = "general"):
        """Remove a WebSocket connection"""
        async with self._lock:
            if topic in self.active_connections:
                self.active_connections[topic].discard(websocket)
                if not self.active_connections[topic]:
                    del self.active_connections[topic]
        logger.info(f"Client disconnected from topic '{topic}'")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to a specific client"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")
    
    async def broadcast(self, message: str, topic: str = "general"):
        """Broadcast message to all clients subscribed to a topic"""
        if topic not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[topic].copy():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to client: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        if disconnected:
            async with self._lock:
                for conn in disconnected:
                    self.active_connections[topic].discard(conn)
    
    async def broadcast_json(self, data: dict, topic: str = "general"):
        """Broadcast JSON data to all clients in a topic"""
        await self.broadcast(json.dumps(data), topic)
    
    def get_connection_count(self, topic: str = None) -> int:
        """Get count of active connections for a topic or all"""
        if topic:
            return len(self.active_connections.get(topic, []))
        return sum(len(conns) for conns in self.active_connections.values())
    
    def get_topics(self) -> List[str]:
        """Get list of active topics"""
        return list(self.active_connections.keys())


# Global connection manager instance
ws_manager = ConnectionManager()


def get_ws_manager() -> ConnectionManager:
    """Dependency injection for WebSocket manager"""
    return ws_manager
