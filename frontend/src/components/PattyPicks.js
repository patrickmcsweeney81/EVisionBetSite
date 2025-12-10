import React, { useState } from 'react';
import './PattyPicks.css';

function PattyPicks({ username, onLogout }) {
  const today = new Date().toISOString().split('T')[0];
  
  const [dailyPicks] = useState([
    {
      id: 1,
      date: today,
      game: 'Lakers vs Celtics',
      pick: 'Lakers +5.5',
      odds: 1.91,
      stake: 100,
      ev: '+5.2%',
      status: 'pending'
    },
    {
      id: 2,
      date: today,
      game: 'Warriors vs Nets',
      pick: 'Over 215.5',
      odds: 1.95,
      stake: 100,
      ev: '+4.8%',
      status: 'pending'
    }
  ]);

  const [betTracker] = useState([
    {
      id: 1,
      date: '2025-12-09',
      game: 'Heat vs Knicks',
      pick: 'Heat ML',
      odds: 2.10,
      stake: 100,
      result: 'won',
      profit: 110
    },
    {
      id: 2,
      date: '2025-12-09',
      game: 'Pacers vs Bulls',
      pick: 'Under 220.5',
      odds: 1.90,
      stake: 100,
      result: 'lost',
      profit: -100
    },
    {
      id: 3,
      date: '2025-12-08',
      game: 'Mavs vs Suns',
      pick: 'Mavs -3.5',
      odds: 1.95,
      stake: 100,
      result: 'won',
      profit: 95
    },
    {
      id: 4,
      date: '2025-12-08',
      game: 'Clippers vs Rockets',
      pick: 'Clippers ML',
      odds: 1.85,
      stake: 100,
      result: 'lost',
      profit: -100
    },
    {
      id: 5,
      date: '2025-12-07',
      game: 'Bucks vs 76ers',
      pick: 'Over 225.5',
      odds: 1.91,
      stake: 100,
      result: 'won',
      profit: 91
    }
  ]);

  const handleLogout = () => {
    onLogout();
    window.location.href = '/';
  };

  const calculateStats = () => {
    const wins = betTracker.filter(bet => bet.result === 'won').length;
    const losses = betTracker.filter(bet => bet.result === 'lost').length;
    const totalProfit = betTracker.reduce((sum, bet) => sum + bet.profit, 0);
    const totalStaked = betTracker.reduce((sum, bet) => sum + bet.stake, 0);
    const roi = totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(1) : '0.0';
    
    return { wins, losses, totalProfit, roi };
  };

  const stats = calculateStats();

  return (
    <div className="patty-picks-container">
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

      <div className="patty-picks-content">
        <div className="page-header">
          <button onClick={() => window.location.href = '/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>🎯 Patty Picks</h1>
          <p className="subtitle">Daily expert EV picks with comprehensive bet tracking</p>
        </div>

        {/* Daily Picks Section */}
        <div className="section">
          <div className="section-header">
            <h2>📅 Today's Picks</h2>
            <span className="date-badge">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="picks-grid">
            {dailyPicks.map(pick => (
              <div key={pick.id} className="pick-card">
                <div className="pick-header">
                  <span className="pick-number">Pick #{pick.id}</span>
                  <span className={`ev-badge ${pick.ev.startsWith('+') ? 'positive' : 'negative'}`}>
                    EV: {pick.ev}
                  </span>
                </div>
                <h3 className="game-title">{pick.game}</h3>
                <div className="pick-details">
                  <div className="detail-row">
                    <span className="label">Pick:</span>
                    <span className="value">{pick.pick}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Odds:</span>
                    <span className="value">{pick.odds}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Stake:</span>
                    <span className="value">${pick.stake}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${pick.status}`}>{pick.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-section">
          <h2>📊 Performance Summary (Last 2 Weeks)</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.wins}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.losses}</div>
              <div className="stat-label">Losses</div>
            </div>
            <div className="stat-card">
              <div className={`stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                ${stats.totalProfit}
              </div>
              <div className="stat-label">Total Profit</div>
            </div>
            <div className="stat-card">
              <div className={`stat-value ${stats.roi >= 0 ? 'positive' : 'negative'}`}>
                {stats.roi}%
              </div>
              <div className="stat-label">ROI</div>
            </div>
          </div>
        </div>

        {/* Bet Tracker Section */}
        <div className="section">
          <h2>📈 Bet Tracker (Last 2 Weeks)</h2>
          <div className="bet-tracker">
            <div className="tracker-table">
              <div className="tracker-header">
                <div className="col-date">Date</div>
                <div className="col-game">Game</div>
                <div className="col-pick">Pick</div>
                <div className="col-odds">Odds</div>
                <div className="col-stake">Stake</div>
                <div className="col-result">Result</div>
                <div className="col-profit">Profit/Loss</div>
              </div>
              {betTracker.map(bet => (
                <div key={bet.id} className="tracker-row">
                  <div className="col-date">{bet.date}</div>
                  <div className="col-game">{bet.game}</div>
                  <div className="col-pick">{bet.pick}</div>
                  <div className="col-odds">{bet.odds}</div>
                  <div className="col-stake">${bet.stake}</div>
                  <div className="col-result">
                    <span className={`result-badge ${bet.result}`}>
                      {bet.result}
                    </span>
                  </div>
                  <div className={`col-profit ${bet.profit >= 0 ? 'positive' : 'negative'}`}>
                    {bet.profit >= 0 ? '+' : ''}${bet.profit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-note">
          <p>💡 <strong>Note:</strong> Picks are updated daily at 9:00 AM EST. The bet tracker maintains a rolling 2-week history of all picks and their results.</p>
        </div>
      </div>
    </div>
  );
}

export default PattyPicks;
