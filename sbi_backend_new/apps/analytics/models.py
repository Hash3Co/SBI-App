from django.db import models
from django.conf import settings
import uuid

class PlatformMetric(models.Model):
    """Platform-wide analytics metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    METRIC_TYPES = (
        ('users', 'User Count'),
        ('smes', 'SME Count'),
        ('investors', 'Investor Count'),
        ('matches', 'Match Count'),
        ('investments', 'Investment Amount'),
        ('courses', 'Course Enrollments'),
        ('revenue', 'Platform Revenue'),
    )
    
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPES)
    value = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'platform_metrics'
        unique_together = [['metric_type', 'date']]
        indexes = [
            models.Index(fields=['metric_type', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.metric_type} - {self.date}: {self.value}"


class UserActivity(models.Model):
    """Track user activity for analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    
    ACTIVITY_TYPES = (
        ('login', 'Login'),
        ('profile_view', 'Profile View'),
        ('match_view', 'Match View'),
        ('message_sent', 'Message Sent'),
        ('course_started', 'Course Started'),
        ('course_completed', 'Course Completed'),
        ('investment_made', 'Investment Made'),
        ('document_uploaded', 'Document Uploaded'),
    )
    
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        indexes = [
            models.Index(fields=['user', 'activity_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['activity_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.created_at}"


class ImpactMetric(models.Model):
    """Social and environmental impact metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    METRIC_CATEGORIES = (
        ('economic', 'Economic Impact'),
        ('social', 'Social Impact'),
        ('environmental', 'Environmental Impact'),
    )
    
    category = models.CharField(max_length=50, choices=METRIC_CATEGORIES)
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=50)
    date = models.DateField()
    source = models.CharField(max_length=200, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'impact_metrics'
        indexes = [
            models.Index(fields=['category', 'date']),
            models.Index(fields=['name', 'date']),
        ]
    
    def __str__(self):
        return f"{self.name}: {self.value} {self.unit} ({self.date})"


class Report(models.Model):
    """Generated analytics reports"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    REPORT_TYPES = (
        ('daily', 'Daily Report'),
        ('weekly', 'Weekly Report'),
        ('monthly', 'Monthly Report'),
        ('quarterly', 'Quarterly Report'),
        ('annual', 'Annual Report'),
        ('custom', 'Custom Report'),
    )
    
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    data = models.JSONField()
    file_url = models.URLField(blank=True, null=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    period_start = models.DateField()
    period_end = models.DateField()
    
    class Meta:
        db_table = 'reports'
        indexes = [
            models.Index(fields=['report_type', 'generated_at']),
            models.Index(fields=['period_start', 'period_end']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.generated_at.date()}"