# Alternative Data Sources for EVisionBetSite

## Problem
The Odds API charges per request, which can quickly consume credits when fetching game schedules frequently for the widget.

## Solutions

### 1. **Increase Cache TTL (Immediate Solution - FREE)**

**Current**: 60 seconds cache  
**Recommended**: 5-15 minutes for schedules

Game schedules don't change frequently, so we can cache them much longer:

```python
# In backend-python/app/api/odds.py
CACHE_TTL_SCHEDULES = 900  # 15 minutes for game schedules
CACHE_TTL_ODDS = 60         # 1 minute for live odds (pricing sensitive)
```

**Savings**: Reduces API calls by 90% (15min vs 1min cache)

---

### 2. **Database Storage (Recommended - FREE)**

Store fetched game data in PostgreSQL and only refresh periodically:

**Benefits**:
- ✅ Free (using existing database)
- ✅ Persistent across restarts
- ✅ Can schedule background jobs to refresh
- ✅ No API calls for cached games
- ✅ Can store historical data

**Implementation**: See `database_caching_solution.py` below

---

### 3. **Free Alternative APIs**

#### A. **ESPN API (Unofficial - FREE)**
- **URL**: `https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard`
- **Sports**: NFL, NBA, NHL, MLB, Soccer, etc.
- **Data**: Game schedules, scores, team info
- **Rate Limit**: Generous (no official limit)
- **Cost**: FREE ✅

**Example**:
```python
# NBA games
https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard

# NFL games  
https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard

# EPL games
https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard
```

**Pros**: 
- Completely free
- Comprehensive game data
- Multiple sports
- Real-time scores

**Cons**:
- Unofficial API (could change)
- No odds data (only schedules/scores)

---

#### B. **TheSportsDB API (FREE Tier)**
- **URL**: `https://www.thesportsdb.com/api/v1/json/{api_key}/`
- **Free Tier**: 1 API key, limited calls
- **Patreon**: $3/month for unlimited
- **Data**: Schedules, scores, team info, standings
- **Sports**: All major sports

**Example**:
```python
# Get next 15 games for a team
https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id={team_id}

# Get all events by league
https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id={league_id}&s=2025
```

**Pros**:
- Official free tier
- Good documentation
- Multiple sports

**Cons**:
- Limited free calls
- Need to map team/league IDs

---

#### C. **API-Football / API-Basketball (FREE Limited)**
- **URL**: `https://api-sports.io`
- **Free Tier**: 100 requests/day
- **Data**: Fixtures, scores, odds (limited)
- **Sports**: Football (soccer), basketball

**Example**:
```python
# Get fixtures
https://v3.football.api-sports.io/fixtures?league=39&season=2025

# Get basketball games
https://v2.basketball.api-sports.io/games?league=12&season=2025
```

**Pros**:
- Free tier available
- Official API
- Some odds data

**Cons**:
- 100 calls/day limit
- Requires API key

---

#### D. **SportsData.io (FREE Tier)**
- **URL**: `https://sportsdata.io`
- **Free Tier**: Varies by sport (limited)
- **Data**: Schedules, scores, player stats
- **Sports**: NFL, NBA, MLB, NHL, etc.

**Pros**:
- Reliable commercial API
- Free tier available
- Good documentation

**Cons**:
- Limited free calls
- No odds data

---

### 4. **Web Scraping (Legal Alternatives)**

#### A. **ESPN Website Scraping**
Use `beautifulsoup4` or `scrapy` to scrape public schedule pages:

```python
import requests
from bs4 import BeautifulSoup

url = "https://www.espn.com/nba/schedule"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')
# Parse schedule data
```

**Pros**:
- Free
- Public data
- Real-time

**Cons**:
- Against some ToS
- Fragile (HTML changes break it)
- Needs maintenance

---

#### B. **Official League Websites**
Many leagues provide public schedule APIs or feeds:

- **NBA**: https://data.nba.net/
- **NFL**: https://feeds.nfl.com/
- **NHL**: https://statsapi.web.nhl.com/
- **MLB**: https://statsapi.mlb.com/

**Example (NHL)**:
```python
# Get schedule
https://statsapi.web.nhl.com/api/v1/schedule?startDate=2025-11-28&endDate=2025-12-05

# Free, official, no API key needed
```

---

### 5. **Hybrid Approach (RECOMMENDED)**

**Best Strategy**:

1. **For Schedules**: Use free APIs (ESPN, NHL API, etc.)
   - Cache for 6-24 hours
   - Store in database
   - Only shows game times (no odds)

2. **For Odds**: Use The Odds API
   - Only when user clicks on a game
   - Cache for 1-5 minutes
   - Used for actual betting decisions

3. **Background Jobs**: Scheduled updates
   - Daily job to fetch next week's games
   - Store in database
   - Zero impact on user experience

**API Credit Savings**: 95%+ reduction

---

## Software/Tools to Help

### 1. **Celery (Background Jobs - FREE)**
Schedule periodic tasks to refresh data:

```bash
pip install celery redis
```

```python
# tasks.py
from celery import Celery

app = Celery('evisionbet', broker='redis://localhost:6379')

@app.task
def update_game_schedules():
    """Run daily to fetch game schedules"""
    # Fetch from ESPN API or NHL API
    # Store in database
    pass

# Schedule: Every 6 hours
app.conf.beat_schedule = {
    'update-schedules': {
        'task': 'tasks.update_game_schedules',
        'schedule': 21600.0,  # 6 hours
    },
}
```

---

### 2. **APScheduler (Simple Scheduler - FREE)**
Lighter alternative to Celery:

```bash
pip install apscheduler
```

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(update_game_schedules, 'interval', hours=6)
scheduler.start()
```

---

### 3. **PostgreSQL with Triggers (FREE)**
Auto-cleanup old games, maintain data:

```sql
-- Auto-delete old games
CREATE OR REPLACE FUNCTION cleanup_old_games()
RETURNS void AS $$
BEGIN
    DELETE FROM games 
    WHERE commence_time < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('cleanup-old-games', '0 2 * * *', 'SELECT cleanup_old_games()');
```

---

### 4. **Redis (Better Caching - FREE/Cheap)**
Already configured but not fully utilized:

- **Local Redis**: Free (run on your machine)
- **Redis Cloud**: 30MB free tier
- **Upstash**: 10k requests/day free

**Benefits**:
- Faster than database
- TTL built-in
- Distributed caching

---

### 5. **Scrapy (Web Scraping Framework - FREE)**
Professional web scraping:

```bash
pip install scrapy
```

```python
import scrapy

class ESPNScheduleSpider(scrapy.Spider):
    name = 'espn_schedule'
    start_urls = ['https://www.espn.com/nba/schedule']
    
    def parse(self, response):
        for game in response.css('.schedule-game'):
            yield {
                'home_team': game.css('.home-team::text').get(),
                'away_team': game.css('.away-team::text').get(),
                'time': game.css('.game-time::text').get(),
            }
```

---

## Recommended Implementation Plan

### Phase 1: Immediate (Today)
1. ✅ Increase cache TTL to 15 minutes for schedules
2. ✅ Keep 60s cache for live odds
3. ✅ Add database table for games

### Phase 2: This Week
1. ✅ Implement ESPN API integration for schedules
2. ✅ Add NHL API for hockey games
3. ✅ Store all fetched games in database
4. ✅ Widget pulls from database first, API second

### Phase 3: Next Week
1. ✅ Add APScheduler for background updates
2. ✅ Daily job to fetch next week's games
3. ✅ Automatic cleanup of old games

### Phase 4: Future
1. ✅ Add Celery for more robust job queue
2. ✅ Implement Redis caching layer
3. ✅ Add monitoring for data freshness

---

## Cost Comparison

| Method | Cost | API Calls/Day | Savings |
|--------|------|---------------|---------|
| **Current** (60s cache) | High | ~1440 per sport | 0% |
| **15min cache** | Medium | ~96 per sport | 93% |
| **Database + daily refresh** | Low | ~1-2 per sport | 99.8% |
| **ESPN API only** | FREE | 0 Odds API calls | 100% |
| **Hybrid** | FREE | ~10-50 per sport | 95%+ |

---

## Code Examples

See attached files:
1. `improved_caching.py` - Enhanced cache configuration
2. `database_models.py` - Game storage models
3. `espn_api_service.py` - ESPN API integration
4. `scheduler_setup.py` - Background job setup

---

## Recommended Tools Summary

✅ **Free & Recommended**:
1. ESPN API (schedules)
2. NHL Stats API (hockey)
3. PostgreSQL (storage)
4. APScheduler (jobs)
5. Longer cache TTL

💰 **Paid but Worth It** (if needed):
1. Redis Cloud ($10/mo) - better caching
2. TheSportsDB Patreon ($3/mo) - reliable API
3. Celery + RabbitMQ - enterprise job queue

❌ **Avoid**:
1. Frequent Odds API calls for just schedules
2. No caching
3. Real-time updates for static data

---

**Next Steps**: Would you like me to implement any of these solutions?
