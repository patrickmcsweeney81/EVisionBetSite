import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// User database with roles
// In production, this would come from a backend API
const USERS = {
  'admin': {
    password: 'admin123',
    role: 'admin',
    email: 'admin@evisionbet.com'
  },
  'user1234': {
    password: 'user1234',
    role: 'user',
    email: 'user@evisionbet.com'
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
      setRole(storedRole || 'user');
    }
    setLoading(false);
  }, []);

  const login = (user, password, token) => {
    // Validate credentials
    const userData = USERS[user];
    if (!userData) {
      throw new Error('User not found');
    }
    if (userData.password !== password) {
      throw new Error('Invalid password');
    }

    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token); // backward compatibility
    localStorage.setItem('username', user);
    localStorage.setItem('role', userData.role);
    setIsAuthenticated(true);
    setUsername(user);
    setRole(userData.role);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // backward compatibility
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername('');
    setRole(null);
  };

  const isAdmin = role === 'admin';

  const value = {
    isAuthenticated,
    username,
    role,
    isAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
