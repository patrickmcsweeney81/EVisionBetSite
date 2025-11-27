import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import './UpcomingGamesPublic.css';

function UpcomingGamesPublic() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport] = useState('basketball_nba'); // Default to NBA for public view

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch without auth - if endpoint is public, this will work
      // Otherwise, we'll show a sample/demo view
      const response = await fetch(`${API_URL}/api/odds/upcoming/${selectedSport}`);

      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      } else {
        // Show demo data for public view
        setGames(getDemoGames());
      }
    } catch (err) {
      // Show demo data on error
      setGames(getDemoGames());
    } finally {
      setLoading(false);
    }
  };

  const getDemoGames = () => {
    // Demo games for public view
    return [
      {
        id: 'demo1',
        home_team: 'Boston Celtics',
        away_team: 'Miami Heat',
        commence_time: new Date(Date.now() + 3600000 * 5).toISOString()
      },
      {
        id: 'demo2',
        home_team: 'LA Lakers',
        away_team: 'Golden State Warriors',
        commence_time: new Date(Date.now() + 3600000 * 8).toISOString()
      },
      {
        id: 'demo3',
        home_team: 'Milwaukee Bucks',
        away_team: 'Phoenix Suns',
        commence_time: new Date(Date.now() + 3600000 * 12).toISOString()
      }
    ];
  };

  const formatLocalTime = (utcTimeString) => {
    if (!utcTimeString) return 'TBA';
    
    try {
      const date = new Date(utcTimeString);
      const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTimeUntilGame = (utcTimeString) => {
    if (!utcTimeString) return '';
    
    try {
      const gameTime = new Date(utcTimeString);
      const now = new Date();
      const diffMs = gameTime - now;
      
      if (diffMs < 0) return 'Live';
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) return `in ${diffDays}d`;
      if (diffHours > 0) return `in ${diffHours}h`;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `in ${diffMins}m`;
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="upcoming-games-public">
      <div className="widget-header-public">
        <h3>🏀 Today's NBA Games</h3>
        <span className="live-indicator">● LIVE</span>
      </div>

      {loading && (
        <div className="widget-loading-public">
          <p>Loading games...</p>
        </div>
      )}

      {!loading && games.length > 0 && (
        <div className="games-list-public">
          {games.slice(0, 5).map((game, index) => (
            <div key={game.id || index} className="game-item-public">
              <div className="game-teams-public">
                <div className="team-public away">{game.away_team}</div>
                <div className="vs-public">@</div>
                <div className="team-public home">{game.home_team}</div>
              </div>
              <div className="game-time-public">
                <div className="time-main-public">{formatLocalTime(game.commence_time)}</div>
                <div className="time-until-public">{getTimeUntilGame(game.commence_time)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="widget-cta">
        <p>Sign in to track all sports and get EV alerts</p>
      </div>
    </div>
  );
}

export default UpcomingGamesPublic;
