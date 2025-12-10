import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import './OddsComparison.css';

function OddsComparison() {
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [odds, setOdds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  // Fetch available sports on component mount
  useEffect(() => {
    fetchSports();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await apiFetch('/api/odds/config');
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  const fetchSports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/odds/sports');
      if (!response.ok) throw new Error('Failed to fetch sports');
      const data = await response.json();
      
      // Filter for active sports only
      const activeSports = data.filter(sport => sport.active);
      setSports(activeSports);
      
      // Auto-select first sport
      if (activeSports.length > 0) {
        setSelectedSport(activeSports[0].key);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOdds = async (sportKey) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/odds/odds/${sportKey}`);
      if (!response.ok) throw new Error('Failed to fetch odds');
      const data = await response.json();
      setOdds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSportChange = (e) => {
    const sportKey = e.target.value;
    setSelectedSport(sportKey);
    if (sportKey) {
      fetchOdds(sportKey);
    }
  };

  return (
    <div className="odds-comparison">
      <div className="odds-header">
        <button onClick={() => window.location.href = '/ev-toolbox'} className="back-btn">
          ← Back to EV Toolbox
        </button>
        <h1>🎯 Live Odds Comparison</h1>
        {config && (
          <div className="config-info">
            <span className="badge">Regions: {config.regions}</span>
            <span className="badge">Markets: {config.markets}</span>
            <span className="badge">Min EV: {(config.ev_min_edge * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="sport-selector">
        <label htmlFor="sport-select">Select Sport:</label>
        <select
          id="sport-select"
          value={selectedSport}
          onChange={handleSportChange}
          disabled={loading}
        >
          <option value="">-- Choose a Sport --</option>
          {sports.map(sport => (
            <option key={sport.key} value={sport.key}>
              {sport.title} ({sport.group})
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchOdds(selectedSport)}
          disabled={!selectedSport || loading}
          className="refresh-btn"
        >
          🔄 Refresh Odds
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading odds data...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>❌ Error: {error}</p>
          <button onClick={() => fetchSports()}>Retry</button>
        </div>
      )}

      {odds && !loading && (
        <div className="odds-results">
          <div className="results-header">
            <h2>{selectedSport}</h2>
            <p>Found {odds.events_count} events</p>
          </div>

          {odds.events_count === 0 ? (
            <div className="no-events">
              <p>No upcoming events found for this sport.</p>
            </div>
          ) : (
            <div className="events-list">
              {odds.events.slice(0, 10).map((event, index) => (
                <div key={index} className="event-card">
                  <div className="event-header">
                    <h3>{event.home_team} vs {event.away_team}</h3>
                    <span className="event-time">
                      {new Date(event.commence_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="bookmakers-count">
                    {event.bookmakers?.length || 0} bookmakers offering odds
                  </div>
                </div>
              ))}
              {odds.events_count > 10 && (
                <div className="more-events">
                  + {odds.events_count - 10} more events available
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!odds && !loading && !error && (
        <div className="empty-state">
          <p>👆 Select a sport to view live odds comparison</p>
        </div>
      )}
    </div>
  );
}

export default OddsComparison;
