import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TodoPage from './components/TodoPage';
import OddsComparison from './components/OddsComparison';
import DiagnosticPage from './components/DiagnosticPage';
import EVHits from './components/EVHits';
import OddsTable from './components/OddsTable';
import PattyPicks from './components/PattyPicks';
import EVToolbox from './components/EVToolbox';
import DutchingCalculator from './components/DutchingCalculator';
import OddsHunting from './components/OddsHunting';
import RawOddsTable from './components/RawOddsTable';
import AdminPanel from './components/AdminPanel';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, username, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#0b0b0b',
        color: '#4be1c1',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={login} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/todo" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TodoPage username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/odds" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OddsComparison username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diagnostics" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DiagnosticPage username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ev" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EVHits username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ev-hits" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EVHits username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/odds-table" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OddsTable username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patty-picks" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PattyPicks username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ev-toolbox" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EVToolbox username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ev-toolbox/dutching" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DutchingCalculator username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ev-toolbox/odds-hunting" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OddsHunting username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/raw-odds" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RawOddsTable username={username} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
