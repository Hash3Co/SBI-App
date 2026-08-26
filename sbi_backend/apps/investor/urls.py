# apps/investor/urls.py
from django.urls import path
from .views import (
    InvestorProfileView, UpdateInvestorProfileView,
    PortfolioView, ImpactMetricsView, InvestorMatchesView
)

urlpatterns = [
    path('profile/', InvestorProfileView.as_view(), name='investor_profile'),
    path('profile/update/', UpdateInvestorProfileView.as_view(), name='update_investor_profile'),
    path('portfolio/', PortfolioView.as_view(), name='portfolio'),
    path('impact-metrics/', ImpactMetricsView.as_view(), name='impact_metrics'),
    path('matches/', InvestorMatchesView.as_view(), name='investor_matches'),
]