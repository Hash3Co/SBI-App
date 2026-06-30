# apps/matching/serializers.py
from rest_framework import serializers
from .models import Match, MatchMessage, MatchingQueue


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match model"""
    sme_name = serializers.CharField(source='sme.business_name', read_only=True)
    investor_name = serializers.CharField(source='investor.full_name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id', 'sme', 'sme_name', 'investor', 'investor_name',
            'match_score', 'match_reasoning', 'status',
            'last_message_at', 'messages_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'match_score', 'match_reasoning']


class MatchMessageSerializer(serializers.ModelSerializer):
    """Serializer for MatchMessage model"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_id = serializers.CharField(source='sender.id', read_only=True)
    
    class Meta:
        model = MatchMessage
        fields = [
            'id', 'match', 'sender', 'sender_name', 'sender_id',
            'message', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at']


class MatchActionSerializer(serializers.Serializer):
    """Serializer for match actions (accept/reject)"""
    action = serializers.ChoiceField(choices=['accept', 'reject'])
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_action(self, value):
        if value not in ['accept', 'reject']:
            raise serializers.ValidationError("Action must be 'accept' or 'reject'")
        return value
