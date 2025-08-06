import apiClient from '../config/api';

export const budgetDepartmentService = {
  // Get all budget departments
  async getAllBudgetDepartments() {
    try {
      const response = await apiClient.get('/api/budget-departements');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des budgets par département' };
    }
  },

  // Get budget department by ID
  async getBudgetDepartmentById(id) {
    try {
      const response = await apiClient.get(`/api/budget-departements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du budget département' };
    }
  },

  // Get budget departments by year
  async getBudgetDepartmentsByYear(year) {
    try {
      const response = await apiClient.get(`/api/budget-departements/year/${year}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des budgets par année' };
    }
  },

  // Get budget departments by department
  async getBudgetDepartmentsByDepartment(departmentId) {
    try {
      const response = await apiClient.get(`/api/budget-departements/departement/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des budgets du département' };
    }
  },

  // Get budget department by department and year
  async getBudgetDepartmentByDepartmentAndYear(departmentId, year) {
    try {
      const response = await apiClient.get(`/api/budget-departements/departement/${departmentId}/year/${year}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du budget département' };
    }
  },

  // Create new budget department
  async createBudgetDepartment(budgetDepartmentData) {
    try {
      const response = await apiClient.post('/api/budget-departements', budgetDepartmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du budget département' };
    }
  },

  // Update budget department
  async updateBudgetDepartment(id, budgetDepartmentData) {
    try {
      console.log(budgetDepartmentData);
      const response = await apiClient.put(`/api/budget-departements/${id}`, budgetDepartmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du budget département' };
    }
  },

  // Delete budget department
  async deleteBudgetDepartment(id) {
    try {
      const response = await apiClient.delete(`/api/budget-departements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du budget département' };
    }
  }
}; 