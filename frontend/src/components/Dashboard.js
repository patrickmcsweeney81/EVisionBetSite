import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UpcomingGames from './UpcomingGames';
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

        <UpcomingGames />

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📊 Analytics</h3>
            <p>View your betting statistics and performance metrics</p>
            <button className="card-button" disabled>Coming Soon</button>
          </div>

          <div className="dashboard-card">
            <h3>🎯 Live Odds</h3>
            <p>Compare live odds across multiple bookmakers</p>
            <Link to="/odds" className="card-button">
              View Odds
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
            <h3>📈 EV Hits</h3>
            <p>View positive expected value betting opportunities</p>
            <Link to="/ev" className="card-button">
              View EV Hits
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