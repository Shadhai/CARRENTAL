// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import axiosInstance from '../services/axiosConfig';

// ✅ Normalize backend user data
const normalizeUserData = (responseData) => {
  if (!responseData) return null;

  if (responseData.id && responseData.username) {
    return {
      id: responseData.id,
      username: responseData.username,
      email: responseData.email,
      roles: responseData.roles || ['ROLE_USER'],
    };
  }

  return responseData;
};

// ✅ Check if user is admin (supports object or string roles)
const checkIsAdmin = (userData) => {
  if (!userData || !userData.roles) return false;

  const roles = userData.roles;

  if (Array.isArray(roles)) {
    return roles.some((role) => {
      if (typeof role === 'object') {
        return role.name === 'ROLE_ADMIN' || role.authority === 'ROLE_ADMIN';
      }
      return role === 'ROLE_ADMIN' || role === 'ADMIN';
    });
  }

  return roles === 'ROLE_ADMIN' || roles === 'ADMIN';
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await authAPI.getCurrentUser();
          const normalizedUser = normalizeUserData(response.data);

          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, ...userData } = response.data;

      const normalizedUser = normalizeUserData(userData);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: checkIsAdmin(user), // ✅ Use new role check
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};