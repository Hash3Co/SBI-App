# apps/notifications/messaging_models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

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
    
    def get_last_message(self):
        return self.messages.order_by('-created_at').first()
    
    def get_unread_count(self, user):
        return self.messages.filter(is_read=False).exclude(sender=user).count()
    
    def mark_all_read(self, user):
        self.messages.filter(is_read=False).exclude(sender=user).update(
            is_read=True,
            read_at=timezone.now()
        )

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
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.sender.email} - {self.content[:50]}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.status = 'read'
            self.save()