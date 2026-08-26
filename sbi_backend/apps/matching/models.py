# apps/matching/models.py
from django.db import models
from django.conf import settings
import uuid

class Match(models.Model):
    """Matches between SME and Investor"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sme = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sme_matches')
    investor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investor_matches')
    
    match_score = models.IntegerField(default=0)
    match_breakdown = models.JSONField(default=dict)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('connected', 'Connected'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    connected_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'matches'
        ordering = ['-match_score', '-created_at']
        unique_together = ['sme', 'investor']
    
    def __str__(self):
        return f"{self.sme.email} - {self.investor.email} - {self.match_score}%"

class MatchPreference(models.Model):
    """User's match preferences"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='match_preferences')
    
    industries = models.JSONField(default=list)
    location = models.CharField(max_length=255, blank=True)
    funding_range_min = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    funding_range_max = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Weight adjustments
    industry_weight = models.IntegerField(default=25)
    location_weight = models.IntegerField(default=15)
    funding_weight = models.IntegerField(default=20)
    readiness_weight = models.IntegerField(default=15)
    interest_weight = models.IntegerField(default=10)
    impact_weight = models.IntegerField(default=10)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'match_preferences'
    
    def __str__(self):
        return f"{self.user.email}'s Preferences"

class MatchMessage(models.Model):
    """Messages between matched parties"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_match_messages')
    
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'match_messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.email} - {self.match.id} - {self.created_at}"

class MatchingQueue(models.Model):
    """Queue for processing matches asynchronously"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matching_queue')
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    processed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'matching_queue'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.status} - {self.created_at}"