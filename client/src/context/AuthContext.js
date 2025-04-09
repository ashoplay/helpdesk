import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      
      setUser(res.data.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      console.error('Auth error:', err.response?.data || err.message);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post('/api/auth/register', formData);
      
      setIsAuthenticated(true);
      loadUser();
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'An error occurred during registration');
      return { success: false, error: err.response?.data?.error || 'An error occurred' };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post('/api/auth/login', formData);
      
      setIsAuthenticated(true);
      await loadUser(); // Wait for user data to be loaded
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Invalid credentials');
      return { success: false, error: err.response?.data?.error || 'An error occurred' };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Clear errors
  const clearErrors = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
