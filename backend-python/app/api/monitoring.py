"""
Monitoring and observability endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any
import time
import psutil
from ..database import get_db
from ..api.auth import get_current_user
from ..models import User
from ..cache import get_cache
from ..websocket import ws_manager
from ..config import settings

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

# Track request metrics in memory
_request_count = 0
_request_errors = 0
_start_time = time.time()


def increment_request_count():
    """Increment total request counter."""
    global _request_count
    _request_count += 1


def increment_error_count():
    """Increment error counter."""
    global _request_errors
    _request_errors += 1


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check endpoint.
    Returns: Health status with component checks
    """
    health = {
        "status": "healthy",
        "timestamp": time.time(),
        "uptime_seconds": time.time() - _start_time,
        "components": {}
    }
    
    # Database check
    try:
        db.execute(text("SELECT 1"))
        health["components"]["database"] = {"status": "healthy"}
    except Exception as e:
        health["status"] = "unhealthy"
        health["components"]["database"] = {"status": "unhealthy", "error": str(e)}
    
    # Cache check
    try:
        cache = get_cache()
        stats = cache.get_stats()
        health["components"]["cache"] = {
            "status": "healthy",
            "backend": stats.get("backend", "unknown"),
            "keys": stats.get("keys", 0)
        }
    except Exception as e:
        health["components"]["cache"] = {"status": "degraded", "error": str(e)}
    
    # WebSocket check
    try:
        health["components"]["websocket"] = {
            "status": "healthy",
            "active_connections": ws_manager.connection_count
        }
    except Exception as e:
        health["components"]["websocket"] = {"status": "degraded", "error": str(e)}
    
    return health


@router.get("/metrics")
async def prometheus_metrics():
    """
    Prometheus-compatible metrics endpoint.
    Returns: Text metrics in Prometheus format
    """
    metrics = []
    
    # Application metrics
    metrics.append(f"# HELP app_uptime_seconds Application uptime in seconds")
    metrics.append(f"# TYPE app_uptime_seconds gauge")
    metrics.append(f"app_uptime_seconds {time.time() - _start_time}")
    
    metrics.append(f"# HELP app_requests_total Total number of requests")
    metrics.append(f"# TYPE app_requests_total counter")
    metrics.append(f"app_requests_total {_request_count}")
    
    metrics.append(f"# HELP app_errors_total Total number of errors")
    metrics.append(f"# TYPE app_errors_total counter")
    metrics.append(f"app_errors_total {_request_errors}")
    
    # Cache metrics
    try:
        cache = get_cache()
        stats = cache.get_stats()
        
        metrics.append(f"# HELP cache_hits_total Total cache hits")
        metrics.append(f"# TYPE cache_hits_total counter")
        metrics.append(f"cache_hits_total {stats.get('hits', 0)}")
        
        metrics.append(f"# HELP cache_misses_total Total cache misses")
        metrics.append(f"# TYPE cache_misses_total counter")
        metrics.append(f"cache_misses_total {stats.get('misses', 0)}")
        
        metrics.append(f"# HELP cache_keys Current number of cache keys")
        metrics.append(f"# TYPE cache_keys gauge")
        metrics.append(f"cache_keys {stats.get('keys', 0)}")
    except Exception:
        pass
    
    # WebSocket metrics
    try:
        metrics.append(f"# HELP websocket_connections Active WebSocket connections")
        metrics.append(f"# TYPE websocket_connections gauge")
        metrics.append(f"websocket_connections {ws_manager.connection_count}")
    except Exception:
        pass
    
    # System metrics
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        
        metrics.append(f"# HELP system_cpu_percent CPU usage percentage")
        metrics.append(f"# TYPE system_cpu_percent gauge")
        metrics.append(f"system_cpu_percent {cpu_percent}")
        
        metrics.append(f"# HELP system_memory_percent Memory usage percentage")
        metrics.append(f"# TYPE system_memory_percent gauge")
        metrics.append(f"system_memory_percent {memory.percent}")
        
        metrics.append(f"# HELP system_memory_available_bytes Available memory in bytes")
        metrics.append(f"# TYPE system_memory_available_bytes gauge")
        metrics.append(f"system_memory_available_bytes {memory.available}")
    except Exception:
        pass
    
    return "\n".join(metrics) + "\n"


@router.get("/stats", response_model=Dict[str, Any])
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin statistics endpoint (requires authentication).
    Returns: Comprehensive system statistics
    """
    stats = {
        "uptime_seconds": time.time() - _start_time,
        "requests": {
            "total": _request_count,
            "errors": _request_errors,
            "error_rate": _request_errors / max(_request_count, 1)
        }
    }
    
    # Database stats
    try:
        user_count = db.query(User).count()
        stats["database"] = {
            "connected": True,
            "user_count": user_count
        }
    except Exception as e:
        stats["database"] = {"connected": False, "error": str(e)}
    
    # Cache stats
    try:
        cache = get_cache()
        cache_stats = cache.get_stats()
        total_ops = cache_stats.get('hits', 0) + cache_stats.get('misses', 0)
        hit_rate = cache_stats.get('hits', 0) / max(total_ops, 1)
        
        stats["cache"] = {
            **cache_stats,
            "hit_rate": hit_rate
        }
    except Exception as e:
        stats["cache"] = {"error": str(e)}
    
    # WebSocket stats
    try:
        stats["websocket"] = {
            "active_connections": ws_manager.connection_count,
            "topics": list(ws_manager.active_connections.keys())
        }
    except Exception as e:
        stats["websocket"] = {"error": str(e)}
    
    # System stats
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        stats["system"] = {
            "cpu_percent": cpu_percent,
            "memory": {
                "total_bytes": memory.total,
                "available_bytes": memory.available,
                "used_bytes": memory.used,
                "percent": memory.percent
            },
            "disk": {
                "total_bytes": disk.total,
                "used_bytes": disk.used,
                "free_bytes": disk.free,
                "percent": disk.percent
            }
        }
    except Exception as e:
        stats["system"] = {"error": str(e)}
    
    return stats


@router.get("/config")
async def get_config(current_user: User = Depends(get_current_user)):
    """
    Get non-sensitive configuration values.
    Returns: Configuration dictionary (sanitized)
    """
    return {
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "api_url": settings.API_URL,
        "frontend_url": settings.FRONTEND_URL,
        "cors_origins": settings.CORS_ORIGINS,
        "database_type": "postgresql" if "postgresql" in settings.DATABASE_URL else "sqlite",
        "redis_enabled": settings.REDIS_URL is not None,
        "cache_ttl": settings.CACHE_TTL,
        "jwt_algorithm": settings.JWT_ALGORITHM,
        "token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES
    }


# Middleware helper functions for request tracking
def get_metrics_middleware():
    """
    Returns middleware function for request tracking.
    Usage: app.middleware("http")(get_metrics_middleware())
    """
    async def metrics_middleware(request, call_next):
        increment_request_count()
        try:
            response = await call_next(request)
            if response.status_code >= 400:
                increment_error_count()
            return response
        except Exception:
            increment_error_count()
            raise
    
    return metrics_middleware


@router.post("/init-db")
async def initialize_database(db: Session = Depends(get_db)):
    """
    Initialize database tables and create default admin user.
    This is a public endpoint for initial setup only.
    """
    from ..database import Base, engine
    from ..models.user import User
    from ..api.auth import get_password_hash
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Check if admin user exists
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            # Create admin user
            admin = User(
                username="admin",
                email="admin@evisionbet.com",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin)
            db.commit()
            return {
                "status": "success",
                "message": "Database initialized and admin user created",
                "admin_username": "admin",
                "admin_password": "admin123"
            }
        else:
            return {
                "status": "success",
                "message": "Database already initialized",
                "admin_exists": True
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
