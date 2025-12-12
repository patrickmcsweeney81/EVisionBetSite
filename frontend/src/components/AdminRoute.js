import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminRoute.css';

/**
 * AdminRoute Component
 * Protects routes that require admin access
 */

function AdminRoute({ children }) {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAdmin) {
    return (
      <div className="admin-route-denied">
        <div className="denied-card">
          <h2>🔒 Admin Access Required</h2>
          <p>Only admin users can access this page.</p>
          <div className="access-info">
            <p>Your current access level:</p>
            {isAuthenticated ? (
              <div className="role-badge">Regular User</div>
            ) : (
              <div className="role-badge">Not Authenticated</div>
            )}
          </div>
          <p className="hint-text">
            To test admin features, log in with:<br/>
            <code>admin</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default AdminRoute;
