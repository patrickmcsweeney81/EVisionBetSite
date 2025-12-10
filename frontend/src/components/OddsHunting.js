import React, { useState } from 'react';
import './OddsHunting.css';

function OddsHunting({ username, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sport, setSport] = useState('all');
  const [minOdds, setMinOdds] = useState(1.5);
  const [maxOdds, setMaxOdds] = useState(5.0);

  // Mock data for demonstration
  const [hunts] = useState([
    {
      id: 1,
      sport: 'Basketball',
      event: 'Lakers vs Celtics',
      market: 'Moneyline',
      selection: 'Lakers',
      bestOdds: 2.15,
      bookmaker: 'Bet365',
      avgOdds: 2.05,
      edge: '+4.9%',
      updated: '2 mins ago'
    },
    {
      id: 2,
      sport: 'Football',
      event: 'Patriots vs Bills',
      market: 'Spread',
      selection: 'Patriots +7.5',
      bestOdds: 1.95,
      bookmaker: 'DraftKings',
      avgOdds: 1.88,
      edge: '+3.7%',
      updated: '5 mins ago'
    },
    {
      id: 3,
      sport: 'Basketball',
      event: 'Warriors vs Nets',
      market: 'Total Points',
      selection: 'Over 215.5',
      bestOdds: 2.00,
      bookmaker: 'FanDuel',
      avgOdds: 1.92,
      edge: '+4.2%',
      updated: '1 min ago'
    },
    {
      id: 4,
      sport: 'Hockey',
      event: 'Maple Leafs vs Bruins',
      market: 'Moneyline',
      selection: 'Maple Leafs',
      bestOdds: 2.50,
      bookmaker: 'BetMGM',
      avgOdds: 2.35,
      edge: '+6.4%',
      updated: '3 mins ago'
    },
    {
      id: 5,
      sport: 'Football',
      event: 'Chiefs vs Bengals',
      market: 'Total Points',
      selection: 'Under 48.5',
      bestOdds: 1.91,
      bookmaker: 'Caesars',
      avgOdds: 1.85,
      edge: '+3.2%',
      updated: '7 mins ago'
    }
  ]);

  const handleLogout = () => {
    onLogout();
    window.location.href = '/';
  };

  const handleMinOddsChange = (value) => {
    const parsed = parseFloat(value);
    setMinOdds(!isNaN(parsed) && parsed >= 1.01 ? parsed : 1.01);
  };

  const handleMaxOddsChange = (value) => {
    const parsed = parseFloat(value);
    setMaxOdds(!isNaN(parsed) && parsed >= 1.01 ? parsed : 10.0);
  };

  const filteredHunts = hunts.filter(hunt => {
    const matchesSearch = hunt.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hunt.selection.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sport === 'all' || hunt.sport.toLowerCase() === sport.toLowerCase();
    const matchesOdds = hunt.bestOdds >= minOdds && hunt.bestOdds <= maxOdds;
    
    return matchesSearch && matchesSport && matchesOdds;
  });

  return (
    <div className="odds-hunting-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <img 
            src="/img/bet-evision-horizontal.png" 
            alt="BET EVision" 
            className="nav-logo"
          />
          <div className="nav-right">
            <span className="username-display">Welcome, {username}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="odds-hunting-content">
        <div className="page-header">
          <button onClick={() => window.location.href = '/ev-toolbox'} className="back-btn">
            ← Back to EV Toolbox
          </button>
          <h1>🔍 Odds Hunting</h1>
          <p className="subtitle">Find the best odds across multiple bookmakers</p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <label>🔎 Search</label>
            <input 
              type="text"
              placeholder="Search events or selections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>🏆 Sport</label>
            <select value={sport} onChange={(e) => setSport(e.target.value)} className="sport-select">
              <option value="all">All Sports</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
              <option value="soccer">Soccer</option>
              <option value="baseball">Baseball</option>
            </select>
          </div>

          <div className="filter-group">
            <label>📊 Odds Range</label>
            <div className="odds-range">
              <input 
                type="number"
                value={minOdds}
                onChange={(e) => handleMinOddsChange(e.target.value)}
                min="1.01"
                step="0.1"
                className="odds-input"
              />
              <span className="range-separator">to</span>
              <input 
                type="number"
                value={maxOdds}
                onChange={(e) => handleMaxOddsChange(e.target.value)}
                min="1.01"
                step="0.1"
                className="odds-input"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="results-header">
            <h2>📈 Best Odds Available</h2>
            <span className="results-count">{filteredHunts.length} opportunities found</span>
          </div>

          {filteredHunts.length === 0 ? (
            <div className="no-results">
              <p>No odds found matching your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="hunts-grid">
              {filteredHunts.map(hunt => (
                <div key={hunt.id} className="hunt-card">
                  <div className="hunt-header">
                    <span className="sport-badge">{hunt.sport}</span>
                    <span className="updated-time">{hunt.updated}</span>
                  </div>
                  
                  <h3 className="event-title">{hunt.event}</h3>
                  
                  <div className="market-info">
                    <span className="market-type">{hunt.market}</span>
                    <span className="selection">{hunt.selection}</span>
                  </div>

                  <div className="odds-comparison">
                    <div className="best-odds">
                      <div className="odds-label">Best Odds</div>
                      <div className="odds-value">{hunt.bestOdds}</div>
                      <div className="bookmaker-name">{hunt.bookmaker}</div>
                    </div>
                    
                    <div className="vs-indicator">vs</div>
                    
                    <div className="avg-odds">
                      <div className="odds-label">Market Avg</div>
                      <div className="odds-value">{hunt.avgOdds}</div>
                      <div className="edge-badge">{hunt.edge} edge</div>
                    </div>
                  </div>

                  <button className="hunt-action-btn">
                    View Full Market →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info-section">
          <h3>💡 How Odds Hunting Works</h3>
          <p>
            Odds hunting automatically scans multiple bookmakers to find the best available odds for each event. 
            The "edge" percentage shows how much better the best odds are compared to the market average, 
            helping you identify where to place your bets for maximum value.
          </p>
          <div className="tips">
            <div className="tip-item">
              <span className="tip-icon">✓</span>
              <span>Higher edge percentages indicate better value opportunities</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">✓</span>
              <span>Odds are updated in real-time from multiple bookmakers</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">✓</span>
              <span>Use filters to narrow down specific sports or odds ranges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OddsHunting;
