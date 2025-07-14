import apiClient from '../config/api';

export const budgetService = {
  // Get all budgets
  async getAllBudgets() {
    try {
      const response = await apiClient.get('/api/budgets');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des budgets' };
    }
  },

  // Get budget by ID
  async getBudgetById(id) {
    try {
      const response = await apiClient.get(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du budget' };
    }
  },

  // Get budget by year
  async getBudgetByYear(year) {
    try {
      const response = await apiClient.get(`/api/budgets/year/${year}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du budget par année' };
    }
  },

  // Get budget summary by year
  async getBudgetSummaryByYear(year) {
    try {
      const response = await apiClient.get(`/api/budgets/year/${year}/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du résumé du budget' };
    }
  },

  // Create new budget
  async createBudget(budgetData) {
    try {
      const response = await apiClient.post('/api/budgets', budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du budget' };
    }
  },

  // Update budget
  async updateBudget(id, budgetData) {
    try {
      const response = await apiClient.put(`/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du budget' };
    }
  },

  // Delete budget
  async deleteBudget(id) {
    try {
      const response = await apiClient.delete(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du budget' };
    }
  }
}; 