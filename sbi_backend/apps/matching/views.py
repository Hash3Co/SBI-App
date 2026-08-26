# apps/matching/views.py
from rest_framework import generics, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg
from django.core.cache import cache
from django.utils import timezone
from .models import Match, MatchPreference, MatchMessage, MatchingQueue
from .serializers import (
    MatchSerializer, MatchPreferenceSerializer, 
    MatchMessageSerializer, MatchingQueueSerializer,
    MatchDetailSerializer, MatchSuggestionSerializer
)
from apps.accounts.models import UserActivity
import logging

logger = logging.getLogger(__name__)

# Try to import the matching algorithm
try:
    from .matching_algorithm import MatchingAlgorithm
    ALGORITHM_AVAILABLE = True
    logger.info("MatchingAlgorithm loaded successfully")
except ImportError as e:
    logger.warning(f"MatchingAlgorithm not available: {e}")
    MatchingAlgorithm = None
    ALGORITHM_AVAILABLE = False

class MatchListView(generics.ListAPIView):
    """Get user's matches"""
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(
            Q(sme=user) | Q(investor=user)
        ).order_by('-match_score', '-created_at')

class MatchDetailView(generics.RetrieveAPIView):
    """Get match details with messages"""
    serializer_class = MatchDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(Q(sme=user) | Q(investor=user))

class MatchSuggestionView(APIView):
    """Get match suggestions"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # If algorithm is not available, return empty result
        if not ALGORITHM_AVAILABLE or MatchingAlgorithm is None:
            logger.warning("Matching algorithm not available for user %s", user.id)
            return Response({
                'message': 'Matching algorithm is initializing. Please try again later.',
                'suggestions': []
            })
        
        cache_key = f'match_suggestions_{user.id}'
        suggestions = cache.get(cache_key)
        
        if suggestions:
            return Response(suggestions)
        
        try:
            # Find best matches using algorithm
            matches = MatchingAlgorithm.find_best_matches(user, limit=10)
            
            # Create serializable response
            result = []
            for match in matches:
                result.append({
                    'id': str(match['user'].id),
                    'name': match['user'].full_name,
                    'email': match['user'].email,
                    'role': match['user'].role,
                    'score': match['score'],
                    'level': match['level'],
                    'breakdown': match['breakdown'],
                    'recommendations': match['recommendations'],
                    'profile': self.get_profile_data(match['profile'], match['user'].role)
                })
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            
            return Response(result)
            
        except Exception as e:
            logger.error("Error generating match suggestions: %s", str(e))
            return Response({
                'message': 'Error generating suggestions. Please try again.',
                'suggestions': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_profile_data(self, profile, role):
        if role == 'sme':
            from apps.sme.serializers import SMEProfileSerializer
            return SMEProfileSerializer(profile).data
        else:
            from apps.investor.serializers import InvestorProfileSerializer
            return InvestorProfileSerializer(profile).data

class AcceptMatchView(APIView):
    """Accept a match"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            match = Match.objects.get(id=id)
            
            if match.sme != request.user and match.investor != request.user:
                return Response({
                    'error': 'You are not part of this match'
                }, status=status.HTTP_403_FORBIDDEN)
            
            match.status = 'accepted'
            match.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                action='accept_match',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                details={'match_id': str(match.id)}
            )
            
            return Response({
                'message': 'Match accepted',
                'match': MatchSerializer(match).data
            })
            
        except Match.DoesNotExist:
            return Response({
                'error': 'Match not found'
            }, status=status.HTTP_404_NOT_FOUND)

class RejectMatchView(APIView):
    """Reject a match"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            match = Match.objects.get(id=id)
            
            if match.sme != request.user and match.investor != request.user:
                return Response({
                    'error': 'You are not part of this match'
                }, status=status.HTTP_403_FORBIDDEN)
            
            match.status = 'rejected'
            match.save()
            
            return Response({
                'message': 'Match rejected'
            })
            
        except Match.DoesNotExist:
            return Response({
                'error': 'Match not found'
            }, status=status.HTTP_404_NOT_FOUND)

class ConnectMatchView(APIView):
    """Connect with a match"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            match = Match.objects.get(id=id)
            
            if match.sme != request.user and match.investor != request.user:
                return Response({
                    'error': 'You are not part of this match'
                }, status=status.HTTP_403_FORBIDDEN)
            
            match.status = 'connected'
            match.connected_at = timezone.now()
            match.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                action='connect_match',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                details={'match_id': str(match.id)}
            )
            
            return Response({
                'message': 'Connected successfully',
                'match': MatchSerializer(match).data
            })
            
        except Match.DoesNotExist:
            return Response({
                'error': 'Match not found'
            }, status=status.HTTP_404_NOT_FOUND)

class MatchPreferencesView(generics.RetrieveUpdateAPIView):
    """Get and update match preferences"""
    serializer_class = MatchPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preferences, created = MatchPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences

class MatchStatsView(APIView):
    """Get match statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        matches = Match.objects.filter(Q(sme=user) | Q(investor=user))
        
        return Response({
            'total_matches': matches.count(),
            'average_score': matches.aggregate(avg_score=Avg('match_score'))['avg_score'] or 0,
            'pending_count': matches.filter(status='pending').count(),
            'accepted_count': matches.filter(status='accepted').count(),
            'connected_count': matches.filter(status='connected').count(),
            'rejected_count': matches.filter(status='rejected').count(),
        })

class MatchMessageView(generics.ListCreateAPIView):
    """Get and send match messages"""
    serializer_class = MatchMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        match_id = self.request.query_params.get('match_id')
        if match_id:
            return MatchMessage.objects.filter(match_id=match_id).order_by('created_at')
        return MatchMessage.objects.filter(sender=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        match_id = self.request.data.get('match_id')
        if not match_id:
            raise serializers.ValidationError('Match ID is required')
        
        try:
            match = Match.objects.get(id=match_id)
            if match.sme != self.request.user and match.investor != self.request.user:
                raise serializers.ValidationError('You are not part of this match')
            serializer.save(match=match, sender=self.request.user)
        except Match.DoesNotExist:
            raise serializers.ValidationError('Match not found')

class MatchingQueueView(generics.ListAPIView):
    """Get matching queue status (Admin only)"""
    serializer_class = MatchingQueueSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return MatchingQueue.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

class CreateMatchingQueueView(APIView):
    """Add user to matching queue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check if already in queue
        existing = MatchingQueue.objects.filter(
            user=request.user,
            status__in=['pending', 'processing']
        ).first()
        
        if existing:
            return Response({
                'message': 'Already in queue',
                'queue_id': str(existing.id),
                'status': existing.status
            })
        
        # Create new queue entry
        queue_entry = MatchingQueue.objects.create(
            user=request.user,
            status='pending'
        )
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            action='request_matching',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            details={'queue_id': str(queue_entry.id)}
        )
        
        return Response({
            'message': 'Added to matching queue',
            'queue_id': str(queue_entry.id),
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)