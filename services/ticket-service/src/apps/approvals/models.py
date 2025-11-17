"""
Approval model for Ticket Service.
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


class ApprovalStatus(models.TextChoices):
    """Approval status choices."""
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class Approval(BaseModel):
    """
    Approval model for financial ticket approvals.
    """
    ticket_id = models.UUIDField(db_index=True)
    approver_id = models.UUIDField(db_index=True)  # CEO or Finance head
    status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING, db_index=True)
    reason = models.TextField(blank=True)
    documents = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'approvals'
        verbose_name = 'Approval'
        verbose_name_plural = 'Approvals'
        indexes = [
            models.Index(fields=['ticket_id']),
            models.Index(fields=['approver_id']),
            models.Index(fields=['status']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Approval #{self.id} - {self.status}"
