from django.contrib import admin
from .models import SubscriptionPlan, Subscription, Transaction, PaymentMethod

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'price', 'interval', 'is_popular', 'is_active')
    list_filter = ('role', 'interval', 'is_popular', 'is_active')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Plan Details', {
            'fields': ('name', 'description', 'role')
        }),
        ('Pricing', {
            'fields': ('price', 'interval')
        }),
        ('Features', {
            'fields': ('features', 'is_popular')
        }),
        ('Stripe Integration', {
            'fields': ('stripe_price_id',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'current_period_start', 'current_period_end')
    list_filter = ('status', 'plan', 'created_at')
    search_fields = ('user__email', 'stripe_subscription_id')
    readonly_fields = ('id', 'stripe_subscription_id', 'stripe_customer_id', 'created_at', 'updated_at')
    
    actions = ['cancel_subscriptions']
    
    def cancel_subscriptions(self, request, queryset):
        updated = queryset.update(status='canceled')
        self.message_user(request, f'{updated} subscriptions canceled.')
    cancel_subscriptions.short_description = "Cancel selected subscriptions"


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'currency', 'type', 'status', 'created_at')
    list_filter = ('status', 'type', 'currency', 'created_at')
    search_fields = ('user__email', 'stripe_payment_intent_id', 'description')
    readonly_fields = ('id', 'stripe_payment_intent_id', 'stripe_payment_method_id', 'created_at')
    
    actions = ['refund_transactions']
    
    def refund_transactions(self, request, queryset):
        updated = queryset.update(status='refunded')
        self.message_user(request, f'{updated} transactions refunded.')
    refund_transactions.short_description = "Refund selected transactions"


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('user', 'brand', 'last4', 'expiry_month', 'expiry_year', 'is_default', 'created_at')
    list_filter = ('brand', 'is_default', 'created_at')
    search_fields = ('user__email', 'last4')
    readonly_fields = ('id', 'stripe_payment_method_id', 'created_at')