import apiClient from '../config/api';

export const dashboardService = {
  // Get user's department data with budget and recent expenses
  async getUserDashboard() {
    try {
      const response = await apiClient.get('/api/dashboard/departement');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des données du tableau de bord' };
    }
  }
}; 