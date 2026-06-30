from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from django.utils import timezone
import stripe

from .models import SubscriptionPlan, Subscription, Transaction, PaymentMethod
from .serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer,
    TransactionSerializer, PaymentMethodSerializer,
    CreateSubscriptionSerializer, CancelSubscriptionSerializer
)
from apps.accounts.permissions import IsSME, IsInvestor
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlanListView(generics.ListAPIView):
    """List available subscription plans"""
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        role = self.request.user.role
        return SubscriptionPlan.objects.filter(role=role, is_active=True)


class CurrentSubscriptionView(generics.RetrieveAPIView):
    """Get current user subscription"""
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            subscription = Subscription.objects.get(
                user=self.request.user,
                status='active',
                current_period_end__gt=timezone.now()
            )
            return subscription
        except Subscription.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response({'subscription': None}, status=200)


class CreateSubscriptionView(APIView):
    """Create a new subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan_id = serializer.validated_data['plan_id']
        payment_method_id = serializer.validated_data.get('payment_method_id')
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Invalid plan'}, status=404)
        
        # Get or create Stripe customer
        stripe_customer_id = cache.get(f"stripe_customer_{request.user.id}")
        
        if not stripe_customer_id:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=request.user.get_full_name(),
                metadata={'user_id': str(request.user.id)}
            )
            stripe_customer_id = customer.id
            cache.set(f"stripe_customer_{request.user.id}", stripe_customer_id, timeout=86400)
        
        # Create or get payment method
        if payment_method_id:
            stripe.PaymentMethod.attach(payment_method_id, customer=stripe_customer_id)
            stripe.Customer.modify(
                stripe_customer_id,
                invoice_settings={'default_payment_method': payment_method_id}
            )
        
        # Create subscription in Stripe
        stripe_subscription = stripe.Subscription.create(
            customer=stripe_customer_id,
            items=[{'price': plan.stripe_price_id}],
            payment_behavior='default_incomplete',
            expand=['latest_invoice.payment_intent']
        )
        
        # Create local subscription record
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            stripe_subscription_id=stripe_subscription.id,
            stripe_customer_id=stripe_customer_id,
            status='active',
            current_period_start=timezone.now(),
            current_period_end=timezone.fromtimestamp(stripe_subscription.current_period_end)
        )
        
        # Create transaction record
        Transaction.objects.create(
            user=request.user,
            subscription=subscription,
            amount=plan.price,
            currency='ZAR',
            type='subscription',
            status='pending',
            stripe_payment_intent_id=stripe_subscription.latest_invoice.payment_intent.id,
            description=f"{plan.name} subscription"
        )
        
        return Response({
            'subscription_id': str(subscription.id),
            'client_secret': stripe_subscription.latest_invoice.payment_intent.client_secret
        }, status=201)


class CancelSubscriptionView(APIView):
    """Cancel current subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            subscription = Subscription.objects.get(
                user=request.user,
                status='active'
            )
            
            # Cancel in Stripe
            if subscription.stripe_subscription_id:
                stripe.Subscription.delete(subscription.stripe_subscription_id)
            
            subscription.status = 'canceled'
            subscription.canceled_at = timezone.now()
            subscription.save()
            
            return Response({'message': 'Subscription cancelled'})
            
        except Subscription.DoesNotExist:
            return Response({'error': 'No active subscription found'}, status=404)


class TransactionHistoryView(generics.ListAPIView):
    """Get user transaction history"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')


class PaymentMethodListView(generics.ListCreateAPIView):
    """List and add payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)