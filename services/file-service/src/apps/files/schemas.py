"""
Pydantic schemas for File Service.
"""
from ninja import Schema
from typing import Optional
from datetime import datetime


class AttachmentOut(Schema):
    """Attachment output schema."""
    id: str
    file_key: str
    original_filename: str
    file_size: int
    mime_type: str
    file_extension: str
    scan_status: str
    scan_result: str
    scanned_at: Optional[datetime]
    is_processed: bool
    processed_at: Optional[datetime]
    ticket_id: Optional[str]
    chat_message_id: Optional[str]
    uploaded_by_id: str
    created_at: datetime


class FileUploadResponse(Schema):
    """File upload response schema."""
    file_key: str
    message: str
    scan_status: str


