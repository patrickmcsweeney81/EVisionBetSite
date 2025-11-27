"""
ESPN API Service - Free alternative for game schedules
No API key required, no rate limits (unofficial but stable)
"""
import requests
from typing import List, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ESPNService:
    """
    Service for fetching game schedules from ESPN API (free, no auth required)
    
    Supported sports:
    - NBA (basketball/nba)
    - NFL (football/nfl)
    - NHL (hockey/nhl)
    - MLB (baseball/mlb)
    - Premier League (soccer/eng.1)
    - Champions League (soccer/uefa.champions)
    """
    
    BASE_URL = "https://site.api.espn.com/apis/site/v2/sports"
    
    SPORT_MAPPING = {
        # The Odds API key -> ESPN path
        'basketball_nba': 'basketball/nba',
        'americanfootball_nfl': 'football/nfl',
        'icehockey_nhl': 'hockey/nhl',
        'baseball_mlb': 'baseball/mlb',
        'soccer_epl': 'soccer/eng.1',
        'soccer_uefa_champs_league': 'soccer/uefa.champions',
        'soccer_usa_mls': 'soccer/usa.1',
        'basketball_ncaab': 'basketball/mens-college-basketball',
        'americanfootball_ncaaf': 'football/college-football',
    }
    
    def get_schedule(self, sport_key: str, dates: int = 7) -> Dict[str, Any]:
        """
        Get game schedule for a sport
        
        Args:
            sport_key: The Odds API sport key (e.g., 'basketball_nba')
            dates: Number of days to fetch (default 7)
            
        Returns:
            Dict with games list and metadata
        """
        espn_path = self.SPORT_MAPPING.get(sport_key)
        
        if not espn_path:
            logger.warning(f"Sport {sport_key} not supported by ESPN API")
            return {"error": f"Sport {sport_key} not supported", "games": []}
        
        try:
            url = f"{self.BASE_URL}/{espn_path}/scoreboard"
            params = {
                "limit": 300,  # Get lots of games
                "dates": dates  # Days of games to fetch
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            games = self._parse_espn_response(data, sport_key)
            
            return {
                "sport": sport_key,
                "source": "ESPN",
                "count": len(games),
                "games": games
            }
            
        except requests.RequestException as e:
            logger.error(f"ESPN API error for {sport_key}: {e}")
            return {"error": str(e), "games": []}
    
    def _parse_espn_response(self, data: dict, sport_key: str) -> List[Dict[str, Any]]:
        """Parse ESPN API response into standardized format"""
        games = []
        
        events = data.get('events', [])
        
        for event in events:
            try:
                competitions = event.get('competitions', [{}])[0]
                competitors = competitions.get('competitors', [])
                
                # Find home and away teams
                home_team = None
                away_team = None
                
                for competitor in competitors:
                    team_name = competitor.get('team', {}).get('displayName', 'Unknown')
                    if competitor.get('homeAway') == 'home':
                        home_team = team_name
                    else:
                        away_team = team_name
                
                # Get game time (ISO format)
                commence_time = event.get('date')  # Already in ISO format
                
                # Get game ID
                game_id = event.get('id')
                
                # Get status
                status = event.get('status', {})
                status_type = status.get('type', {}).get('name', 'scheduled')
                
                if home_team and away_team and commence_time:
                    games.append({
                        'id': f"espn_{sport_key}_{game_id}",
                        'home_team': home_team,
                        'away_team': away_team,
                        'commence_time': commence_time,
                        'status': status_type.lower(),
                        'source': 'ESPN'
                    })
                    
            except Exception as e:
                logger.warning(f"Failed to parse ESPN event: {e}")
                continue
        
        return games
    
    def get_multiple_sports(self, sport_keys: List[str]) -> Dict[str, Any]:
        """Fetch schedules for multiple sports at once"""
        results = {}
        
        for sport_key in sport_keys:
            results[sport_key] = self.get_schedule(sport_key)
        
        return results


class NHLStatsService:
    """
    Official NHL Stats API (free, no auth required)
    More reliable than ESPN for hockey data
    """
    
    BASE_URL = "https://statsapi.web.nhl.com/api/v1"
    
    def get_schedule(self, days_ahead: int = 7) -> Dict[str, Any]:
        """Get NHL schedule for next N days"""
        try:
            from datetime import date, timedelta
            
            start_date = date.today()
            end_date = start_date + timedelta(days=days_ahead)
            
            url = f"{self.BASE_URL}/schedule"
            params = {
                'startDate': start_date.isoformat(),
                'endDate': end_date.isoformat()
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            games = self._parse_nhl_response(data)
            
            return {
                "sport": "icehockey_nhl",
                "source": "NHL Stats API",
                "count": len(games),
                "games": games
            }
            
        except Exception as e:
            logger.error(f"NHL API error: {e}")
            return {"error": str(e), "games": []}
    
    def _parse_nhl_response(self, data: dict) -> List[Dict[str, Any]]:
        """Parse NHL API response"""
        games = []
        
        for date_entry in data.get('dates', []):
            for game in date_entry.get('games', []):
                try:
                    teams = game.get('teams', {})
                    home_team = teams.get('home', {}).get('team', {}).get('name')
                    away_team = teams.get('away', {}).get('team', {}).get('name')
                    game_time = game.get('gameDate')
                    game_id = game.get('gamePk')
                    
                    if home_team and away_team and game_time:
                        games.append({
                            'id': f"nhl_{game_id}",
                            'home_team': home_team,
                            'away_team': away_team,
                            'commence_time': game_time,
                            'status': game.get('status', {}).get('detailedState', 'Scheduled').lower(),
                            'source': 'NHL'
                        })
                except Exception as e:
                    logger.warning(f"Failed to parse NHL game: {e}")
                    continue
        
        return games


# Singleton instances
espn_service = ESPNService()
nhl_service = NHLStatsService()


# Helper function to get games from best available source
def get_games_smart(sport_key: str) -> Dict[str, Any]:
    """
    Smart function that tries free sources first, falls back to Odds API
    
    Priority:
    1. NHL API (for hockey)
    2. ESPN API (for supported sports)
    3. The Odds API (fallback, costs credits)
    """
    
    # Try NHL API first for hockey
    if sport_key == 'icehockey_nhl':
        result = nhl_service.get_schedule()
        if result.get('games'):
            return result
    
    # Try ESPN API
    result = espn_service.get_schedule(sport_key)
    if result.get('games'):
        return result
    
    # If free sources failed, caller should use Odds API as fallback
    return {
        "error": "No free source available",
        "games": [],
        "fallback_to_odds_api": True
    }


if __name__ == "__main__":
    # Test the services
    print("Testing ESPN API for NBA...")
    nba_games = espn_service.get_schedule('basketball_nba')
    print(f"Found {nba_games['count']} NBA games")
    if nba_games['games']:
        print(f"First game: {nba_games['games'][0]}")
    
    print("\nTesting NHL Stats API...")
    nhl_games = nhl_service.get_schedule()
    print(f"Found {nhl_games['count']} NHL games")
    if nhl_games['games']:
        print(f"First game: {nhl_games['games'][0]}")
