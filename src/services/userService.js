import apiClient from '../config/api';

export const userService = {
  // Get all users
  async getAllUsers() {
    try {
      const response = await apiClient.get('/api/utilisateurs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs' };
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await apiClient.get(`/api/utilisateurs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'utilisateur' };
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiClient.post('/api/utilisateurs', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de l\'utilisateur' };
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/api/utilisateurs/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/api/utilisateurs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  }
}; 