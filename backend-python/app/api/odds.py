"""Odds API endpoints with lightweight caching layer.

Caching strategy:
 - In-memory dict keyed by endpoint + parameters.
 - TTL default 60s (configurable via CACHE_TTL_SECONDS env var later if needed).
 - Optional force refresh via query param `?refresh=1`.
 - Returns cached payload transparently; does not alter response schema.

If Redis becomes available, this can be swapped for a Redis backend while retaining the same interface.
"""
from fastapi import APIRouter, HTTPException, Request
from typing import List, Dict, Any, Tuple
from time import time
from ..services.bot_service import bot_service

CACHE_TTL_SECONDS = 60

_cache_store: Dict[str, Tuple[float, Any]] = {}

def _cache_key(path: str, *parts: str) -> str:
    return "|".join([path, *parts])

def _get_cached(key: str):
    entry = _cache_store.get(key)
    if not entry:
        return None
    ts, payload = entry
    if time() - ts > CACHE_TTL_SECONDS:
        _cache_store.pop(key, None)
        return None
    return payload

def _set_cached(key: str, payload: Any):
    _cache_store[key] = (time(), payload)

router = APIRouter()


@router.get("/config")
async def get_bot_config():
    """Get current bot configuration"""
    return bot_service.get_config()


@router.get("/sports")
async def get_sports(request: Request) -> List[Dict[str, Any]]:
    """Get list of available sports (cached)."""
    try:
        refresh = request.query_params.get("refresh") == "1"
        key = _cache_key("sports")
        if not refresh:
            cached = _get_cached(key)
            if cached is not None:
                return cached
        sports = bot_service.get_available_sports()
        if isinstance(sports, dict) and "error" in sports:
            raise HTTPException(status_code=500, detail=sports["error"])
        _set_cached(key, sports)
        return sports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/odds/{sport_key}")
async def get_odds(sport_key: str, request: Request):
    """Get odds for a specific sport (cached)."""
    try:
        refresh = request.query_params.get("refresh") == "1"
        key = _cache_key("odds", sport_key)
        if not refresh:
            cached = _get_cached(key)
            if cached is not None:
                return cached
        result = bot_service.get_odds_for_sport(sport_key)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        _set_cached(key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ev/{sport_key}")
async def get_ev_opportunities(request: Request, sport_key: str = "upcoming"):
    """Find EV opportunities for a sport (cached)."""
    try:
        refresh = request.query_params.get("refresh") == "1"
        key = _cache_key("ev", sport_key)
        if not refresh:
            cached = _get_cached(key)
            if cached is not None:
                return cached
        result = bot_service.find_ev_opportunities(sport_key)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        _set_cached(key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
