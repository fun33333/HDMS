/**
 * Notification Service
 * All notification-related API calls
 */

import apiClient from './axiosClient';
import { Notification } from '../../types';
import { ENV } from '../../config/env';

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationListResponse {
  results: Notification[];
  count: number;
  next: string | null;
  previous: string | null;
  unreadCount: number;
}

class NotificationService {
  // Get all notifications
  async getNotifications(filters?: NotificationFilters): Promise<NotificationListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return apiClient.get<NotificationListResponse>(`${ENV.COMMUNICATION_SERVICE_URL}/api/v1/notifications/?${params.toString()}`);
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`${ENV.COMMUNICATION_SERVICE_URL}/api/v1/notifications/unread-count/`);
    return response.count;
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    return apiClient.post<Notification>(`${ENV.COMMUNICATION_SERVICE_URL}/api/v1/notifications/${id}/read/`);
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    return apiClient.post(`${ENV.COMMUNICATION_SERVICE_URL}/api/v1/notifications/mark-all-read/`);
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete(`${ENV.COMMUNICATION_SERVICE_URL}/api/v1/notifications/${id}/`);
  }

  // Delete all notifications
  async deleteAllNotifications(): Promise<void> {
    return apiClient.delete(`${ENV.COMMUNICATION_SERVICE_URL}/api/v1/notifications/delete-all/`);
  }
}

export const notificationService = new NotificationService();
export default notificationService;

