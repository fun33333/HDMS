'use client';

import React from 'react';
import { useNotifications } from '../../../../hooks/useNotifications';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { NotificationCard } from '../../../../components/notifications/NotificationCard';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/card';
import { SkeletonLoader } from '../../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { CheckCheck, Trash2 } from 'lucide-react';
import { THEME } from '../../../../lib/theme';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(true);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <PageWrapper
      title="Notifications"
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      actions={
        unreadCount > 0 && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.primary }}>
              Unread ({unreadNotifications.length})
            </h2>
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.gray }}>
              Read ({readNotifications.length})
            </h2>
            <div className="space-y-3">
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                title="No Notifications"
                description="You don't have any notifications yet."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

