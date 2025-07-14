import apiClient from '../config/api';

export const notificationService = {
  // Get all notifications
  async getAllNotifications() {
    try {
      const response = await apiClient.get('/api/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des notifications' };
    }
  },

  // Get notification by ID
  async getNotificationById(id) {
    try {
      const response = await apiClient.get(`/api/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de la notification' };
    }
  },

  // Create new notification
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post('/api/notifications', notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la notification' };
    }
  },

  // Update notification
  async updateNotification(id, notificationData) {
    try {
      const response = await apiClient.put(`/api/notifications/${id}`, notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la notification' };
    }
  },

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await apiClient.delete(`/api/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la notification' };
    }
  }
}; 