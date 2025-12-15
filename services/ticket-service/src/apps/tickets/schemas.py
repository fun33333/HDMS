"""
Pydantic schemas for Ticket Service.
"""
from uuid import UUID
from ninja import Schema
from typing import Optional, List
from datetime import datetime


class AttachmentOut(Schema):
    id: UUID
    filename: str
    file_size: int
    content_type: str
    created_at: datetime
    file: str

class TicketOut(Schema):
    """Ticket output schema."""
    id: UUID
    ticket_id: Optional[str] = None  
    title: str
    description: str
    status: str
    priority: str
    category: str
    requestor_id: UUID
    department_id: Optional[UUID]
    assignee_id: Optional[UUID]
    due_at: Optional[datetime]
    version: int
    reopen_count: int
    requires_approval: bool
    progress_percent: int
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentOut] = []


class TicketIn(Schema):
    """Ticket input schema."""
    title: str
    description: str
    requestor_id: str
    department_id: Optional[str] = None
    priority: str = "medium"
    category: str = ""
    status: Optional[str] = None


class TicketUpdateIn(Schema):
    """Ticket update schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assignee_id: Optional[str] = None
    department_id: Optional[str] = None
    progress_percent: Optional[int] = None


class StatusUpdateIn(Schema):
    """Status update schema."""
    action: str  # submit, review, assign, start_progress, resolve, close, reopen, postpone
    reason: Optional[str] = None


class AssignTicketIn(Schema):
    """Schema for assigning a ticket."""
    assignee_id: str
    department_id: Optional[str] = None

class RejectTicketIn(Schema):
    """Schema for rejecting a ticket."""
    reason: str

class PostponeTicketIn(Schema):
    """Schema for postponing a ticket."""
    reason: str