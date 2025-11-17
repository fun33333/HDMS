"""
Notification API endpoints.
"""
from ninja import Router
from typing import List
from apps.notifications.schemas import NotificationOut
from apps.notifications.models import Notification

router = Router(tags=["notifications"])


@router.get("/", response=List[NotificationOut])
def list_notifications(request, user_id: str, unread_only: bool = False):
    """List notifications for a user."""
    queryset = Notification.objects.filter(user_id=user_id, is_deleted=False)
    
    if unread_only:
        queryset = queryset.filter(is_read=False)
    
    return [NotificationOut.from_orm(notif) for notif in queryset]


@router.post("/{notification_id}/read", response=NotificationOut)
def mark_as_read(request, notification_id: str):
    """Mark notification as read."""
    notification = Notification.objects.get(id=notification_id, is_deleted=False)
    notification.mark_as_read()
    return NotificationOut.from_orm(notification)


