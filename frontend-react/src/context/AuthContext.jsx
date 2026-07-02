import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Optionally verify token / refresh profile here
        try {
          const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (res.ok) {
            const freshUser = await res.json();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const register = async (registerData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed.');
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateProfile, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { API_BASE_URL };
