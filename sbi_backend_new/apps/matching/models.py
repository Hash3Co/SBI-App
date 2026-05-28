# apps/matching/models.py
from django.db import models
from django.conf import settings
import uuid

class Match(models.Model):
    """Connection between SME and Investor"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sme = models.ForeignKey('sme.SMEProfile', on_delete=models.CASCADE, related_name='matches')
    investor = models.ForeignKey('investor.InvestorProfile', on_delete=models.CASCADE, related_name='matches')
    
    match_score = models.DecimalField(max_digits=5, decimal_places=2)  # 0-100
    match_reasoning = models.JSONField(default=dict)  # Breakdown of why matched
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('connected', 'Connected'),
        ('completed', 'Completed'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Communication
    last_message_at = models.DateTimeField(blank=True, null=True)
    messages_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'matches'
        unique_together = [['sme', 'investor']]
        indexes = [
            models.Index(fields=['sme', 'status']),
            models.Index(fields=['investor', 'status']),
            models.Index(fields=['match_score']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Match: {self.sme.business_name} - {self.investor.full_name} ({self.match_score}%)"


class MatchMessage(models.Model):
    """Messages between matched SME and Investor"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'match_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['match', 'created_at']),
            models.Index(fields=['sender', 'is_read']),
        ]


class MatchingQueue(models.Model):
    """Queue for processing matches asynchronously"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=20)  # 'sme' or 'investor'
    entity_id = models.UUIDField()
    status = models.CharField(max_length=20, default='pending')
    processed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'matching_queue'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]