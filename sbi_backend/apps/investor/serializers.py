# apps/investor/serializers.py
from rest_framework import serializers
from .models import InvestorProfile, Investment
from apps.accounts.serializers import UserSerializer

class InvestorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = InvestorProfile
        fields = ('id', 'user', 'full_name', 'company_name', 'location',
                  'investment_interests', 'preferred_industries',
                  'funding_range_min', 'funding_range_max', 'portfolio_value',
                  'verification_status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'portfolio_value', 'created_at', 'updated_at')

class InvestmentSerializer(serializers.ModelSerializer):
    investor_name = serializers.CharField(source='investor.full_name', read_only=True)
    sme_name = serializers.CharField(source='sme.full_name', read_only=True)
    
    class Meta:
        model = Investment
        fields = ('id', 'investor', 'investor_name', 'sme', 'sme_name',
                  'amount', 'equity', 'roi', 'status', 'date', 'notes',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'date', 'created_at', 'updated_at')