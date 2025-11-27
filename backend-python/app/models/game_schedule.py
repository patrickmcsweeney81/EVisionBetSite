"""
Database model for storing game schedules
Reduces API calls by caching games in PostgreSQL
"""
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.sql import func
from ..database import Base


class GameSchedule(Base):
    """
    Stores game schedules from various sources
    Reduces API calls by caching game data
    """
    __tablename__ = "game_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # External ID from source (e.g., "espn_nba_401584947")
    external_id = Column(String, unique=True, index=True, nullable=False)
    
    # Sport key (e.g., "basketball_nba")
    sport_key = Column(String, index=True, nullable=False)
    
    # Team names
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    
    # Game time (UTC)
    commence_time = Column(DateTime(timezone=True), index=True, nullable=False)
    
    # Data source (e.g., "ESPN", "NHL", "OddsAPI")
    source = Column(String, default="unknown")
    
    # Game status (scheduled, live, completed)
    status = Column(String, default="scheduled", index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_sport_commence', 'sport_key', 'commence_time'),
        Index('idx_status_commence', 'status', 'commence_time'),
    )
    
    def to_dict(self):
        """Convert to dictionary matching API format"""
        return {
            'id': self.external_id,
            'home_team': self.home_team,
            'away_team': self.away_team,
            'commence_time': self.commence_time.isoformat() if self.commence_time else None,
            'status': self.status,
            'source': self.source
        }


# Database helper functions

def upsert_games(db, games: list, sport_key: str, source: str = "ESPN"):
    """
    Insert or update games in database
    
    Args:
        db: SQLAlchemy session
        games: List of game dicts with keys: id, home_team, away_team, commence_time
        sport_key: Sport key (e.g., "basketball_nba")
        source: Data source name
    """
    from datetime import datetime
    from sqlalchemy import or_
    
    for game_data in games:
        external_id = game_data.get('id')
        if not external_id:
            continue
        
        # Check if game exists
        existing = db.query(GameSchedule).filter(
            GameSchedule.external_id == external_id
        ).first()
        
        # Parse commence time
        commence_time_str = game_data.get('commence_time')
        if isinstance(commence_time_str, str):
            try:
                commence_time = datetime.fromisoformat(commence_time_str.replace('Z', '+00:00'))
            except:
                continue
        else:
            commence_time = commence_time_str
        
        if existing:
            # Update existing game
            existing.home_team = game_data.get('home_team', existing.home_team)
            existing.away_team = game_data.get('away_team', existing.away_team)
            existing.commence_time = commence_time
            existing.status = game_data.get('status', existing.status)
            existing.source = source
        else:
            # Create new game
            new_game = GameSchedule(
                external_id=external_id,
                sport_key=sport_key,
                home_team=game_data.get('home_team'),
                away_team=game_data.get('away_team'),
                commence_time=commence_time,
                status=game_data.get('status', 'scheduled'),
                source=source
            )
            db.add(new_game)
    
    db.commit()


def get_upcoming_games_from_db(db, sport_key: str, limit: int = 50):
    """
    Get upcoming games from database
    
    Args:
        db: SQLAlchemy session
        sport_key: Sport key to filter by
        limit: Maximum number of games to return
        
    Returns:
        List of games as dicts
    """
    from datetime import datetime, timezone
    
    now = datetime.now(timezone.utc)
    
    games = db.query(GameSchedule).filter(
        GameSchedule.sport_key == sport_key,
        GameSchedule.commence_time > now
    ).order_by(
        GameSchedule.commence_time
    ).limit(limit).all()
    
    return [game.to_dict() for game in games]


def cleanup_old_games(db, days_old: int = 7):
    """
    Delete games older than N days
    
    Args:
        db: SQLAlchemy session
        days_old: Delete games older than this many days
        
    Returns:
        Number of deleted games
    """
    from datetime import datetime, timezone, timedelta
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_old)
    
    deleted = db.query(GameSchedule).filter(
        GameSchedule.commence_time < cutoff
    ).delete()
    
    db.commit()
    return deleted


def get_games_needing_refresh(db, hours_old: int = 6):
    """
    Get sports that need data refresh
    
    Returns:
        List of sport keys that need new data
    """
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import func
    
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_old)
    
    # Get sports with no recent updates or no data
    result = db.query(GameSchedule.sport_key).filter(
        GameSchedule.updated_at < cutoff
    ).group_by(GameSchedule.sport_key).all()
    
    return [r[0] for r in result]
