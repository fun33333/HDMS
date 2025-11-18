/**
 * Notification Service
 * All notification-related API calls
 */

import apiClient from './axiosClient';
import { Notification } from '../../types';

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
    
    return apiClient.get<NotificationListResponse>(`/api/notifications/?${params.toString()}`);
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/api/notifications/unread-count/');
    return response.count;
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    return apiClient.post<Notification>(`/api/notifications/${id}/read/`);
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    return apiClient.post('/api/notifications/mark-all-read/');
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete(`/api/notifications/${id}/`);
  }

  // Delete all notifications
  async deleteAllNotifications(): Promise<void> {
    return apiClient.delete('/api/notifications/delete-all/');
  }
}

export const notificationService = new NotificationService();
export default notificationService;

