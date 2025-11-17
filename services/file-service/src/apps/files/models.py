"""
Attachment model for File Service.
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


class ScanStatus(models.TextChoices):
    """File scan status."""
    PENDING = 'pending', 'Pending'
    CLEAN = 'clean', 'Clean'
    INFECTED = 'infected', 'Infected'
    FAILED = 'failed', 'Scan Failed'


class Attachment(BaseModel):
    """
    Attachment model for file uploads.
    Can be attached to Ticket OR ChatMessage.
    """
    import uuid
    file_key = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    
    # File Information
    original_filename = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=200)
    file_extension = models.CharField(max_length=20)
    
    # Storage
    file_path = models.CharField(max_length=1000, blank=True)  # Only set after scan passes
    
    # Security & Processing
    scan_status = models.CharField(max_length=20, choices=ScanStatus.choices, default=ScanStatus.PENDING, db_index=True)
    scan_result = models.TextField(blank=True)
    scanned_at = models.DateTimeField(null=True, blank=True)
    
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Relationships (UUID references)
    ticket_id = models.UUIDField(null=True, blank=True, db_index=True)
    chat_message_id = models.UUIDField(null=True, blank=True, db_index=True)
    uploaded_by_id = models.UUIDField(db_index=True)
    
    class Meta:
        db_table = 'attachments'
        verbose_name = 'Attachment'
        verbose_name_plural = 'Attachments'
        indexes = [
            models.Index(fields=['ticket_id']),
            models.Index(fields=['chat_message_id']),
            models.Index(fields=['uploaded_by_id']),
            models.Index(fields=['scan_status']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.original_filename} ({self.file_key})"
    
    def clean(self):
        """Validate that attachment is either ticket-level or message-level."""
        from django.core.exceptions import ValidationError
        if not self.ticket_id and not self.chat_message_id:
            raise ValidationError("Attachment must belong to either a ticket or chat message")
        if self.ticket_id and self.chat_message_id:
            raise ValidationError("Attachment cannot belong to both ticket and chat message")
