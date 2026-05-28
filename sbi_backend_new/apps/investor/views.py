from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema

from .models import InvestorProfile, Investment
from .serializers import (
    InvestorProfileSerializer, InvestorProfileUpdateSerializer,
    InvestmentSerializer, InvestmentCreateSerializer,
    ImpactMetricsSerializer
)
from apps.accounts.permissions import IsInvestor, IsOwner
from apps.matching.services import update_match_queue
from sbi_backend.utils.security import sanitize_input, validate_amount


class InvestorProfileView(generics.RetrieveUpdateAPIView):
    """Get and update investor profile"""
    serializer_class = InvestorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get_object(self):
        profile, created = InvestorProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'full_name': self.request.user.get_full_name(),
                'location': self.request.user.location_region or 'Unknown',
                'funding_range_min': 100000,
                'funding_range_max': 1000000,
                'investment_interests': ['Technology', 'Agriculture'],
                'preferred_industries': ['Technology', 'Agriculture']
            }
        )
        return profile
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = InvestorProfileUpdateSerializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Update match queue
        update_match_queue.delay(instance.id, 'investor')
        
        # Clear cache
        cache.delete(f"investor_profile_{instance.id}")
        cache.delete(f"investor_metrics_{instance.id}")
        
        return Response(serializer.data)


class InvestorDashboardView(generics.GenericAPIView):
    """Get investor dashboard data"""
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get(self, request):
        profile = InvestorProfile.objects.get(user=request.user)
        
        # Get cached data or calculate
        cache_key = f"investor_dashboard_{profile.id}"
        dashboard_data = cache.get(cache_key)
        
        if not dashboard_data:
            # Investment statistics
            investments = Investment.objects.filter(investor=profile)
            
            total_invested = investments.aggregate(total=Sum('amount'))['total'] or 0
            active_investments = investments.filter(status='pending').count()  # Fixed: changed from 'completed' to 'pending' for active investments
            total_returns = investments.aggregate(total=Sum('current_value'))['total'] or 0
            roi = ((total_returns - total_invested) / total_invested * 100) if total_invested > 0 else 0
            
            # Impact metrics
            impact_metrics = {
                'jobs_created': profile.jobs_created,
                'smes_supported': profile.smes_supported,
                'co2_reduced': float(profile.co2_reduced),
                'women_led_businesses': 0  # is_women_led field doesn't exist on SMEProfile
            }
            
            # Recent matches
            from apps.matching.models import Match
            recent_matches = Match.objects.filter(
                investor=profile,
                status='pending'
            ).select_related('sme').order_by('-match_score')[:5]
            
            dashboard_data = {
                'profile': InvestorProfileSerializer(profile).data,
                'portfolio': {
                    'total_invested': float(total_invested),
                    'active_investments': active_investments,
                    'total_returns': float(total_returns),
                    'roi_percentage': round(float(roi), 2)
                },
                'impact_metrics': impact_metrics,
                'recent_matches': [
                    {
                        'id': str(match.id),
                        'sme_name': match.sme.business_name,
                        'industry': match.sme.industry,
                        'match_score': float(match.match_score),
                        'funding_needed': float(match.sme.funding_needed)
                    }
                    for match in recent_matches
                ]
            }
            
            cache.set(cache_key, dashboard_data, timeout=300)
        
        return Response(dashboard_data)


class InvestmentListView(generics.ListCreateAPIView):
    """List and create investments"""
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InvestmentCreateSerializer
        return InvestmentSerializer
    
    def get_queryset(self):
        profile = InvestorProfile.objects.get(user=self.request.user)
        return Investment.objects.filter(investor=profile).order_by('-investment_date')
    
    def perform_create(self, serializer):
        profile = InvestorProfile.objects.get(user=self.request.user)
        investment = serializer.save(investor=profile)
        
        # Update investor portfolio value
        profile.portfolio_value += investment.amount
        profile.total_invested += investment.amount
        profile.active_investments += 1
        profile.save()
        
        # Update SME (add to investment count)
        from sme.models import SMEProfile
        sme = investment.sme
        sme.investment_count = (sme.investment_count or 0) + 1
        sme.save()
        
        # Clear caches
        cache.delete(f"investor_dashboard_{profile.id}")
        cache.delete(f"sme_profile_{sme.id}")


class InvestmentDetailView(generics.RetrieveUpdateAPIView):
    """Get, update or delete investment"""
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get_queryset(self):
        profile = InvestorProfile.objects.get(user=self.request.user)
        return Investment.objects.filter(investor=profile)


class ImpactMetricsView(generics.GenericAPIView):
    """Get ESG impact metrics"""
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get(self, request):
        profile = InvestorProfile.objects.get(user=request.user)
        
        # Calculate ESG score
        investments = Investment.objects.filter(investor=profile, status='completed')
        
        # Environmental score
        environmental_score = min(100, int(float(profile.co2_reduced) / 100))
        
        # Social score
        social_score = min(100, (profile.jobs_created * 2) + (profile.smes_supported * 5))
        
        # Governance score
        governance_score = 85  # Placeholder based on compliance
        
        overall_esg = (environmental_score + social_score + governance_score) / 3
        
        metrics = {
            'overall_score': round(overall_esg, 1),
            'environmental': {
                'score': environmental_score,
                'co2_reduced': float(profile.co2_reduced),
                'renewable_investments': investments.filter(sme__industry='Renewable Energy').count()
            },
            'social': {
                'score': social_score,
                'jobs_created': profile.jobs_created,
                'smes_supported': profile.smes_supported,
                'women_led': investments.filter(sme__is_women_led=True).count()
            },
            'governance': {
                'score': governance_score,
                'verified_investments': investments.filter(verification_status='verified').count()
            }
        }
        
        return Response(metrics)