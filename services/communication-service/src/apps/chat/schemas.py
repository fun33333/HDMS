"""
Pydantic schemas for Chat Service.
"""
from ninja import Schema
from typing import List
from datetime import datetime


from uuid import UUID

class ChatMessageOut(Schema):
    """Chat message output schema."""
    id: UUID
    ticket_id: UUID
    sender_id: UUID
    message: str
    mentions: List[str]
    created_at: datetime


class ChatMessageIn(Schema):
    """Chat message input schema."""
    ticket_id: str
    sender_id: str
    message: str
    mentions: List[str] = []


