"""
Odds API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.bot_service import bot_service

router = APIRouter()


@router.get("/config")
async def get_bot_config():
    """Get current bot configuration"""
    return bot_service.get_config()


@router.get("/sports")
async def get_sports() -> List[Dict[str, Any]]:
    """Get list of available sports"""
    try:
        sports = bot_service.get_available_sports()
        if isinstance(sports, dict) and "error" in sports:
            raise HTTPException(status_code=500, detail=sports["error"])
        return sports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/odds/{sport_key}")
async def get_odds(sport_key: str):
    """Get odds for a specific sport"""
    try:
        result = bot_service.get_odds_for_sport(sport_key)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ev/{sport_key}")
async def get_ev_opportunities(sport_key: str = "upcoming"):
    """Find EV opportunities for a sport"""
    try:
        result = bot_service.find_ev_opportunities(sport_key)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
