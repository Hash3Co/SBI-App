// src/services/notificationService.ts
import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api';
import {
  Notification,
  NotificationPreferences,
  Conversation,
  Message,
  PushDevice,
} from '../types';

class NotificationService {
  // ============ NOTIFICATIONS ============
  
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<{ notifications: Notification[] }>(
      API_ENDPOINTS.notifications.list
    );
    return response.data.notifications;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      API_ENDPOINTS.notifications.unreadCount
    );
    return response.data.count;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.markRead(notificationId));
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.markAllRead);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get(API_ENDPOINTS.notifications.preferences);
    return response.data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notifications.preferences, preferences);
  }

  // ============ CONVERSATIONS ============

  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>(
      API_ENDPOINTS.notifications.conversations
    );
    return response.data;
  }

  async createConversation(participantIds: string[]): Promise<Conversation> {
    const response = await apiClient.post<Conversation>(
      API_ENDPOINTS.notifications.conversations,
      { participants: participantIds }
    );
    return response.data;
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(
      API_ENDPOINTS.notifications.conversationDetail(conversationId)
    );
    return response.data;
  }

  async markConversationRead(conversationId: string): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.notifications.conversationMarkRead(conversationId)
    );
  }

  // ============ MESSAGES ============

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      API_ENDPOINTS.notifications.messages,
      { params: { conversation_id: conversationId } }
    );
    return response.data;
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await apiClient.post<Message>(
      API_ENDPOINTS.notifications.messages,
      { conversation_id: conversationId, content }
    );
    return response.data;
  }

  async getUnreadMessagesCount(): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>(
      API_ENDPOINTS.notifications.messagesUnread
    );
    return response.data.unread_count;
  }

  async markMessageRead(messageId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.messageRead(messageId));
  }

  // ============ PUSH DEVICES ============

  async registerDevice(deviceToken: string, platform: string, deviceName?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.registerDevice, {
      device_token: deviceToken,
      platform,
      device_name: deviceName,
    });
  }

  async getDevices(): Promise<PushDevice[]> {
    const response = await apiClient.get<PushDevice[]>(
      API_ENDPOINTS.notifications.devices
    );
    return response.data;
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.notifications.deleteDevice(deviceId));
  }
}

export default new NotificationService();