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
      setNotifications(response.results);
      updateUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [setNotifications, updateUnreadCount]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      storeMarkAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [storeMarkAsRead]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      storeMarkAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [storeMarkAllAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      removeNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [removeNotification]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      updateUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  }, [updateUnreadCount]);

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

