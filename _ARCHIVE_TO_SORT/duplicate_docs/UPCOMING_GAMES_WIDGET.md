# Upcoming Games Widget Implementation

## Overview
Successfully added an interactive widget to the Dashboard home screen that displays upcoming games for any selected sport with local time conversion for the user.

## Features Implemented

### 1. Sport Selection
- **Dropdown selector** with all active sports from The Odds API
- Automatically sorted alphabetically
- Defaults to popular sports (NBA, EPL) if available
- Dynamic loading from API

### 2. Game Display
- **Home/Away teams** clearly labeled (Away @ Home format)
- **Local time display** - automatically converts UTC times to user's local timezone
- **Time until game** - Shows "in Xd", "in Xh", or "in Xm" for countdown
- **Live indicator** - Shows "Live/Started" for games in progress
- **Scrollable list** - Shows up to 10 games with option to see more

### 3. User Experience
- **Auto-load** on dashboard visit
- **Manual refresh** button to update games
- **Loading states** with friendly messages
- **Error handling** with clear error messages
- **Empty state** when no games found
- **Hover effects** on game items

### 4. Responsive Design
- Desktop-optimized layout
- Mobile-friendly stacking on smaller screens
- Custom scrollbar styling
- Smooth animations and transitions

## Technical Implementation

### Backend Changes

#### New Endpoint: `/api/odds/upcoming/{sport_key}`
**File**: `backend-python/app/api/odds.py`

```python
@router.get("/upcoming/{sport_key}")
async def get_upcoming_games(sport_key: str, request: Request, cache: CacheManager = Depends(get_cache)):
    """Get upcoming games for a specific sport with simplified data (cached)."""
```

- Cached for 60 seconds
- Returns simplified game data (ID, teams, commence time)
- Supports refresh parameter

#### New Service Method: `get_upcoming_games()`
**File**: `backend-python/app/services/bot_service.py`

```python
def get_upcoming_games(self, sport_key: str) -> Dict[str, Any]:
    """Get upcoming games for a sport with simplified data"""
```

- Fetches only h2h market (lighter API call)
- Returns simplified game structure
- Error handling for API failures

### Frontend Changes

#### New Component: `UpcomingGames.js`
**Location**: `frontend/src/components/UpcomingGames.js`

**Key Functions**:
- `fetchSports()` - Loads available sports from API
- `fetchGames(sportKey)` - Loads games for selected sport
- `formatLocalTime(utcString)` - Converts UTC to local time
- `getTimeUntilGame(utcString)` - Calculates countdown
- `handleRefresh()` - Manual refresh trigger

**State Management**:
```javascript
const [sports, setSports] = useState([]);
const [selectedSport, setSelectedSport] = useState('');
const [games, setGames] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

#### New Stylesheet: `UpcomingGames.css`
**Location**: `frontend/src/components/UpcomingGames.css`

**Styling Features**:
- Dark theme matching site design
- Teal accent colors (#4be1c1)
- Hover effects and transitions
- Custom scrollbar
- Responsive breakpoints
- Pulse animation for live games

#### Dashboard Integration
**File**: `frontend/src/components/Dashboard.js`

Added widget above dashboard grid:
```javascript
import UpcomingGames from './UpcomingGames';

// In render:
<UpcomingGames />
<div className="dashboard-grid">
  {/* existing cards */}
</div>
```

## Time Formatting Details

### Local Time Conversion
The widget uses JavaScript's `toLocaleString()` to automatically convert UTC times to the user's local timezone:

```javascript
const options = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
};
date.toLocaleString('en-US', options);
```

**Example Output**: `Nov 29, 11:00 PM`

### Countdown Display
Calculates time difference and displays:
- **Days**: "in 3d" (if > 24 hours)
- **Hours**: "in 5h" (if < 24 hours)
- **Minutes**: "in 45m" (if < 1 hour)
- **Started**: "Live/Started" (if past start time)

## File Structure

```
frontend/src/components/
├── UpcomingGames.js      # Main widget component
├── UpcomingGames.css     # Widget styling
└── Dashboard.js          # Updated to include widget

backend-python/app/
├── api/
│   └── odds.py           # Added /upcoming/{sport_key} endpoint
└── services/
    └── bot_service.py    # Added get_upcoming_games() method
```

## API Integration

### Endpoints Used

1. **GET** `/api/odds/sports`
   - Fetches all available sports
   - Returns: `[{key, title, group, description, active}]`

2. **GET** `/api/odds/upcoming/{sport_key}`
   - Fetches upcoming games for sport
   - Returns: `{sport, count, games: [{id, commence_time, home_team, away_team}]}`

### Authentication
All requests require JWT token from localStorage:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Testing

### How to Test

1. **Start servers** (already running):
   - Backend: `http://127.0.0.1:8000`
   - Frontend: `http://localhost:3000`

2. **Navigate to Dashboard**:
   - Login with credentials
   - Dashboard should display widget immediately

3. **Test Features**:
   - ✅ Widget loads on dashboard
   - ✅ Sport selector shows available sports
   - ✅ Games load automatically for default sport
   - ✅ Times display in local timezone
   - ✅ Countdown shows correctly
   - ✅ Refresh button works
   - ✅ Sport selector updates games
   - ✅ Scrolling works for many games
   - ✅ Empty state shows when no games
   - ✅ Error handling works

### Sample Sports to Test
- `basketball_nba` - NBA Basketball
- `soccer_epl` - English Premier League
- `americanfootball_nfl` - NFL
- `icehockey_nhl` - NHL
- `soccer_uefa_champs_league` - UEFA Champions League

## Performance

- **Caching**: 60-second cache on backend
- **Lazy Loading**: Games only fetch when sport selected
- **Efficient API**: Only h2h market fetched (lighter than full odds)
- **Auto-refresh**: Not implemented (manual refresh only to save API calls)

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Timezone detection works automatically via browser's `Intl` API.

## Future Enhancements

1. **Live Updates**: WebSocket for real-time score updates
2. **Favorites**: Pin favorite sports to top
3. **Multi-Sport View**: Show multiple sports simultaneously
4. **Odds Preview**: Show best odds directly in widget
5. **Quick Bet**: Click to navigate to odds page for that game
6. **Date Filter**: Filter by today/tomorrow/week
7. **Team Logos**: Display team logos if available
8. **Expanded View**: Click to see full game details
9. **Notifications**: Alert when favorite team plays
10. **Export**: Export schedule to calendar

## Success Metrics

- ✅ Widget displays on dashboard
- ✅ Local time conversion working
- ✅ Sport selection functional
- ✅ Responsive on mobile
- ✅ Error states handled
- ✅ Loading states smooth
- ✅ API integration complete
- ✅ Caching implemented

## Notes

- Widget uses existing authentication
- No new dependencies required
- Leverages existing Odds API service
- Compatible with current styling
- No breaking changes to existing features

---

**Status**: ✅ Complete and Live
**Date**: November 28, 2025
**Ready for**: User testing and feedback
