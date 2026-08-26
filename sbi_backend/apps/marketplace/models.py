# apps/marketplace/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid

class MarketplaceResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    RESOURCE_TYPES = (
        ('training', 'Training Course'),
        ('research', 'Research Report'),
        ('software', 'Software'),
        ('consulting', 'Consulting'),
        ('event', 'Event'),
        ('funding', 'Funding Opportunity'),
        ('partnership', 'Partnership'),
        ('supply', 'Supply Chain'),
        ('export', 'Export Opportunity'),
        ('investment', 'Investment Opportunity'),
    )
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES)
    
    price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='ZAR')
    
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='marketplace_resources')
    seller_name = models.CharField(max_length=255)
    seller_email = models.EmailField()
    
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_website = models.URLField(blank=True)
    
    image = models.ImageField(upload_to='marketplace/', blank=True, null=True)
    attachments = models.JSONField(default=list, blank=True)
    
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    
    valid_from = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('expired', 'Expired'),
        ('archived', 'Archived'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    views = models.IntegerField(default=0)
    saves = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marketplace_resources'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class TradeRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(MarketplaceResource, on_delete=models.CASCADE, related_name='requests')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trade_requests')
    
    message = models.TextField()
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    proposed_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    buyer_notes = models.TextField(blank=True)
    seller_response = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trade_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.buyer.email} - {self.resource.title}"

class SavedResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_marketplace_resources')
    resource = models.ForeignKey(MarketplaceResource, on_delete=models.CASCADE, related_name='saved_by_users')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'saved_resources'
        unique_together = ['user', 'resource']
    
    def __str__(self):
        return f"{self.user.email} - {self.resource.title}"

class MarketplaceCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marketplace_categories'
        ordering = ['order', 'name']
        verbose_name_plural = 'Marketplace Categories'
    
    def __str__(self):
        return self.name