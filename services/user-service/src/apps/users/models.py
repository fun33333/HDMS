"""
User model for User Service.
"""
import sys
import os
from pathlib import Path

# Add shared directory to path for imports
project_root = Path(__file__).resolve().parent.parent.parent.parent.parent
shared_path = project_root / 'shared' / 'core'
if str(shared_path) not in sys.path:
    sys.path.insert(0, str(shared_path))

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# Import shared BaseModel components
try:
    from models import SoftDeleteManager
except ImportError:
    # Fallback if import fails
    from django.db import models as django_models
    class SoftDeleteManager(django_models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(is_deleted=False)


class Role(models.TextChoices):
    """User roles in the system."""
    REQUESTER = 'requester', 'Requester'
    MODERATOR = 'moderator', 'Moderator'
    ASSIGNEE = 'assignee', 'Assignee'
    ADMIN = 'admin', 'Admin'


class UserManager(BaseUserManager):
    """Custom user manager."""
    
    def create_user(self, employee_code, password=None, **extra_fields):
        if not employee_code:
            raise ValueError('The Employee Code must be set')
        user = self.model(employee_code=employee_code, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, employee_code, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.ADMIN)
        return self.create_user(employee_code, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for HDMS.
    Note: Cannot inherit from BaseModel directly due to AbstractBaseUser,
    but uses shared SoftDeleteManager and includes BaseModel fields.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_code = models.CharField(max_length=50, unique=True, db_index=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.REQUESTER, db_index=True)
    is_ceo = models.BooleanField(default=False, db_index=True)
    helpdesk_authorized = models.BooleanField(default=False)
    
    department_id = models.UUIDField(null=True, blank=True, db_index=True)  # Reference to Department
    
    # SMS Integration
    sms_user_id = models.IntegerField(null=True, blank=True)
    last_sms_sync = models.DateTimeField(null=True, blank=True)
    
    # Soft Delete (from BaseModel)
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Django Auth Fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Timestamps (from BaseModel)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = SoftDeleteManager()
    user_manager = UserManager()
    
    USERNAME_FIELD = 'employee_code'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['employee_code']),
            models.Index(fields=['role']),
            models.Index(fields=['department_id']),
            models.Index(fields=['is_deleted', 'role']),
        ]
    
    def __str__(self):
        return f"{self.employee_code} - {self.get_full_name() or 'N/A'}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def soft_delete(self):
        """Soft delete the user."""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def restore(self):
        """Restore a soft-deleted user."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])
