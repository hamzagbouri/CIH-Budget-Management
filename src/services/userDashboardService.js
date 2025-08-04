import apiClient from '../config/api';

export const userDashboardService = {
  // Get user dashboard data
  async getUserDashboard(annee = new Date().getFullYear()) {
    try {
      const response = await apiClient.get(`/api/user/dashboard?annee=${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du tableau de bord utilisateur' };
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.put('/api/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },

  // Update user password
  async updatePassword(passwordData) {
    try {
      const response = await apiClient.put('/api/user/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du mot de passe' };
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/api/user/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'envoi de l\'email de réinitialisation' };
    }
  },

  // Reset password
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post('/api/user/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la réinitialisation du mot de passe' };
    }
  }
}; 