import { apiClient } from './api/client';
import { Notification } from '../types';
import { API_ENDPOINTS } from '../config/api';

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications/');
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(`/notifications/${notificationId}/read/`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all/');
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/notifications/unread-count/');
    return response.data;
  }

  async registerPushToken(token: string): Promise<void> {
    await apiClient.post('/notifications/register-token/', { token });
  }
}

export default new NotificationService();