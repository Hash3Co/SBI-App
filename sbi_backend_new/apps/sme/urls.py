from django.urls import path
from .views import (
    SMEProfileView, ReadinessScoreView, SMEDocumentView,
    SMEDocumentDetailView, SMEActivityLogView
)

urlpatterns = [
    path('profile/', SMEProfileView.as_view(), name='profile'),
    path('readiness-score/', ReadinessScoreView.as_view(), name='readiness-score'),
    path('documents/', SMEDocumentView.as_view(), name='documents'),
    path('documents/<uuid:pk>/', SMEDocumentDetailView.as_view(), name='document-detail'),
    path('activities/', SMEActivityLogView.as_view(), name='activities'),
]