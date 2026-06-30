from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    """Custom user model - simplified"""
    supabase_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    ROLE_CHOICES = (
        ('sme', 'Small/Medium Enterprise'),
        ('investor', 'Investor'),
        ('admin', 'Administrator'),
        ('moderator', 'Moderator'),
    )
    
    # Email is required and unique
    email = models.EmailField(unique=True)
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sme')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location_region = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Django needs this
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return self.email