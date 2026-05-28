from rest_framework import serializers
from .models import SMEProfile, SMEDocument, SMEActivityLog
from sbi_backend.utils.validators import validate_amount, validate_year

class SMEProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMEProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'readiness_score', 'verification_status', 
                           'verified_at', 'created_at', 'updated_at']


class SMEProfileUpdateSerializer(serializers.ModelSerializer):
    funding_needed = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    founded_year = serializers.IntegerField(required=False)
    
    class Meta:
        model = SMEProfile
        fields = [
            'business_name', 'registration_number', 'industry', 'sub_industry',
            'location', 'city', 'country', 'region', 'description', 'founded_year',
            'employee_count', 'funding_needed', 'funding_purpose', 'annual_revenue',
            'profit_margin'
        ]
    
    def validate_funding_needed(self, value):
        if value and not validate_amount(value):
            raise serializers.ValidationError("Invalid funding amount")
        return value
    
    def validate_founded_year(self, value):
        if value and not validate_year(value):
            raise serializers.ValidationError("Invalid year")
        return value


class SMEDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMEDocument
        fields = ['id', 'document_type', 'title', 'file_url', 'file_size', 
                  'file_type', 'is_verified', 'uploaded_at']
        read_only_fields = ['id', 'is_verified', 'uploaded_at']


class ReadinessScoreSerializer(serializers.Serializer):
    overall_score = serializers.IntegerField()
    categories = serializers.JSONField()
    recommendations = serializers.ListField()
    improvements = serializers.JSONField()


class SMEActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMEActivityLog
        fields = ['action', 'details', 'created_at']