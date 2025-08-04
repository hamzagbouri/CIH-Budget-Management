import apiClient from '../config/api';

export const adminDashboardService = {
  // Get admin dashboard data
  async getAdminDashboard(annee = new Date().getFullYear()) {
    try {
      const response = await apiClient.get(`/api/admin/dashboard?annee=${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du tableau de bord admin' };
    }
  },

  // Get all departments analytics
  async getDepartmentsAnalytics(annee = new Date().getFullYear()) {
    try {
      const response = await apiClient.get(`/api/admin/departements/analytics?annee=${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des analytics départements' };
    }
  },

  // Get specific department analytics
  async getDepartmentAnalytics(departementId, annee = new Date().getFullYear()) {
    try {
      const response = await apiClient.get(`/api/admin/departements/analytics/${departementId}?annee=${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des analytics département' };
    }
  },

  // Get departments with responsible
  async getDepartmentsWithResponsable(annee = new Date().getFullYear()) {
    try {
      const response = await apiClient.get(`/api/admin/departements/with-responsable?annee=${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des départements' };
    }
  },

  // Add department with responsible
  async addDepartmentWithResponsable(departmentData) {
    try {
      const response = await apiClient.post('/api/admin/departements/with-responsable', departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout du département' };
    }
  },

  // Validate budget
  async validateBudgets(annee) {
    try {
      const response = await apiClient.get(`/api/admin/budgets/validation/${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la validation des budgets' };
    }
  }
}; 