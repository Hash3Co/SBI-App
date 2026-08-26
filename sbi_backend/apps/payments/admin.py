# apps/payments/admin.py
from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, Transaction, PaymentMethod, PaymentLog

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'interval', 'is_popular', 'role', 'is_active')
    list_filter = ('interval', 'is_popular', 'role', 'is_active')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Plan Information', {
            'fields': ('name', 'description', 'price', 'interval', 'features', 'role')
        }),
        ('Popular & Status', {
            'fields': ('is_popular', 'is_active')
        }),
        ('Stripe Integration', {
            'fields': ('stripe_price_id', 'stripe_product_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'plan', 'status', 'start_date', 'end_date', 'auto_renew')
    list_filter = ('status', 'auto_renew', 'start_date')
    search_fields = ('user__email', 'user__full_name', 'plan__name')
    readonly_fields = ('id', 'start_date', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Subscription Information', {
            'fields': ('user', 'plan', 'status', 'auto_renew')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'cancelled_at')
        }),
        ('Stripe Integration', {
            'fields': ('stripe_subscription_id',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'status', 'type', 'description', 'created_at')
    list_filter = ('status', 'type', 'created_at')
    search_fields = ('user__email', 'description', 'reference')
    readonly_fields = ('id', 'reference', 'created_at')
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('user', 'type', 'amount', 'currency', 'status', 'description', 'reference')
        }),
        ('Stripe Integration', {
            'fields': ('stripe_payment_intent_id', 'stripe_customer_id', 'stripe_subscription_id'),
            'classes': ('collapse',)
        }),
        ('Additional', {
            'fields': ('metadata', 'completed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'brand', 'last4', 'method_type', 'is_default', 'is_active')
    list_filter = ('brand', 'method_type', 'is_default', 'is_active')
    search_fields = ('user__email', 'user__full_name', 'last4')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__email', 'user__full_name')
    readonly_fields = ('id', 'user', 'action', 'details', 'ip_address', 'user_agent', 'created_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False