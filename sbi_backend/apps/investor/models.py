# apps/investor/models.py
from django.db import models
from django.conf import settings
import uuid

class InvestorProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investor_profile')
    
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Investment Preferences
    investment_interests = models.JSONField(default=list)
    preferred_industries = models.JSONField(default=list)
    
    # Funding Range
    funding_range_min = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    funding_range_max = models.DecimalField(max_digits=15, decimal_places=2, default=1000000)
    
    portfolio_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    verification_status = models.CharField(max_length=20, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'investor_profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.full_name


class Investment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    investor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investments_made')
    sme = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investments_received')
    
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    equity = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    roi = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('declined', 'Declined'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'investments'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.investor.email} - {self.sme.email} - {self.amount}"

class InvestorActivityLog(models.Model):
    """Activity log for investor actions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    investor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investor_activities')
    
    ACTION_CHOICES = (
        ('profile_update', 'Profile Updated'),
        ('investment_made', 'Investment Made'),
        ('match_view', 'Match Viewed'),
        ('match_connect', 'Match Connected'),
        ('portfolio_view', 'Portfolio Viewed'),
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'investor_activity_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.investor.email} - {self.action} - {self.created_at}"