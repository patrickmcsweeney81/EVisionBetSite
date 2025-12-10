import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import { getBookmakerLogo, getBookmakerDisplayName } from '../utils/bookmakerLogos';
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
  const [lastErrorText, setLastErrorText] = useState(null);
  const [health, setHealth] = useState({ ok: null, ms: null });
  const debugEnabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  const buildHitsUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append('limit', filters.limit);
    if (filters.minEV) params.append('min_ev', parseFloat(filters.minEV) / 100);
    if (filters.sport) params.append('sport', filters.sport);
    return `${API_URL}/api/ev/hits?${params.toString()}`;
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/ev/summary`);
      setDebugInfo({ status: response.status, message: response.statusText });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        setSummary({
          available: false,
          backend_offline: true,
          total_hits: 0,
          top_ev: 0,
          sports: {},
          last_updated: new Date().toISOString()
        });
      }
    } catch (err) {
      setSummary({
        available: false,
        backend_offline: true,
        total_hits: 0,
        top_ev: 0,
        sports: {},
        last_updated: new Date().toISOString()
      });
    }
  }, []);

  const fetchHits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildHitsUrl());
      setDebugInfo({ status: response.status, message: response.statusText });

      if (!response.ok) {
        const text = await response.text();
        setLastErrorText(text);
        setHits([]);
        setLastUpdated(new Date().toISOString());
      } else {
        const data = await response.json();
        setHits(data.hits || []);
        setLastUpdated(data.last_updated);
      }
    } catch (err) {
      setHits([]);
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, [buildHitsUrl]);

  useEffect(() => {
    // Health check badge
    const start = performance.now();
    fetch(`${API_URL}/health`).then(res => {
      setHealth({ ok: res.ok, ms: Math.round(performance.now() - start) });
    }).catch(() => setHealth({ ok: false, ms: null }));
  }, []);

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

  const formatStartTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fmt = new Intl.DateTimeFormat('en-AU', {
      timeZone: userTz,
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return fmt.format(date);
  };

  const sportAbbrev = (sport) => {
    const map = {
      'basketball_nba': 'NBA',
      'basketball_nbl': 'NBL',
      'americanfootball_nfl': 'NFL',
      'icehockey_nhl': 'NHL'
    };
    return map[sport] || sport.slice(0, 3).toUpperCase();
  };

  const formatEvent = (hit) => {
    const away = hit.away_team || 'Away';
    const home = hit.home_team || 'Home';
    return `${away} v ${home}`;
  };

  const formatMarket = (hit) => {
    if (hit.market === 'h2h') return 'H2H';
    if (hit.market === 'spreads') return 'Line';
    if (hit.market.startsWith('player_')) {
      return hit.market.replace('player_', '').replace('_', '-').toUpperCase();
    }
    return hit.market;
  };

  const formatOdds = (odds) => {
    return odds ? odds.toFixed(2) : '-';
  };

  const getEVClass = (evPercent) => {
    if (evPercent >= 10) return 'ev-excellent';
    if (evPercent >= 5) return 'ev-great';
    if (evPercent >= 3) return 'ev-good';
    return 'ev-fair';
  };

  return (
    <div className="ev-hits-container">
      {debugEnabled && (
        <div className="debug-bar">
          <span>API: {API_URL}</span>
          <span> | Status: {debugInfo.status ?? 'n/a'} {debugInfo.message ? `(${debugInfo.message})` : ''}</span>
          <span> | Health: {health.ok === null ? 'n/a' : (health.ok ? 'OK' : 'DOWN')} {health.ms ? `(${health.ms}ms)` : ''}</span>
          <span> | <a href={buildHitsUrl()} target="_blank" rel="noreferrer">Open API</a></span>
          {lastErrorText && (<span> | Error: {lastErrorText.slice(0,120)}...</span>)}
        </div>
      )}
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
            <h1>💰 Expected Value Finder</h1>
            <p className="ev-subtitle">Positive expected value betting opportunities</p>
          </div>
        </div>

        {/* Backend Offline Banner */}
        {summary && summary.backend_offline && (
          <div className="info-banner">
            <p>⚠️ Backend service is currently offline. Showing cached/demo data.</p>
          </div>
        )}

        {/* Summary Cards */}
        {summary && summary.total_hits !== undefined && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Hits</div>
              <div className="summary-value">{summary.total_hits}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Top EV</div>
              <div className="summary-value">{(summary.top_ev || 0).toFixed(2)}%</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Sports</div>
              <div className="summary-value">{Object.keys(summary.sports || {}).length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Last Updated</div>
              <div className="summary-value summary-time">
                {formatStartTime(summary.last_updated)}
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
            <p>Loading Expected Value Finder...</p>
          </div>
        )}

        {/* Hits Table */}
        {!loading && !error && hits.length > 0 && (
          <div className="hits-table-container">
            <table className="hits-table">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>Sport</th>
                  <th>Event</th>
                  <th>Market</th>
                  <th>Points</th>
                  <th>Selection</th>
                  <th>Sharps</th>
                  <th>Book</th>
                  <th>Price</th>
                  <th>EV%</th>
                  <th>Fair</th>
                  <th>Pin Prob</th>
                </tr>
              </thead>
              <tbody>
                {hits.map((hit, index) => (
                  <tr key={index} className={`hit-row ${getEVClass(hit.ev_percent)}`}>
                    <td className="time-cell">{formatStartTime(hit.commence_time)}</td>
                    <td className="sport-cell">{sportAbbrev(hit.sport)}</td>
                    <td className="event-cell">{formatEvent(hit)}</td>
                    <td className="market-cell">{formatMarket(hit)}</td>
                    <td className="point-cell">{hit.point || '-'}</td>
                    <td className="selection-cell">{hit.selection}</td>
                    <td className="sharps-cell">{hit.sharp_book_count || 0}</td>
                    <td className="book-cell">
                      <div className="book-badge">
                        <img 
                          src={getBookmakerLogo(hit.best_book)} 
                          alt={hit.best_book}
                          className="bookmaker-logo"
                          title={getBookmakerDisplayName(hit.best_book)}
                        />
                        <span className="book-name">{getBookmakerDisplayName(hit.best_book)}</span>
                      </div>
                    </td>
                    <td className="price-cell">{formatOdds(hit.best_odds)}</td>
                    <td className={`ev-cell ${getEVClass(hit.ev_percent)}`}>
                      {(hit.ev_percent || 0).toFixed(2)}%
                    </td>
                    <td className="fair-cell">{formatOdds(hit.fair_odds)}</td>
                    <td className="prob-cell">{(hit.implied_prob || 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hits.length === 0 && (
          <div className="empty-state">
            <p>No expected value opportunities found with current filters.</p>
            <p className="empty-hint">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Footer Info */}
        {lastUpdated && (
          <div className="data-info">
            Data last updated: {formatStartTime(lastUpdated)}
          </div>
        )}
      </div>
    </div>
  );
}

export default EVHits;
