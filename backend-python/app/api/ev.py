"""
EV Hits API endpoints - serve data from bot CSV output
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import csv
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Expected bot data directory (relative to backend-python root or absolute)
BOT_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "EV_ARB Bot VSCode" / "data"
EV_CSV_PATH = BOT_DATA_DIR / "hits_ev.csv"

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
    sportsbet: Optional[float] = None
    bet365: Optional[float] = None
    pointsbet: Optional[float] = None
    dabble: Optional[float] = None
    ladbrokes: Optional[float] = None
    unibet: Optional[float] = None
    neds: Optional[float] = None
    tab: Optional[float] = None
    tabtouch: Optional[float] = None
    betr: Optional[float] = None
    playup: Optional[float] = None
    betright: Optional[float] = None

class EVHitsResponse(BaseModel):
    """Response containing EV hits and metadata"""
    hits: List[EVHit]
    total: int
    last_updated: Optional[str] = None

def _parse_ev_csv_row(row: dict) -> EVHit:
    """Parse CSV row dict into EVHit model, handling missing/empty values."""
    def safe_float(val, default=0.0):
        try:
            return float(val) if val and val.strip() else default
        except (ValueError, AttributeError):
            return default
    
    def safe_str(val, default=""):
        return str(val).strip() if val else default
    
    return EVHit(
        game_start_perth=safe_str(row.get("game_start_perth", "")),
        sport=safe_str(row.get("sport", "")),
        ev=safe_float(row.get("EV"), 0.0),
        event=safe_str(row.get("event", "")),
        market=safe_str(row.get("market", "")),
        line=safe_str(row.get("line")) or None,
        side=safe_str(row.get("side", "")),
        stake=safe_float(row.get("stake"), 0.0),
        book=safe_str(row.get("book", "")),
        price=safe_float(row.get("price"), 0.0),
        prob=safe_float(row.get("Prob"), 0.0),
        fair=safe_float(row.get("Fair"), 0.0),
        pinnacle=safe_float(row.get("Pinnacle")) or None,
        betfair=safe_float(row.get("Betfair")) or None,
        sportsbet=safe_float(row.get("Sportsbet")) or None,
        bet365=safe_float(row.get("Bet365")) or None,
        pointsbet=safe_float(row.get("Pointsbet")) or None,
        dabble=safe_float(row.get("Dabble")) or None,
        ladbrokes=safe_float(row.get("Ladbrokes")) or None,
        unibet=safe_float(row.get("Unibet")) or None,
        neds=safe_float(row.get("Neds")) or None,
        tab=safe_float(row.get("TAB")) or None,
        tabtouch=safe_float(row.get("TABtouch")) or None,
        betr=safe_float(row.get("Betr")) or None,
        playup=safe_float(row.get("PlayUp")) or None,
        betright=safe_float(row.get("BetRight")) or None,
    )

@router.get("/hits", response_model=EVHitsResponse)
async def get_ev_hits(
    limit: int = Query(default=50, ge=1, le=500, description="Max hits to return"),
    min_ev: Optional[float] = Query(default=None, ge=0, description="Minimum EV percentage filter"),
    sport: Optional[str] = Query(default=None, description="Filter by sport key")
):
    """
    Retrieve recent EV hits from bot CSV output.
    
    - **limit**: Maximum number of hits to return (default 50, max 500)
    - **min_ev**: Optional minimum EV threshold (e.g., 0.05 for 5%)
    - **sport**: Optional sport filter (e.g., 'basketball_nba')
    """
    if not EV_CSV_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail=f"EV hits CSV not found. Bot may not have run yet or path misconfigured: {EV_CSV_PATH}"
        )
    
    try:
        hits = []
        last_modified = datetime.fromtimestamp(EV_CSV_PATH.stat().st_mtime).isoformat()
        
        with EV_CSV_PATH.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Apply filters
                if min_ev is not None:
                    try:
                        ev_val = float(row.get("EV", 0))
                        if ev_val < min_ev:
                            continue
                    except (ValueError, TypeError):
                        continue
                
                if sport is not None:
                    if row.get("sport", "").lower() != sport.lower():
                        continue
                
                hits.append(_parse_ev_csv_row(row))
                
                if len(hits) >= limit:
                    break
        
        return EVHitsResponse(
            hits=hits,
            total=len(hits),
            last_updated=last_modified
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read EV hits CSV: {str(e)}"
        )

@router.get("/summary")
async def get_ev_summary():
    """
    Get summary statistics of EV hits without full data.
    """
    if not EV_CSV_PATH.exists():
        return {
            "available": False,
            "message": "No EV data available yet"
        }
    
    try:
        total_hits = 0
        sports_count = {}
        top_ev = 0.0
        
        with EV_CSV_PATH.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                total_hits += 1
                sport = row.get("sport", "unknown")
                sports_count[sport] = sports_count.get(sport, 0) + 1
                
                try:
                    ev_val = float(row.get("EV", 0))
                    if ev_val > top_ev:
                        top_ev = ev_val
                except (ValueError, TypeError):
                    pass
        
        return {
            "available": True,
            "total_hits": total_hits,
            "sports": sports_count,
            "top_ev": round(top_ev, 4),
            "last_updated": datetime.fromtimestamp(EV_CSV_PATH.stat().st_mtime).isoformat()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read EV summary: {str(e)}"
        )


# All Odds data path
ALL_ODDS_CSV_PATH = BOT_DATA_DIR / "all_odds.csv"


class AllOddsRow(BaseModel):
    """Single row from all_odds.csv"""
    game_start_perth: str
    sport: str
    ev: Optional[float] = None
    event: str
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
        raise HTTPException(
            status_code=404,
            detail="All odds data not available. Run the EV bot to generate data."
        )
    
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
