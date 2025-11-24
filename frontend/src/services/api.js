


import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create base instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Enhanced interceptor with debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 API Request Interceptor:');
    console.log(' - URL:', config.url);
    console.log(' - Method:', config.method);
    console.log(' - Content-Type:', config.headers['Content-Type']);
    console.log(' - Is FormData:', config.data instanceof FormData);
    console.log(' - Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' - Authorization header added');
    } else {
      console.log(' - No token found in localStorage');
    }
    
    // Don't set Content-Type for FormData - let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log(' - FormData detected, removed Content-Type');
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Apps API
export const appsAPI = {
  getAll: () => api.get('/apps'),
  getById: (id) => api.get(`/apps/${id}`),
};

// Uploads API
export const uploadsAPI = {
  uploadApp: (formData) => {
    console.log('📤 Upload API call started...');
    return api.post('/uploads/upload', formData);
  },
  getStats: () => api.get('/uploads/stats'),
  downloadApp: (appId) => api.get(`/uploads/download/${appId}`, {
    responseType: 'blob',
  }),
};

export default api;

