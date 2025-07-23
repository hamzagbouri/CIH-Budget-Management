import apiClient from '../config/api';

export const responsableService = {
  // Get all active responsables
  async getAllResponsables() {
    try {
      const response = await apiClient.get('/api/responsables');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des responsables' };
    }
  },

  // Get responsables by year
  async getResponsablesByYear(year) {
    try {
      const response = await apiClient.get(`/api/responsables/annee/${year}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des responsables par année' };
    }
  },

  // Get responsables by department
  async getResponsablesByDepartment(departmentId) {
    try {
      const response = await apiClient.get(`/api/responsables/departement/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des responsables du département' };
    }
  },

  // Get responsable by ID
  async getResponsableById(id) {
    try {
      const response = await apiClient.get(`/api/responsables/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du responsable' };
    }
  },

  // Create new responsable
  async createResponsable(responsableData) {
    try {
      const response = await apiClient.post('/api/responsables', responsableData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du responsable' };
    }
  },

  // Update responsable
  async updateResponsable(id, responsableData) {
    try {
      const response = await apiClient.put(`/api/responsables/${id}`, responsableData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du responsable' };
    }
  },

  // Delete responsable permanently
  async deleteResponsable(id) {
    try {
      const response = await apiClient.delete(`/api/responsables/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du responsable' };
    }
  },

  // Deactivate responsable (soft delete)
  async deactivateResponsable(id) {
    try {
      const response = await apiClient.put(`/api/responsables/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la désactivation du responsable' };
    }
  }
}; 