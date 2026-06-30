from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import MarketplaceResource, TradeRequest
from .serializers import MarketplaceResourceSerializer, TradeRequestSerializer


class MarketplaceResourceListView(generics.ListCreateAPIView):
    """List and create marketplace resources"""
    serializer_class = MarketplaceResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MarketplaceResource.objects.filter(is_available=True)
        
        # Filter by type
        resource_type = self.request.query_params.get('type')
        if resource_type and resource_type != 'All':
            queryset = queryset.filter(resource_type=resource_type.lower())
        
        # Filter by country
        country = self.request.query_params.get('country')
        if country and country != 'All':
            queryset = queryset.filter(country=country)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(seller__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save()


class MarketplaceResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete marketplace resource"""
    serializer_class = MarketplaceResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MarketplaceResource.objects.all()
    
    def perform_destroy(self, instance):
        instance.is_available = False
        instance.save()


class TradeRequestView(generics.ListCreateAPIView):
    """List and create trade requests"""
    serializer_class = TradeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        resource_id = self.kwargs.get('resource_id')
        return TradeRequest.objects.filter(
            resource_id=resource_id
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        resource_id = self.kwargs.get('resource_id')
        resource = MarketplaceResource.objects.get(id=resource_id)
        serializer.save(
            resource=resource,
            requester=self.request.user
        )


class TradeRequestActionView(APIView):
    """Accept or reject trade request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        try:
            trade_request = TradeRequest.objects.get(id=request_id)
        except TradeRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=404)
        
        action = request.data.get('action')
        
        if action == 'accept':
            trade_request.status = 'accepted'
        elif action == 'reject':
            trade_request.status = 'rejected'
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        trade_request.save()
        
        return Response({'status': trade_request.status})