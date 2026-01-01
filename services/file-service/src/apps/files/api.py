from ninja import Router
from ninja.errors import HttpError
from typing import List, Optional
from django.core.files.uploadedfile import UploadedFile
from apps.files.schemas import AttachmentOut, FileUploadResponse
from apps.files.models import Attachment
from apps.files.services.upload_service import UploadService
from core.clients.user_client import UserClient
from core.clients.ticket_client import TicketClient

from rest_framework_simplejwt.authentication import JWTAuthentication
from ninja.security import HttpBearer

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            auth = JWTAuthentication()
            validated_token = auth.get_validated_token(token)
            
            # JIT Sync: Ensure user exists locally
            user_id = validated_token.get('user_id')
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                # Provision user from token
                payload = validated_token
                full_name = payload.get('full_name', '')
                names = full_name.split(' ')
                user = User.objects.create(
                    id=user_id,
                    employee_code=payload.get('employee_code'),
                    first_name=names[0] if names else '',
                    last_name=' '.join(names[1:]) if len(names) > 1 else '',
                    email=payload.get('email'),
                    role=payload.get('role', 'requestor'),
                    is_active=payload.get('is_active', True)
                )
                print(f"✅ JIT synced user in File API: {user.employee_code}")
                
            return user
        except Exception as e:
            print(f"DEBUG File API: Auth failed: {str(e)}")
            return None

router = Router(tags=["files"], auth=JWTAuth())


@router.post("/upload", response=FileUploadResponse)
def upload_file(request, ticket_id: Optional[str] = None, chat_message_id: Optional[str] = None):
    """Upload a file."""
    # Get file from request.FILES
    if 'file' not in request.FILES:
        raise HttpError(400, "No file provided")
    
    file = request.FILES['file']
    
    # Validate ticket or chat_message exists
    if ticket_id:
        ticket_client = TicketClient()
        if not ticket_client.validate_ticket(ticket_id):
            raise HttpError(404, "Ticket not found")
    
    # Validate user exists
    user_client = UserClient()
    # Get user_id from JWT token (simplified)
    user_id = request.user.id if hasattr(request, 'user') else None
    
    if not user_id:
        raise HttpError(401, "User not authenticated")
    
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
        raise HttpError(400, "File not available for download")

    
    return FileResponse(
        open(attachment.file_path, 'rb'),
        as_attachment=True,
        filename=attachment.original_filename
    )


