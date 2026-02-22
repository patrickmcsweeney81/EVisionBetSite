import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContactUs from './ContactUs';
import { DASHBOARD_CARDS } from '../dashboard/cards';
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

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Your betting analytics and value tools hub
        </p>

        <div className="dashboard-grid">
          {DASHBOARD_CARDS.map((card) => {
            const sources = Array.isArray(card.dataSources) ? card.dataSources : [];
            const sourceLabel = sources.length
              ? sources.map((s) => `${s.type}:${s.name}`).join(' • ')
              : 'TBD';

            return (
              <div className="dashboard-card" key={card.id}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className="dashboard-card-meta">
                  <span className="dashboard-card-meta-label">Data:</span>
                  <span className="dashboard-card-meta-value">{sourceLabel}</span>
                </div>

                {card.route && !card.disabled ? (
                  <Link to={card.route} className="card-button">
                    {card.buttonText || 'Open'}
                  </Link>
                ) : (
                  <button className="card-button" disabled>
                    {card.buttonText || 'Coming Soon'}
                  </button>
                )}
              </div>
            );
          })}
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