import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
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
        localStorage.setItem('authToken', data.access_token);
        onLogin(username);
        navigate('/dashboard');
      } else {
        setError(data.detail || data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please make sure the backend is running.');
    }
  };

  return (
    <div className="login-container">
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
    </div>
  );
}

export default Login;