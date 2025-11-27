"""
Security middleware and utilities for rate limiting and request logging.
"""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from collections import defaultdict, deque
import time
from typing import Dict, Deque, Tuple
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Token bucket rate limiter for API endpoints.
    """
    def __init__(self, requests_per_minute: int = 60, burst: int = 10):
        self.requests_per_minute = requests_per_minute
        self.burst = burst
        self.requests: Dict[str, Deque[float]] = defaultdict(lambda: deque(maxlen=burst))
    
    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if request is allowed under rate limit.
        Returns: (allowed: bool, retry_after: int)
        """
        now = time.time()
        window_start = now - 60  # 1 minute window
        
        # Clean old requests outside window
        client_requests = self.requests[client_id]
        while client_requests and client_requests[0] < window_start:
            client_requests.popleft()
        
        # Check if under limit
        if len(client_requests) < self.requests_per_minute:
            client_requests.append(now)
            return True, 0
        
        # Calculate retry after
        oldest_request = client_requests[0]
        retry_after = int(oldest_request + 60 - now) + 1
        return False, retry_after


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware with configurable limits per endpoint.
    """
    def __init__(self, app, default_limits: Dict[str, int] = None):
        super().__init__(app)
        
        # Default rate limits (requests per minute)
        self.limits = {
            "/api/auth/login": 10,        # Login attempts
            "/api/auth/register": 5,      # Registration attempts
            "/api/auth/refresh": 20,      # Token refresh
            "/api/odds": 120,             # Odds fetching
            "/api/ev": 60,                # EV calculations
            "default": 60                 # Default for unlisted endpoints
        }
        
        # Override with custom limits
        if default_limits:
            self.limits.update(default_limits)
        
        # Create limiter for each endpoint
        self.limiters = {
            path: RateLimiter(requests_per_minute=limit)
            for path, limit in self.limits.items()
        }
        
        # Default limiter
        self.default_limiter = RateLimiter(
            requests_per_minute=self.limits.get("default", 60)
        )
    
    def get_client_id(self, request: Request) -> str:
        """Get unique client identifier from request."""
        # Use X-Forwarded-For if behind proxy, otherwise client IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def get_limiter(self, path: str) -> RateLimiter:
        """Get appropriate rate limiter for path."""
        # Check exact matches first
        if path in self.limiters:
            return self.limiters[path]
        
        # Check prefix matches
        for limit_path, limiter in self.limiters.items():
            if path.startswith(limit_path):
                return limiter
        
        return self.default_limiter
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Skip rate limiting for health checks and metrics
        if request.url.path in ["/health", "/api/monitoring/health", "/api/monitoring/metrics"]:
            return await call_next(request)
        
        client_id = self.get_client_id(request)
        limiter = self.get_limiter(request.url.path)
        
        allowed, retry_after = limiter.is_allowed(client_id)
        
        if not allowed:
            return Response(
                content=f"Rate limit exceeded. Retry after {retry_after} seconds.",
                status_code=429,
                headers={"Retry-After": str(retry_after)}
            )
        
        response = await call_next(request)
        return response


class AuditLogger:
    """
    Audit logger for sensitive operations.
    """
    def __init__(self, log_file: str = "audit.log"):
        self.log_file = Path(log_file)
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Configure file logger
        self.logger = logging.getLogger("audit")
        self.logger.setLevel(logging.INFO)
        
        # File handler
        handler = logging.FileHandler(self.log_file)
        handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        # Avoid duplicate handlers
        if not self.logger.handlers:
            self.logger.addHandler(handler)
    
    def log_auth_attempt(self, username: str, success: bool, ip: str, reason: str = ""):
        """Log authentication attempt."""
        status = "SUCCESS" if success else "FAILED"
        message = f"AUTH {status}: user={username}, ip={ip}"
        if reason:
            message += f", reason={reason}"
        
        if success:
            self.logger.info(message)
        else:
            self.logger.warning(message)
    
    def log_user_creation(self, username: str, created_by: str, ip: str):
        """Log user creation."""
        self.logger.info(f"USER_CREATED: username={username}, created_by={created_by}, ip={ip}")
    
    def log_user_deletion(self, username: str, deleted_by: str, ip: str):
        """Log user deletion."""
        self.logger.warning(f"USER_DELETED: username={username}, deleted_by={deleted_by}, ip={ip}")
    
    def log_password_change(self, username: str, changed_by: str, ip: str):
        """Log password change."""
        self.logger.info(f"PASSWORD_CHANGED: username={username}, changed_by={changed_by}, ip={ip}")
    
    def log_admin_action(self, action: str, username: str, target: str, ip: str):
        """Log administrative action."""
        self.logger.warning(f"ADMIN_ACTION: action={action}, admin={username}, target={target}, ip={ip}")
    
    def log_suspicious_activity(self, activity: str, username: str, ip: str, details: str = ""):
        """Log suspicious activity."""
        message = f"SUSPICIOUS: activity={activity}, user={username}, ip={ip}"
        if details:
            message += f", details={details}"
        self.logger.error(message)


# Global audit logger instance
audit_logger = AuditLogger(log_file="data/audit.log")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy (adjust as needed)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' ws: wss:;"
        )
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log all HTTP requests with timing information.
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {response.status_code} {request.method} {request.url.path} "
                f"({duration:.3f}s)"
            )
            
            # Add timing header
            response.headers["X-Process-Time"] = f"{duration:.3f}"
            
            return response
        
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Error: {request.method} {request.url.path} "
                f"({duration:.3f}s) - {str(e)}"
            )
            raise
