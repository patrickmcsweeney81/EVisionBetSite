import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UpcomingGamesPublic from './UpcomingGamesPublic';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const usernameInputRef = useRef(null);
  const explainerVideoId = useMemo(
    () => (process.env.REACT_APP_EV_EXPLAINER_YOUTUBE_ID || '').trim(),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use local auth with client-side user database
      login(username, password, `token-${username}-${Date.now()}`);
      const from = location.state?.from;
      const redirectTo = from?.pathname
        ? `${from.pathname || ''}${from.search || ''}${from.hash || ''}`
        : '/dashboard';
      navigate(redirectTo, { replace: true });
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
      <header className="login-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-brand" aria-label="EVision">
            <img
              src="/img/evisionbet-monogram.png"
              alt=""
              className="toolbar-logo-mark"
              aria-hidden="true"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/evision-monogram-ev.svg";
              }}
            />
            <img
              src="/img/evisionbet-wordmark.png"
              alt="EVision"
              className="toolbar-logo-wordmark"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/evision-wordmark-premium.svg";
              }}
            />
          </div>
        </div>
        <nav className="toolbar-links">
          <button type="button" className="toolbar-link">Features</button>
          <button type="button" className="toolbar-link">How it works</button>
          <button type="button" className="toolbar-link">Pricing</button>
          <button type="button" className="toolbar-link">Support</button>
        </nav>
        <div className="toolbar-actions">
          <button
            type="button"
            className="toolbar-btn secondary"
            onClick={() => {
              setShowSignupModal(true);
              setShowHint(false);
            }}
          >
            Get Started
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => {
              setError('');
              usernameInputRef.current?.focus?.();
            }}
          >
            Log In
          </button>
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
        </div>
      </header>

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
            
            <h1 className="admin-greeting">Welcome Back Patty Mac!</h1>
            <p className="admin-tagline">login and let's go break things 🔥</p>
            
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

      <main className="login-container">
        <section className="welcome-mega-card">
          <div className="welcome-mega-grid">
            <div className="welcome-pane">
              <div className="welcome-pane-inner">
                <img
                  src="/img/evisionbet-wordmark.png"
                  alt="EVision"
                  className="welcome-logo"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/img/evision-wordmark-premium.svg";
                  }}
                />

                <h1 className="welcome-heading">Sign In</h1>
                <p className="welcome-subheading">Access your account</p>

                {error && <div className="admin-error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="welcome-form">
                  <div className="admin-form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      ref={usernameInputRef}
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>

                  <button type="submit" className="admin-login-btn">
                    Sign In
                  </button>
                </form>

                <button
                  type="button"
                  className="welcome-secondary-btn"
                  onClick={() => setShowHint((prev) => !prev)}
                >
                  {showHint ? "Hide demo credentials" : "Show demo credentials"}
                </button>

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
            </div>

            <div className="welcome-pane">
              <div className="welcome-pane-inner">
                <h2 className="welcome-heading small">💡 What is Expected Value (EV)?</h2>
                <p className="welcome-subheading">
                  Learn how EV betting can give you an edge over the bookmakers.
                </p>

                <div className="welcome-video">
                  {explainerVideoId ? (
                    <iframe
                      title="EV Explained"
                      src={`https://www.youtube-nocookie.com/embed/${explainerVideoId}?rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <div className="welcome-video-placeholder">
                      <div className="welcome-video-placeholder-title">EV explainer video</div>
                      <div className="welcome-video-placeholder-subtitle">
                        Set <code>REACT_APP_EV_EXPLAINER_YOUTUBE_ID</code> to show it here.
                      </div>
                    </div>
                  )}
                </div>

                <div className="welcome-pill-grid">
                  <div className="welcome-pill">📊 Find mathematically profitable bets</div>
                  <div className="welcome-pill">🧠 Long-term positive returns</div>
                  <div className="welcome-pill">🎯 Beat the bookmaker's margin</div>
                </div>
              </div>
            </div>
          </div>

          <div className="welcome-mega-divider" />

          <div className="welcome-games">
            <UpcomingGamesPublic />
          </div>
        </section>
      </main>

      {showSignupModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="admin-modal-close"
              onClick={() => setShowSignupModal(false)}
            >
              ✕
            </button>
            <h1 className="admin-greeting">Request Access</h1>
            <p className="admin-tagline">Signups are invite-only for now.</p>
            <button
              type="button"
              className="admin-login-btn"
              onClick={() => setShowSignupModal(false)}
            >
              Join the Waitlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;