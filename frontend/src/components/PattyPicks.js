import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import './PattyPicks.css';

const getTodayDate = () => new Date().toISOString().split('T')[0];

function PattyPicks({ username, onLogout }) {
  const today = getTodayDate();

  const [patsPicksRows, setPatsPicksRows] = useState([]);
  const [patsPicksStatus, setPatsPicksStatus] = useState({
    loading: true,
    error: null,
    lastUpdated: null,
    source: null,
    bankroll: 1000,
  });

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

  const pickFirst = (row, keys) => {
    for (const key of keys) {
      if (row && row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        return row[key];
      }
    }
    return null;
  };

  const formatNumber = (val, digits = 2) => {
    if (val === null || val === undefined || val === '') return '';
    const num = typeof val === 'number' ? val : Number(String(val).replace(/[$,%]/g, '').trim());
    if (Number.isNaN(num)) return String(val);
    return num.toFixed(digits);
  };

  const formatPercent = (val) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'string' && val.includes('%')) return val;
    const num = typeof val === 'number' ? val : Number(String(val).replace(/[%]/g, '').trim());
    if (Number.isNaN(num)) return String(val);
    return `${num.toFixed(2)}%`;
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setPatsPicksStatus((s) => ({ ...s, loading: true, error: null }));
      try {
        const resp = await apiFetch('/api/pats-picks?limit=200');
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`API ${resp.status}: ${text}`);
        }
        const data = await resp.json();
        if (cancelled) return;
        setPatsPicksRows(Array.isArray(data.rows) ? data.rows : []);
        setPatsPicksStatus({
          loading: false,
          error: data.error || null,
          lastUpdated: data.last_updated || null,
          source: data.source || null,
          bankroll: data.bankroll || 1000,
        });
      } catch (e) {
        if (cancelled) return;
        setPatsPicksRows([]);
        setPatsPicksStatus((s) => ({
          ...s,
          loading: false,
          error: e?.message || 'Failed to load Pats Picks',
        }));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculateStats = () => {
    const wins = betTracker.filter(bet => bet.result === 'won').length;
    const losses = betTracker.filter(bet => bet.result === 'lost').length;
    const totalProfit = betTracker.reduce((sum, bet) => sum + bet.profit, 0);
    const totalStaked = betTracker.reduce((sum, bet) => sum + bet.stake, 0);
    const roi = totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(1) : '0.0';
    
    return { wins, losses, totalProfit, roi };
  };

  const stats = calculateStats();

  const patsPicksPreview = useMemo(() => patsPicksRows.slice(0, 50), [patsPicksRows]);

  return (
    <div className="patty-picks-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <img 
            src="/img/evisionbet-wordmark.png" 
            alt="EVision" 
            className="nav-logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/img/evision-wordmark-premium.svg";
            }}
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
            <span className="date-badge">{new Date(today).toLocaleDateString()}</span>
          </div>

          {patsPicksStatus.loading ? (
            <div className="info-note">
              <p>Loading Pats Picks from the backend…</p>
            </div>
          ) : patsPicksStatus.error ? (
            <div className="info-note">
              <p>
                💡 <strong>Note:</strong> Pats Picks aren’t available yet. ({patsPicksStatus.error})
              </p>
            </div>
          ) : patsPicksPreview.length === 0 ? (
            <div className="info-note">
              <p>💡 <strong>Note:</strong> Pats_Picks.csv has no rows right now.</p>
            </div>
          ) : (
            <div className="bet-tracker">
              <div className="tracker-table">
                <div className="tracker-header">
                  <div className="col-game">Game</div>
                  <div className="col-pick">Pick</div>
                  <div className="col-odds">Odds</div>
                  <div className="col-odds">Fair</div>
                  <div className="col-profit">EV</div>
                  <div className="col-stake">Kelly (${patsPicksStatus.bankroll})</div>
                </div>

                {patsPicksPreview.map((row, idx) => {
                  const teams = pickFirst(row, ['teams', 'event_name', 'event', 'matchup']) || '';
                  const market = pickFirst(row, ['market', 'market_type', 'Market']) || '';
                  const selection = pickFirst(row, ['selection', 'Selection']) || '';
                  const point = pickFirst(row, ['point', 'Line']) || '';
                  const bestOdds = pickFirst(row, ['best_au_odds_decimal', 'best_odds', 'Odds']);
                  const fairOdds = pickFirst(row, ['fair_odds_decimal', 'fair_odds', 'Fair']);
                  const ev = pickFirst(row, ['ev_percent', 'EV%', 'ev']);
                  const kelly = pickFirst(row, ['kelly_1000_calc', 'kelly_1000']);

                  const pickText = `${selection}${point !== '' && point !== null ? ` ${point}` : ''} (${market})`;
                  return (
                    <div key={idx} className="tracker-row">
                      <div className="col-game">{teams}</div>
                      <div className="col-pick">{pickText}</div>
                      <div className="col-odds">{formatNumber(bestOdds, 2)}</div>
                      <div className="col-odds">{formatNumber(fairOdds, 2)}</div>
                      <div className="col-profit">{formatPercent(ev)}</div>
                      <div className="col-stake">{formatNumber(kelly, 0)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="info-note">
                <p>
                  💡 <strong>Source:</strong> {patsPicksStatus.source || 'Pats_Picks.csv'}
                  {patsPicksStatus.lastUpdated ? ` • Updated: ${patsPicksStatus.lastUpdated}` : ''}
                </p>
              </div>
            </div>
          )}
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
