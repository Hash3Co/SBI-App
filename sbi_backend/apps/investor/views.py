# apps/investor/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg
from .models import InvestorProfile, Investment
from .serializers import InvestorProfileSerializer, InvestmentSerializer
from apps.matching.models import Match
from apps.sme.models import SMEProfile

class InvestorProfileView(generics.RetrieveAPIView):
    serializer_class = InvestorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != 'investor':
            return Response({'error': 'User is not an investor'}, status=status.HTTP_403_FORBIDDEN)
        
        profile, created = InvestorProfile.objects.get_or_create(
            user=user,
            defaults={'full_name': user.full_name}
        )
        return profile
    
    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        data = serializer.data
        
        fields = ['full_name', 'company_name', 'location', 'investment_interests']
        filled = sum(1 for f in fields if getattr(profile, f, None) and getattr(profile, f) != '')
        data['completion_percentage'] = int((filled / len(fields)) * 100)
        
        return Response(data)

class UpdateInvestorProfileView(generics.UpdateAPIView):
    serializer_class = InvestorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != 'investor':
            return Response({'error': 'User is not an investor'}, status=status.HTTP_403_FORBIDDEN)
        return InvestorProfile.objects.get_or_create(user=user)[0]

class PortfolioView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'investor':
            return Response({'error': 'User is not an investor'}, status=status.HTTP_403_FORBIDDEN)
        
        investments = Investment.objects.filter(investor=user)
        
        return Response({
            'total_invested': investments.aggregate(total=Sum('amount'))['total'] or 0,
            'active_deals': investments.filter(status='active').count(),
            'avg_roi': investments.aggregate(avg=Avg('roi'))['avg'] or 0,
            'impact_score': self.calculate_impact_score(user),
            'investments': InvestmentSerializer(investments, many=True).data
        })
    
    def calculate_impact_score(self, user):
        investments = Investment.objects.filter(investor=user)
        if not investments.exists():
            return 0
        total = investments.aggregate(total=Sum('amount'))['total'] or 1
        return min(100, (total / 1000000) * 20)

class ImpactMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'investor':
            return Response({'error': 'User is not an investor'}, status=status.HTTP_403_FORBIDDEN)
        
        investments = Investment.objects.filter(investor=user)
        total = investments.aggregate(total=Sum('amount'))['total'] or 0
        
        return Response([
            {
                'title': 'Jobs Created',
                'value': int(total / 50000) if total > 0 else 0,
                'change': 12.5,
                'icon': 'work',
                'color': '#1B2A4A'
            },
            {
                'title': 'SMEs Supported',
                'value': investments.count(),
                'change': 8.3,
                'icon': 'store',
                'color': '#2A3F6A'
            },
            {
                'title': 'CO₂ Reduced',
                'value': int(total / 1000) if total > 0 else 0,
                'change': 23.1,
                'icon': 'eco',
                'color': '#3A558A'
            },
        ])

class InvestorMatchesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'investor':
            return Response({'error': 'User is not an investor'}, status=status.HTTP_403_FORBIDDEN)
        
        matches = Match.objects.filter(investor=user).order_by('-match_score')
        return Response({
            'matches': [
                {
                    'id': m.id,
                    'sme': m.sme.full_name,
                    'match_score': m.match_score,
                    'status': m.status,
                    'created_at': m.created_at
                }
                for m in matches
            ]
        })