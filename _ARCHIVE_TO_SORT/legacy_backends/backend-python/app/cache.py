"""
Redis cache utilities with graceful fallback to in-memory
"""
import json
import logging
from typing import Optional, Any
from datetime import timedelta

logger = logging.getLogger(__name__)

# Try to import Redis, fall back to in-memory cache if unavailable
try:
    import redis
    from redis.exceptions import RedisError
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available, using in-memory cache fallback")

from .config import settings

class CacheManager:
    """Unified cache interface with Redis primary, in-memory fallback"""
    
    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}
        self.memory_timestamps = {}
        
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis cache connected successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed, using memory cache: {e}")
                self.redis_client = None
    
    def _is_redis_available(self) -> bool:
        """Check if Redis is connected and responsive"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except Exception:
            return False
    
    def get(self, key: str) -> Optional[str]:
        """Get value from cache (Redis first, then memory)"""
        # Try Redis first
        if self._is_redis_available():
            try:
                value = self.redis_client.get(key)
                if value:
                    return value
            except RedisError as e:
                logger.warning(f"Redis get error: {e}")
        
        # Fallback to memory cache
        import time
        if key in self.memory_cache:
            timestamp = self.memory_timestamps.get(key, 0)
            # Check if expired (default 60s TTL)
            if time.time() - timestamp < 60:
                return self.memory_cache[key]
            else:
                # Expired, remove from memory
                del self.memory_cache[key]
                del self.memory_timestamps[key]
        
        return None
    
    def set(self, key: str, value: str, ttl: int = 60) -> bool:
        """Set value in cache with TTL (seconds)"""
        # Try Redis first
        if self._is_redis_available():
            try:
                self.redis_client.setex(key, ttl, value)
                return True
            except RedisError as e:
                logger.warning(f"Redis set error: {e}")
        
        # Fallback to memory cache
        import time
        self.memory_cache[key] = value
        self.memory_timestamps[key] = time.time()
        return True
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        success = False
        
        if self._is_redis_available():
            try:
                self.redis_client.delete(key)
                success = True
            except RedisError as e:
                logger.warning(f"Redis delete error: {e}")
        
        # Also remove from memory cache
        if key in self.memory_cache:
            del self.memory_cache[key]
            del self.memory_timestamps[key]
            success = True
        
        return success
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern (Redis only, memory ignores)"""
        if self._is_redis_available():
            try:
                keys = self.redis_client.keys(pattern)
                if keys:
                    return self.redis_client.delete(*keys)
            except RedisError as e:
                logger.warning(f"Redis clear pattern error: {e}")
        return 0
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        stats = {
            "backend": "memory",
            "memory_keys": len(self.memory_cache)
        }
        
        if self._is_redis_available():
            try:
                info = self.redis_client.info("stats")
                stats.update({
                    "backend": "redis",
                    "redis_connected": True,
                    "redis_keys": self.redis_client.dbsize(),
                    "redis_hits": info.get("keyspace_hits", 0),
                    "redis_misses": info.get("keyspace_misses", 0),
                })
            except Exception as e:
                logger.warning(f"Redis stats error: {e}")
        
        return stats


# Global cache instance
cache = CacheManager()


def get_cache() -> CacheManager:
    """Dependency injection for cache"""
    return cache
