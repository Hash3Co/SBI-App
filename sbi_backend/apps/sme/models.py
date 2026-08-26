# apps/sme/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class SMEProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sme_profile')
    
    business_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    founded_year = models.IntegerField(null=True, blank=True)
    employee_count = models.CharField(max_length=50, blank=True)
    funding_needed = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    funding_purpose = models.TextField(blank=True)
    
    financials = models.JSONField(default=dict, blank=True)
    
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    readiness_score = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'sme_profiles'
    
    def __str__(self):
        return self.business_name
    
    def get_readiness_score(self):
        score = 0
        if self.business_name: score += 10
        if self.industry: score += 10
        if self.location: score += 10
        if self.description: score += 10
        if self.funding_needed > 0: score += 15
        if self.funding_purpose: score += 10
        if self.founded_year: score += 10
        if self.employee_count: score += 10
        if self.financials: score += 15
        return score
    
    def update_readiness_score(self):
        self.readiness_score = self.get_readiness_score()
        self.save()

class SMEOnboarding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sme = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='onboarding')
    
    STEP_CHOICES = (
        ('profile', 'Profile'),
        ('business', 'Business Info'),
        ('documents', 'Documents'),
        ('training', 'Training'),
        ('complete', 'Complete'),
    )
    step = models.CharField(max_length=20, choices=STEP_CHOICES, default='profile')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sme_onboarding'
    
    def __str__(self):
        return f"{self.sme.email} - {self.step}"

class SMEDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sme = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sme_documents')
    
    name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50)
    file = models.FileField(upload_to='sme/documents/')
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_sme_documents')
    
    class Meta:
        db_table = 'sme_documents'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.name

class SMEActivityLog(models.Model):
    """Activity log for SME actions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sme = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sme_activities')
    
    ACTION_CHOICES = (
        ('profile_update', 'Profile Updated'),
        ('document_upload', 'Document Uploaded'),
        ('document_delete', 'Document Deleted'),
        ('onboarding_step', 'Onboarding Step'),
        ('match_view', 'Match Viewed'),
        ('match_connect', 'Match Connected'),
        ('course_enroll', 'Course Enrolled'),
        ('course_complete', 'Course Completed'),
        ('funding_request', 'Funding Requested'),
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sme_activity_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sme.email} - {self.action} - {self.created_at}"