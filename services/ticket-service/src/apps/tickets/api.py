"""
Ticket Service API endpoints.
"""
from ninja import Router, File, UploadedFile
from ninja.errors import HttpError
from typing import List, Optional
from apps.tickets.schemas import TicketOut, TicketIn, TicketUpdateIn, StatusUpdateIn, AttachmentOut
from apps.tickets.models.ticket import Ticket
from apps.tickets.models.sub_ticket import SubTicket
from apps.tickets.models.attachment import Attachment
from core.clients.user_client import UserClient
from apps.tickets.services.ticket_service import TicketService
from apps.tickets.schemas import AssignTicketIn, RejectTicketIn, PostponeTicketIn
   

router = Router(tags=["tickets"])


@router.post("/", response=TicketOut)
def create_ticket(request, payload: TicketIn):
    """Create a new ticket."""
    # TODO: Re-enable user validation when auth-service is integrated
    # user_client = UserClient()
    # if not user_client.validate_user_exists(payload.requestor_id):
    #     raise HttpError(404, "Requestor not found")
    
    ticket = Ticket.objects.create(
        title=payload.title,
        description=payload.description,
        requestor_id=payload.requestor_id,
        department_id=payload.department_id,
        priority=payload.priority,
        category=payload.category,
        status=payload.status or 'draft',
    )
    return ticket


@router.get("/", response=List[TicketOut])
def list_tickets(request, status: Optional[str] = None, requestor_id: Optional[str] = None, exclude_drafts: bool = True):
    """List tickets with optional filters.
    
    Args:
        status: Filter by specific status
        requestor_id: Filter by requestor (if provided, shows drafts)
        exclude_drafts: Exclude draft tickets (default True for moderator view)
    """
    queryset = Ticket.objects.all()
    
    # Exclude drafts unless viewing own tickets
    if exclude_drafts and not requestor_id:
        queryset = queryset.exclude(status='draft')
    
    if status:
        queryset = queryset.filter(status=status)
    if requestor_id:
        queryset = queryset.filter(requestor_id=requestor_id)
    
    return [TicketOut.from_orm(ticket) for ticket in queryset]



@router.get("/{ticket_id}", response=TicketOut)
def get_ticket(request, ticket_id: str):
    """Get ticket by ID."""
    ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    return TicketOut.from_orm(ticket)


@router.patch("/{ticket_id}", response=TicketOut)
def update_ticket(request, ticket_id: str, payload: TicketUpdateIn):
    """Update ticket."""
    ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(ticket, field, value)
    
    ticket.save()
    return TicketOut.from_orm(ticket)


@router.post("/{ticket_id}/status", response=TicketOut)
def update_status(request, ticket_id: str, payload: StatusUpdateIn):
    """Update ticket status using FSM."""
    ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    
    # Get transition method
    transition_method = getattr(ticket, payload.action, None)
    if not transition_method:
        return {"error": f"Invalid action: {payload.action}"}, 400
    
    # Execute transition
    try:
        if payload.reason:
            transition_method(payload.reason)
        else:
            transition_method()
        ticket.save()
    except Exception as e:
        # Idempotency check: if action matches current state, consider it a success
        if payload.action == 'submit' and ticket.status == 'submitted':
            return TicketOut.from_orm(ticket)
        if payload.action == 'postpone' and ticket.status == 'postponed':
            return TicketOut.from_orm(ticket)
        if payload.action == 'reject' and ticket.status == 'rejected':
            return TicketOut.from_orm(ticket)
            
        return {"error": str(e)}, 400
    
    return TicketOut.from_orm(ticket)


@router.get("/{ticket_id}/sub-tickets", response=List[TicketOut])
def list_sub_tickets(request, ticket_id: str):
    """List sub-tickets for a ticket."""
    sub_tickets = SubTicket.objects.filter(parent_ticket_id=ticket_id, is_deleted=False)
    return [TicketOut.from_orm(st) for st in sub_tickets]

@router.post("/{ticket_id}/attachments", response=AttachmentOut)
def upload_attachment(request, ticket_id: str, file: UploadedFile = File(...)):
    """Upload an attachment for a ticket."""
    try:
        ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    except Ticket.DoesNotExist:
        raise HttpError(404, "Ticket not found")

    attachment = Attachment.objects.create(
        ticket=ticket,
        file=file,
        filename=file.name,
        file_size=file.size,
        content_type=file.content_type
    )
    return attachment

@router.post("/{ticket_id}/assign", response=TicketOut)
def assign_ticket(request, ticket_id: str, payload: AssignTicketIn):
    """Assign ticket to an assignee."""
    try:
        ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    except Ticket.DoesNotExist:
        raise HttpError(404, "Ticket not found")
    
    # Set assignee
    ticket.assignee_id = payload.assignee_id
    if payload.department_id:
        ticket.department_id = payload.department_id
    
    # Handle FSM transitions based on current status
    try:
        if ticket.status == 'draft':
            ticket.submit()  # draft -> submitted
            ticket.review()  # submitted -> under_review
            ticket.assign()  # under_review -> assigned
        elif ticket.status == 'submitted':
            ticket.review()
            ticket.assign()
        elif ticket.status in ['pending', 'under_review']:
            ticket.assign()
        # If already assigned or in_progress, just update assignee without transition
    except Exception as e:
        raise HttpError(400, f"Cannot assign ticket: {str(e)}")
    
    ticket.save()
    return ticket

    
@router.post("/{ticket_id}/reject", response=TicketOut)
def reject_ticket(request, ticket_id: str, payload: RejectTicketIn):
    """Reject a ticket with reason."""
    try:
        ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    except Ticket.DoesNotExist:
        raise HttpError(404, "Ticket not found")
    
    # Use FSM transition
    try:
        ticket.reject(payload.reason)
        ticket.save()
    except Exception as e:
        raise HttpError(400, f"Cannot reject ticket: {str(e)}")
    
    return ticket


@router.post("/{ticket_id}/postpone", response=TicketOut)
def postpone_ticket(request, ticket_id: str, payload: PostponeTicketIn):
    """Postpone a ticket with reason."""
    try:
        ticket = Ticket.objects.get(id=ticket_id, is_deleted=False)
    except Ticket.DoesNotExist:
        raise HttpError(404, "Ticket not found")
    
    ticket.postpone(payload.reason)
    ticket.save()
    return ticket