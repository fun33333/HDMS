"""
Shared HTTP client utilities for inter-service communication.
"""
import requests
import os
from typing import Optional, Dict, Any
from django.conf import settings


class ServiceClient:
    """Base client for calling other microservices."""
    
    def __init__(self, service_url: str, timeout: int = 5):
        self.service_url = service_url.rstrip('/')
        self.timeout = timeout
    
    def _get_headers(self, token: Optional[str] = None) -> Dict[str, str]:
        """Get headers for service requests."""
        headers = {
            'Content-Type': 'application/json',
        }
        if token:
            headers['Authorization'] = f'Bearer {token}'
        return headers
    
    def get(self, endpoint: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Make GET request to another service."""
        url = f"{self.service_url}{endpoint}"
        response = requests.get(
            url,
            headers=self._get_headers(token),
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint: str, data: Dict[str, Any], token: Optional[str] = None) -> Dict[str, Any]:
        """Make POST request to another service."""
        url = f"{self.service_url}{endpoint}"
        response = requests.post(
            url,
            json=data,
            headers=self._get_headers(token),
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()
    
    def put(self, endpoint: str, data: Dict[str, Any], token: Optional[str] = None) -> Dict[str, Any]:
        """Make PUT request to another service."""
        url = f"{self.service_url}{endpoint}"
        response = requests.put(
            url,
            json=data,
            headers=self._get_headers(token),
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()
    
    def patch(self, endpoint: str, data: Dict[str, Any], token: Optional[str] = None) -> Dict[str, Any]:
        """Make PATCH request to another service."""
        url = f"{self.service_url}{endpoint}"
        response = requests.patch(
            url,
            json=data,
            headers=self._get_headers(token),
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()
    
    def delete(self, endpoint: str, token: Optional[str] = None) -> None:
        """Make DELETE request to another service."""
        url = f"{self.service_url}{endpoint}"
        response = requests.delete(
            url,
            headers=self._get_headers(token),
            timeout=self.timeout
        )
        response.raise_for_status()


class UserServiceClient(ServiceClient):
    """Client for User Service."""
    
    def __init__(self):
        super().__init__(os.getenv('USER_SERVICE_URL', 'http://user-service:8001'))
    
    def get_user(self, user_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Get user details by ID."""
        return self.get(f'/api/v1/users/{user_id}/', token)
    
    def validate_user(self, user_id: str, token: Optional[str] = None) -> bool:
        """Validate if user exists."""
        try:
            self.get_user(user_id, token)
            return True
        except requests.HTTPError:
            return False


class TicketServiceClient(ServiceClient):
    """Client for Ticket Service."""
    
    def __init__(self):
        super().__init__(os.getenv('TICKET_SERVICE_URL', 'http://ticket-service:8002'))
    
    def get_ticket(self, ticket_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """Get ticket details by ID."""
        return self.get(f'/api/v1/tickets/{ticket_id}/', token)
    
    def validate_ticket(self, ticket_id: str, token: Optional[str] = None) -> bool:
        """Validate if ticket exists."""
        try:
            self.get_ticket(ticket_id, token)
            return True
        except requests.HTTPError:
            return False


