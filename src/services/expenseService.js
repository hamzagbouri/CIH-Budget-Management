import apiClient from '../config/api';

export const expenseService = {
  // Get all expenses
  async getAllExpenses() {
    try {
      const response = await apiClient.get('/api/depenses');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des dépenses' };
    }
  },

  // Get expense by ID
  async getExpenseById(id) {
    try {
      const response = await apiClient.get(`/api/depenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de la dépense' };
    }
  },

  // Create new expense
  async createExpense(expenseData) {
    try {
      const response = await apiClient.post('/api/depenses', expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la dépense' };
    }
  },

  // Update expense
  async updateExpense(id, expenseData) {
    try {
      const response = await apiClient.put(`/api/depenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la dépense' };
    }
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      const response = await apiClient.delete(`/api/depenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la dépense' };
    }
  }
}; 