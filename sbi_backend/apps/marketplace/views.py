# apps/marketplace/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import MarketplaceResource, TradeRequest, SavedResource, MarketplaceCategory
from .serializers import (
    MarketplaceResourceSerializer, MarketplaceResourceDetailSerializer,
    TradeRequestSerializer, SavedResourceSerializer, MarketplaceCategorySerializer
)
from apps.accounts.models import UserActivity
from apps.matching.matching_algorithm import MatchingAlgorithm

class MarketplaceCategoryListView(generics.ListAPIView):
    """List all marketplace categories"""
    queryset = MarketplaceCategory.objects.filter(is_active=True)
    serializer_class = MarketplaceCategorySerializer
    permission_classes = [permissions.AllowAny]

class MarketplaceResourceListView(generics.ListCreateAPIView):
    """List and create marketplace resources"""
    serializer_class = MarketplaceResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['resource_type', 'country', 'status']
    search_fields = ['title', 'description', 'seller_name']
    ordering_fields = ['price', 'created_at', 'views', 'saves']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = MarketplaceResource.objects.filter(status='published')
        
        # Filter by type
        resource_type = self.request.query_params.get('resource_type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Filter by country
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country=country)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(seller_name__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        resource = serializer.save()
        
        # Log activity
        UserActivity.objects.create(
            user=self.request.user,
            action='create_resource',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT'),
            details={'resource_id': str(resource.id), 'title': resource.title}
        )

class MarketplaceResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, delete marketplace resource"""
    serializer_class = MarketplaceResourceDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return MarketplaceResource.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Log activity
        UserActivity.objects.create(
            user=self.request.user,
            action='update_resource',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT'),
            details={'resource_id': str(instance.id), 'title': instance.title}
        )
    
    def perform_destroy(self, instance):
        # Log activity
        UserActivity.objects.create(
            user=self.request.user,
            action='delete_resource',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT'),
            details={'resource_id': str(instance.id), 'title': instance.title}
        )
        instance.delete()

class MyResourcesView(generics.ListAPIView):
    """Get user's own resources"""
    serializer_class = MarketplaceResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MarketplaceResource.objects.filter(seller=self.request.user)

class TradeRequestListView(generics.ListCreateAPIView):
    """List and create trade requests"""
    serializer_class = TradeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TradeRequest.objects.filter(
            Q(buyer=self.request.user) | Q(resource__seller=self.request.user)
        )
    
    def perform_create(self, serializer):
        trade_request = serializer.save()
        
        # Log activity
        UserActivity.objects.create(
            user=self.request.user,
            action='create_trade_request',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT'),
            details={'request_id': str(trade_request.id)}
        )

class TradeRequestDetailView(generics.RetrieveUpdateAPIView):
    """Get and update trade request"""
    serializer_class = TradeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return TradeRequest.objects.filter(
            Q(buyer=self.request.user) | Q(resource__seller=self.request.user)
        )
    
    def perform_update(self, serializer):
        instance = serializer.save()
        
        # If status changed to accepted/completed
        if instance.status in ['accepted', 'completed']:
            # Create match if appropriate
            if instance.resource.resource_type == 'investment':
                from apps.matching.models import Match
                Match.objects.create(
                    sme=instance.buyer,
                    investor=instance.resource.seller,
                    match_score=80,  # High score for accepted trade
                    status='connected'
                )

class SavedResourceView(generics.ListCreateAPIView):
    """List and save resources"""
    serializer_class = SavedResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavedResource.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        resource_id = self.request.data.get('resource')
        try:
            resource = MarketplaceResource.objects.get(id=resource_id)
            serializer.save(user=self.request.user, resource=resource)
            resource.increment_saves()
            
            # Log activity
            UserActivity.objects.create(
                user=self.request.user,
                action='save_resource',
                ip_address=self.request.META.get('REMOTE_ADDR'),
                user_agent=self.request.META.get('HTTP_USER_AGENT'),
                details={'resource_id': str(resource.id)}
            )
        except MarketplaceResource.DoesNotExist:
            raise serializers.ValidationError({'resource': 'Resource not found'})

class SavedResourceDeleteView(APIView):
    """Delete saved resource"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, id):
        try:
            saved = SavedResource.objects.get(user=request.user, id=id)
            saved.delete()
            return Response({'message': 'Resource unsaved'}, status=status.HTTP_200_OK)
        except SavedResource.DoesNotExist:
            return Response({'error': 'Saved resource not found'}, status=status.HTTP_404_NOT_FOUND)

class MarketplaceRecommendationsView(APIView):
    """Get personalized marketplace recommendations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get cache key
        cache_key = f'marketplace_recommendations_{user.id}'
        recommendations = cache.get(cache_key)
        
        if recommendations:
            return Response(recommendations)
        
        # Get user's profile and preferences
        if user.role == 'sme':
            sme = user.sme_profile.first()
            if sme:
                # Recommend based on SME's industry and location
                recommendations = MarketplaceResource.objects.filter(
                    status='published'
                ).filter(
                    Q(resource_type='funding') |
                    Q(resource_type='investment') |
                    Q(resource_type='partnership')
                ).filter(
                    Q(country=sme.location) | Q(country='')
                ).order_by('-created_at')[:10]
        else:
            # Investor recommendations
            investor = user.investor_profile.first()
            if investor:
                # Recommend based on investor's interests
                interests = investor.investment_interests or []
                recommendations = MarketplaceResource.objects.filter(
                    status='published'
                ).filter(
                    resource_type__in=['investment', 'partnership', 'export']
                )
                
                if interests:
                    recommendations = recommendations.filter(
                        Q(title__icontains=' | '.join(interests)) |
                        Q(description__icontains=' | '.join(interests))
                    )
                
                recommendations = recommendations.order_by('-created_at')[:10]
        
        # If no recommendations, get latest resources
        if not recommendations:
            recommendations = MarketplaceResource.objects.filter(
                status='published'
            ).order_by('-created_at')[:10]
        
        # Serialize
        serializer = MarketplaceResourceSerializer(recommendations, many=True, context={'request': request})
        
        # Cache for 1 hour
        cache.set(cache_key, serializer.data, 3600)
        
        return Response(serializer.data)

class MarketplaceStatsView(APIView):
    """Get marketplace statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        stats = {
            'total_resources': MarketplaceResource.objects.filter(status='published').count(),
            'total_sellers': MarketplaceResource.objects.filter(status='published').values('seller').distinct().count(),
            'avg_price': MarketplaceResource.objects.filter(status='published').aggregate(avg_price=models.Avg('price'))['avg_price'] or 0,
            'top_countries': list(MarketplaceResource.objects.filter(status='published')
                                 .values('country')
                                 .annotate(count=models.Count('id'))
                                 .order_by('-count')[:5]),
            'resources_by_type': list(MarketplaceResource.objects.filter(status='published')
                                     .values('resource_type')
                                     .annotate(count=models.Count('id'))
                                     .order_by('-count')),
            'total_views': MarketplaceResource.objects.aggregate(total=models.Sum('views'))['total'] or 0,
            'total_saves': MarketplaceResource.objects.aggregate(total=models.Sum('saves'))['total'] or 0,
        }
        
        return Response(stats)