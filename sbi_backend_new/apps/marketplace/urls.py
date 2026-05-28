from django.urls import path
from .views import (
    MarketplaceResourceListView, MarketplaceResourceDetailView,
    TradeRequestView, TradeRequestActionView
)

urlpatterns = [
    path('resources/', MarketplaceResourceListView.as_view(), name='resources'),
    path('resources/<uuid:pk>/', MarketplaceResourceDetailView.as_view(), name='resource-detail'),
    path('resources/<uuid:resource_id>/requests/', TradeRequestView.as_view(), name='trade-requests'),
    path('requests/<uuid:request_id>/action/', TradeRequestActionView.as_view(), name='trade-action'),
]