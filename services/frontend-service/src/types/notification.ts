/**
 * Notification Type Definitions
 */

export type NotificationType = 
  | 'ticket_assigned' 
  | 'ticket_completed' 
  | 'ticket_rejected' 
  | 'ticket_approved'
  | 'ticket_updated'
  | 'ticket_comment'
  | 'ticket_reassigned'
  | 'new_comment' 
  | 'success' 
  | 'warning' 
  | 'error'
  | 'info';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string;
  timestamp: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]?: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationListResponse {
  results: Notification[];
  count: number;
  unreadCount: number;
  next: string | null;
  previous: string | null;
}

