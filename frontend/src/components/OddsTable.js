import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';
import { getBookmakerLogo, getBookmakerDisplayName, createFallbackLogo } from '../utils/bookmakerLogos';
import './OddsTable.css';

function OddsTable({ username, onLogout }) {
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 100,
    sport: '',
    market: '',
    minEV: '',
    book: ''
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'ev', direction: 'desc' });
  const [debugInfo, setDebugInfo] = useState({ status: null, message: null });
  const [lastErrorText, setLastErrorText] = useState(null);
  const debugEnabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  const buildOddsUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append('limit', filters.limit);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.market) params.append('market', filters.market);
    if (filters.minEV) params.append('min_ev', filters.minEV);
    if (filters.book) params.append('bookmaker', filters.book);
    return `${API_URL}/api/ev/hits?${params.toString()}`;
  }, [filters]);

  const fetchOdds = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildOddsUrl());
      setDebugInfo({ status: response.status, message: response.statusText });

      if (!response.ok) {
        const text = await response.text();
        setLastErrorText(text);
        setOdds([]);
        setLastUpdated(new Date().toISOString());
      } else {
        const data = await response.json();
        // Map backend API fields to frontend table fields
        const mappedHits = (data.hits || []).map(row => ({
          ...row,
          // Alias backend field names to frontend expected names
          game_start_perth: row.commence_time,
          event: `${row.away_team} v ${row.home_team}`,
          side: row.selection,
          book: row.bookmaker,
          price: row.odds_decimal,
          ev: row.ev_percent,
          fair: row.fair_odds,
          pinnacle: null, // Not in current API response
          prob: row.implied_prob
        }));
        setOdds(mappedHits);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      setOdds([]);
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, [buildOddsUrl]);

  useEffect(() => {
    fetchOdds();
    
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      fetchOdds();
    }, 120000);
    
    return () => clearInterval(interval);
  }, [fetchOdds]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOdds = React.useMemo(() => {
    let sortableOdds = [...odds];
    if (sortConfig.key) {
      sortableOdds.sort((a, b) => {
        let aVal = a[sortConfig.key] ?? 0;
        let bVal = b[sortConfig.key] ?? 0;
        
        // Handle numeric comparisons
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle string comparisons
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOdds;
  }, [odds, sortConfig]);

  const formatTime = (timeString) => {
    if (!timeString) return 'TBA';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const formatSport = (sport) => {
    const sportMap = {
      'basketball_nba': 'NBA',
      'basketball': 'BBall',
      'americanfootball_nfl': 'NFL',
      'icehockey_nhl': 'NHL',
      'soccer': 'Soccer'
    };
    return sportMap[sport] || sport;
  };

  const shortenEvent = (event) => {
    if (!event) return '';
    // Remove common words and shorten team names
    return event
      .replace(/\s+(vs|@)\s+/gi, ' v ')
      .replace(/\s+h2h$/i, '')
      .substring(0, 30);
  };

  const getEVClass = (ev) => {
    if (ev === null || ev === undefined) return 'ev-none';
    // ev provided as percent already
    if (ev > 3) return 'ev-green';
    if (ev >= 1) return 'ev-orange';
    if (ev <= 0) return 'ev-red';
    return 'ev-base';
  };

  const getProbClass = (prob) => {
    if (prob === null || prob === undefined) return 'prob-none';
    if (prob > 40) return 'prob-green';
    if (prob >= 20) return 'prob-orange';
    if (prob < 19) return 'prob-red';
    return 'prob-base';
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '-';
    return `${Number(value).toFixed(2)}%`;
  };

  const formatOdds = (value) => {
    if (value === null || value === undefined) return '-';
    return `$${Number(value).toFixed(2)}`;
  };

  // Build consolidated bookmaker logo cell from row fields (show available sharp + AU books present)
  const getLogoBadges = (row) => {
    const logoKeys = [
      'book', 'pinnacle', 'betfair', 'sportsbet', 'bet365', 'pointsbet', 'ladbrokes', 'unibet', 'dabble', 'tab', 'tabtouch', 'neds', 'betr', 'betright'
    ];
    const present = [];
    logoKeys.forEach(k => {
      if (k === 'book') {
        if (row.book) present.push(row.book);
      } else if (row[k] !== null && row[k] !== undefined) {
        // Only show if odds value present (non-null)
        present.push(k);
      }
    });
    // Limit to first 6 for compactness
    return present.slice(0, 6).map((bk, idx) => (
      <span key={idx} className={`logo-badge logo-${bk.toLowerCase()}`} style={{ marginRight: 6 }}>
        <img
          src={getBookmakerLogo(bk, { size: 28 })}
          alt={getBookmakerDisplayName(bk)}
          width={28}
          height={28}
          onError={(e) => { e.currentTarget.src = createFallbackLogo(bk, 28); }}
        />
      </span>
    ));
  };

  const addToTracker = (row) => {
    // Create CSV row data
    const csvData = [
      {
        Date: formatTime(row.game_start_perth),
        Sport: formatSport(row.sport),
        Event: row.event,
        Market: row.market,
        Line: row.line || '',
        Side: row.side,
        Bookmaker: row.book,
        Price: row.price,
        'EV%': row.ev || 0,
        Stake: row.stake || 0,
        Fair: row.fair || 0,
        Pinnacle: row.pinnacle || 0,
        'Prob%': row.prob || 0
      }
    ];

    // Convert to CSV format
    const headers = Object.keys(csvData[0]).join(',');
    const values = Object.values(csvData[0]).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',');
    const csv = `${headers}\n${values}`;

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bet_tracker_${row.event.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Optional: Show confirmation
    alert('✅ Added to tracker! CSV file downloaded.');
  };



  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="odds-table-container">
      <div className="odds-header">
        {debugEnabled && (
          <div className="debug-bar">
            <span>API: {API_URL}</span>
            <span> | Status: {debugInfo.status ?? 'n/a'} {debugInfo.message ? `(${debugInfo.message})` : ''}</span>
            <span> | <a href={buildOddsUrl()} target="_blank" rel="noreferrer">Open API</a></span>
            {lastErrorText && (<span> | Error: {lastErrorText.slice(0,120)}...</span>)}
          </div>
        )}

        {/* Backend Offline Banner */}
        {debugInfo.status === 404 && (
          <div className="info-banner">
            <p>⚠️ Backend service is currently offline. Showing empty state.</p>
          </div>
        )}

        <div className="header-left">
          <button onClick={() => window.location.href = '/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
          <div>
            <h1>📈 Expected Value Finder</h1>
            {lastUpdated && (
              <p className="last-update">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <button onClick={fetchOdds} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="odds-filters">
        <div className="filter-group">
          <label>Sport:</label>
          <select name="sport" value={filters.sport} onChange={handleFilterChange}>
            <option value="">All Sports</option>
            <option value="basketball_nba">NBA</option>
            <option value="americanfootball_nfl">NFL</option>
            <option value="icehockey_nhl">NHL</option>
            <option value="soccer">Soccer</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Market:</label>
          <select name="market" value={filters.market} onChange={handleFilterChange}>
            <option value="">All Markets</option>
            <option value="h2h">H2H</option>
            <option value="spreads">Spreads</option>
            <option value="totals">Totals</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Min EV %:</label>
          <input
            type="number"
            name="minEV"
            value={filters.minEV}
            onChange={handleFilterChange}
            placeholder="e.g., 3"
            min="0"
            step="0.1"
          />
        </div>

        <div className="filter-group">
          <label>Bookmaker:</label>
          <input
            type="text"
            name="book"
            value={filters.book}
            onChange={handleFilterChange}
            placeholder="e.g., sportsbet"
          />
        </div>
      </div>

      {/* Table */}
      {loading && <div className="loading">⏳ Loading odds data...</div>}
      {error && <div className="error">❌ {error}</div>}

      {!loading && odds.length === 0 && (
        <div className="empty-state">
          <p>No odds data available. Run the EV bot to generate data.</p>
        </div>
      )}

      {!loading && odds.length > 0 && (
        <div className="table-wrapper">
          <table className="odds-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('game_start_perth')} className="col-start">Start {sortConfig.key === 'game_start_perth' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('event')} className="col-game">Game {sortConfig.key === 'event' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('market')} className="col-market">Market {sortConfig.key === 'market' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('line')} className="col-line">Line {sortConfig.key === 'line' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('side')} className="col-side">Side {sortConfig.key === 'side' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th className="col-books">Books</th>
                <th onClick={() => handleSort('price')} className="col-price">Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('ev')} className="col-ev">EV % {sortConfig.key === 'ev' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('fair')} className="col-fair">Fair {sortConfig.key === 'fair' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('stake')} className="col-stake">Stake {sortConfig.key === 'stake' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('pinnacle')} className="col-pin">Pinnacle {sortConfig.key === 'pinnacle' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('prob')} className="col-prob">Prob % {sortConfig.key === 'prob' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                <th className="col-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedOdds.map((row, index) => (
                <tr key={index} className="odds-row">
                  <td className="time-cell">{formatTime(row.game_start_perth)}</td>
                  <td className="game-cell">{shortenEvent(row.event)}</td>
                  <td className="market-cell">{row.market}</td>
                  <td className="line-cell">{row.line || '-'}</td>
                  <td className="side-cell">{row.side}</td>
                  <td className="books-cell">{getLogoBadges(row)}</td>
                  <td className="price-cell">{formatOdds(row.price)}</td>
                  <td className={`ev-cell ${getEVClass(row.ev)}`}>{formatPercent(row.ev)}</td>
                  <td className="fair-cell">{formatOdds(row.fair)}</td>
                  <td className="stake-cell">{formatOdds(row.stake)}</td>
                  <td className="pinnacle-cell">{formatOdds(row.pinnacle)}</td>
                  <td className={`prob-cell ${getProbClass(row.prob)}`}>{formatPercent(row.prob)}</td>
                  <td className="action-cell">
                    <button
                      className="tracker-btn"
                      onClick={() => addToTracker(row)}
                      title="Export to CSV tracker"
                    >📊</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <p>Showing {odds.length} opportunities</p>
      </div>
    </div>
  );
}

export default OddsTable;
