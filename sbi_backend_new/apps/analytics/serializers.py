from rest_framework import serializers
from .models import PlatformMetric, UserActivity, ImpactMetric, Report

class PlatformMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformMetric
        fields = '__all__'


class UserActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'user_email', 'activity_type', 'details', 'created_at']
        read_only_fields = ['id', 'created_at']


class ImpactMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactMetric
        fields = '__all__'


class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = '__all__'


class ReportGenerateSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'])
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date must be before end date")
        return data