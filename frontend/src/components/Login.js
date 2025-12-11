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
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');

    try {
      // Login as admin with the provided password
      login('admin', adminPassword, `token-admin-${Date.now()}`);
      setShowAdminModal(false);
      navigate('/admin');
    } catch (err) {
      setAdminError(err.message || 'Invalid admin password');
    }
  };

  return (
    <div className="login-page">
      {/* Admin Button in Top Corner */}
      <button 
        className="admin-corner-btn"
        onClick={() => {
          setShowAdminModal(true);
          setAdminError('');
          setAdminPassword('');
        }}
        title="Admin Access"
      >
        ⚙️
      </button>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="admin-modal-close"
              onClick={() => setShowAdminModal(false)}
            >
              ✕
            </button>
            
            <h2>🔐 Admin Access</h2>
            <p className="admin-modal-subtitle">Enter admin password to access the dashboard</p>

            {adminError && <div className="admin-error-message">{adminError}</div>}

            <form onSubmit={handleAdminLogin}>
              <div className="admin-form-group">
                <label htmlFor="admin-password">Admin Password</label>
                <input
                  type="password"
                  id="admin-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>

              <button type="submit" className="admin-login-btn">
                Enter Admin Portal
              </button>
            </form>

            <p className="admin-modal-hint">Password: <code>admin123</code></p>
          </div>
        </div>
      )}

      <div className="login-container">
        <div className="login-main-content">
          <div className="login-box">
            <img 
              src="/img/bet-evision-horizontal.png" 
              alt="BET EVision" 
              className="login-logo"
            />
            
            <h1 className="login-greeting">Welcome Back Patty Mac!</h1>
            <p className="login-tagline">login and let's go break things 🔥</p>
            
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

            <p className="lets-go-cry">Let's go make the bookies cry 💸</p>
            
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