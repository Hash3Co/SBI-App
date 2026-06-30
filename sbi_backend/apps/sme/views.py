from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema

from .models import SMEProfile, SMEDocument, SMEActivityLog
from .serializers import (
    SMEProfileSerializer, SMEProfileUpdateSerializer,
    SMEDocumentSerializer, ReadinessScoreSerializer, SMEActivityLogSerializer
)
from apps.accounts.permissions import IsSME, IsOwner
from apps.matching.services import update_match_queue
from apps.training.services import calculate_readiness_score


class SMEProfileView(generics.RetrieveUpdateAPIView):
    """Get and update SME profile"""
    serializer_class = SMEProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsSME]
    
    def get_object(self):
        profile, created = SMEProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'business_name': self.request.user.get_full_name() or 'My Business',
                'industry': 'Technology',
                'location': self.request.user.location_region or 'Unknown',
                'description': 'Business description coming soon...',
                'founded_year': 2024,
                'employee_count': '1-10',
                'funding_needed': 0,
                'funding_purpose': 'Business growth'
            }
        )
        return profile
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = SMEProfileUpdateSerializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Update match queue after profile update
        update_match_queue.delay(instance.id, 'sme')
        
        # Log activity
        SMEActivityLog.objects.create(
            sme=instance,
            action='profile_updated',
            details=request.data,
            ip_address=self.get_client_ip(request)
        )
        
        # Clear cache
        cache.delete(f"sme_profile_{instance.id}")
        
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class ReadinessScoreView(generics.GenericAPIView):
    """Get funding readiness score"""
    permission_classes = [permissions.IsAuthenticated, IsSME]
    
    def get(self, request):
        profile = SMEProfile.objects.get(user=request.user)
        
        # Calculate score if not cached
        cache_key = f"readiness_score_{profile.id}"
        score_data = cache.get(cache_key)
        
        if not score_data:
            score_data = calculate_readiness_score(profile)
            cache.set(cache_key, score_data, timeout=3600)
        
        serializer = ReadinessScoreSerializer(score_data)
        return Response(serializer.data)


class SMEDocumentView(generics.ListCreateAPIView):
    """List and upload documents"""
    serializer_class = SMEDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSME]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        profile = SMEProfile.objects.get(user=self.request.user)
        return SMEDocument.objects.filter(sme=profile)
    
    def perform_create(self, serializer):
        profile = SMEProfile.objects.get(user=self.request.user)
        serializer.save(sme=profile)
        
        # Log activity
        SMEActivityLog.objects.create(
            sme=profile,
            action='document_uploaded',
            details={'document_type': serializer.validated_data.get('document_type')},
            ip_address=self.get_client_ip(self.request)
        )


class SMEDocumentDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete document"""
    serializer_class = SMEDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSME]
    
    def get_queryset(self):
        profile = SMEProfile.objects.get(user=self.request.user)
        return SMEDocument.objects.filter(sme=profile)
    
    def perform_destroy(self, instance):
        profile = SMEProfile.objects.get(user=self.request.user)
        SMEActivityLog.objects.create(
            sme=profile,
            action='document_deleted',
            details={'document_id': str(instance.id)},
            ip_address=self.get_client_ip(self.request)
        )
        instance.delete()


class SMEActivityLogView(generics.ListAPIView):
    """Get SME activity logs"""
    permission_classes = [permissions.IsAuthenticated, IsSME]
    serializer_class = SMEActivityLogSerializer
    
    def get_queryset(self):
        profile = SMEProfile.objects.get(user=self.request.user)
        return SMEActivityLog.objects.filter(sme=profile).order_by('-created_at')[:50]