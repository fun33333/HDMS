"""
User Service client for Communication Service.
"""
import requests
from django.conf import settings


class UserClient:
    """Client to communicate with User Service."""
    
    BASE_URL = settings.USER_SERVICE_URL
    
    @classmethod
    def get_user(cls, user_id: str, token: str = None):
        """Get user details from User Service."""
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            response = requests.get(
                f'{cls.BASE_URL}/api/v1/users/{user_id}',
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return None
    
    @classmethod
    def validate_user(cls, user_id: str, token: str = None) -> bool:
        """Validate if user exists in User Service."""
        return cls.get_user(user_id, token) is not None
