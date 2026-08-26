# apps/matching/urls.py
from django.urls import path
from .views import (
    MatchListView,
    MatchDetailView,
    MatchSuggestionView,
    AcceptMatchView,
    RejectMatchView,
    ConnectMatchView,
    MatchPreferencesView,
    MatchStatsView,
    MatchMessageView,
    MatchingQueueView,
    CreateMatchingQueueView,
)

urlpatterns = [
    # Matches
    path('', MatchListView.as_view(), name='matches'),
    path('<uuid:id>/', MatchDetailView.as_view(), name='match_detail'),
    
    # Suggestions & Stats
    path('suggestions/', MatchSuggestionView.as_view(), name='match_suggestions'),
    path('stats/', MatchStatsView.as_view(), name='match_stats'),
    
    # Preferences
    path('preferences/', MatchPreferencesView.as_view(), name='match_preferences'),
    
    # Actions
    path('accept/<uuid:id>/', AcceptMatchView.as_view(), name='accept_match'),
    path('reject/<uuid:id>/', RejectMatchView.as_view(), name='reject_match'),
    path('connect/<uuid:id>/', ConnectMatchView.as_view(), name='connect_match'),
    
    # Messages
    path('messages/', MatchMessageView.as_view(), name='match_messages'),
    
    # Queue (Admin only)
    path('queue/', MatchingQueueView.as_view(), name='matching_queue'),
    path('queue/create/', CreateMatchingQueueView.as_view(), name='create_matching_queue'),
]