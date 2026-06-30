from django.urls import path
from .views import (
    InvestorProfileView, InvestorDashboardView, InvestmentListView,
    InvestmentDetailView, ImpactMetricsView
)

urlpatterns = [
    path('profile/', InvestorProfileView.as_view(), name='profile'),
    path('dashboard/', InvestorDashboardView.as_view(), name='dashboard'),
    path('investments/', InvestmentListView.as_view(), name='investments'),
    path('investments/<uuid:pk>/', InvestmentDetailView.as_view(), name='investment-detail'),
    path('impact-metrics/', ImpactMetricsView.as_view(), name='impact-metrics'),
]