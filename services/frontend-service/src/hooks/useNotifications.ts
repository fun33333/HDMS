/**
 * useNotifications Hook
 * Notification management and real-time updates
 */

import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { notificationService } from '../services/api/notificationService';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS, NotificationPayload } from '../config/socketEvents';
import { Notification } from '../types';

export const useNotifications = (autoFetch: boolean = true) => {
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    removeNotification,
    updateUnreadCount,
  } = useNotificationStore();

  const { subscribe, unsubscribe } = useSocket();

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters?: { read?: boolean }) => {
    try {
      const response = await notificationService.getNotifications(filters);
      setNotifications(response.results || []);
      updateUnreadCount(response.unreadCount || 0);
    } catch (error: any) {
      // Handle network errors gracefully - API might not be available
      const isNetworkError = error?.isNetworkError || !error?.response;
      if (isNetworkError) {
        console.warn('API not available, using empty notifications list');
        setNotifications([]);
        updateUnreadCount(0);
      } else {
        console.error('Error fetching notifications:', error?.message || error);
      }
    }
  }, [setNotifications, updateUnreadCount]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      storeMarkAsRead(id);
    } catch (error: any) {
      // If network error, still update local state
      const isNetworkError = error?.isNetworkError || !error?.response;
      if (isNetworkError) {
        storeMarkAsRead(id);
      } else {
        console.error('Error marking notification as read:', error?.message || error);
      }
    }
  }, [storeMarkAsRead]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      storeMarkAllAsRead();
    } catch (error: any) {
      // If network error, still update local state
      const isNetworkError = error?.isNetworkError || !error?.response;
      if (isNetworkError) {
        storeMarkAllAsRead();
      } else {
        console.error('Error marking all as read:', error?.message || error);
      }
    }
  }, [storeMarkAllAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      removeNotification(id);
    } catch (error: any) {
      // If network error, still update local state
      const isNetworkError = error?.isNetworkError || !error?.response;
      if (isNetworkError) {
        removeNotification(id);
      } else {
        console.error('Error deleting notification:', error?.message || error);
      }
    }
  }, [removeNotification]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      updateUnreadCount(count || 0);
    } catch (error: any) {
      // Handle network errors gracefully
      const isNetworkError = error?.isNetworkError || !error?.response;
      if (isNetworkError) {
        // Calculate unread count from local notifications if API unavailable
        const localUnread = notifications.filter(n => !n.read).length;
        updateUnreadCount(localUnread);
      } else {
        console.error('Error refreshing unread count:', error?.message || error);
      }
    }
  }, [updateUnreadCount, notifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    const handleNewNotification = (data: NotificationPayload) => {
      const notification: Notification = {
        id: data.id,
        userId: '', // Set by backend
        type: data.type as any,
        title: data.title,
        message: data.message,
        ticketId: data.ticketId,
        timestamp: data.timestamp,
        read: false,
      };
      
      addNotification(notification);
      refreshUnreadCount();
    };

    subscribe(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      unsubscribe(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    };
  }, [subscribe, unsubscribe, addNotification, refreshUnreadCount]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
      refreshUnreadCount();
    }
  }, [autoFetch, fetchNotifications, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
  };
};

