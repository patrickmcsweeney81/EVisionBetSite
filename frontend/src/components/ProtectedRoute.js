import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();
  // Prefer token presence over transient state
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!isAuthenticated && !token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

export default ProtectedRoute;