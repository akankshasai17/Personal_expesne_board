import axios from 'axios';

// Base API URL pointing to the Express backend (can be configured via Vite env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor: Automatically attach JWT token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spendwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle common HTTP errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, clear token and notify
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Clearing stored auth credentials.');
      // Optional: don't auto-clear if it was a login attempt failure
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('spendwise_token');
        localStorage.removeItem('spendwise_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
