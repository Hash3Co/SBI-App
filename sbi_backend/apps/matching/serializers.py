# apps/matching/serializers.py
from rest_framework import serializers
from .models import Match, MatchPreference, MatchMessage, MatchingQueue
from apps.sme.serializers import SMEProfileSerializer
from apps.investor.serializers import InvestorProfileSerializer

class MatchSerializer(serializers.ModelSerializer):
    sme_profile = SMEProfileSerializer(source='sme.sme_profile', read_only=True)
    investor_profile = InvestorProfileSerializer(source='investor.investor_profile', read_only=True)
    sme_name = serializers.CharField(source='sme.full_name', read_only=True)
    investor_name = serializers.CharField(source='investor.full_name', read_only=True)
    
    class Meta:
        model = Match
        fields = ('id', 'sme', 'sme_name', 'sme_profile', 'investor', 'investor_name', 
                  'investor_profile', 'match_score', 'match_breakdown', 'status', 
                  'connected_at', 'created_at', 'updated_at')
        read_only_fields = ('id', 'match_score', 'match_breakdown', 'created_at', 'updated_at')

class MatchPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchPreference
        fields = ('id', 'user', 'industries', 'location', 'funding_range_min', 
                  'funding_range_max', 'industry_weight', 'location_weight', 
                  'funding_weight', 'readiness_weight', 'interest_weight', 
                  'impact_weight', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

class MatchMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    
    class Meta:
        model = MatchMessage
        fields = ('id', 'match', 'sender', 'sender_name', 'message', 'is_read', 
                  'read_at', 'created_at', 'updated_at')
        read_only_fields = ('id', 'sender', 'created_at', 'updated_at')

class MatchingQueueSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = MatchingQueue
        fields = ('id', 'user', 'user_name', 'status', 'processed_at', 
                  'error_message', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

class MatchDetailSerializer(serializers.ModelSerializer):
    sme_profile = SMEProfileSerializer(source='sme.sme_profile', read_only=True)
    investor_profile = InvestorProfileSerializer(source='investor.investor_profile', read_only=True)
    sme_name = serializers.CharField(source='sme.full_name', read_only=True)
    investor_name = serializers.CharField(source='investor.full_name', read_only=True)
    messages = MatchMessageSerializer(source='messages', many=True, read_only=True)
    
    class Meta:
        model = Match
        fields = ('id', 'sme', 'sme_name', 'sme_profile', 'investor', 'investor_name', 
                  'investor_profile', 'match_score', 'match_breakdown', 'status', 
                  'connected_at', 'messages', 'created_at', 'updated_at')
        read_only_fields = ('id', 'match_score', 'match_breakdown', 'created_at', 'updated_at')

class MatchSuggestionSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    score = serializers.IntegerField()
    level = serializers.CharField()
    breakdown = serializers.JSONField()
    recommendations = serializers.ListField()
    profile = serializers.JSONField()