import apiClient from '../config/api';

export const departmentService = {
  // Get all departments
  async getAllDepartments() {
    try {
      const response = await apiClient.get('/api/departements');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des départements' };
    }
  },

  // Get department by ID
  async getDepartmentById(id) {
    try {
      const response = await apiClient.get(`/api/departements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du département' };
    }
  },

  // Create new department
  async createDepartment(departmentData) {
    try {
      const response = await apiClient.post('/api/departements', departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du département' };
    }
  },

  // Update department
  async updateDepartment(id, departmentData) {
    try {
      const response = await apiClient.put(`/api/departements/${id}`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du département' };
    }
  },

  // Delete department
  async deleteDepartment(id) {
    try {
      const response = await apiClient.delete(`/api/departements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du département' };
    }
  }
}; 