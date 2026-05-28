from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Transaction, PaymentMethod

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_price = serializers.DecimalField(source='plan.price', read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'plan_name', 'plan_price', 'status', 
                  'current_period_start', 'current_period_end', 'canceled_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'last4', 'brand', 'expiry_month', 'expiry_year', 'is_default']
        read_only_fields = ['id']


class CreateSubscriptionSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(required=True)
    payment_method_id = serializers.CharField(required=False)


class CancelSubscriptionSerializer(serializers.Serializer):
    subscription_id = serializers.UUIDField(required=True)