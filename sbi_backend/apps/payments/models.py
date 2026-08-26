# apps/payments/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid

class SubscriptionPlan(models.Model):
    """Subscription plans for users"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    INTERVAL_CHOICES = (
        ('month', 'Monthly'),
        ('year', 'Yearly'),
    )
    interval = models.CharField(max_length=10, choices=INTERVAL_CHOICES, default='month')
    
    features = models.JSONField(default=list)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    ROLE_CHOICES = (
        ('sme', 'SME'),
        ('investor', 'Investor'),
        ('all', 'All'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='all')
    
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_product_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_plans'
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} - {self.interval} - {self.price}"

class UserSubscription(models.Model):
    """User's active subscription"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscribers')
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    auto_renew = models.BooleanField(default=True)
    
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_subscriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} - {self.status}"

class Transaction(models.Model):
    """Payment transactions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    
    TRANSACTION_TYPES = (
        ('subscription', 'Subscription'),
        ('course', 'Course Purchase'),
        ('investment', 'Investment'),
        ('marketplace', 'Marketplace'),
        ('refund', 'Refund'),
    )
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='ZAR')
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=255, unique=True)
    
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.amount} - {self.status}"

class PaymentMethod(models.Model):
    """Saved payment methods"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_methods')
    
    METHOD_TYPES = (
        ('card', 'Card'),
        ('paypal', 'PayPal'),
        ('apple_pay', 'Apple Pay'),
        ('google_pay', 'Google Pay'),
    )
    method_type = models.CharField(max_length=20, choices=METHOD_TYPES, default='card')
    
    # Card details (encrypted)
    last4 = models.CharField(max_length=4)
    brand = models.CharField(max_length=50)
    expiry_month = models.CharField(max_length=2)
    expiry_year = models.CharField(max_length=4)
    
    stripe_payment_method_id = models.CharField(max_length=255, unique=True)
    
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_methods'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.brand} - ****{self.last4} - {self.user.email}"

class PaymentLog(models.Model):
    """Payment activity log for security and debugging"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='payment_logs')
    
    ACTION_CHOICES = (
        ('intent_created', 'Payment Intent Created'),
        ('payment_succeeded', 'Payment Succeeded'),
        ('payment_failed', 'Payment Failed'),
        ('subscription_created', 'Subscription Created'),
        ('subscription_cancelled', 'Subscription Cancelled'),
        ('refund_processed', 'Refund Processed'),
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email if self.user else 'Anonymous'} - {self.action} - {self.created_at}"