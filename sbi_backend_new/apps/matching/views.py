from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.db.models import Q, F
from django.utils import timezone

from .models import Match, MatchMessage
from .serializers import MatchSerializer, MatchMessageSerializer, MatchActionSerializer
from apps.accounts.permissions import IsSME, IsInvestor
from apps.investor.models import InvestorProfile


class SMEMatchesView(generics.ListAPIView):
    """Get matches for SME"""
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsSME]
    
    def get_queryset(self):
        from apps.sme.models import SMEProfile
        profile = SMEProfile.objects.get(user=self.request.user)
        return Match.objects.filter(sme=profile).order_by('-match_score', '-created_at')


class InvestorMatchesView(generics.ListAPIView):
    """Get matches for Investor"""
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get_queryset(self):
        profile = InvestorProfile.objects.get(user=self.request.user)
        return Match.objects.filter(investor=profile).order_by('-match_score', '-created_at')


class MatchActionView(generics.GenericAPIView):
    """Accept or reject a match"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found'}, status=404)
        
        # Check permission
        if request.user.role == 'sme' and match.sme.user != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        if request.user.role == 'investor' and match.investor.user != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        
        serializer = MatchActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        
        if action == 'accept':
            match.status = 'accepted'
        elif action == 'reject':
            match.status = 'rejected'
        elif action == 'connect':
            match.status = 'connected'
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        match.save()
        
        return Response({'status': match.status})


class MatchMessagesView(generics.ListCreateAPIView):
    """Get and send messages for a match"""
    serializer_class = MatchMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        match_id = self.kwargs['match_id']
        try:
            match = Match.objects.get(id=match_id)
            
            # Check permission
            if self.request.user.role == 'sme' and match.sme.user != self.request.user:
                return MatchMessage.objects.none()
            if self.request.user.role == 'investor' and match.investor.user != self.request.user:
                return MatchMessage.objects.none()
            
            # Mark messages as read
            MatchMessage.objects.filter(
                match=match,
                is_read=False
            ).exclude(sender=self.request.user).update(is_read=True, read_at=timezone.now())
            
            return MatchMessage.objects.filter(match=match).order_by('created_at')
            
        except Match.DoesNotExist:
            return MatchMessage.objects.none()
    
    def perform_create(self, serializer):
        match_id = self.kwargs['match_id']
        match = Match.objects.get(id=match_id)
        serializer.save(match=match, sender=self.request.user)
        
        # Update match last message time
        match.last_message_at = timezone.now()
        match.messages_count = F('messages_count') + 1
        match.save()