import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import './UpcomingGames.css';

function UpcomingGames() {
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available sports on mount
  useEffect(() => {
    fetchSports();
  }, []);

  // Fetch games when sport changes
  useEffect(() => {
    if (selectedSport) {
      fetchGames(selectedSport);
    }
  }, [selectedSport]);

  const fetchSports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/odds/sports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only active sports and sort by title
        const activeSports = data
          .filter(sport => sport.active)
          .sort((a, b) => a.title.localeCompare(b.title));
        setSports(activeSports);
        
        // Set default to first sport or popular ones
        const defaultSport = activeSports.find(s => s.key === 'basketball_nba') 
          || activeSports.find(s => s.key === 'soccer_epl')
          || activeSports[0];
        
        if (defaultSport) {
          setSelectedSport(defaultSport.key);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sports:', err);
    }
  };

  const fetchGames = async (sportKey) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/odds/upcoming/${sportKey}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      setError(err.message);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLocalTime = (utcTimeString) => {
    if (!utcTimeString) return 'TBA';
    
    try {
      const date = new Date(utcTimeString);
      
      // Get user's local time
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
      
      if (diffMs < 0) return 'Live/Started';
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return `in ${diffDays}d`;
      } else if (diffHours > 0) {
        return `in ${diffHours}h`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `in ${diffMins}m`;
      }
    } catch (error) {
      return '';
    }
  };

  const handleRefresh = () => {
    if (selectedSport) {
      fetchGames(selectedSport);
    }
  };

  const getSportName = () => {
    const sport = sports.find(s => s.key === selectedSport);
    return sport ? sport.title : 'Sport';
  };

  return (
    <div className="upcoming-games-widget">
      <div className="widget-header">
        <h3>⚽ Upcoming Games</h3>
        <button onClick={handleRefresh} className="refresh-btn" title="Refresh">
          🔄
        </button>
      </div>

      <div className="sport-selector">
        <label htmlFor="sport-select">Select Sport:</label>
        <select
          id="sport-select"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="sport-select"
        >
          {sports.map(sport => (
            <option key={sport.key} value={sport.key}>
              {sport.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="widget-loading">
          <p>Loading games...</p>
        </div>
      )}

      {error && (
        <div className="widget-error">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="widget-empty">
          <p>No upcoming games found for {getSportName()}</p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="games-list">
          {games.slice(0, 10).map((game, index) => (
            <div key={game.id || index} className="game-item">
              <div className="game-teams">
                <div className="team">{game.away_team}</div>
                <div className="vs">@</div>
                <div className="team">{game.home_team}</div>
              </div>
              <div className="game-time">
                <div className="time-main">{formatLocalTime(game.commence_time)}</div>
                <div className="time-until">{getTimeUntilGame(game.commence_time)}</div>
              </div>
            </div>
          ))}
          
          {games.length > 10 && (
            <div className="more-games">
              +{games.length - 10} more games
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UpcomingGames;
