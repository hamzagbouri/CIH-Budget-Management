import apiClient from '../config/api';

export const userExpenseService = {
  // Get user department expenses
  async getUserExpenses(annee = new Date().getFullYear(), status = null, prestataire = null) {
    try {
      let url = `/api/user/depenses?annee=${annee}`;
      if (status) url += `&status=${status}`;
      if (prestataire) url += `&prestataire=${prestataire}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des dépenses' };
    }
  },

  // Get specific expense
  async getExpense(id) {
    try {
      const response = await apiClient.get(`/api/user/depenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de la dépense' };
    }
  },

  // Create expense
  async createExpense(expenseData) {
    try {
      const response = await apiClient.post('/api/user/depenses', expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la dépense' };
    }
  },

  // Update expense
  async updateExpense(id, expenseData) {
    try {
      const response = await apiClient.put(`/api/user/depenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification de la dépense' };
    }
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      const response = await apiClient.delete(`/api/user/depenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la dépense' };
    }
  }
}; 