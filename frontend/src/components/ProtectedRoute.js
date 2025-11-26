import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, children }) {
  // Prefer token presence over transient state
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!isAuthenticated && !token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;