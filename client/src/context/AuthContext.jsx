import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists, or auto-login demo user
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Stored token invalid, attempting demo fallback:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }

      // Auto-login demo user Rahul Sharma on fresh launch
      try {
        const demoRes = await api.post('/auth/login', {
          email: 'rahul@example.com',
          password: 'password123'
        });
        if (demoRes.data.success) {
          setToken(demoRes.data.token);
          setUser(demoRes.data.user);
          localStorage.setItem('token', demoRes.data.token);
          localStorage.setItem('user', JSON.stringify(demoRes.data.user));
        }
      } catch (e) {
        console.warn('Demo auto-login not available:', e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const switchUser = async (email, password = 'password123') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.reload();
        return res.data;
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const spendableCredits = user
    ? Math.max(0, (user.totalCredits || 0) - (user.reservedCredits || 0))
    : 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchUser,
        refreshUser,
        updateUser,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        spendableCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
