# apps/payments/views.py
from asyncio.log import logger

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from django.core.cache import cache
from django.utils import timezone
import stripe
import uuid
from decimal import Decimal
from .models import SubscriptionPlan, Transaction, UserSubscription, PaymentMethod, PaymentLog
from .serializers import (
    SubscriptionPlanSerializer, TransactionSerializer,
    UserSubscriptionSerializer, PaymentMethodSerializer
)
from apps.accounts.models import UserActivity
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlanListView(APIView):
    """List all subscription plans"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            plans = SubscriptionPlan.objects.filter(is_active=True)
            
            # If no plans exist, return default plans
            if not plans.exists():
                default_plans = [
                    {
                        'id': '1',
                        'name': 'Basic',
                        'description': 'Essential features for your business',
                        'price': 250,
                        'interval': 'month',
                        'features': ['Business profile', 'Basic matching', '3 training courses', 'Email support'],
                        'is_popular': False,
                        'role': 'all'
                    },
                    {
                        'id': '2',
                        'name': 'Pro',
                        'description': 'Complete funding readiness package',
                        'price': 500,
                        'interval': 'month',
                        'features': ['All Basic features', 'Advanced matching', 'All training courses', 'Certificate upon completion', 'Priority support'],
                        'is_popular': True,
                        'role': 'all'
                    }
                ]
                return Response(default_plans)
            
            serializer = SubscriptionPlanSerializer(plans, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in SubscriptionPlanListView: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CurrentSubscriptionView(APIView):
    """Get current user's subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            subscription = UserSubscription.objects.filter(
                user=request.user,
                status='active'
            ).first()
            
            if subscription:
                serializer = UserSubscriptionSerializer(subscription)
                return Response(serializer.data)
            
            return Response({
                'active': False,
                'message': 'No active subscription'
            })
        except Exception as e:
            logger.error(f"Error in CurrentSubscriptionView: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreatePaymentIntentView(APIView):
    """Create Stripe payment intent"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({
                'error': 'Plan ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            
            # Create or get Stripe customer
            customer = self.get_or_create_customer(request.user)
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(plan.price * 100),  # Convert to cents
                currency='zar',
                customer=customer.id,
                metadata={
                    'user_id': str(request.user.id),
                    'plan_id': str(plan.id),
                    'plan_name': plan.name,
                },
                payment_method_types=['card'],
            )
            
            # Create transaction record
            transaction = Transaction.objects.create(
                user=request.user,
                type='subscription',
                amount=plan.price,
                status='pending',
                description=f"{plan.name} subscription",
                reference=f"tx_{uuid.uuid4().hex[:12]}",
                stripe_payment_intent_id=intent.id,
                stripe_customer_id=customer.id,
                metadata={'plan_id': str(plan.id)}
            )
            
            # Log payment intent creation
            PaymentLog.objects.create(
                user=request.user,
                action='intent_created',
                details={
                    'plan_id': str(plan.id),
                    'amount': str(plan.price),
                    'payment_intent_id': intent.id
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            return Response({
                'clientSecret': intent.client_secret,
                'transaction_id': str(transaction.id),
                'amount': plan.price,
                'currency': 'ZAR',
            })
            
        except SubscriptionPlan.DoesNotExist:
            return Response({
                'error': 'Plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_or_create_customer(self, user):
        try:
            # Check if customer exists
            customers = stripe.Customer.list(email=user.email, limit=1)
            if customers.data:
                return customers.data[0]
        except:
            pass
        
        # Create new customer
        return stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={'user_id': str(user.id)}
        )

class ConfirmPaymentView(APIView):
    """Confirm payment and activate subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        if not payment_intent_id:
            return Response({
                'error': 'Payment intent ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status != 'succeeded':
                return Response({
                    'error': f'Payment not successful: {intent.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get transaction
            transaction = Transaction.objects.get(
                stripe_payment_intent_id=payment_intent_id
            )
            
            # Update transaction
            transaction.status = 'completed'
            transaction.completed_at = timezone.now()
            transaction.save()
            
            # Get plan
            plan_id = intent.metadata.get('plan_id')
            plan = SubscriptionPlan.objects.get(id=plan_id)
            
            # Create or update subscription
            subscription, created = UserSubscription.objects.get_or_create(
                user=request.user,
                defaults={
                    'plan': plan,
                    'status': 'active',
                    'auto_renew': True,
                    'end_date': timezone.now() + timezone.timedelta(days=30),
                }
            )
            
            if not created:
                subscription.plan = plan
                subscription.status = 'active'
                subscription.end_date = timezone.now() + timezone.timedelta(days=30)
                subscription.save()
            
            # Log successful payment
            PaymentLog.objects.create(
                user=request.user,
                action='payment_succeeded',
                details={
                    'plan_id': str(plan.id),
                    'amount': str(transaction.amount),
                    'payment_intent_id': payment_intent_id
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                action='subscribe',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                details={'plan': plan.name, 'amount': plan.price}
            )
            
            return Response({
                'success': True,
                'message': 'Payment confirmed and subscription activated',
                'subscription': UserSubscriptionSerializer(subscription).data
            })
            
        except Transaction.DoesNotExist:
            return Response({
                'error': 'Transaction not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class TransactionHistoryView(generics.ListAPIView):
    """Get user's transaction history"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            return Transaction.objects.filter(user=self.request.user).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error in TransactionHistoryView: {str(e)}")
            return Transaction.objects.none()
        
class CancelSubscriptionView(APIView):
    """Cancel user's subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            subscription = UserSubscription.objects.get(
                user=request.user,
                status='active'
            )
            
            subscription.status = 'cancelled'
            subscription.cancelled_at = timezone.now()
            subscription.auto_renew = False
            subscription.save()
            
            # Log cancellation
            PaymentLog.objects.create(
                user=request.user,
                action='subscription_cancelled',
                details={
                    'plan_id': str(subscription.plan.id),
                    'subscription_id': str(subscription.id)
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                action='cancel_subscription',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            return Response({
                'message': 'Subscription cancelled successfully'
            })
            
        except UserSubscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)

class PaymentMethodListView(generics.ListCreateAPIView):
    """List and create payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            return PaymentMethod.objects.filter(user=self.request.user, is_active=True)
        except Exception as e:
            logger.error(f"Error in PaymentMethodListView: {str(e)}")
            return PaymentMethod.objects.none()

class PaymentMethodDetailView(generics.RetrieveDestroyAPIView):
    """Get and delete payment method"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        try:
            return PaymentMethod.objects.filter(user=self.request.user)
        except Exception as e:
            logger.error(f"Error in PaymentMethodDetailView: {str(e)}")
            return PaymentMethod.objects.none()
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class SetDefaultPaymentMethodView(APIView):
    """Set a payment method as default"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            method = PaymentMethod.objects.get(id=id, user=request.user)
            
            # Reset all other methods
            PaymentMethod.objects.filter(user=request.user).update(is_default=False)
            
            # Set this as default
            method.is_default = True
            method.save()
            
            return Response({'message': 'Default payment method updated'})
            
        except PaymentMethod.DoesNotExist:
            return Response({
                'error': 'Payment method not found'
            }, status=status.HTTP_404_NOT_FOUND)