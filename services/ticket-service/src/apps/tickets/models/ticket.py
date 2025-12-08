"""
Ticket model for Ticket Service.
"""
import sys
from pathlib import Path
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django_fsm import FSMField, transition
from django.utils import timezone

# Add shared directory to Python path (needed before model imports)
docker_shared_path = Path('/shared/core')
local_shared_path = Path(__file__).resolve().parent.parent.parent.parent.parent.parent.parent / 'shared' / 'core'
shared_path = docker_shared_path if docker_shared_path.exists() else local_shared_path
if str(shared_path) not in sys.path:
    sys.path.insert(0, str(shared_path))

from models import BaseModel


class TicketStatus(models.TextChoices):
    """Ticket status choices."""
    DRAFT = 'draft', 'Draft'
    SUBMITTED = 'submitted', 'Submitted'
    PENDING = 'pending', 'Pending'
    UNDER_REVIEW = 'under_review', 'Under Review'
    ASSIGNED = 'assigned', 'Assigned'
    IN_PROGRESS = 'in_progress', 'In Progress'
    WAITING_APPROVAL = 'waiting_approval', 'Waiting Approval'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    RESOLVED = 'resolved', 'Resolved'
    CLOSED = 'closed', 'Closed'
    REOPENED = 'reopened', 'Reopened'
    POSTPONED = 'postponed', 'Postponed'


class Priority(models.TextChoices):
    """Priority choices."""
    HIGH = 'high', 'High'
    MEDIUM = 'medium', 'Medium'
    LOW = 'low', 'Low'


class Ticket(BaseModel):
    """
    Ticket model with FSM for status management.
    """
    title = models.CharField(max_length=500)
    description = models.TextField()
    
    # Status with FSM
    status = FSMField(default=TicketStatus.DRAFT, protected=True, db_index=True)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM, db_index=True)
    category = models.CharField(max_length=100, blank=True)
    
    # Relationships (UUID references, not ForeignKeys)
    requestor_id = models.UUIDField(db_index=True)
    department_id = models.UUIDField(null=True, blank=True, db_index=True)
    assignee_id = models.UUIDField(null=True, blank=True, db_index=True)
    
    # Dates
    due_at = models.DateTimeField(null=True, blank=True)
    
    # Version and Reopen
    version = models.IntegerField(default=1)
    reopen_count = models.IntegerField(default=0)
    
    # Approval
    requires_approval = models.BooleanField(default=False)
    postponement_reason = models.TextField(blank=True)
    
    # Progress
    progress_percent = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'tickets'
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['requestor_id']),
            models.Index(fields=['department_id']),
            models.Index(fields=['assignee_id']),
            models.Index(fields=['is_deleted', 'status']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"#{self.id} - {self.title}"
    
    def increment_version(self):
        """Increment version on reopen."""
        if self.pk:
            current = Ticket.objects.get(pk=self.pk)
            self.version = current.version + 1
        else:
            self.version = 1
    
    # FSM Transitions
    @transition(field=status, source=TicketStatus.DRAFT, target=TicketStatus.SUBMITTED)
    def submit(self):
        """Submit ticket."""
        pass
    
    @transition(field=status, source=[TicketStatus.SUBMITTED, TicketStatus.PENDING], target=TicketStatus.UNDER_REVIEW)
    def review(self):
        """Start review."""
        pass
    
    @transition(field=status, source=TicketStatus.UNDER_REVIEW, target=TicketStatus.ASSIGNED)
    def assign(self):
        """Assign ticket."""
        pass
    
    @transition(field=status, source=TicketStatus.ASSIGNED, target=TicketStatus.IN_PROGRESS)
    def start_progress(self):
        """Start working on ticket."""
        pass
    
    @transition(field=status, source=TicketStatus.IN_PROGRESS, target=TicketStatus.RESOLVED)
    def resolve(self):
        """Mark as resolved."""
        pass
    
    @transition(field=status, source=TicketStatus.RESOLVED, target=TicketStatus.CLOSED)
    def close(self):
        """Close ticket."""
        pass
    
    @transition(field=status, source=[TicketStatus.CLOSED, TicketStatus.RESOLVED], target=TicketStatus.REOPENED)
    def reopen(self):
        """Reopen ticket (max 3 times)."""
        if self.reopen_count >= 3:
            raise ValueError("Maximum reopen limit reached")
        self.reopen_count += 1
        self.increment_version()
    
    @transition(field=status, source=[TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS], target=TicketStatus.POSTPONED)
    def postpone(self, reason: str = ""):
        """Postpone ticket."""
        self.postponement_reason = reason
