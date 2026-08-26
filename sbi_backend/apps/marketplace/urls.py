# apps/marketplace/urls.py
from django.urls import path
from .views import (
    MarketplaceCategoryListView,
    MarketplaceResourceListView,
    MarketplaceResourceDetailView,
    MyResourcesView,
    TradeRequestListView,
    TradeRequestDetailView,
    SavedResourceView,
    SavedResourceDeleteView,
    MarketplaceRecommendationsView,
    MarketplaceStatsView,
)

urlpatterns = [
    # Categories
    path('categories/', MarketplaceCategoryListView.as_view(), name='marketplace_categories'),
    
    # Resources
    path('resources/', MarketplaceResourceListView.as_view(), name='marketplace_resources'),
    path('resources/my/', MyResourcesView.as_view(), name='my_resources'),
    path('resources/<uuid:id>/', MarketplaceResourceDetailView.as_view(), name='marketplace_resource_detail'),
    path('resources/recommendations/', MarketplaceRecommendationsView.as_view(), name='marketplace_recommendations'),
    path('resources/stats/', MarketplaceStatsView.as_view(), name='marketplace_stats'),
    
    # Trade Requests
    path('trade-requests/', TradeRequestListView.as_view(), name='trade_requests'),
    path('trade-requests/<uuid:id>/', TradeRequestDetailView.as_view(), name='trade_request_detail'),
    
    # Saved Resources
    path('saved/', SavedResourceView.as_view(), name='saved_resources'),
    path('saved/<uuid:id>/', SavedResourceDeleteView.as_view(), name='remove_saved_resource'),
]