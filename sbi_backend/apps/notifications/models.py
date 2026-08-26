# apps/notifications/models.py
from django.db import models
from django.conf import settings
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
    )
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    action_url = models.CharField(max_length=500, blank=True, null=True)
    action_label = models.CharField(max_length=100, blank=True, null=True)
    
    sent_push = models.BooleanField(default=False)
    push_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"

class Conversation(models.Model):
    """Chat conversation between users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    match_id = models.UUIDField(null=True, blank=True)
    last_message_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'conversations'
        ordering = ['-last_message_at']
    
    def __str__(self):
        return f"Conversation {self.id}"

class Message(models.Model):
    """Individual messages in a conversation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    
    content = models.TextField()
    
    attachment_url = models.URLField(blank=True, null=True)
    attachment_type = models.CharField(max_length=50, blank=True, null=True)
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    STATUS_CHOICES = (
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.email} - {self.content[:50]}"

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
    
    email_match = models.BooleanField(default=True)
    email_message = models.BooleanField(default=True)
    email_system = models.BooleanField(default=True)
    email_training = models.BooleanField(default=True)
    email_payment = models.BooleanField(default=True)
    email_marketplace = models.BooleanField(default=True)
    
    push_match = models.BooleanField(default=True)
    push_message = models.BooleanField(default=True)
    push_system = models.BooleanField(default=True)
    push_training = models.BooleanField(default=True)
    push_payment = models.BooleanField(default=True)
    push_marketplace = models.BooleanField(default=True)
    
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