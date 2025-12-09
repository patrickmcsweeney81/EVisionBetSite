"""
Service layer for integrating bot functionality with FastAPI
"""
import sys
import os
import requests
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Helper functions from bot (inline to avoid import issues)
def load_env(key: str, default: str = "") -> str:
    v = os.getenv(key)
    return v if v is not None else default

def load_env_float(key: str, default: str) -> float:
    try:
        raw = load_env(key, default)
        cleaned = raw.split("#", 1)[0].strip()
        return float(cleaned)
    except Exception:
        return float(default)

def fetch_sports_list():
    """Fetch available sports from Odds API"""
    api_key = load_env("ODDS_API_KEY")
    api_base = load_env("ODDS_API_BASE", "https://api.the-odds-api.com/v4")
    url = f"{api_base}/sports"
    params = {"apiKey": api_key}
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()

def fetch_all_odds(sport: str, regions: str, markets: List[str]):
    """Fetch odds for a sport"""
    api_key = load_env("ODDS_API_KEY")
    api_base = load_env("ODDS_API_BASE", "https://api.the-odds-api.com/v4")
    url = f"{api_base}/sports/{sport}/odds"
    params = {
        "apiKey": api_key,
        "regions": regions,
        "markets": ",".join(markets),
        "oddsFormat": "decimal"
    }
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


class BotService:
    """Service for accessing bot functionality from API"""
    
    def __init__(self):
        self.api_key = load_env("ODDS_API_KEY")
        self.api_base = load_env("ODDS_API_BASE", "https://api.the-odds-api.com/v4")
        self.regions = load_env("REGIONS", "au,us")
        self.markets = load_env("MARKETS", "h2h,spreads,totals")
        self.ev_min_edge = load_env_float("EV_MIN_EDGE", "0.03")
    
    def get_available_sports(self) -> List[Dict[str, Any]]:
        """Get list of available sports from Odds API"""
        try:
            sports = fetch_sports_list()
            return [
                {
                    "key": sport.get("key"),
                    "title": sport.get("title"),
                    "group": sport.get("group"),
                    "description": sport.get("description"),
                    "active": sport.get("active", True)
                }
                for sport in sports
            ]
        except Exception as e:
            return {"error": str(e)}
    
    def get_odds_for_sport(self, sport_key: str) -> Dict[str, Any]:
        """Fetch odds for a specific sport"""
        try:
            # Fetch raw odds from API
            events = fetch_all_odds(sport_key, self.regions, self.markets.split(","))
            
            return {
                "sport": sport_key,
                "events_count": len(events),
                "events": events
            }
        except Exception as e:
            return {"error": str(e)}
    
    def find_ev_opportunities(self, sport_key: str = "upcoming") -> Dict[str, Any]:
        """Find EV opportunities for a sport"""
        try:
            # This would call the main bot scanning logic
            # For now, return structure showing what would be returned
            return {
                "sport": sport_key,
                "scan_time": datetime.now().isoformat(),
                "min_edge": self.ev_min_edge,
                "opportunities": [],
                "message": "Bot integration in progress - full scanning logic to be connected"
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_upcoming_games(self, sport_key: str) -> Dict[str, Any]:
        """Get upcoming games for a sport with simplified data"""
        try:
            # Fetch raw odds from API (just h2h market for game listings)
            events = fetch_all_odds(sport_key, self.regions, ["h2h"])
            
            # Simplify to just what we need for the widget
            games = []
            for event in events:
                games.append({
                    "id": event.get("id"),
                    "commence_time": event.get("commence_time"),
                    "home_team": event.get("home_team"),
                    "away_team": event.get("away_team"),
                })
            
            return {
                "sport": sport_key,
                "count": len(games),
                "games": games
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_config(self) -> Dict[str, Any]:
        """Get current bot configuration"""
        return {
            "regions": self.regions,
            "markets": self.markets,
            "ev_min_edge": self.ev_min_edge,
            "api_configured": bool(self.api_key)
        }


# Singleton instance
bot_service = BotService()
