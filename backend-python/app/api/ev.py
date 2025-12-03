"""
EV Hits API endpoints - serve data from bot CSV output
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import csv
from pathlib import Path
import os
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Data directory resolution:
# 1. ENV var EV_DATA_DIR if set
# 2. ./data relative to backend (preferred for production)
# 3. Fallback legacy path pointing to local dev bot folder

_env_dir = os.getenv("EV_DATA_DIR")
if _env_dir:
    BOT_DATA_DIR = Path(_env_dir).resolve()
else:
    backend_root = Path(__file__).resolve().parent.parent
    local_data = backend_root / "data"
    if local_data.exists():
        BOT_DATA_DIR = local_data
    else:
        # Legacy dev path (may not exist in production)
        BOT_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "EV_ARB Bot VSCode" / "data"


# DEBUG: Print resolved data directory and CSV paths at import time
print(f"[EV API DEBUG] BOT_DATA_DIR: {BOT_DATA_DIR}")
ALL_ODDS_CSV_PATH = BOT_DATA_DIR / "all_odds.csv"
print(f"[EV API DEBUG] ALL_ODDS_CSV_PATH: {ALL_ODDS_CSV_PATH}")

class EVHit(BaseModel):
    """Single EV opportunity"""
    game_start_perth: str
    sport: str
    ev: float
    event: str
    market: str
    line: Optional[str]
    side: str
    stake: float
    book: str
    price: float
    prob: float
    fair: float
    # Bookmaker odds (optional fields)
    pinnacle: Optional[float] = None
    betfair: Optional[float] = None

    market: str
    line: Optional[str] = None
    side: str
    stake: Optional[float] = None
    book: str
    price: float
    prob: Optional[float] = None
    fair: Optional[float] = None
    pinnacle: Optional[float] = None
    betfair: Optional[float] = None
    sportsbet: Optional[float] = None
    bet365: Optional[float] = None
    pointsbet: Optional[float] = None
    dabble: Optional[float] = None
    ladbrokes: Optional[float] = None
    unibet: Optional[float] = None


class AllOddsResponse(BaseModel):
    """Response containing all odds data"""
    odds: List[AllOddsRow]
    total: int
    last_updated: Optional[str] = None


@router.get("/all-odds", response_model=AllOddsResponse)
async def get_all_odds(
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    sport: Optional[str] = Query(None, description="Filter by sport"),
    market: Optional[str] = Query(None, description="Filter by market type"),
    min_ev: Optional[float] = Query(None, description="Minimum EV percentage (e.g., 3.0 for 3%)"),
    book: Optional[str] = Query(None, description="Filter by bookmaker")
):
    """
    Get all odds data from all_odds.csv with filtering and pagination.
    This endpoint serves the comprehensive odds comparison table.
    """
    if not ALL_ODDS_CSV_PATH.exists():
        # Graceful empty response
        return AllOddsResponse(rows=[], total=0, last_updated=None)
    
    try:
        all_rows = []
        
        with ALL_ODDS_CSV_PATH.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Apply filters
                if sport and row.get("sport", "").lower() != sport.lower():
                    continue
                if market and row.get("market", "").lower() != market.lower():
                    continue
                if book and row.get("book", "").lower() != book.lower():
                    continue
                if min_ev:
                    try:
                        ev_val = float(row.get("EV", "0").replace("%", ""))
                        if ev_val < min_ev:
                            continue
                    except (ValueError, TypeError):
                        continue
                
                # Parse row data
                odds_row = AllOddsRow(
                    game_start_perth=row.get("game_start_perth", ""),
                    sport=row.get("sport", ""),
                    ev=_parse_float(row.get("EV")),
                    event=row.get("event", ""),
                    market=row.get("market", ""),
                    line=row.get("line"),
                    side=row.get("side", ""),
                    stake=_parse_float(row.get("stake")),
                    book=row.get("book", ""),
                    price=_parse_float(row.get("price")) or 0.0,
                    prob=_parse_float(row.get("Prob")),
                    fair=_parse_float(row.get("Fair")),
                    pinnacle=_parse_float(row.get("Pinnacle")),
                    betfair=_parse_float(row.get("Betfair")),
                    sportsbet=_parse_float(row.get("Sportsbet")),
                    bet365=_parse_float(row.get("Bet365")),
                    pointsbet=_parse_float(row.get("Pointsbet")),
                    dabble=_parse_float(row.get("Dabble")),
                    ladbrokes=_parse_float(row.get("Ladbrokes")),
                    unibet=_parse_float(row.get("Unibet"))
                )
                all_rows.append(odds_row)
        
        # Apply pagination
        total = len(all_rows)
        paginated_rows = all_rows[offset:offset + limit]
        
        # Get last modified time
        last_updated = datetime.fromtimestamp(ALL_ODDS_CSV_PATH.stat().st_mtime).isoformat()
        
        return AllOddsResponse(
            odds=paginated_rows,
            total=total,
            last_updated=last_updated
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read all odds data: {str(e)}"
        )


def _parse_float(value) -> Optional[float]:
    """Helper to safely parse float values from CSV"""
    if not value or value == "":
        return None
    try:
        # Remove % sign if present
        clean_value = str(value).replace("%", "").replace("$", "").strip()
        return float(clean_value) if clean_value else None
    except (ValueError, TypeError):
        return None
