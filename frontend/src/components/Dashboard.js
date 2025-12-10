import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContactUs from './ContactUs';
import './Dashboard.css';

function Dashboard({ username, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
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

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Your betting analytics and value tools hub
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📈 Expected Value Finder</h3>
            <p>View positive expected value betting opportunities</p>
            <Link to="/ev" className="card-button">
              View Expected Value Finder
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>🎯 Patty Picks</h3>
            <p>2 EV bets added daily with bet tracker for 2 weeks of results</p>
            <Link to="/patty-picks" className="card-button">
              View Patty Picks
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>🧰 EV Toolbox</h3>
            <p>Access Dutching, Odds Hunting, and other value betting tools</p>
            <Link to="/ev-toolbox" className="card-button">
              View EV Toolbox
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>📊 All Odds Table</h3>
            <p>Professional odds comparison table from all_odds.csv</p>
            <Link to="/odds-table" className="card-button">
              View Table
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>📋 Raw Odds Table</h3>
            <p>View pure raw odds data with filtering (no EV calculations)</p>
            <Link to="/raw-odds" className="card-button">
              View Raw Odds
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>💡 Ideas & TODO</h3>
            <p>View project ideas and development roadmap</p>
            <Link to="/todo" className="card-button">
              View TODO
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>⚙️ Settings</h3>
            <p>Manage your account and preferences</p>
            <button className="card-button" disabled>Coming Soon</button>
          </div>
        </div>

        <div className="tagline">
          Bet smarter with BET EVision — where value comes first.
        </div>

        <ContactUs />
      </div>
    </div>
  );
}

export default Dashboard;