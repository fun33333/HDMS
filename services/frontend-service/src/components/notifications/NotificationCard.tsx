'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Check, X, Bell } from 'lucide-react';
import { Notification } from '../../types';
import { THEME } from '../../lib/theme';
import { formatRelativeTime } from '../../lib/helpers';
import { useRouter } from 'next/navigation';

interface NotificationCardProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRead,
  onDelete,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    
    if (notification.ticketId) {
      router.push(`/requester/request-detail/${notification.ticketId}`);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'ticket_assigned':
      case 'ticket_completed':
      case 'ticket_approved':
      case 'success':
        return '✅';
      case 'ticket_rejected':
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'success':
      case 'ticket_approved':
      case 'ticket_completed':
        return THEME.colors.success;
      case 'error':
      case 'ticket_rejected':
        return THEME.colors.error;
      case 'warning':
        return THEME.colors.warning;
      default:
        return THEME.colors.info;
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        !notification.read ? 'border-l-4' : 'opacity-75'
      }`}
      style={{
        borderLeftColor: !notification.read ? getNotificationColor() : 'transparent',
      }}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{getNotificationIcon()}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1" style={{ color: THEME.colors.primary }}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400">
                  {formatRelativeTime(notification.timestamp)}
                </p>
              </div>
              
              {!notification.read && (
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: getNotificationColor() }} />
              )}
            </div>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRead}
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Delete"
            >
              <X className="w-4 h-4" style={{ color: THEME.colors.error }} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

