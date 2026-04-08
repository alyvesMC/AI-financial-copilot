import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      axios.get('/api/dashboard')
        .then(res => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => {
          logout();
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.error || 'Registration failed' };
    }
  };

  const updateCurrency = async (currency) => {
    try {
      await axios.put('/api/users/currency', { currency });
      setUser({ ...user, currency });
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.error || 'Failed to update currency' };
    }
  };

  const logout = () => {
    setToken(null);
    setLoading(false);
  };

  const isPro = user?.tier === 'pro';
  const isTrialActive = false; // Disabled per strict Pro-gate request
  const hasPremiumAccess = isPro || isTrialActive;

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateCurrency, loading, isPro, isTrialActive, hasPremiumAccess }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
