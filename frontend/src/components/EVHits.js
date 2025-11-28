import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import './EVHits.css';

function EVHits({ username, onLogout }) {
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    limit: 50,
    minEV: '',
    sport: ''
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [debugInfo, setDebugInfo] = useState({ status: null, message: null });

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/ev/summary`);
      setDebugInfo({ status: response.status, message: response.statusText });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  }, []);

  const fetchHits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      
      // Build query params
      const params = new URLSearchParams();
      params.append('limit', filters.limit);
      if (filters.minEV) {
        params.append('min_ev', parseFloat(filters.minEV) / 100); // Convert % to decimal
      }
      if (filters.sport) {
        params.append('sport', filters.sport);
      }
      
      const response = await fetch(`${API_URL}/api/ev/hits?${params.toString()}`);
      setDebugInfo({ status: response.status, message: response.statusText });

      if (!response.ok) {
        throw new Error('Failed to fetch EV hits');
      }

      const data = await response.json();
      setHits(data.hits);
      setLastUpdated(data.last_updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
    fetchHits();
    
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      fetchSummary();
      fetchHits();
    }, 120000);
    
    return () => clearInterval(interval);
  }, [filters, fetchSummary, fetchHits]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-AU', {
      timeZone: 'Australia/Perth',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEV = (ev) => {
    return `${(ev * 100).toFixed(2)}%`;
  };

  const formatOdds = (odds) => {
    return odds ? odds.toFixed(2) : '-';
  };

  const getEVClass = (ev) => {
    const evPercent = ev * 100;
    if (evPercent >= 10) return 'ev-excellent';
    if (evPercent >= 5) return 'ev-great';
    if (evPercent >= 3) return 'ev-good';
    return 'ev-fair';
  };

  return (
    <div className="ev-hits-container">
      <div className="debug-bar">
        <span>API: {API_URL}</span>
        <span> | Status: {debugInfo.status ?? 'n/a'} {debugInfo.message ? `(${debugInfo.message})` : ''}</span>
      </div>
      <nav className="dashboard-nav">
        <div className="nav-content">
          <img 
            src="/img/bet-evision-horizontal.png" 
            alt="BET EVision" 
            className="nav-logo"
          />
          <div className="nav-right">
            <span className="username-display">Welcome, {username}!</span>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="ev-hits-content">
        <div className="ev-header">
          <button onClick={() => window.location.href = '/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
          <div>
            <h1>💰 EV Hits</h1>
            <p className="ev-subtitle">Positive expected value betting opportunities</p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && summary.available && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Hits</div>
              <div className="summary-value">{summary.total_hits}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Top EV</div>
              <div className="summary-value">{formatEV(summary.top_ev)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Sports</div>
              <div className="summary-value">{Object.keys(summary.sports || {}).length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Last Updated</div>
              <div className="summary-value summary-time">
                {formatDateTime(summary.last_updated)}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Limit</label>
            <select 
              name="limit" 
              value={filters.limit} 
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min EV %</label>
            <input
              type="number"
              name="minEV"
              value={filters.minEV}
              onChange={handleFilterChange}
              placeholder="e.g., 3"
              step="0.5"
              min="0"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Sport</label>
            <input
              type="text"
              name="sport"
              value={filters.sport}
              onChange={handleFilterChange}
              placeholder="e.g., basketball_nba"
              className="filter-input"
            />
          </div>

          <button onClick={fetchHits} className="refresh-button">
            🔄 Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-message">
            <p>Loading EV hits...</p>
          </div>
        )}

        {/* Hits Table */}
        {!loading && !error && hits.length > 0 && (
          <div className="hits-table-container">
            <table className="hits-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Sport</th>
                  <th>Event</th>
                  <th>Market</th>
                  <th>Side</th>
                  <th>Book</th>
                  <th>Price</th>
                  <th>Fair</th>
                  <th>EV</th>
                  <th>Stake</th>
                  <th>Prob</th>
                </tr>
              </thead>
              <tbody>
                {hits.map((hit, index) => (
                  <tr key={index} className="hit-row">
                    <td className="time-cell">{formatDateTime(hit.game_start_perth)}</td>
                    <td className="sport-cell">{hit.sport}</td>
                    <td className="event-cell">{hit.event}</td>
                    <td className="market-cell">
                      {hit.market}
                      {hit.line && <span className="line-value"> ({hit.line})</span>}
                    </td>
                    <td className="side-cell">{hit.side}</td>
                    <td className="book-cell">{hit.book}</td>
                    <td className="price-cell">{formatOdds(hit.price)}</td>
                    <td className="fair-cell">{formatOdds(hit.fair)}</td>
                    <td className={`ev-cell ${getEVClass(hit.ev)}`}>
                      {formatEV(hit.ev)}
                    </td>
                    <td className="stake-cell">${hit.stake.toFixed(2)}</td>
                    <td className="prob-cell">{(hit.prob * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hits.length === 0 && (
          <div className="empty-state">
            <p>No EV hits found with current filters.</p>
            <p className="empty-hint">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Footer Info */}
        {lastUpdated && (
          <div className="data-info">
            Data last updated: {formatDateTime(lastUpdated)}
          </div>
        )}
      </div>
    </div>
  );
}

export default EVHits;
