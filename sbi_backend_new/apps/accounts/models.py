# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import check_password
from django.db import models
from django.utils import timezone
import uuid

class User(AbstractUser):
    """Custom user model with sharding support"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    ROLE_CHOICES = (
        ('sme', 'Small/Medium Enterprise'),
        ('investor', 'Investor'),
        ('admin', 'Administrator'),
        ('moderator', 'Moderator'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sme')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location_region = models.CharField(max_length=100, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, blank=True, null=True)
    reset_token = models.CharField(max_length=255, blank=True, null=True)
    reset_token_expires = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    device_fingerprint = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['location_region']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @classmethod
    def get_shard(cls, instance=None):
        """Determine shard for this user based on location"""
        from django.conf import settings
        if instance and instance.location_region:
            # Get shard from settings SHARD_REGIONS
            shard = settings.SHARD_REGIONS.get(instance.location_region.lower(), 'default')
            return shard
        return 'default'

    # Security fields
    failed_login_attempts = models.IntegerField(default=0)
    device_fingerprint_hash = models.CharField(max_length=255, blank=True, null=True)
    session_token = models.CharField(max_length=255, blank=True, null=True)
    session_expires_at = models.DateTimeField(blank=True, null=True)
    
    # Account lockout
    is_locked = models.BooleanField(default=False)
    locked_until = models.DateTimeField(blank=True, null=True)
    
    # MFA (future)
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)
    
    # Password history (prevent reuse)
    password_history = models.JSONField(default=list)
    
    def save(self, *args, **kwargs):
        # Track password history
        if self.pk:
            old = User.objects.get(pk=self.pk)
            if old.password != self.password:
                history = old.password_history or []
                history.append({
                    'hash': old.password,
                    'changed_at': timezone.now().isoformat()
                })
                # Keep last 5 passwords
                self.password_history = history[-5:]
        super().save(*args, **kwargs)
    
    def is_password_reused(self, new_password):
        """Check if password was used before"""
        for entry in self.password_history or []:
            if check_password(new_password, entry['hash']):
                return True
        return False

class UserSession(models.Model):
    """Track user sessions across shards"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_token = models.CharField(max_length=255, unique=True)
    device_info = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_sessions'
        indexes = [
            models.Index(fields=['session_token']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['expires_at']),
        ]
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class LoginAttempt(models.Model):
    """Track login attempts for security"""
    
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'login_attempts'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['attempted_at']),
        ]