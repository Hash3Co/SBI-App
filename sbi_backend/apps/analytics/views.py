from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from django.utils import timezone
from django.db import models
from datetime import timedelta, datetime

from .models import PlatformMetric, UserActivity, ImpactMetric, Report
from .serializers import (
    PlatformMetricSerializer, UserActivitySerializer,
    ImpactMetricSerializer, ReportSerializer, ReportGenerateSerializer
)
from .metrics import calculate_impact_summary, generate_report
from apps.accounts.permissions import IsSME, IsInvestor, IsAdmin


class SMEAnalyticsView(APIView):
    """Get analytics for SME user"""
    permission_classes = [permissions.IsAuthenticated, IsSME]
    
    def get(self, request):
        cache_key = f"sme_analytics_{request.user.id}"
        data = cache.get(cache_key)
        
        if not data:
            from apps.sme.models import SMEProfile
            from apps.matching.models import Match
            from apps.training.models import Enrollment
            
            sme_profile = SMEProfile.objects.get(user=request.user)
            
            # Profile views (from activity logs)
            profile_views = UserActivity.objects.filter(
                activity_type='profile_view',
                details__sme_id=str(sme_profile.id),
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count()
            
            # Match statistics
            matches = Match.objects.filter(sme=sme_profile)
            total_matches = matches.count()
            accepted_matches = matches.filter(status='accepted').count()
            
            # Message statistics
            total_messages = matches.aggregate(total=models.Sum('messages_count'))['total'] or 0
            
            # Course progress
            enrollments = Enrollment.objects.filter(user=request.user)
            avg_progress = enrollments.aggregate(avg=models.Avg('progress_percentage'))['avg'] or 0
            completed_courses = enrollments.filter(completed_at__isnull=False).count()
            
            data = {
                'profile_views': profile_views,
                'total_matches': total_matches,
                'accepted_matches': accepted_matches,
                'conversion_rate': round((accepted_matches / total_matches * 100), 1) if total_matches > 0 else 0,
                'total_messages': total_messages,
                'avg_course_progress': round(avg_progress, 1),
                'completed_courses': completed_courses,
                'readiness_score': sme_profile.readiness_score,
            }
            
            cache.set(cache_key, data, timeout=300)
        
        return Response(data)


class InvestorAnalyticsView(APIView):
    """Get analytics for investor user"""
    permission_classes = [permissions.IsAuthenticated, IsInvestor]
    
    def get(self, request):
        cache_key = f"investor_analytics_{request.user.id}"
        data = cache.get(cache_key)
        
        if not data:
            from apps.investor.models import InvestorProfile, Investment
            from apps.matching.models import Match
            
            investor_profile = InvestorProfile.objects.get(user=request.user)
            
            # Investment statistics
            investments = Investment.objects.filter(investor=investor_profile, status='completed')
            total_invested = investments.aggregate(total=models.Sum('amount'))['total'] or 0
            total_investments = investments.count()
            
            # ROI calculation
            current_value = investments.aggregate(total=models.Sum('current_value'))['total'] or 0
            roi = ((current_value - total_invested) / total_invested * 100) if total_invested > 0 else 0
            
            # Match statistics
            matches = Match.objects.filter(investor=investor_profile)
            total_matches = matches.count()
            accepted_matches = matches.filter(status='accepted').count()
            
            data = {
                'total_invested': float(total_invested),
                'total_investments': total_investments,
                'average_investment': float(total_invested / total_investments) if total_investments > 0 else 0,
                'current_portfolio_value': float(current_value),
                'roi_percentage': round(float(roi), 2),
                'total_matches': total_matches,
                'accepted_matches': accepted_matches,
                'conversion_rate': round((accepted_matches / total_matches * 100), 1) if total_matches > 0 else 0,
            }
            
            cache.set(cache_key, data, timeout=300)
        
        return Response(data)


class PlatformAnalyticsView(APIView):
    """Get platform-wide analytics (Admin only)"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        cache_key = "platform_analytics"
        data = cache.get(cache_key)
        
        if not data:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # User statistics
            total_users = User.objects.count()
            total_smes = User.objects.filter(role='sme').count()
            total_investors = User.objects.filter(role='investor').count()
            active_users = User.objects.filter(last_login__gte=timezone.now() - timedelta(days=30)).count()
            
            # SME statistics
            from sme.models import SMEProfile
            verified_smes = SMEProfile.objects.filter(verification_status='verified').count()
            avg_readiness = SMEProfile.objects.aggregate(avg=models.Avg('readiness_score'))['avg'] or 0
            
            # Investment statistics
            from investor.models import Investment
            total_investments = Investment.objects.filter(status='completed').aggregate(total=models.Sum('amount'))['total'] or 0
            total_deals = Investment.objects.filter(status='completed').count()
            
            # Match statistics
            from matching.models import Match
            total_matches = Match.objects.count()
            successful_matches = Match.objects.filter(status='connected').count()
            
            # Training statistics
            from training.models import Enrollment
            total_enrollments = Enrollment.objects.count()
            completed_courses = Enrollment.objects.filter(completed_at__isnull=False).count()
            
            # Growth metrics
            last_month = timezone.now() - timedelta(days=30)
            new_users_last_month = User.objects.filter(created_at__gte=last_month).count()
            
            data = {
                'users': {
                    'total': total_users,
                    'smes': total_smes,
                    'investors': total_investors,
                    'active_30d': active_users,
                    'new_last_month': new_users_last_month,
                    'growth_rate': round((new_users_last_month / total_users * 100), 1) if total_users > 0 else 0
                },
                'smes': {
                    'total': total_smes,
                    'verified': verified_smes,
                    'verification_rate': round((verified_smes / total_smes * 100), 1) if total_smes > 0 else 0,
                    'avg_readiness_score': round(avg_readiness, 1)
                },
                'investments': {
                    'total_amount': float(total_investments),
                    'total_deals': total_deals,
                    'average_deal_size': float(total_investments / total_deals) if total_deals > 0 else 0
                },
                'matches': {
                    'total': total_matches,
                    'successful': successful_matches,
                    'success_rate': round((successful_matches / total_matches * 100), 1) if total_matches > 0 else 0
                },
                'training': {
                    'total_enrollments': total_enrollments,
                    'completed_courses': completed_courses,
                    'completion_rate': round((completed_courses / total_enrollments * 100), 1) if total_enrollments > 0 else 0
                }
            }
            
            cache.set(cache_key, data, timeout=600)
        
        return Response(data)


class ImpactMetricsSummaryView(APIView):
    """Get overall impact metrics summary"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        cache_key = "impact_metrics_summary"
        data = cache.get(cache_key)
        
        if not data:
            data = calculate_impact_summary()
            cache.set(cache_key, data, timeout=3600)
        
        return Response(data)


class ReportGenerateView(APIView):
    """Generate analytics report"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def post(self, request):
        serializer = ReportGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        report_type = serializer.validated_data['report_type']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        
        # Generate report data
        report_data = generate_report(report_type, start_date, end_date)
        
        # Create report record
        report = Report.objects.create(
            report_type=report_type,
            title=f"{report_type.capitalize()} Report - {start_date} to {end_date}",
            data=report_data,
            generated_by=request.user,
            period_start=start_date,
            period_end=end_date
        )
        
        return Response({
            'report_id': str(report.id),
            'data': report_data
        }, status=status.HTTP_201_CREATED)


class ReportDownloadView(APIView):
    """Download generated report"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=404)
        
        return Response(report.data)