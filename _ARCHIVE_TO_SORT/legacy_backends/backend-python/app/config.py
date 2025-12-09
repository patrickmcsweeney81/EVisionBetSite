"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App
    APP_NAME: str = "BET EVision Platform"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./evisionbet.db"  # Fallback for local dev if not provided
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated CORS origins"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Odds API
    ODDS_API_KEY: str
    ODDS_API_BASE: str = "https://api.the-odds-api.com/v4"
    
    # Bot Configuration
    EV_MIN_EDGE: float = 0.03
    BETFAIR_COMMISSION: float = 0.06
    REGIONS: str = "au,us"
    MARKETS: str = "h2h,spreads,totals"
    SPORTS: str = "upcoming"
    
    # Telegram (optional)
    TELEGRAM_ENABLED: bool = False
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Normalize DATABASE_URL for SQLAlchemy if using Postgres on Render (ensure psycopg driver prefix)
if settings.DATABASE_URL.startswith("postgres://"):
    # Render legacy format conversion to sqlalchemy's expected 'postgresql://'
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
