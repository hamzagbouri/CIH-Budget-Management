import apiClient from '../config/api';

export const adminExpenseService = {
  // Validate expense
  async validateExpense(id) {
    try {
      const response = await apiClient.put(`/api/admin/depenses/${id}/validate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la validation de la dépense' };
    }
  },

  // Reject expense
  async rejectExpense(id) {
    try {
      const response = await apiClient.put(`/api/admin/depenses/${id}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du rejet de la dépense' };
    }
  },

  // Get pending expenses
  async getPendingExpenses() {
    try {
      const response = await apiClient.get('/api/depenses?status=EN_ATTENTE');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des dépenses en attente' };
    }
  },

  // Get all expenses for admin
  async getAllExpenses() {
    try {
      const response = await apiClient.get('/api/depenses');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des dépenses' };
    }
  }
}; 