import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      axios.get(`${API}/dashboard`)
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
      const res = await axios.post(`${API}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const errorPayload = err.response?.data?.error;
      const msg = typeof errorPayload === 'string' ? errorPayload : (errorPayload?.message || JSON.stringify(errorPayload) || 'Login failed');
      return { success: false, msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API}/auth/register`, { name, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const errorPayload = err.response?.data?.error;
      const msg = typeof errorPayload === 'string' ? errorPayload : (errorPayload?.message || JSON.stringify(errorPayload) || 'Registration failed');
      return { success: false, msg };
    }
  };

  const updateCurrency = async (currency) => {
    try {
      await axios.put(`${API}/users/currency`, { currency });
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
