from django.db import models
from django.conf import settings
import uuid

class SMEProfile(models.Model):
    """SME Business Profile - Lesotho & South Africa Focus"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sme_profile')
    
    # Business Information
    business_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, default='Technology')
    
    # Location (Primary - Lesotho or South Africa)
    country = models.CharField(max_length=100, choices=(
        ('Lesotho', 'Lesotho'),
        ('South Africa', 'South Africa'),
    ), default='Lesotho')
    
    # Lesotho specific fields
    lesotho_district = models.CharField(max_length=100, blank=True, null=True, choices=[
        ('Maseru', 'Maseru'), ('Leribe', 'Leribe'), ('Mafeteng', 'Mafeteng'),
        ('Mohales Hoek', 'Mohale\'s Hoek'), ('Quthing', 'Quthing'), 
        ('Qachas Nek', 'Qacha\'s Nek'), ('Mokhotlong', 'Mokhotlong'),
        ('Thaba-Tseka', 'Thaba-Tseka'), ('Butha-Buthe', 'Butha-Buthe'),
        ('Berea', 'Berea')
    ])
    
    # South Africa specific fields
    sa_province = models.CharField(max_length=100, blank=True, null=True, choices=[
        ('Gauteng', 'Gauteng'), ('Western Cape', 'Western Cape'),
        ('KwaZulu-Natal', 'KwaZulu-Natal'), ('Eastern Cape', 'Eastern Cape'),
        ('Free State', 'Free State'), ('Mpumalanga', 'Mpumalanga'),
        ('Limpopo', 'Limpopo'), ('North West', 'North West'),
        ('Northern Cape', 'Northern Cape')
    ])
    
    sa_city = models.CharField(max_length=100, blank=True, null=True)
    
    # Full location display
    location = models.CharField(max_length=255)  # Human readable
    
    # Business Details
    description = models.TextField(default='Business description coming soon...')
    founded_year = models.IntegerField(default=2024)
    employee_count = models.CharField(max_length=50, default='1-10')
    
    # Currency (Loti for Lesotho, Rand for SA - both 1:1)
    currency = models.CharField(max_length=3, default='LSL', choices=(
        ('LSL', 'Lesotho Loti (M)'),
        ('ZAR', 'South African Rand (R)'),
    ))
    
    # Financial Information (in M/R - equal value)
    funding_needed = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    funding_purpose = models.TextField(default='Business growth and expansion')
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Readiness Score
    readiness_score = models.IntegerField(default=0)
    
    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('verified', 'Verified'),
            ('rejected', 'Rejected'),
        ),
        default='pending'
    )
    verified_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sme_profiles'
        indexes = [
            models.Index(fields=['business_name']),
            models.Index(fields=['country']),
            models.Index(fields=['lesotho_district']),
            models.Index(fields=['sa_province']),
            models.Index(fields=['funding_needed']),
            models.Index(fields=['readiness_score']),
        ]
    
    def save(self, *args, **kwargs):
        """Auto-generate location string and set shard"""
        if self.country == 'Lesotho' and self.lesotho_district:
            self.location = f"{self.lesotho_district}, Lesotho"
        elif self.country == 'South Africa' and self.sa_city:
            self.location = f"{self.sa_city}, {self.sa_province}, South Africa"
        else:
            self.location = f"{self.country}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.business_name} - {self.location}"
    
    @classmethod
    def get_shard(cls, instance=None):
        """Determine shard based on location"""
        from django.conf import settings
        if instance and instance.location:
            shard = settings.SHARD_REGIONS.get(instance.location.lower(), 'default')
            return shard
        return 'default'


class SMEDocument(models.Model):
    """Documents uploaded by SME"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sme = models.ForeignKey(SMEProfile, on_delete=models.CASCADE, related_name='documents')
    
    DOCUMENT_TYPES = (
        ('registration', 'Business Registration'),
        ('financial', 'Financial Statement'),
        ('tax', 'Tax Clearance'),
        ('pitch', 'Pitch Deck'),
        ('business_plan', 'Business Plan'),
        ('other', 'Other'),
    )
    
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    file_url = models.URLField()
    file_size = models.IntegerField()  # Bytes
    file_type = models.CharField(max_length=50)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sme_documents'
        indexes = [
            models.Index(fields=['sme', 'document_type']),
            models.Index(fields=['uploaded_at']),
        ]


class SMEActivityLog(models.Model):
    """Track SME activity for analytics"""
    
    sme = models.ForeignKey(SMEProfile, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sme_activity_logs'
        indexes = [
            models.Index(fields=['sme', 'created_at']),
            models.Index(fields=['action']),
        ]