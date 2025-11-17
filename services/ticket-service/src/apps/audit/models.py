"""
AuditLog model for Ticket Service.
Global audit logging for all database changes.
"""
import sys
from pathlib import Path

# Add shared directory to path
project_root = Path(__file__).resolve().parent.parent.parent.parent.parent
shared_path = project_root / 'shared' / 'core'
if str(shared_path) not in sys.path:
    sys.path.insert(0, str(shared_path))

from django.db import models
from django.utils import timezone

# Import BaseModel from shared
try:
    from models import BaseModel
except ImportError:
    # Fallback - create minimal BaseModel
    import uuid
    from django.db import models as django_models
    class BaseModel(django_models.Model):
        id = django_models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        is_deleted = django_models.BooleanField(default=False, db_index=True)
        deleted_at = django_models.DateTimeField(null=True, blank=True)
        created_at = django_models.DateTimeField(auto_now_add=True)
        updated_at = django_models.DateTimeField(auto_now=True)
        class Meta:
            abstract = True


class ActionType(models.TextChoices):
    """Audit action types."""
    CREATE = 'create', 'Create'
    UPDATE = 'update', 'Update'
    DELETE = 'delete', 'Delete'
    SOFT_DELETE = 'soft_delete', 'Soft Delete'
    RESTORE = 'restore', 'Restore'


class AuditCategory(models.TextChoices):
    """Audit log categories."""
    TICKET = 'ticket', 'Ticket'
    SUBTICKET = 'subticket', 'SubTicket'
    USER = 'user', 'User'
    DEPARTMENT = 'department', 'Department'
    APPROVAL = 'approval', 'Approval'
    ATTACHMENT = 'attachment', 'Attachment'
    CHAT = 'chat', 'Chat'
    NOTIFICATION = 'notification', 'Notification'
    SYSTEM = 'system', 'System'


class AuditLog(models.Model):
    """
    Global audit log model for tracking all database changes.
    Immutable, categorized, and timestamped.
    """
    import uuid
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Action details
    action_type = models.CharField(max_length=20, choices=ActionType.choices, db_index=True)
    category = models.CharField(max_length=50, choices=AuditCategory.choices, db_index=True)
    
    # Model information
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.UUIDField(db_index=True)
    
    # State tracking
    old_state = models.JSONField(default=dict, blank=True, help_text="State before change")
    new_state = models.JSONField(default=dict, blank=True, help_text="State after change")
    changes = models.JSONField(default=dict, blank=True, help_text="Fields that changed")
    
    # User and context
    performed_by_id = models.UUIDField(null=True, blank=True, db_index=True)
    reason = models.TextField(blank=True, help_text="Reason for change")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Timestamp
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    
    # Archival
    archived_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['category', 'action_type']),
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['performed_by_id']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['archived_at']),
            models.Index(fields=['category', 'timestamp']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action_type} {self.model_name} #{self.object_id} - {self.timestamp}"


