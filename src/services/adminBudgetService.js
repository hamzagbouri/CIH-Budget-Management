import apiClient from '../config/api';

export const adminBudgetService = {
  // Add budget for year
  async addBudget(budgetData) {
    try {
      const response = await apiClient.post('/api/admin/budgets', budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout du budget' };
    }
  },

  // Update budget
  async updateBudget(id, budgetData) {
    try {
      const response = await apiClient.put(`/api/admin/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification du budget' };
    }
  },

  // Get budget by year
  async getBudgetByYear(annee) {
    try {
      const response = await apiClient.get(`/api/admin/budgets/annee/${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du budget' };
    }
  },

  // Add department budget
  async addDepartmentBudget(departementId, budgetData) {
    try {
      const response = await apiClient.post(`/api/admin/departements/${departementId}/budget`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout du budget département' };
    }
  },

  // Update department budget
  async updateDepartmentBudget(departementId, budgetData) {
    try {
      console.log(budgetData);
      const response = await apiClient.put(`/api/admin/departements/${departementId}/budget`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification du budget département' };
    }
  }
}; 