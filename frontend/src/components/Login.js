import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import UpcomingGamesPublic from './UpcomingGamesPublic';
import ContactUs from './ContactUs';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        onLogin(username, data.access_token);
        navigate('/dashboard');
      } else {
        setError(data.detail || data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please make sure the backend is running.');
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
            
            <p className="hint">Hint: Username: EVision, Password: PattyMac</p>
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
                height="315"
                src="https://www.youtube.com/embed/uFcS0ury4K0"
                title="Expected Value in Sports Betting Explained"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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