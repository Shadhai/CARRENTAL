// // src/services/api.jsx
// import axiosInstance from './axiosConfig';

// // Auth APIs
// export const authAPI = {
//   login: (credentials) => axiosInstance.post('/auth/signin', credentials),
//   register: (userData) => axiosInstance.post('/auth/signup', userData),
//   getCurrentUser: () => axiosInstance.get('/user/me'),
// };

// // Car APIs
// export const carAPI = {
//   getAllCars: () => axiosInstance.get('/cars'),
//   getAvailableCars: () => axiosInstance.get('/cars/available'),
//   getCarById: (id) => axiosInstance.get(`/cars/${id}`),
//   createCar: (carData) => axiosInstance.post('/admin/cars', carData),
//   updateCar: (id, carData) => axiosInstance.put(`/admin/cars/${id}`, carData),
//   deleteCar: (id) => axiosInstance.delete(`/admin/cars/${id}`),
// };

// // Booking APIs - CORRECTED endpoints
// // src/services/api.jsx - Fix the bookings endpoint
// // src/services/api.jsx - Fix booking API
// export const bookingAPI = {
//   createBooking: (bookingData) => {
//     console.log('Sending booking data:', bookingData);
//     return axiosInstance.post('/bookings', bookingData, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   },
//   getMyBookings: () => axiosInstance.get('/bookings/my-bookings'),
//   getAllBookings: () => axiosInstance.get('/bookings/all'),
//   getBookingById: (id) => axiosInstance.get(`/bookings/${id}`),
//   cancelBooking: (id) => axiosInstance.delete(`/bookings/${id}`),
// };
// // User Management APIs
// export const userAPI = {
//   getAllUsers: () => axiosInstance.get('/admin/users'),
//   getUserById: (id) => axiosInstance.get(`/admin/users/${id}`),
//   deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
// };


// src/services/api.jsx
// src/services/api.jsx - COMPLETE IMPROVED VERSION
import axiosInstance from './axiosConfig';

// ===================
// API HELPER FUNCTIONS
// ===================
export const apiHelper = {
  handleError: (error, customMessage = 'Operation failed') => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     error.response.data?.detail ||
                     customMessage;
      
      console.error('API Error:', {
        status: error.response.status,
        message: message,
        url: error.config?.url,
        data: error.response.data
      });
      
      return { 
        success: false, 
        message, 
        status: error.response.status,
        data: error.response.data 
      };
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
      return { 
        success: false, 
        message: 'Network error. Please check your connection.', 
        status: 0 
      };
    } else {
      // Other errors
      console.error('Unexpected Error:', error.message);
      return { 
        success: false, 
        message: error.message || customMessage, 
        status: -1 
      };
    }
  },
  
  validateBookingData: (bookingData) => {
    const errors = [];
    
    if (!bookingData.carId) errors.push('Car selection is required');
    if (!bookingData.startDate) errors.push('Start date is required');
    if (!bookingData.endDate) errors.push('End date is required');
    
    if (bookingData.startDate && bookingData.endDate) {
      if (new Date(bookingData.startDate) >= new Date(bookingData.endDate)) {
        errors.push('End date must be after start date');
      }
      
      if (new Date(bookingData.startDate) < new Date().setHours(0,0,0,0)) {
        errors.push('Start date cannot be in the past');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // File validation helper
  validateFile: (file, options = {}) => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options;
    const errors = [];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Create FormData for file uploads
  createFormData: (data, fileFields = []) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (fileFields.includes(key) && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (Array.isArray(data[key])) {
        data[key].forEach(item => formData.append(key, item));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    return formData;
  },

  // Retry mechanism for failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
};

// ===================
// AUTH APIs
// ===================
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/signin', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Login failed. Please check your credentials.');
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/signup', userData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Registration failed. Please try again.');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch user data.');
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post('/auth/refresh');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Token refresh failed.');
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Logout failed.');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Password reset request failed.');
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Password reset failed.');
    }
  }
};

// ===================
export const carAPI = {
  // Public endpoints
  getAllCars: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/cars', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch cars.');
    }
  },

  getAvailableCars: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/cars/available', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch available cars.');
    }
  },

  getCarById: async (id) => {
    try {
      const response = await axiosInstance.get(`/cars/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch car details.');
    }
  },

  searchCars: async (filters) => {
    try {
      const response = await axiosInstance.get('/cars/search', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Car search failed.');
    }
  },

  // Admin endpoints with file upload support
  createCar: async (carData) => {
    try {
      const response = await axiosInstance.post('/admin/cars', carData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to create car.');
    }
  },

  updateCar: async (id, carData) => {
    try {
      const response = await axiosInstance.put(`/admin/cars/${id}`, carData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update car.');
    }
  },

  deleteCar: async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/cars/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to delete car.');
    }
  },

  toggleCarAvailability: async (id) => {
    try {
      const response = await axiosInstance.patch(`/admin/cars/${id}/availability`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update car availability.');
    }
  },

  uploadCarImage: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axiosInstance.post(`/admin/cars/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to upload car image.');
    }
  },

  deleteCarImage: async (id, imageId) => {
    try {
      const response = await axiosInstance.delete(`/admin/cars/${id}/images/${imageId}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to delete car image.');
    }
  },

  addCarFeature: async (id, feature) => {
    try {
      const response = await axiosInstance.post(`/admin/cars/${id}/features`, { feature });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to add car feature.');
    }
  },

  removeCarFeature: async (id, feature) => {
    try {
      const response = await axiosInstance.delete(`/admin/cars/${id}/features`, {
        data: { feature }
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to remove car feature.');
    }
  }
};


// ===================
// BOOKING APIs
// ===================
export const bookingAPI = {
// In api.jsx - FIX THE BOOKING CREATE ENDPOINT
  createBooking: async (bookingData) => {
  try {
    console.log("📤 Sending booking data:", bookingData);

    const validation = apiHelper.validateBookingData(bookingData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // FIX: Send as JSON body, not params
    const response = await axiosInstance.post('/bookings', bookingData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Booking created successfully");
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Booking error:', error.response?.data);
    throw apiHelper.handleError(error, 'Failed to create booking.');
  }
},

  getMyBookings: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/bookings/me', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch your bookings.');
    }
  },

  getAllBookings: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/bookings/all', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch bookings.');
    }
  },

  getBookingById: async (id) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch booking details.');
    }
  },

  cancelBooking: async (id) => {
    try {
      const response = await axiosInstance.delete(`/bookings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to cancel booking.');
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}`, bookingData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to update booking.');
    }
  }
};

// ===================
// USER MANAGEMENT APIs
// ===================
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

// ===================
// FILE UPLOAD APIs (Enhanced)
// ===================
export const uploadAPI = {
  uploadImage: async (file, options = {}) => {
    try {
      const validation = apiHelper.validateFile(file, options);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const formData = new FormData();
      formData.append('image', file);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      const response = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: options.onProgress
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to upload image.');
    }
  },

  uploadMultipleImages: async (files, options = {}) => {
    try {
      for (const file of files) {
        const validation = apiHelper.validateFile(file, options);
        if (!validation.isValid) {
          throw new Error(`Invalid file: ${file.name} - ${validation.errors.join(', ')}`);
        }
      }

      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      const response = await axiosInstance.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: options.onProgress
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to upload images.');
    }
  },

  deleteImage: async (imageUrl) => {
    try {
      const response = await axiosInstance.delete('/upload/image', { data: { imageUrl } });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to delete image.');
    }
  },

  getUploadedImages: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/upload/images', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch uploaded images.');
    }
  }
};

// ===================
// NOTIFICATION APIs
// ===================
export const notificationAPI = {
  getMyNotifications: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch notifications.');
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to mark notification as read.');
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.patch('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to mark all notifications as read.');
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await axiosInstance.delete(`/notifications/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to delete notification.');
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch unread count.');
    }
  },

  // Admin notification management
  createNotification: async (notificationData) => {
    try {
      const response = await axiosInstance.post('/admin/notifications', notificationData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to create notification.');
    }
  },

  getAdminNotifications: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/notifications', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch admin notifications.');
    }
  }
};

// ===================
// PAYMENT APIs
// ===================
export const paymentAPI = {
  createPaymentIntent: async (bookingId) => {
    try {
      const response = await axiosInstance.post(`/payments/create-intent/${bookingId}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to create payment intent.');
    }
  },

  confirmPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/payments/confirm', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Payment confirmation failed.');
    }
  },

  getPaymentMethods: async () => {
    try {
      const response = await axiosInstance.get('/payments/methods');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch payment methods.');
    }
  },

  addPaymentMethod: async (paymentMethod) => {
    try {
      const response = await axiosInstance.post('/payments/methods', paymentMethod);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to add payment method.');
    }
  },

  removePaymentMethod: async (methodId) => {
    try {
      const response = await axiosInstance.delete(`/payments/methods/${methodId}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to remove payment method.');
    }
  },

  // Admin
  getAllPayments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/payments', { params });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch payments.');
    }
  },

  getPaymentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/payments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch payment details.');
    }
  },

  refundPayment: async (paymentId) => {
    try {
      const response = await axiosInstance.post(`/admin/payments/${paymentId}/refund`);
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to process refund.');
    }
  },

  getPaymentStats: async () => {
    try {
      const response = await axiosInstance.get('/admin/payments/stats');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch payment statistics.');
    }
  }
};

// ===================
// ANALYTICS & DASHBOARD APIs
// ===================
export const analyticsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch dashboard statistics.');
    }
  },

  getRevenueAnalytics: async (period) => {
    try {
      const response = await axiosInstance.get('/admin/analytics/revenue', { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch revenue analytics.');
    }
  },

  getBookingAnalytics: async (period) => {
    try {
      const response = await axiosInstance.get('/admin/analytics/bookings', { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch booking analytics.');
    }
  },

  getUserAnalytics: async (period) => {
    try {
      const response = await axiosInstance.get('/admin/analytics/users', { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch user analytics.');
    }
  },

  getCarUtilization: async () => {
    try {
      const response = await axiosInstance.get('/admin/analytics/car-utilization');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch car utilization data.');
    }
  },

  getPopularCars: async () => {
    try {
      const response = await axiosInstance.get('/admin/analytics/popular-cars');
      return { success: true, data: response.data };
    } catch (error) {
      throw apiHelper.handleError(error, 'Failed to fetch popular cars data.');
    }
  }
};

// ===================
// CONFIGURATION
// ===================
export const setupAPIConfig = () => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      config.params = { ...config.params, _t: Date.now() }; // cache-busting param
      
      // Add timestamp for file uploads
      if (config.data instanceof FormData) {
        config.headers['X-Request-Timestamp'] = Date.now();
      }
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('✅ API Success:', response.config.url);
      return response;
    },
    (error) => {
      const errorInfo = apiHelper.handleError(error);
      
      // Auto-refresh token on 401
      if (error.response?.status === 401) {
        const token = localStorage.getItem('token');
        if (token && !error.config.url.includes('/auth/refresh')) {
          console.log('🔄 Attempting token refresh...');
          // Implement token refresh logic here
        }
      }
      
      return Promise.reject(errorInfo);
    }
  );
};

// ===================
// EXPORT EVERYTHING
// ===================
export default {
  apiHelper,
  authAPI,
  carAPI,
  bookingAPI,
  userAPI,
  paymentAPI,
  uploadAPI,
  notificationAPI,
  analyticsAPI,
  setupAPIConfig,
  
  // Legacy exports for backward compatibility
  reviewAPI: {},
  locationAPI: {},
  promotionAPI: {},
  maintenanceAPI: {},
  reportAPI: {},
  settingsAPI: {},
  backupAPI: {}
};

