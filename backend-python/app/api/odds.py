"""Odds API endpoints with Redis/in-memory caching."""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Dict, Any
import json
from ..services.bot_service import bot_service
from ..cache import CacheManager, get_cache

CACHE_TTL_SECONDS = 60

router = APIRouter()


@router.get("/config")
async def get_bot_config():
    """Get current bot configuration"""
    return bot_service.get_config()


@router.get("/sports")
async def get_sports(request: Request, cache: CacheManager = Depends(get_cache)) -> List[Dict[str, Any]]:
    """Get list of available sports (cached)."""
    try:
        refresh = request.query_params.get("refresh") == "1"
        key = "odds:sports"
        if not refresh:
            cached = cache.get(key)
            if cached:
                return json.loads(cached)
        sports = bot_service.get_available_sports()
        if isinstance(sports, dict) and "error" in sports:
            raise HTTPException(status_code=500, detail=sports["error"])
        cache.set(key, json.dumps(sports), CACHE_TTL_SECONDS)
        return sports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/odds/{sport_key}")
async def get_odds(sport_key: str, request: Request, cache: CacheManager = Depends(get_cache)):
    """Get odds for a specific sport (cached)."""
    try:
        refresh = request.query_params.get("refresh") == "1"
        key = f"odds:odds:{sport_key}"
        if not refresh:
            cached = cache.get(key)
            if cached:
                return json.loads(cached)
        result = bot_service.get_odds_for_sport(sport_key)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        cache.set(key, json.dumps(result), CACHE_TTL_SECONDS)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ev/{sport_key}")
async def get_ev_opportunities(request: Request, sport_key: str = "upcoming", cache: CacheManager = Depends(get_cache)):
    """Find EV opportunities for a sport (cached)."""
    try:
        refresh = request.query_params.get("refresh") == "1"
        key = f"odds:ev:{sport_key}"
        if not refresh:
            cached = cache.get(key)
            if cached:
                return json.loads(cached)
        result = bot_service.find_ev_opportunities(sport_key)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        cache.set(key, json.dumps(result), CACHE_TTL_SECONDS)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
