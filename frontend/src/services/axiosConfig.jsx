// // src/services/axiosConfig.jsx
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8081/api'; // Changed from 8081 to 8080

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000, // 10 second timeout
// });

// // Request interceptor to add auth token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log('API Request with token:', config.url);
//     } else {
//       console.log('API Request without token:', config.url);
//     }
//     return config;
//   },
//   (error) => {
//     console.error('Request interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle errors
// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log('API Response success:', response.config.url);
//     return response;
//   },
//   (error) => {
//     console.error('API Response error:', {
//       url: error.config?.url,
//       status: error.response?.status,
//       message: error.message
//     });

//     if (error.response?.status === 401) {
//       console.log('Unauthorized access, clearing token');
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       // Don't redirect automatically, let the component handle it
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
// src/services/axiosConfig.jsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api'; // Keep as 8081 (matches your backend)

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});
// In axiosConfig.jsx - IMPROVE ERROR HANDLING
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', response.config.url);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error('❌ API Response error:', {
      url: url,
      status: status,
      message: error.message,
      data: error.response?.data
    });

    // Don't auto-logout for API errors, let components handle it
    if (status === 401 && url && url.includes('/auth/')) {
      console.log('Auth failed, clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
// Request interceptor to add auth token
// In axiosConfig.jsx - COMPLETE FIX
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 API Request with token:', config.url);
    } else {
      console.log('❌ API Request without token:', config.url);
      // Don't proceed if token is required for protected routes
      if (config.url.includes('/admin/') || config.url.includes('/bookings')) {
        console.warn('⚠️ Attempting to access protected route without token');
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ FIXED: Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', response.config.url);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error('❌ API Response error:', {
      url: url,
      status: status,
      message: error.message,
      data: error.response?.data
    });

    // Handle 401 errors properly
    if (status === 401) {
      console.log('🔐 Authentication failed for:', url);
      
      // Don't auto-logout for all 401s - let components handle it
      if (url && (url.includes('/admin/') || url.includes('/auth/'))) {
        console.log('🔄 Clearing invalid token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login?session=expired';
          }, 1000);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;