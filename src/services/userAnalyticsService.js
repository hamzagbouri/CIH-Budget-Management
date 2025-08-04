import apiClient from '../config/api';

export const userAnalyticsService = {
  // Get user department analytics
  async getUserAnalytics(annee = new Date().getFullYear()) {
    try {
      const response = await apiClient.get(`/api/user/analytics?annee=${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des analytics' };
    }
  },

  // Get prestataires
  async getPrestataires() {
    try {
      const response = await apiClient.get('/api/user/prestataires');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des prestataires' };
    }
  }
}; 