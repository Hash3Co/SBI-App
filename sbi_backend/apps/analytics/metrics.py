from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from apps.sme.models import SMEProfile
from apps.investor.models import InvestorProfile, Investment
from apps.matching.models import Match
from apps.training.models import Enrollment
from apps.payments.models import Transaction
from .models import PlatformMetric, ImpactMetric

User = get_user_model()

def calculate_platform_metrics(metric_type, date):
    """Calculate specific platform metric for a date"""
    from datetime import datetime
    
    if metric_type == 'users':
        return User.objects.filter(created_at__date=date).count()
    
    elif metric_type == 'smes':
        return User.objects.filter(role='sme', created_at__date=date).count()
    
    elif metric_type == 'investors':
        return User.objects.filter(role='investor', created_at__date=date).count()
    
    elif metric_type == 'matches':
        return Match.objects.filter(created_at__date=date).count()
    
    elif metric_type == 'investments':
        total = Investment.objects.filter(
            status='completed',
            investment_date__date=date
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)
    
    elif metric_type == 'courses':
        return Enrollment.objects.filter(enrolled_at__date=date).count()
    
    elif metric_type == 'revenue':
        total = Transaction.objects.filter(
            status='completed',
            created_at__date=date
        ).aggregate(total=Sum('amount'))['total'] or 0
        return float(total)
    
    return 0


def update_daily_metrics():
    """Update all platform metrics for today"""
    from datetime import date
    
    today = date.today()
    metric_types = ['users', 'smes', 'investors', 'matches', 'investments', 'courses', 'revenue']
    
    for metric_type in metric_types:
        value = calculate_platform_metrics(metric_type, today)
        PlatformMetric.objects.update_or_create(
            metric_type=metric_type,
            date=today,
            defaults={'value': value}
        )


def calculate_impact_summary():
    """Calculate overall impact summary"""
    # Economic Impact
    total_investments = Investment.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0
    total_deals = Investment.objects.filter(status='completed').count()
    avg_deal_size = float(total_investments / total_deals) if total_deals > 0 else 0
    
    # Social Impact
    jobs_created = Investment.objects.filter(status='completed').aggregate(total=Sum('sme__employee_count_int'))['total'] or 0
    women_led = SMEProfile.objects.filter(is_women_led=True).count()
    
    # Environmental Impact
    co2_reduced = Investment.objects.filter(
        status='completed',
        sme__industry__in=['Renewable Energy', 'Clean Technology', 'Sustainable Agriculture']
    ).count() * 100  # Estimated 100 tons per green investment
    
    return {
        'economic': {
            'total_investments': float(total_investments),
            'total_deals': total_deals,
            'average_deal_size': round(avg_deal_size, 2),
            'active_investors': InvestorProfile.objects.filter(active_investments__gt=0).count()
        },
        'social': {
            'jobs_created': jobs_created,
            'women_led_businesses': women_led,
            'smes_supported': SMEProfile.objects.filter(investment_count__gt=0).count()
        },
        'environmental': {
            'co2_reduced_tons': co2_reduced,
            'green_investments': Investment.objects.filter(
                sme__industry__in=['Renewable Energy', 'Clean Technology']
            ).count()
        }
    }


def generate_report(report_type, start_date, end_date):
    """Generate analytics report"""
    from datetime import datetime
    
    # User metrics
    total_users = User.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).count()
    new_smes = User.objects.filter(role='sme', created_at__date__gte=start_date, created_at__date__lte=end_date).count()
    new_investors = User.objects.filter(role='investor', created_at__date__gte=start_date, created_at__date__lte=end_date).count()
    
    # Engagement metrics
    total_matches = Match.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).count()
    accepted_matches = Match.objects.filter(
        status='accepted',
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    ).count()
    
    # Financial metrics
    total_investments = Investment.objects.filter(
        status='completed',
        investment_date__date__gte=start_date,
        investment_date__date__lte=end_date
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Training metrics
    course_enrollments = Enrollment.objects.filter(
        enrolled_at__date__gte=start_date,
        enrolled_at__date__lte=end_date
    ).count()
    courses_completed = Enrollment.objects.filter(
        completed_at__date__gte=start_date,
        completed_at__date__lte=end_date
    ).count()
    
    report_data = {
        'report_type': report_type,
        'period': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
            'days': (end_date - start_date).days
        },
        'generated_at': datetime.now().isoformat(),
        'users': {
            'total_new': total_users,
            'new_smes': new_smes,
            'new_investors': new_investors,
            'growth_rate': round((new_smes + new_investors) / max(total_users, 1) * 100, 2)
        },
        'engagement': {
            'total_matches': total_matches,
            'accepted_matches': accepted_matches,
            'acceptance_rate': round(accepted_matches / max(total_matches, 1) * 100, 2),
            'active_users': User.objects.filter(last_login__date__gte=start_date).count()
        },
        'financial': {
            'total_investments': float(total_investments),
            'average_investment': float(total_investments / max(total_matches, 1)) if total_matches > 0 else 0
        },
        'training': {
            'total_enrollments': course_enrollments,
            'completions': courses_completed,
            'completion_rate': round(courses_completed / max(course_enrollments, 1) * 100, 2)
        }
    }
    
    return report_data