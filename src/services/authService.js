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

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Call backend logout endpoint
        await apiClient.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      // Even if logout API call fails, we still want to clear local storage
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
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