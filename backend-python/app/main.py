"""
Main FastAPI application
"""
from fastapi import FastAPI
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models.user import User
from .api.auth import get_password_hash
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Sports betting analytics platform with EV calculation and arbitrage detection"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",  # TODO: Add actual DB check
        "redis": "connected"  # TODO: Add actual Redis check
    }


@app.get("/version")
async def get_version():
    """Get version and deployment information"""
    import subprocess
    from pathlib import Path
    
    commit_hash = "unknown"
    commit_date = "unknown"
    branch = "unknown"
    
    try:
        # Try to get git commit info
        repo_path = Path(__file__).resolve().parent.parent.parent
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            commit_hash = result.stdout.strip()
        
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ci"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            commit_date = result.stdout.strip()
        
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            branch = result.stdout.strip()
    except Exception:
        pass  # Git not available or not a repo
    
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "commit": commit_hash,
        "commit_date": commit_date,
        "branch": branch,
        "python": f"{__import__('sys').version_info.major}.{__import__('sys').version_info.minor}.{__import__('sys').version_info.micro}"
    }


# Include routers
from .api import auth, odds, todo, ev
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(odds.router, prefix="/api/odds", tags=["odds"])
app.include_router(todo.router, prefix="/api/todo", tags=["todo"])
app.include_router(ev.router, prefix="/api/ev", tags=["ev"])

# TODO: Add more routers

@app.on_event("startup")
def on_startup():
    """Create database tables if using SQLite local dev. Postgres should rely on migrations."""
    if settings.DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)

# from .api import bets
# app.include_router(bets.router, prefix="/api/bets", tags=["bets"])
