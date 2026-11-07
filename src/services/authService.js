import api from './api';

const TOKEN_KEY = 'spendwise_token';
const USER_KEY = 'spendwise_user';

export const authService = {
  // Register a new user
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success && response.data.token) {
      this.setSession(response.data.token, response.data.user);
    }
    return response.data;
  },

  // Login existing user
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      this.setSession(response.data.token, response.data.user);
    }
    return response.data;
  },

  // Log out user & clear credentials
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Verify and fetch current user profile from server
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Store token and user in localStorage for persistence
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get active token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user profile from localStorage
  getStoredUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Check if user is currently logged in
  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;
