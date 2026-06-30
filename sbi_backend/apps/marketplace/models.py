from django.db import models
import uuid

class MarketplaceResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    RESOURCE_TYPES = (
        ('equipment', 'Equipment'),
        ('materials', 'Materials'),
        ('services', 'Services'),
        ('export', 'Export Opportunity'),
    )
    
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    description = models.TextField()
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    seller = models.CharField(max_length=255)
    seller_email = models.EmailField()
    seller_phone = models.CharField(max_length=20, blank=True)
    images = models.JSONField(default=list)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marketplace_resources'
        indexes = [
            models.Index(fields=['resource_type', 'is_available']),
            models.Index(fields=['country']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.price}"


class TradeRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(MarketplaceResource, on_delete=models.CASCADE, related_name='requests')
    requester = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    message = models.TextField()
    proposed_price = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trade_requests'