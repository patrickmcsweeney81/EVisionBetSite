import React from 'react';
import { Link } from 'react-router-dom';
import './EVToolbox.css';

function EVToolbox({ username, onLogout }) {
  const handleLogout = () => {
    onLogout();
    window.location.href = '/';
  };

  return (
    <div className="ev-toolbox-container">
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

      <div className="ev-toolbox-content">
        <div className="page-header">
          <button onClick={() => window.location.href = '/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>🧰 EV Toolbox</h1>
          <p className="subtitle">Complete suite of value betting tools and utilities</p>
        </div>

        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">🎲</div>
            <h3>Dutching Calculator</h3>
            <p>Calculate optimal stake distribution across multiple selections to guarantee equal profit</p>
            <Link to="/ev-toolbox/dutching" className="tool-button">
              Open Dutching Tool
            </Link>
          </div>

          <div className="tool-card">
            <div className="tool-icon">🔍</div>
            <h3>Odds Hunting</h3>
            <p>Find the best odds across multiple bookmakers for your selections</p>
            <Link to="/ev-toolbox/odds-hunting" className="tool-button">
              Open Odds Hunter
            </Link>
          </div>

          <div className="tool-card">
            <div className="tool-icon">🎯</div>
            <h3>Live Odds Comparison</h3>
            <p>Compare live odds across multiple bookmakers in real-time</p>
            <Link to="/odds" className="tool-button">
              View Live Odds
            </Link>
          </div>

          <div className="tool-card">
            <div className="tool-icon">📊</div>
            <h3>All Odds Table</h3>
            <p>Professional odds comparison table with comprehensive data</p>
            <Link to="/odds-table" className="tool-button">
              View Odds Table
            </Link>
          </div>
        </div>

        <div className="info-section">
          <h2>📖 About the EV Toolbox</h2>
          <p>
            The EV Toolbox is your comprehensive suite of professional betting tools designed to maximize your value betting strategy. 
            Each tool is crafted to give you an edge in finding and capitalizing on positive expected value opportunities.
          </p>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Real-time odds comparison across major bookmakers</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Advanced dutching calculations for multiple bets</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Intelligent odds hunting to find the best value</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Professional-grade data analysis tools</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EVToolbox;
