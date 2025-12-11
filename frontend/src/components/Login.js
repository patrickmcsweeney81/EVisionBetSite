import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config';
import UpcomingGamesPublic from './UpcomingGamesPublic';
import ContactUs from './ContactUs';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use local auth with client-side user database
      login(username, password, `token-${username}-${Date.now()}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed - check username and password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-main-content">
          <div className="login-box">
            <img 
              src="/img/bet-evision-horizontal.png" 
              alt="BET EVision" 
              className="login-logo"
            />
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to access your dashboard</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <button type="submit" className="login-button">
                Sign In
              </button>
            </form>
            
            {showHint && (
              <div className="hint-box">
                <div className="hint-header">
                  <span>💡 Test Accounts Available:</span>
                  <button 
                    type="button" 
                    className="hint-close"
                    onClick={() => setShowHint(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="hint-content">
                  <div className="user-hint">
                    <strong>Admin:</strong> <code>admin</code> / <code>admin123</code>
                    <span className="badge admin">✓ Admin - Full Access</span>
                  </div>
                  <div className="user-hint">
                    <strong>User:</strong> <code>user1234</code> / <code>user1234</code>
                    <span className="badge user">👤 User - Limited Access</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* EV Explainer Video Section */}
          <div className="ev-explainer-section">
            <h3>💡 What is Expected Value (EV)?</h3>
            <p className="ev-description">
              Learn how Expected Value betting can give you an edge over the bookmakers
            </p>
            <div className="video-container">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/jJa6OzLnDSM"
                title="EV BETTING EXPLAINED IN 60 SECONDS | SHARP BETTING STRATEGIES"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <div className="ev-highlights">
              <div className="ev-point">
                <span className="ev-icon">📊</span>
                <p>Find mathematically profitable bets</p>
              </div>
              <div className="ev-point">
                <span className="ev-icon">💰</span>
                <p>Long-term positive returns</p>
              </div>
              <div className="ev-point">
                <span className="ev-icon">🎯</span>
                <p>Beat the bookmaker's margin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Games Widget */}
        <div className="login-widgets">
          <UpcomingGamesPublic />
        </div>

        {/* Contact Us Section */}
        <ContactUs />
      </div>
    </div>
  );
}

export default Login;