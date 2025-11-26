import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TodoPage from './components/TodoPage';
import OddsComparison from './components/OddsComparison';
import DiagnosticPage from './components/DiagnosticPage';
import ProtectedRoute from './components/ProtectedRoute';
import API_URL from './config';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionally decode or validate token expiry here
      setIsAuthenticated(true);
      // We stored username on login via onLogin callback
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUsername('');
  };

  // No remote auth check loading state needed now

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard username={username} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/todo" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TodoPage username={username} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/odds" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OddsComparison username={username} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diagnostics" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DiagnosticPage username={username} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;