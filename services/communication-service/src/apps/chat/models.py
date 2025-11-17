"""
Chat models for Communication Service.
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


class ChatMessage(BaseModel):
    """
    Chat message model.
    """
    ticket_id = models.UUIDField(db_index=True)
    sender_id = models.UUIDField(db_index=True)
    message = models.TextField()
    mentions = models.JSONField(default=list, blank=True)  # List of user IDs mentioned
    
    class Meta:
        db_table = 'chat_messages'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        indexes = [
            models.Index(fields=['ticket_id']),
            models.Index(fields=['sender_id']),
            models.Index(fields=['ticket_id', 'created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message #{self.id} - Ticket {self.ticket_id}"


class TicketParticipant(models.Model):
    """
    Ticket participant model (junction table).
    """
    import uuid
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_id = models.UUIDField(db_index=True)
    user_id = models.UUIDField(db_index=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ticket_participants'
        verbose_name = 'Ticket Participant'
        verbose_name_plural = 'Ticket Participants'
        unique_together = [['ticket_id', 'user_id']]
        indexes = [
            models.Index(fields=['ticket_id']),
            models.Index(fields=['user_id']),
        ]
    
    def __str__(self):
        return f"Participant {self.user_id} - Ticket {self.ticket_id}"
