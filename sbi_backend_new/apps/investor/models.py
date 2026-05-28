from django.db import models
from django.conf import settings
import uuid

class InvestorProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investor_profile')
    
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    
    investment_interests = models.JSONField(default=list)
    preferred_industries = models.JSONField(default=list)
    funding_range_min = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    funding_range_max = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    portfolio_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_invested = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    active_investments = models.IntegerField(default=0)
    
    jobs_created = models.IntegerField(default=0)
    smes_supported = models.IntegerField(default=0)
    co2_reduced = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    verification_status = models.CharField(
        max_length=20,
        choices=(('pending', 'Pending'), ('verified', 'Verified'), ('rejected', 'Rejected')),
        default='pending'
    )
    verified_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'investor_profiles'
        
    def __str__(self):
        return f"{self.full_name} - {self.company_name or 'Individual'}"


class Investment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    investor = models.ForeignKey(InvestorProfile, on_delete=models.CASCADE, related_name='investments')
    sme = models.ForeignKey('sme.SMEProfile', on_delete=models.CASCADE, related_name='investments')
    
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    equity_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    status = models.CharField(
        max_length=20,
        choices=(('pending', 'Pending'), ('completed', 'Completed'), ('cancelled', 'Cancelled')),
        default='pending'
    )
    investment_date = models.DateTimeField()
    completed_at = models.DateTimeField(blank=True, null=True)
    
    current_value = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    roi_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'investments'