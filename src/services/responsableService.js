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
      // Ensure we send the correct data structure
      const data = {
        nom: responsableData.nom,
        email: responsableData.email,
        matricule: responsableData.matricule,
        departementId: responsableData.departementId,
        annee: responsableData.annee
      };
      
      console.log('Creating responsable with data:', data);
      const response = await apiClient.post('/api/responsables', data);
      return response.data;
    } catch (error) {
      console.error('Error creating responsable:', error);
      throw error.response?.data || { message: 'Erreur lors de la création du responsable' };
    }
  },

  // Update responsable (for modifying department, status, etc.)
  async updateResponsable(id, responsableData) {
    try {
      console.log('=== DEBUG: responsableService.updateResponsable ===');
      console.log('ID:', id);
      console.log('Type of ID:', typeof id);
      console.log('Responsable data:', responsableData);
      console.log('Full request URL:', `/api/responsables/${id}`);
      console.log('Request method: PUT');
      console.log('Request body:', JSON.stringify(responsableData, null, 2));
      
      const response = await apiClient.put(`/api/responsables/${id}`, responsableData);
      
      console.log('=== DEBUG: API Response ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('=== DEBUG: Error in responsableService.updateResponsable ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
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
  },

  // Remove department from responsable (new API)
  async removeDepartmentFromResponsable(responsableId) {
    try {
      const response = await apiClient.put(`/api/responsables/${responsableId}/deactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du département du responsable' };
    }
  },

  // NEW APIs - Reassignment APIs
  async reassignResponsable(departementId, newUserId, annee, modifiedBy, reason = "Réassignation") {
    try {
      const params = new URLSearchParams({
        departementId: departementId.toString(),
        newUserId: newUserId.toString(),
        annee: annee.toString(),
        modifiedBy: modifiedBy,
        reason: reason
      });
      
      console.log('Reassigning department with params:', params.toString());
      const response = await apiClient.post(`/api/responsables/reassign?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error reassigning department:', error);
      throw error.response?.data || { message: 'Erreur lors de la réassignation du responsable' };
    }
  },

  async changeDepartmentResponsible(departementId, newUserId, annee, modifiedBy, reason = "Changement de responsable") {
    try {
      const params = new URLSearchParams({
        departementId: departementId.toString(),
        newUserId: newUserId.toString(),
        annee: annee.toString(),
        modifiedBy: modifiedBy,
        reason: reason
      });
      
      console.log('Changing department with params:', params.toString());
      const response = await apiClient.post(`/api/responsables/change?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error changing department:', error);
      throw error.response?.data || { message: 'Erreur lors du changement de responsable' };
    }
  },

  // NEW APIs - Validation APIs
  async validateUserCanBeResponsible(userId, annee) {
    try {
      const response = await apiClient.get(`/api/responsables/validate/user/${userId}/annee/${annee}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la validation de l\'utilisateur' };
    }
  },

  // NEW APIs - Enhanced Query APIs
  async getUserAssignments(userId) {
    try {
      const response = await apiClient.get(`/api/responsables/user/${userId}/assignments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des assignations utilisateur' };
    }
  },

  async getDepartmentHistory(departementId) {
    try {
      const response = await apiClient.get(`/api/responsables/departement/${departementId}/history`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'historique du département' };
    }
  },

  async getCurrentResponsible(departementId, annee) {
    try {
      const response = await apiClient.get(`/api/responsables/departement/${departementId}/annee/${annee}/current`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du responsable actuel' };
    }
  },

  // NEW APIs - Pagination APIs
  async getActiveResponsablesPaginated(page = 0, size = 10) {
    try {
      const response = await apiClient.get(`/api/responsables/active/paginated?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des responsables actifs' };
    }
  },

  async getResponsablesByYearPaginated(annee, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`/api/responsables/annee/${annee}/paginated?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des responsables par année' };
    }
  },

  // NEW APIs - Audit APIs
  async getAuditByUser(utilisateurModification) {
    try {
      const response = await apiClient.get(`/api/responsables/audit/user/${utilisateurModification}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'audit par utilisateur' };
    }
  },

  async getAuditByDateRange(startDate, endDate) {
    try {
      const response = await apiClient.get(`/api/responsables/audit/dates?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'audit par période' };
    }
  },

  // Update user data (for modifying email, name, matricule)
  async updateUser(userId, userData) {
    try {
      console.log('Updating user with data:', userData);
      const response = await apiClient.put(`/api/utilisateurs/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  }
}; 