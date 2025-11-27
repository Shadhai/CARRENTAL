import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authAPI } from '../services/api';
import axiosInstance from '../services/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Normalize user data from API
const normalizeUserData = (responseData) => {
  if (!responseData) return null;

  if (responseData.id && responseData.username) {
    return {
      id: responseData.id,
      username: responseData.username,
      email: responseData.email,
      roles: responseData.roles || ['ROLE_USER'],
      active: responseData.active !== false
    };
  }

  return responseData;
};

// ✅ Robust role checking
const checkIsAdmin = (userData) => {
  if (!userData || !userData.roles) return false;

  const roles = userData.roles;

  const checkRole = (role) => {
    if (typeof role === 'object') {
      return role.name === 'ROLE_ADMIN' || role.authority === 'ROLE_ADMIN';
    }
    return role === 'ROLE_ADMIN' || role === 'ADMIN';
  };

  if (Array.isArray(roles)) {
    return roles.some(checkRole);
  }

  return checkRole(roles);
};

// In AuthContext.jsx - COMPLETE FIX
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ FIXED: Enhanced token validation
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token) {
        try {
          // Set the token in axios headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is valid by calling current user endpoint
          const response = await authAPI.getCurrentUser();
          const normalizedUser = normalizeUserData(response.data);

          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));

          console.log('✅ User session restored:', normalizedUser.username);
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axiosInstance.defaults.headers.common['Authorization'];
          setUser(null);
          setError('Session expired. Please login again.');
        }
      } else {
        // No token found
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ✅ FIXED: Enhanced login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError('');

      const response = await authAPI.login(credentials);
      
      // ✅ Handle different response formats
      let token, userData;
      
      if (response.data && response.data.token) {
        // Format: { token: "...", user: {...} }
        token = response.data.token;
        userData = response.data.user || response.data;
      } else if (response.data && response.data.accessToken) {
        // Format: { accessToken: "...", ...userData }
        token = response.data.accessToken;
        userData = response.data;
      } else {
        // Raw token response
        token = response.data;
        userData = response.data;
      }

      const normalizedUser = normalizeUserData(userData);

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Set axios default header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(normalizedUser);

      console.log('✅ Login successful:', normalizedUser.username);
      return { success: true, data: normalizedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Enhanced logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError('');
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('✅ User logged out');
  };

  // ✅ NEW: Check if user has admin role
  const hasAdminRole = (userData) => {
    if (!userData || !userData.roles) return false;
    
    const roles = userData.roles;
    
    // Handle different role formats
    if (Array.isArray(roles)) {
      return roles.some(role => {
        if (typeof role === 'object') {
          return role.name === 'ROLE_ADMIN' || role.authority === 'ROLE_ADMIN';
        }
        return role === 'ROLE_ADMIN' || role === 'ADMIN';
      });
    }
    
    return roles === 'ROLE_ADMIN' || roles === 'ADMIN';
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
    isAdmin: hasAdminRole(user),
    hasAdminRole // Export the function for reuse
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Now the `userAPI` code is outside the AuthProvider component
export const userAPI = {
  // Public endpoints
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch user profile.');
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/user/profile', userData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update profile.');
    }
  },

  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await axiosInstance.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to upload avatar.');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.put('/user/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to change password.');
    }
  },

  // Profile edit requests (for non-admin users)
  submitProfileEditRequest: async (editData) => {
    try {
      const response = await axiosInstance.post('/user/profile/edit-request', editData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to submit edit request.');
    }
  },

  getEditRequests: async () => {
    try {
      const response = await axiosInstance.get('/user/profile/edit-requests');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch edit requests.');
    }
  },

  // Admin endpoints
  getAllUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/users', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch users.');
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch user details.');
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/admin/users', userData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to create user.');
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update user.');
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to delete user.');
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${id}/status`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update user status.');
    }
  },

  updateUserRoles: async (id, roles) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${id}/roles`, { roles });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update user roles.');
    }
  },

  // Profile edit request management (Admin)
  getPendingEditRequests: async () => {
    try {
      const response = await axiosInstance.get('/admin/profile-edit-requests');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch pending edit requests.');
    }
  },

  approveEditRequest: async (requestId) => {
    try {
      const response = await axiosInstance.patch(`/admin/profile-edit-requests/${requestId}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to approve edit request.');
    }
  },

  rejectEditRequest: async (requestId, reason = '') => {
    try {
      const response = await axiosInstance.patch(`/admin/profile-edit-requests/${requestId}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to reject edit request.');
    }
  },

  // User analytics
  getUserStats: async () => {
    try {
      const response = await axiosInstance.get('/admin/users/stats');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch user statistics.');
    }
  },

  getActiveUsers: async () => {
    try {
      const response = await axiosInstance.get('/admin/users/active');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch active users.');
    }
  }
};
