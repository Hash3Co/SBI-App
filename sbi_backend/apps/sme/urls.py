# apps/sme/urls.py
from django.urls import path
from .views import (
    SMEProfileView, UpdateSMEProfileView, SMEStatusView,
    ReadinessScoreView, SMEDocumentsView, SMEMatchesView
)

urlpatterns = [
    path('profile/', SMEProfileView.as_view(), name='sme_profile'),
    path('profile/update/', UpdateSMEProfileView.as_view(), name='update_sme_profile'),
    path('profile/status/', SMEStatusView.as_view(), name='sme_status'),
    path('readiness-score/', ReadinessScoreView.as_view(), name='readiness_score'),
    path('documents/', SMEDocumentsView.as_view(), name='sme_documents'),
    path('matches/', SMEMatchesView.as_view(), name='sme_matches'),
]