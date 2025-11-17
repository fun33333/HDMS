"""
HTTP client for User Service (self-reference for consistency).
"""
import requests
from django.conf import settings


class UserClient:
    """Client for User Service API calls."""
    
    BASE_URL = settings.USER_SERVICE_URL
    
    @classmethod
    def get_user(cls, user_id: str, token: str = None):
        """Get user by ID."""
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        response = requests.get(
            f'{cls.BASE_URL}/api/v1/users/{user_id}',
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    
    @classmethod
    def validate_user(cls, user_id: str, token: str = None) -> bool:
        """Validate if user exists."""
        try:
            cls.get_user(user_id, token)
            return True
        except requests.RequestException:
            return False


