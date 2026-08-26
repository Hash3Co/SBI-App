# apps/marketplace/serializers.py
from rest_framework import serializers
from .models import MarketplaceResource, TradeRequest, SavedResource, MarketplaceCategory
from apps.accounts.serializers import UserSerializer

class MarketplaceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceCategory
        fields = ('id', 'name', 'slug', 'description', 'icon', 'order', 'is_active')
        read_only_fields = ('id', 'created_at', 'updated_at')

class MarketplaceResourceSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_email = serializers.CharField(source='seller.email', read_only=True)
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketplaceResource
        fields = (
            'id', 'title', 'description', 'resource_type', 'price', 'currency',
            'country', 'region', 'seller', 'seller_name', 'seller_email',
            'contact_phone', 'contact_website', 'image', 'attachments',
            'requirements', 'benefits', 'valid_from', 'valid_until',
            'status', 'views', 'saves', 'is_saved', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'seller', 'views', 'saves', 'created_at', 'updated_at')
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedResource.objects.filter(user=request.user, resource=obj).exists()
        return False
    
    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        validated_data['seller_name'] = self.context['request'].user.full_name
        validated_data['seller_email'] = self.context['request'].user.email
        return super().create(validated_data)

class MarketplaceResourceDetailSerializer(MarketplaceResourceSerializer):
    requests_count = serializers.IntegerField(source='requests.count', read_only=True)
    saved_count = serializers.IntegerField(source='saved_by.count', read_only=True)
    
    class Meta(MarketplaceResourceSerializer.Meta):
        fields = MarketplaceResourceSerializer.Meta.fields + ('requests_count', 'saved_count')

class TradeRequestSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    
    class Meta:
        model = TradeRequest
        fields = (
            'id', 'resource', 'resource_title', 'buyer', 'buyer_name', 'buyer_email',
            'message', 'quantity', 'proposed_price', 'status', 'buyer_notes',
            'seller_response', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'buyer', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        return super().create(validated_data)

class SavedResourceSerializer(serializers.ModelSerializer):
    resource = MarketplaceResourceSerializer(read_only=True)
    
    class Meta:
        model = SavedResource
        fields = ('id', 'resource', 'saved_at')
        read_only_fields = ('id', 'user', 'saved_at')