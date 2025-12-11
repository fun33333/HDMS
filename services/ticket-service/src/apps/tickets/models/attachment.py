from django.db import models
from .ticket import Ticket
from models import BaseModel

class Attachment(BaseModel):
    """
    Attachment model for tickets.
    """
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    content_type = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'ticket_attachments'
        verbose_name = 'Attachment'
        verbose_name_plural = 'Attachments'

    def __str__(self):
        return self.filename
