# apps/sme/views.py - Complete views
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import SMEProfile, SMEOnboarding, SMEDocument
from .serializers import (
    SMEProfileSerializer, SMEOnboardingSerializer,
    SMEDocumentSerializer, ReadinessScoreSerializer
)
from apps.matching.models import Match
from apps.training.models import UserProgress

class SMEProfileView(generics.RetrieveAPIView):
    serializer_class = SMEProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != 'sme':
            return Response({'error': 'User is not an SME'}, status=status.HTTP_403_FORBIDDEN)
        
        profile, created = SMEProfile.objects.get_or_create(
            user=user,
            defaults={
                'business_name': f"{user.full_name}'s Business",
                'industry': 'Technology',
                'location': ''
            }
        )
        return profile
    
    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        data = serializer.data
        
        # Calculate completion
        fields = ['business_name', 'industry', 'location', 'description', 'funding_needed']
        filled = sum(1 for f in fields if profile.__dict__.get(f))
        data['completion_percentage'] = int((filled / len(fields)) * 100)
        data['readiness_score'] = profile.get_readiness_score()
        
        return Response(data)

class UpdateSMEProfileView(generics.UpdateAPIView):
    serializer_class = SMEProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != 'sme':
            return Response({'error': 'User is not an SME'}, status=status.HTTP_403_FORBIDDEN)
        return SMEProfile.objects.get_or_create(user=user)[0]
    
    def perform_update(self, serializer):
        profile = serializer.save()
        profile.update_readiness_score()

class SMEStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'sme':
            return Response({'error': 'User is not an SME'}, status=status.HTTP_403_FORBIDDEN)
        
        profile = SMEProfile.objects.filter(user=user).first()
        if not profile:
            return Response({
                'status': 'incomplete',
                'message': 'Please complete your profile'
            })
        
        return Response({
            'status': profile.verification_status,
            'is_verified': profile.verification_status == 'verified',
            'readiness_score': profile.get_readiness_score(),
            'profile_completion': self.get_completion_percentage(profile)
        })
    
    def get_completion_percentage(self, profile):
        fields = ['business_name', 'industry', 'location', 'description', 'funding_needed']
        filled = sum(1 for f in fields if getattr(profile, f, None))
        return int((filled / len(fields)) * 100)

class ReadinessScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'sme':
            return Response({'error': 'User is not an SME'}, status=status.HTTP_403_FORBIDDEN)
        
        profile = SMEProfile.objects.filter(user=user).first()
        if not profile:
            return Response({'score': 0, 'message': 'Please complete your profile'})
        
        return Response({
            'score': profile.get_readiness_score(),
            'categories': self.get_category_scores(profile),
            'recommendations': self.get_recommendations(profile)
        })
    
    def get_category_scores(self, profile):
        categories = [
            {'name': 'Business Plan', 'score': self.calculate_business_score(profile)},
            {'name': 'Financial Health', 'score': self.calculate_financial_score(profile)},
            {'name': 'Team Strength', 'score': self.calculate_team_score(profile)},
            {'name': 'Market Potential', 'score': self.calculate_market_score(profile)},
        ]
        return categories
    
    def calculate_business_score(self, profile):
        score = 0
        if profile.business_name: score += 25
        if profile.description: score += 25
        if profile.industry: score += 25
        if profile.location: score += 25
        return score
    
    def calculate_financial_score(self, profile):
        score = 0
        if profile.funding_needed > 0: score += 50
        if profile.funding_purpose: score += 50
        return score
    
    def calculate_team_score(self, profile):
        score = 0
        if profile.employee_count: score += 50
        if profile.founded_year: score += 50
        return score
    
    def calculate_market_score(self, profile):
        return 60
    
    def get_recommendations(self, profile):
        recommendations = []
        if not profile.business_name:
            recommendations.append('Complete your business name')
        if not profile.description:
            recommendations.append('Add a business description')
        if not profile.funding_needed:
            recommendations.append('Specify your funding needs')
        return recommendations

class SMEDocumentsView(generics.ListCreateAPIView):
    serializer_class = SMEDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SMEDocument.objects.filter(sme=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(sme=self.request.user, uploaded_by=self.request.user)

class SMEMatchesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'sme':
            return Response({'error': 'User is not an SME'}, status=status.HTTP_403_FORBIDDEN)
        
        matches = Match.objects.filter(sme=user).order_by('-match_score')
        return Response({
            'matches': [
                {
                    'id': m.id,
                    'investor': m.investor.full_name,
                    'match_score': m.match_score,
                    'status': m.status,
                    'created_at': m.created_at
                }
                for m in matches
            ]
        })