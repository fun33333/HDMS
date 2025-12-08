"""
Ticket Service API endpoints.
"""
from ninja import Router
from typing import List, Optional
from apps.tickets.schemas import TicketOut, TicketIn, TicketUpdateIn, StatusUpdateIn
from apps.tickets.models.ticket import Ticket
from apps.tickets.models.sub_ticket import SubTicket
from core.clients.user_client import UserClient
from apps.tickets.services.ticket_service import TicketService

router = Router(tags=["tickets"])


@router.post("/", response=TicketOut)
def create_ticket(request, payload: TicketIn):
    """Create a new ticket."""
    # Validate user exists
    user_client = UserClient()
    if not user_client.validate_user_exists(payload.requestor_id):
        return {"error": "requestor not found"}, 404
    
    ticket = Ticket.objects.create(
        title=payload.title,
        description=payload.description,
        requestor_id=payload.requestor_id,
        department_id=payload.department_id,
        priority=payload.priority,
        category=payload.category,
        status=payload.status or 'draft',
    )
    return TicketOut.from_orm(ticket)


@router.get("/", response=List[TicketOut])
def list_tickets(request, status: Optional[str] = None, requestor_id: Optional[str] = None):
    """List tickets with optional filters."""
    queryset = Ticket.objects.all()
    
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
        return {"error": str(e)}, 400
    
    return TicketOut.from_orm(ticket)


@router.get("/{ticket_id}/sub-tickets", response=List[TicketOut])
def list_sub_tickets(request, ticket_id: str):
    """List sub-tickets for a ticket."""
    sub_tickets = SubTicket.objects.filter(parent_ticket_id=ticket_id, is_deleted=False)
    return [TicketOut.from_orm(st) for st in sub_tickets]

