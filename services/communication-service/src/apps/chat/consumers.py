"""
WebSocket consumer for chat.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from django.conf import settings
from apps.chat.models import ChatMessage, TicketParticipant


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for ticket chat."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.ticket_id = self.scope['url_route']['kwargs']['ticket_id']
        self.room_group_name = f'chat_{self.ticket_id}'
        
        # Authenticate user from token
        token = self.scope.get('subprotocols', [None])[0] if self.scope.get('subprotocols') else None
        if not token:
            await self.close()
            return
        
        try:
            # Validate JWT token
            UntypedToken(token)
            # Get user from token (simplified - in production, decode and get user)
            self.user_id = await self.get_user_from_token(token)
            
            if not self.user_id:
                await self.close()
                return
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Add participant
            await self.add_participant()
            
        except (InvalidToken, TokenError):
            await self.close()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        data = json.loads(text_data)
        message = data.get('message')
        mentions = data.get('mentions', [])
        
        # Save message to database
        chat_message = await self.save_message(message, mentions)
        
        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': str(chat_message.id),
                    'ticket_id': str(chat_message.ticket_id),
                    'sender_id': str(chat_message.sender_id),
                    'message': chat_message.message,
                    'mentions': chat_message.mentions,
                    'created_at': chat_message.created_at.isoformat(),
                }
            }
        )
    
    async def chat_message(self, event):
        """Receive message from room group."""
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': message
        }))
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Get user ID from JWT token."""
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            return str(access_token['user_id'])
        except:
            return None
    
    @database_sync_to_async
    def save_message(self, message, mentions):
        """Save chat message to database."""
        return ChatMessage.objects.create(
            ticket_id=self.ticket_id,
            sender_id=self.user_id,
            message=message,
            mentions=mentions or []
        )
    
    @database_sync_to_async
    def add_participant(self):
        """Add user as ticket participant."""
        TicketParticipant.objects.get_or_create(
            ticket_id=self.ticket_id,
            user_id=self.user_id
        )


