# apps/payments/serializers.py
from rest_framework import serializers
from .models import SubscriptionPlan, Transaction, UserSubscription, PaymentMethod

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ('id', 'name', 'description', 'price', 'interval', 'features', 
                  'is_popular', 'is_active', 'role', 'created_at')
        read_only_fields = ('id', 'created_at')

class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'user_name', 'user_email', 'type', 'amount', 
                  'currency', 'status', 'description', 'reference', 'metadata',
                  'created_at', 'completed_at')
        read_only_fields = ('id', 'reference', 'created_at')

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = ('id', 'user', 'plan', 'status', 'start_date', 'end_date', 
                  'cancelled_at', 'auto_renew', 'created_at')
        read_only_fields = ('id', 'user', 'start_date', 'created_at')

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('id', 'method_type', 'last4', 'brand', 'expiry_month', 
                  'expiry_year', 'is_default', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')