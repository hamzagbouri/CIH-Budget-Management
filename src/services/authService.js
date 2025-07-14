import apiClient from '../config/api';

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur d\'inscription' };
    }
  },

  // Update password
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      const response = await apiClient.put(`/api/auth/password/${userId}`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de mise à jour du mot de passe' };
    }
  },

  // Test authentication
  async testAuth() {
    try {
      const response = await apiClient.get('/api/auth/test');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de test d\'authentification' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }
}; 