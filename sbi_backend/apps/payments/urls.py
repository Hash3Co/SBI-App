from django.urls import path
from .views import (
    SubscriptionPlanListView, CurrentSubscriptionView, CreateSubscriptionView,
    CancelSubscriptionView, TransactionHistoryView, PaymentMethodListView
)

urlpatterns = [
    path('plans/', SubscriptionPlanListView.as_view(), name='plans'),
    path('current/', CurrentSubscriptionView.as_view(), name='current'),
    path('create/', CreateSubscriptionView.as_view(), name='create'),
    path('cancel/', CancelSubscriptionView.as_view(), name='cancel'),
    path('transactions/', TransactionHistoryView.as_view(), name='transactions'),
    path('payment-methods/', PaymentMethodListView.as_view(), name='payment-methods'),
]