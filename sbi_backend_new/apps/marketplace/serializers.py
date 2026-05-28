from rest_framework import serializers
from .models import MarketplaceResource, TradeRequest

class MarketplaceResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceResource
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class TradeRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.full_name', read_only=True)
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    
    class Meta:
        model = TradeRequest
        fields = ['id', 'resource', 'resource_title', 'requester', 'requester_name',
                  'message', 'proposed_price', 'status', 'created_at']
        read_only_fields = ['id', 'requester', 'status', 'created_at']