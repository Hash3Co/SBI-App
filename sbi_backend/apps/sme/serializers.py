# apps/sme/serializers.py
from rest_framework import serializers
from .models import SMEProfile, SMEOnboarding, SMEDocument
from apps.accounts.serializers import UserSerializer

class SMEProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SMEProfile
        fields = ('id', 'user', 'business_name', 'industry', 'location', 'description',
                  'founded_year', 'employee_count', 'funding_needed', 'funding_purpose',
                  'financials', 'verification_status', 'readiness_score', 'created_at', 'updated_at')
        read_only_fields = ('id', 'readiness_score', 'created_at', 'updated_at')

class SMEOnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMEOnboarding
        fields = ('id', 'step', 'completed', 'completed_at', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class SMEDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMEDocument
        fields = ('id', 'name', 'document_type', 'file', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')

class ReadinessScoreSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    categories = serializers.ListField()
    recommendations = serializers.ListField()