# apps/matching/urls.py
from django.urls import path
from . import  views 

app_name = 'matching'

urlpatterns = [
    # Match views
    path('sme/matches/', views.SMEMatchesView.as_view(), name='sme-matches'),
    path('investor/matches/', views.InvestorMatchesView.as_view(), name='investor-matches'),
    path('match/<uuid:match_id>/action/', views.MatchActionView.as_view(), name='match-action'),
    
    # Message views
    path('match/<uuid:match_id>/messages/', views.MatchMessagesView.as_view(), name='match-messages'),
]
