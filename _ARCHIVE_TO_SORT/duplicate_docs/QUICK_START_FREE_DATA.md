# Quick Start Guide - Free Data Sources Implementation

## What This Solves
✅ Reduces Odds API credit usage by **95%+**  
✅ Uses **100% FREE** alternatives for game schedules  
✅ Only uses Odds API for actual odds/betting data  
✅ Caches everything in database for persistence  

---

## Implementation Steps

### Step 1: Install Dependencies (if needed)
```bash
cd backend-python
pip install apscheduler requests beautifulsoup4
```

### Step 2: Run Database Migration
```bash
cd backend-python

# Create the game_schedules table
alembic upgrade head

# Or if that fails, create manually in PostgreSQL:
psql -d your_database << EOF
CREATE TABLE game_schedules (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR UNIQUE NOT NULL,
    sport_key VARCHAR NOT NULL,
    home_team VARCHAR NOT NULL,
    away_team VARCHAR NOT NULL,
    commence_time TIMESTAMPTZ NOT NULL,
    source VARCHAR,
    status VARCHAR DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_sport_commence ON game_schedules(sport_key, commence_time);
CREATE INDEX idx_status ON game_schedules(status);
EOF
```

### Step 3: Switch to Improved Odds API

**Option A: Replace existing file (recommended)**
```bash
cd backend-python/app/api
mv odds.py odds_old_backup.py
mv odds_improved.py odds.py
```

**Option B: Update main.py to use new router**
```python
# In app/main.py, change:
from .api import odds
# To:
from .api import odds_improved as odds
```

### Step 4: Test Free APIs
```bash
cd backend-python

# Test ESPN API
python -m app.services.free_schedule_service

# Should output:
# Testing ESPN API for NBA...
# Found X NBA games
# First game: {...}
```

### Step 5: Start Backend with Scheduler
```python
# Add to app/main.py (at the end):

@app.on_event("startup")
def startup_event():
    """Start background scheduler on startup"""
    from .scheduler import setup_scheduler
    setup_scheduler()
    print("✅ Background scheduler started")
```

### Step 6: Initial Data Load
```bash
# Manually populate database with current games
curl -X POST http://localhost:8000/api/odds/admin/refresh-all-schedules

# Should return:
# {
#   "status": "completed",
#   "results": {
#     "basketball_nba": {"success": true, "count": 25, "source": "ESPN"},
#     ...
#   }
# }
```

---

## How It Works

### Before (Current System)
```
User requests games
    ↓
Check 60s cache (often expired)
    ↓
Call Odds API ($$$ credits used)
    ↓
Return games
```
**Cost**: ~1440 API calls/day per sport = EXPENSIVE

### After (New System)
```
User requests games
    ↓
Check 15min cache (rarely expired)
    ↓
Check database (games stored here)
    ↓
If database empty:
    Try ESPN API (FREE)
    Try NHL API (FREE)
    Fallback to Odds API only if needed
    ↓
Store in database
    ↓
Return games
```
**Cost**: ~2-4 API calls/day per sport = 99% CHEAPER

### Background Job (Runs Every 6 Hours)
```
Scheduler triggers
    ↓
Fetch from ESPN API (FREE)
Fetch from NHL API (FREE)
    ↓
Update database
    ↓
Widget always has fresh data
```
**Cost**: ZERO Odds API calls

---

## Configuration Options

### Cache TTL Settings
```python
# In app/api/odds.py (or odds_improved.py)

CACHE_TTL_SCHEDULES = 900   # 15 min (can increase to 3600 for 1 hour)
CACHE_TTL_ODDS = 60          # 1 min (keep short for price accuracy)
CACHE_TTL_SPORTS = 3600      # 1 hour (sports list rarely changes)
```

### Disable Free Sources (if needed)
```python
# In API call, add parameter:
GET /api/odds/upcoming/basketball_nba?use_free=0

# This forces Odds API usage (for testing or if free sources fail)
```

### Scheduler Frequency
```python
# In app/scheduler.py

# Change from 6 hours to 12 hours:
IntervalTrigger(hours=12)

# Or use cron for specific times:
CronTrigger(hour=0, minute=0)  # Midnight daily
CronTrigger(hour="*/6")         # Every 6 hours
CronTrigger(day_of_week="mon,fri", hour=8)  # Mon & Fri at 8am
```

---

## Testing

### Test Free APIs Work
```bash
# Test ESPN API
curl http://localhost:8000/api/odds/upcoming/basketball_nba?use_free=1

# Should return games with "source": "ESPN"
```

### Test Database Caching
```bash
# First call - fetches from ESPN
curl http://localhost:8000/api/odds/upcoming/basketball_nba

# Second call - returns from database (instant)
curl http://localhost:8000/api/odds/upcoming/basketball_nba

# Check it says "source": "database"
```

### Test Force Refresh
```bash
# Force fresh data fetch
curl http://localhost:8000/api/odds/upcoming/basketball_nba?refresh=1
```

### Test Admin Refresh
```bash
# Manually trigger background job
curl -X POST http://localhost:8000/api/odds/admin/refresh-all-schedules
```

---

## Supported Sports (Free APIs)

### ESPN API (No Auth Required)
- ✅ `basketball_nba` - NBA
- ✅ `americanfootball_nfl` - NFL  
- ✅ `icehockey_nhl` - NHL
- ✅ `baseball_mlb` - MLB
- ✅ `soccer_epl` - Premier League
- ✅ `soccer_uefa_champs_league` - Champions League
- ✅ `basketball_ncaab` - College Basketball
- ✅ `americanfootball_ncaaf` - College Football

### NHL Stats API (Official, No Auth)
- ✅ `icehockey_nhl` - NHL (more reliable than ESPN)

### For Other Sports
Falls back to Odds API automatically (costs credits)

---

## Monitoring

### Check Cache Stats
```bash
curl http://localhost:8000/api/odds/admin/cache-stats
```

### Check Database Games
```sql
-- In PostgreSQL
SELECT sport_key, COUNT(*), MAX(commence_time) as latest_game
FROM game_schedules
GROUP BY sport_key;

-- Check data freshness
SELECT sport_key, MAX(updated_at) as last_update
FROM game_schedules  
GROUP BY sport_key;
```

### Check Scheduler Status
```python
# In Python console
from app.scheduler import setup_scheduler
scheduler = setup_scheduler()
scheduler.print_jobs()
```

---

## Cost Savings Calculator

### Old System (60s cache)
- Widget refreshes: Every minute
- Users: 10 active users
- Sports: 5 sports monitored
- **API calls/day**: 1,440 per sport × 5 = **7,200 calls/day**
- **Monthly**: ~216,000 calls
- **Cost**: Depends on plan, but EXPENSIVE

### New System (15min cache + DB + free APIs)
- Database serves most requests
- Free APIs refresh every 6 hours
- Odds API only as fallback
- **API calls/day**: ~2-10 per sport × 5 = **10-50 calls/day**
- **Monthly**: ~300-1,500 calls
- **Savings**: **99%+ reduction** 🎉

---

## Troubleshooting

### ESPN API Not Working
```python
# Check response
import requests
r = requests.get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard")
print(r.status_code)
print(r.json())
```

### Database Not Storing Games
```bash
# Check migration ran
alembic current

# Check table exists
psql -d your_database -c "\dt game_schedules"
```

### Scheduler Not Running
```python
# Add debug logging
import logging
logging.basicConfig(level=logging.INFO)

# Check scheduler started in app logs
```

---

## Next Steps

1. ✅ **Test**: Run the free APIs to verify they work
2. ✅ **Migrate**: Run database migration
3. ✅ **Deploy**: Switch to improved odds API
4. ✅ **Monitor**: Watch API usage drop dramatically
5. ✅ **Expand**: Add more sports as needed

---

## Files Created

- `app/services/free_schedule_service.py` - ESPN & NHL API integration
- `app/models/game_schedule.py` - Database model
- `app/api/odds_improved.py` - Improved API with free sources
- `app/scheduler.py` - Background job scheduler
- `alembic/versions/add_game_schedules.py` - Database migration
- `ALTERNATIVE_DATA_SOURCES.md` - Comprehensive documentation

---

## Support & Resources

- **ESPN API**: https://site.api.espn.com/apis/site/v2/sports/
- **NHL API**: https://statsapi.web.nhl.com/api/v1/schedule
- **APScheduler**: https://apscheduler.readthedocs.io/
- **The Odds API**: https://the-odds-api.com/

---

**Questions?** Check the logs, test the endpoints, and verify the database has data!
