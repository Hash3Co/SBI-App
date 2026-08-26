# apps/payments/urls.py
from django.urls import path
from .views import (
    SubscriptionPlanListView,
    CurrentSubscriptionView,
    CreatePaymentIntentView,
    ConfirmPaymentView,
    TransactionHistoryView,
    CancelSubscriptionView,
    PaymentMethodListView,
    PaymentMethodDetailView,
    SetDefaultPaymentMethodView,
)

urlpatterns = [
    path('subscriptions/', SubscriptionPlanListView.as_view(), name='subscription_plans'),
    path('subscriptions/current/', CurrentSubscriptionView.as_view(), name='current_subscription'),
    path('create-intent/', CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('confirm/', ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('history/', TransactionHistoryView.as_view(), name='transaction_history'),
    path('cancel-subscription/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    path('methods/', PaymentMethodListView.as_view(), name='payment_methods'),
    path('methods/<uuid:id>/', PaymentMethodDetailView.as_view(), name='payment_method_detail'),
    path('methods/<uuid:id>/set-default/', SetDefaultPaymentMethodView.as_view(), name='set_default_method'),
]