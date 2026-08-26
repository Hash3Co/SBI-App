# apps/notifications/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Notification(models.Model):
    """User notifications"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    
    NOTIFICATION_TYPES = (
        ('match', 'Match'),
        ('message', 'Message'),
        ('system', 'System'),
        ('training', 'Training'),
        ('payment', 'Payment'),
        ('marketplace', 'Marketplace'),
        ('investment', 'Investment'),
        ('follow', 'Follow'),
    )
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)  # Additional data
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Action link
    action_url = models.CharField(max_length=500, blank=True, null=True)
    action_label = models.CharField(max_length=100, blank=True, null=True)
    
    # For push notifications
    sent_push = models.BooleanField(default=False)
    push_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['type']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    @classmethod
    def create_notification(cls, user, type, title, message, data=None, action_url=None, action_label=None):
        """Create a new notification"""
        notification = cls.objects.create(
            user=user,
            type=type,
            title=title,
            message=message,
            data=data or {},
            action_url=action_url,
            action_label=action_label
        )
        return notification

class PushDevice(models.Model):
    """User's push notification devices"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='push_devices')
    
    PLATFORM_CHOICES = (
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
    )
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    
    device_token = models.CharField(max_length=255, unique=True)
    device_name = models.CharField(max_length=255, blank=True)
    
    is_active = models.BooleanField(default=True)
    last_active = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'push_devices'
        ordering = ['-created_at']
        unique_together = ['user', 'device_token']
    
    def __str__(self):
        return f"{self.user.email} - {self.platform}"

class NotificationPreference(models.Model):
    """User's notification preferences"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_match = models.BooleanField(default=True)
    email_message = models.BooleanField(default=True)
    email_system = models.BooleanField(default=True)
    email_training = models.BooleanField(default=True)
    email_payment = models.BooleanField(default=True)
    email_marketplace = models.BooleanField(default=True)
    
    # Push preferences
    push_match = models.BooleanField(default=True)
    push_message = models.BooleanField(default=True)
    push_system = models.BooleanField(default=True)
    push_training = models.BooleanField(default=True)
    push_payment = models.BooleanField(default=True)
    push_marketplace = models.BooleanField(default=True)
    
    # In-app preferences
    inapp_match = models.BooleanField(default=True)
    inapp_message = models.BooleanField(default=True)
    inapp_system = models.BooleanField(default=True)
    inapp_training = models.BooleanField(default=True)
    inapp_payment = models.BooleanField(default=True)
    inapp_marketplace = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
    
    def __str__(self):
        return f"{self.user.email} - Preferences"
    
    @classmethod
    def get_or_create_default(cls, user):
        """Get or create default preferences"""
        preferences, created = cls.objects.get_or_create(user=user)
        return preferences

    