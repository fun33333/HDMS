"""
File Service API endpoints.
"""
from ninja import Router
from typing import List, Optional
from django.core.files.uploadedfile import UploadedFile
from apps.files.schemas import AttachmentOut, FileUploadResponse
from apps.files.models import Attachment
from apps.files.services.upload_service import UploadService
from core.clients.user_client import UserClient
from core.clients.ticket_client import TicketClient

router = Router(tags=["files"])


@router.post("/upload", response=FileUploadResponse)
def upload_file(request, file: UploadedFile, ticket_id: Optional[str] = None, chat_message_id: Optional[str] = None):
    """Upload a file."""
    # Validate ticket or chat_message exists
    if ticket_id:
        ticket_client = TicketClient()
        if not ticket_client.validate_ticket(ticket_id):
            return {"error": "Ticket not found"}, 404
    
    # Validate user exists
    user_client = UserClient()
    # Get user_id from JWT token (simplified)
    user_id = request.user.id if hasattr(request, 'user') else None
    
    if not user_id:
        return {"error": "User not authenticated"}, 401
    
    # Upload file
    upload_service = UploadService()
    result = upload_service.upload_file(
        file=file,
        ticket_id=ticket_id,
        chat_message_id=chat_message_id,
        uploaded_by_id=str(user_id)
    )
    
    return result


@router.get("/{file_key}", response=AttachmentOut)
def get_file(request, file_key: str):
    """Get file details by file_key."""
    attachment = Attachment.objects.get(file_key=file_key, is_deleted=False)
    return AttachmentOut.from_orm(attachment)


@router.get("/{file_key}/status", response=AttachmentOut)
def get_file_status(request, file_key: str):
    """Get file scan/processing status."""
    attachment = Attachment.objects.get(file_key=file_key, is_deleted=False)
    return AttachmentOut.from_orm(attachment)


@router.get("/{file_key}/download")
def download_file(request, file_key: str):
    """Download file."""
    from django.http import FileResponse
    attachment = Attachment.objects.get(file_key=file_key, is_deleted=False)
    
    if attachment.scan_status != 'clean':
        return {"error": "File not available for download"}, 400
    
    return FileResponse(
        open(attachment.file_path, 'rb'),
        as_attachment=True,
        filename=attachment.original_filename
    )


