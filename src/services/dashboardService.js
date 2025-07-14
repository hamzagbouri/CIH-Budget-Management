import apiClient from '../config/api';

export const dashboardService = {
  // Get department dashboard data
  async getDepartementDashboard() {
    try {
      const response = await apiClient.get('/api/dashboard/departement');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du tableau de bord' };
    }
  }
}; 