"""
Department model for User Service.
"""
import sys
from pathlib import Path

# Add shared directory to path
project_root = Path(__file__).resolve().parent.parent.parent.parent.parent
shared_path = project_root / 'shared' / 'core'
if str(shared_path) not in sys.path:
    sys.path.insert(0, str(shared_path))

from django.db import models
from django.utils import timezone

# Import BaseModel from shared
try:
    from models import BaseModel
except ImportError:
    # Fallback - create minimal BaseModel
    import uuid
    from django.db import models as django_models
    class BaseModel(django_models.Model):
        id = django_models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        is_deleted = django_models.BooleanField(default=False, db_index=True)
        deleted_at = django_models.DateTimeField(null=True, blank=True)
        created_at = django_models.DateTimeField(auto_now_add=True)
        updated_at = django_models.DateTimeField(auto_now=True)
        class Meta:
            abstract = True


class Department(BaseModel):
    """
    Department model.
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    head_id = models.UUIDField(null=True, blank=True, db_index=True)  # Reference to User
    active_tickets = models.IntegerField(default=0)
    total_capacity = models.IntegerField(default=100)
    queue_enabled = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['code']),
            models.Index(fields=['head_id']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return self.name
