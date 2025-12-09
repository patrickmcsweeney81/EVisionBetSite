"""
Improved odds API with intelligent caching and free data sources
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Dict, Any
import json
from ..services.bot_service import bot_service
from ..services.free_schedule_service import espn_service, nhl_service, get_games_smart
from ..cache import CacheManager, get_cache
from ..database import SessionLocal
from ..models.game_schedule import (
    upsert_games, 
    get_upcoming_games_from_db,
    cleanup_old_games
)

# Different TTLs for different data types
CACHE_TTL_SCHEDULES = 900   # 15 minutes for game schedules (static data)
CACHE_TTL_ODDS = 60          # 1 minute for live odds (price sensitive)
CACHE_TTL_SPORTS = 3600      # 1 hour for sports list (very static)

router = APIRouter()


@router.get("/config")
async def get_bot_config():
    """Get current bot configuration"""
    return bot_service.get_config()


@router.get("/sports")
async def get_sports(request: Request, cache: CacheManager = Depends(get_cache)) -> List[Dict[str, Any]]:
    """Get list of available sports (cached for 1 hour)."""
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
        cache.set(key, json.dumps(sports), CACHE_TTL_SPORTS)
        return sports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/odds/{sport_key}")
async def get_odds(sport_key: str, request: Request, cache: CacheManager = Depends(get_cache)):
    """Get odds for a specific sport (cached for 1 minute - price sensitive)."""
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
        cache.set(key, json.dumps(result), CACHE_TTL_ODDS)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ev/{sport_key}")
async def get_ev_opportunities(request: Request, sport_key: str = "upcoming", cache: CacheManager = Depends(get_cache)):
    """Find EV opportunities for a sport (cached for 1 minute)."""
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
        cache.set(key, json.dumps(result), CACHE_TTL_ODDS)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/upcoming/{sport_key}")
async def get_upcoming_games(sport_key: str, request: Request, cache: CacheManager = Depends(get_cache)):
    """
    Get upcoming games - OPTIMIZED VERSION using free sources + database
    
    Strategy:
    1. Check cache (15 min TTL)
    2. Check database
    3. Try free APIs (ESPN, NHL)
    4. Fallback to Odds API only if needed
    
    This reduces Odds API calls by 95%+
    """
    try:
        refresh = request.query_params.get("refresh") == "1"
        use_free = request.query_params.get("use_free", "1") == "1"  # Enable free sources by default
        
        # Check cache first
        cache_key = f"odds:upcoming:{sport_key}"
        if not refresh:
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
        
        # Try database first
        db = SessionLocal()
        try:
            db_games = get_upcoming_games_from_db(db, sport_key, limit=50)
            
            # If we have recent data in DB, use it
            if db_games and not refresh:
                result = {
                    "sport": sport_key,
                    "count": len(db_games),
                    "games": db_games,
                    "source": "database"
                }
                cache.set(cache_key, json.dumps(result), CACHE_TTL_SCHEDULES)
                return result
            
            # Try free sources if enabled
            if use_free:
                free_result = get_games_smart(sport_key)
                
                if free_result.get('games'):
                    # Store in database for next time
                    upsert_games(
                        db, 
                        free_result['games'], 
                        sport_key, 
                        free_result.get('source', 'ESPN')
                    )
                    
                    # Cache and return
                    cache.set(cache_key, json.dumps(free_result), CACHE_TTL_SCHEDULES)
                    return free_result
            
            # Fallback to Odds API (costs credits)
            result = bot_service.get_upcoming_games(sport_key)
            
            if "error" not in result and result.get('games'):
                # Store Odds API data in database too
                upsert_games(db, result['games'], sport_key, "OddsAPI")
            
            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])
            
            cache.set(cache_key, json.dumps(result), CACHE_TTL_SCHEDULES)
            return result
            
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/refresh-all-schedules")
async def refresh_all_schedules():
    """
    Admin endpoint to refresh all sports schedules using free sources
    Run this daily via cron or scheduler
    """
    popular_sports = [
        'basketball_nba',
        'americanfootball_nfl',
        'icehockey_nhl',
        'baseball_mlb',
        'soccer_epl',
    ]
    
    db = SessionLocal()
    results = {}
    
    try:
        for sport_key in popular_sports:
            try:
                # Use free sources
                free_result = get_games_smart(sport_key)
                
                if free_result.get('games'):
                    upsert_games(db, free_result['games'], sport_key, free_result.get('source'))
                    results[sport_key] = {
                        "success": True,
                        "count": len(free_result['games']),
                        "source": free_result.get('source')
                    }
                else:
                    results[sport_key] = {
                        "success": False,
                        "error": "No games found"
                    }
            except Exception as e:
                results[sport_key] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Cleanup old games
        deleted = cleanup_old_games(db, days_old=7)
        
        return {
            "status": "completed",
            "results": results,
            "deleted_old_games": deleted
        }
    finally:
        db.close()


@router.get("/admin/cache-stats")
async def get_cache_stats(cache: CacheManager = Depends(get_cache)):
    """Get cache statistics"""
    return cache.get_stats()
