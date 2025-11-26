"""
Main FastAPI application
"""
from fastapi import FastAPI
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


# Include routers
from .api import auth, odds
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(odds.router, prefix="/api/odds", tags=["odds"])

# TODO: Add more routers
# from .api import bets
# app.include_router(bets.router, prefix="/api/bets", tags=["bets"])
