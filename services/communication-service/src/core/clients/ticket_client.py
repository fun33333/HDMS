"""
Ticket Service client for Communication Service.
"""
import requests
from django.conf import settings


class TicketClient:
    """Client to communicate with Ticket Service."""
    
    BASE_URL = settings.TICKET_SERVICE_URL
    
    @classmethod
    def get_ticket(cls, ticket_id: str, token: str = None):
        """Get ticket details from Ticket Service."""
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            response = requests.get(
                f'{cls.BASE_URL}/api/v1/tickets/{ticket_id}',
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return None
    
    @classmethod
    def validate_ticket(cls, ticket_id: str, token: str = None) -> bool:
        """Validate if ticket exists in Ticket Service."""
        return cls.get_ticket(ticket_id, token) is not None
