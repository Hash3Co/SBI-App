// src/services/notificationService.ts
import { apiClient } from './api/client';
import { Notification } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  matchAlerts: boolean;
  trainingAlerts: boolean;
  systemAlerts: boolean;
}

class NotificationService {
  async getNotifications(limit?: number, offset?: number): Promise<Notification[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    const response = await apiClient.get<Notification[]>(API_ENDPOINTS.notifications.list, { params });
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.markRead, { notification_id: notificationId });
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.markAllRead);
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(API_ENDPOINTS.notifications.unreadCount);
    return response.data.count;
  }

  async registerPushToken(token: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.registerToken, { token });
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<NotificationPreferences>(`${API_ENDPOINTS.notifications.list}preferences/`);
    return response.data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    await apiClient.put(`${API_ENDPOINTS.notifications.list}preferences/`, preferences);
  }
}

export default new NotificationService();