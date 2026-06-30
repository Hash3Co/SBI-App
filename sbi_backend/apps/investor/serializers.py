from rest_framework import serializers
from .models import InvestorProfile, Investment
from apps.sme.models import SMEProfile
from sbi_backend.utils.security import validate_amount, sanitize_input

class InvestorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'portfolio_value', 'total_invested', 
                           'active_investments', 'verification_status', 
                           'created_at', 'updated_at']


class InvestorProfileUpdateSerializer(serializers.ModelSerializer):
    funding_range_min = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    funding_range_max = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    
    class Meta:
        model = InvestorProfile
        fields = [
            'full_name', 'company_name', 'location', 'city', 'country',
            'investment_interests', 'preferred_industries',
            'funding_range_min', 'funding_range_max'
        ]
    
    def validate_funding_range_min(self, value):
        if value and not validate_amount(value):
            raise serializers.ValidationError("Invalid minimum amount")
        return value
    
    def validate_funding_range_max(self, value):
        if value and not validate_amount(value):
            raise serializers.ValidationError("Invalid maximum amount")
        return value
    
    def validate(self, data):
        if 'funding_range_min' in data and 'funding_range_max' in data:
            if data['funding_range_min'] > data['funding_range_max']:
                raise serializers.ValidationError(
                    "Minimum funding cannot be greater than maximum"
                )
        return data


class InvestmentSerializer(serializers.ModelSerializer):
    sme_name = serializers.CharField(source='sme.business_name', read_only=True)
    sme_industry = serializers.CharField(source='sme.industry', read_only=True)
    
    class Meta:
        model = Investment
        fields = [
            'id', 'sme', 'sme_name', 'sme_industry', 'amount', 'equity_percentage',
            'status', 'investment_date', 'current_value', 'roi_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvestmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['sme', 'amount', 'equity_percentage', 'investment_date']
    
    def validate_amount(self, value):
        if not validate_amount(value):
            raise serializers.ValidationError("Invalid investment amount")
        return value
    
    def validate_sme(self, value):
        if not SMEProfile.objects.filter(id=value.id, verification_status='verified').exists():
            raise serializers.ValidationError("Invalid or unverified SME")
        return value


class ImpactMetricsSerializer(serializers.Serializer):
    overall_score = serializers.FloatField()
    environmental = serializers.JSONField()
    social = serializers.JSONField()
    governance = serializers.JSONField()