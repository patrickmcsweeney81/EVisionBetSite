import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('username');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token); // backward compatibility
    localStorage.setItem('username', user);
    setIsAuthenticated(true);
    setUsername(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // backward compatibility
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  const value = {
    isAuthenticated,
    username,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
